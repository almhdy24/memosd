<?php namespace App\Controllers;

use App\Models\NoteModel;
use App\Models\CommentModel;
use App\Models\NotificationModel;
use App\Models\UserModel;
use App\Models\BlockModel;

class CommentController extends BaseApiController
{
    public function index($noteId = null)
    {
        $userId = $this->getUserId();
        $noteModel = new NoteModel();
        $note = $noteModel->find($noteId);
        if (!$note) {
            return $this->errorResponse('Note not found', [], 404);
        }
        if (!$note['allow_comments']) {
            return $this->errorResponse('Comments disabled', [], 403);
        }

        $blockModel = new BlockModel();
        if ($blockModel->isBlockedEither($userId, $note['user_id'])) {
            return $this->errorResponse('Cannot view comments', [], 403);
        }

        $commentModel = new CommentModel();
        $comments = $commentModel->where('note_id', $noteId)
                                 ->orderBy('created_at', 'ASC')
                                 ->findAll();
        
        $userModel = new UserModel();
        foreach ($comments as &$c) {
            $user = $userModel->find($c['user_id']);
            $c['user_name'] = $user['name'] ?? 'User';
        }

        return $this->successResponse($comments);
    }

    public function create($noteId = null)
    {
        $userId = $this->getUserId();
        $noteModel = new NoteModel();
        $note = $noteModel->find($noteId);
        if (!$note) {
            return $this->errorResponse('Note not found', [], 404);
        }
        if (!$note['allow_comments']) {
            return $this->errorResponse('Comments disabled', [], 403);
        }

        $blockModel = new BlockModel();
        if ($blockModel->isBlockedEither($userId, $note['user_id'])) {
            return $this->errorResponse('Cannot comment on this note', [], 403);
        }

        $data = $this->request->getJSON(true);
        if (empty($data['content'])) {
            return $this->errorResponse('Comment content required', [], 400);
        }

        $commentModel = new CommentModel();
        $commentId = $commentModel->insert([
            'note_id' => $noteId,
            'user_id' => $userId,
            'content' => $data['content']
        ]);

        if ($note['user_id'] != $userId) {
            $notifModel = new NotificationModel();
            $notifModel->create($note['user_id'], 'comment', $userId, $noteId, $commentId);
        }

        $comment = $commentModel->find($commentId);
        $userModel = new UserModel();
        $user = $userModel->find($userId);
        $comment['user_name'] = $user['name'] ?? 'User';
        
        return $this->successResponse($comment, 'Comment added', 201);
    }

    public function delete($noteId = null, $commentId = null)
    {
        $userId = $this->getUserId();
        $commentModel = new CommentModel();
        $comment = $commentModel->find($commentId);
        if (!$comment || $comment['user_id'] != $userId) {
            return $this->errorResponse('Comment not found or access denied', [], 403);
        }
        $commentModel->delete($commentId);
        return $this->successResponse(null, 'Comment deleted');
    }
}
