<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, DELETE, PUT, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once '../config/db.php';
include_once '../models/Cart.php';

$cart = new Cart($conn);

$action = isset($_GET['action']) ? $_GET['action'] : '';

if ($_SERVER['REQUEST_METHOD'] === 'GET' && $action === 'get') {
    $buyer_id = isset($_GET['buyer_id']) ? intval($_GET['buyer_id']) : 0;
    
    if ($buyer_id > 0) {
        $stmt = $cart->getItems($buyer_id);
        $items = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $items[] = [
                'cart_id' => $row['cart_id'],
                'product_id' => $row['product_id'],
                'title' => $row['title'],
                'price' => $row['price'],
                'quantity' => $row['quantity'],
                'stock_quantity' => $row['stock_quantity'],
                'image_url' => $row['image_url']
            ];
        }
        http_response_code(200);
        echo json_encode($items);
    } else {
        http_response_code(400);
        echo json_encode(["message" => "Missing buyer_id parameter."]);
    }

} elseif ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'add') {
    $data = json_decode(file_get_contents("php://input"));
    
    if (!empty($data->buyer_id) && !empty($data->product_id)) {
        $cart->buyer_id = $data->buyer_id;
        $cart->product_id = $data->product_id;
        $cart->quantity = $data->quantity ?? 1;

        if ($cart->addItem()) {
            http_response_code(201);
            echo json_encode(["message" => "Item added to cart."]);
        } else {
            http_response_code(503);
            echo json_encode(["message" => "Unable to add item to cart."]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["message" => "Incomplete data."]);
    }

} elseif ($_SERVER['REQUEST_METHOD'] === 'PUT' && $action === 'update') {
    $data = json_decode(file_get_contents("php://input"));
    
    if (!empty($data->buyer_id) && !empty($data->cart_id) && isset($data->quantity)) {
        $cart->buyer_id = $data->buyer_id;
        if ($cart->updateQuantity($data->cart_id, $data->quantity)) {
            http_response_code(200);
            echo json_encode(["message" => "Quantity updated."]);
        } else {
            http_response_code(503);
            echo json_encode(["message" => "Unable to update quantity."]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["message" => "Incomplete data."]);
    }

} elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE' && $action === 'remove') {
    $data = json_decode(file_get_contents("php://input"));
    
    if (!empty($data->buyer_id) && !empty($data->cart_id)) {
        $cart->buyer_id = $data->buyer_id;
        if ($cart->removeItem($data->cart_id)) {
            http_response_code(200);
            echo json_encode(["message" => "Item removed from cart."]);
        } else {
            http_response_code(503);
            echo json_encode(["message" => "Unable to remove item."]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["message" => "Incomplete data."]);
    }
} else {
    http_response_code(400);
    echo json_encode(["message" => "Invalid action or method."]);
}
?>
