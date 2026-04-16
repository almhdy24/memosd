<?php namespace App\Models;

use CodeIgniter\Model;

class ReportModel extends Model
{
    protected $table         = 'reports';
    protected $primaryKey    = 'id';
    protected $returnType    = 'array';
    protected $allowedFields = ['reporter_id', 'target_type', 'target_id', 'reason', 'description', 'status'];
    protected $useTimestamps = true;

    public function hasPendingReport(int $reporterId, string $type, int $targetId): bool
    {
        return $this->where([
            'reporter_id' => $reporterId,
            'target_type' => $type,
            'target_id'   => $targetId,
            'status'      => 'pending'
        ])->countAllResults() > 0;
    }
}
