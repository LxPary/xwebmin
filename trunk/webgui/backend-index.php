<?php 
/*
    app-dns
    @author:    riverfor@gmail.com
*/
require_once 'sys-lib/xmllib.php';
require_once 'ajax-lib/jsHttpRequest.php';

$JsHttpRequest =& new JsHttpRequest("UTF-8");

$handle = new OSConfXML($_REQUEST['rpc'], $_REQUEST['appId'], $_REQUEST['data']); 
$GLOBALS['_RESULT'] = $handle->dispatcher();
?>
