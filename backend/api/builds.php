<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once '../config/db.php';
include_once '../models/Build.php';

$build = new Build($conn);

$action = isset($_GET['action']) ? $_GET['action'] : '';

// 1. Fetch user's builds
if ($action === 'read' && $_SERVER['REQUEST_METHOD'] === 'GET') {
    $buyer_id = isset($_GET['buyer_id']) ? intval($_GET['buyer_id']) : 0;

    if ($buyer_id > 0) {
        $builds = $build->getBuilds($buyer_id);
        http_response_code(200);
        echo json_encode($builds);
    } else {
        http_response_code(400);
        echo json_encode(array("message" => "Missing or invalid buyer_id."));
    }
}

// 2. Create new saved build
else if ($action === 'create' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"));

    if (!empty($data->buyer_id) && !empty($data->product_ids) && is_array($data->product_ids)) {
        $build_name = !empty($data->build_name) ? trim($data->build_name) : "Custom PC Build - " . date("M j, Y");
        $result = $build->createBuild(intval($data->buyer_id), $build_name, $data->product_ids);

        if ($result) {
            http_response_code(201);
            echo json_encode(array(
                "status" => "success",
                "message" => "Build saved successfully.",
                "build_id" => $result
            ));
        } else {
            http_response_code(503);
            echo json_encode(array("status" => "error", "message" => "Unable to save build."));
        }
    } else {
        http_response_code(400);
        echo json_encode(array("status" => "error", "message" => "Incomplete data. Select at least one part."));
    }
}

// 3. Delete a saved build
else if ($action === 'delete' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"));

    if (!empty($data->buyer_id) && !empty($data->build_id)) {
        if ($build->deleteBuild(intval($data->buyer_id), intval($data->build_id))) {
            http_response_code(200);
            echo json_encode(array("status" => "success", "message" => "Build deleted successfully."));
        } else {
            http_response_code(503);
            echo json_encode(array("status" => "error", "message" => "Unable to delete build."));
        }
    } else {
        http_response_code(400);
        echo json_encode(array("status" => "error", "message" => "Incomplete data."));
    }
}

else {
    http_response_code(404);
    echo json_encode(array("message" => "Action not found."));
}
?>
