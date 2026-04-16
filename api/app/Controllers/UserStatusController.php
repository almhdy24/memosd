<?php namespace App\Controllers;

use App\Models\UserStatusModel;

class UserStatusController extends BaseApiController
{
    public function show($userId = null)
    {
        $model = new UserStatusModel();
        $status = $model->getStatus($userId);
        return $this->successResponse($status);
    }

    public function heartbeat()
    {
        $userId = $this->getUserId();
        $model = new UserStatusModel();
        $model->setOnline($userId);
        
        // Broadcast via WebSocket (if integrated with Workerman)
        // This requires a way to access the Workerman instance.
        // For now, we'll rely on the WebSocket auth heartbeat.
        
        return $this->successResponse(['online' => true]);
    }
}
