<?php namespace App\Models;

use CodeIgniter\Model;

class MessageModel extends Model
{
    protected $table = 'messages';
    protected $primaryKey = 'id';
    protected $allowedFields = ['conversation_id', 'sender_id', 'content', 'read'];
    protected $useTimestamps = true;
    protected $createdField = 'created_at';
    protected $updatedField = '';

    public function getMessages(int $conversationId, int $limit = 50): array
    {
        return $this->select('messages.*, users.name as sender_name, users.avatar as sender_avatar')
                    ->join('users', 'users.id = messages.sender_id')
                    ->where('conversation_id', $conversationId)
                    ->orderBy('created_at', 'ASC')
                    ->limit($limit)
                    ->findAll();
    }

    public function markAsRead(int $conversationId, int $userId): void
    {
        $this->where('conversation_id', $conversationId)
             ->where('sender_id !=', $userId)
             ->where('read', 0)
             ->set('read', 1)
             ->update();
    }

    public function getUnreadCount(int $userId): int
    {
        $db = \Config\Database::connect();
        $subQuery = $db->table('conversations')
                       ->select('id')
                       ->where('user_one', $userId)
                       ->orWhere('user_two', $userId)
                       ->getCompiledSelect();
        return $this->where("conversation_id IN ($subQuery)", null, false)
                    ->where('sender_id !=', $userId)
                    ->where('read', 0)
                    ->countAllResults();
    }
}
