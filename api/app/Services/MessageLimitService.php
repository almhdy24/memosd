<?php namespace App\Services;

use App\Models\UserModel;
use CodeIgniter\Database\BaseConnection;

class MessageLimitService
{
    protected BaseConnection $db;
    protected int $dailyLimit = 10;
    protected int $newAccountDays = 7;

    public function __construct()
    {
        $this->db = \Config\Database::connect();
    }

    public function canSendMessage(int $userId): bool
    {
        $userModel = new UserModel();
        $user = $userModel->find($userId);
        if (!$user) return false;

        // Check account age
        $createdAt = strtotime($user['created_at']);
        if (time() - $createdAt < $this->newAccountDays * 86400) {
            return false; // Account too new
        }

        // Check daily limit
        $today = date('Y-m-d');
        $count = $this->db->table('user_message_limits')
                          ->where('user_id', $userId)
                          ->where('date', $today)
                          ->get()
                          ->getRow();
        
        $currentCount = $count ? $count->message_count : 0;
        return $currentCount < $this->dailyLimit;
    }

    public function incrementMessageCount(int $userId): void
    {
        $today = date('Y-m-d');
        $this->db->table('user_message_limits')
                 ->set('message_count', 'message_count + 1', false)
                 ->where('user_id', $userId)
                 ->where('date', $today)
                 ->update();
        
        if ($this->db->affectedRows() === 0) {
            $this->db->table('user_message_limits')->insert([
                'user_id'       => $userId,
                'date'          => $today,
                'message_count' => 1
            ]);
        }
    }
}
