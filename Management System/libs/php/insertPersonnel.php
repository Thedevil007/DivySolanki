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

    // First check if personnel email already exists
    $checkQuery = $conn->prepare('SELECT COUNT(*) as count FROM personnel WHERE email = ?');

    $checkQuery->bind_param("s", $_POST['email']);

    $checkQuery->execute();

    $result = $checkQuery->get_result();

    $personnelExists = $result->fetch_assoc()['count'] > 0;

    if ($personnelExists) {
        $output['status']['code'] = "409"; // Conflict status code
        $output['status']['name'] = "failure";
        $output['status']['description'] = "already exists in the database.";
        $output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
        $output['data'] = [];
        
        mysqli_close($conn);
        echo json_encode($output);
        exit;
    }

    // email doesn't exist, proceed with insert
    $query = $conn->prepare('INSERT INTO personnel (firstName, lastName, jobTitle, email, departmentID) VALUES(?,?,?,?,?)');

    $query->bind_param("ssssi", $_POST['firstName'], $_POST['lastName'], $_POST['jobTitle'], $_POST['email'], $_POST['departmentID']);

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
    $output['status']['description'] = "Personnel added";
    $output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
    $output['data'] = [];

    mysqli_close($conn);
    echo json_encode($output);

?>  