<?php
header('Content-Type: application/json');
$lat = $_GET['lat'];
$lon = $_GET['lon'];
$apiKey = 'fe0860df9409037e2d00018ad4212b12'; // Replace with your API key

$url = "https://api.openweathermap.org/data/2.5/weather?lat={$lat}&lon={$lon}&units=metric&appid={$apiKey}";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
curl_close($ch);

echo $response;
?>
