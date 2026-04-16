<?php namespace App\Models;

use CodeIgniter\Model;

class ChannelModel extends Model
{
    protected $table = 'channels';
    protected $primaryKey = 'id';
    protected $allowedFields = ['name', 'description', 'owner_id', 'is_private'];
    protected $useTimestamps = true;
}
