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
    } else {
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
            "total_orders" => 0
        ];

        // Buyers Count
        $stmt = $conn->query("SELECT COUNT(*) as count FROM users WHERE role = 'buyer'");
        $stats["total_buyers"] = $stmt->fetch(PDO::FETCH_ASSOC)['count'];

        // Sellers Count
        $stmt = $conn->query("SELECT COUNT(*) as count FROM users WHERE role = 'seller'");
        $stats["total_sellers"] = $stmt->fetch(PDO::FETCH_ASSOC)['count'];

        // Products Count
        $stmt = $conn->query("SELECT COUNT(*) as count FROM products");
        $stats["total_products"] = $stmt->fetch(PDO::FETCH_ASSOC)['count'];

        // Orders Count
        $stmt = $conn->query("SELECT COUNT(*) as count FROM orders");
        $stats["total_orders"] = $stmt->fetch(PDO::FETCH_ASSOC)['count'];

        http_response_code(200);
        echo json_encode($stats);

    } else if ($action === 'users') {
        $query = "
            SELECT u.id, u.first_name, u.last_name, u.email, u.role, u.created_at,
                   (SELECT AVG(r.rating) 
                    FROM reviews r 
                    JOIN products p ON r.product_id = p.id 
                    WHERE p.seller_id = u.id) as avg_rating
            FROM users u 
            ORDER BY u.created_at DESC
        ";
        $stmt = $conn->prepare($query);
        $stmt->execute();
        
        $users_arr = array();
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            // Format rating to 1 decimal place if it exists
            if ($row['avg_rating'] !== null) {
                $row['avg_rating'] = number_format((float)$row['avg_rating'], 1, '.', '');
            }
            array_push($users_arr, $row);
        }
        
        http_response_code(200);
        echo json_encode($users_arr);
    } else {
        http_response_code(404);
        echo json_encode(array("message" => "Action not found."));
    }
}
?>
