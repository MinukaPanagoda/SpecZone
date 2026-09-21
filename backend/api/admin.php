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

// A simple utility to check if a user is an admin
function isAdmin($conn, $user_id) {
    if (!$user_id) return false;
    $query = "SELECT role FROM users WHERE id = :id LIMIT 1";
    $stmt = $conn->prepare($query);
    $stmt->bindParam(':id', $user_id);
    $stmt->execute();
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    return ($row && $row['role'] === 'admin');
}

$action = isset($_GET['action']) ? $_GET['action'] : '';

// For POST actions
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"));
    $admin_id = $data->admin_id ?? 0;

    if (!isAdmin($conn, $admin_id)) {
        http_response_code(403);
        echo json_encode(array("message" => "Unauthorized access."));
        exit();
    }

    if ($action === 'delete_user') {
        if (!empty($data->user_id)) {
            // Protect against self-deletion
            if ($data->user_id == $admin_id) {
                http_response_code(400);
                echo json_encode(array("message" => "Admin cannot delete their own account."));
                exit();
            }

            $query = "DELETE FROM users WHERE id = :id";
            $stmt = $conn->prepare($query);
            $stmt->bindParam(':id', $data->user_id);
            if ($stmt->execute()) {
                http_response_code(200);
                echo json_encode(array("message" => "User deleted successfully."));
            } else {
                http_response_code(503);
                echo json_encode(array("message" => "Unable to delete user."));
            }
        } else {
            http_response_code(400);
            echo json_encode(array("message" => "Missing user_id."));
        }
    } 
    else if ($action === 'delete_product') {
        if (!empty($data->product_id)) {
            $query = "DELETE FROM products WHERE id = :id";
            $stmt = $conn->prepare($query);
            $stmt->bindParam(':id', $data->product_id);
            if ($stmt->execute()) {
                http_response_code(200);
                echo json_encode(array("message" => "Product removed successfully."));
            } else {
                http_response_code(503);
                echo json_encode(array("message" => "Unable to remove product."));
            }
        } else {
            http_response_code(400);
            echo json_encode(array("message" => "Missing product_id."));
        }
    }
    else if ($action === 'toggle_seller_verify') {
        if (!empty($data->seller_id)) {
            // Check if seller_info exists
            $checkQuery = "SELECT id, is_verified FROM sellers_info WHERE user_id = :uid LIMIT 1";
            $stmt = $conn->prepare($checkQuery);
            $stmt->bindParam(':uid', $data->seller_id);
            $stmt->execute();
            $sellerInfo = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($sellerInfo) {
                $newStatus = $sellerInfo['is_verified'] ? 0 : 1;
                $updateQuery = "UPDATE sellers_info SET is_verified = :v WHERE id = :id";
                $upStmt = $conn->prepare($updateQuery);
                $upStmt->bindParam(':v', $newStatus);
                $upStmt->bindParam(':id', $sellerInfo['id']);
                $upStmt->execute();
            } else {
                $newStatus = 1;
                $insertQuery = "INSERT INTO sellers_info (user_id, shop_name, is_verified) VALUES (:uid, 'Verified Merchant', 1)";
                $inStmt = $conn->prepare($insertQuery);
                $inStmt->bindParam(':uid', $data->seller_id);
                $inStmt->execute();
            }

            http_response_code(200);
            echo json_encode(array(
                "message" => $newStatus ? "Seller verified successfully." : "Seller verification revoked.",
                "is_verified" => $newStatus
            ));
        } else {
            http_response_code(400);
            echo json_encode(array("message" => "Missing seller_id."));
        }
    }
    else if ($action === 'warn_seller') {
        if (!empty($data->seller_id)) {
            $checkQuery = "SELECT id, warning_count FROM sellers_info WHERE user_id = :uid LIMIT 1";
            $stmt = $conn->prepare($checkQuery);
            $stmt->bindParam(':uid', $data->seller_id);
            $stmt->execute();
            $sellerInfo = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($sellerInfo) {
                $newCount = intval($sellerInfo['warning_count']) + 1;
                $updateQuery = "UPDATE sellers_info SET warning_count = :w WHERE id = :id";
                $upStmt = $conn->prepare($updateQuery);
                $upStmt->bindParam(':w', $newCount);
                $upStmt->bindParam(':id', $sellerInfo['id']);
                $upStmt->execute();
            } else {
                $newCount = 1;
                $insertQuery = "INSERT INTO sellers_info (user_id, shop_name, warning_count) VALUES (:uid, 'Independent Merchant', 1)";
                $inStmt = $conn->prepare($insertQuery);
                $inStmt->bindParam(':uid', $data->seller_id);
                $inStmt->execute();
            }

            http_response_code(200);
            echo json_encode(array(
                "message" => "Warning issued to seller (Total warnings: {$newCount}).",
                "warning_count" => $newCount
            ));
        } else {
            http_response_code(400);
            echo json_encode(array("message" => "Missing seller_id."));
        }
    }
    else if ($action === 'add_category') {
        if (!empty($data->name)) {
            $name = htmlspecialchars(strip_tags(trim($data->name)));
            $desc = !empty($data->description) ? htmlspecialchars(strip_tags(trim($data->description))) : '';
            
            $query = "INSERT INTO categories (name, description) VALUES (:name, :desc)";
            $stmt = $conn->prepare($query);
            $stmt->bindParam(':name', $name);
            $stmt->bindParam(':desc', $desc);
            if ($stmt->execute()) {
                http_response_code(201);
                echo json_encode(array("message" => "Category created successfully.", "id" => $conn->lastInsertId()));
            } else {
                http_response_code(503);
                echo json_encode(array("message" => "Unable to create category."));
            }
        } else {
            http_response_code(400);
            echo json_encode(array("message" => "Category name is required."));
        }
    }
    else if ($action === 'delete_category') {
        if (!empty($data->category_id)) {
            $query = "DELETE FROM categories WHERE id = :id";
            $stmt = $conn->prepare($query);
            $stmt->bindParam(':id', $data->category_id);
            if ($stmt->execute()) {
                http_response_code(200);
                echo json_encode(array("message" => "Category deleted successfully."));
            } else {
                http_response_code(503);
                echo json_encode(array("message" => "Unable to delete category."));
            }
        } else {
            http_response_code(400);
            echo json_encode(array("message" => "Missing category_id."));
        }
    }
    // RELEASE PAYOUT TO SELLER
    else if ($action === 'release_payout') {
        if (!empty($data->item_id)) {
            $item_id = intval($data->item_id);
            $payout_ref = !empty($data->payout_ref) ? trim($data->payout_ref) : ('EFT-SZ-' . date('Ymd') . '-' . rand(1000, 9999));

            $query = "UPDATE order_items 
                      SET payout_status = 'paid', 
                          payout_date = CURRENT_TIMESTAMP, 
                          payout_ref = :payout_ref 
                      WHERE id = :item_id";
            $stmt = $conn->prepare($query);
            $stmt->bindParam(':payout_ref', $payout_ref);
            $stmt->bindParam(':item_id', $item_id);

            if ($stmt->execute()) {
                http_response_code(200);
                echo json_encode([
                    "status" => "success",
                    "message" => "Payout of funds successfully released to seller bank account.",
                    "payout_ref" => $payout_ref
                ]);
            } else {
                http_response_code(503);
                echo json_encode(["message" => "Unable to release payout."]);
            }
        } else {
            http_response_code(400);
            echo json_encode(["message" => "Missing item_id for payout."]);
        }
    }
    else {
        http_response_code(404);
        echo json_encode(array("message" => "Action not found."));
    }
} 
// For GET actions
else if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $admin_id = isset($_GET['admin_id']) ? intval($_GET['admin_id']) : 0;

    if (!isAdmin($conn, $admin_id)) {
        http_response_code(403);
        echo json_encode(array("message" => "Unauthorized access."));
        exit();
    }

    if ($action === 'stats') {
        $stats = [
            "total_buyers" => 0,
            "total_sellers" => 0,
            "total_products" => 0,
            "total_orders" => 0,
            "total_categories" => 0,
            "pending_payouts_count" => 0,
            "pending_payouts_amount" => 0,
            "total_payouts_paid" => 0,
            "total_marketplace_volume" => 0
        ];

        // Buyers Count
        $stmt = $conn->query("SELECT COUNT(*) as count FROM users WHERE role = 'buyer'");
        $stats["total_buyers"] = intval($stmt->fetch(PDO::FETCH_ASSOC)['count']);

        // Sellers Count
        $stmt = $conn->query("SELECT COUNT(*) as count FROM users WHERE role = 'seller'");
        $stats["total_sellers"] = intval($stmt->fetch(PDO::FETCH_ASSOC)['count']);

        // Products Count
        $stmt = $conn->query("SELECT COUNT(*) as count FROM products");
        $stats["total_products"] = intval($stmt->fetch(PDO::FETCH_ASSOC)['count']);

        // Orders Count
        $stmt = $conn->query("SELECT COUNT(*) as count FROM orders");
        $stats["total_orders"] = intval($stmt->fetch(PDO::FETCH_ASSOC)['count']);

        // Categories Count
        $stmt = $conn->query("SELECT COUNT(*) as count FROM categories");
        $stats["total_categories"] = intval($stmt->fetch(PDO::FETCH_ASSOC)['count']);

        // Pending Payouts (Delivered but not paid to seller)
        $stmt = $conn->query("SELECT COUNT(*) as count, IFNULL(SUM(quantity * unit_price), 0) as amount 
                              FROM order_items 
                              WHERE status = 'delivered' AND payout_status = 'pending'");
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        $stats["pending_payouts_count"] = intval($row['count']);
        $stats["pending_payouts_amount"] = floatval($row['amount']);

        // Total Payouts Paid
        $stmt = $conn->query("SELECT IFNULL(SUM(quantity * unit_price), 0) as amount 
                              FROM order_items 
                              WHERE payout_status = 'paid'");
        $stats["total_payouts_paid"] = floatval($stmt->fetch(PDO::FETCH_ASSOC)['amount']);

        // Total Marketplace Gross Volume
        $stmt = $conn->query("SELECT IFNULL(SUM(quantity * unit_price), 0) as amount FROM order_items");
        $stats["total_marketplace_volume"] = floatval($stmt->fetch(PDO::FETCH_ASSOC)['amount']);

        http_response_code(200);
        echo json_encode($stats);

    } else if ($action === 'payouts') {
        $query = "
            SELECT oi.id as item_id, oi.order_id, oi.quantity, oi.unit_price, 
                   (oi.quantity * oi.unit_price) as total_item_price,
                   oi.status as order_status, 
                   oi.payout_status, oi.payout_date, oi.payout_ref,
                   p.id as product_id, p.title as product_title,
                   o.created_at as order_date,
                   u_buyer.first_name as buyer_name, u_buyer.email as buyer_email,
                   u_seller.id as seller_id, CONCAT(u_seller.first_name, ' ', u_seller.last_name) as seller_name,
                   u_seller.email as seller_email, u_seller.phone as seller_phone,
                   s.shop_name, s.bank_name, s.bank_account_number, s.bank_account_name, s.bank_branch
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            JOIN orders o ON oi.order_id = o.id
            JOIN users u_buyer ON o.buyer_id = u_buyer.id
            JOIN users u_seller ON p.seller_id = u_seller.id
            LEFT JOIN sellers_info s ON u_seller.id = s.user_id
            ORDER BY 
                CASE WHEN oi.payout_status = 'pending' AND oi.status = 'delivered' THEN 0 
                     WHEN oi.payout_status = 'pending' THEN 1 
                     ELSE 2 END,
                o.created_at DESC
        ";
        $stmt = $conn->prepare($query);
        $stmt->execute();
        $payouts = $stmt->fetchAll(PDO::FETCH_ASSOC);

        http_response_code(200);
        echo json_encode($payouts);

    } else if ($action === 'users') {
        $query = "
            SELECT u.id, u.first_name, u.last_name, u.email, u.role, u.created_at,
                   s.is_verified, s.shop_name, s.warning_count,
                   (SELECT AVG(r.rating) 
                    FROM reviews r 
                    JOIN products p ON r.product_id = p.id 
                    WHERE p.seller_id = u.id) as avg_rating
            FROM users u 
            LEFT JOIN sellers_info s ON u.id = s.user_id
            ORDER BY u.created_at DESC
        ";
        $stmt = $conn->prepare($query);
        $stmt->execute();
        
        $users_arr = array();
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            if ($row['avg_rating'] !== null) {
                $row['avg_rating'] = number_format((float)$row['avg_rating'], 1, '.', '');
            }
            array_push($users_arr, $row);
        }
        
        http_response_code(200);
        echo json_encode($users_arr);

    } else if ($action === 'products') {
        $query = "
            SELECT p.id, p.title, p.price, p.stock_quantity, p.created_at,
                   c.name as category_name,
                   CONCAT(u.first_name, ' ', u.last_name) as seller_name,
                   (SELECT image_url FROM product_images WHERE product_id = p.id LIMIT 1) as image_url
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN users u ON p.seller_id = u.id
            ORDER BY p.id DESC
        ";
        $stmt = $conn->prepare($query);
        $stmt->execute();
        $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        http_response_code(200);
        echo json_encode($products);

    } else if ($action === 'categories') {
        $query = "
            SELECT c.id, c.name, c.description,
                   (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id) as product_count
            FROM categories c
            ORDER BY c.name ASC
        ";
        $stmt = $conn->prepare($query);
        $stmt->execute();
        $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);

        http_response_code(200);
        echo json_encode($categories);

    } else {
        http_response_code(404);
        echo json_encode(array("message" => "Action not found."));
    }
}
?>
