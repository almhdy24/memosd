<?php namespace App\Controllers;

use App\Models\NoteModel;
use App\Models\LikeModel;
use App\Models\NotificationModel;
use App\Models\BlockModel;

class LikeController extends BaseApiController
{
    public function toggle($noteId = null)
    {
        $userId = $this->getUserId();
        $noteModel = new NoteModel();
        $note = $noteModel->find($noteId);
        if (!$note) {
            return $this->errorResponse('Note not found', [], 404);
        }
        if (!$note['allow_likes']) {
            return $this->errorResponse('Likes disabled for this note', [], 403);
        }

        $blockModel = new BlockModel();
        if ($blockModel->isBlockedEither($userId, $note['user_id'])) {
            return $this->errorResponse('Cannot interact with this note', [], 403);
        }

        $likeModel = new LikeModel();
        $liked = $likeModel->toggleLike($noteId, $userId);
        $likeCount = $likeModel->getLikeCount($noteId);

        if ($liked && $note['user_id'] != $userId) {
            $notifModel = new NotificationModel();
            $notifModel->create($note['user_id'], 'like', $userId, $noteId);
        }

        return $this->successResponse([
            'liked' => $liked,
            'like_count' => $likeCount
        ]);
    }
}
