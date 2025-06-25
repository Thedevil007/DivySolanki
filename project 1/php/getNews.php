<?php
header("Content-Type: application/json");

$apiKey = '63a4b139b2b8c8c296b7b0dc1c7ba461';
$country = strtolower($_GET['country'] ?? 'us');

// GNews supported: us, in, ar, gb, etc.
$url = "https://gnews.io/api/v4/top-headlines?token=$apiKey&lang=en&country=$country&max=10";

$response = @file_get_contents($url);
echo $response ?: json_encode(["error" => "News fetch failed"]);
