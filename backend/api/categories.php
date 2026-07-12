<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once '../config/db.php';
include_once '../models/Category.php';

$category = new Category($conn);

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $category->read();
    $num = $stmt->rowCount();

    if ($num > 0) {
        $categories_arr = array();
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            extract($row);
            $category_item = array(
                "id" => $id,
                "name" => $name
            );
            array_push($categories_arr, $category_item);
        }
        http_response_code(200);
        echo json_encode($categories_arr);
    } else {
        http_response_code(200);
        echo json_encode(array());
    }
} else {
    http_response_code(404);
    echo json_encode(array("message" => "Action not found."));
}
?>
