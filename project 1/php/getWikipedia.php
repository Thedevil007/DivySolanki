<?php
header('Content-Type: application/json');

// Validate and retrieve parameters
if (!isset($_GET['lat']) || !isset($_GET['lon'])) {
    echo json_encode(["status" => ["message" => "Missing lat or lon parameter", "value" => 14]]);
    exit;
}

$lat = $_GET['lat'];
$lon = $_GET['lon'];
$username = 'divy_solanki'; // Replace with your GeoNames username

// Construct the GeoNames Wikipedia API URL
$url = "http://api.geonames.org/findNearbyWikipediaJSON?lat={$lat}&lng={$lon}&username={$username}&radius=10&maxRows=5";

// Initialize cURL session
$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 5); // 5-second timeout to prevent long hangs

$response = curl_exec($ch);

// Handle timeout or cURL error
if (curl_errno($ch)) {
    echo json_encode([
        "status" => [
            "message" => "GeoNames API timeout or error: " . curl_error($ch),
            "value" => 13
        ]
    ]);
    curl_close($ch);
    exit;
}

curl_close($ch);
echo $response;
?>
