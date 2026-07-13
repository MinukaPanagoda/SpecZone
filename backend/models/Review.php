<?php
class Review {
    private $conn;
    private $table_name = "reviews";

    public $id;
    public $product_id;
    public $buyer_id;
    public $rating;
    public $comment;
    public $created_at;

    public function __construct($db) {
        $this->conn = $db;
    }

    // Create a review
    public function create() {
        $query = "INSERT INTO " . $this->table_name . " 
                  SET product_id=:product_id, buyer_id=:buyer_id, rating=:rating, comment=:comment";

        $stmt = $this->conn->prepare($query);

        $this->comment = htmlspecialchars(strip_tags($this->comment));

        $stmt->bindParam(":product_id", $this->product_id);
        $stmt->bindParam(":buyer_id", $this->buyer_id);
        $stmt->bindParam(":rating", $this->rating);
        $stmt->bindParam(":comment", $this->comment);

        if ($stmt->execute()) {
            return true;
        }
        return false;
    }

    // Read reviews for a specific product
    public function readByProduct($product_id) {
        $query = "SELECT r.id, r.rating, r.comment, r.created_at, u.first_name, u.last_name 
                  FROM " . $this->table_name . " r
                  JOIN users u ON r.buyer_id = u.id
                  WHERE r.product_id = :product_id
                  ORDER BY r.created_at DESC";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":product_id", $product_id);
        $stmt->execute();
        
        return $stmt;
    }
}
?>
