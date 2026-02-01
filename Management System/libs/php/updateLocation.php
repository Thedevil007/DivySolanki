<?php
include("config.php");
header('Content-Type: application/json');

$id = $_POST['id'];
$name = $_POST['name'];

$query = $conn->prepare("UPDATE location SET name=? WHERE id=?");
$query->bind_param("si", $name, $id);
$query->execute();

echo json_encode(["status" => "success"]);
$conn->close();
?>