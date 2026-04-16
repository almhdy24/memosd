<?php
// Load CodeIgniter 4 bootstrap
$appPath = __DIR__ . '/app';
$systemPath = __DIR__ . '/vendor/codeigniter4/framework/system';

// Manually include necessary files before bootstrap
require $systemPath . '/Config/BaseService.php';
require $systemPath . '/Config/Services.php';
require $appPath . '/Config/Paths.php';

$paths = new Config\Paths();
require $systemPath . '/bootstrap.php';

// Now CodeIgniter services are available

use Ratchet\Server\IoServer;
use Ratchet\Http\HttpServer;
use Ratchet\WebSocket\WsServer;
use App\WebSocket\ChatServer;

$server = IoServer::factory(
    new HttpServer(
        new WsServer(
            new ChatServer()
        )
    ),
    8081
);

echo "WebSocket server running on ws://localhost:8081\n";
$server->run();
