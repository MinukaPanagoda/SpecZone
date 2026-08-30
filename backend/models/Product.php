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
        $query = "SELECT p.*, c.name as category_name, u.first_name as seller_name, s.shop_name,
                         COALESCE(s.warning_count, 0) as seller_warning_count,
                         COALESCE(s.is_verified, 0) as seller_is_verified,
                         (SELECT image_url FROM product_images WHERE product_id = p.id LIMIT 1) as image_url,
                         COALESCE((SELECT ROUND(AVG(rating), 1) FROM reviews WHERE product_id = p.id), 0) as avg_rating,
                         (SELECT COUNT(id) FROM reviews WHERE product_id = p.id) as review_count,
                         COALESCE((SELECT ROUND(AVG(r.rating), 1) FROM reviews r JOIN products pr ON r.product_id = pr.id WHERE pr.seller_id = p.seller_id), 0) as seller_avg_rating,
                         (SELECT COUNT(r.id) FROM reviews r JOIN products pr ON r.product_id = pr.id WHERE pr.seller_id = p.seller_id) as seller_review_count,
                         (SELECT COUNT(c.id) FROM complaints c WHERE c.seller_id = p.seller_id AND c.status = 'pending') as seller_complaint_count
                  FROM " . $this->table_name . " p
                  LEFT JOIN categories c ON p.category_id = c.id
                  LEFT JOIN users u ON p.seller_id = u.id
                  LEFT JOIN sellers_info s ON p.seller_id = s.user_id";

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
        $query = "SELECT p.*, c.name as category_name, u.first_name as seller_name, s.shop_name,
                         COALESCE(s.warning_count, 0) as seller_warning_count,
                         COALESCE(s.is_verified, 0) as seller_is_verified,
                         (SELECT image_url FROM product_images WHERE product_id = p.id LIMIT 1) as image_url,
                         COALESCE((SELECT ROUND(AVG(rating), 1) FROM reviews WHERE product_id = p.id), 0) as avg_rating,
                         (SELECT COUNT(id) FROM reviews WHERE product_id = p.id) as review_count,
                         COALESCE((SELECT ROUND(AVG(r.rating), 1) FROM reviews r JOIN products pr ON r.product_id = pr.id WHERE pr.seller_id = p.seller_id), 0) as seller_avg_rating,
                         (SELECT COUNT(r.id) FROM reviews r JOIN products pr ON r.product_id = pr.id WHERE pr.seller_id = p.seller_id) as seller_review_count,
                         (SELECT COUNT(c.id) FROM complaints c WHERE c.seller_id = p.seller_id AND c.status = 'pending') as seller_complaint_count
                  FROM " . $this->table_name . " p
                  LEFT JOIN categories c ON p.category_id = c.id
                  LEFT JOIN users u ON p.seller_id = u.id
                  LEFT JOIN sellers_info s ON p.seller_id = s.user_id
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

    // Update product (price, stock, title, description, specifications, image_url)
    public function update() {
        try {
            $this->conn->beginTransaction();

            $query = "UPDATE " . $this->table_name . " 
                      SET price = :price, 
                          stock_quantity = :stock_quantity" .
                          (!empty($this->title) ? ", title = :title" : "") .
                          (!empty($this->category_id) ? ", category_id = :category_id" : "") .
                          (isset($this->description) ? ", description = :description" : "") .
                          (!empty($this->specifications) ? ", specifications = :specifications" : "") .
                      " WHERE id = :id";
            
            if (!empty($this->seller_id)) {
                $query .= " AND seller_id = :seller_id";
            }

            $stmt = $this->conn->prepare($query);

            $stmt->bindParam(":price", $this->price);
            $stmt->bindParam(":stock_quantity", $this->stock_quantity);
            $stmt->bindParam(":id", $this->id);

            if (!empty($this->title)) {
                $this->title = htmlspecialchars(strip_tags($this->title));
                $stmt->bindParam(":title", $this->title);
            }
            if (!empty($this->category_id)) {
                $stmt->bindParam(":category_id", $this->category_id);
            }
            if (isset($this->description)) {
                $this->description = htmlspecialchars(strip_tags($this->description));
                $stmt->bindParam(":description", $this->description);
            }
            if (!empty($this->specifications)) {
                $stmt->bindParam(":specifications", $this->specifications);
            }
            if (!empty($this->seller_id)) {
                $stmt->bindParam(":seller_id", $this->seller_id);
            }

            if ($stmt->execute()) {
                if (!empty($this->image_url)) {
                    $check_img = $this->conn->prepare("SELECT id FROM product_images WHERE product_id = :product_id LIMIT 1");
                    $check_img->bindParam(":product_id", $this->id);
                    $check_img->execute();
                    if ($check_img->rowCount() > 0) {
                        $img_stmt = $this->conn->prepare("UPDATE product_images SET image_url = :image_url WHERE product_id = :product_id");
                    } else {
                        $img_stmt = $this->conn->prepare("INSERT INTO product_images SET product_id = :product_id, image_url = :image_url");
                    }
                    $img_stmt->bindParam(":image_url", $this->image_url);
                    $img_stmt->bindParam(":product_id", $this->id);
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

    // Delete product
    public function delete() {
        $query = "DELETE FROM " . $this->table_name . " WHERE id = :id";
        if (!empty($this->seller_id)) {
            $query .= " AND seller_id = :seller_id";
        }
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $this->id);
        if (!empty($this->seller_id)) {
            $stmt->bindParam(":seller_id", $this->seller_id);
        }
        return $stmt->execute();
    }
}
?>
