<?php
header('Content-Type: application/json');

$lat = $_GET['lat'];
$lng = $_GET['lng'];
$key = '3222fddda6ee426b8b7fe74886d5caa3'; // Your actual API key

$url = "https://api.opencagedata.com/geocode/v1/json?q={$lat}+{$lng}&key={$key}&pretty=0";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
curl_close($ch);

echo $response;
?>
