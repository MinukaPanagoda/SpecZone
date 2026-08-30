<?php
class Build {
    private $conn;
    private $table_builds = "build_lists";
    private $table_items = "build_items";

    public $id;
    public $buyer_id;
    public $build_name;
    public $created_at;

    public function __construct($db) {
        $this->conn = $db;
    }

    // Get all builds for a buyer
    public function getBuilds($buyer_id) {
        $query = "SELECT id, buyer_id, build_name, created_at 
                  FROM " . $this->table_builds . " 
                  WHERE buyer_id = :buyer_id 
                  ORDER BY created_at DESC";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':buyer_id', $buyer_id);
        $stmt->execute();

        $builds = array();

        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $build_id = $row['id'];

            // Get items for this build
            $item_query = "
                SELECT bi.id as item_id, bi.product_id,
                       p.title, p.price, p.stock_quantity, p.category_id, p.specifications,
                       c.name as category_name,
                       (SELECT image_url FROM product_images WHERE product_id = p.id LIMIT 1) as image_url,
                       u.first_name as seller_name
                FROM " . $this->table_items . " bi
                JOIN products p ON bi.product_id = p.id
                LEFT JOIN categories c ON p.category_id = c.id
                LEFT JOIN users u ON p.seller_id = u.id
                WHERE bi.build_id = :build_id
            ";
            $item_stmt = $this->conn->prepare($item_query);
            $item_stmt->bindParam(':build_id', $build_id);
            $item_stmt->execute();

            $items = $item_stmt->fetchAll(PDO::FETCH_ASSOC);

            $total_price = 0;
            foreach ($items as &$item) {
                $total_price += floatval($item['price']);
                $item['specs'] = json_decode($item['specifications'] ?? "{}");
            }
            unset($item);

            $row['items'] = $items;
            $row['total_price'] = $total_price;
            $row['item_count'] = count($items);

            array_push($builds, $row);
        }

        return $builds;
    }

    // Create a new build
    public function createBuild($buyer_id, $build_name, $product_ids) {
        if (empty($product_ids)) return false;

        try {
            $this->conn->beginTransaction();

            $query = "INSERT INTO " . $this->table_builds . " (buyer_id, build_name) VALUES (:buyer_id, :build_name)";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':buyer_id', $buyer_id);
            $stmt->bindParam(':build_name', $build_name);
            $stmt->execute();

            $build_id = $this->conn->lastInsertId();

            $item_query = "INSERT INTO " . $this->table_items . " (build_id, product_id) VALUES (:build_id, :product_id)";
            $item_stmt = $this->conn->prepare($item_query);

            foreach ($product_ids as $pid) {
                if (!empty($pid)) {
                    $pid_int = intval($pid);
                    $item_stmt->bindParam(':build_id', $build_id);
                    $item_stmt->bindParam(':product_id', $pid_int);
                    $item_stmt->execute();
                }
            }

            $this->conn->commit();
            return $build_id;
        } catch (Exception $e) {
            $this->conn->rollBack();
            return false;
        }
    }

    // Delete a build
    public function deleteBuild($buyer_id, $build_id) {
        $query = "DELETE FROM " . $this->table_builds . " WHERE id = :build_id AND buyer_id = :buyer_id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':build_id', $build_id);
        $stmt->bindParam(':buyer_id', $buyer_id);
        return $stmt->execute();
    }
}
?>
