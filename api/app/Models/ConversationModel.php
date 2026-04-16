<?php namespace App\Models;

use CodeIgniter\Model;

class ConversationModel extends Model
{
    protected $table = 'conversations';
    protected $primaryKey = 'id';
    protected $allowedFields = ['user_one', 'user_two'];
    protected $useTimestamps = true;

    public function getOrCreate(int $userA, int $userB): int
    {
        $u1 = min($userA, $userB);
        $u2 = max($userA, $userB);
        
        $conv = $this->where('user_one', $u1)->where('user_two', $u2)->first();
        if ($conv) {
            return $conv['id'];
        }
        
        $this->insert(['user_one' => $u1, 'user_two' => $u2]);
        return $this->getInsertID();
    }

    public function getUserConversations(int $userId): array
    {
        return $this->select('conversations.*, u1.name as user_one_name, u1.avatar as user_one_avatar, u2.name as user_two_name, u2.avatar as user_two_avatar')
                    ->join('users u1', 'u1.id = conversations.user_one')
                    ->join('users u2', 'u2.id = conversations.user_two')
                    ->where('user_one', $userId)
                    ->orWhere('user_two', $userId)
                    ->orderBy('updated_at', 'DESC')
                    ->findAll();
    }
}
