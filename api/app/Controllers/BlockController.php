<?php namespace App\Controllers;

use App\Models\BlockModel;

class BlockController extends BaseApiController
{
    public function block($id = null)
    {
        $blockerId = $this->getUserId();
        if ($blockerId == $id) {
            return $this->errorResponse('Cannot block yourself', [], 400);
        }

        $model = new BlockModel();
        if ($model->block($blockerId, $id)) {
            return $this->successResponse(null, 'User blocked');
        }
        return $this->errorResponse('Cannot block this user yet (cooldown active)', [], 400);
    }

    public function unblock($id = null)
    {
        $blockerId = $this->getUserId();
        $model = new BlockModel();
        if ($model->unblock($blockerId, $id)) {
            return $this->successResponse(null, 'User unblocked. You can block again after 72 hours.');
        }
        return $this->errorResponse('Failed to unblock user', [], 500);
    }

    public function index()
    {
        $userId = $this->getUserId();
        $model = new BlockModel();
        $blockedIds = $model->getBlockedUserIds($userId);
        
        if (empty($blockedIds)) {
            return $this->successResponse([]);
        }
        
        $userModel = new \App\Models\UserModel();
        $users = $userModel->select('id, name, email, bio, avatar')
                          ->whereIn('id', $blockedIds)
                          ->findAll();
                          
        return $this->successResponse($users);
    }
}
