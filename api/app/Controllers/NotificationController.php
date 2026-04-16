<?php namespace App\Controllers;

use App\Models\NotificationModel;

class NotificationController extends BaseApiController
{
    public function index()
    {
        $userId = $this->getUserId();
        $model = new NotificationModel();
        $notifications = $model->getUserNotifications($userId);
        return $this->successResponse($notifications);
    }

    public function unreadCount()
    {
        $userId = $this->getUserId();
        $model = new NotificationModel();
        $count = $model->getUnreadCount($userId);
        return $this->successResponse(['count' => $count]);
    }

    public function markRead($id = null)
    {
        $userId = $this->getUserId();
        $model = new NotificationModel();
        $model->markAsRead($userId, $id);
        return $this->successResponse(null, 'Marked read');
    }

    public function markAllRead()
    {
        $userId = $this->getUserId();
        $model = new NotificationModel();
        $model->markAllAsRead($userId);
        return $this->successResponse(null, 'All marked read');
    }
}
