<?php namespace App\Controllers;

use App\Models\TagModel;

class TagsController extends BaseApiController
{
    protected $modelName = 'App\Models\TagModel';

    public function index()
    {
        $userId = $this->getUserId();
        $withCount = $this->request->getGet('count') === 'true';

        if ($withCount) {
            $tags = $this->model->getTagsWithCount($userId);
        } else {
            $tags = $this->model->where('user_id', $userId)->findAll();
        }

        return $this->successResponse($tags);
    }

    public function create()
    {
        $userId = $this->getUserId();
        $rules  = ['name' => 'required|max_length[50]'];

        if (!$this->validate($rules)) {
            return $this->errorResponse('Validation failed', $this->validator->getErrors(), 400);
        }

        $name = trim($this->request->getVar('name'));
        $exists = $this->model->where(['name' => $name, 'user_id' => $userId])->first();
        if ($exists) {
            return $this->successResponse($exists, 'Tag already exists');
        }

        $id = $this->model->insert(['name' => $name, 'user_id' => $userId]);
        return $this->successResponse(['id' => $id, 'name' => $name], 'Tag created', 201);
    }

    public function show($id = null)
    {
        $userId = $this->getUserId();
        $tag    = $this->model->where(['id' => $id, 'user_id' => $userId])->first();

        if (!$tag) {
            return $this->errorResponse('Tag not found', [], 404);
        }

        if ($this->request->getGet('notes') === 'true') {
            $tag['notes'] = $this->model->findNotesByTag($id, $userId);
        }

        return $this->successResponse($tag);
    }

    public function delete($id = null)
    {
        $userId = $this->getUserId();
        if (!$this->model->deleteTag($id, $userId)) {
            return $this->errorResponse('Tag not found', [], 404);
        }

        return $this->successResponse(null, 'Tag deleted');
    }
}
