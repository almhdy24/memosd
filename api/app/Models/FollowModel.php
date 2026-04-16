<?php namespace App\Models;

use CodeIgniter\Model;

class FollowModel extends Model
{
    protected $table            = 'follows';
    protected $primaryKey       = ['follower_id', 'followed_id'];
    protected $returnType       = 'array';
    protected $useSoftDeletes   = false;
    protected $allowedFields    = ['follower_id', 'followed_id'];
    protected $useTimestamps    = true;
    protected $createdField     = 'created_at';
    protected $updatedField     = '';

    /**
     * Follow a user. Returns true if followed (or already following).
     */
    public function follow(int $followerId, int $followedId): bool
    {
        if ($followerId == $followedId) return false;
        
        // Check if already following
        if ($this->isFollowing($followerId, $followedId)) {
            return true; // Already following
        }
        
        $data = ['follower_id' => $followerId, 'followed_id' => $followedId];
        return $this->insert($data, true) ? true : false;
    }

    /**
     * Unfollow a user.
     */
    public function unfollow(int $followerId, int $followedId): bool
    {
        return $this->where(['follower_id' => $followerId, 'followed_id' => $followedId])
                    ->delete() ? true : false;
    }

    /**
     * Check if following.
     */
    public function isFollowing(int $followerId, int $followedId): bool
    {
        return $this->where(['follower_id' => $followerId, 'followed_id' => $followedId])
                    ->countAllResults() > 0;
    }

    /**
     * Get followers count.
     */
    public function getFollowersCount(int $userId): int
    {
        return $this->where('followed_id', $userId)->countAllResults();
    }

    /**
     * Get following count.
     */
    public function getFollowingCount(int $userId): int
    {
        return $this->where('follower_id', $userId)->countAllResults();
    }
}
