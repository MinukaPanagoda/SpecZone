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

function saveSlipImageFile($base64Data, $buyerId) {
    if (empty($base64Data)) return null;
    
    // If it's already a full URL
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

$action = isset($_GET['action']) ? $_GET['action'] : '';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    
    // 1. FETCH ORDERS FOR BUYER
    if ($action === 'read_buyer') {
        $buyer_id = isset($_GET['buyer_id']) ? intval($_GET['buyer_id']) : 0;
        
        if ($buyer_id > 0) {
            $order_query = "SELECT id, total_amount, payment_method, created_at FROM orders WHERE buyer_id = :buyer_id ORDER BY created_at DESC";
            $order_stmt = $conn->prepare($order_query);
            $order_stmt->bindParam(':buyer_id', $buyer_id);
            $order_stmt->execute();
            
            $orders = array();
            
            while ($order_row = $order_stmt->fetch(PDO::FETCH_ASSOC)) {
                $order_id = $order_row['id'];
                
                // Get items for this order with payment slip details & seller bank info
                $item_query = "
                    SELECT oi.id as item_id, oi.quantity, oi.unit_price, oi.status, oi.payout_status, oi.payout_date,
                           oi.payment_method, oi.payment_status, oi.payment_slip_url, oi.payment_reject_reason, oi.payment_reviewed_at,
                           p.title, p.seller_id,
                           (SELECT image_url FROM product_images WHERE product_id = p.id LIMIT 1) as image_url, 
                           u.first_name as seller_name,
                           si.shop_name, si.bank_name, si.bank_account_number, si.bank_account_name, si.bank_branch
                    FROM order_items oi
                    JOIN products p ON oi.product_id = p.id
                    JOIN users u ON p.seller_id = u.id
                    LEFT JOIN sellers_info si ON si.user_id = p.seller_id
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
    
    // 2. FETCH ITEMS FOR SELLER
    else if ($action === 'read_seller') {
        $seller_id = isset($_GET['seller_id']) ? intval($_GET['seller_id']) : 0;
        
        if ($seller_id > 0) {
            $query = "
                SELECT oi.id as item_id, oi.order_id, oi.quantity, oi.unit_price, oi.status, 
                       oi.payout_status, oi.payout_date, oi.payout_ref,
                       oi.payment_method, oi.payment_status, oi.payment_slip_url, oi.payment_reject_reason, oi.payment_reviewed_at,
                       p.title, (SELECT image_url FROM product_images WHERE product_id = p.id LIMIT 1) as image_url, 
                       o.created_at, o.payment_method as order_payment_method,
                       u.first_name as buyer_name, u.email as buyer_email, u.phone as buyer_phone
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
                SELECT oi.id, oi.payment_method, oi.payment_status 
                FROM order_items oi
                JOIN products p ON oi.product_id = p.id
                WHERE oi.id = :item_id AND p.seller_id = :seller_id
            ";
            $verify_stmt = $conn->prepare($verify_query);
            $verify_stmt->bindParam(':item_id', $data->item_id);
            $verify_stmt->bindParam(':seller_id', $data->seller_id);
            $verify_stmt->execute();
            
            if ($verify_stmt->rowCount() > 0) {
                $itemInfo = $verify_stmt->fetch(PDO::FETCH_ASSOC);
                
                // Guard: If shipping, make sure bank transfer payments are approved
                if ($data->status === 'shipped' && $itemInfo['payment_method'] === 'bank_transfer' && $itemInfo['payment_status'] !== 'approved') {
                    http_response_code(400);
                    echo json_encode(array("status" => "error", "message" => "Cannot ship package: The bank payment slip must be reviewed and approved before shipping."));
                    exit();
                }

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

    // 3. BUYER UPLOADS / RE-UPLOADS PAYMENT SLIP
    else if ($action === 'upload_slip') {
        if (!empty($data->item_id) && !empty($data->buyer_id) && !empty($data->slip_image)) {
            // Verify ownership
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
                $slipUrl = saveSlipImageFile($data->slip_image, $data->buyer_id);
                if (!$slipUrl) {
                    http_response_code(400);
                    echo json_encode(array("status" => "error", "message" => "Failed to process image. Please upload a valid JPG, PNG, or WEBP image."));
                    exit();
                }

                // Update order item with new slip and set status to under_review
                $update_query = "
                    UPDATE order_items 
                    SET payment_slip_url = :slip_url, 
                        payment_status = 'under_review', 
                        payment_reject_reason = NULL, 
                        payment_reviewed_at = NULL 
                    WHERE id = :item_id
                ";
                $update_stmt = $conn->prepare($update_query);
                $update_stmt->bindParam(':slip_url', $slipUrl);
                $update_stmt->bindParam(':item_id', $data->item_id);

                if ($update_stmt->execute()) {
                    http_response_code(200);
                    echo json_encode(array(
                        "status" => "success", 
                        "message" => "Payment slip uploaded successfully! It has been submitted to the merchant for verification.",
                        "payment_slip_url" => $slipUrl,
                        "payment_status" => "under_review"
                    ));
                } else {
                    http_response_code(503);
                    echo json_encode(array("status" => "error", "message" => "Unable to update slip in database."));
                }
            } else {
                http_response_code(403);
                echo json_encode(array("status" => "error", "message" => "Unauthorized access to this order item."));
            }
        } else {
            http_response_code(400);
            echo json_encode(array("status" => "error", "message" => "Missing item_id, buyer_id, or slip_image."));
        }
    }

    // 4. SELLER REVIEWS PAYMENT SLIP (APPROVE / REJECT)
    else if ($action === 'review_slip') {
        if (!empty($data->item_id) && !empty($data->seller_id) && !empty($data->decision)) {
            // Verify item belongs to seller
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
                if ($data->decision === 'approved') {
                    $update_query = "
                        UPDATE order_items 
                        SET payment_status = 'approved', 
                            payment_reject_reason = NULL, 
                            payment_reviewed_at = NOW() 
                        WHERE id = :item_id
                    ";
                    $update_stmt = $conn->prepare($update_query);
                    $update_stmt->bindParam(':item_id', $data->item_id);

                    if ($update_stmt->execute()) {
                        http_response_code(200);
                        echo json_encode(array(
                            "status" => "success", 
                            "message" => "Payment slip approved! The payment is verified and the package is ready to be shipped.",
                            "payment_status" => "approved"
                        ));
                    } else {
                        http_response_code(503);
                        echo json_encode(array("status" => "error", "message" => "Failed to approve payment."));
                    }
                } elseif ($data->decision === 'rejected') {
                    $reason = !empty($data->reject_reason) ? trim($data->reject_reason) : "Payment slip was rejected. Please upload a clear and valid transaction slip.";
                    
                    $update_query = "
                        UPDATE order_items 
                        SET payment_status = 'rejected', 
                            payment_reject_reason = :reason, 
                            payment_reviewed_at = NOW() 
                        WHERE id = :item_id
                    ";
                    $update_stmt = $conn->prepare($update_query);
                    $update_stmt->bindParam(':reason', $reason);
                    $update_stmt->bindParam(':item_id', $data->item_id);

                    if ($update_stmt->execute()) {
                        http_response_code(200);
                        echo json_encode(array(
                            "status" => "success", 
                            "message" => "Payment slip marked as rejected. The buyer has been notified to re-upload a valid slip.",
                            "payment_status" => "rejected",
                            "payment_reject_reason" => $reason
                        ));
                    } else {
                        http_response_code(503);
                        echo json_encode(array("status" => "error", "message" => "Failed to reject payment."));
                    }
                } else {
                    http_response_code(400);
                    echo json_encode(array("status" => "error", "message" => "Invalid decision. Must be 'approved' or 'rejected'."));
                }
            } else {
                http_response_code(403);
                echo json_encode(array("status" => "error", "message" => "Unauthorized access to this order item."));
            }
        } else {
            http_response_code(400);
            echo json_encode(array("status" => "error", "message" => "Missing item_id, seller_id, or decision."));
        }
    }
    else {
        http_response_code(404);
        echo json_encode(array("message" => "Action not found."));
    }
}
?>
