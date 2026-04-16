<?php namespace App\Services;

use App\Models\NoteModel;
use App\Models\TagModel;
use App\Models\LikeModel;
use App\Models\CommentModel;
use App\Models\BlockModel;
use CodeIgniter\Database\BaseConnection;

class NoteService
{
    protected NoteModel $noteModel;
    protected TagModel $tagModel;
    protected LikeModel $likeModel;
    protected CommentModel $commentModel;
    protected BlockModel $blockModel;
    protected BaseConnection $db;

    public function __construct()
    {
        $this->noteModel    = model(NoteModel::class);
        $this->tagModel     = model(TagModel::class);
        $this->likeModel    = model(LikeModel::class);
        $this->commentModel = model(CommentModel::class);
        $this->blockModel   = model(BlockModel::class);
        $this->db           = \Config\Database::connect();
    }

    public function getUserNotes(int $userId, array $filters = [], int $perPage = 10): array
    {
        $notes = $this->noteModel->getUserNotes($userId, $filters, $perPage);
        $pager = $this->noteModel->pager;
        foreach ($notes as &$note) {
            $note['like_count'] = $this->likeModel->getLikeCount($note['id']);
            $note['comment_count'] = $this->commentModel->where('note_id', $note['id'])->countAllResults();
            $note['liked_by_user'] = $this->likeModel->hasLiked($note['id'], $userId);
        }
        return ['data' => $notes, 'pager' => $pager];
    }

    public function createNote(int $userId, array $data): ?int
    {
        $data['user_id'] = $userId;
        $data['is_public'] = $data['is_public'] ?? 0;
        $data['allow_likes'] = $data['allow_likes'] ?? 1;
        $data['allow_comments'] = $data['allow_comments'] ?? 1;
        $data['views'] = 0;

        if (!$this->noteModel->validate($data)) {
            return null;
        }
        $noteId = $this->noteModel->insert($data);
        if (!$noteId) return null;
        if (!empty($data['tags']) && is_array($data['tags'])) {
            $this->noteModel->syncTags($noteId, $userId, $data['tags']);
        }
        return $noteId;
    }

    public function getNote(int $noteId, int $userId): ?array
    {
        // Try as owner first
        $note = $this->noteModel->getNoteWithTags($noteId, $userId);
        if ($note) {
            $note['like_count'] = $this->likeModel->getLikeCount($noteId);
            $note['comment_count'] = $this->commentModel->where('note_id', $noteId)->countAllResults();
            $note['liked_by_user'] = $this->likeModel->hasLiked($noteId, $userId);
            return $note;
        }

        // Check if public
        $note = $this->noteModel->find($noteId);
        if (!$note || $note['is_public'] != 1) return null;

        // Check if blocked
        if ($this->blockModel->isBlockedEither($userId, $note['user_id'])) return null;

        // Increment views (only for non‑owner)
        $this->noteModel->incrementViews($noteId);

        $note = $this->noteModel->getNoteWithTags($noteId, $note['user_id']);
        $note['like_count'] = $this->likeModel->getLikeCount($noteId);
        $note['comment_count'] = $this->commentModel->where('note_id', $noteId)->countAllResults();
        $note['liked_by_user'] = $this->likeModel->hasLiked($noteId, $userId);
        return $note;
    }

    public function updateNote(int $noteId, int $userId, array $data): bool
    {
        $note = $this->noteModel->where('id', $noteId)->where('user_id', $userId)->first();
        if (!$note) return false;
        $updateData = [];
        foreach (['title', 'content', 'category', 'is_public', 'allow_likes', 'allow_comments'] as $field) {
            if (array_key_exists($field, $data)) {
                $updateData[$field] = in_array($field, ['is_public', 'allow_likes', 'allow_comments'])
                    ? (int) $data[$field]
                    : $data[$field];
            }
        }
        if (!empty($updateData)) {
            $this->noteModel->update($noteId, $updateData);
        }
        if (array_key_exists('tags', $data) && is_array($data['tags'])) {
            $this->noteModel->syncTags($noteId, $userId, $data['tags']);
        }
        return true;
    }

    public function deleteNote(int $noteId, int $userId): bool
    {
        $note = $this->noteModel->where('id', $noteId)->where('user_id', $userId)->first();
        if (!$note) return false;
        return (bool) $this->noteModel->delete($noteId);
    }

    public function getFeed(int $userId, int $perPage = 10): array
    {
        $notes = $this->noteModel->getFeed($userId, $perPage);
        $pager = $this->noteModel->pager;
        foreach ($notes as &$note) {
            $note['like_count'] = $this->likeModel->getLikeCount($note['id']);
            $note['comment_count'] = $this->commentModel->where('note_id', $note['id'])->countAllResults();
            $note['liked_by_user'] = $this->likeModel->hasLiked($note['id'], $userId);
        }
        return ['data' => $notes, 'pager' => $pager];
    }
}
