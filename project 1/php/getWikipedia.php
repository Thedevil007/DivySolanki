<?php
header('Content-Type: application/json');
$lat = $_GET['lat'];
$lon = $_GET['lon'];
$username = 'divy_solanki'; // Replace with your username

$url = "http://api.geonames.org/findNearbyWikipediaJSON?lat={$lat}&lng={$lon}&username={$username}&radius=20&maxRows=5";

$response = file_get_contents($url);
echo $response;
?>
