<?php namespace App\Models;

use CodeIgniter\Model;

class TagModel extends Model
{
    protected $table            = 'tags';
    protected $primaryKey       = 'id';
    protected $returnType       = 'array';
    protected $useSoftDeletes   = false;
    protected $allowedFields    = ['name', 'user_id'];
    protected $useTimestamps    = false;
    protected $validationRules  = [
        'name'    => 'required|max_length[50]',
        'user_id' => 'required|integer'
    ];
    protected $validationMessages = [];
    protected $skipValidation     = false;

    /**
     * Get or create a tag and return its ID.
     */
    public function getOrCreate(string $name, int $userId): int
    {
        $tag = $this->where(['name' => $name, 'user_id' => $userId])->first();
        if ($tag) {
            return $tag['id'];
        }

        $this->insert(['name' => $name, 'user_id' => $userId]);
        return $this->getInsertID();
    }

    /**
     * Get all tags for a user with note counts.
     */
    public function getTagsWithCount(int $userId): array
    {
        $db = \Config\Database::connect();
        return $db->table('tags')
                  ->select('tags.id, tags.name, COUNT(note_tags.note_id) as note_count')
                  ->join('note_tags', 'note_tags.tag_id = tags.id', 'left')
                  ->where('tags.user_id', $userId)
                  ->groupBy('tags.id')
                  ->orderBy('note_count', 'DESC')
                  ->get()
                  ->getResultArray();
    }

    /**
     * Find notes by a specific tag.
     */
    public function findNotesByTag(int $tagId, int $userId): array
    {
        $db = \Config\Database::connect();
        return $db->table('notes')
                  ->select('notes.*')
                  ->join('note_tags', 'note_tags.note_id = notes.id')
                  ->where('note_tags.tag_id', $tagId)
                  ->where('notes.user_id', $userId)
                  ->orderBy('notes.updated_at', 'DESC')
                  ->get()
                  ->getResultArray();
    }

    /**
     * Delete a tag and remove its associations.
     */
    public function deleteTag(int $tagId, int $userId): bool
    {
        $tag = $this->where(['id' => $tagId, 'user_id' => $userId])->first();
        if (!$tag) {
            return false;
        }

        $db = \Config\Database::connect();
        $db->table('note_tags')->where('tag_id', $tagId)->delete();
        return $this->delete($tagId);
    }
}
