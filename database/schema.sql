-- ====================================================================
-- UniTrade - Campus Online Marketplace for University Students
-- Uganda Christian University (UCU) - Mukono Campus
-- Course: MGT3151 - E-Business, E-Commerce and E-Governance
-- Project Option: B - E-Commerce
-- Database Schema (MySQL)
-- ====================================================================

CREATE DATABASE IF NOT EXISTS `unitrade_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `unitrade_db`;

-- Disable foreign key checks during schema rebuild
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `otp_verifications`;
DROP TABLE IF EXISTS `email_notifications`;
DROP TABLE IF EXISTS `reviews`;
DROP TABLE IF EXISTS `payments`;
DROP TABLE IF EXISTS `order_items`;
DROP TABLE IF EXISTS `orders`;
DROP TABLE IF EXISTS `cart_items`;
DROP TABLE IF EXISTS `cart`;
DROP TABLE IF EXISTS `items`;
DROP TABLE IF EXISTS `users`;

-- --------------------------------------------------------------------
-- 1. USERS TABLE
-- Stores buyers, sellers, and system administrators
-- Password is required for admin; buyers/sellers authenticate via OTP
-- --------------------------------------------------------------------
CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `full_name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `password` VARCHAR(255) NULL, -- Hashed with bcrypt for admin, NULL/optional for OTP users
  `phone` VARCHAR(50) NOT NULL,
  `role` ENUM('buyer', 'seller', 'admin') NOT NULL DEFAULT 'buyer',
  `campus_residence` VARCHAR(150) DEFAULT 'Main Campus (Mukono)',
  `student_id` VARCHAR(50) DEFAULT NULL,
  `email_verified` BOOLEAN NOT NULL DEFAULT FALSE,
  `status` ENUM('active', 'deactivated') NOT NULL DEFAULT 'active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_users_email` (`email`),
  INDEX `idx_users_role` (`role`),
  INDEX `idx_users_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 2. ITEMS (PRODUCTS) TABLE
-- Products listed for sale by campus sellers
-- --------------------------------------------------------------------
CREATE TABLE `items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `seller_id` INT NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NOT NULL,
  `price` DECIMAL(12, 2) NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `condition_state` ENUM('New', 'Like New', 'Used') NOT NULL DEFAULT 'Used',
  `image_url` VARCHAR(500) NOT NULL,
  `is_available` BOOLEAN NOT NULL DEFAULT TRUE,
  `status` ENUM('active', 'sold', 'deactivated') NOT NULL DEFAULT 'active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`seller_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_items_seller` (`seller_id`),
  INDEX `idx_items_category` (`category`),
  INDEX `idx_items_status` (`status`),
  INDEX `idx_items_price` (`price`),
  INDEX `idx_items_availability` (`is_available`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 3. CART TABLE
-- Active shopping cart for registered users
-- --------------------------------------------------------------------
CREATE TABLE `cart` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL UNIQUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 4. CART ITEMS TABLE
-- Individual items inside a user's shopping cart
-- --------------------------------------------------------------------
CREATE TABLE `cart_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `cart_id` INT NOT NULL,
  `item_id` INT NOT NULL,
  `quantity` INT NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`cart_id`) REFERENCES `cart`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`item_id`) REFERENCES `items`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `unique_cart_product` (`cart_id`, `item_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 5. ORDERS TABLE
-- Orders placed by buyers for campus pickup
-- Includes compulsory buyer email, ready_for_pickup and completed dates
-- --------------------------------------------------------------------
CREATE TABLE `orders` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_ref` VARCHAR(50) NOT NULL UNIQUE,
  `buyer_id` INT NOT NULL,
  `buyer_email` VARCHAR(150) NOT NULL,
  `total_amount` DECIMAL(12, 2) NOT NULL,
  `order_status` ENUM('Pending Payment', 'Paid', 'Accepted', 'Preparing', 'Ready for Pickup', 'Completed', 'Cancelled') NOT NULL DEFAULT 'Paid',
  `payment_status` ENUM('Unpaid', 'Paid', 'Refunded', 'Pending') NOT NULL DEFAULT 'Paid',
  `payment_method` VARCHAR(100) NOT NULL DEFAULT 'MTN Mobile Money',
  `pickup_location` VARCHAR(255) NOT NULL,
  `buyer_name` VARCHAR(150) NOT NULL,
  `buyer_phone` VARCHAR(50) NOT NULL,
  `notes` TEXT NULL,
  `ready_for_pickup_date` DATETIME NULL,
  `completed_date` DATETIME NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`buyer_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_orders_ref` (`order_ref`),
  INDEX `idx_orders_buyer` (`buyer_id`),
  INDEX `idx_orders_email` (`buyer_email`),
  INDEX `idx_orders_status` (`order_status`),
  INDEX `idx_orders_payment_status` (`payment_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 6. ORDER ITEMS TABLE
-- Line items associated with each placed order
-- --------------------------------------------------------------------
CREATE TABLE `order_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_id` INT NOT NULL,
  `item_id` INT NOT NULL,
  `seller_id` INT NOT NULL,
  `price` DECIMAL(12, 2) NOT NULL,
  `quantity` INT NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`item_id`) REFERENCES `items`(`id`) ON DELETE RESTRICT,
  FOREIGN KEY (`seller_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_order_items_order` (`order_id`),
  INDEX `idx_order_items_seller` (`seller_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 7. PAYMENTS TABLE
-- Campus payment records: MTN Mobile Money, Airtel Money, PayPal
-- --------------------------------------------------------------------
CREATE TABLE `payments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_id` INT NOT NULL UNIQUE,
  `transaction_ref` VARCHAR(100) NOT NULL UNIQUE,
  `amount` DECIMAL(12, 2) NOT NULL,
  `currency` VARCHAR(10) NOT NULL DEFAULT 'UGX',
  `payment_method` VARCHAR(100) NOT NULL,
  `phone_number` VARCHAR(50) NULL,
  `network_provider` VARCHAR(50) NULL,
  `status` ENUM('Successful', 'Failed', 'Pending') NOT NULL DEFAULT 'Successful',
  `is_simulated` BOOLEAN NOT NULL DEFAULT TRUE,
  `paid_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE,
  INDEX `idx_payments_order` (`order_id`),
  INDEX `idx_payments_trans_ref` (`transaction_ref`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 8. EMAIL NOTIFICATIONS TABLE
-- Logs automated campus email notifications (Ready for Pickup, OTP, etc.)
-- --------------------------------------------------------------------
CREATE TABLE `email_notifications` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_id` INT NULL,
  `recipient_email` VARCHAR(150) NOT NULL,
  `notification_type` VARCHAR(50) NOT NULL, -- e.g. 'READY_FOR_PICKUP', 'OTP', 'ORDER_CONFIRMATION'
  `delivery_status` ENUM('Sent', 'Failed', 'Pending') NOT NULL DEFAULT 'Sent',
  `sent_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `error_message` TEXT NULL,
  FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE SET NULL,
  INDEX `idx_email_order` (`order_id`),
  INDEX `idx_email_recipient` (`recipient_email`),
  INDEX `idx_email_type` (`notification_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 9. OTP VERIFICATIONS TABLE
-- Stores hashed one-time passwords for passwordless email login/registration
-- --------------------------------------------------------------------
CREATE TABLE `otp_verifications` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NULL,
  `email` VARCHAR(150) NOT NULL,
  `otp_hash` VARCHAR(255) NOT NULL,
  `expiry_time` DATETIME NOT NULL,
  `verified_status` BOOLEAN NOT NULL DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_otp_email` (`email`),
  INDEX `idx_otp_expiry` (`expiry_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 10. REVIEWS TABLE
-- Seller ratings and reviews left by buyers after completed orders
-- --------------------------------------------------------------------
CREATE TABLE `reviews` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_id` INT NOT NULL UNIQUE,
  `buyer_id` INT NOT NULL,
  `seller_id` INT NOT NULL,
  `rating` INT NOT NULL CHECK (`rating` >= 1 AND `rating` <= 5),
  `comment` TEXT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`buyer_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`seller_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_reviews_seller` (`seller_id`),
  INDEX `idx_reviews_buyer` (`buyer_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
