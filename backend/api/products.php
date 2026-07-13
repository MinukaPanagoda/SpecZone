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
include_once '../models/Product.php';

$product = new Product($conn);

$action = isset($_GET['action']) ? $_GET['action'] : '';

if ($action === 'create' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"));

    if (
        !empty($data->seller_id) &&
        !empty($data->category_id) &&
        !empty($data->name) &&
        !empty($data->price)
    ) {
        $product->seller_id = $data->seller_id;
        $product->category_id = $data->category_id;
        $product->title = $data->name;
        $product->description = $data->description ?? "";
        $product->price = $data->price;
        $product->stock_quantity = $data->stock ?? 0;
        $product->image_url = $data->image_url ?? "";
        
        // Ensure specs is a JSON string
        $specs = $data->specs ?? "{}";
        if (is_object($specs) || is_array($specs)) {
            $specs = json_encode($specs);
        }
        $product->specifications = $specs;

        if ($product->create()) {
            http_response_code(201);
            echo json_encode(array("message" => "Product was created successfully."));
        } else {
            http_response_code(503);
            echo json_encode(array("message" => "Unable to create product."));
        }
    } else {
        http_response_code(400);
        echo json_encode(array("message" => "Unable to create product. Data is incomplete."));
    }
} else if ($action === 'read' && $_SERVER['REQUEST_METHOD'] === 'GET') {
    if (isset($_GET['seller_id'])) {
        $product->seller_id = intval($_GET['seller_id']);
    }

    $stmt = $product->read();
    $num = $stmt->rowCount();

    if ($num > 0) {
        $products_arr = array();
        
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            extract($row);
            
            $product_item = array(
                "id" => $id,
                "seller_id" => $seller_id,
                "seller_name" => $seller_name,
                "category_id" => $category_id,
                "category_name" => $category_name,
                "name" => $title,
                "description" => html_entity_decode($description ?? ""),
                "price" => $price,
                "stock" => $stock_quantity,
                "image_url" => $image_url,
                "specs" => json_decode($specifications ?? "{}"),
                "created_at" => $created_at
            );
            
            array_push($products_arr, $product_item);
        }

        http_response_code(200);
        echo json_encode($products_arr);
    } else {
        http_response_code(200);
        echo json_encode(array()); // Return empty array if no products
    }
} else if ($action === 'read_single' && $_SERVER['REQUEST_METHOD'] === 'GET') {
    $product->id = isset($_GET['id']) ? intval($_GET['id']) : 0;
    
    $row = $product->readSingle();
    
    if ($row) {
        $product_item = array(
            "id" => $row['id'],
            "seller_id" => $row['seller_id'],
            "seller_name" => $row['seller_name'],
            "category_id" => $row['category_id'],
            "category_name" => $row['category_name'],
            "name" => $row['title'],
            "description" => html_entity_decode($row['description'] ?? ""),
            "price" => $row['price'],
            "stock" => $row['stock_quantity'],
            "image_url" => $row['image_url'],
            "specs" => json_decode($row['specifications'] ?? "{}"),
            "created_at" => $row['created_at']
        );
        http_response_code(200);
        echo json_encode($product_item);
    } else {
        http_response_code(404);
        echo json_encode(array("message" => "Product not found."));
    }
} else {
    http_response_code(404);
    echo json_encode(array("message" => "Action not found."));
}
?>
