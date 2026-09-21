<?php
// backend/apply_migration_payouts.php
require_once __DIR__ . '/config/db.php';

header("Content-Type: text/plain");
echo "Running SpecZone Payout & Delivery Migrations...\n";

try {
    // 1. Add payout columns to order_items
    try {
        $conn->exec("ALTER TABLE `order_items` ADD COLUMN `payout_status` ENUM('pending', 'paid') NOT NULL DEFAULT 'pending' AFTER `status`");
        echo "Added payout_status column to order_items.\n";
    } catch (Exception $e) {
        echo "payout_status column already exists or ignored: " . $e->getMessage() . "\n";
    }

    try {
        $conn->exec("ALTER TABLE `order_items` ADD COLUMN `payout_date` DATETIME NULL DEFAULT NULL AFTER `payout_status`");
        echo "Added payout_date column to order_items.\n";
    } catch (Exception $e) {
        echo "payout_date column already exists or ignored: " . $e->getMessage() . "\n";
    }

    try {
        $conn->exec("ALTER TABLE `order_items` ADD COLUMN `payout_ref` VARCHAR(100) NULL DEFAULT NULL AFTER `payout_date`");
        echo "Added payout_ref column to order_items.\n";
    } catch (Exception $e) {
        echo "payout_ref column already exists or ignored: " . $e->getMessage() . "\n";
    }

    // 2. Add bank detail columns to sellers_info
    try {
        $conn->exec("ALTER TABLE `sellers_info` ADD COLUMN `bank_name` VARCHAR(100) NULL DEFAULT NULL AFTER `is_verified`");
        echo "Added bank_name column to sellers_info.\n";
    } catch (Exception $e) {
        echo "bank_name column already exists or ignored: " . $e->getMessage() . "\n";
    }

    try {
        $conn->exec("ALTER TABLE `sellers_info` ADD COLUMN `bank_account_number` VARCHAR(50) NULL DEFAULT NULL AFTER `bank_name`");
        echo "Added bank_account_number column to sellers_info.\n";
    } catch (Exception $e) {
        echo "bank_account_number column already exists or ignored: " . $e->getMessage() . "\n";
    }

    try {
        $conn->exec("ALTER TABLE `sellers_info` ADD COLUMN `bank_account_name` VARCHAR(100) NULL DEFAULT NULL AFTER `bank_account_number`");
        echo "Added bank_account_name column to sellers_info.\n";
    } catch (Exception $e) {
        echo "bank_account_name column already exists or ignored: " . $e->getMessage() . "\n";
    }

    try {
        $conn->exec("ALTER TABLE `sellers_info` ADD COLUMN `bank_branch` VARCHAR(100) NULL DEFAULT NULL AFTER `bank_account_name`");
        echo "Added bank_branch column to sellers_info.\n";
    } catch (Exception $e) {
        echo "bank_branch column already exists or ignored: " . $e->getMessage() . "\n";
    }

    echo "\nAll migrations completed successfully!\n";
} catch (Exception $e) {
    echo "Migration failed with error: " . $e->getMessage() . "\n";
}
?>
