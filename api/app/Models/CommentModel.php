<?php namespace App\Models;

use CodeIgniter\Model;

class CommentModel extends Model
{
    protected $table            = 'comments';
    protected $primaryKey       = 'id';
    protected $returnType       = 'array';
    protected $useSoftDeletes   = false;
    protected $allowedFields    = ['note_id', 'user_id', 'content'];
    protected $useTimestamps    = true;
    protected $createdField     = 'created_at';
    protected $updatedField     = '';

    public function getComments(int $noteId, int $limit = 50): array
    {
        return $this->select('comments.*, users.name as user_name, users.avatar as user_avatar')
                    ->join('users', 'users.id = comments.user_id')
                    ->where('note_id', $noteId)
                    ->orderBy('created_at', 'ASC')
                    ->limit($limit)
                    ->findAll();
    }

    public function addComment(int $noteId, int $userId, string $content): int
    {
        $this->insert([
            'note_id' => $noteId,
            'user_id' => $userId,
            'content' => $content
        ]);
        return $this->getInsertID();
    }

    public function deleteComment(int $commentId, int $userId): bool
    {
        $comment = $this->find($commentId);
        if (!$comment || $comment['user_id'] != $userId) {
            return false;
        }
        return $this->delete($commentId) ? true : false;
    }
}
