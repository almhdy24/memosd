<?php namespace App\Models;

use CodeIgniter\Model;

class LikeModel extends Model
{
    protected $table            = 'likes';
    protected $primaryKey       = ['note_id', 'user_id'];
    protected $returnType       = 'array';
    protected $useSoftDeletes   = false;
    protected $allowedFields    = ['note_id', 'user_id'];
    protected $useTimestamps    = true;
    protected $createdField     = 'created_at';
    protected $updatedField     = '';

    public function toggleLike(int $noteId, int $userId): bool
    {
        if ($this->hasLiked($noteId, $userId)) {
            $this->where(['note_id' => $noteId, 'user_id' => $userId])->delete();
            return false; // unliked
        }
        $this->insert(['note_id' => $noteId, 'user_id' => $userId]);
        return true; // liked
    }

    public function hasLiked(int $noteId, int $userId): bool
    {
        return $this->where(['note_id' => $noteId, 'user_id' => $userId])->countAllResults() > 0;
    }

    public function getLikeCount(int $noteId): int
    {
        return $this->where('note_id', $noteId)->countAllResults();
    }
}
