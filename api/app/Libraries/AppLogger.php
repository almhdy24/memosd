<?php namespace App\Libraries;

use Psr\Log\LoggerInterface;

class AppLogger
{
    protected LoggerInterface $logger;

    public function __construct()
    {
        $this->logger = service('logger');
    }

    public function info(string $message, array $context = []): void
    {
        $this->logger->info($message, $context);
    }

    public function error(string $message, array $context = []): void
    {
        $this->logger->error($message, $context);
    }

    public function warning(string $message, array $context = []): void
    {
        $this->logger->warning($message, $context);
    }

    public function debug(string $message, array $context = []): void
    {
        $this->logger->debug($message, $context);
    }
}
