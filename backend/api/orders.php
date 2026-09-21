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

$action = isset($_GET['action']) ? $_GET['action'] : '';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    
    // FETCH ORDERS FOR BUYER
    if ($action === 'read_buyer') {
        $buyer_id = isset($_GET['buyer_id']) ? intval($_GET['buyer_id']) : 0;
        
        if ($buyer_id > 0) {
            // Get all orders for this buyer
            $order_query = "SELECT id, total_amount, created_at FROM orders WHERE buyer_id = :buyer_id ORDER BY created_at DESC";
            $order_stmt = $conn->prepare($order_query);
            $order_stmt->bindParam(':buyer_id', $buyer_id);
            $order_stmt->execute();
            
            $orders = array();
            
            while ($order_row = $order_stmt->fetch(PDO::FETCH_ASSOC)) {
                $order_id = $order_row['id'];
                
                // Get items for this order
                $item_query = "
                    SELECT oi.id as item_id, oi.quantity, oi.unit_price, oi.status, oi.payout_status, oi.payout_date,
                           p.title, p.seller_id,
                           (SELECT image_url FROM product_images WHERE product_id = p.id LIMIT 1) as image_url, 
                           u.first_name as seller_name
                    FROM order_items oi
                    JOIN products p ON oi.product_id = p.id
                    JOIN users u ON p.seller_id = u.id
                    WHERE oi.order_id = :order_id
                ";
                $item_stmt = $conn->prepare($item_query);
                $item_stmt->bindParam(':order_id', $order_id);
                $item_stmt->execute();
                
                $order_row['items'] = $item_stmt->fetchAll(PDO::FETCH_ASSOC);
                array_push($orders, $order_row);
            }
            
            http_response_code(200);
            echo json_encode($orders);
        } else {
            http_response_code(400);
            echo json_encode(array("message" => "Missing buyer_id."));
        }
    } 
    
    // FETCH ITEMS FOR SELLER
    else if ($action === 'read_seller') {
        $seller_id = isset($_GET['seller_id']) ? intval($_GET['seller_id']) : 0;
        
        if ($seller_id > 0) {
            $query = "
                SELECT oi.id as item_id, oi.order_id, oi.quantity, oi.unit_price, oi.status, 
                       oi.payout_status, oi.payout_date, oi.payout_ref,
                       p.title, (SELECT image_url FROM product_images WHERE product_id = p.id LIMIT 1) as image_url, 
                       o.created_at, u.first_name as buyer_name, u.email as buyer_email
                FROM order_items oi
                JOIN products p ON oi.product_id = p.id
                JOIN orders o ON oi.order_id = o.id
                JOIN users u ON o.buyer_id = u.id
                WHERE p.seller_id = :seller_id
                ORDER BY o.created_at DESC
            ";
            $stmt = $conn->prepare($query);
            $stmt->bindParam(':seller_id', $seller_id);
            $stmt->execute();
            
            $items = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            http_response_code(200);
            echo json_encode($items);
        } else {
            http_response_code(400);
            echo json_encode(array("message" => "Missing seller_id."));
        }
    } else {
        http_response_code(404);
        echo json_encode(array("message" => "Action not found."));
    }
} 
else if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"));
    
    // 1. UPDATE ITEM STATUS (By Seller e.g. ship)
    if ($action === 'update_item_status') {
        if (!empty($data->item_id) && !empty($data->status) && !empty($data->seller_id)) {
            
            // First verify that this item actually belongs to a product owned by this seller
            $verify_query = "
                SELECT oi.id 
                FROM order_items oi
                JOIN products p ON oi.product_id = p.id
                WHERE oi.id = :item_id AND p.seller_id = :seller_id
            ";
            $verify_stmt = $conn->prepare($verify_query);
            $verify_stmt->bindParam(':item_id', $data->item_id);
            $verify_stmt->bindParam(':seller_id', $data->seller_id);
            $verify_stmt->execute();
            
            if ($verify_stmt->rowCount() > 0) {
                // Update the status
                $update_query = "UPDATE order_items SET status = :status WHERE id = :item_id";
                $update_stmt = $conn->prepare($update_query);
                $update_stmt->bindParam(':status', $data->status);
                $update_stmt->bindParam(':item_id', $data->item_id);
                
                if ($update_stmt->execute()) {
                    http_response_code(200);
                    echo json_encode(array("status" => "success", "message" => "Item status updated to " . $data->status . "."));
                } else {
                    http_response_code(503);
                    echo json_encode(array("message" => "Unable to update status."));
                }
            } else {
                http_response_code(403);
                echo json_encode(array("message" => "Unauthorized to update this item."));
            }
        } else {
            http_response_code(400);
            echo json_encode(array("message" => "Incomplete data."));
        }
    }
    
    // 2. BUYER CONFIRMS DELIVERY (Received Item)
    else if ($action === 'buyer_confirm_received') {
        if (!empty($data->item_id) && !empty($data->buyer_id)) {
            // Verify that this order item belongs to this buyer
            $verify_query = "
                SELECT oi.id 
                FROM order_items oi
                JOIN orders o ON oi.order_id = o.id
                WHERE oi.id = :item_id AND o.buyer_id = :buyer_id
            ";
            $verify_stmt = $conn->prepare($verify_query);
            $verify_stmt->bindParam(':item_id', $data->item_id);
            $verify_stmt->bindParam(':buyer_id', $data->buyer_id);
            $verify_stmt->execute();
            
            if ($verify_stmt->rowCount() > 0) {
                // Mark item as delivered
                $update_query = "UPDATE order_items SET status = 'delivered' WHERE id = :item_id";
                $update_stmt = $conn->prepare($update_query);
                $update_stmt->bindParam(':item_id', $data->item_id);
                
                if ($update_stmt->execute()) {
                    http_response_code(200);
                    echo json_encode(array("status" => "success", "message" => "Package confirmed as received. Payout is now queued for seller release."));
                } else {
                    http_response_code(503);
                    echo json_encode(array("message" => "Unable to confirm delivery."));
                }
            } else {
                http_response_code(403);
                echo json_encode(array("message" => "Unauthorized: Order item does not belong to this buyer."));
            }
        } else {
            http_response_code(400);
            echo json_encode(array("message" => "Missing item_id or buyer_id."));
        }
    }
    else {
        http_response_code(404);
        echo json_encode(array("message" => "Action not found."));
    }
}
?>
