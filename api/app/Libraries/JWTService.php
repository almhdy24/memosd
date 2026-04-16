<?php namespace App\Libraries;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class JWTService
{
    private static $secret;

    public static function init()
    {
        self::$secret = getenv('JWT_SECRET');
    }

    public static function generateToken($userId, $email)
    {
        self::init();
        $payload = [
            'iss' => base_url(),
            'iat' => time(),
            'exp' => time() + 3600 * 24, // 24 hours
            'user_id' => $userId,
            'email' => $email
        ];
        return JWT::encode($payload, self::$secret, 'HS256');
    }

    public static function validateToken($token)
    {
        self::init();
        try {
            return JWT::decode($token, new Key(self::$secret, 'HS256'));
        } catch (\Exception $e) {
            return false;
        }
    }
}