<?php
class Cart {
    private $conn;
    private $table_name = "cart";

    public $id;
    public $buyer_id;
    public $product_id;
    public $quantity;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function getItems($buyer_id) {
        $query = "SELECT c.id as cart_id, c.quantity, p.id as product_id, p.title, p.price, p.stock_quantity,
                         (SELECT image_url FROM product_images WHERE product_id = p.id LIMIT 1) as image_url
                  FROM " . $this->table_name . " c
                  JOIN products p ON c.product_id = p.id
                  WHERE c.buyer_id = :buyer_id";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':buyer_id', $buyer_id);
        $stmt->execute();
        return $stmt;
    }

    public function addItem() {
        // Check if item already in cart
        $check_query = "SELECT id, quantity FROM " . $this->table_name . " WHERE buyer_id = :buyer_id AND product_id = :product_id";
        $stmt_check = $this->conn->prepare($check_query);
        $stmt_check->bindParam(':buyer_id', $this->buyer_id);
        $stmt_check->bindParam(':product_id', $this->product_id);
        $stmt_check->execute();

        if ($stmt_check->rowCount() > 0) {
            // Update quantity
            $row = $stmt_check->fetch(PDO::FETCH_ASSOC);
            $new_quantity = $row['quantity'] + $this->quantity;
            $query = "UPDATE " . $this->table_name . " SET quantity = :quantity WHERE id = :id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':quantity', $new_quantity);
            $stmt->bindParam(':id', $row['id']);
            return $stmt->execute();
        } else {
            // Insert new item
            $query = "INSERT INTO " . $this->table_name . " SET buyer_id = :buyer_id, product_id = :product_id, quantity = :quantity";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':buyer_id', $this->buyer_id);
            $stmt->bindParam(':product_id', $this->product_id);
            $stmt->bindParam(':quantity', $this->quantity);
            return $stmt->execute();
        }
    }

    public function updateQuantity($cart_id, $quantity) {
        $query = "UPDATE " . $this->table_name . " SET quantity = :quantity WHERE id = :id AND buyer_id = :buyer_id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':quantity', $quantity);
        $stmt->bindParam(':id', $cart_id);
        $stmt->bindParam(':buyer_id', $this->buyer_id);
        return $stmt->execute();
    }

    public function removeItem($cart_id) {
        $query = "DELETE FROM " . $this->table_name . " WHERE id = :id AND buyer_id = :buyer_id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $cart_id);
        $stmt->bindParam(':buyer_id', $this->buyer_id);
        return $stmt->execute();
    }

    public function clearCart($buyer_id) {
        $query = "DELETE FROM " . $this->table_name . " WHERE buyer_id = :buyer_id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':buyer_id', $buyer_id);
        return $stmt->execute();
    }
}
?>
