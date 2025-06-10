<?php
header('Content-Type: application/json');

$lat = $_GET['lat'] ?? '';
$lng = $_GET['lng'] ?? '';
$username = "divy_solanki"; // Your GeoNames username

if (!$lat || !$lng) {
    echo json_encode(['status' => 'error', 'message' => 'Latitude and longitude required']);
    exit;
}

$url = "http://api.geonames.org/findNearbyPostalCodesJSON?lat=$lat&lng=$lng&username=$username";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
curl_close($ch);

$data = json_decode($response, true);

if (!empty($data['postalCodes'])) {
    $postalCodes = array_column($data['postalCodes'], 'postalCode');
    echo json_encode([
        'status' => 'ok',
        'postalCodes' => $postalCodes
    ]);
} else {
    echo json_encode([
        'status' => 'error',
        'message' => 'No postal codes found or unexpected response.'
    ]);
}
?>
