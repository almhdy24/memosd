<?php namespace App\Libraries;

trait CacheTrait
{
    protected function cacheRemember(string $key, int $ttl, callable $callback)
    {
        $cache = \Config\Services::cache();
        $data = $cache->get($key);
        if ($data === null) {
            $data = $callback();
            $cache->save($key, $data, $ttl);
        }
        return $data;
    }

    protected function cacheForget(string $key): void
    {
        \Config\Services::cache()->delete($key);
    }
}
