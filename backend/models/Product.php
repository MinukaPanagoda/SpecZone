<?php
class Product {
    private $conn;
    private $table_name = "products";

    public $id;
    public $seller_id;
    public $category_id;
    public $title;
    public $description;
    public $price;
    public $stock_quantity;
    public $image_url;
    public $specifications;
    public $created_at;

    public function __construct($db) {
        $this->conn = $db;
    }

    // Create product
    public function create() {
        try {
            $this->conn->beginTransaction();

            $query = "INSERT INTO " . $this->table_name . " 
                      SET seller_id=:seller_id, category_id=:category_id, title=:title, 
                          description=:description, price=:price, stock_quantity=:stock_quantity, 
                          specifications=:specifications";

            $stmt = $this->conn->prepare($query);

            $this->title = htmlspecialchars(strip_tags($this->title));
            $this->description = htmlspecialchars(strip_tags($this->description));
            
            $stmt->bindParam(":seller_id", $this->seller_id);
            $stmt->bindParam(":category_id", $this->category_id);
            $stmt->bindParam(":title", $this->title);
            $stmt->bindParam(":description", $this->description);
            $stmt->bindParam(":price", $this->price);
            $stmt->bindParam(":stock_quantity", $this->stock_quantity);
            $stmt->bindParam(":specifications", $this->specifications);

            if($stmt->execute()) {
                $product_id = $this->conn->lastInsertId();

                if (!empty($this->image_url)) {
                    $img_query = "INSERT INTO product_images SET product_id=:product_id, image_url=:image_url";
                    $img_stmt = $this->conn->prepare($img_query);
                    $img_stmt->bindParam(":product_id", $product_id);
                    $img_stmt->bindParam(":image_url", $this->image_url);
                    $img_stmt->execute();
                }

                $this->conn->commit();
                return true;
            }
            $this->conn->rollBack();
            return false;
        } catch (Exception $e) {
            if ($this->conn->inTransaction()) {
                $this->conn->rollBack();
            }
            return false;
        }
    }

    // Get all products
    public function read() {
        $query = "SELECT p.*, c.name as category_name, u.first_name as seller_name,
                         (SELECT image_url FROM product_images WHERE product_id = p.id LIMIT 1) as image_url,
                         COALESCE((SELECT ROUND(AVG(rating), 1) FROM reviews WHERE product_id = p.id), 0) as avg_rating,
                         (SELECT COUNT(id) FROM reviews WHERE product_id = p.id) as review_count
                  FROM " . $this->table_name . " p
                  LEFT JOIN categories c ON p.category_id = c.id
                  LEFT JOIN users u ON p.seller_id = u.id";

        if ($this->seller_id) {
            $query .= " WHERE p.seller_id = :seller_id";
        }
        
        $query .= " ORDER BY p.created_at DESC";

        $stmt = $this->conn->prepare($query);

        if ($this->seller_id) {
            $stmt->bindParam(":seller_id", $this->seller_id);
        }

        $stmt->execute();
        return $stmt;
    }

    // Get single product
    public function readSingle() {
        $query = "SELECT p.*, c.name as category_name, u.first_name as seller_name,
                         (SELECT image_url FROM product_images WHERE product_id = p.id LIMIT 1) as image_url,
                         COALESCE((SELECT ROUND(AVG(rating), 1) FROM reviews WHERE product_id = p.id), 0) as avg_rating,
                         (SELECT COUNT(id) FROM reviews WHERE product_id = p.id) as review_count
                  FROM " . $this->table_name . " p
                  LEFT JOIN categories c ON p.category_id = c.id
                  LEFT JOIN users u ON p.seller_id = u.id
                  WHERE p.id = :id
                  LIMIT 1";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $this->id);
        $stmt->execute();
        
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($row) {
            $this->seller_id = $row['seller_id'];
            $this->category_id = $row['category_id'];
            $this->title = $row['title'];
            $this->description = $row['description'];
            $this->price = $row['price'];
            $this->stock_quantity = $row['stock_quantity'];
            $this->specifications = $row['specifications'];
            $this->image_url = $row['image_url'];
            return $row;
        }
        return false;
    }
}
?>
