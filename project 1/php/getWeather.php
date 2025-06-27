<?php
header('Content-Type: application/json');

if (!isset($_GET['lat'], $_GET['lon'])) {
    http_response_code(400);
    echo json_encode([ "error" => "Missing lat and/or lon parameters" ]);
    exit;
}

$lat    = $_GET['lat'];
$lon    = $_GET['lon'];
$apiKey = 'fe0860df9409037e2d00018ad4212b12';  // your real key

$url = "https://api.openweathermap.org/data/2.5/forecast"
     . "?lat="   . urlencode($lat)
     . "&lon="   . urlencode($lon)
     . "&units=metric"
     . "&appid=" . urlencode($apiKey);

$response = @file_get_contents($url);
if ($response === false) {
    http_response_code(502);
    echo json_encode([ "error" => "Failed to fetch weather from OpenWeatherMap" ]);
    exit;
}

// pass through the JSON you got
echo $response;
