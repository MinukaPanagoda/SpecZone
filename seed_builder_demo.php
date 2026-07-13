<?php
// seed_builder_demo.php
include_once 'backend/config/db.php';

// First, check if we already have a seller to assign these to, or just use seller_id 1
$seller_id = 1; 

$products = [
    [
        'category_id' => 1, // CPU
        'title' => 'Intel Core i5-12400F',
        'description' => 'Great budget CPU for gaming.',
        'price' => 45000.00,
        'stock_quantity' => 10,
        'specifications' => json_encode(["Socket" => "LGA1700", "Cores" => "6", "Threads" => "12"]),
        'image_url' => 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=400&q=80' // Generic CPU
    ],
    [
        'category_id' => 1, // CPU
        'title' => 'AMD Ryzen 5 5600X',
        'description' => 'Fast and reliable AMD processor.',
        'price' => 52000.00,
        'stock_quantity' => 15,
        'specifications' => json_encode(["Socket" => "AM4", "Cores" => "6", "Threads" => "12"]),
        'image_url' => 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=400&q=80'
    ],
    [
        'category_id' => 3, // Motherboard
        'title' => 'MSI PRO H610M-G DDR4',
        'description' => 'LGA1700 motherboard for Intel 12th/13th gen.',
        'price' => 25000.00,
        'stock_quantity' => 5,
        'specifications' => json_encode(["Socket" => "LGA1700", "Memory Type" => "DDR4", "Form Factor" => "mATX"]),
        'image_url' => 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&q=80'
    ],
    [
        'category_id' => 3, // Motherboard
        'title' => 'ASUS Prime B550M-A',
        'description' => 'AM4 motherboard for Ryzen 5000 series.',
        'price' => 28000.00,
        'stock_quantity' => 8,
        'specifications' => json_encode(["Socket" => "AM4", "Memory Type" => "DDR4", "Form Factor" => "mATX"]),
        'image_url' => 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&q=80'
    ],
    [
        'category_id' => 4, // RAM
        'title' => 'Corsair Vengeance LPX 16GB (2x8GB)',
        'description' => 'Fast DDR4 memory.',
        'price' => 15000.00,
        'stock_quantity' => 20,
        'specifications' => json_encode(["Memory Type" => "DDR4", "Speed" => "3200MHz", "Capacity" => "16GB"]),
        'image_url' => 'https://images.unsplash.com/photo-1562976540-1502c2145186?w=400&q=80'
    ],
    [
        'category_id' => 4, // RAM
        'title' => 'Kingston Fury Beast 16GB',
        'description' => 'Next-gen DDR5 memory.',
        'price' => 22000.00,
        'stock_quantity' => 12,
        'specifications' => json_encode(["Memory Type" => "DDR5", "Speed" => "5200MHz", "Capacity" => "16GB"]),
        'image_url' => 'https://images.unsplash.com/photo-1562976540-1502c2145186?w=400&q=80'
    ],
    [
        'category_id' => 2, // GPU
        'title' => 'NVIDIA GeForce RTX 3060',
        'description' => 'Great 1080p gaming graphics card.',
        'price' => 110000.00,
        'stock_quantity' => 4,
        'specifications' => json_encode(["VRAM" => "12GB", "Core Clock" => "1.32GHz"]),
        'image_url' => 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=400&q=80'
    ]
];

try {
    $conn->beginTransaction();
    
    $query = "INSERT INTO products (seller_id, category_id, title, description, price, stock_quantity, specifications) 
              VALUES (:seller_id, :category_id, :title, :description, :price, :stock_quantity, :specifications)";
    $stmt = $conn->prepare($query);
    
    $img_query = "INSERT INTO product_images (product_id, image_url) VALUES (:product_id, :image_url)";
    $img_stmt = $conn->prepare($img_query);

    foreach ($products as $p) {
        $stmt->execute([
            ':seller_id' => $seller_id,
            ':category_id' => $p['category_id'],
            ':title' => $p['title'],
            ':description' => $p['description'],
            ':price' => $p['price'],
            ':stock_quantity' => $p['stock_quantity'],
            ':specifications' => $p['specifications']
        ]);
        
        $product_id = $conn->lastInsertId();
        
        $img_stmt->execute([
            ':product_id' => $product_id,
            ':image_url' => $p['image_url']
        ]);
    }
    
    $conn->commit();
    echo "Demo components seeded successfully!\n";
} catch (Exception $e) {
    $conn->rollBack();
    echo "Error: " . $e->getMessage() . "\n";
}
?>
