<?php namespace App\Controllers;

use App\Models\UserModel;
use App\Libraries\JWTService;

class AuthController extends BaseApiController
{
    public function register()
    {
        $model = new UserModel();
        $data  = $this->request->getJSON(true);

        if (!$model->validate($data)) {
            return $this->errorResponse('Validation failed', $model->errors(), 400);
        }

        $id = $model->insert($data);
        if (!$id) {
            return $this->errorResponse('Registration failed', [], 500);
        }

        $user = $model->find($id);
        unset($user['password']);

        $token = JWTService::generateToken($id, $user['email']);

        return $this->successResponse([
            'token' => $token,
            'user'  => $user
        ], 'User registered successfully', 201);
    }

    public function login()
    {
        $rules = [
            'email'    => 'required|valid_email',
            'password' => 'required'
        ];

        if (!$this->validate($rules)) {
            return $this->errorResponse('Validation failed', $this->validator->getErrors(), 400);
        }

        $model = new UserModel();
        $user  = $model->findByEmail($this->request->getVar('email'));

        if (!$user || !password_verify($this->request->getVar('password'), $user['password'])) {
            return $this->errorResponse('Invalid credentials', [], 401);
        }

        unset($user['password']);
        $token = JWTService::generateToken($user['id'], $user['email']);

        return $this->successResponse([
            'token' => $token,
            'user'  => $user
        ], 'Login successful');
    }

    public function profile()
    {
        $userId = $this->getUserId();
        $model  = new UserModel();
        $user   = $model->find($userId);

        if (!$user) {
            return $this->errorResponse('User not found', [], 404);
        }

        unset($user['password']);
        return $this->successResponse($user);
    }

    /**
     * Update authenticated user's profile.
     * PUT /api/profile
     */
    public function updateProfile()
    {
        $userId = $this->getUserId();
        $model = new UserModel();
        $user = $model->find($userId);
        if (!$user) {
            return $this->errorResponse('User not found', [], 404);
        }

        $data = $this->request->getJSON(true);
        $allowedFields = ['name', 'bio', 'allow_follow'];
        $updateData = [];
        foreach ($allowedFields as $field) {
            if (array_key_exists($field, $data)) {
                $updateData[$field] = $data[$field];
            }
        }

        if (empty($updateData)) {
            return $this->errorResponse('No fields to update', [], 400);
        }

        if (!$model->update($userId, $updateData)) {
            return $this->errorResponse('Update failed', $model->errors(), 400);
        }

        $updatedUser = $model->find($userId);
        unset($updatedUser['password']);
        return $this->successResponse($updatedUser, 'Profile updated');
    }
}
