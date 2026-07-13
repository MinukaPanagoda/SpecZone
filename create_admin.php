<?php
include_once 'backend/config/db.php';

$first_name = "System";
$last_name = "Admin";
$email = "admin@speczone.com";
$password = "admin123";
$role = "admin";

// Check if admin already exists
$check_query = "SELECT id FROM users WHERE email = :email";
$stmt = $conn->prepare($check_query);
$stmt->bindParam(":email", $email);
$stmt->execute();

if ($stmt->rowCount() > 0) {
    echo "Admin account already exists! Login with: admin@speczone.com / admin123\n";
} else {
    $hashed_password = password_hash($password, PASSWORD_BCRYPT);
    $query = "INSERT INTO users (first_name, last_name, email, password, role) VALUES (:first_name, :last_name, :email, :password, :role)";
    $insert_stmt = $conn->prepare($query);
    $insert_stmt->bindParam(":first_name", $first_name);
    $insert_stmt->bindParam(":last_name", $last_name);
    $insert_stmt->bindParam(":email", $email);
    $insert_stmt->bindParam(":password", $hashed_password);
    $insert_stmt->bindParam(":role", $role);

    if ($insert_stmt->execute()) {
        echo "Admin account created successfully! Login with: admin@speczone.com / admin123\n";
    } else {
        echo "Failed to create admin account.\n";
    }
}
?>
