<?php
class Order {
    private $conn;
    private $table_orders = "orders";
    private $table_items = "order_items";
    private $table_cart = "cart";

    public $buyer_id;
    public $total_amount;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function placeOrder() {
        try {
            $this->conn->beginTransaction();

            // 1. Calculate total from cart and get items
            $cart_query = "SELECT c.product_id, c.quantity, p.price, p.stock_quantity 
                           FROM " . $this->table_cart . " c
                           JOIN products p ON c.product_id = p.id
                           WHERE c.buyer_id = :buyer_id";
            
            $stmt = $this->conn->prepare($cart_query);
            $stmt->bindParam(':buyer_id', $this->buyer_id);
            $stmt->execute();
            
            if ($stmt->rowCount() == 0) {
                $this->conn->rollBack();
                return false; // Cart is empty
            }

            $items = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $total_amount = 0;
            foreach ($items as $item) {
                $total_amount += ($item['price'] * $item['quantity']);
                
                // Optional: Check stock limits here
                if ($item['stock_quantity'] < $item['quantity']) {
                    $this->conn->rollBack();
                    return "INSUFFICIENT_STOCK_" . $item['product_id'];
                }
            }

            // 2. Insert into orders table
            $order_query = "INSERT INTO " . $this->table_orders . " SET buyer_id = :buyer_id, total_amount = :total_amount, status = 'pending'";
            $order_stmt = $this->conn->prepare($order_query);
            $order_stmt->bindParam(':buyer_id', $this->buyer_id);
            $order_stmt->bindParam(':total_amount', $total_amount);
            $order_stmt->execute();
            
            $order_id = $this->conn->lastInsertId();

            // 3. Insert into order_items table and reduce stock
            $item_query = "INSERT INTO " . $this->table_items . " SET order_id = :order_id, product_id = :product_id, quantity = :quantity, unit_price = :unit_price";
            $item_stmt = $this->conn->prepare($item_query);
            
            $stock_query = "UPDATE products SET stock_quantity = stock_quantity - :quantity WHERE id = :product_id";
            $stock_stmt = $this->conn->prepare($stock_query);

            foreach ($items as $item) {
                // Insert order item
                $item_stmt->bindValue(':order_id', $order_id);
                $item_stmt->bindValue(':product_id', $item['product_id']);
                $item_stmt->bindValue(':quantity', $item['quantity']);
                $item_stmt->bindValue(':unit_price', $item['price']);
                $item_stmt->execute();

                // Reduce stock
                $stock_stmt->bindValue(':quantity', $item['quantity']);
                $stock_stmt->bindValue(':product_id', $item['product_id']);
                $stock_stmt->execute();
            }

            // 4. Clear the cart
            $clear_cart_query = "DELETE FROM " . $this->table_cart . " WHERE buyer_id = :buyer_id";
            $clear_cart_stmt = $this->conn->prepare($clear_cart_query);
            $clear_cart_stmt->bindParam(':buyer_id', $this->buyer_id);
            $clear_cart_stmt->execute();

            $this->conn->commit();
            return $order_id;
        } catch (Exception $e) {
            if ($this->conn->inTransaction()) {
                $this->conn->rollBack();
            }
            return false;
        }
    }
}
?>
