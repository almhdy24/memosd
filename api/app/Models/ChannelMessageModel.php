<?php namespace App\Models;

use CodeIgniter\Model;

class ChannelMessageModel extends Model
{
    protected $table = 'channel_messages';
    protected $primaryKey = 'id';
    protected $allowedFields = ['channel_id', 'sender_id', 'content'];
    protected $useTimestamps = true;
    protected $createdField = 'created_at';
    protected $updatedField = '';

    public function getMessages(int $channelId, int $limit = 50): array
    {
        return $this->select('channel_messages.*, users.name as sender_name, users.avatar as sender_avatar')
                    ->join('users', 'users.id = channel_messages.sender_id')
                    ->where('channel_id', $channelId)
                    ->orderBy('created_at', 'ASC')
                    ->limit($limit)
                    ->findAll();
    }
}
