SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;


CREATE TABLE `build_items` (
  `id` int(11) NOT NULL,
  `build_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `build_lists` (
  `id` int(11) NOT NULL,
  `buyer_id` int(11) NOT NULL,
  `build_name` varchar(100) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `cart` (
  `id` int(11) NOT NULL,
  `buyer_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `quantity` int(11) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `categories` (
  `id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `description` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `categories` (`id`, `name`, `description`) VALUES
(1, 'Processors (CPU)', NULL),
(2, 'Graphics Cards (GPU)', NULL),
(3, 'Motherboards', NULL),
(4, 'Memory (RAM)', NULL),
(5, 'Storage (SSD/HDD)', NULL),
(6, 'Power Supplies (PSU)', NULL),
(7, 'Cases', NULL),
(8, 'Cooling', NULL);

CREATE TABLE `complaints` (
  `id` int(11) NOT NULL,
  `seller_id` int(11) NOT NULL,
  `buyer_id` int(11) NOT NULL,
  `reason` text NOT NULL,
  `status` enum('pending','resolved') DEFAULT 'pending'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `complaints` (`id`, `seller_id`, `buyer_id`, `reason`, `status`) VALUES
(1, 8, 5, 'ko', 'resolved'),
(2, 8, 5, 'oh my order', 'resolved'),
(3, 8, 5, 'seller', 'pending'),
(4, 8, 5, 'darn', 'pending');

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `buyer_id` int(11) NOT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `orders` (`id`, `buyer_id`, `total_amount`, `created_at`) VALUES
(1, 1, 12000.00, '2026-07-12 19:27:32'),
(2, 1, 12134.00, '2026-07-12 20:17:01'),
(3, 5, 291000.00, '2026-08-14 10:06:44'),
(4, 5, 142000.00, '2026-08-14 10:46:14'),
(5, 5, 97000.00, '2026-08-16 19:27:49'),
(6, 5, 23423.00, '2026-08-17 10:30:15'),
(7, 5, 1400.00, '2026-08-17 10:40:23'),
(8, 5, 500000.00, '2026-08-17 17:57:09'),
(9, 5, 501400.00, '2026-08-17 18:07:27'),
(10, 5, 546400.00, '2026-08-18 08:02:15'),
(11, 5, 25000.00, '2026-08-18 08:09:44'),
(12, 1, 268.00, '2026-08-18 09:38:08'),
(13, 5, 500000.00, '2026-08-18 16:17:47'),
(14, 5, 40000.00, '2026-08-18 16:18:20'),
(15, 5, 80000.00, '2026-08-18 18:11:49'),
(16, 5, 97000.00, '2026-08-26 09:42:27');

CREATE TABLE `order_items` (
  `id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  `status` enum('pending','shipped','delivered') NOT NULL DEFAULT 'pending'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `quantity`, `unit_price`, `status`) VALUES
(1, 1, 1, 1, 12000.00, 'pending'),
(2, 2, 1, 1, 12000.00, 'shipped'),
(3, 2, 2, 1, 134.00, 'pending'),
(4, 3, 3, 3, 45000.00, 'pending'),
(5, 3, 4, 3, 52000.00, 'pending'),
(6, 4, 4, 1, 52000.00, 'pending'),
(7, 4, 3, 2, 45000.00, 'pending'),
(8, 5, 3, 1, 45000.00, 'pending'),
(9, 5, 4, 1, 52000.00, 'pending'),
(10, 6, 10, 1, 23423.00, 'shipped'),
(11, 7, 11, 1, 1400.00, 'pending'),
(12, 8, 12, 1, 500000.00, 'delivered'),
(13, 9, 12, 1, 500000.00, 'shipped'),
(14, 9, 11, 1, 1400.00, 'pending'),
(15, 10, 12, 1, 500000.00, 'delivered'),
(16, 10, 11, 1, 1400.00, 'pending'),
(17, 10, 3, 1, 45000.00, 'pending'),
(18, 11, 5, 1, 25000.00, 'pending'),
(19, 12, 2, 2, 134.00, 'shipped'),
(20, 13, 12, 1, 500000.00, 'pending'),
(21, 14, 13, 1, 40000.00, 'pending'),
(22, 15, 13, 2, 40000.00, 'delivered'),
(23, 16, 3, 1, 45000.00, 'pending'),
(24, 16, 4, 1, 52000.00, 'pending');

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `seller_id` int(11) NOT NULL,
  `category_id` int(11) NOT NULL,
  `title` varchar(150) NOT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `stock_quantity` int(11) DEFAULT 0,
  `specifications` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`specifications`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `products` (`id`, `seller_id`, `category_id`, `title`, `description`, `price`, `stock_quantity`, `specifications`, `created_at`) VALUES
(1, 2, 7, 'MS50', '', 12000.00, 8, '{}', '2026-07-12 19:09:18'),
(2, 2, 3, 'ma43', '', 134.00, 1, '{}', '2026-07-12 20:14:38'),
(3, 1, 1, 'Intel Core i5-12400F', 'Great budget CPU for gaming.', 45000.00, 2, '{\"Socket\":\"LGA1700\",\"Cores\":\"6\",\"Threads\":\"12\"}', '2026-07-13 05:15:38'),
(4, 1, 1, 'AMD Ryzen 5 5600X', 'Fast and reliable AMD processor.', 52000.00, 9, '{\"Socket\":\"AM4\",\"Cores\":\"6\",\"Threads\":\"12\"}', '2026-07-13 05:15:38'),
(5, 1, 3, 'MSI PRO H610M-G DDR4', 'LGA1700 motherboard for Intel 12th/13th gen.', 25000.00, 4, '{\"Socket\":\"LGA1700\",\"Memory Type\":\"DDR4\",\"Form Factor\":\"mATX\"}', '2026-07-13 05:15:38'),
(6, 1, 3, 'ASUS Prime B550M-A', 'AM4 motherboard for Ryzen 5000 series.', 28000.00, 8, '{\"Socket\":\"AM4\",\"Memory Type\":\"DDR4\",\"Form Factor\":\"mATX\"}', '2026-07-13 05:15:38'),
(7, 1, 4, 'Corsair Vengeance LPX 16GB (2x8GB)', 'Fast DDR4 memory.', 15000.00, 20, '{\"Memory Type\":\"DDR4\",\"Speed\":\"3200MHz\",\"Capacity\":\"16GB\"}', '2026-07-13 05:15:38'),
(8, 1, 4, 'Kingston Fury Beast 16GB', 'Next-gen DDR5 memory.', 22000.00, 12, '{\"Memory Type\":\"DDR5\",\"Speed\":\"5200MHz\",\"Capacity\":\"16GB\"}', '2026-07-13 05:15:38'),
(9, 1, 2, 'NVIDIA GeForce RTX 3060', 'Great 1080p gaming graphics card.', 110000.00, 4, '{\"VRAM\":\"12GB\",\"Core Clock\":\"1.32GHz\"}', '2026-07-13 05:15:38'),
(10, 8, 5, 'fromorignl', 'min', 23423.00, 2, '{\"Socket\":\"LGA1700\",\"Cores\":\"6\",\"Threads\":\"12\"}', '2026-08-17 10:28:48'),
(11, 8, 4, 'formnewSZ', 'RAM within CPU\ncool product huh', 1400.00, 23, '{\"Socket\":\"LGA1700\",\"Cores\":\"6\",\"Threads\":\"12\"}', '2026-08-17 10:39:13'),
(12, 8, 2, 'GeForce RTX 4090 Vladilena Milize', 'geforce rtx 4090 vladilena milize anime inspired special edition gpu', 500000.00, 8, '{\"GPU\":\"4090\"}', '2026-08-17 17:45:10'),
(13, 8, 4, 'XPS D50 Long Yao ROG STRIX', 'Asia-exclusive', 40000.00, 3, '{\"Capacity\":\"32GB\",\"gen\":\"DDR4\"}', '2026-08-18 16:11:18');

CREATE TABLE `product_images` (
  `id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `image_url` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `product_images` (`id`, `product_id`, `image_url`) VALUES
(1, 3, 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=400&q=80'),
(2, 4, 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=400&q=80'),
(3, 5, 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&q=80'),
(4, 6, 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&q=80'),
(5, 7, 'https://images.unsplash.com/photo-1562976540-1502c2145186?w=400&q=80'),
(6, 8, 'https://images.unsplash.com/photo-1562976540-1502c2145186?w=400&q=80'),
(7, 9, 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=400&q=80'),
(8, 10, 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&q=80'),
(9, 11, 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&q=80'),
(10, 12, 'http://localhost/SpecZone/frontend/src/img/GeForce_RTX_4090_Vladilena_Milize.jpg'),
(11, 13, 'http://localhost/SpecZone/frontend/src/img/XPS_D50_Long_Yao_ROG_STRIX.webp');

CREATE TABLE `reviews` (
  `id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `buyer_id` int(11) NOT NULL,
  `rating` int(11) DEFAULT NULL,
  `comment` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `reviews` (`id`, `product_id`, `buyer_id`, `rating`, `comment`, `created_at`) VALUES
(1, 2, 1, 3, 'dont trust the seller', '2026-07-13 06:02:43'),
(2, 2, 1, 5, '2wqe', '2026-07-13 06:07:22'),
(3, 2, 1, 10, 'adw', '2026-07-13 06:14:17'),
(4, 3, 5, 10, 'isfake?', '2026-08-14 15:53:51'),
(5, 13, 5, 10, 'oool', '2026-08-18 16:28:54');

CREATE TABLE `sellers_info` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `shop_name` varchar(100) NOT NULL,
  `address` text DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `warning_count` int(11) DEFAULT 0,
  `is_verified` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('buyer','seller','admin') DEFAULT 'buyer',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `users` (`id`, `first_name`, `last_name`, `email`, `password`, `role`, `created_at`) VALUES
(1, 'Lahiru', 'Gajaweera', 'lahirugajaweera3@gmail.com', '$2y$10$ZUKqqxt2J.LVxtwc5u5Xbu.yGvelmkeJgARjzxLkQjwEc8SKz635S', 'buyer', '2026-07-12 17:52:40'),
(2, 'Minuka', 'Panagoda', 'minuka@gmail.com', '$2y$10$ZUKqqxt2J.LVxtwc5u5Xbu.yGvelmkeJgARjzxLkQjwEc8SKz635S', 'seller', '2026-07-12 17:55:26'),
(3, 'Samitha', 'Nipun', 'sami@gmail.com', '$2y$10$ZUKqqxt2J.LVxtwc5u5Xbu.yGvelmkeJgARjzxLkQjwEc8SKz635S', 'seller', '2026-07-13 05:23:05'),
(4, 'System', 'Admin', 'admin@speczone.com', '$2y$10$ZUKqqxt2J.LVxtwc5u5Xbu.yGvelmkeJgARjzxLkQjwEc8SKz635S', 'admin', '2026-07-13 07:56:14'),
(5, 'neko', 'kuro', 'neko@gmail.com', '$2y$10$ZUKqqxt2J.LVxtwc5u5Xbu.yGvelmkeJgARjzxLkQjwEc8SKz635S', 'buyer', '2026-08-13 04:32:00'),
(6, 'erin', 'yogokuro', 'erin@gmail.com', '$2y$10$fR8NCFORvewoI3sVIyp3xO/OOzfvK2d5fjHlsq.2XFMZbM6dOcjWO', 'buyer', '2026-08-13 04:39:58'),
(7, 'wei', 'helios', 'wei@gmail.com', '$2y$10$j/YO3v4ue4LdzSY5CDjYz.WHnN0BsKAxAMP.dSDz/RhbI6dUsoGdK', 'buyer', '2026-08-15 14:44:31'),
(8, 'ina', 'nis', 'ina@gmail.com', '$2y$10$dLwbCjkRE7or.ARzspfy5OwiD33Hx4KaXiSgAY2vOKYcwWAEVEyBC', 'seller', '2026-08-15 15:01:11'),
(9, 'towa', 'takoyami', 'towa@gmail.com', '$2y$10$qQDYaVwbl0obTS4kpWNi8.vS1OlhsJH6ECfmvAMnPj4aI3mTck06K', 'admin', '2026-08-15 15:02:12');

CREATE TABLE `wishlist` (
  `id` int(11) NOT NULL,
  `buyer_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


ALTER TABLE `build_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `build_id` (`build_id`),
  ADD KEY `product_id` (`product_id`);

ALTER TABLE `build_lists`
  ADD PRIMARY KEY (`id`),
  ADD KEY `buyer_id` (`buyer_id`);

ALTER TABLE `cart`
  ADD PRIMARY KEY (`id`),
  ADD KEY `buyer_id` (`buyer_id`),
  ADD KEY `product_id` (`product_id`);

ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `complaints`
  ADD PRIMARY KEY (`id`),
  ADD KEY `seller_id` (`seller_id`),
  ADD KEY `buyer_id` (`buyer_id`);

ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `buyer_id` (`buyer_id`);

ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `product_id` (`product_id`);

ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `seller_id` (`seller_id`),
  ADD KEY `category_id` (`category_id`);

ALTER TABLE `product_images`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_id` (`product_id`);

ALTER TABLE `reviews`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_id` (`product_id`),
  ADD KEY `buyer_id` (`buyer_id`);

ALTER TABLE `sellers_info`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

ALTER TABLE `wishlist`
  ADD PRIMARY KEY (`id`),
  ADD KEY `buyer_id` (`buyer_id`),
  ADD KEY `product_id` (`product_id`);


ALTER TABLE `build_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `build_lists`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `cart`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

ALTER TABLE `complaints`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

ALTER TABLE `order_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

ALTER TABLE `product_images`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

ALTER TABLE `reviews`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

ALTER TABLE `sellers_info`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

ALTER TABLE `wishlist`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;


ALTER TABLE `build_items`
  ADD CONSTRAINT `build_items_ibfk_1` FOREIGN KEY (`build_id`) REFERENCES `build_lists` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `build_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

ALTER TABLE `build_lists`
  ADD CONSTRAINT `build_lists_ibfk_1` FOREIGN KEY (`buyer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

ALTER TABLE `cart`
  ADD CONSTRAINT `cart_ibfk_1` FOREIGN KEY (`buyer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `cart_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

ALTER TABLE `complaints`
  ADD CONSTRAINT `complaints_ibfk_1` FOREIGN KEY (`seller_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `complaints_ibfk_2` FOREIGN KEY (`buyer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`buyer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`);

ALTER TABLE `products`
  ADD CONSTRAINT `products_ibfk_1` FOREIGN KEY (`seller_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `products_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`);

ALTER TABLE `product_images`
  ADD CONSTRAINT `product_images_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

ALTER TABLE `reviews`
  ADD CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`buyer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

ALTER TABLE `sellers_info`
  ADD CONSTRAINT `sellers_info_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

ALTER TABLE `wishlist`
  ADD CONSTRAINT `wishlist_ibfk_1` FOREIGN KEY (`buyer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `wishlist_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
