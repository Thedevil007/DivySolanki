<?php
header("Content-Type: application/json");

$file = __DIR__ . '/../countryBorders.geo.json';

if (!file_exists($file)) {
    echo json_encode(["error" => "GeoJSON not found"]);
    exit;
}

$geo = json_decode(file_get_contents($file), true);

if (!$geo || !isset($geo['features'])) {
    echo json_encode(["error" => "Invalid GeoJSON"]);
    exit;
}

$result = [];
foreach ($geo['features'] as $feature) {
    $props = $feature['properties'];
    $name = $props['name'] ?? $props['ADMIN'] ?? '';
    $iso2 = $props['iso_a2'] ?? $props['ISO_A2'] ?? '';
    $currency = $props['currency'] ?? '';

    if ($name && $iso2) {
        $result[] = ["name" => $name, "iso" => $iso2, "currency" => $currency];
    }
}

echo json_encode($result);
