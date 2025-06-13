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
        isset($feature['properties']['ISO3166-1-Alpha-2']) &&
        $feature['properties']['ISO3166-1-Alpha-2'] === $code
    ) {
        echo json_encode($feature);
        exit;
    }
}

echo json_encode(['error' => 'Country not found']);
?>
