<?php
header('Content-Type: application/json');
ini_set('display_errors', 1); error_reporting(E_ALL); // Show errors in response for debugging

$dataPath = '../countryBorders.geo.json'; // Path to your GeoJSON file

if (!file_exists($dataPath)) {
  echo json_encode(['error' => 'GeoJSON file not found']);
  exit;
}

$json = file_get_contents($dataPath);
$data = json_decode($json, true);

if (!$data || !isset($data['features'])) {
  echo json_encode(['error' => 'Invalid or corrupt GeoJSON data']);
  exit;
}

$list = [];
foreach ($data['features'] as $f) {
  $list[] = [
    'iso' => $f['properties']['iso_a2'],
    'name' => $f['properties']['name']
  ];
}

echo json_encode($list);
?>
