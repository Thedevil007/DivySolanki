<?php
header("Content-Type: application/json");

$amount = floatval($_POST['amount'] ?? 1);
$from   = strtoupper(trim($_POST['from'] ?? 'USD'));
$to     = strtoupper(trim($_POST['to'] ?? 'USD'));

if (!$amount || !$from || !$to) {
  echo json_encode(["error" => "Invalid input"]);
  exit;
}

$url = "https://open.er-api.com/v6/latest/$from";
$response = @file_get_contents($url);

if ($response) {
  $data = json_decode($response, true);
  if ($data['result'] === "success" && isset($data['rates'][$to])) {
    $rate = $data['rates'][$to];
    $converted = round($amount * $rate, 4);
    echo json_encode(["result" => $converted, "rate" => $rate]);
  } else {
    echo json_encode(["error" => "Conversion failed or unsupported currency"]);
  }
} else {
  echo json_encode(["error" => "API request failed"]);
}
