<?php
header('Content-Type: application/json');
$code = $_GET['code'];
$username = 'divy_solanki';

$url = "http://api.geonames.org/searchJSON?country={$code}&featureClass=P&maxRows=50&username={$username}";
echo file_get_contents($url);
?>
