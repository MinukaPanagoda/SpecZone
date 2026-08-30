<?php
class Wishlist {
    private $conn;
    private $table_name = "wishlist";

    public $id;
    public $buyer_id;
    public $product_id;

    public function __construct($db) {
        $this->conn = $db;
    }

    // Get all items in wishlist for a buyer
    public function getItems($buyer_id) {
        $query = "SELECT w.id as wishlist_id, w.buyer_id, w.product_id, 
                         p.title, p.price, p.stock_quantity, p.category_id,
                         c.name as category_name,
                         (SELECT image_url FROM product_images WHERE product_id = p.id LIMIT 1) as image_url,
                         COALESCE((SELECT ROUND(AVG(rating), 1) FROM reviews WHERE product_id = p.id), 0) as avg_rating,
                         (SELECT COUNT(id) FROM reviews WHERE product_id = p.id) as review_count
                  FROM " . $this->table_name . " w
                  JOIN products p ON w.product_id = p.id
                  LEFT JOIN categories c ON p.category_id = c.id
                  WHERE w.buyer_id = :buyer_id
                  ORDER BY w.id DESC";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':buyer_id', $buyer_id);
        $stmt->execute();

        return $stmt;
    }

    // Check if a specific product is already in wishlist
    public function isWishlisted($buyer_id, $product_id) {
        $query = "SELECT id FROM " . $this->table_name . " 
                  WHERE buyer_id = :buyer_id AND product_id = :product_id 
                  LIMIT 1";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':buyer_id', $buyer_id);
        $stmt->bindParam(':product_id', $product_id);
        $stmt->execute();

        return $stmt->rowCount() > 0;
    }

    // Add item to wishlist
    public function addItem($buyer_id, $product_id) {
        if ($this->isWishlisted($buyer_id, $product_id)) {
            return true; // Already in wishlist
        }

        $query = "INSERT INTO " . $this->table_name . " 
                  SET buyer_id = :buyer_id, product_id = :product_id";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':buyer_id', $buyer_id);
        $stmt->bindParam(':product_id', $product_id);

        return $stmt->execute();
    }

    // Remove item from wishlist
    public function removeItem($buyer_id, $product_id) {
        $query = "DELETE FROM " . $this->table_name . " 
                  WHERE buyer_id = :buyer_id AND product_id = :product_id";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':buyer_id', $buyer_id);
        $stmt->bindParam(':product_id', $product_id);

        return $stmt->execute();
    }

    // Toggle wishlist item (add if not exists, remove if exists)
    public function toggleItem($buyer_id, $product_id) {
        if ($this->isWishlisted($buyer_id, $product_id)) {
            $this->removeItem($buyer_id, $product_id);
            return 'removed';
        } else {
            $this->addItem($buyer_id, $product_id);
            return 'added';
        }
    }
}
?>
