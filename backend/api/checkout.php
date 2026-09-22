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

function saveSlipImage($base64Data, $buyerId) {
    if (empty($base64Data)) return null;
    
    // If it's already an http url
    if (strpos($base64Data, 'http://') === 0 || strpos($base64Data, 'https://') === 0) {
        return $base64Data;
    }
    
    // Process base64 data URL
    if (preg_match('/^data:image\/(\w+);base64,/', $base64Data, $type)) {
        $raw = substr($base64Data, strpos($base64Data, ',') + 1);
        $ext = strtolower($type[1]);
        if ($ext === 'jpeg') $ext = 'jpg';
        
        $decoded = base64_decode($raw);
        if ($decoded === false) {
            return null;
        }
    } else {
        return null;
    }
    
    $uploadDir = __DIR__ . '/../uploads/slips/';
    if (!file_exists($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }
    
    $fileName = 'slip_' . intval($buyerId) . '_' . time() . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
    $filePath = $uploadDir . $fileName;
    
    if (file_put_contents($filePath, $decoded)) {
        return 'http://localhost/SpecZone/backend/uploads/slips/' . $fileName;
    }
    return null;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"));
    
    if (!empty($data->buyer_id)) {
        $order = new Order($conn);
        $order->buyer_id = $data->buyer_id;
        $order->payment_method = !empty($data->payment_method) ? $data->payment_method : 'cod';

        if ($order->payment_method === 'bank_transfer' && !empty($data->slip_image)) {
            $order->payment_slip_url = saveSlipImage($data->slip_image, $data->buyer_id);
        }

        $result = $order->placeOrder();

        if (is_numeric($result) && $result > 0) {
            http_response_code(201);
            echo json_encode([
                "status" => "success", 
                "message" => "Order placed successfully.", 
                "order_id" => $result,
                "payment_method" => $order->payment_method,
                "payment_slip_url" => $order->payment_slip_url
            ]);
        } elseif (is_string($result) && strpos($result, 'INSUFFICIENT_STOCK_') !== false) {
            $product_name = str_replace('INSUFFICIENT_STOCK_', '', $result);
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Insufficient stock for '$product_name'. Please remove it from your cart or reduce quantity."]);
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
