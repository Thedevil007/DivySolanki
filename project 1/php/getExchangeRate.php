<?php
header('Content-Type: application/json');

// Replace this with your actual API key
$apiKey = 'ca6358a5ec3ecd544409f760';
$url = "https://v6.exchangerate-api.com/v6/$apiKey/latest/USD";

// Use cURL to fetch the data
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

if ($response === false || $httpCode !== 200) {
    echo json_encode([
        "error" => "Failed to retrieve exchange rates",
        "details" => $curlError ?: "HTTP status $httpCode"
    ]);
    exit;
}

$data = json_decode($response, true);
if (!isset($data["conversion_rates"]) || !is_array($data["conversion_rates"])) {
    echo json_encode(["error" => "Invalid API response"]);
    exit;
}

// Return the conversion rates in expected format
echo json_encode(["rates" => $data["conversion_rates"]]);
