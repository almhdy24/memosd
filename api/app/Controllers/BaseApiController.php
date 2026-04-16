<?php namespace App\Controllers;

use CodeIgniter\RESTful\ResourceController;
use CodeIgniter\HTTP\ResponseInterface;

abstract class BaseApiController extends ResourceController
{
    protected $format = 'json';

    /**
     * Return a standardized success response.
     */
    protected function successResponse($data = null, string $message = '', int $statusCode = 200): ResponseInterface
    {
        return $this->respond([
            'status'  => 'success',
            'message' => $message,
            'data'    => $data,
            'meta'    => $this->buildMeta()
        ], $statusCode);
    }

    /**
     * Return a standardized error response.
     */
    protected function errorResponse(string $message, array $errors = [], int $statusCode = 400): ResponseInterface
    {
        return $this->respond([
            'status'  => 'error',
            'message' => $message,
            'errors'  => $errors,
            'meta'    => (object) []
        ], $statusCode);
    }

    /**
     * Return paginated results with standardized meta.
     *
     * @param mixed $data  Paginated data array
     * @param object|null $pager  Pager object from the model (optional, falls back to $this->model->pager)
     */
    protected function paginatedResponse($data, string $message = '', $pager = null): ResponseInterface
    {
        $pager = $pager ?? ($this->model->pager ?? null);
        
        $meta = [
            'pagination' => [
                'current_page' => 1,
                'total_pages'  => 1,
                'per_page'     => count($data),
                'total_items'  => count($data)
            ]
        ];
        
        if ($pager) {
            $meta['pagination'] = [
                'current_page' => $pager->getCurrentPage(),
                'total_pages'  => $pager->getPageCount(),
                'per_page'     => $pager->getPerPage(),
                'total_items'  => $pager->getTotal()
            ];
        }

        return $this->respond([
            'status'  => 'success',
            'message' => $message,
            'data'    => $data,
            'meta'    => $meta
        ]);
    }

    /**
     * Override to add custom meta data per controller.
     */
    protected function buildMeta(): array
    {
        return [];
    }

    /**
     * Get authenticated user ID from request header set by JWT filter.
     */
    protected function getUserId(): ?int
    {
        $header = $this->request->getHeaderLine('X-User-Id');
        return $header ? (int) $header : null;
    }
}
