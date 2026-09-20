<?php
// backend/models/User.php
class User {
    private $conn;
    private $table_name = "users";

    public $id;
    public $first_name;
    public $last_name;
    public $email;
    public $password;
    public $role;
    public $phone;
    public $address;
    public $shop_name;

    public function __construct($db) {
        $this->conn = $db;
        // Ensure columns exist independently
        try {
            $this->conn->exec("ALTER TABLE `users` ADD COLUMN `phone` VARCHAR(20) NULL AFTER `role`");
        } catch(Exception $e) {}
        try {
            $this->conn->exec("ALTER TABLE `users` ADD COLUMN `address` TEXT NULL AFTER `phone`");
        } catch(Exception $e) {}
    }

    // Register a new user
    public function register() {
        $query = "INSERT INTO " . $this->table_name . " 
                  SET first_name=:first_name, last_name=:last_name, email=:email, password=:password, role=:role, phone=:phone, address=:address";
        
        $stmt = $this->conn->prepare($query);

        // Sanitize inputs
        $this->first_name = htmlspecialchars(strip_tags($this->first_name));
        $this->last_name = htmlspecialchars(strip_tags($this->last_name));
        $this->email = htmlspecialchars(strip_tags($this->email));
        $this->role = htmlspecialchars(strip_tags($this->role));
        $this->phone = htmlspecialchars(strip_tags($this->phone ?? ''));
        $this->address = htmlspecialchars(strip_tags($this->address ?? ''));
        
        // Hash the password securely
        $password_hash = password_hash($this->password, PASSWORD_BCRYPT);

        // Bind values
        $stmt->bindParam(":first_name", $this->first_name);
        $stmt->bindParam(":last_name", $this->last_name);
        $stmt->bindParam(":email", $this->email);
        $stmt->bindParam(":password", $password_hash);
        $stmt->bindParam(":role", $this->role);
        $stmt->bindParam(":phone", $this->phone);
        $stmt->bindParam(":address", $this->address);

        if ($stmt->execute()) {
            $this->id = $this->conn->lastInsertId();

            // If seller and shop_name provided, insert into sellers_info
            if ($this->role === 'seller' || !empty($this->shop_name)) {
                try {
                    $sellerQuery = "INSERT INTO sellers_info (user_id, shop_name, phone, address, is_verified, warning_count) 
                                    VALUES (:uid, :shop_name, :phone, :address, 0, 0)";
                    $sellerStmt = $this->conn->prepare($sellerQuery);
                    $shopName = !empty($this->shop_name) ? $this->shop_name : $this->first_name . "'s Hardware";
                    $sellerStmt->bindParam(":uid", $this->id);
                    $sellerStmt->bindParam(":shop_name", $shopName);
                    $sellerStmt->bindParam(":phone", $this->phone);
                    $sellerStmt->bindParam(":address", $this->address);
                    $sellerStmt->execute();
                } catch(Exception $e) {}
            }

            return true;
        }
        return false;
    }

    // Login user
    public function login() {
        $query = "SELECT u.id, u.first_name, u.last_name, u.email, u.password, u.role, u.phone, u.address, s.shop_name 
                  FROM " . $this->table_name . " u 
                  LEFT JOIN sellers_info s ON u.id = s.user_id 
                  WHERE u.email = ? LIMIT 0,1";
        
        $stmt = $this->conn->prepare($query);
        $this->email = htmlspecialchars(strip_tags($this->email));
        $stmt->bindParam(1, $this->email);
        $stmt->execute();

        if ($stmt->rowCount() > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            // Verify password hash
            if (password_verify($this->password, $row['password'])) {
                $this->id = $row['id'];
                $this->first_name = $row['first_name'];
                $this->last_name = $row['last_name'];
                $this->role = $row['role'];
                $this->phone = $row['phone'] ?? '';
                $this->address = $row['address'] ?? '';
                $this->shop_name = $row['shop_name'] ?? '';
                return true;
            }
        }
        return false;
    }

    // Check if email already exists
    public function emailExists() {
        $query = "SELECT id FROM " . $this->table_name . " WHERE email = ? LIMIT 0,1";
        
        $stmt = $this->conn->prepare($query);
        $this->email = htmlspecialchars(strip_tags($this->email));
        $stmt->bindParam(1, $this->email);
        $stmt->execute();
        
        if ($stmt->rowCount() > 0) {
            return true;
        }
        return false;
    }
}
?>
