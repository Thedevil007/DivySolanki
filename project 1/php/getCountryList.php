<?php
header("Content-Type: application/json");
ini_set("display_errors", 0); error_reporting(E_ALL);

$dataPath = __DIR__ . "/../countryBorders.geo.json"; // Path to your GeoJSON file

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
  $list[] = [	    'iso' => $f['properties']['ISO3166-1-Alpha-2'],
    'name' => $f['properties']['name']
  ];
}

echo json_encode($list);
?>



