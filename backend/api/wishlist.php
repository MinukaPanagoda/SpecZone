<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once '../config/db.php';
include_once '../models/Wishlist.php';

$wishlist = new Wishlist($conn);
$action = isset($_GET['action']) ? $_GET['action'] : '';

// 1. GET ALL WISHLIST ITEMS FOR BUYER
if ($_SERVER['REQUEST_METHOD'] === 'GET' && $action === 'get') {
    $buyer_id = isset($_GET['buyer_id']) ? intval($_GET['buyer_id']) : 0;

    if ($buyer_id > 0) {
        $stmt = $wishlist->getItems($buyer_id);
        $items = [];

        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $items[] = [
                'wishlist_id' => $row['wishlist_id'],
                'product_id' => $row['product_id'],
                'title' => $row['title'],
                'price' => $row['price'],
                'stock' => $row['stock_quantity'],
                'category_id' => $row['category_id'],
                'category_name' => $row['category_name'],
                'image_url' => $row['image_url'],
                'avg_rating' => (float)$row['avg_rating'],
                'review_count' => (int)$row['review_count']
            ];
        }

        http_response_code(200);
        echo json_encode($items);
    } else {
        http_response_code(400);
        echo json_encode(["message" => "Missing buyer_id parameter."]);
    }

// 2. ADD ITEM TO WISHLIST
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'add') {
    $data = json_decode(file_get_contents("php://input"));
    $buyer_id = intval($data->buyer_id ?? $_POST['buyer_id'] ?? 0);
    $product_id = intval($data->product_id ?? $_POST['product_id'] ?? 0);

    if ($buyer_id > 0 && $product_id > 0) {
        if ($wishlist->addItem($buyer_id, $product_id)) {
            http_response_code(201);
            echo json_encode(["status" => "success", "message" => "Product added to wishlist."]);
        } else {
            http_response_code(503);
            echo json_encode(["status" => "error", "message" => "Unable to add product to wishlist."]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Incomplete data. Provide buyer_id and product_id."]);
    }

// 3. REMOVE ITEM FROM WISHLIST
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'remove') {
    $data = json_decode(file_get_contents("php://input"));
    $buyer_id = intval($data->buyer_id ?? $_POST['buyer_id'] ?? 0);
    $product_id = intval($data->product_id ?? $_POST['product_id'] ?? 0);

    if ($buyer_id > 0 && $product_id > 0) {
        if ($wishlist->removeItem($buyer_id, $product_id)) {
            http_response_code(200);
            echo json_encode(["status" => "success", "message" => "Product removed from wishlist."]);
        } else {
            http_response_code(503);
            echo json_encode(["status" => "error", "message" => "Unable to remove product from wishlist."]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Incomplete data. Provide buyer_id and product_id."]);
    }

// 4. TOGGLE WISHLIST ITEM
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'toggle') {
    $data = json_decode(file_get_contents("php://input"));
    $buyer_id = intval($data->buyer_id ?? $_POST['buyer_id'] ?? 0);
    $product_id = intval($data->product_id ?? $_POST['product_id'] ?? 0);

    if ($buyer_id > 0 && $product_id > 0) {
        $result = $wishlist->toggleItem($buyer_id, $product_id);
        http_response_code(200);
        echo json_encode([
            "status" => "success",
            "action" => $result,
            "message" => $result === 'added' ? "Added to wishlist" : "Removed from wishlist"
        ]);
    } else {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Incomplete data. Provide buyer_id and product_id."]);
    }

} else {
    http_response_code(400);
    echo json_encode(["message" => "Invalid action or request method."]);
}
?>
