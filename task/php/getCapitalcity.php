<?php
header('Content-Type: application/json');

$country = $_GET['country'] ?? '';
$username = "divy_solanki"; // Your GeoNames username

$url = "http://api.geonames.org/countryInfoJSON?country=$country&username=$username";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
curl_close($ch);

$data = json_decode($response, true);

if (!empty($data['geonames']) && isset($data['geonames'][0]['capital'])) {
    echo json_encode([
        'status' => 'ok',
        'capital' => $data['geonames'][0]['capital']
    ]);
} else {
    echo json_encode([
        'status' => 'error',
        'message' => 'No capital found or unexpected response.'
    ]);
}
?>
