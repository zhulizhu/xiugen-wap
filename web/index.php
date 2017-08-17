<?php

//decode by QQ:270656184 http://www.yunlu99.com/
if (version_compare(PHP_VERSION, '5.3.0', '<')) {
	die('require PHP > 5.3.0 !');
}
define('APP_DEBUG', false);
define('APP_PATH', '../Application/');
define('RUNTIME_PATH', './Runtime/');
require '../ThinkPHP/ThinkPHP.php';