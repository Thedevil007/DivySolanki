<?php
header('Content-Type: application/json');
$code = $_GET['code'];
$data = json_decode(file_get_contents('../countryBorders.geo.json'), true);

foreach ($data['features'] as $feature) {
  if ($feature['properties']['iso_a2'] === $code) {
    echo json_encode($feature);
    exit;
  }
}

echo json_encode(['error' => 'Country not found']);
?>