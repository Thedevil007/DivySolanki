<?php
header('Content-Type: application/json');

if (!isset($_GET['code'])) {
  echo json_encode(['error' => 'Missing country code']);
  exit;
}

$code = strtoupper($_GET['code']);
$username = 'divy_solanki'; // 🔁 CHANGE THIS

$url = "http://api.geonames.org/countryInfoJSON?country=$code&username=$username";

$response = file_get_contents($url);
echo $response;
