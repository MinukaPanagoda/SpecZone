<?php
// backend/api/auth.php

// Required headers for CORS and JSON output
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Handle preflight OPTIONS request for CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Include database and object files
include_once '../config/db.php';
include_once '../models/User.php';

// Instantiate user object
$user = new User($conn);

// Get posted data
$data = json_decode(file_get_contents("php://input"));

// Check if an action parameter is provided
if (isset($_GET['action'])) {
    $action = $_GET['action'];

    // -----------------------------------------
    // REGISTER ENDPOINT
    // -----------------------------------------
    if ($action === 'register') {
        if (!empty($data->first_name) && !empty($data->last_name) && !empty($data->email) && !empty($data->password)) {
            $firstName = trim($data->first_name);
            $lastName = trim($data->last_name);
            $email = trim($data->email);
            $password = $data->password;
            $phone = isset($data->phone) ? trim($data->phone) : '';
            $address = isset($data->address) ? trim($data->address) : '';
            $city = isset($data->city) ? trim($data->city) : '';
            $postal_code = isset($data->postal_code) ? trim($data->postal_code) : (isset($data->postalCode) ? trim($data->postalCode) : '');
            $shopName = isset($data->shop_name) ? trim($data->shop_name) : '';

            // Validate Name (No numbers allowed)
            if (preg_match('/\d/', $firstName) || preg_match('/\d/', $lastName)) {
                http_response_code(400);
                echo json_encode(array("status" => "error", "message" => "Name cannot contain numbers or digits. Please enter letters only."));
                exit();
            }

            // Validate Password Complexity (Minimum 8 characters, Upper, Lower, Number, Special Char)
            if (strlen($password) < 8) {
                http_response_code(400);
                echo json_encode(array("status" => "error", "message" => "Password must be at least 8 characters long."));
                exit();
            }
            if (!preg_match('/[A-Z]/', $password)) {
                http_response_code(400);
                echo json_encode(array("status" => "error", "message" => "Password must contain at least one capital letter (A-Z)."));
                exit();
            }
            if (!preg_match('/[a-z]/', $password)) {
                http_response_code(400);
                echo json_encode(array("status" => "error", "message" => "Password must contain at least one simple letter (a-z)."));
                exit();
            }
            if (!preg_match('/\d/', $password)) {
                http_response_code(400);
                echo json_encode(array("status" => "error", "message" => "Password must contain at least one number (0-9)."));
                exit();
            }
            if (!preg_match('/[!@#$%^&*()_+\-=\[\]{};\':"\\\\|,.<>\/?~`]/', $password)) {
                http_response_code(400);
                echo json_encode(array("status" => "error", "message" => "Password must contain at least one special character (!@#$%^&*)."));
                exit();
            }

            $user->first_name = $firstName;
            $user->last_name = $lastName;
            $user->email = $email;
            $user->password = $password;
            $user->phone = $phone;
            $user->address = $address;
            $user->city = $city;
            $user->postal_code = $postal_code;
            $user->shop_name = $shopName;
            $user->role = isset($data->role) ? $data->role : 'buyer'; // default role is buyer

            if ($user->emailExists()) {
                http_response_code(400); // Bad Request
                echo json_encode(array("status" => "error", "message" => "Email already exists. Please login or use another email."));
            } else {
                if ($user->register()) {
                    http_response_code(201); // Created
                    echo json_encode(array("status" => "success", "message" => "User was successfully registered."));
                } else {
                    http_response_code(503); // Service Unavailable
                    echo json_encode(array("status" => "error", "message" => "Unable to register user."));
                }
            }
        } else {
            http_response_code(400);
            echo json_encode(array("status" => "error", "message" => "Incomplete data. Please provide all required fields."));
        }
    } 
    // -----------------------------------------
    // LOGIN ENDPOINT
    // -----------------------------------------
    elseif ($action === 'login') {
        if (!empty($data->email) && !empty($data->password)) {
            $user->email = $data->email;
            $user->password = $data->password;

            if ($user->login()) {
                http_response_code(200); // OK
                echo json_encode(array(
                    "status" => "success",
                    "message" => "Successful login.",
                    "user" => array(
                        "id" => $user->id,
                        "first_name" => $user->first_name,
                        "last_name" => $user->last_name,
                        "email" => $user->email,
                        "role" => $user->role,
                        "phone" => $user->phone,
                        "address" => $user->address,
                        "city" => $user->city,
                        "postal_code" => $user->postal_code,
                        "shop_name" => $user->shop_name,
                        "is_verified" => $user->is_verified,
                        "warning_count" => $user->warning_count
                    )
                ));
            } else {
                http_response_code(401); // Unauthorized
                echo json_encode(array("status" => "error", "message" => "Login failed. Incorrect email or password."));
            }
        } else {
            http_response_code(400);
            echo json_encode(array("status" => "error", "message" => "Incomplete data. Email and password are required."));
        }
    }
    // -----------------------------------------
    // FORGOT PASSWORD (REQUEST OTP)
    // -----------------------------------------
    elseif ($action === 'forgot_password') {
        if (!empty($data->email)) {
            $email = trim($data->email);
            $stmt = $conn->prepare("SELECT id, first_name, email FROM users WHERE email = :email LIMIT 1");
            $stmt->bindParam(':email', $email);
            $stmt->execute();

            if ($stmt->rowCount() > 0) {
                $row = $stmt->fetch(PDO::FETCH_ASSOC);
                
                // Generate 6-digit OTP
                $otp = sprintf("%06d", mt_rand(100000, 999999));
                
                http_response_code(200);
                echo json_encode(array(
                    "status" => "success",
                    "message" => "Password reset OTP has been dispatched to your email address.",
                    "email" => $email,
                    "first_name" => $row['first_name'],
                    "demo_otp" => $otp // In real production sent via SMTP email; returned for demo
                ));
            } else {
                http_response_code(404);
                echo json_encode(array("status" => "error", "message" => "No account found with this email address."));
            }
        } else {
            http_response_code(400);
            echo json_encode(array("status" => "error", "message" => "Email address is required."));
        }
    }
    // -----------------------------------------
    // RESET PASSWORD
    // -----------------------------------------
    elseif ($action === 'reset_password') {
        if (!empty($data->email) && !empty($data->new_password)) {
            $email = trim($data->email);
            $newPassword = $data->new_password;

            // Validate Password Complexity
            if (strlen($newPassword) < 8) {
                http_response_code(400);
                echo json_encode(array("status" => "error", "message" => "Password must be at least 8 characters long."));
                exit();
            }
            if (!preg_match('/[A-Z]/', $newPassword)) {
                http_response_code(400);
                echo json_encode(array("status" => "error", "message" => "Password must contain at least one capital letter (A-Z)."));
                exit();
            }
            if (!preg_match('/[a-z]/', $newPassword)) {
                http_response_code(400);
                echo json_encode(array("status" => "error", "message" => "Password must contain at least one simple letter (a-z)."));
                exit();
            }
            if (!preg_match('/\d/', $newPassword)) {
                http_response_code(400);
                echo json_encode(array("status" => "error", "message" => "Password must contain at least one number (0-9)."));
                exit();
            }
            if (!preg_match('/[!@#$%^&*()_+\-=\[\]{};\':"\\\\|,.<>\/?~`]/', $newPassword)) {
                http_response_code(400);
                echo json_encode(array("status" => "error", "message" => "Password must contain at least one special character (!@#$%^&*)."));
                exit();
            }

            $stmt = $conn->prepare("SELECT id FROM users WHERE email = :email LIMIT 1");
            $stmt->bindParam(':email', $email);
            $stmt->execute();

            if ($stmt->rowCount() > 0) {
                $newHash = password_hash($newPassword, PASSWORD_BCRYPT);
                $updateStmt = $conn->prepare("UPDATE users SET password = :pwd WHERE email = :email");
                $updateStmt->bindParam(':pwd', $newHash);
                $updateStmt->bindParam(':email', $email);
                
                if ($updateStmt->execute()) {
                    http_response_code(200);
                    echo json_encode(array("status" => "success", "message" => "Password has been reset successfully! You can now log in."));
                } else {
                    http_response_code(500);
                    echo json_encode(array("status" => "error", "message" => "Failed to update password."));
                }
            } else {
                http_response_code(404);
                echo json_encode(array("status" => "error", "message" => "Account not found."));
            }
        } else {
            http_response_code(400);
            echo json_encode(array("status" => "error", "message" => "Email and new password are required."));
        }
    }
    // -----------------------------------------
    // INVALID ACTION
    // -----------------------------------------
    else {
        http_response_code(400);
        echo json_encode(array("status" => "error", "message" => "Invalid action parameter."));
    }
} else {
    http_response_code(400);
    echo json_encode(array("status" => "error", "message" => "Action parameter is missing."));
}
?>
