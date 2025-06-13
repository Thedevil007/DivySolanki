<?php
header('Content-Type: application/json');
$symbols = $_GET['symbols']; // e.g., EUR, GBP
$appId = '6b9aad63ccdf45888e008d6b020ed2e7'; // Replace with your API key

$url = "https://openexchangerates.org/api/latest.json?app_id={$appId}&symbols={$symbols}";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
curl_close($ch);

echo $response;
?>
