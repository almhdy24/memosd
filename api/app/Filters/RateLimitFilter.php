<?php namespace App\Filters;

use CodeIgniter\Filters\FilterInterface;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;

class RateLimitFilter implements FilterInterface
{
    public function before(RequestInterface $request, $arguments = null)
    {
        $ip = $request->getIPAddress();
        $cache = \Config\Services::cache();
        $key = "rate_limit_{$ip}";
        $count = $cache->get($key) ?? 0;
        $limit = (int) ($arguments[0] ?? 60);
        $window = (int) ($arguments[1] ?? 60);

        if ($count >= $limit) {
            return service('response')
                ->setJSON(['status' => 'error', 'message' => 'Rate limit exceeded'])
                ->setStatusCode(429);
        }

        $cache->save($key, $count + 1, $window);
    }

    public function after(RequestInterface $request, ResponseInterface $response, $arguments = null) {}
}
