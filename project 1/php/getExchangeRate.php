
<?php
header('Content-Type: application/json');
$symbols = $_GET['symbols'];
$appId = '6b9aad63ccdf45888e008d6b020ed2e7'; // Replace with your Open Exchange Rates key
$url = "https://openexchangerates.org/api/latest.json?app_id={$appId}&symbols={$symbols}";
echo file_get_contents($url);
?>
