<?php
$lat = $_GET['lat'] ?? null;
$lon = $_GET['lon'] ?? null;
$apiKey = 'fe0860df9409037e2d00018ad4212b12'; // Replace with your real API key

if (!$lat || !$lon) {
  http_response_code(400);
  echo json_encode(["error" => "Missing lat/lon parameters"]);
  exit;
}

$url = "https://api.openweathermap.org/data/2.5/forecast?lat={$lat}&lon={$lon}&units=metric&appid={$apiKey}";

$response = file_get_contents($url);
header('Content-Type: application/json');
echo $response;
