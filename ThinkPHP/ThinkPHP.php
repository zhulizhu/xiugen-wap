<?php
// +----------------------------------------------------------------------
// | ThinkPHP [ WE CAN DO IT JUST THINK IT ]
// +----------------------------------------------------------------------
// | Copyright (c) 2006-2013 http://thinkphp.cn All rights reserved.
// +----------------------------------------------------------------------
// | Licensed ( )
// +----------------------------------------------------------------------
// | Author: liu21st <>
// +----------------------------------------------------------------------

// 
$GLOBALS['_beginTime'] = microtime(TRUE);
// 
define('MEMORY_LIMIT_ON',function_exists('memory_get_usage'));
if(MEMORY_LIMIT_ON) $GLOBALS['_startUseMems'] = memory_get_usage();

// 
const THINK_VERSION     =   '3.2.0RC1';

// 
const URL_COMMON        =   0;  //
const URL_PATHINFO      =   1;  //
const URL_REWRITE       =   2;  //
const URL_COMPAT        =   3;  // 

// 
const EXT               =   '.class.php'; 

// 
defined('THINK_PATH') 	or define('THINK_PATH',     __DIR__.'/');
defined('APP_PATH') 	or define('APP_PATH',       dirname($_SERVER['SCRIPT_FILENAME']).'/');
defined('APP_STATUS')   or define('APP_STATUS',     ''); // 
defined('APP_DEBUG') 	or define('APP_DEBUG',      false); // 
defined('STORAGE_TYPE') or define('STORAGE_TYPE',   'File'); // 
defined('APP_MODE')     or define('APP_MODE',       'common'); // 
defined('RUNTIME_PATH') or define('RUNTIME_PATH',   APP_PATH.'Runtime/');
defined('LIB_PATH')     or define('LIB_PATH',       THINK_PATH.'Library/'); // 
defined('CORE_PATH')    or define('CORE_PATH',      LIB_PATH.'Think/'); // 
defined('EXTEND_PATH')  or define('EXTEND_PATH',    THINK_PATH.'Extend/'); // 
defined('MODE_PATH')    or define('MODE_PATH',      EXTEND_PATH.'Mode/'); // 
defined('VENDOR_PATH')  or define('VENDOR_PATH',    LIB_PATH.'Vendor/'); // 
defined('COMMON_PATH')  or define('COMMON_PATH',    APP_PATH.'Common/'); // 
defined('LANG_PATH')    or define('LANG_PATH',      COMMON_PATH.'Lang/'); // 
defined('HTML_PATH')    or define('HTML_PATH',      APP_PATH.'Html/'); // 
defined('LOG_PATH')     or define('LOG_PATH',       RUNTIME_PATH.'Logs/'); // 
defined('TEMP_PATH')    or define('TEMP_PATH',      RUNTIME_PATH.'Temp/'); // 
defined('DATA_PATH')    or define('DATA_PATH',      RUNTIME_PATH.'Data/'); // 
defined('CACHE_PATH')   or define('CACHE_PATH',     RUNTIME_PATH.'Cache/'); // 

// 
if(version_compare(PHP_VERSION,'5.4.0','<')) {
    ini_set('magic_quotes_runtime',0);
    define('MAGIC_QUOTES_GPC',get_magic_quotes_gpc()?True:False);
}else{
    define('MAGIC_QUOTES_GPC',false);
}
define('IS_CGI',substr(PHP_SAPI, 0,3)=='cgi' ? 1 : 0 );
define('IS_WIN',strstr(PHP_OS, 'WIN') ? 1 : 0 );
define('IS_CLI',PHP_SAPI=='cli'? 1   :   0);

if(!IS_CLI) {
    // 
    if(!defined('_PHP_FILE_')) {
        if(IS_CGI) {
            //
            $_temp  = explode('.php',$_SERVER['PHP_SELF']);
            define('_PHP_FILE_',    rtrim(str_replace($_SERVER['HTTP_HOST'],'',$_temp[0].'.php'),'/'));
        }else {
            define('_PHP_FILE_',    rtrim($_SERVER['SCRIPT_NAME'],'/'));
        }
    }
    if(!defined('__ROOT__')) {
        $_root  =   rtrim(dirname(_PHP_FILE_),'/');
        define('__ROOT__',  (($_root=='/' || $_root=='\\')?'':$_root));
    }
}

/**
 * xxxxxxxx
 * @param string|array $name
 * @param mixed $value 
 * @return mixed
 */
function C($name=null, $value=null) {
    static $_config = array();
    // 
    if (empty($name)) {
        if(!empty($value) && $array = S('c_'.$value)) {
            $_config = array_merge($_config, array_change_key_case($array));
        }
        return $_config;
    }
    // 
    if (is_string($name)) {
        if (!strpos($name, '.')) {
            $name = strtolower($name);
            if (is_null($value))
                return isset($_config[$name]) ? $_config[$name] : null;
            $_config[$name] = $value;
            return;
        }
        // 
        $name = explode('.', $name);
        $name[0]   =  strtolower($name[0]);
        if (is_null($value))
            return isset($_config[$name[0]][$name[1]]) ? $_config[$name[0]][$name[1]] : null;
        $_config[$name[0]][$name[1]] = $value;
        return;
    }
    // 
    if (is_array($name)){
        $_config = array_merge($_config, array_change_key_case($name));
        if(!empty($value)) {// 
            S('c_'.$value,$_config);
        }
        return;
    }
    return null; // 
}
// 
require CORE_PATH.'Think'.EXT;
//  
Think\Think::start();