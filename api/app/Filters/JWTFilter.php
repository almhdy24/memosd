<?php namespace App\Filters;

use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;
use CodeIgniter\Filters\FilterInterface;
use App\Libraries\JWTService;

class JWTFilter implements FilterInterface
{
    public function before(RequestInterface $request, $arguments = null)
    {
        $authHeader = $request->getServer('HTTP_AUTHORIZATION');
        if (!$authHeader) {
            return service('response')
                ->setJSON([
                    'status'  => 'error',
                    'message' => 'Missing authorization token',
                    'errors'  => [],
                    'meta'    => (object) []
                ])
                ->setStatusCode(401);
        }

        $token = str_replace('Bearer ', '', $authHeader);
        $decoded = JWTService::validateToken($token);

        if (!$decoded) {
            return service('response')
                ->setJSON([
                    'status'  => 'error',
                    'message' => 'Invalid or expired token',
                    'errors'  => [],
                    'meta'    => (object) []
                ])
                ->setStatusCode(401);
        }

        // Store user_id as a request attribute (no dynamic property)
        $request->setHeader('X-User-Id', (string) $decoded->user_id);
    }

    public function after(RequestInterface $request, ResponseInterface $response, $arguments = null) {}
}
