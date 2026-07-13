<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once '../config/db.php';
include_once '../models/Review.php';

$review = new Review($conn);
$action = isset($_GET['action']) ? $_GET['action'] : '';

if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'create') {
    $data = json_decode(file_get_contents("php://input"));

    if (
        !empty($data->product_id) &&
        !empty($data->buyer_id) &&
        isset($data->rating) &&
        !empty($data->comment)
    ) {
        $review->product_id = $data->product_id;
        $review->buyer_id = $data->buyer_id;
        $review->rating = $data->rating;
        $review->comment = $data->comment;

        if ($review->create()) {
            http_response_code(201);
            echo json_encode(array("message" => "Review added successfully."));
        } else {
            http_response_code(503);
            echo json_encode(array("message" => "Unable to add review."));
        }
    } else {
        http_response_code(400);
        echo json_encode(array("message" => "Incomplete data."));
    }
} else if ($_SERVER['REQUEST_METHOD'] === 'GET' && $action === 'read') {
    $product_id = isset($_GET['product_id']) ? intval($_GET['product_id']) : 0;
    
    if ($product_id > 0) {
        $stmt = $review->readByProduct($product_id);
        $num = $stmt->rowCount();
        
        $reviews_arr = array();
        
        if ($num > 0) {
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $review_item = array(
                    "id" => $row['id'],
                    "buyer_name" => $row['first_name'] . " " . $row['last_name'],
                    "rating" => $row['rating'],
                    "comment" => html_entity_decode($row['comment']),
                    "created_at" => $row['created_at']
                );
                array_push($reviews_arr, $review_item);
            }
        }
        http_response_code(200);
        echo json_encode($reviews_arr);
    } else {
        http_response_code(400);
        echo json_encode(array("message" => "Missing product_id."));
    }
} else {
    http_response_code(404);
    echo json_encode(array("message" => "Action not found."));
}
?>
