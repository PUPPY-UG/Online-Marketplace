-- ====================================================================
-- UniTrade - Campus Online Marketplace for University Students
-- Uganda Christian University (UCU) - Mukono Campus
-- Course: MGT3151 - E-Business, E-Commerce and E-Governance
-- Project Option: B - E-Commerce
-- Combined Complete Database (Schema + Seed Data)
-- ====================================================================

CREATE DATABASE IF NOT EXISTS `unitrade_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `unitrade_db`;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `reviews`;
DROP TABLE IF EXISTS `payments`;
DROP TABLE IF EXISTS `order_items`;
DROP TABLE IF EXISTS `orders`;
DROP TABLE IF EXISTS `cart_items`;
DROP TABLE IF EXISTS `cart`;
DROP TABLE IF EXISTS `items`;
DROP TABLE IF EXISTS `users`;

-- 1. Users Table
CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `full_name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(50) NOT NULL,
  `role` ENUM('buyer', 'seller', 'admin') NOT NULL DEFAULT 'buyer',
  `campus_residence` VARCHAR(150) DEFAULT 'Main Campus (Mukono)',
  `student_id` VARCHAR(50) DEFAULT NULL,
  `status` ENUM('active', 'deactivated') NOT NULL DEFAULT 'active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_users_email` (`email`),
  INDEX `idx_users_role` (`role`),
  INDEX `idx_users_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Items Table
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

-- 3. Cart Table
CREATE TABLE `cart` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL UNIQUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Cart Items Table
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

-- 5. Orders Table
CREATE TABLE `orders` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_ref` VARCHAR(50) NOT NULL UNIQUE,
  `buyer_id` INT NOT NULL,
  `total_amount` DECIMAL(12, 2) NOT NULL,
  `order_status` ENUM('Pending', 'Paid', 'Ready for Pickup', 'Completed', 'Cancelled') NOT NULL DEFAULT 'Pending',
  `payment_status` ENUM('Unpaid', 'Paid', 'Refunded') NOT NULL DEFAULT 'Unpaid',
  `payment_method` VARCHAR(100) NOT NULL DEFAULT 'Mobile Money (Simulation)',
  `pickup_location` VARCHAR(255) NOT NULL,
  `buyer_name` VARCHAR(150) NOT NULL,
  `buyer_phone` VARCHAR(50) NOT NULL,
  `notes` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`buyer_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_orders_ref` (`order_ref`),
  INDEX `idx_orders_buyer` (`buyer_id`),
  INDEX `idx_orders_status` (`order_status`),
  INDEX `idx_orders_payment_status` (`payment_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Order Items Table
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

-- 7. Payments Table
CREATE TABLE `payments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_id` INT NOT NULL UNIQUE,
  `transaction_ref` VARCHAR(100) NOT NULL UNIQUE,
  `amount` DECIMAL(12, 2) NOT NULL,
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

-- 8. Reviews Table
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

-- Insert Demonstration Users
INSERT INTO `users` (`id`, `full_name`, `email`, `password`, `phone`, `role`, `campus_residence`, `student_id`, `status`) VALUES
(1, 'Dennis Kibirige (Admin)', 'admin@unitrade.ucu.ac.ug', '$2a$10$Vsg/aVtbzANC8ZyyTJxDqOQGZzkD.0opRquMgULYvbRopUZdW8f3C', '+256 772 100200', 'admin', 'Main Campus Administration Building', 'ADM/UCU/001', 'active'),
(2, 'Grace Akello', 'grace.seller@ucu.ac.ug', '$2a$10$Vsg/aVtbzANC8ZyyTJxDqOQGZzkD.0opRquMgULYvbRopUZdW8f3C', '+256 701 445566', 'seller', 'Agape Hall, Block B, Room 204', 'S22/BBA/045', 'active'),
(3, 'Emmanuel Kato', 'emmanuel.seller@ucu.ac.ug', '$2a$10$Vsg/aVtbzANC8ZyyTJxDqOQGZzkD.0opRquMgULYvbRopUZdW8f3C', '+256 782 998877', 'seller', 'Soba Hostel, Room 14', 'S21/BCS/112', 'active'),
(4, 'Fiona Tumusiime', 'fiona.seller@ucu.ac.ug', '$2a$10$Vsg/aVtbzANC8ZyyTJxDqOQGZzkD.0opRquMgULYvbRopUZdW8f3C', '+256 753 112233', 'seller', 'Bishop Tucker Hall, Room 12', 'S23/LAW/088', 'active'),
(5, 'Brian Okello', 'brian.buyer@ucu.ac.ug', '$2a$10$Vsg/aVtbzANC8ZyyTJxDqOQGZzkD.0opRquMgULYvbRopUZdW8f3C', '+256 774 332211', 'buyer', 'Sabiti Hall, Room 108', 'S24/BSIT/019', 'active'),
(6, 'Sarah Namubiru', 'sarah.buyer@ucu.ac.ug', '$2a$10$Vsg/aVtbzANC8ZyyTJxDqOQGZzkD.0opRquMgULYvbRopUZdW8f3C', '+256 705 667788', 'buyer', 'Allan Galpin Hall, Room 305', 'S23/BCOM/210', 'active'),
(7, 'David Mukasa', 'david.buyer@ucu.ac.ug', '$2a$10$Vsg/aVtbzANC8ZyyTJxDqOQGZzkD.0opRquMgULYvbRopUZdW8f3C', '+256 786 554433', 'buyer', 'Bugujju Off-Campus Residency', 'S22/BENG/074', 'active');

-- Insert Sample Products
INSERT INTO `items` (`id`, `seller_id`, `title`, `description`, `price`, `category`, `condition_state`, `image_url`, `is_available`, `status`) VALUES
(1, 2, 'Principles of Marketing (Kotler & Armstrong) 17th Ed.', 'Standard textbook for MGT and BBA business students at UCU. Clean pages with minimal pencil highlights. In excellent condition.', 45000.00, 'Textbooks and Academic Materials', 'Like New', 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80', TRUE, 'active'),
(2, 2, 'Business Law & Ethics in East Africa (3rd Edition)', 'Essential for Bachelor of Laws and Business Administration coursework. Complete with case summaries and statutes index.', 38000.00, 'Textbooks and Academic Materials', 'Used', 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80', TRUE, 'active'),
(3, 3, 'Calculus: Early Transcendentals (James Stewart 8th Ed.)', 'Comprehensive calculus textbook required for engineering, IT, and computer science courses. Includes problem solutions guide.', 50000.00, 'Textbooks and Academic Materials', 'Used', 'https://images.unsplash.com/photo-1532012164546-f432f2e3777a?w=600&auto=format&fit=crop&q=80', TRUE, 'active'),
(4, 3, 'Introduction to Java Programming & Data Structures', 'Used for BIT/BCS programming modules. Detailed explanations, object-oriented concepts, algorithm design, and code examples.', 55000.00, 'Textbooks and Academic Materials', 'Like New', 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=80', TRUE, 'active'),
(5, 3, 'HP Pavilion 15 Laptop (Intel Core i5, 8GB RAM, 512GB SSD)', 'Great laptop for research, programming, and online classes. Strong battery health (approx 4.5 hours), genuine Windows 11, with original charger.', 1250000.00, 'Electronics and Gadgets', 'Used', 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&auto=format&fit=crop&q=80', TRUE, 'active'),
(6, 2, 'Sony WH-CH520 Wireless Bluetooth Headphones', 'Comfortable over-ear headphones with 50-hour battery life and quick charge. Ideal for quiet study sessions in Hamu Mukasa Library.', 160000.00, 'Electronics and Gadgets', 'Like New', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80', TRUE, 'active'),
(7, 3, 'Casio fx-991EX Scientific ClassWiz Calculator', 'Original scientific calculator with natural textbook display and spreadsheet functions. Approved for university semester exams.', 75000.00, 'Electronics and Gadgets', 'Like New', 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=600&auto=format&fit=crop&q=80', TRUE, 'active'),
(8, 4, 'Anker 20,000mAh PowerCore Fast-Charging Power Bank', 'High capacity external battery pack. Can charge your smartphone 4 to 5 times. Includes dual USB ports and power IQ technology.', 95000.00, 'Electronics and Gadgets', 'New', 'https://images.unsplash.com/photo-1609592424361-b541315fcb1f?w=600&auto=format&fit=crop&q=80', TRUE, 'active'),
(9, 4, 'UCU Branded Varsity Jacket (Navy & Gold, Size M)', 'Authentic university fleece varsity jacket with embroidered UCU crest. Warm, stylish, and perfect for Mukono evening weather.', 85000.00, 'Clothing and Fashion', 'Like New', 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&auto=format&fit=crop&q=80', TRUE, 'active'),
(10, 2, 'Formal Black Tailored Blazer (Size L)', 'Classic two-button formal suit jacket for community worship, class presentations, moot court, and formal university dinners.', 60000.00, 'Clothing and Fashion', 'Used', 'https://images.unsplash.com/photo-1598808503746-f34c53b9323e?w=600&auto=format&fit=crop&q=80', TRUE, 'active'),
(11, 3, 'Timberland Classic Waterproof Leather Boots (Size 42)', 'Durable rugged boots suitable for daily campus walking in all weather conditions. Well maintained leather.', 180000.00, 'Clothing and Fashion', 'Used', 'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=600&auto=format&fit=crop&q=80', TRUE, 'active'),
(12, 4, 'Orthopedic Single Foam Mattress (3x6 ft) + Free Cover', 'Comfortable single student mattress used for only one academic semester. Clean, sanitised and includes washable protective cover.', 120000.00, 'Furniture and Accommodation Items', 'Like New', 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&auto=format&fit=crop&q=80', TRUE, 'active'),
(13, 2, 'Compact Wooden Study Desk with Lockable Drawer', 'Sturdy wooden table tailored for student rooms and hostels around Mukono. Has a side shelf for notebooks and laptops.', 90000.00, 'Furniture and Accommodation Items', 'Used', 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=600&auto=format&fit=crop&q=80', TRUE, 'active'),
(14, 4, 'Electric Hot Plate Stove (Double Burner) for Hostel', 'Fast heating double burner stove with temperature control dials. Works efficiently and fits neatly on hostel kitchen countertops.', 65000.00, 'Furniture and Accommodation Items', 'Like New', 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=600&auto=format&fit=crop&q=80', TRUE, 'active'),
(15, 3, 'Nike Premier Firm-Ground Football Cleats (Size 43)', 'Professional football boots with moulded studs for grass pitches. Lightweight traction ideal for campus inter-faculty tournaments.', 110000.00, 'Sports and Fitness', 'Like New', 'https://images.unsplash.com/photo-1511886929837-354d827aae26?w=600&auto=format&fit=crop&q=80', TRUE, 'active'),
(16, 2, 'Pair of 10kg Rubber Coated Hex Dumbbells', 'Heavy duty cast iron hex dumbbells with anti-slip ergonomic chrome handles. Does not roll on the floor.', 80000.00, 'Sports and Fitness', 'Used', 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600&auto=format&fit=crop&q=80', TRUE, 'active'),
(17, 2, 'Philips 1.7L Cordless Fast-Boil Electric Kettle', 'High performance stainless steel kettle. Boils water in under 3 minutes for tea, coffee, and quick noodles in student hostels.', 48000.00, 'Other Campus Essentials', 'Used', 'https://images.unsplash.com/photo-1577937927133-66ef06acdf18?w=600&auto=format&fit=crop&q=80', TRUE, 'active'),
(18, 4, 'Heavy Duty Campus Laptop Backpack (Water-resistant)', 'Spacious backpack with dedicated padded sleeve for 15.6 inch laptop, external USB charging port, and multiple organiser pockets.', 55000.00, 'Other Campus Essentials', 'New', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80', TRUE, 'active');

-- Insert Sample Orders & Items
INSERT INTO `orders` (`id`, `order_ref`, `buyer_id`, `total_amount`, `order_status`, `payment_status`, `payment_method`, `pickup_location`, `buyer_name`, `buyer_phone`, `notes`) VALUES
(1, 'ORD-UCU-2026-001', 5, 45000.00, 'Completed', 'Paid', 'Mobile Money (MTN MoMo)', 'Main Library Entrance (Hamu Mukasa Library)', 'Brian Okello', '+256 774 332211', 'Please bring it near the security desk.'),
(2, 'ORD-UCU-2026-002', 6, 75000.00, 'Ready for Pickup', 'Paid', 'Mobile Money (Airtel Money)', 'UCU Guild Canteen / Tech Park', 'Sarah Namubiru', '+256 705 667788', 'Available after 2:00 PM lecture.'),
(3, 'ORD-UCU-2026-003', 7, 95000.00, 'Completed', 'Paid', 'Cash on Pickup (Simulation)', 'Nkoyoyo Hall Steps', 'David Mukasa', '+256 786 554433', 'Will pay in cash upon inspecting the power bank.');

INSERT INTO `order_items` (`id`, `order_id`, `item_id`, `seller_id`, `price`, `quantity`) VALUES
(1, 1, 1, 2, 45000.00, 1),
(2, 2, 7, 3, 75000.00, 1),
(3, 3, 8, 4, 95000.00, 1);

INSERT INTO `payments` (`id`, `order_id`, `transaction_ref`, `amount`, `payment_method`, `phone_number`, `network_provider`, `status`, `is_simulated`) VALUES
(1, 1, 'MOMO-SIM-98231', 45000.00, 'Mobile Money (MTN MoMo)', '+256774332211', 'MTN Uganda', 'Successful', TRUE),
(2, 2, 'AIRTEL-SIM-45210', 75000.00, 'Mobile Money (Airtel Money)', '+256705667788', 'Airtel Uganda', 'Successful', TRUE),
(3, 3, 'CASH-SIM-12904', 95000.00, 'Cash on Pickup (Simulation)', '+256786554433', 'Cash', 'Successful', TRUE);

INSERT INTO `reviews` (`id`, `order_id`, `buyer_id`, `seller_id`, `rating`, `comment`) VALUES
(1, 1, 5, 2, 5, 'Great seller! The textbook was exactly as described and Grace met me promptly at the Hamu Mukasa Library.'),
(2, 3, 7, 4, 5, 'Fiona was very responsive. The Anker power bank is brand new and charges my phone super fast!');

INSERT INTO `cart` (`id`, `user_id`) VALUES
(1, 5),
(2, 6);

INSERT INTO `cart_items` (`id`, `cart_id`, `item_id`, `quantity`) VALUES
(1, 1, 6, 1),
(2, 1, 17, 1);

SET FOREIGN_KEY_CHECKS = 1;
