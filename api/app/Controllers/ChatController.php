<?php namespace App\Controllers;

use App\Models\ConversationModel;
use App\Models\MessageModel;
use App\Models\UserModel;
use App\Models\BlockModel;
use App\Models\FollowModel;

class ChatController extends BaseApiController
{
    public function conversations()
    {
        $userId = $this->getUserId();
        $convModel = new ConversationModel();
        $convs = $convModel->getUserConversations($userId);
        
        $messageModel = new MessageModel();
        foreach ($convs as &$conv) {
            $otherId = ($conv['user_one'] == $userId) ? $conv['user_two'] : $conv['user_one'];
            $conv['other_user'] = [
                'id' => $otherId,
                'name' => ($conv['user_one'] == $userId) ? $conv['user_two_name'] : $conv['user_one_name'],
                'avatar' => ($conv['user_one'] == $userId) ? $conv['user_two_avatar'] : $conv['user_one_avatar']
            ];
            $conv['unread_count'] = $messageModel->where('conversation_id', $conv['id'])
                                                 ->where('sender_id !=', $userId)
                                                 ->where('read', 0)
                                                 ->countAllResults();
            $lastMsg = $messageModel->where('conversation_id', $conv['id'])->orderBy('created_at', 'DESC')->first();
            $conv['last_message'] = $lastMsg;
        }
        
        return $this->successResponse($convs);
    }

    public function messages($conversationId = null)
    {
        $userId = $this->getUserId();
        $convModel = new ConversationModel();
        $conv = $convModel->find($conversationId);
        if (!$conv || ($conv['user_one'] != $userId && $conv['user_two'] != $userId)) {
            return $this->errorResponse('Conversation not found', [], 404);
        }
        
        $messageModel = new MessageModel();
        $messages = $messageModel->getMessages($conversationId);
        $messageModel->markAsRead($conversationId, $userId);
        
        $otherId = ($conv['user_one'] == $userId) ? $conv['user_two'] : $conv['user_one'];
        $userModel = new UserModel();
        $otherUser = $userModel->find($otherId);
        unset($otherUser['password']);
        
        return $this->successResponse([
            'messages' => $messages,
            'other_user' => $otherUser
        ]);
    }

    public function send($userId = null)
    {
        $recipientId = $userId;
        if (!$recipientId) {
            $data = $this->request->getJSON(true);
            $recipientId = $data['recipient_id'] ?? $data['user_id'] ?? null;
        }
        if (!$recipientId || !is_numeric($recipientId)) {
            return $this->errorResponse('Recipient ID required', [], 400);
        }
        $recipientId = (int) $recipientId;

        $senderId = $this->getUserId();
        $data = $this->request->getJSON(true);
        
        if (empty($data['content'])) {
            return $this->errorResponse('Message content required', [], 400);
        }
        
        $blockModel = new BlockModel();
        if ($blockModel->isBlockedEither($senderId, $recipientId)) {
            return $this->errorResponse('Cannot send message', [], 403);
        }

        // 🔒 Mutual follow check
        $followModel = new FollowModel();
        $recipientFollowsSender = $followModel->isFollowing($recipientId, $senderId);
        if (!$recipientFollowsSender) {
            return $this->errorResponse('This user does not follow you. You can only message mutual followers.', [], 403);
        }
        
        $convModel = new ConversationModel();
        $conversationId = $convModel->getOrCreate($senderId, $recipientId);
        
        $messageModel = new MessageModel();
        $messageId = $messageModel->insert([
            'conversation_id' => $conversationId,
            'sender_id' => $senderId,
            'content' => $data['content'],
            'read' => 0
        ]);
        
        if (!$messageId) {
            return $this->errorResponse('Failed to send message', [], 500);
        }
        
        $db = \Config\Database::connect();
        $db->table('conversations')
           ->where('id', $conversationId)
           ->update(['updated_at' => date('Y-m-d H:i:s')]);
        
        $message = $messageModel->select('messages.*, users.name as sender_name, users.avatar as sender_avatar')
                                ->join('users', 'users.id = messages.sender_id')
                                ->find($messageId);
        
        return $this->successResponse($message, 'Message sent', 201);
    }

    public function unreadCount()
    {
        $userId = $this->getUserId();
        $messageModel = new MessageModel();
        $count = $messageModel->getUnreadCount($userId);
        return $this->successResponse(['count' => $count]);
    }

    public function typing($userId = null)
    {
        $senderId = $this->getUserId();
        if (!$userId) return $this->errorResponse('User ID required', [], 400);
        return $this->successResponse(['typing' => true]);
    }

    public function markConversationRead($conversationId = null)
    {
        $userId = $this->getUserId();
        $messageModel = new MessageModel();
        $messageModel->markAsRead($conversationId, $userId);
        return $this->successResponse(null, 'Marked read');
    }
}
