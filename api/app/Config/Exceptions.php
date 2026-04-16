<?php namespace Config;

use CodeIgniter\Config\BaseConfig;

class Exceptions extends BaseConfig
{
    public $log = true;
    public $deprecationLog = true;
    public $sensitiveDataInTrace = [];
    public $ignoreCodes = [404];
    public $errorViewPath = APPPATH . 'Views/errors';
    public $exceptionViewPath = APPPATH . 'Views/errors/exception';
}
