<?php
// getCurrencyList.php

header("Content-Type: application/json");

$currencies = [
  ["code" => "USD", "name" => "US Dollar"],
  ["code" => "EUR", "name" => "Euro"],
  ["code" => "GBP", "name" => "British Pound"],
  ["code" => "INR", "name" => "Indian Rupee"],
  ["code" => "JPY", "name" => "Japanese Yen"],
  ["code" => "AUD", "name" => "Australian Dollar"],
  ["code" => "CAD", "name" => "Canadian Dollar"],
  ["code" => "CNY", "name" => "Chinese Yuan"],
  ["code" => "CHF", "name" => "Swiss Franc"],
  ["code" => "ZAR", "name" => "South African Rand"],
  ["code" => "BRL", "name" => "Brazilian Real"],
  ["code" => "MXN", "name" => "Mexican Peso"],
  ["code" => "SEK", "name" => "Swedish Krona"],
  ["code" => "NZD", "name" => "New Zealand Dollar"]
];

echo json_encode($currencies);
