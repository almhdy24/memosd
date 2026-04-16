<?php namespace App\Controllers;

use App\Models\UserModel;
use App\Models\NoteModel;
use App\Models\FollowModel;
use App\Models\BlockModel;
use App\Libraries\JWTService;

class ProfileController extends BaseApiController
{
    public function show($id = null)
    {
        $userModel = new UserModel();
        $user = $userModel->find($id);
        if (!$user) {
            return $this->errorResponse('User not found', [], 404);
        }
        unset($user['password']);

        $authUserId = $this->getUserIdFromToken();
        $blockModel = new BlockModel();
        $isBlocked = false;
        $blockedBy = false;
        if ($authUserId) {
            $isBlocked = $blockModel->isBlocked($authUserId, $id);
            $blockedBy = $blockModel->isBlocked($id, $authUserId);
        }

        $noteModel = new NoteModel();
        $notes = [];
        if (!$isBlocked && !$blockedBy) {
            $notes = $noteModel->getPublicNotesByUser($id, 10);
        }

        $followModel = new FollowModel();
        $user['followers_count'] = $followModel->getFollowersCount($id);
        $user['following_count'] = $followModel->getFollowingCount($id);

        $isFollowing = false;
        $canMessage = false;
        if ($authUserId) {
            $isFollowing = $followModel->isFollowing($authUserId, $id);
            $canMessage = $followModel->isFollowing($id, $authUserId); // Recipient follows current user
        }

        return $this->successResponse([
            'user'         => $user,
            'notes'        => $notes,
            'is_following' => $isFollowing,
            'is_blocked'   => $isBlocked,
            'blocked_by'   => $blockedBy,
            'can_message'  => $canMessage
        ]);
    }

    private function getUserIdFromToken(): ?int
    {
        $authHeader = $this->request->getServer('HTTP_AUTHORIZATION');
        if (!$authHeader) return null;
        $token = str_replace('Bearer ', '', $authHeader);
        $decoded = JWTService::validateToken($token);
        return $decoded ? $decoded->user_id : null;
    }
}
