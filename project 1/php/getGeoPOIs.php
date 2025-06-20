<?php
header('Content-Type: application/json');
$country = strtoupper($_GET['country'] ?? '');
$username = 'Divy_Solanki'; // Replace with your username
$url = "http://api.geonames.org/searchJSON?country={$country}&featureClass=P&maxRows=10&username={$username}";
echo file_get_contents($url);
