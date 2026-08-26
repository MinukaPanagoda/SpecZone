<?php
//Testing database connection

echo "<h1>Testing Database Connection</h1>";
require_once __DIR__ . "/config/db.php";

if (isset($conn) && $conn instanceof PDO) {
    echo "<br>SUCCESS! Database connected successfully! <br><br>";
    echo "Connection info: " .
        $conn->getAttribute(PDO::ATTR_CONNECTION_STATUS) .
        "<br><br>";

    try {
        $stmt = $conn->query("SELECT 1");
        echo "Query test passed!<br>";
    } catch (Exception $e) {
        echo "Query test failed: " . $e->getMessage() . "<br>";
    }
} else {
    echo "<br>FAILED! The \$conn variable was not created properly<br>";
}
?>
