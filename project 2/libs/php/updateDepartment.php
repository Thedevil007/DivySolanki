<?php
include("config.php");
header('Content-Type: application/json');

$id = $_POST['id'];
$name = $_POST['name'];
$locationID = $_POST['locationID'];

$query = $conn->prepare("UPDATE department SET name=?, locationID=? WHERE id=?");
$query->bind_param("sii", $name, $locationID, $id);
$query->execute();

echo json_encode(["status" => "success"]);
$conn->close();
?>