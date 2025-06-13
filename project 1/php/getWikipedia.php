<?php
header('Content-Type: application/json');
$lat = $_GET['lat'];
$lng = $_GET['lng'];
$username = 'divy_solanki'; // Replace with your username
$url = "http://api.geonames.org/findNearbyWikipediaJSON?lat={$lat}&lng={$lng}&username={$username}&radius=20&maxRows=10";
echo file_get_contents($url);
?>
