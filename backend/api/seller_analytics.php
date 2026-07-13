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
    $analytics = [
        "total_revenue" => 0,
        "revenue_this_month" => 0,
        "total_items_sold" => 0,
        "monthly_data" => []
    ];

    // 1. Total Revenue and Items Sold
    $query1 = "
        SELECT SUM(oi.quantity * oi.unit_price) as total_revenue, SUM(oi.quantity) as total_items
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE p.seller_id = :seller_id
    ";
    $stmt1 = $conn->prepare($query1);
    $stmt1->bindParam(':seller_id', $seller_id);
    $stmt1->execute();
    $row1 = $stmt1->fetch(PDO::FETCH_ASSOC);
    
    $analytics['total_revenue'] = $row1['total_revenue'] ? (float)$row1['total_revenue'] : 0;
    $analytics['total_items_sold'] = $row1['total_items'] ? (int)$row1['total_items'] : 0;

    // 2. Revenue This Month
    $query2 = "
        SELECT SUM(oi.quantity * oi.unit_price) as monthly_revenue
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        JOIN orders o ON oi.order_id = o.id
        WHERE p.seller_id = :seller_id 
        AND MONTH(o.created_at) = MONTH(CURRENT_DATE())
        AND YEAR(o.created_at) = YEAR(CURRENT_DATE())
    ";
    $stmt2 = $conn->prepare($query2);
    $stmt2->bindParam(':seller_id', $seller_id);
    $stmt2->execute();
    $row2 = $stmt2->fetch(PDO::FETCH_ASSOC);
    
    $analytics['revenue_this_month'] = $row2['monthly_revenue'] ? (float)$row2['monthly_revenue'] : 0;

    // 3. Monthly Trend (Last 6 Months)
    $query3 = "
        SELECT DATE_FORMAT(o.created_at, '%b %Y') as month_name, 
               DATE_FORMAT(o.created_at, '%Y-%m') as sort_key,
               SUM(oi.quantity * oi.unit_price) as revenue
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        JOIN orders o ON oi.order_id = o.id
        WHERE p.seller_id = :seller_id 
        AND o.created_at >= DATE_SUB(CURRENT_DATE(), INTERVAL 6 MONTH)
        GROUP BY month_name, sort_key
        ORDER BY sort_key ASC
    ";
    $stmt3 = $conn->prepare($query3);
    $stmt3->bindParam(':seller_id', $seller_id);
    $stmt3->execute();
    
    while ($row3 = $stmt3->fetch(PDO::FETCH_ASSOC)) {
        array_push($analytics['monthly_data'], [
            "month" => $row3['month_name'],
            "revenue" => (float)$row3['revenue']
        ]);
    }

    // 4. Top Selling Products
    $query4 = "
        SELECT p.title, SUM(oi.quantity) as sold_qty
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE p.seller_id = :seller_id
        GROUP BY p.id, p.title
        ORDER BY sold_qty DESC
        LIMIT 5
    ";
    $stmt4 = $conn->prepare($query4);
    $stmt4->bindParam(':seller_id', $seller_id);
    $stmt4->execute();
    
    $analytics['top_products'] = [];
    while ($row4 = $stmt4->fetch(PDO::FETCH_ASSOC)) {
        array_push($analytics['top_products'], [
            "name" => $row4['title'],
            "sold" => (int)$row4['sold_qty']
        ]);
    }

    echo json_encode($analytics);
} else {
    http_response_code(400);
    echo json_encode(["message" => "Missing seller_id parameter."]);
}
?>
