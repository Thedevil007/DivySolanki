<?php
$lat = $_GET['lat'];
$lng = $_GET['lng'];

$url = "http://api.geonames.org/timezoneJSON?lat=$lat&lng=$lng&username=demo";

$response = file_get_contents($url);
echo $response;
?>
