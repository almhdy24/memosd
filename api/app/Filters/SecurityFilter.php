<?php namespace App\Filters;

use CodeIgniter\Filters\FilterInterface;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;

class SecurityFilter implements FilterInterface
{
    public function before(RequestInterface $request, $arguments = null)
    {
        // Sanitize all input (basic XSS protection)
        $input = $request->getGet() ?? [];
        $post = $request->getPost() ?? [];
        
        $sanitizedGet = $this->sanitizeArray($input);
        $sanitizedPost = $this->sanitizeArray($post);
        
        $request->setGlobal('get', $sanitizedGet);
        $request->setGlobal('post', $sanitizedPost);
    }

    public function after(RequestInterface $request, ResponseInterface $response, $arguments = null) {}
    
    private function sanitizeArray(array $data): array
    {
        foreach ($data as $key => $value) {
            if (is_string($value)) {
                $data[$key] = htmlspecialchars($value, ENT_QUOTES, 'UTF-8');
            } elseif (is_array($value)) {
                $data[$key] = $this->sanitizeArray($value);
            }
        }
        return $data;
    }
}
