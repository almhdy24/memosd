<?php namespace App\Controllers;

use App\Models\NoteModel;

class ShareController extends BaseApiController
{
    /**
     * View a shared note (no authentication required).
     * GET /api/shared/{token}
     */
    public function view($token = null)
    {
        if (!$token) {
            return $this->errorResponse('Missing share token', [], 400);
        }

        $model = new NoteModel();
        $note = $model->getNoteByShareToken($token);

        if (!$note) {
            return $this->errorResponse('Shared note not found', [], 404);
        }

        // Remove sensitive fields
        unset($note['user_id'], $note['share_token']);

        return $this->successResponse($note);
    }
}
