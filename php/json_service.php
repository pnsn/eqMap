<!--
Simple php web service that parses json file and serves json as either json or jsonp
-->
<?php
$data = file_get_contents("../python/recent_events.json");
//JSONP if callback param exists
if(array_key_exists('callback', $_GET)){
    
    header('Content-Type: text/javascript; charset=utf8');
    header('Access-Control-Allow-Origin: http://www.example.com/');
    header('Access-Control-Max-Age: 3628800');
    header('Access-Control-Allow-Methods: GET');

    $callback = $_GET['callback'];
    echo $callback.'('.$data.');';

}else{
    // normal JSON string
    header('Content-Type: application/json; charset=utf8');

    echo $data;
}