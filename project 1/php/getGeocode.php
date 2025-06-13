<?php
header('Content-Type: application/json');
$lat = $_GET['lat'];
$lng = $_GET['lng'];
$key = '3222fddda6ee426b8b7fe74886d5caa3'; // Your OpenCage API key
$url = "https://api.opencagedata.com/geocode/v1/json?q={$lat}+{$lng}&key={$key}";
echo file_get_contents($url);
?>
