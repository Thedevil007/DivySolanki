<?php
// Show errors for debugging (disable in production)
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Set response header to JSON
header('Content-Type: application/json');

try {
    $filePath = '../countryBorders.geo.json';  // correct path from php/ to root

    if (!file_exists($filePath)) {
        throw new Exception("GeoJSON file not found at $filePath");
    }

    $jsonData = file_get_contents($filePath);
    $geoData = json_decode($jsonData, true);

    if (!isset($geoData['features'])) {
        throw new Exception("Invalid GeoJSON format: 'features' key missing");
    }

    $countries = [];

    foreach ($geoData['features'] as $feature) {
        $props = $feature['properties'];
        if (!empty($props['name']) && !empty($props['iso_a2'])) {
            $countries[] = [
                'name' => $props['name'],
                'iso_a2' => $props['iso_a2']
            ];
        }
    }

    echo json_encode($countries);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
