<?php
header('Content-Type: application/json');

// Step 1: Get country code and set username
$country = $_GET['country'] ?? '';
$username = "Divy_Solanki"; // 🔁 Replace this with your actual GeoNames username

// Step 2: Build the API URL
$url = "http://api.geonames.org/countryInfoJSON?country=$country&username=$username";

// Step 3: Set up and execute cURL
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
curl_close($ch);

// Step 4: Decode response
$data = json_decode($response, true);

// Step 5: Extract capital safely
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
