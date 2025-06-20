<?php
$code = $_GET['country'] ?? 'GB';
$year = date("Y");

$url = "https://date.nager.at/api/v3/PublicHolidays/$year/$code";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
curl_close($ch);

header('Content-Type: application/json');
echo $response;
