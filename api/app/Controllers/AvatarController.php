<?php namespace App\Controllers;

use CodeIgniter\Controller;

class AvatarController extends Controller
{
    public function serve($filename = null)
    {
        if (!$filename) {
            return $this->response->setStatusCode(404);
        }

        $filePath = WRITEPATH . 'uploads/avatars/' . $filename;

        if (!is_file($filePath)) {
            return $this->response->setStatusCode(404);
        }

        $mime = mime_content_type($filePath);
        
        while (ob_get_level()) {
            ob_end_clean();
        }

        return $this->response
            ->setHeader('Content-Type', $mime)
            ->setHeader('Content-Length', (string) filesize($filePath))
            ->setHeader('Cache-Control', 'public, max-age=31536000')
            ->setBody(file_get_contents($filePath));
    }
}
