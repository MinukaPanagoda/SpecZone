<?php
// backend/api/profile.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once '../config/db.php';

// Ensure phone, address, city, and postal_code columns exist in users table
try {
    $conn->exec("ALTER TABLE `users` ADD COLUMN `phone` VARCHAR(20) NULL AFTER `role`");
} catch (Exception $e) {}

try {
    $conn->exec("ALTER TABLE `users` ADD COLUMN `address` TEXT NULL AFTER `phone`");
} catch (Exception $e) {}

try {
    $conn->exec("ALTER TABLE `users` ADD COLUMN `city` VARCHAR(100) NULL AFTER `address`");
} catch (Exception $e) {}

try {
    $conn->exec("ALTER TABLE `users` ADD COLUMN `postal_code` VARCHAR(20) NULL AFTER `city`");
} catch (Exception $e) {}

// Ensure sellers_info table exists
try {
    $conn->exec("CREATE TABLE IF NOT EXISTS `sellers_info` (
        `id` int(11) NOT NULL AUTO_INCREMENT,
        `user_id` int(11) NOT NULL,
        `shop_name` varchar(100) NOT NULL,
        `address` text DEFAULT NULL,
        `phone` varchar(20) DEFAULT NULL,
        `warning_count` int(11) DEFAULT 0,
        `is_verified` tinyint(1) DEFAULT 0,
        PRIMARY KEY (`id`),
        KEY `user_id` (`user_id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
} catch (Exception $e) {
    // Ignore
}

$action = isset($_GET['action']) ? $_GET['action'] : '';

// -------------------------------------------------------------
// 1. GET USER PROFILE
// -------------------------------------------------------------
if ($action === 'get_profile' && $_SERVER['REQUEST_METHOD'] === 'GET') {
    $user_id = isset($_GET['user_id']) ? intval($_GET['user_id']) : 0;

    if ($user_id <= 0) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Invalid user ID."]);
        exit();
    }

    try {
        $query = "
            SELECT u.id, u.first_name, u.last_name, u.email, u.role, u.phone, u.address, u.city, u.postal_code, u.created_at,
                   s.shop_name, s.warning_count, s.is_verified, s.address as shop_address, s.phone as shop_phone
            FROM users u
            LEFT JOIN sellers_info s ON u.id = s.user_id
            WHERE u.id = :id
            LIMIT 1
        ";
        $stmt = $conn->prepare($query);
        $stmt->bindParam(':id', $user_id);
        $stmt->execute();

        if ($stmt->rowCount() > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            http_response_code(200);
            echo json_encode([
                "status" => "success",
                "profile" => [
                    "id" => $row['id'],
                    "first_name" => $row['first_name'],
                    "last_name" => $row['last_name'],
                    "email" => $row['email'],
                    "role" => $row['role'],
                    "phone" => $row['phone'] ?? '',
                    "address" => $row['address'] ?? '',
                    "city" => $row['city'] ?? '',
                    "postal_code" => $row['postal_code'] ?? '',
                    "shop_name" => $row['shop_name'] ?? '',
                    "shop_address" => $row['shop_address'] ?? $row['address'] ?? '',
                    "shop_phone" => $row['shop_phone'] ?? $row['phone'] ?? '',
                    "is_verified" => ($row['is_verified'] == 1),
                    "warning_count" => intval($row['warning_count'] ?? 0),
                    "created_at" => $row['created_at']
                ]
            ]);
        } else {
            http_response_code(404);
            echo json_encode(["status" => "error", "message" => "User not found."]);
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
    }
}

// -------------------------------------------------------------
// 2. UPDATE USER PROFILE
// -------------------------------------------------------------
else if ($action === 'update_profile' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"));

    if (empty($data->user_id)) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "User ID is required."]);
        exit();
    }

    $user_id = intval($data->user_id);
    $first_name = isset($data->first_name) ? trim($data->first_name) : '';
    $last_name = isset($data->last_name) ? trim($data->last_name) : '';
    $phone = isset($data->phone) ? trim($data->phone) : '';
    $address = isset($data->address) ? trim($data->address) : '';
    $city = isset($data->city) ? trim($data->city) : '';
    $postal_code = isset($data->postal_code) ? trim($data->postal_code) : (isset($data->postalCode) ? trim($data->postalCode) : '');
    $shop_name = isset($data->shop_name) ? trim($data->shop_name) : '';

    // Validate Name (no digits)
    if (preg_match('/\d/', $first_name) || preg_match('/\d/', $last_name)) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Name cannot contain numbers or digits. Please enter letters only."]);
        exit();
    }

    if (empty($first_name) || empty($last_name)) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "First name and last name are required."]);
        exit();
    }

    try {
        // Update users table
        $query = "UPDATE users SET first_name = :first_name, last_name = :last_name, phone = :phone, address = :address, city = :city, postal_code = :postal_code WHERE id = :id";
        $stmt = $conn->prepare($query);
        $stmt->bindParam(':first_name', $first_name);
        $stmt->bindParam(':last_name', $last_name);
        $stmt->bindParam(':phone', $phone);
        $stmt->bindParam(':address', $address);
        $stmt->bindParam(':city', $city);
        $stmt->bindParam(':postal_code', $postal_code);
        $stmt->bindParam(':id', $user_id);
        $stmt->execute();

        // If user is seller or shop_name provided, update sellers_info
        if (!empty($shop_name) || (isset($data->role) && $data->role === 'seller')) {
            $checkStmt = $conn->prepare("SELECT id FROM sellers_info WHERE user_id = :uid LIMIT 1");
            $checkStmt->bindParam(':uid', $user_id);
            $checkStmt->execute();

            if ($checkStmt->rowCount() > 0) {
                $sellerQuery = "UPDATE sellers_info SET shop_name = :shop_name, phone = :phone, address = :address WHERE user_id = :uid";
                $sellerStmt = $conn->prepare($sellerQuery);
                $sellerStmt->bindParam(':shop_name', $shop_name);
                $sellerStmt->bindParam(':phone', $phone);
                $sellerStmt->bindParam(':address', $address);
                $sellerStmt->bindParam(':uid', $user_id);
                $sellerStmt->execute();
            } else {
                $sellerQuery = "INSERT INTO sellers_info (user_id, shop_name, phone, address, is_verified, warning_count) VALUES (:uid, :shop_name, :phone, :address, 0, 0)";
                $sellerStmt = $conn->prepare($sellerQuery);
                $sellerStmt->bindParam(':uid', $user_id);
                $sellerStmt->bindParam(':shop_name', $shop_name);
                $sellerStmt->bindParam(':phone', $phone);
                $sellerStmt->bindParam(':address', $address);
                $sellerStmt->execute();
            }
        }

        http_response_code(200);
        echo json_encode([
            "status" => "success",
            "message" => "Profile updated successfully.",
            "user" => [
                "id" => $user_id,
                "first_name" => $first_name,
                "last_name" => $last_name,
                "phone" => $phone,
                "address" => $address,
                "city" => $city,
                "postal_code" => $postal_code,
                "shop_name" => $shop_name
            ]
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Failed to update profile: " . $e->getMessage()]);
    }
}

// -------------------------------------------------------------
// 3. CHANGE PASSWORD
// -------------------------------------------------------------
else if ($action === 'change_password' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"));

    if (empty($data->user_id) || empty($data->current_password) || empty($data->new_password)) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "All password fields are required."]);
        exit();
    }

    $user_id = intval($data->user_id);
    $current_password = $data->current_password;
    $new_password = $data->new_password;

    // Validate Password Complexity on new password
    if (strlen($new_password) < 8) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "New password must be at least 8 characters long."]);
        exit();
    }
    if (!preg_match('/[A-Z]/', $new_password)) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "New password must contain at least one capital letter (A-Z)."]);
        exit();
    }
    if (!preg_match('/[a-z]/', $new_password)) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "New password must contain at least one simple letter (a-z)."]);
        exit();
    }
    if (!preg_match('/\d/', $new_password)) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "New password must contain at least one number (0-9)."]);
        exit();
    }
    if (!preg_match('/[!@#$%^&*()_+\-=\[\]{};\':"\\\\|,.<>\/?~`]/', $new_password)) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "New password must contain at least one special character (!@#$%^&*)."]);
        exit();
    }

    try {
        $stmt = $conn->prepare("SELECT password FROM users WHERE id = :id LIMIT 1");
        $stmt->bindParam(':id', $user_id);
        $stmt->execute();

        if ($stmt->rowCount() > 0) {
            $userRow = $stmt->fetch(PDO::FETCH_ASSOC);
            if (!password_verify($current_password, $userRow['password'])) {
                http_response_code(400);
                echo json_encode(["status" => "error", "message" => "Incorrect current password."]);
                exit();
            }

            // Hash new password
            $new_hash = password_hash($new_password, PASSWORD_BCRYPT);
            $updateStmt = $conn->prepare("UPDATE users SET password = :pwd WHERE id = :id");
            $updateStmt->bindParam(':pwd', $new_hash);
            $updateStmt->bindParam(':id', $user_id);
            $updateStmt->execute();

            http_response_code(200);
            echo json_encode(["status" => "success", "message" => "Password changed successfully!"]);
        } else {
            http_response_code(404);
            echo json_encode(["status" => "error", "message" => "User not found."]);
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Failed to update password: " . $e->getMessage()]);
    }
}
else {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Invalid action parameter."]);
}
?>
