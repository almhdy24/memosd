<?php namespace App\Models;

use CodeIgniter\Model;

class BlockModel extends Model
{
    protected $table            = 'blocked_users';
    protected $primaryKey       = ['blocker_id', 'blocked_id'];
    protected $returnType       = 'array';
    protected $useSoftDeletes   = false;
    protected $allowedFields    = ['blocker_id', 'blocked_id', 'blocked_until'];
    protected $useTimestamps    = true;
    protected $createdField     = 'created_at';
    protected $updatedField     = '';

    // Cooldown period after unblock before re-blocking (72 hours)
    const BLOCK_COOLDOWN_HOURS = 72;

    public function block(int $blockerId, int $blockedId): bool
    {
        if ($blockerId == $blockedId) return false;
        
        // Check if currently blocked
        if ($this->isBlocked($blockerId, $blockedId)) return true;
        
        // Check if there's an active cooldown (previously blocked and unblocked within 72h)
        $existing = $this->where('blocker_id', $blockerId)
                         ->where('blocked_id', $blockedId)
                         ->first();
        if ($existing && !empty($existing['blocked_until'])) {
            $cooldownEnd = strtotime($existing['blocked_until']);
            if (time() < $cooldownEnd) {
                return false; // Cannot block yet
            }
            // Cooldown expired, allow re-block (update existing record)
            return $this->update(
                ['blocker_id' => $blockerId, 'blocked_id' => $blockedId],
                ['blocked_until' => null, 'created_at' => date('Y-m-d H:i:s')]
            );
        }
        
        return $this->insert([
            'blocker_id'    => $blockerId,
            'blocked_id'    => $blockedId,
            'blocked_until' => null
        ]) ? true : false;
    }

    public function unblock(int $blockerId, int $blockedId): bool
    {
        // Set cooldown period
        $cooldownUntil = date('Y-m-d H:i:s', strtotime('+' . self::BLOCK_COOLDOWN_HOURS . ' hours'));
        return $this->where(['blocker_id' => $blockerId, 'blocked_id' => $blockedId])
                    ->set('blocked_until', $cooldownUntil)
                    ->update() ? true : false;
    }

    public function isBlocked(int $blockerId, int $blockedId): bool
    {
        $record = $this->where(['blocker_id' => $blockerId, 'blocked_id' => $blockedId])->first();
        if (!$record) return false;
        // If blocked_until is null, it's an active block
        return $record['blocked_until'] === null;
    }

    public function isBlockedEither(int $userA, int $userB): bool
    {
        return $this->groupStart()
                    ->where('blocker_id', $userA)->where('blocked_id', $userB)->where('blocked_until', null)
                    ->groupEnd()
                    ->orGroupStart()
                    ->where('blocker_id', $userB)->where('blocked_id', $userA)->where('blocked_until', null)
                    ->groupEnd()
                    ->countAllResults() > 0;
    }

    public function getBlockedUserIds(int $userId): array
    {
        $rows = $this->select('blocked_id')
                     ->where('blocker_id', $userId)
                     ->where('blocked_until', null)
                     ->findAll();
        return array_column($rows, 'blocked_id');
    }
}
