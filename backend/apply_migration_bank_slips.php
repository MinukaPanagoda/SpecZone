<?php
// backend/apply_migration_bank_slips.php
require_once __DIR__ . '/config/db.php';

header("Content-Type: text/plain");
echo "Running SpecZone Bank Slip Payment Migrations...\n";

try {
    // 1. Ensure uploads directory exists
    $uploadDir = __DIR__ . '/uploads/slips';
    if (!file_exists($uploadDir)) {
        mkdir($uploadDir, 0777, true);
        echo "Created uploads/slips directory.\n";
    }

    // 2. Add payment_method column to orders
    try {
        $conn->exec("ALTER TABLE `orders` ADD COLUMN `payment_method` VARCHAR(50) NOT NULL DEFAULT 'cod' AFTER `total_amount`");
        echo "Added payment_method column to orders.\n";
    } catch (Exception $e) {
        echo "orders.payment_method column notice: " . $e->getMessage() . "\n";
    }

    // 3. Add payment columns to order_items
    try {
        $conn->exec("ALTER TABLE `order_items` ADD COLUMN `payment_method` VARCHAR(50) NOT NULL DEFAULT 'cod' AFTER `unit_price`");
        echo "Added payment_method column to order_items.\n";
    } catch (Exception $e) {
        echo "order_items.payment_method column notice: " . $e->getMessage() . "\n";
    }

    try {
        $conn->exec("ALTER TABLE `order_items` ADD COLUMN `payment_status` ENUM('cod', 'pending_slip', 'under_review', 'approved', 'rejected') NOT NULL DEFAULT 'cod' AFTER `payment_method`");
        echo "Added payment_status column to order_items.\n";
    } catch (Exception $e) {
        echo "order_items.payment_status column notice: " . $e->getMessage() . "\n";
    }

    try {
        $conn->exec("ALTER TABLE `order_items` ADD COLUMN `payment_slip_url` TEXT NULL DEFAULT NULL AFTER `payment_status`");
        echo "Added payment_slip_url column to order_items.\n";
    } catch (Exception $e) {
        echo "order_items.payment_slip_url column notice: " . $e->getMessage() . "\n";
    }

    try {
        $conn->exec("ALTER TABLE `order_items` ADD COLUMN `payment_reject_reason` TEXT NULL DEFAULT NULL AFTER `payment_slip_url`");
        echo "Added payment_reject_reason column to order_items.\n";
    } catch (Exception $e) {
        echo "order_items.payment_reject_reason column notice: " . $e->getMessage() . "\n";
    }

    try {
        $conn->exec("ALTER TABLE `order_items` ADD COLUMN `payment_reviewed_at` DATETIME NULL DEFAULT NULL AFTER `payment_reject_reason`");
        echo "Added payment_reviewed_at column to order_items.\n";
    } catch (Exception $e) {
        echo "order_items.payment_reviewed_at column notice: " . $e->getMessage() . "\n";
    }

    echo "\nBank slip migrations applied successfully!\n";
} catch (Exception $e) {
    echo "Fatal error during migration: " . $e->getMessage() . "\n";
}
