<?php
include_once 'backend/config/db.php';

$categories = [
    'Processors (CPU)',
    'Graphics Cards (GPU)',
    'Motherboards',
    'Memory (RAM)',
    'Storage (SSD/HDD)',
    'Power Supplies (PSU)',
    'Cases',
    'Cooling'
];

foreach ($categories as $cat) {
    $stmt = $conn->prepare("INSERT INTO CATEGORIES (name) VALUES (:name)");
    $stmt->bindParam(':name', $cat);
    if($stmt->execute()) {
        echo "Inserted: $cat\n";
    } else {
        echo "Failed to insert: $cat\n";
    }
}
echo "Done.\n";
?>
