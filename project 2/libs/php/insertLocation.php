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

    // First check if location already exists
    $checkQuery = $conn->prepare('SELECT COUNT(*) as count FROM location WHERE name = ?');
    $checkQuery->bind_param("s", $_POST['name']);
    $checkQuery->execute();

    $result = $checkQuery->get_result();
    $locationExists = $result->fetch_assoc()['count'] > 0;

    if ($locationExists) {
        $output['status']['code'] = "409"; // Conflict status code
        $output['status']['name'] = "failure";
        $output['status']['description'] = "Location already exists";
        $output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
        $output['data'] = [];
        
        mysqli_close($conn);
        echo json_encode($output);
        exit;
    }

    // Location doesn't exist, proceed with insert
    $query = $conn->prepare('INSERT INTO location (name) VALUES (?)');
    $query->bind_param("s", $_POST['name']);
    $result = $query->execute();

    if (!$result) {
        $output['status']['code'] = "400";
        $output['status']['name'] = "executed";
        $output['status']['description'] = "query failed: " . $conn->error;  
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
