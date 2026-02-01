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

    // SQL that gets all departments and locations for the filter dropdowns
    $query = $conn->prepare('
        SELECT 
            "department" AS type,
            d.id,
            d.name
        FROM department d
        UNION ALL
        SELECT 
            "location" AS type,
            l.id,
            l.name
        FROM location l
        ORDER BY type, name
    ');


    $query->execute();

    $result = $query->get_result();

    $departmentData = [];
    $locationData = [];

    while ($row = $result->fetch_assoc()) {
        if ($row['type'] === 'department') {
            $departmentData[] = [
                'id' => $row['id'], 
                'name' => $row['name']
            ];
        } else {
            $locationData[] = [
                'id' => $row['id'], 
                'name' => $row['name']
            ];
        }
    }

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
    $output['data']['department'] = $departmentData;
    $output['data']['location'] = $locationData;

    mysqli_close($conn);

    echo json_encode($output);

?>
