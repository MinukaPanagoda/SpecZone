<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once '../config/db.php';

$action = isset($_GET['action']) ? $_GET['action'] : '';

// 1. Create Complaint (Buyer)
if ($action === 'create' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"));

    if (!empty($data->buyer_id) && !empty($data->seller_id) && !empty($data->reason)) {
        $query = "INSERT INTO complaints SET buyer_id = :buyer_id, seller_id = :seller_id, reason = :reason, status = 'pending'";
        $stmt = $conn->prepare($query);
        
        $stmt->bindParam(':buyer_id', $data->buyer_id);
        $stmt->bindParam(':seller_id', $data->seller_id);
        $stmt->bindParam(':reason', $data->reason);
        
        if ($stmt->execute()) {
            http_response_code(201);
            echo json_encode(["message" => "Complaint submitted successfully."]);
        } else {
            http_response_code(503);
            echo json_encode(["message" => "Unable to submit complaint."]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["message" => "Incomplete data."]);
    }
} 
// 2. Read Complaints (Admin)
else if ($action === 'read' && $_SERVER['REQUEST_METHOD'] === 'GET') {
    $query = "
        SELECT c.id, c.reason, c.status, 
               b.first_name as buyer_name, b.email as buyer_email,
               s.first_name as seller_name, s.email as seller_email
        FROM complaints c
        JOIN users b ON c.buyer_id = b.id
        JOIN users s ON c.seller_id = s.id
        ORDER BY c.id DESC
    ";
    
    $stmt = $conn->prepare($query);
    $stmt->execute();
    
    $complaints = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        array_push($complaints, $row);
    }
    
    http_response_code(200);
    echo json_encode($complaints);
}
// 3. Resolve Complaint (Admin)
else if ($action === 'resolve' && $_SERVER['REQUEST_METHOD'] === 'PUT') {
    $data = json_decode(file_get_contents("php://input"));

    if (!empty($data->complaint_id)) {
        $query = "UPDATE complaints SET status = 'resolved' WHERE id = :id";
        $stmt = $conn->prepare($query);
        $stmt->bindParam(':id', $data->complaint_id);
        
        if ($stmt->execute()) {
            http_response_code(200);
            echo json_encode(["message" => "Complaint marked as resolved."]);
        } else {
            http_response_code(503);
            echo json_encode(["message" => "Unable to update complaint."]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["message" => "Missing complaint ID."]);
    }
} 
else {
    http_response_code(404);
    echo json_encode(["message" => "Invalid action."]);
}
?>
