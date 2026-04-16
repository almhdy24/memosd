<?php namespace App\Controllers;

use App\Models\UserModel;
use App\Models\NoteModel;
use App\Models\LikeModel;
use App\Models\CommentModel;

class SearchController extends BaseApiController
{
    public function index()
    {
        $userId = $this->getUserId();
        $query = $this->request->getGet('q');
        $limit = (int) ($this->request->getGet('limit') ?? 20);

        if (empty($query)) {
            return $this->successResponse(['users' => [], 'notes' => []]);
        }

        // Search users (by name or email)
        $userModel = new UserModel();
        $users = $userModel->select('id, name, email, avatar, bio')
                           ->groupStart()
                               ->like('name', $query)
                               ->orLike('email', $query)
                           ->groupEnd()
                           ->where('id !=', $userId)
                           ->limit($limit)
                           ->findAll();

        // Search notes (public + user's own)
        $noteModel = new NoteModel();
        $notes = $noteModel->select('notes.*, users.name as author_name, users.avatar as author_avatar')
                           ->join('users', 'users.id = notes.user_id')
                           ->groupStart()
                               ->where('notes.user_id', $userId)
                               ->orWhere('notes.is_public', 1)
                           ->groupEnd()
                           ->groupStart()
                               ->like('notes.title', $query)
                               ->orLike('notes.content', $query)
                           ->groupEnd()
                           ->orderBy('notes.updated_at', 'DESC')
                           ->limit($limit)
                           ->findAll();

        $likeModel = new LikeModel();
        $commentModel = new CommentModel();
        foreach ($notes as &$note) {
            $note['like_count'] = $likeModel->getLikeCount($note['id']);
            $note['comment_count'] = $commentModel->where('note_id', $note['id'])->countAllResults();
            $note['liked_by_user'] = $likeModel->hasLiked($note['id'], $userId);
        }

        return $this->successResponse([
            'users' => $users,
            'notes' => $notes
        ]);
    }
}
