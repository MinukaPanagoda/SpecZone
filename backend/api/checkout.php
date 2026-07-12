<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once '../config/db.php';
include_once '../models/Order.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"));
    
    if (!empty($data->buyer_id)) {
        $order = new Order($conn);
        $order->buyer_id = $data->buyer_id;

        $result = $order->placeOrder();

        if (is_numeric($result) && $result > 0) {
            http_response_code(201);
            echo json_encode(["status" => "success", "message" => "Order placed successfully.", "order_id" => $result]);
        } elseif (is_string($result) && strpos($result, 'INSUFFICIENT_STOCK') !== false) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Insufficient stock for one or more items."]);
        } else {
            http_response_code(503);
            echo json_encode(["status" => "error", "message" => "Unable to place order. Cart might be empty."]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Missing buyer_id."]);
    }
} else {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Invalid method."]);
}
?>
