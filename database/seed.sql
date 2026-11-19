-- ====================================================================
-- UniTrade - Campus Online Marketplace for University Students
-- Uganda Christian University (UCU)
-- Sample Demonstration Seed Data
-- Default password for all sample accounts: UniTrade@2026
-- Bcrypt Hash: $2a$10$Vsg/aVtbzANC8ZyyTJxDqOQGZzkD.0opRquMgULYvbRopUZdW8f3C
-- ====================================================================

USE `unitrade_db`;

SET FOREIGN_KEY_CHECKS = 0;

-- --------------------------------------------------------------------
-- Seed Users (1 Admin, 3 Sellers, 3 Buyers)
-- --------------------------------------------------------------------
INSERT INTO `users` (`id`, `full_name`, `email`, `password`, `phone`, `role`, `campus_residence`, `student_id`, `status`) VALUES
-- System Administrator
(1, 'Dennis Kibirige (Admin)', 'admin@unitrade.ucu.ac.ug', '$2a$10$Vsg/aVtbzANC8ZyyTJxDqOQGZzkD.0opRquMgULYvbRopUZdW8f3C', '+256 772 100200', 'admin', 'Main Campus Administration Building', 'ADM/UCU/001', 'active'),

-- Student Sellers
(2, 'Grace Akello', 'grace.seller@ucu.ac.ug', '$2a$10$Vsg/aVtbzANC8ZyyTJxDqOQGZzkD.0opRquMgULYvbRopUZdW8f3C', '+256 701 445566', 'seller', 'Agape Hall, Block B, Room 204', 'S22/BBA/045', 'active'),
(3, 'Emmanuel Kato', 'emmanuel.seller@ucu.ac.ug', '$2a$10$Vsg/aVtbzANC8ZyyTJxDqOQGZzkD.0opRquMgULYvbRopUZdW8f3C', '+256 782 998877', 'seller', 'Soba Hostel, Room 14', 'S21/BCS/112', 'active'),
(4, 'Fiona Tumusiime', 'fiona.seller@ucu.ac.ug', '$2a$10$Vsg/aVtbzANC8ZyyTJxDqOQGZzkD.0opRquMgULYvbRopUZdW8f3C', '+256 753 112233', 'seller', 'Bishop Tucker Hall, Room 12', 'S23/LAW/088', 'active'),

-- Student Buyers
(5, 'Brian Okello', 'brian.buyer@ucu.ac.ug', '$2a$10$Vsg/aVtbzANC8ZyyTJxDqOQGZzkD.0opRquMgULYvbRopUZdW8f3C', '+256 774 332211', 'buyer', 'Sabiti Hall, Room 108', 'S24/BSIT/019', 'active'),
(6, 'Sarah Namubiru', 'sarah.buyer@ucu.ac.ug', '$2a$10$Vsg/aVtbzANC8ZyyTJxDqOQGZzkD.0opRquMgULYvbRopUZdW8f3C', '+256 705 667788', 'buyer', 'Allan Galpin Hall, Room 305', 'S23/BCOM/210', 'active'),
(7, 'David Mukasa', 'david.buyer@ucu.ac.ug', '$2a$10$Vsg/aVtbzANC8ZyyTJxDqOQGZzkD.0opRquMgULYvbRopUZdW8f3C', '+256 786 554433', 'buyer', 'Bugujju Off-Campus Residency', 'S22/BENG/074', 'active');

-- --------------------------------------------------------------------
-- Seed Products (17 Sample Listings Across All 6 Categories)
-- --------------------------------------------------------------------
INSERT INTO `items` (`id`, `seller_id`, `title`, `description`, `price`, `category`, `condition_state`, `image_url`, `is_available`, `status`) VALUES
-- Category 1: Textbooks and Academic Materials
(1, 2, 'Principles of Marketing (Kotler & Armstrong) 17th Ed.', 'Standard textbook for MGT and BBA business students at UCU. Clean pages with minimal pencil highlights. In excellent condition.', 45000.00, 'Textbooks and Academic Materials', 'Like New', 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80', TRUE, 'active'),
(2, 2, 'Business Law & Ethics in East Africa (3rd Edition)', 'Essential for Bachelor of Laws and Business Administration coursework. Complete with case summaries and statutes index.', 38000.00, 'Textbooks and Academic Materials', 'Used', 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80', TRUE, 'active'),
(3, 3, 'Calculus: Early Transcendentals (James Stewart 8th Ed.)', 'Comprehensive calculus textbook required for engineering, IT, and computer science courses. Includes problem solutions guide.', 50000.00, 'Textbooks and Academic Materials', 'Used', 'https://images.unsplash.com/photo-1532012164546-f432f2e3777a?w=600&auto=format&fit=crop&q=80', TRUE, 'active'),
(4, 3, 'Introduction to Java Programming & Data Structures', 'Used for BIT/BCS programming modules. Detailed explanations, object-oriented concepts, algorithm design, and code examples.', 55000.00, 'Textbooks and Academic Materials', 'Like New', 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=80', TRUE, 'active'),

-- Category 2: Electronics and Gadgets
(5, 3, 'HP Pavilion 15 Laptop (Intel Core i5, 8GB RAM, 512GB SSD)', 'Great laptop for research, programming, and online classes. Strong battery health (approx 4.5 hours), genuine Windows 11, with original charger.', 1250000.00, 'Electronics and Gadgets', 'Used', 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&auto=format&fit=crop&q=80', TRUE, 'active'),
(6, 2, 'Sony WH-CH520 Wireless Bluetooth Headphones', 'Comfortable over-ear headphones with 50-hour battery life and quick charge. Ideal for quiet study sessions in Hamu Mukasa Library.', 160000.00, 'Electronics and Gadgets', 'Like New', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80', TRUE, 'active'),
(7, 3, 'Casio fx-991EX Scientific ClassWiz Calculator', 'Original scientific calculator with natural textbook display and spreadsheet functions. Approved for university semester exams.', 75000.00, 'Electronics and Gadgets', 'Like New', 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=600&auto=format&fit=crop&q=80', TRUE, 'active'),
(8, 4, 'Anker 20,000mAh PowerCore Fast-Charging Power Bank', 'High capacity external battery pack. Can charge your smartphone 4 to 5 times. Includes dual USB ports and power IQ technology.', 95000.00, 'Electronics and Gadgets', 'New', 'https://images.unsplash.com/photo-1609592424361-b541315fcb1f?w=600&auto=format&fit=crop&q=80', TRUE, 'active'),

-- Category 3: Clothing and Fashion
(9, 4, 'UCU Branded Varsity Jacket (Navy & Gold, Size M)', 'Authentic university fleece varsity jacket with embroidered UCU crest. Warm, stylish, and perfect for Mukono evening weather.', 85000.00, 'Clothing and Fashion', 'Like New', 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&auto=format&fit=crop&q=80', TRUE, 'active'),
(10, 2, 'Formal Black Tailored Blazer (Size L)', 'Classic two-button formal suit jacket for community worship, class presentations, moot court, and formal university dinners.', 60000.00, 'Clothing and Fashion', 'Used', 'https://images.unsplash.com/photo-1598808503746-f34c53b9323e?w=600&auto=format&fit=crop&q=80', TRUE, 'active'),
(11, 3, 'Timberland Classic Waterproof Leather Boots (Size 42)', 'Durable rugged boots suitable for daily campus walking in all weather conditions. Well maintained leather.', 180000.00, 'Clothing and Fashion', 'Used', 'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=600&auto=format&fit=crop&q=80', TRUE, 'active'),

-- Category 4: Furniture and Accommodation Items
(12, 4, 'Orthopedic Single Foam Mattress (3x6 ft) + Free Cover', 'Comfortable single student mattress used for only one academic semester. Clean, sanitised and includes washable protective cover.', 120000.00, 'Furniture and Accommodation Items', 'Like New', 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&auto=format&fit=crop&q=80', TRUE, 'active'),
(13, 2, 'Compact Wooden Study Desk with Lockable Drawer', 'Sturdy wooden table tailored for student rooms and hostels around Mukono. Has a side shelf for notebooks and laptops.', 90000.00, 'Furniture and Accommodation Items', 'Used', 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=600&auto=format&fit=crop&q=80', TRUE, 'active'),
(14, 4, 'Electric Hot Plate Stove (Double Burner) for Hostel', 'Fast heating double burner stove with temperature control dials. Works efficiently and fits neatly on hostel kitchen countertops.', 65000.00, 'Furniture and Accommodation Items', 'Like New', 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=600&auto=format&fit=crop&q=80', TRUE, 'active'),

-- Category 5: Sports and Fitness
(15, 3, 'Nike Premier Firm-Ground Football Cleats (Size 43)', 'Professional football boots with moulded studs for grass pitches. Lightweight traction ideal for campus inter-faculty tournaments.', 110000.00, 'Sports and Fitness', 'Like New', 'https://images.unsplash.com/photo-1511886929837-354d827aae26?w=600&auto=format&fit=crop&q=80', TRUE, 'active'),
(16, 2, 'Pair of 10kg Rubber Coated Hex Dumbbells', 'Heavy duty cast iron hex dumbbells with anti-slip ergonomic chrome handles. Does not roll on the floor.', 80000.00, 'Sports and Fitness', 'Used', 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600&auto=format&fit=crop&q=80', TRUE, 'active'),

-- Category 6: Other Campus Essentials
(17, 2, 'Philips 1.7L Cordless Fast-Boil Electric Kettle', 'High performance stainless steel kettle. Boils water in under 3 minutes for tea, coffee, and quick noodles in student hostels.', 48000.00, 'Other Campus Essentials', 'Used', 'https://images.unsplash.com/photo-1577937927133-66ef06acdf18?w=600&auto=format&fit=crop&q=80', TRUE, 'active'),
(18, 4, 'Heavy Duty Campus Laptop Backpack (Water-resistant)', 'Spacious backpack with dedicated padded sleeve for 15.6 inch laptop, external USB charging port, and multiple organiser pockets.', 55000.00, 'Other Campus Essentials', 'New', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80', TRUE, 'active');

-- --------------------------------------------------------------------
-- Seed Sample Completed Orders, Order Items, Payments & Reviews
-- --------------------------------------------------------------------
-- Order 1: Completed purchase by Brian Okello from Grace Akello
INSERT INTO `orders` (`id`, `order_ref`, `buyer_id`, `total_amount`, `order_status`, `payment_status`, `payment_method`, `pickup_location`, `buyer_name`, `buyer_phone`, `notes`) VALUES
(1, 'ORD-UCU-2026-001', 5, 45000.00, 'Completed', 'Paid', 'Mobile Money (MTN MoMo)', 'Main Library Entrance (Hamu Mukasa Library)', 'Brian Okello', '+256 774 332211', 'Please bring it near the security desk.');

INSERT INTO `order_items` (`id`, `order_id`, `item_id`, `seller_id`, `price`, `quantity`) VALUES
(1, 1, 1, 2, 45000.00, 1);

INSERT INTO `payments` (`id`, `order_id`, `transaction_ref`, `amount`, `payment_method`, `phone_number`, `network_provider`, `status`, `is_simulated`) VALUES
(1, 1, 'MOMO-SIM-98231', 45000.00, 'Mobile Money (MTN MoMo)', '+256774332211', 'MTN Uganda', 'Successful', TRUE);

INSERT INTO `reviews` (`id`, `order_id`, `buyer_id`, `seller_id`, `rating`, `comment`) VALUES
(1, 1, 5, 2, 5, 'Great seller! The textbook was exactly as described and Grace met me promptly at the Hamu Mukasa Library.');

-- Order 2: Order in "Ready for Pickup" status for Sarah Namubiru from Emmanuel Kato
INSERT INTO `orders` (`id`, `order_ref`, `buyer_id`, `total_amount`, `order_status`, `payment_status`, `payment_method`, `pickup_location`, `buyer_name`, `buyer_phone`, `notes`) VALUES
(2, 'ORD-UCU-2026-002', 6, 75000.00, 'Ready for Pickup', 'Paid', 'Mobile Money (Airtel Money)', 'UCU Guild Canteen / Tech Park', 'Sarah Namubiru', '+256 705 667788', 'Available after 2:00 PM lecture.');

INSERT INTO `order_items` (`id`, `order_id`, `item_id`, `seller_id`, `price`, `quantity`) VALUES
(2, 2, 7, 3, 75000.00, 1);

INSERT INTO `payments` (`id`, `order_id`, `transaction_ref`, `amount`, `payment_method`, `phone_number`, `network_provider`, `status`, `is_simulated`) VALUES
(2, 2, 'AIRTEL-SIM-45210', 75000.00, 'Mobile Money (Airtel Money)', '+256705667788', 'Airtel Uganda', 'Successful', TRUE);

-- Order 3: Completed purchase by David Mukasa from Fiona Tumusiime
INSERT INTO `orders` (`id`, `order_ref`, `buyer_id`, `total_amount`, `order_status`, `payment_status`, `payment_method`, `pickup_location`, `buyer_name`, `buyer_phone`, `notes`) VALUES
(3, 'ORD-UCU-2026-003', 7, 95000.00, 'Completed', 'Paid', 'Cash on Pickup (Simulation)', 'Nkoyoyo Hall Steps', 'David Mukasa', '+256 786 554433', 'Will pay in cash upon inspecting the power bank.');

INSERT INTO `order_items` (`id`, `order_id`, `item_id`, `seller_id`, `price`, `quantity`) VALUES
(3, 3, 8, 4, 95000.00, 1);

INSERT INTO `payments` (`id`, `order_id`, `transaction_ref`, `amount`, `payment_method`, `phone_number`, `network_provider`, `status`, `is_simulated`) VALUES
(3, 3, 'CASH-SIM-12904', 95000.00, 'Cash on Pickup (Simulation)', '+256786554433', 'Cash', 'Successful', TRUE);

INSERT INTO `reviews` (`id`, `order_id`, `buyer_id`, `seller_id`, `rating`, `comment`) VALUES
(2, 3, 7, 4, 5, 'Fiona was very responsive. The Anker power bank is brand new and charges my phone super fast!');

-- --------------------------------------------------------------------
-- Seed Active Shopping Cart for Buyer Brian Okello
-- --------------------------------------------------------------------
INSERT INTO `cart` (`id`, `user_id`) VALUES
(1, 5),
(2, 6);

INSERT INTO `cart_items` (`id`, `cart_id`, `item_id`, `quantity`) VALUES
(1, 1, 6, 1),
(2, 1, 17, 1);

SET FOREIGN_KEY_CHECKS = 1;
