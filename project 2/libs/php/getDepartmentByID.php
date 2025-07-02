<?php

	$executionStartTime = microtime(true);

	include("config.php");

	header('Content-Type: application/json; charset=UTF-8');

	$conn = new mysqli($cd_host, $cd_user, $cd_password, $cd_dbname, $cd_port, $cd_socket);

	if (mysqli_connect_errno()) {
		
		$output['status']['code'] = "300";
		$output['status']['name'] = "failure";
		$output['status']['description'] = "database unavailable";
		$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
		$output['data'] = [];
		
		mysqli_close($conn);

		echo json_encode($output);
		
		exit;

	}	

	// Get department details
	$query = $conn->prepare('
		SELECT d.id, d.name, d.locationID, l.name as locationName, COUNT(p.id) as personnelCount 
		FROM department d
		LEFT JOIN location l ON d.locationID = l.id
		LEFT JOIN personnel p ON p.departmentID = d.id
		WHERE d.id = ?
		GROUP BY d.id, d.name, d.locationID, l.name
	');

	$query->bind_param("i", $_POST['id']);

	$query->execute();
	
	if (false === $query) {

		$output['status']['code'] = "400";
		$output['status']['name'] = "executed";
		$output['status']['description'] = "query failed";	
		$output['data'] = [];

		echo json_encode($output); 
	
		mysqli_close($conn);
		exit;

	}

	$result = $query->get_result();

   	$department = [];

	while ($row = mysqli_fetch_assoc($result)) {

		$department[] = $row;

	}

	// Get all locations for dropdown
	$locationQuery = $conn->prepare('SELECT id, name FROM location ORDER BY name');
	$locationQuery->execute();
	$locationResult = $locationQuery->get_result();
	$locations = [];

	while ($row = mysqli_fetch_assoc($locationResult)) {
		$locations[] = $row;
	}

	$output['status']['code'] = "200";
	$output['status']['name'] = "ok";
	$output['status']['description'] = "success";
	$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
	$output['data'] = array(
		'department' => $department,
		'locations' => $locations
	);

	echo json_encode($output); 

	mysqli_close($conn);

?>