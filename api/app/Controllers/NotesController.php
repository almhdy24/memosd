<?php namespace App\Controllers;

use App\Services\NoteService;
use App\Models\LikeModel;
use App\Models\NotificationModel;

class NotesController extends BaseApiController
{
    protected NoteService $noteService;

    public function __construct()
    {
        $this->noteService = new NoteService();
    }

    public function index()
    {
        $userId = $this->getUserId();
        $filters = [
            'category' => $this->request->getGet('category'),
            'tag'      => $this->request->getGet('tag')
        ];
        $perPage = (int) ($this->request->getGet('limit') ?? 10);

        $result = $this->noteService->getUserNotes($userId, $filters, $perPage);
        return $this->paginatedResponse($result['data'], '', $result['pager']);
    }

    public function create()
    {
        $userId = $this->getUserId();
        $data = $this->request->getJSON(true);

        $noteId = $this->noteService->createNote($userId, $data);
        if (!$noteId) {
            return $this->errorResponse('Validation failed', [], 400);
        }

        $note = $this->noteService->getNote($noteId, $userId);
        return $this->successResponse($note, 'Note created', 201);
    }

    public function show($id = null)
    {
        $userId = $this->getUserId();
        $note = $this->noteService->getNote($id, $userId);
        if (!$note) {
            return $this->errorResponse('Note not found', [], 404);
        }
        return $this->successResponse($note);
    }

    public function update($id = null)
    {
        $userId = $this->getUserId();
        $data = $this->request->getJSON(true);

        if (!$this->noteService->updateNote($id, $userId, $data)) {
            return $this->errorResponse('Note not found or update failed', [], 404);
        }

        return $this->successResponse(null, 'Note updated');
    }

    public function delete($id = null)
    {
        $userId = $this->getUserId();
        if (!$this->noteService->deleteNote($id, $userId)) {
            return $this->errorResponse('Note not found', [], 404);
        }
        return $this->successResponse(null, 'Note deleted');
    }

    public function share($id = null)
    {
        $userId = $this->getUserId();
        $noteModel = model('App\Models\NoteModel');
        $note = $noteModel->where('id', $id)->where('user_id', $userId)->first();
        if (!$note) {
            return $this->errorResponse('Note not found', [], 404);
        }

        $token = $note['share_token'] ?? $noteModel->generateShareToken($id);
        return $this->successResponse(['share_token' => $token], 'Share link generated');
    }

    public function unshare($id = null)
    {
        $userId = $this->getUserId();
        $noteModel = model('App\Models\NoteModel');
        $note = $noteModel->where('id', $id)->where('user_id', $userId)->first();
        if (!$note) {
            return $this->errorResponse('Note not found', [], 404);
        }

        $noteModel->removeShareToken($id);
        return $this->successResponse(null, 'Sharing disabled');
    }

    public function feed()
    {
        $userId = $this->getUserId();
        $perPage = (int) ($this->request->getGet('limit') ?? 10);
        $result = $this->noteService->getFeed($userId, $perPage);
        return $this->paginatedResponse($result['data'], '', $result['pager']);
    }
}
