<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once '../config/db.php';

$seller_id = isset($_GET['seller_id']) ? intval($_GET['seller_id']) : 0;

if ($seller_id > 0) {
    // Get average rating and total reviews
    $query = "SELECT AVG(r.rating) as avg_rating, COUNT(r.id) as total_reviews
              FROM reviews r
              JOIN products p ON r.product_id = p.id
              WHERE p.seller_id = :seller_id";
    
    $stmt = $conn->prepare($query);
    $stmt->bindParam(':seller_id', $seller_id);
    $stmt->execute();
    $rating_row = $stmt->fetch(PDO::FETCH_ASSOC);

    // Get total active products
    $query2 = "SELECT COUNT(id) as active_listings FROM products WHERE seller_id = :seller_id";
    $stmt2 = $conn->prepare($query2);
    $stmt2->bindParam(':seller_id', $seller_id);
    $stmt2->execute();
    $product_row = $stmt2->fetch(PDO::FETCH_ASSOC);

    $avg_rating = $rating_row['avg_rating'] ? round((float)$rating_row['avg_rating'], 1) : 0;
    
    echo json_encode([
        "avg_rating" => $avg_rating,
        "total_reviews" => (int)$rating_row['total_reviews'],
        "active_listings" => (int)$product_row['active_listings']
    ]);
} else {
    http_response_code(400);
    echo json_encode(["message" => "Missing seller_id parameter."]);
}
?>
