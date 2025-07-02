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

    // First check if department already exists in this location
    $checkQuery = $conn->prepare('SELECT COUNT(*) as count FROM department WHERE name = ? AND locationID = ?');

    $checkQuery->bind_param("si", $_POST['name'], $_POST['locationID']);

    $checkQuery->execute();
    
    $result = $checkQuery->get_result();

    $departmentExists = $result->fetch_assoc()['count'] > 0;
    
    if ($departmentExists) {
        $output['status']['code'] = "409"; // Conflict status code
        $output['status']['name'] = "failure";
        $output['status']['description'] = "Department already exists in this location";
        $output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
        $output['data'] = [];
        
        mysqli_close($conn);
        echo json_encode($output);
        exit;
    }

    // Department doesn't exist, proceed with insert
    $query = $conn->prepare('INSERT INTO department (name, locationID) VALUES(?,?)');

    $query->bind_param("si", $_POST['name'], $_POST['locationID']);
    
    $query->execute();
    
    if (false === $query) {
        $output['status']['code'] = "400";
        $output['status']['name'] = "executed";
        $output['status']['description'] = "query failed";	
        $output['data'] = [];
        
        mysqli_close($conn);
        echo json_encode($output); 
        exit;
    }

    $output['status']['code'] = "200";
    $output['status']['name'] = "ok";
    $output['status']['description'] = "success";
    $output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
    $output['data'] = [];
    
    mysqli_close($conn);
    echo json_encode($output); 
    
?>