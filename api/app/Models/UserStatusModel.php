<?php namespace App\Models;

use CodeIgniter\Model;

class UserStatusModel extends Model
{
    protected $table = 'user_status';
    protected $primaryKey = 'user_id';
    protected $allowedFields = ['user_id', 'is_online', 'last_seen'];
    protected $useTimestamps = true;
    protected $updatedField = 'updated_at';

    private $cachePath = WRITEPATH . 'cache/online_status/';

    public function setOnline(int $userId): void
    {
        // Use file cache to avoid SQLite locks in multi-process environment
        if (!is_dir($this->cachePath)) {
            mkdir($this->cachePath, 0755, true);
        }
        file_put_contents($this->cachePath . $userId, time());
        
        // Also update database occasionally (via cron or on shutdown) – skip for now to avoid locks
    }

    public function setOffline(int $userId): void
    {
        @unlink($this->cachePath . $userId);
    }

    public function getStatus(int $userId): ?array
    {
        $file = $this->cachePath . $userId;
        if (file_exists($file)) {
            return [
                'is_online' => true,
                'last_seen' => date('Y-m-d H:i:s', filemtime($file))
            ];
        }
        return ['is_online' => false, 'last_seen' => null];
    }
}
