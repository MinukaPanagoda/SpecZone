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
            $user->role = isset($data->role) ? $data->role : 'buyer'; // default role is buyer

            if ($user->emailExists()) {
                http_response_code(400); // Bad Request
                echo json_encode(array("status" => "error", "message" => "Email already exists."));
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
                        "role" => $user->role
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
    // INVALID ACTION
    // -----------------------------------------
    else {
        http_response_code(400);
        echo json_encode(array("status" => "error", "message" => "Invalid action parameter."));
    }
} else {
    http_response_code(400);
    echo json_encode(array("status" => "error", "message" => "Action parameter is missing (use ?action=login or ?action=register)."));
}
?>
