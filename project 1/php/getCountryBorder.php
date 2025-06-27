<?php
header("Content-Type: application/json");

if (!isset($_GET['code'])) {
  echo json_encode(["error" => "No country code provided"]);
  exit;
}

$code = strtoupper($_GET['code']);
$filePath = __DIR__ . '/../countryBorders.geo.json'; // ← important: one level up from /php

if (!file_exists($filePath)) {
  echo json_encode(["error" => "GeoJSON file not found"]);
  exit;
}

$geojson = json_decode(file_get_contents($filePath), true);
if (!$geojson || !isset($geojson['features'])) {
  echo json_encode(["error" => "Invalid GeoJSON format"]);
  exit;
}

foreach ($geojson['features'] as $feature) {
  if (
    isset($feature['properties']['iso_a2']) &&
    strtoupper($feature['properties']['iso_a2']) === $code
  ) {
    echo json_encode($feature);
    exit;
  }
}

echo json_encode(["error" => "Country code not found"]);
