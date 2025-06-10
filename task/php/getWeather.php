<?php
header('Content-Type: application/json');

$postal = $_GET['postal'] ?? '';
$country = $_GET['country'] ?? '';
$username = "divy_solanki"; // Your GeoNames username

if (!$postal || !$country) {
    echo json_encode(['status' => 'error', 'message' => 'Postal code and country required']);
    exit;
}

$url = "http://api.geonames.org/weatherJSON?postalcode=$postal&country=$country&username=$username";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
curl_close($ch);

$data = json_decode($response, true);

if (!empty($data['weatherObservation'])) {
    $weather = $data['weatherObservation'];
    echo json_encode([
        'status' => 'ok',
        'city' => $weather['stationName'] ?? 'Unknown',
        'weatherDesc' => $weather['weatherCondition'] ?? 'N/A',
        'temp' => $weather['temperature'] ?? 'N/A'
    ]);
} else {
    echo json_encode([
        'status' => 'error',
        'message' => 'No weather data found or unexpected response.'
    ]);
}
?>
