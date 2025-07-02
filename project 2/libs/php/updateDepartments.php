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

    // First check if department name already exists for other department records
    $checkQuery = $conn->prepare('SELECT COUNT(*) as count FROM department WHERE name = ? AND id != ?');

    $checkQuery->bind_param("si", $_POST['name'], $_POST['id']);

    $checkQuery->execute();

    $result = $checkQuery->get_result();

    $departmentExists = $result->fetch_assoc()['count'] > 0;

    if ($departmentExists) {
        $output['status']['code'] = "409"; // Conflict status code
        $output['status']['name'] = "failure";
        $output['status']['description'] = "Department with this name already exists";
        $output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
        $output['data'] = [];
        
        mysqli_close($conn);
        echo json_encode($output);
        exit;
    }

    // name doesn't exist, proceed with update
    $query = $conn->prepare('UPDATE department SET name = ?, locationID = ? WHERE id = ?');

    $query->bind_param("sii", $_POST['name'], $_POST['locationID'], $_POST['id']);

    $query->execute();

    if (false === $query) {
        $output['status']['code'] = "400";
        $output['status']['name'] = "failure";
        $output['status']['description'] = "update failed";
        $output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
        $output['data'] = [];
    } else {
        $output['status']['code'] = "200";
        $output['status']['name'] = "ok";
        $output['status']['description'] = "update successful";
        $output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
        $output['data'] = [];
    }

    mysqli_close($conn);

    echo json_encode($output);

?>
