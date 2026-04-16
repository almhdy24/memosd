<?php namespace App\Models;

use CodeIgniter\Model;

class NoteModel extends Model
{
    protected $table            = 'notes';
    protected $primaryKey       = 'id';
    protected $returnType       = 'array';
    protected $useSoftDeletes   = false;
    protected $allowedFields    = ['user_id', 'title', 'content', 'category', 'share_token', 'is_public', 'allow_likes', 'allow_comments', 'views'];
    protected $useTimestamps    = true;
    protected $createdField     = 'created_at';
    protected $updatedField     = 'updated_at';
    protected $validationRules  = [
        'user_id'     => 'required|integer',
        'title'       => 'required|max_length[255]',
        'content'     => 'permit_empty|string',
        'category'    => 'permit_empty|max_length[50]',
        'share_token' => 'permit_empty|max_length[64]|is_unique[notes.share_token,id,{id}]',
        'is_public'   => 'permit_empty|in_list[0,1]'
    ];

    public function getUserNotes(int $userId, array $filters = [], int $perPage = 10)
    {
        $builder = $this->where('user_id', $userId)->orderBy('updated_at', 'DESC');
        if (!empty($filters['category'])) $builder->where('category', $filters['category']);
        if (!empty($filters['tag'])) {
            $builder->select('notes.*')->join('note_tags', 'note_tags.note_id = notes.id')
                    ->join('tags', 'tags.id = note_tags.tag_id')->where('tags.name', $filters['tag'])
                    ->where('tags.user_id', $userId)->groupBy('notes.id');
        }
        return $builder->paginate($perPage);
    }

    public function getNoteWithTags(int $noteId, int $userId): ?array
    {
        $note = $this->where(['id' => $noteId, 'user_id' => $userId])->first();
        if (!$note) return null;
        $db = \Config\Database::connect();
        $tags = $db->table('note_tags')->select('tags.id, tags.name')
                    ->join('tags', 'tags.id = note_tags.tag_id')
                    ->where('note_tags.note_id', $noteId)->get()->getResultArray();
        $note['tags'] = $tags;
        return $note;
    }

    public function getNoteByShareToken(string $token): ?array
    {
        $note = $this->where('share_token', $token)->first();
        if (!$note) return null;
        $db = \Config\Database::connect();
        $tags = $db->table('note_tags')->select('tags.id, tags.name')
                    ->join('tags', 'tags.id = note_tags.tag_id')
                    ->where('note_tags.note_id', $note['id'])->get()->getResultArray();
        $note['tags'] = $tags;
        return $note;
    }

    public function generateShareToken(int $noteId): string
    {
        $token = bin2hex(random_bytes(16));
        $this->update($noteId, ['share_token' => $token]);
        return $token;
    }

    public function removeShareToken(int $noteId): void
    {
        $this->update($noteId, ['share_token' => null]);
    }

    public function syncTags(int $noteId, int $userId, ?array $tagNames): void
    {
        $db = \Config\Database::connect();
        $noteTagTable = $db->table('note_tags');
        $tagModel = model(TagModel::class);
        $noteTagTable->where('note_id', $noteId)->delete();
        if (empty($tagNames)) return;
        foreach ($tagNames as $tagName) {
            $tagName = trim($tagName);
            if ($tagName === '') continue;
            $tagId = $tagModel->getOrCreate($tagName, $userId);
            $noteTagTable->insert(['note_id' => $noteId, 'tag_id' => $tagId]);
        }
    }

    public function getPublicNotesByUser(int $userId, int $perPage = 10)
    {
        return $this->where(['user_id' => $userId, 'is_public' => 1])
                    ->orderBy('updated_at', 'DESC')->paginate($perPage);
    }

    public function getFeed(int $userId, int $perPage = 10)
    {
        $db = \Config\Database::connect();
        $followed = $db->table('follows')->select('followed_id')
                        ->where('follower_id', $userId)->get()->getResultArray();
        $followedIds = array_column($followed, 'followed_id');
        $followedIds[] = $userId;
        return $this->select('notes.*, users.name as author_name')
                    ->join('users', 'users.id = notes.user_id')
                    ->where('notes.is_public', 1)
                    ->whereIn('notes.user_id', $followedIds)
                    ->orderBy('notes.updated_at', 'DESC')
                    ->paginate($perPage);
    }

    public function getLikeCount(int $noteId): int
    {
        $db = \Config\Database::connect();
        return $db->table('likes')->where('note_id', $noteId)->countAllResults();
    }

    public function getCommentCount(int $noteId): int
    {
        $db = \Config\Database::connect();
        return $db->table('comments')->where('note_id', $noteId)->countAllResults();
    }

    public function incrementViews(int $noteId): void
    {
        $this->where('id', $noteId)->increment('views');
    }
}
