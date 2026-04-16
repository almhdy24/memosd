<?php namespace App\Controllers;

use App\Models\FollowModel;
use App\Models\BlockModel;

class FollowController extends BaseApiController
{
    public function follow($id = null)
    {
        $followerId = $this->getUserId();
        if ($followerId == $id) {
            return $this->errorResponse('Cannot follow yourself', [], 400);
        }

        $blockModel = new BlockModel();
        if ($blockModel->isBlockedEither($followerId, $id)) {
            return $this->errorResponse('Cannot follow this user', [], 403);
        }

        $model = new FollowModel();
        if ($model->follow($followerId, $id)) {
            return $this->successResponse(null, 'Followed');
        }
        return $this->errorResponse('Failed to follow', [], 500);
    }

    public function unfollow($id = null)
    {
        $followerId = $this->getUserId();
        $model = new FollowModel();
        if ($model->unfollow($followerId, $id)) {
            return $this->successResponse(null, 'Unfollowed');
        }
        return $this->errorResponse('Failed to unfollow', [], 500);
    }
}
