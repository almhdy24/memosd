<?php namespace Config;

use CodeIgniter\Router\RouteCollection;

$routes = Services::routes();
$routes->setDefaultNamespace('App\Controllers');
$routes->setDefaultController('Home');
$routes->setDefaultMethod('index');
$routes->setTranslateURIDashes(false);
$routes->set404Override();
$routes->setAutoRoute(false);

$routes->get('health', 'HealthController::index');
$routes->get('uploads/avatars/(:any)', 'AvatarController::serve/$1');

$routes->group('api', function($routes) {
    $routes->post('register', 'AuthController::register');
    $routes->post('login', 'AuthController::login');
    $routes->get('profile/(:num)', 'ProfileController::show/$1');
    $routes->get('shared/(:any)', 'ShareController::view/$1');

    $routes->group('', ['filter' => 'jwt:rateLimit:100,60'], function($routes) {
        $routes->get('profile', 'AuthController::profile');
        $routes->put('profile', 'AuthController::updateProfile');
        $routes->post('upload/avatar', 'UploadController::avatar');
        $routes->get('feed', 'NotesController::feed');
        $routes->get('search', 'SearchController::index');
        $routes->get('discover', 'DiscoverController::index');
        $routes->get('search', 'SearchController::index');
        
        $routes->post('notes/(:num)/like', 'LikeController::toggle/$1');
        $routes->post('notes/(:num)/share', 'NotesController::share/$1');
        $routes->delete('notes/(:num)/share', 'NotesController::unshare/$1');
        $routes->get('notes/(:num)/comments', 'CommentController::index/$1');
        $routes->post('notes/(:num)/comments', 'CommentController::create/$1');
        $routes->delete('notes/(:num)/comments/(:num)', 'CommentController::delete/$1/$2');
        
        $routes->resource('notes', ['controller' => 'NotesController']);
        $routes->resource('tags', ['controller' => 'TagsController']);
        
        $routes->post('follow/(:num)', 'FollowController::follow/$1');
        $routes->delete('follow/(:num)', 'FollowController::unfollow/$1');
        $routes->get('blocked', 'BlockController::index');
        $routes->post('block/(:num)', 'BlockController::block/$1');
        $routes->delete('block/(:num)', 'BlockController::unblock/$1');
        
        $routes->get('notifications', 'NotificationController::index');
        $routes->get('notifications/unread-count', 'NotificationController::unreadCount');
        $routes->put('notifications/(:num)/read', 'NotificationController::markRead/$1');
        $routes->put('notifications/read-all', 'NotificationController::markAllRead');
        
        $routes->get('chat/conversations', 'ChatController::conversations');
        $routes->get('chat/conversations/(:num)', 'ChatController::messages/$1');
        $routes->post('chat/messages/(:num)', 'ChatController::send/$1');
        $routes->get('chat/unread', 'ChatController::unreadCount');
        $routes->post('chat/typing/(:num)', 'ChatController::typing/$1');
        $routes->put('chat/read/(:num)', 'ChatController::markConversationRead/$1');
        
        $routes->get('user-status/(:num)', 'UserStatusController::show/$1');
        $routes->post('heartbeat', 'UserStatusController::heartbeat');
        $routes->post('reports', 'ReportController::create');
        
        // Custom channel routes (MUST be before resource)
        $routes->post('channels/(:num)/join', 'ChannelController::join/$1');
        $routes->get('channels/(:num)/messages', 'ChannelController::messages/$1');
        $routes->post('channels/(:num)/messages', 'ChannelController::sendMessage/$1');
        $routes->get('channels/(:num)/members', 'ChannelController::members/$1');
        
        // Channels resource (index, create, show, update, delete)
        $routes->resource('channels', ['controller' => 'ChannelController']);
    });
});
