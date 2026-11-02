# 🏀 MAIRUA.COM - FULL-STACK BASKETBALL E-COMMERCE & CUSTOM STUDIO

Hệ thống sàn thương mại điện tử chuyên đồ bóng rổ và xưởng in áo/balo theo yêu cầu của thương hiệu **Mairua Hoops**.

---

## 📁 CẤU TRÚC THƯ MỤC DỰ ÁN

```
C:\Users\th408\OneDrive\testcode\
├── index.html       # Giao diện chính (đã tách riêng CSS và JS)
├── style.css        # Toàn bộ CSS phong cách bóng rổ streetwear và hiệu ứng studio
├── app.js           # Toàn bộ logic Frontend và kết nối RESTful API
├── server.js        # Máy chủ Backend Node.js + Express + Kết nối MySQL + Gemini AI Proxy
├── database.sql     # Script SQL tạo 9 bảng và nạp sẵn 37 sản phẩm mẫu
├── package.json     # Quản lý dependencies (express, mysql2, cors, bcryptjs, jsonwebtoken)
├── .env             # Biến môi trường (Cổng PORT, cấu hình MySQL, JWT Secret)
└── logo.png         # Logo thương hiệu chú rùa bóng rổ
```

---

## 🚀 HƯỚNG DẪN KHỞI CHẠY HỆ THỐNG

### Cách 1: Khởi chạy Full-stack với Node.js Backend Server (Khuyến nghị)

1. **Khởi động MySQL** (nếu dùng XAMPP, bật Apache & MySQL trong XAMPP Control Panel).
2. **Import Database**:
   - Mở phpMyAdmin (`http://localhost/phpmyadmin`) hoặc MySQL Workbench.
   - Tạo hoặc chọn database `mairua_db`.
   - Import file `database.sql` vào database.
3. **Khởi chạy Server**:
   Mở terminal tại thư mục dự án và chạy:
   ```bash
   node server.js
   ```
4. **Truy cập hệ thống**:
   - Website chính: **`http://localhost:5000`**
   - API Kiểm tra trạng thái: **`http://localhost:5000/api/health`**
   - API Danh sách sản phẩm: **`http://localhost:5000/api/products`**

> **Lưu ý:** Nếu bạn chưa bật MySQL, `server.js` sẽ tự động kích hoạt chế độ **Fallback an toàn**, cho phép website vẫn chạy mượt mà 100% với dữ liệu local.

---

### Cách 2: Mở trực tiếp Frontend (Chạy tĩnh / Deploy Netlify)
- Nhấp đúp chuột mở trực tiếp file `index.html` trên trình duyệt.
- Bạn có thể kéo thả toàn bộ thư mục lên **Netlify** hoặc **Vercel** để triển khai trang web tĩnh công khai ngay lập tức.

---

## 🔑 TÀI KHOẢN MẪU ĐỂ TEST HỆ THỐNG

| Loại tài khoản | Số điện thoại | Mật khẩu | Quyền hạn & Chức năng |
|---|---|---|---|
| **Quản Trị Viên (Admin)** | `0909501753` | `5888` | Xem Dashboard, Duyệt đơn hàng 5 công đoạn, AI Nhập hàng tự động, Quản lý kho |
| **Khách Hàng Thân Thiết** | `0909123456` | `123` | Mua sắm, Đặt custom áo/balo, Điểm tích lũy M-Coin (50.000đ), Hạng Đồng |
| **Khách Hàng VIP** | `0982734991` | `123` | Hạng Bạc (Cashback 6%), Sổ địa chỉ sẵn có |

---

## 📡 DANH SÁCH RESTFUL APIS CHÍNH

- **Sản phẩm & Tồn kho:**
  - `GET /api/products`: Lấy danh sách 37 sản phẩm (hỗ trợ lọc danh mục, tầm giá, tìm kiếm, sắp xếp).
  - `POST /api/admin/restock`: AI Nhập hàng tự động theo lệnh tự nhiên, cộng tồn kho trực tiếp vào MySQL.
- **Xác thực & Người dùng:**
  - `POST /api/auth/login`: Đăng nhập cấp mã JWT token.
  - `POST /api/auth/register`: Đăng ký tài khoản mới mã hóa bcrypt.
  - `PUT /api/account/profile`: Cập nhật thông tin cá nhân.
  - `POST /api/account/addresses`: Thêm sổ địa chỉ nhận hàng.
- **Đơn hàng & Sản xuất:**
  - `POST /api/orders`: Đặt hàng mới (trừ kho SQL bằng Transaction, tính M-Coin & hạng thành viên).
  - `GET /api/orders`: Xem danh sách đơn hàng.
  - `PUT /api/orders/:orderCode/status`: Admin chuyển bước quy trình sản xuất (0 -> 4).
  - `POST /api/orders/:orderCode/cancel`: Hủy đơn và tự động hoàn trả tồn kho vào SQL.
- **Mã giảm giá:**
  - `POST /api/coupons`: Tạo mã voucher hiệu lực 48 giờ.
  - `POST /api/coupons/apply`: Áp dụng mã giảm giá và kiểm tra điều kiện.
- **Proxy Gemini AI:**
  - `POST /api/ai/try-on`: Thử đồ và tư vấn phong cách áo bóng rổ ảo (giấu API Key an toàn trên server).
  - `POST /api/ai/chat`: Trợ lý hỗ trợ khách hàng bóng rổ.
