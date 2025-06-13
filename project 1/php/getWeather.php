<?php
header('Content-Type: application/json');

// Validate and get parameters
$lat = $_GET['lat'] ?? null;
$lon = $_GET['lng'] ?? null; // Correct key is 'lng', not 'lon'

// If missing, return an error
if (!$lat || !$lon) {
    echo json_encode([
        "error" => "Missing required parameters: lat and lng"
    ]);
    exit;
}

$apiKey = 'd21cca66ee37a21e473a0407cc5edd4d'; // Replace with your actual API key

$url = "https://api.openweathermap.org/data/2.5/weather?lat={$lat}&lon={$lon}&units=metric&appid={$apiKey}";

// Fetch weather data
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);

if (curl_errno($ch)) {
    echo json_encode([
        "error" => "CURL Error: " . curl_error($ch)
    ]);
    curl_close($ch);
    exit;
}

curl_close($ch);

// Return API response
echo $response;
?>
