<?php namespace App\Controllers;

use App\Models\UserModel;
use App\Models\FollowModel;
use App\Models\BlockModel;

class DiscoverController extends BaseApiController
{
    protected $modelName = 'App\Models\UserModel';

    public function index()
    {
        $userId = $this->getUserId();
        $perPage = (int) ($this->request->getGet('limit') ?? 20);
        $search = $this->request->getGet('search');
        
        $blockModel = new BlockModel();
        $blockedIds = $blockModel->getBlockedUserIds($userId);
        $blockedBy = $blockModel->where('blocked_id', $userId)->findAll();
        $blockedByMe = array_column($blockedBy, 'blocker_id');
        $excludeIds = array_merge($blockedIds, $blockedByMe);
        
        $builder = $this->model
            ->where('id !=', $userId)
            ->where('allow_follow', 1)
            ->whereNotIn('id', $excludeIds);
            
        if (!empty($search)) {
            $builder->groupStart()
                    ->like('name', $search)
                    ->orLike('email', $search)
                    ->groupEnd();
        }
        
        $users = $builder->orderBy('created_at', 'DESC')->paginate($perPage);

        $followModel = new FollowModel();
        foreach ($users as &$user) {
            unset($user['password']);
            $user['is_following'] = $followModel->isFollowing($userId, $user['id']);
        }

        return $this->paginatedResponse($users);
    }
}
