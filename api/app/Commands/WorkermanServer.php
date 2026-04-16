<?php namespace App\Commands;

use CodeIgniter\CLI\BaseCommand;
use CodeIgniter\CLI\CLI;
use Workerman\Worker;
use Workerman\Timer;
use App\Models\UserStatusModel;
use App\Models\MessageModel;
use App\Models\ConversationModel;
use App\Models\UserModel;
use App\Models\NotificationModel;
use App\Models\BlockModel;
use App\Models\ChannelModel;
use App\Models\ChannelMemberModel;
use App\Models\ChannelMessageModel;
use App\Services\MessageLimitService;
use Config\Database;
use Psr\Log\LoggerInterface;

class WorkermanServer extends BaseCommand
{
    protected $group       = 'WebSocket';
    protected $name        = 'workerman:serve';
    protected $description = 'Start Workerman WebSocket server for real-time features.';

    protected $connections = [];      // userId => connection
    protected $channelConnections = []; // channelId => [userId => connection]
    protected $logger;
    protected $db;

    public function run(array $params)
    {
        $this->logger = service('logger');
        $this->db     = Database::connect();

        $ws_worker = new Worker("websocket://0.0.0.0:8082");
        $ws_worker->count = 1;
        $ws_worker->name = 'MemoSD WebSocket';

        $ws_worker->onWorkerStart = function($worker) {
            // Heartbeat every 30 seconds to clean dead connections
            Timer::add(30, function() use ($worker) {
                foreach ($worker->connections as $connection) {
                    if (time() - ($connection->lastHeartbeat ?? time()) > 60) {
                        $connection->close();
                    }
                }
            });
        };

        $ws_worker->onConnect = function($connection) {
            $connection->lastHeartbeat = time();
            $this->logger->info("New connection: {$connection->id}");
        };

        $ws_worker->onMessage = function($connection, $data) {
            $connection->lastHeartbeat = time();
            $msg = json_decode($data, true);
            if (!$msg) return;

            $type = $msg['type'] ?? '';

            switch ($type) {
                case 'ping':
                    $connection->send(json_encode(['type' => 'pong']));
                    break;

                case 'auth':
                    $this->handleAuth($connection, $msg);
                    break;

                case 'typing':
                    $this->handleTyping($connection, $msg);
                    break;

                case 'message':
                    $this->handleDirectMessage($connection, $msg);
                    break;

                case 'channel_message':
                    $this->handleChannelMessage($connection, $msg);
                    break;

                case 'join_channel':
                    $this->handleJoinChannel($connection, $msg);
                    break;

                case 'leave_channel':
                    $this->handleLeaveChannel($connection, $msg);
                    break;

                case 'mark_read':
                    $this->handleMarkRead($connection, $msg);
                    break;

                default:
                    $this->logger->warning("Unknown message type: {$type}");
            }
        };

        $ws_worker->onClose = function($connection) {
            $this->handleDisconnect($connection);
        };

        $ws_worker->onError = function($connection, $code, $msg) {
            $this->logger->error("WebSocket error: {$code} - {$msg}");
        };

        CLI::write('Workerman WebSocket server started on ws://0.0.0.0:8082', 'green');
        Worker::runAll();
    }

    // --------------------------------------------------------------------
    // Authentication
    // --------------------------------------------------------------------
    private function handleAuth($connection, $msg)
    {
        $userId = $msg['userId'] ?? null;
        if (!$userId) return;

        $connection->userId = $userId;
        $this->connections[$userId] = $connection;

        $statusModel = new UserStatusModel();
        $statusModel->setOnline($userId);
        $this->broadcastUserStatus($userId, true);
        $this->logger->info("User {$userId} authenticated via WebSocket");
    }

    // --------------------------------------------------------------------
    // Direct Messages
    // --------------------------------------------------------------------
    private function handleDirectMessage($connection, $msg)
    {
        $recipientId = $msg['recipientId'] ?? null;
        $content = trim($msg['content'] ?? '');
        if (!$recipientId || !$content || !isset($connection->userId)) return;

        $senderId = $connection->userId;

        $blockModel = new BlockModel();
        if ($blockModel->isBlockedEither($senderId, $recipientId)) {
            $connection->send(json_encode(['type' => 'error', 'message' => 'Cannot send message (blocked)']));
            return;
        }

        $limitService = new MessageLimitService();
        if (!$limitService->canSendMessage($senderId)) {
            $connection->send(json_encode(['type' => 'error', 'message' => 'Daily message limit reached or account too new']));
            return;
        }

        $convModel = new ConversationModel();
        $convId = $convModel->getOrCreate($senderId, $recipientId);

        $msgModel = new MessageModel();
        $msgId = $msgModel->insert([
            'conversation_id' => $convId,
            'sender_id'       => $senderId,
            'content'         => $content,
            'read'            => 0
        ]);

        if (!$msgId) {
            $this->logger->error("Failed to save direct message from {$senderId} to {$recipientId}");
            return;
        }

        $limitService->incrementMessageCount($senderId);

        $userModel = new UserModel();
        $sender = $userModel->find($senderId);

        $messageData = [
            'id'               => $msgId,
            'conversation_id'  => $convId,
            'sender_id'        => $senderId,
            'content'          => $content,
            'created_at'       => date('Y-m-d H:i:s'),
            'sender_name'      => $sender['name'] ?? '',
            'sender_avatar'    => $sender['avatar'] ?? null,
            'read'             => false
        ];

        if (isset($this->connections[$recipientId])) {
            $this->connections[$recipientId]->send(json_encode([
                'type'    => 'message',
                'message' => $messageData
            ]));
        }

        $connection->send(json_encode([
            'type'    => 'message_sent',
            'tempId'  => $msg['tempId'] ?? null,
            'message' => $messageData
        ]));

        $this->db->table('conversations')
                 ->where('id', $convId)
                 ->update(['updated_at' => date('Y-m-d H:i:s')]);
    }

    // --------------------------------------------------------------------
    // Channel Messages
    // --------------------------------------------------------------------
    private function handleChannelMessage($connection, $msg)
    {
        $channelId = $msg['channelId'] ?? null;
        $content = trim($msg['content'] ?? '');
        if (!$channelId || !$content || !isset($connection->userId)) return;

        $userId = $connection->userId;

        $memberModel = new ChannelMemberModel();
        $isMember = $memberModel->where('channel_id', $channelId)
                                ->where('user_id', $userId)
                                ->first();
        if (!$isMember) {
            $connection->send(json_encode(['type' => 'error', 'message' => 'Not a member of this channel']));
            return;
        }

        $msgModel = new ChannelMessageModel();
        $msgId = $msgModel->insert([
            'channel_id' => $channelId,
            'sender_id'  => $userId,
            'content'    => $content
        ]);

        $userModel = new UserModel();
        $sender = $userModel->find($userId);

        $messageData = [
            'id'            => $msgId,
            'channel_id'    => $channelId,
            'sender_id'     => $userId,
            'content'       => $content,
            'created_at'    => date('Y-m-d H:i:s'),
            'sender_name'   => $sender['name'] ?? '',
            'sender_avatar' => $sender['avatar'] ?? null
        ];

        $members = $memberModel->where('channel_id', $channelId)->findAll();
        foreach ($members as $member) {
            if (isset($this->connections[$member['user_id']])) {
                $this->connections[$member['user_id']]->send(json_encode([
                    'type'    => 'channel_message',
                    'message' => $messageData
                ]));
            }
        }
    }

    // --------------------------------------------------------------------
    // Channel Join/Leave
    // --------------------------------------------------------------------
    private function handleJoinChannel($connection, $msg)
    {
        $channelId = $msg['channelId'] ?? null;
        if ($channelId && isset($connection->userId)) {
            if (!isset($this->channelConnections[$channelId])) {
                $this->channelConnections[$channelId] = [];
            }
            $this->channelConnections[$channelId][$connection->userId] = $connection;
        }
    }

    private function handleLeaveChannel($connection, $msg)
    {
        $channelId = $msg['channelId'] ?? null;
        if ($channelId && isset($connection->userId)) {
            unset($this->channelConnections[$channelId][$connection->userId]);
        }
    }

    // --------------------------------------------------------------------
    // Typing Indicator
    // --------------------------------------------------------------------
    private function handleTyping($connection, $msg)
    {
        $recipientId = $msg['recipientId'] ?? null;
        $isTyping = $msg['isTyping'] ?? false;
        if ($recipientId && isset($this->connections[$recipientId]) && isset($connection->userId)) {
            $this->connections[$recipientId]->send(json_encode([
                'type'      => 'typing',
                'userId'    => $connection->userId,
                'isTyping'  => $isTyping
            ]));
        }
    }

    // --------------------------------------------------------------------
    // Mark Messages as Read
    // --------------------------------------------------------------------
    private function handleMarkRead($connection, $msg)
    {
        $conversationId = $msg['conversationId'] ?? null;
        if ($conversationId && isset($connection->userId)) {
            $msgModel = new MessageModel();
            $msgModel->markAsRead($conversationId, $connection->userId);
        }
    }

    // --------------------------------------------------------------------
    // Disconnect & Cleanup
    // --------------------------------------------------------------------
    private function handleDisconnect($connection)
    {
        if (isset($connection->userId)) {
            $userId = $connection->userId;
            unset($this->connections[$userId]);

            $statusModel = new UserStatusModel();
            $statusModel->setOffline($userId);
            $this->broadcastUserStatus($userId, false);

            foreach ($this->channelConnections as $channelId => $connections) {
                unset($this->channelConnections[$channelId][$userId]);
            }

            $this->logger->info("User {$userId} disconnected");
        }
    }

    // --------------------------------------------------------------------
    // Broadcast Online Status
    // --------------------------------------------------------------------
    private function broadcastUserStatus($userId, $isOnline)
    {
        $data = json_encode([
            'type'     => 'user_status',
            'userId'   => $userId,
            'isOnline' => $isOnline,
            'lastSeen' => date('Y-m-d H:i:s')
        ]);
        foreach ($this->connections as $recipientId => $conn) {
            if ($recipientId != $userId) {
                $conn->send($data);
            }
        }
    }
}
