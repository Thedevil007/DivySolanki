<?php
header("Content-Type: application/json");

$apiKey = '63a4b139b2b8c8c296b7b0dc1c7ba461'; 
$country = strtolower($_GET['country'] ?? 'us');

$url = "https://gnews.io/api/v4/top-headlines?token=$apiKey&lang=en&country=$country&max=10";

$response = @file_get_contents($url);
if (!$response) {
    echo json_encode(["error" => "News fetch failed"]);
    exit;
}

$data = json_decode($response, true);

// Optional filter to exclude articles with no image
$data['articles'] = array_filter($data['articles'], function($article) {
    return !empty($article['image']);
});

echo json_encode($data);
