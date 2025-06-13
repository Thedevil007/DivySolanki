<?php
header('Content-Type: application/json');
$data = json_decode(file_get_contents('../countryBorders.geo.json'), true);
$list = [];
foreach ($data['features'] as $f) {
  $list[] = ['iso' => $f['properties']['iso_a2'], 'name' => $f['properties']['name']];
}
echo json_encode($list);
?>
