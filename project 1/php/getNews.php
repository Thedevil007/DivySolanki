<?php
header('Content-Type: application/json');
ini_set('display_errors', 1);
error_reporting(E_ALL);

$code = $_GET['code'] ?? null;

if (!$code) {
    echo json_encode(["error" => "Missing country code"]);
    exit;
}

$file = __DIR__ . "/../countryBorders.geo.json";

if (!file_exists($file)) {
    echo json_encode(["error" => "GeoJSON file not found"]);
    exit;
}

$data = json_decode(file_get_contents($file), true);

if (!$data || !isset($data['features'])) {
    echo json_encode(["error" => "Invalid GeoJSON structure"]);
    exit;
}

foreach ($data['features'] as $feature) {
    if (
        isset($feature['properties']['iso_a2']) &&
        $feature['properties']['iso_a2'] === $code
    ) {
        echo json_encode($feature);
        exit;
    }
}

// No match found
echo json_encode(['error' => 'Country not found']);
?>
