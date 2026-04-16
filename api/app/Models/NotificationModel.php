<?php namespace App\Models;

use CodeIgniter\Model;

class NotificationModel extends Model
{
    protected $table            = 'notifications';
    protected $primaryKey       = 'id';
    protected $returnType       = 'array';
    protected $useSoftDeletes   = false;
    protected $allowedFields    = ['user_id', 'type', 'actor_id', 'note_id', 'comment_id', 'read'];
    protected $useTimestamps    = true;
    protected $createdField     = 'created_at';
    protected $updatedField     = '';

    public function create(int $recipientId, string $type, int $actorId, ?int $noteId = null, ?int $commentId = null): void
    {
        if ($recipientId == $actorId) return;
        
        $this->insert([
            'user_id'    => $recipientId,
            'type'       => $type,
            'actor_id'   => $actorId,
            'note_id'    => $noteId,
            'comment_id' => $commentId,
            'read'       => 0
        ]);
    }

    public function getUnreadCount(int $userId): int
    {
        return $this->where('user_id', $userId)->where('read', 0)->countAllResults();
    }

    public function getUserNotifications(int $userId, int $limit = 50): array
    {
        return $this->select('notifications.*, users.name as actor_name, users.avatar as actor_avatar')
                    ->join('users', 'users.id = notifications.actor_id')
                    ->where('notifications.user_id', $userId)
                    ->orderBy('created_at', 'DESC')
                    ->limit($limit)
                    ->findAll();
    }

    public function markAsRead(int $userId, int $notificationId): void
    {
        $this->where(['id' => $notificationId, 'user_id' => $userId])->set('read', 1)->update();
    }

    public function markAllAsRead(int $userId): void
    {
        $this->where('user_id', $userId)->set('read', 1)->update();
    }
}
