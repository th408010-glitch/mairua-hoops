-- ====================================================================
-- MAIRUA HOOPS - HỆ THỐNG CƠ SỞ DỮ LIỆU THƯƠNG MẠI ĐIỆN TỬ BÓNG RỔ
-- Brand: mairua.com (Mascot: Rùa Chiến Binh Hoops)
-- Database: MySQL / MariaDB (utf8mb4_unicode_ci)
-- ====================================================================

CREATE DATABASE IF NOT EXISTS `mairua_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `mairua_db`;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `product_reviews`;
DROP TABLE IF EXISTS `coupon_usages`;
DROP TABLE IF EXISTS `coupons`;
DROP TABLE IF EXISTS `order_items`;
DROP TABLE IF EXISTS `orders`;
DROP TABLE IF EXISTS `product_variants`;
DROP TABLE IF EXISTS `products`;
DROP TABLE IF EXISTS `addresses`;
DROP TABLE IF EXISTS `accounts`;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. BẢNG ACCOUNTS (Tài khoản người dùng & Quản trị viên)
CREATE TABLE `accounts` (
    `phone` VARCHAR(20) PRIMARY KEY,
    `pass_hash` VARCHAR(255) NOT NULL,
    `name` VARCHAR(150) NOT NULL,
    `email` VARCHAR(150) DEFAULT NULL,
    `orders_count` INT DEFAULT 0,
    `mcoin` INT DEFAULT 0,
    `ai_tokens` INT DEFAULT 3,
    `tier_level` VARCHAR(50) DEFAULT 'Đồng',
    `is_admin` BOOLEAN DEFAULT FALSE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. BẢNG ADDRESSES (Sổ địa chỉ giao hàng)
CREATE TABLE `addresses` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `account_phone` VARCHAR(20) NOT NULL,
    `recipient_name` VARCHAR(150) NOT NULL,
    `recipient_phone` VARCHAR(20) NOT NULL,
    `province` VARCHAR(100) NOT NULL,
    `ward` VARCHAR(100) NOT NULL,
    `street` VARCHAR(255) NOT NULL,
    `full_address` TEXT NOT NULL,
    `is_default` BOOLEAN DEFAULT FALSE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`account_phone`) REFERENCES `accounts`(`phone`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. BẢNG PRODUCTS (37 Sản phẩm bóng rổ gốc)
CREATE TABLE `products` (
    `id` INT PRIMARY KEY,
    `cat` ENUM('balo', 'bong', 'vo', 'ao', 'combat') NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `price` DECIMAL(12, 2) NOT NULL,
    `has_size` BOOLEAN DEFAULT FALSE,
    `sizes_json` JSON DEFAULT NULL,
    `is_combat_pants` BOOLEAN DEFAULT FALSE,
    `is_jersey_blank` BOOLEAN DEFAULT FALSE,
    `is_shorts` BOOLEAN DEFAULT FALSE,
    `is_protective_gear` BOOLEAN DEFAULT FALSE,
    `gear_type` VARCHAR(50) DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. BẢNG PRODUCT_VARIANTS (Biến thể màu sắc, kiểu cắt, hình ảnh, tồn kho)
CREATE TABLE `product_variants` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `product_id` INT NOT NULL,
    `color_name` VARCHAR(100) NOT NULL,
    `base_color` VARCHAR(50) DEFAULT NULL,
    `cut_style` VARCHAR(50) DEFAULT NULL,
    `hex` VARCHAR(20) DEFAULT '#000000',
    `stock` INT DEFAULT 10,
    `sold` INT DEFAULT 0,
    `img_url` TEXT NOT NULL,
    FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. BẢNG ORDERS (Đơn hàng & Quy trình duyệt 5 bước sản xuất)
CREATE TABLE `orders` (
    `order_code` VARCHAR(50) PRIMARY KEY,
    `account_phone` VARCHAR(20) DEFAULT NULL,
    `customer_name` VARCHAR(150) NOT NULL,
    `customer_phone` VARCHAR(20) NOT NULL,
    `customer_addr` TEXT NOT NULL,
    `subtotal` DECIMAL(12, 2) NOT NULL,
    `discount_amt` DECIMAL(12, 2) DEFAULT 0.00,
    `used_mcoin` DECIMAL(12, 2) DEFAULT 0.00,
    `earned_mcoin` DECIMAL(12, 2) DEFAULT 0.00,
    `cashback_percent` INT DEFAULT 5,
    `shipping_fee` DECIMAL(12, 2) DEFAULT 30000.00,
    `final_total` DECIMAL(12, 2) NOT NULL,
    `coupon_used` VARCHAR(50) DEFAULT NULL,
    `has_custom_jersey` BOOLEAN DEFAULT FALSE,
    `jersey_count` INT DEFAULT 0,
    `status_step_idx` INT DEFAULT 0 COMMENT '0: Chờ xác nhận, 1: Xuất file, 2: Đang in/ép DTF, 3: QC đóng gói, 4: Giao hàng',
    `admin_confirmed` BOOLEAN DEFAULT FALSE,
    `is_cancelled` BOOLEAN DEFAULT FALSE,
    `needs_invoice` BOOLEAN DEFAULT FALSE,
    `invoice_info_json` JSON DEFAULT NULL,
    `start_time` BIGINT NOT NULL,
    `confirmed_at` BIGINT DEFAULT NULL,
    `delivered_at` BIGINT DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`account_phone`) REFERENCES `accounts`(`phone`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. BẢNG ORDER_ITEMS (Chi tiết từng món trong đơn & Thiết kế Custom)
CREATE TABLE `order_items` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `order_code` VARCHAR(50) NOT NULL,
    `product_id` INT DEFAULT NULL,
    `variant_index` INT DEFAULT 0,
    `item_name` VARCHAR(255) NOT NULL,
    `sub_info` VARCHAR(255) DEFAULT NULL,
    `unit_price` DECIMAL(12, 2) NOT NULL,
    `qty` INT NOT NULL DEFAULT 1,
    `custom_design_json` JSON DEFAULT NULL COMMENT 'Lưu cấu hình in Balo, SVG Jersey, danh sách Roster',
    FOREIGN KEY (`order_code`) REFERENCES `orders`(`order_code`) ON DELETE CASCADE,
    FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. BẢNG COUPONS (Mã giảm giá theo % có hạn 48h)
CREATE TABLE `coupons` (
    `code` VARCHAR(50) PRIMARY KEY,
    `percent` INT NOT NULL,
    `created_at` BIGINT NOT NULL,
    `target_phone` VARCHAR(20) DEFAULT NULL COMMENT 'NULL nếu áp dụng toàn sàn, hoặc SĐT chỉ định',
    `is_active` BOOLEAN DEFAULT TRUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. BẢNG COUPON_USAGES (Lịch sử sử dụng mã)
CREATE TABLE `coupon_usages` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `code` VARCHAR(50) NOT NULL,
    `account_phone` VARCHAR(20) NOT NULL,
    `used_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`code`) REFERENCES `coupons`(`code`) ON DELETE CASCADE,
    FOREIGN KEY (`account_phone`) REFERENCES `accounts`(`phone`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. BẢNG PRODUCT_REVIEWS (Đánh giá chuẩn Shopee sau khi nhận hàng)
CREATE TABLE `product_reviews` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `product_id` INT NOT NULL,
    `order_code` VARCHAR(50) DEFAULT NULL,
    `account_phone` VARCHAR(20) DEFAULT NULL,
    `author_name` VARCHAR(150) NOT NULL,
    `stars` INT NOT NULL DEFAULT 5,
    `comment` TEXT,
    `images_json` JSON DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================================
-- DỮ LIỆU MẪU (SEED DATA: TÀI KHOẢN, SỔ ĐỊA CHỈ, COUPONS)
-- ====================================================================

-- Tài khoản Admin và Khách hàng
-- Admin mật khẩu: 5888 (bcrypt: $2b$10$wK1F5Nf9Kk30tHvhw0aC6.2uGf578HhMce/6j4LzGj.W9U6W0F7xW hoặc '5888')
-- Khách mật khẩu: 123 (bcrypt: $2b$10$eO71c77V2x2iZf.F7x8pce/48V0F.q77kH6V8L4X9Z8mY5yqg8Wye hoặc '123')
INSERT INTO `accounts` (`phone`, `pass_hash`, `name`, `email`, `orders_count`, `mcoin`, `ai_tokens`, `tier_level`, `is_admin`) VALUES
('0909501753', '$2b$10$wK1F5Nf9Kk30tHvhw0aC6.2uGf578HhMce/6j4LzGj.W9U6W0F7xW', 'Quản Trị Viên (Admin)', 'admin@mairua.com', 99, 0, 99, 'Kim Cương', TRUE),
('0909123456', '$2b$10$eO71c77V2x2iZf.F7x8pce/48V0F.q77kH6V8L4X9Z8mY5yqg8Wye', 'Hoàng Minh Thắng', 'thanghoang@gmail.com', 2, 50000, 3, 'Đồng', FALSE),
('0982734991', '$2b$10$eO71c77V2x2iZf.F7x8pce/48V0F.q77kH6V8L4X9Z8mY5yqg8Wye', 'Minh Minh', 'minhminh@gmail.com', 3, 20000, 4, 'Bạc', FALSE);

-- Sổ địa chỉ mẫu
INSERT INTO `addresses` (`account_phone`, `recipient_name`, `recipient_phone`, `province`, `ward`, `street`, `full_address`, `is_default`) VALUES
('0909123456', 'Hoàng Minh Thắng', '0909123456', 'TP. Hồ Chí Minh', 'Phường Bến Nghé, Quận 1', '45 Lê Duẩn', '45 Lê Duẩn, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh', TRUE),
('0982734991', 'Minh Minh', '0982734991', 'TP. Hồ Chí Minh', 'Phường 14, Quận 10', '12 Nguyễn Trãi', '12 Nguyễn Trãi, Phường 14, Quận 10, TP. Hồ Chí Minh', TRUE);

-- Mã giảm giá mẫu (48h)
INSERT INTO `coupons` (`code`, `percent`, `created_at`, `target_phone`, `is_active`) VALUES
('MRHOOPS10', 10, 1793600000000, NULL, TRUE),
('VIPBASKETBALL', 15, 1793600000000, '0909123456', TRUE),
('MINHMINH20', 20, 1793600000000, '0982734991', TRUE);

-- ====================================================================
-- SEED 37 SẢN PHẨM & CÁC BIẾN THỂ MÀU SẮC / TỒN KHO
-- ====================================================================
INSERT INTO `products` (`id`, `cat`, `name`, `price`, `has_size`, `sizes_json`, `is_combat_pants`, `is_jersey_blank`, `is_shorts`, `is_protective_gear`, `gear_type`) VALUES
(1, 'balo', 'Nike Elite V1 Basketball Backpack', 520000, 0, NULL, 0, 0, 0, 0, NULL),
(2, 'balo', 'Nike Elite V2 Pro Backpack', 650000, 0, NULL, 0, 0, 0, 0, NULL),
(3, 'balo', 'Nike Elite V3 Ultimate Edition', 850000, 0, NULL, 0, 0, 0, 0, NULL),
(4, 'balo', 'Nike Utility Speed Training Backpack', 890000, 0, NULL, 0, 0, 0, 0, NULL),
(5, 'bong', 'Bóng Rổ Molten GG7X Sân Indoor', 680000, 1, '["Size 5","Size 6","Size 7"]', 0, 0, 0, 0, NULL),
(6, 'bong', 'Bóng Rổ Molten B7G4500 Da Tổng Hợp', 620000, 1, '["Size 5","Size 6","Size 7"]', 0, 0, 0, 0, NULL),
(7, 'bong', 'Bóng Rổ AK Pro Cao Su Thi Đấu', 520000, 1, '["Size 5","Size 6","Size 7"]', 0, 0, 0, 0, NULL),
(8, 'bong', 'Bóng Rổ AK Pro Outdoor Chống Mài Mòn', 450000, 1, '["Size 5","Size 6","Size 7"]', 0, 0, 0, 0, NULL),
(9, 'bong', 'Bóng Rổ Stepback Pro Series Size 7', 580000, 1, '["Size 5","Size 6","Size 7"]', 0, 0, 0, 0, NULL),
(10, 'bong', 'Bóng Rổ Stepback Street Outdoor', 490000, 1, '["Size 5","Size 6","Size 7"]', 0, 0, 0, 0, NULL),
(11, 'vo', 'Vớ Chống Trượt Nike Elite Crew Trắng', 150000, 1, '["S (38-40)","M (41-42)","L (43-45)"]', 0, 0, 0, 0, NULL),
(12, 'vo', 'Vớ Chống Trượt Nike Elite Crew Đen', 150000, 1, '["S (38-40)","M (41-42)","L (43-45)"]', 0, 0, 0, 0, NULL),
(13, 'vo', 'Vớ Trutechsocks Đệm Dày Cao Cấp', 220000, 1, '["M (39-41)","L (42-44)"]', 0, 0, 0, 0, NULL),
(14, 'ao', 'Áo Jersey Los Angeles Lakers Edition', 225000, 1, '["S","M","L","XL","2XL"]', 0, 0, 0, 0, NULL),
(15, 'ao', 'Áo Jersey Chicago Bulls Retro Red', 225000, 1, '["S","M","L","XL","2XL"]', 0, 0, 0, 0, NULL),
(16, 'ao', 'Áo Jersey Bóng Rổ Golden State Warriors', 240000, 1, '["S","M","L","XL","2XL"]', 0, 0, 0, 0, NULL),
(17, 'ao', 'Áo Jersey Bóng Rổ New York (NYC) City Edition', 250000, 1, '["S","M","L","XL","2XL"]', 0, 0, 0, 0, NULL),
(18, 'ao', 'Áo Jersey Bóng Rổ Đội Tuyển Việt Nam', 230000, 1, '["S","M","L","XL","2XL"]', 0, 0, 0, 0, NULL),
(19, 'combat', 'Áo Combat Bóng Rổ Ngắn Tay Giữ Nhiệt', 180000, 1, '["S","M","L","XL","2XL"]', 0, 0, 0, 0, NULL),
(20, 'combat', 'Áo Combat Bóng Rổ Ba Lỗ Chuyên Dụng', 165000, 1, '["S","M","L","XL","2XL"]', 0, 0, 0, 0, NULL),
(21, 'combat', 'Quần Combat Bóng Rổ Pro (Ngắn / Dài / Lệch)', 195000, 1, '["S","M","L","XL","2XL"]', 1, 0, 0, 0, NULL),
(22, 'ao', 'Phôi Áo Jersey Custom Teamwear (Đủ Màu Phôi)', 200000, 1, '["S","M","L","XL","2XL"]', 0, 1, 0, 0, NULL),
(23, 'ao', 'Quần Bóng Rổ Swingman USA Olympic 2024', 210000, 1, '["S","M","L","XL","2XL"]', 0, 0, 1, 0, NULL),
(24, 'ao', 'Quần Bóng Rổ Los Angeles Lakers Swingman', 205000, 1, '["S","M","L","XL","2XL"]', 0, 0, 1, 0, NULL),
(25, 'ao', 'Quần Bóng Rổ Chicago Bulls Classic Red', 205000, 1, '["S","M","L","XL","2XL"]', 0, 0, 1, 0, NULL),
(26, 'ao', 'Quần Bóng Rổ Golden State Warriors City Edition', 210000, 1, '["S","M","L","XL","2XL"]', 0, 0, 1, 0, NULL),
(27, 'ao', 'Quần Bóng Rổ Miami Heat Vice Edition', 215000, 1, '["S","M","L","XL","2XL"]', 0, 0, 1, 0, NULL),
(28, 'ao', 'Quần Bóng Rổ Boston Celtics Pro Mesh', 205000, 1, '["S","M","L","XL","2XL"]', 0, 0, 1, 0, NULL),
(29, 'combat', 'Sói hoang hư hỏng', 185000, 1, '["S","M","L","XL","2XL"]', 0, 0, 1, 0, NULL),
(30, 'combat', 'Chúa sơn lâm', 190000, 1, '["S","M","L","XL","2XL"]', 0, 0, 1, 0, NULL),
(31, 'combat', 'Hoa hồng nở rộ bốn mùa', 190000, 1, '["S","M","L","XL","2XL"]', 0, 0, 1, 0, NULL),
(32, 'combat', 'Tôi thích trái dưa của bạn', 185000, 1, '["S","M","L","XL","2XL"]', 0, 0, 1, 0, NULL),
(33, 'combat', 'Ché ri che rì che ri', 185000, 1, '["S","M","L","XL","2XL"]', 0, 0, 1, 0, NULL),
(34, 'combat', 'Xiềng xích đồng tiền', 195000, 1, '["S","M","L","XL","2XL"]', 0, 0, 1, 0, NULL),
(35, 'combat', 'Bó gối giảm chấn công thái học', 240000, 1, '["S","M","L"]', 0, 0, 0, 1, 'knee'),
(36, 'combat', 'Bó gối thể thao có đệm', 220000, 1, '["S","M","L"]', 0, 0, 0, 1, 'knee'),
(37, 'combat', 'Băng quấn cổ chân', 175000, 1, '["S","M","L"]', 0, 0, 0, 1, 'ankle');

INSERT INTO `product_variants` (`product_id`, `color_name`, `base_color`, `cut_style`, `hex`, `stock`, `sold`, `img_url`) VALUES
(1, 'Trắng Đen', NULL, NULL, '#ffffff', 8, 28, 'https://tse3.mm.bing.net/th/id/OIP.KAJ_f9qd6ZGbo6KwGWC8lQHaGg?r=0&rs=1&pid=ImgDetMain&o=7&rm=3'),
(1, 'Đen Vàng Gold', NULL, NULL, '#222222', 5, 19, 'https://images.prodirectsport.com/ProductImages/Gallery_1/232760_Gallery_1_0845199.jpg'),
(1, 'Đỏ Đen', NULL, NULL, '#e74c3c', 6, 14, 'https://tse3.mm.bing.net/th/id/OIP.J2Geh4Li-tMVLDVOr8JJOwHaJS?r=0&rs=1&pid=ImgDetMain&o=7&rm=3'),
(2, 'Xanh Đen', NULL, NULL, '#2c3e50', 6, 15, 'https://m.media-amazon.com/images/I/81tqai0YQeL._AC_UY1000_.jpg'),
(2, 'Xám Bạc', NULL, NULL, '#bdc3c7', 4, 9, 'https://tse3.mm.bing.net/th/id/OIP.mkdGKLhnOyIMfwa3Z3RKvwHaHa?r=0&rs=1&pid=ImgDetMain&o=7&rm=3'),
(2, 'Đen Tuyền', NULL, NULL, '#111111', 5, 17, 'https://tse4.mm.bing.net/th/id/OIP.W4l3i7seO1sz3dJdQTikogHaHa?r=0&rs=1&pid=ImgDetMain&o=7&rm=3'),
(3, 'Đen Phối Cam', NULL, NULL, '#e67e22', 4, 11, 'https://classic.cdn.media.amplience.net/i/hibbett/00B9Z_8025_main/Nike%20Varsity%20Elite%20Backpack-Orange/Black-8025?$large$'),
(3, 'Trắng Tinh Khôi', NULL, NULL, '#f8f9fa', 3, 7, 'https://classic.cdn.media.amplience.net/i/hibbett/004PQ_9124_main/Nike%20Varsity%20Elite%20Backpack%20-%20White-9124'),
(3, 'Xanh Dương', NULL, NULL, '#2980b9', 4, 6, 'https://m.media-amazon.com/images/I/81tqai0YQeL._AC_UY1000_.jpg'),
(4, 'Đen Nhám', NULL, NULL, '#34495e', 5, 12, 'https://tse4.mm.bing.net/th/id/OIP.7F5Q5lppNKQD5JcJgCtpNAHaHa?r=0&rs=1&pid=ImgDetMain&o=7&rm=3'),
(4, 'Xanh Rêu', NULL, NULL, '#7f8c8d', 4, 8, 'https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/46dc627a-1b91-4ec9-a0a1-f007feba4a46/NK+UTILITY+ELITE+BKPK+-+2.0.png'),
(4, 'Xám Khói', NULL, NULL, '#95a5a6', 3, 4, 'https://www.nike.sa/dw/image/v2/BDVB_PRD/on/demandware.static/-/Sites-akeneo-master-catalog/default/dwf8e2b749/nk/b33/3/5/0/0/a/b333500a_7fdf_43e3_bbf6_782173cd8c43.jpg'),
(5, 'Cam Chuẩn', NULL, NULL, '#d35400', 12, 52, 'https://img4.dhresource.com/webp/m/0x0/f3/albu/km/j/21/f572bfe1-f3a3-4028-b179-1130b821623f.jpg'),
(6, 'Cam Vàng', NULL, NULL, '#d35400', 10, 23, 'https://pocasport.vn/uploads/602/4500.png'),
(7, 'Cam Đen', NULL, NULL, '#d35400', 11, 18, 'https://tse1.mm.bing.net/th/id/OIP.7IZB2NvXIK8BXRUXi-AhkAHaHa?r=0&rs=1&pid=ImgDetMain&o=7&rm=3'),
(8, 'Cam Sáng', NULL, NULL, '#d35400', 12, 14, 'https://vscsport.com/uploads/details/2025/04/images/qua-bong-ro-AKpro-AB8006-1.jpg'),
(9, 'Cam Đậm', NULL, NULL, '#d35400', 9, 9, 'https://th.bing.com/th/id/OIP.imJfbnVU9X3BvLxp5TH8fQHaHa?r=0&o=7rm=3&rs=1&pid=ImgDetMain&o=7&rm=3'),
(10, 'Cam Tiêu Chuẩn', NULL, NULL, '#d35400', 8, 5, 'https://tse4.mm.bing.net/th/id/OIP.fxETWIhCMDpe_PTCUaOpywHaHa?r=0&rs=1&pid=ImgDetMain&o=7&rm=3'),
(11, 'Trắng', NULL, NULL, '#ffffff', 18, 64, 'https://ycb.vn/wp-content/uploads/2018/05/vo-nike-elite-cushioned-crew-sx5460-101-001.jpg'),
(12, 'Đen', NULL, NULL, '#111111', 15, 31, 'https://static.nike.com/a/images/t_web_pw_592_v2/f_auto/53ef7bd6-ca0e-4f5d-a1e2-16a7533a78b2/U+NK+ELITE+CUSH+CREW+1PR.png'),
(13, 'Đen', NULL, NULL, '#111111', 12, 16, 'https://down-vn.img.susercontent.com/file/4622270d1b754207b028ca0492f351a4'),
(14, 'Vàng Gold', NULL, NULL, '#f1c40f', 10, 27, 'https://interdeportivo.com/cdn/shop/files/JerseyNikeLosAngelesLakersIconEdition_1_-PaginaWEB.png?v=1779056525&width=1024'),
(14, 'Tím Purple', NULL, NULL, '#6c3483', 8, 21, 'https://th.bing.com/th/id/OIP.Icza2F_i6SXb36ViKc4EjQAAAA?w=118&h=150&c=6&r=0&o=7&dpr=1.3&pid=1.7&rm=3'),
(15, 'Đỏ Đen', NULL, NULL, '#c0392b', 10, 22, 'https://tse4.mm.bing.net/th/id/OIP.6-RiWcKD1bUfc75viJksuQHaHa?r=0&rs=1&pid=ImgDetMain&o=7&rm=3'),
(16, 'Xanh Dương', NULL, NULL, '#1d428a', 9, 29, 'https://i.pinimg.com/736x/de/27/55/de2755cbf2e5392870db49b07efa5011.jpg'),
(16, 'Vàng', NULL, NULL, '#ffc72c', 7, 16, 'https://i.pinimg.com/736x/d1/ab/74/d1ab74c7fe563d0ac1a19254ce811215.jpg'),
(17, 'Trắng NYC', NULL, NULL, '#ffffff', 8, 11, 'https://basketballjerseyarchive.com/static/news/2024/11/14/kHBQKiKDMtNpys2/all-2024-2025-nba-city-edition-jerseys-released.jpg'),
(18, 'Đỏ Sao Vàng', NULL, NULL, '#da251d', 12, 26, 'https://tse4.mm.bing.net/th/id/OIP.YzrHuPXz_QEltXT6kkcYGwAAAA?r=0&rs=1&pid=ImgDetMain&o=7&rm=3'),
(19, 'Đen', NULL, NULL, '#111111', 10, 13, 'https://tse1.mm.bing.net/th/id/OIP.MLJg0yWWOg4V9xOk6QKNCQHaHa?r=0&rs=1&pid=ImgDetMain&o=7&rm=3'),
(20, 'Đen', NULL, NULL, '#111111', 10, 8, 'https://tse1.mm.bing.net/th/id/OIP.rKAsReQCPMnmtPg6uDtfswHaHa?r=0&rs=1&pid=ImgDetMain&o=7&rm=3'),
(21, 'Ngắn - Đen', 'Đen', 'Ngắn', '#111111', 9, 20, 'https://th.bing.com/th/id/R.62be73600b91a8cc066976e09e8fc624?rik=KnFnJqc%2bEf0Cww&pid=ImgRaw&r=0'),
(21, 'Ngắn - Trắng', 'Trắng', 'Ngắn', '#ffffff', 7, 12, 'https://product.hstatic.net/1000372304/product/quan-combat-bong-ro-giu-nhiet-mau-trang_465465e884ef4d6b8f9217f9f46403cb_master.jpg'),
(21, 'Dài - Đen', 'Đen', 'Dài', '#111111', 10, 15, 'https://tse2.mm.bing.net/th/id/OIP.RmBeTa9BzSHs_A9NbY1H_AHaHa?r=0&rs=1&pid=ImgDetMain&o=7&rm=3'),
(21, 'Dài - Trắng', 'Trắng', 'Dài', '#ffffff', 6, 7, 'https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-lpm0heeee7cf76'),
(21, 'Lệch Phải - Đen', 'Đen', 'Lệch Phải', '#111111', 5, 18, 'https://dothethao.net.vn/wp-content/uploads/2024/01/quan-den-lung-trai-ngan-phai.jpg'),
(21, 'Lệch Trái - Đen', 'Đen', 'Lệch Trái', '#111111', 6, 10, 'https://dothethao.net.vn/wp-content/uploads/2024/01/quan-den-lung-trai-ngan-phai.jpg'),
(21, 'Lệch Phải - Trắng', 'Trắng', 'Lệch Phải', '#ffffff', 5, 14, 'https://dothethao.net.vn/wp-content/uploads/2024/01/quan-trang-dai-phai-ngan-phai.jpg'),
(21, 'Lệch Trái - Trắng', 'Trắng', 'Lệch Trái', '#ffffff', 4, 3, 'https://dothethao.net.vn/wp-content/uploads/2024/01/quan-trang-dai-phai-ngan-phai.jpg'),
(22, 'Tím', NULL, NULL, '#6d28d9', 12, 24, 'https://thumbs.dreamstime.com/b/blue-basketball-jersey-template-isolated-white-background-sport-team-club-uniform-features-front-back-views-sleeveless-tank-top-420728673.jpg'),
(22, 'Trắng', NULL, NULL, '#f8fafc', 10, 15, 'https://thumbs.dreamstime.com/b/blue-basketball-jersey-template-isolated-white-background-sport-team-club-uniform-features-front-back-views-sleeveless-tank-top-420728673.jpg'),
(22, 'Đen', NULL, NULL, '#18181b', 5, 30, 'https://i.pinimg.com/736x/f9/eb/df/f9ebdf7f2a1a8c348bc88006dd73ce2a.jpg'),
(22, 'Đỏ', NULL, NULL, '#b91c1c', 4, 19, 'https://m.media-amazon.com/images/I/41BzY7QxcTL._SL500_.jpg'),
(22, 'Xanh Navy', NULL, NULL, '#1e3a8a', 8, 17, 'https://thumbs.dreamstime.com/b/blue-basketball-jersey-template-isolated-white-background-sport-team-club-uniform-features-front-back-views-sleeveless-tank-top-420728673.jpg'),
(22, 'Xanh lá', NULL, NULL, '#15803d', 5, 11, 'https://tse3.mm.bing.net/th/id/OIP.Q-q0VD7TOh-DbTymk-3nIwHaFj?r=0&rs=1&pid=ImgDetMain&o=7&rm=3'),
(23, 'Xanh Navy USA', NULL, NULL, '#1e3a8a', 12, 32, 'https://cdn.choibongro.vn/wp-content/uploads/2024/09/quan-ao-bong-ro-swingman-usa-olympic-2024-choibongro-vn-19.webp'),
(24, 'Vàng Tím Lakers', NULL, NULL, '#f59e0b', 11, 26, 'https://tse2.mm.bing.net/th/id/OIP.E_BaHrQQn_TCbK9XfEal-AHaHa?r=0&rs=1&pid=ImgDetMain&o=7&rm=3'),
(25, 'Đỏ Đen Bulls', NULL, NULL, '#dc2626', 10, 24, 'https://tse4.mm.bing.net/th/id/OIP.Qf19WNzoWfQ2kp5QPmLbUQHaHa?r=0&pid=ImgDet&w=474&h=474&rs=1&o=7&rm=3'),
(26, 'Đen Vàng Warriors', NULL, NULL, '#1e293b', 10, 19, 'https://tse2.mm.bing.net/th/id/OIP.CHaoaeyVburywexsbUydygHaHa?r=0&pid=ImgDet&w=60&h=60&c=7&dpr=1.3&rs=1&o=7&rm=3'),
(27, 'Đen Phối Hồng Xanh', NULL, NULL, '#db2777', 9, 21, 'https://tse1.mm.bing.net/th/id/OIP.f_Elxm8k5mZRVoD93cK1MgHaHa?r=0&pid=ImgDet&w=474&h=474&rs=1&o=7&rm=3'),
(28, 'Xanh Lá Celtics', NULL, NULL, '#15803d', 12, 18, 'https://tse2.mm.bing.net/th/id/OIP.oM4Awk3dlIqpjm99Wik9iQHaHa?r=0&rs=1&pid=ImgDetMain&o=7&rm=3'),
(29, 'Sói Hoang', NULL, NULL, '#334155', 12, 24, 'https://tse3.mm.bing.net/th/id/OIP.xwP_vb4hXpBL_shkfWKFewHaJh?r=0&rs=1&pid=ImgDetMain&o=7&rm=3'),
(30, 'Đỏ', NULL, NULL, '#dc2626', 10, 28, 'https://tse3.mm.bing.net/th/id/OIP.U77A4KlmR6YVMPZ2QpU0ggHaIz?r=0&w=530&h=630&rs=1&pid=ImgDetMain&o=7&rm=3'),
(30, 'Xanh', NULL, NULL, '#2563eb', 10, 19, 'https://tse2.mm.bing.net/th/id/OIP.9ppPJ8S6-SsF-_q_QiPT6AHaJh?r=0&rs=1&pid=ImgDetMain&o=7&rm=3'),
(31, 'Đỏ', NULL, NULL, '#e11d48', 11, 22, 'https://down-vn.img.susercontent.com/file/sg-11134202-23020-4xr7zx2x8vnv00'),
(31, 'Xanh', NULL, NULL, '#0284c7', 9, 15, 'https://tse2.mm.bing.net/th/id/OIP.BKwWQkeljO5SXTDkwNTR1gHaHa?r=0&rs=1&pid=ImgDetMain&o=7&rm=3'),
(32, 'Họa Tiết Trái Dưa', NULL, NULL, '#16a34a', 12, 31, 'https://th.bing.com/th/id/OIP.ykO7sShz4FL71ssJiUVtvQHaHa?w=206&h=206&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3'),
(33, 'Cherry Drip', NULL, NULL, '#be123c', 10, 27, 'https://www.fuikaomar.es/66176-large_default/boxer-psd-underwear-cherry-drip.jpg'),
(34, 'Blue', NULL, NULL, '#2563eb', 10, 25, 'https://th.bing.com/th/id/OIP.Ibdj1-1eN34xwqV5lAXmAwHaJZ?r=0&o=7rm=3&rs=1&pid=ImgDetMain&o=7&rm=3'),
(34, 'Green', NULL, NULL, '#16a34a', 9, 18, 'https://th.bing.com/th/id/R.6d13fe91fbe9ed28eb1f88ddf5bfa673?rik=KOEFsdQLk%2fh6cA&riu=http%3a%2f%2fwww.dtlr.com%2fcdn%2fshop%2ffiles%2fpsd-324180059-icy-time-2_1200x1200.jpg%3fv%3d1726261705&ehk=beyswpmOOXcJ3zd%2b7AEkyZLfGjWEDLdmi6jN7cdS3mw%3d&risl=&pid=ImgRaw&r=0'),
(35, 'Đen', NULL, NULL, '#111111', 15, 36, 'https://cf.shopee.vn/file/vn-11134208-7r98o-lp1owbtyslseec'),
(36, 'Đen', NULL, NULL, '#111111', 14, 42, 'https://cdn.chiaki.vn/unsafe/0x640/left/top/smart/filters:quality(70)/https://chiaki.vn/upload/news/content/2022/12/bo-goi-the-thao-chuyen-dung-redikick-co-dem-bao-ve-chiaki-png-1671761329-23122022090849.png'),
(36, 'Trắng', NULL, NULL, '#ffffff', 12, 29, 'https://cdn.chiaki.vn/unsafe/0x640/left/top/smart/filters:quality(70)/https://chiaki.vn/upload/news/content/2022/12/bo-goi-the-thao-chuyen-dung-redikick-co-dem-bao-ve-chiaki-png-1671761329-23122022090849.png'),
(37, 'Đen', NULL, NULL, '#111111', 18, 33, 'https://down-vn.img.susercontent.com/file/vn-11134207-7ra0g-m6xhuyxi5jl30b');

-- Đơn hàng mẫu
INSERT INTO `orders` (`order_code`, `account_phone`, `customer_name`, `customer_phone`, `customer_addr`, `subtotal`, `discount_amt`, `used_mcoin`, `earned_mcoin`, `cashback_percent`, `shipping_fee`, `final_total`, `coupon_used`, `has_custom_jersey`, `jersey_count`, `status_step_idx`, `admin_confirmed`, `is_cancelled`, `needs_invoice`, `start_time`) VALUES
('MVP-261101-001', '0909123456', 'Hoàng Minh Thắng', '0909123456', '45 Lê Duẩn, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh', 670000.00, 50000.00, 0, 31000.00, 5, 30000.00, 650000.00, 'MRHOOPS10', FALSE, 0, 4, TRUE, FALSE, FALSE, 1793500000000),
('MVP-261102-002', '0982734991', 'Minh Minh', '0982734991', '12 Nguyễn Trãi, Phường 14, Quận 10, TP. Hồ Chí Minh', 425000.00, 0.00, 0, 29750.00, 7, 30000.00, 455000.00, NULL, TRUE, 1, 1, TRUE, FALSE, TRUE, 1793550000000);

-- Chi tiết đơn hàng mẫu
INSERT INTO `order_items` (`order_code`, `product_id`, `variant_index`, `item_name`, `sub_info`, `unit_price`, `qty`) VALUES
('MVP-261101-001', 1, 0, 'Nike Elite V1 Basketball Backpack', 'Trắng Đen', 520000.00, 1),
('MVP-261101-001', 11, 0, 'Vớ Chống Trượt Nike Elite Crew Trắng', 'Trắng / M (41-42)', 150000.00, 1),
('MVP-261102-002', 22, 0, 'Phôi Áo Jersey Custom Teamwear (Đủ Màu Phôi)', 'Tím / L - [In số 23 - MINH MINH]', 200000.00, 1),
('MVP-261102-002', 14, 0, 'Áo Jersey Los Angeles Lakers Edition', 'Vàng Gold / L', 225000.00, 1);

-- Đánh giá sản phẩm mẫu
INSERT INTO `product_reviews` (`product_id`, `order_code`, `account_phone`, `author_name`, `stars`, `comment`, `images_json`) VALUES
(1, 'MVP-261101-001', '0909123456', 'Hoàng Minh Thắng', 5, 'Balo đẹp xuất sắc, đựng vừa cả bóng size 7 và đôi giày size 43. Quai đeo có đệm khí êm ái!', '["https://tse3.mm.bing.net/th/id/OIP.KAJ_f9qd6ZGbo6KwGWC8lQHaGg?r=0&rs=1&pid=ImgDetMain&o=7&rm=3"]'),
(11, 'MVP-261101-001', '0909123456', 'Hoàng Minh Thắng', 5, 'Vớ dày dặn, bám sân cực tốt không bị trượt trong giày khi bứt tốc.', NULL);
