<?php
header("Content-Type: application/json");

$country = $_GET['code'] ?? 'GB';
$username = 'divy_solanki'; // Replace with your GeoNames username

// STEP 1: Get country info (includes capital, population, area, etc.)
$infoUrl = "http://api.geonames.org/countryInfoJSON?country=$country&username=$username";
$infoData = json_decode(file_get_contents($infoUrl), true);

if (!isset($infoData['geonames'][0])) {
    echo json_encode(["error" => "Country info not found"]);
    exit;
}

$info = $infoData['geonames'][0];
$capital = $info['capital'] ?? '';
$countryName = $info['countryName'] ?? '';
$continent = $info['continentName'] ?? '';
$languages = $info['languages'] ?? '';
$currencyCode = $info['currencyCode'] ?? '';
$isoAlpha3 = $info['isoAlpha3'] ?? '';
$population = $info['population'] ?? 0;
$areaInSqKm = $info['areaInSqKm'] ?? 0;

// STEP 2: Get capital coordinates
$lat = $lng = null;
if ($capital) {
    $searchUrl = "http://api.geonames.org/searchJSON?q=" . urlencode($capital) . "&country=$country&maxRows=1&username=$username";
    $searchData = json_decode(file_get_contents($searchUrl), true);
    if (isset($searchData['geonames'][0])) {
        $lat = $searchData['geonames'][0]['lat'] ?? null;
        $lng = $searchData['geonames'][0]['lng'] ?? null;
    }
}

// FINAL combined response
echo json_encode([
    "geonames" => [[
        "capital"        => $capital,
        "countryCode"    => $country,
        "countryName"    => $countryName,
        "continentName"  => $continent,
        "languages"      => $languages,
        "currencyCode"   => $currencyCode,
        "isoAlpha3"      => $isoAlpha3,
        "population"     => $population,
        "areaInSqKm"     => $areaInSqKm,
        "lat"            => $lat,
        "lng"            => $lng
    ]]
]);
