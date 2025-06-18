<?php
header("Content-Type: application/json");

$symbols = strtoupper(trim($_GET['symbols'] ?? 'USD'));
$url = "https://open.er-api.com/v6/latest/USD";
$response = @file_get_contents($url);

if ($response) {
  $data = json_decode($response, true);
  $rate = $data['result']==="success" && isset($data['rates'][$symbols]) 
          ? $data['rates'][$symbols] : null;

  echo json_encode(["base" => "USD", "symbol" => $symbols, "rate" => $rate]);
} else {
  echo json_encode(["error" => "API request failed"]);
}
