<?php namespace App\Models;

use CodeIgniter\Model;

class ChannelMemberModel extends Model
{
    protected $table = 'channel_members';
    protected $primaryKey = ['channel_id', 'user_id'];
    protected $allowedFields = ['channel_id', 'user_id', 'role'];
    protected $useTimestamps = true;
    protected $createdField = 'joined_at';
    protected $updatedField = '';
}
