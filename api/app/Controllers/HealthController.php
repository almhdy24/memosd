<?php namespace App\Controllers;

use CodeIgniter\Controller;

class HealthController extends Controller
{
    public function index()
    {
        $db = \Config\Database::connect();
        $cache = \Config\Services::cache();
        
        $status = [
            'status' => 'ok',
            'timestamp' => date('c'),
            'services' => [
                'database' => $this->checkDatabase($db),
                'cache' => $this->checkCache($cache),
                'websocket' => $this->checkWebSocket()
            ],
            'version' => '1.0.0'
        ];
        
        // Overall status
        $allOk = true;
        foreach ($status['services'] as $service) {
            if ($service !== 'ok') $allOk = false;
        }
        $status['status'] = $allOk ? 'healthy' : 'degraded';
        
        $code = $allOk ? 200 : 503;
        return $this->response->setJSON($status)->setStatusCode($code);
    }
    
    private function checkDatabase($db): string
    {
        try {
            $db->query('SELECT 1');
            return 'ok';
        } catch (\Exception $e) {
            return 'error';
        }
    }
    
    private function checkCache($cache): string
    {
        try {
            $cache->save('health_check', 'ok', 1);
            return $cache->get('health_check') === 'ok' ? 'ok' : 'error';
        } catch (\Exception $e) {
            return 'error';
        }
    }
    
    private function checkWebSocket(): string
    {
        // Simple check – in production you'd ping the WebSocket server
        $socket = @fsockopen('localhost', 8082, $errno, $errstr, 2);
        if ($socket) {
            fclose($socket);
            return 'ok';
        }
        return 'unavailable';
    }
}
