<?php namespace App\Controllers;

use App\Models\ChannelModel;
use App\Models\ChannelMemberModel;
use App\Models\ChannelMessageModel;

class ChannelController extends BaseApiController
{
    public function index()
    {
        $userId = $this->getUserId();
        $memberModel = new ChannelMemberModel();
        $channels = $memberModel->select('channels.*')
                                ->join('channels', 'channels.id = channel_members.channel_id')
                                ->where('channel_members.user_id', $userId)
                                ->findAll();
        return $this->successResponse($channels);
    }

    public function create()
    {
        $userId = $this->getUserId();
        $data = $this->request->getJSON(true);
        
        $rules = ['name' => 'required|max_length[100]'];
        if (!$this->validate($rules)) {
            return $this->errorResponse('Validation failed', $this->validator->getErrors(), 400);
        }
        
        $channelModel = new ChannelModel();
        $channelId = $channelModel->insert([
            'name'        => $data['name'],
            'description' => $data['description'] ?? null,
            'owner_id'    => $userId,
            'is_private'  => $data['is_private'] ?? 0
        ]);
        
        if (!$channelId) {
            return $this->errorResponse('Failed to create channel', [], 500);
        }
        
        $memberModel = new ChannelMemberModel();
        $memberModel->insert([
            'channel_id' => $channelId,
            'user_id'    => $userId,
            'role'       => 'admin'
        ]);
        
        return $this->successResponse(['id' => $channelId], 'Channel created', 201);
    }

    public function join($channelId = null)
    {
        $userId = $this->getUserId();
        $channelModel = new ChannelModel();
        $channel = $channelModel->find($channelId);
        if (!$channel) {
            return $this->errorResponse('Channel not found', [], 404);
        }
        if ($channel['is_private']) {
            return $this->errorResponse('This channel is private', [], 403);
        }
        
        $memberModel = new ChannelMemberModel();
        $exists = $memberModel->where('channel_id', $channelId)
                              ->where('user_id', $userId)
                              ->first();
        if ($exists) {
            return $this->successResponse(null, 'Already a member');
        }
        
        $memberModel->insert([
            'channel_id' => $channelId,
            'user_id'    => $userId,
            'role'       => 'member'
        ]);
        
        return $this->successResponse(null, 'Joined channel');
    }

    public function messages($channelId = null)
    {
        $userId = $this->getUserId();
        $memberModel = new ChannelMemberModel();
        $isMember = $memberModel->where('channel_id', $channelId)
                                ->where('user_id', $userId)
                                ->first();
        if (!$isMember) {
            return $this->errorResponse('You are not a member of this channel', [], 403);
        }
        $msgModel = new ChannelMessageModel();
        $messages = $msgModel->getMessages($channelId);
        return $this->successResponse($messages);
    }

    public function sendMessage($channelId = null)
    {
        $userId = $this->getUserId();
        $memberModel = new ChannelMemberModel();
        $isMember = $memberModel->where('channel_id', $channelId)
                                ->where('user_id', $userId)
                                ->first();
        if (!$isMember) {
            return $this->errorResponse('You are not a member of this channel', [], 403);
        }
        $data = $this->request->getJSON(true);
        if (empty($data['content'])) {
            return $this->errorResponse('Message content required', [], 400);
        }
        $msgModel = new ChannelMessageModel();
        $msgId = $msgModel->insert([
            'channel_id' => $channelId,
            'sender_id'  => $userId,
            'content'    => $data['content']
        ]);
        $message = $msgModel->select('channel_messages.*, users.name as sender_name, users.avatar as sender_avatar')
                            ->join('users', 'users.id = channel_messages.sender_id')
                            ->find($msgId);
        return $this->successResponse($message, 'Message sent', 201);
    }

    public function members($channelId = null)
    {
        $memberModel = new ChannelMemberModel();
        $members = $memberModel->select('channel_members.*, users.name, users.avatar')
                               ->join('users', 'users.id = channel_members.user_id')
                               ->where('channel_id', $channelId)
                               ->findAll();
        return $this->successResponse($members);
    }
}
