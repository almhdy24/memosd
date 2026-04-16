<?php namespace App\Models;

use CodeIgniter\Model;

class UserModel extends Model
{
    protected $table            = 'users';
    protected $primaryKey       = 'id';
    protected $returnType       = 'array';
    protected $useSoftDeletes   = false;
    protected $allowedFields    = ['name', 'email', 'password', 'bio', 'avatar', 'allow_follow'];
    protected $useTimestamps    = true;
    protected $createdField     = 'created_at';
    protected $updatedField     = '';
    protected $validationRules  = [
        'name'         => 'required|min_length[3]|max_length[100]',
        'email'        => 'required|valid_email|is_unique[users.email,id,{id}]',
        'password'     => 'required|min_length[6]',
        'bio'          => 'permit_empty|max_length[500]',
        'allow_follow' => 'permit_empty|in_list[0,1]'
    ];
    protected $beforeInsert     = ['hashPassword'];
    protected $beforeUpdate     = ['hashPassword'];

    protected function hashPassword(array $data)
    {
        if (isset($data['data']['password'])) {
            $data['data']['password'] = password_hash($data['data']['password'], PASSWORD_DEFAULT);
        }
        return $data;
    }

    public function findByEmail(string $email): ?array
    {
        return $this->where('email', $email)->first();
    }

    /**
     * Get users that can be followed (exclude self, allow_follow=1).
     */
    public function getDiscoverableUsers(int $currentUserId, int $perPage = 20)
    {
        return $this->where('id !=', $currentUserId)
                    ->where('allow_follow', 1)
                    ->orderBy('created_at', 'DESC')
                    ->paginate($perPage);
    }
}
