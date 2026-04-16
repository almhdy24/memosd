<?php namespace App\Controllers;

use App\Models\ReportModel;

class ReportController extends BaseApiController
{
    public function create()
    {
        $userId = $this->getUserId();
        $data = $this->request->getJSON(true);
        
        $rules = [
            'target_type' => 'required|in_list[user,note,message]',
            'target_id'   => 'required|integer',
            'reason'      => 'required|in_list[spam,harassment,inappropriate,other]'
        ];
        
        if (!$this->validate($rules)) {
            return $this->errorResponse('Validation failed', $this->validator->getErrors(), 400);
        }
        
        $model = new ReportModel();
        if ($model->hasPendingReport($userId, $data['target_type'], $data['target_id'])) {
            return $this->errorResponse('You already reported this item', [], 400);
        }
        
        $reportId = $model->insert([
            'reporter_id' => $userId,
            'target_type' => $data['target_type'],
            'target_id'   => $data['target_id'],
            'reason'      => $data['reason'],
            'description' => $data['description'] ?? null,
            'status'      => 'pending'
        ]);
        
        if (!$reportId) {
            return $this->errorResponse('Failed to submit report', [], 500);
        }
        
        return $this->successResponse(['id' => $reportId], 'Report submitted');
    }
}
