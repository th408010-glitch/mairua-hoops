        // ====================================================================
        // MAIRUA HOOPS FRONTEND (BẢO MẬT: MỌI KEY VÀ LINK NHẠY CẢM ĐƯỢC GIẤU Ở BACKEND .ENV)
        // ====================================================================
        const COUPON_VALID_DURATION_MS = 48 * 60 * 60 * 1000;
        const USED_VOUCHER_KEEP_MS = 2 * 60 * 60 * 1000; // Giữ voucher đã dùng hiện "Đã sử dụng" trong 2 tiếng rồi tự biến mất
        const MIN_MS = 60 * 1000;
        const AUTO_ORDER_INTERVAL_MS = 105000;

        const wardsByProvince = {
            "TP. Hồ Chí Minh": ["Phường Bến Thành, Quận 1", "Phường Đa Kao, Quận 1", "Phường Võ Thị Sáu, Quận 3", "Phường 14, Quận 10", "Phường Tân Phong, Quận 7", "Phường Hiệp Bình Chánh, TP. Thủ Đức"],
            "Hà Nội": ["Phường Ba Đình", "Phường Dịch Vọng, Cầu Giấy", "Phường Láng Hạ, Đống Đa", "Phường Hàng Bài, Hoàn Kiếm", "Phường Bách Khoa, Hai Bà Trưng"],
            "Đà Nẵng": ["Phường Hải Châu 1, Hải Châu", "Phường Thạc Gián, Thanh Khê", "Phường Mỹ An, Ngũ Hành Sơn"],
            "Cần Thơ": ["Phường Tân An, Ninh Kiều", "Phường Xuân Khánh, Ninh Kiều", "Phường Cái Khế, Ninh Kiều"],
            "Đồng Nai": ["Phường Thống Nhất, TP. Biên Hòa", "Phường Tân Hiệp, TP. Biên Hòa"],
            "Khánh Hòa": ["Phường Lộc Thọ, TP. Nha Trang", "Phường Vĩnh Nguyên, TP. Nha Trang"]
        };

        // Đã bổ sung Sản phẩm số 22: Phôi Áo Jersey Custom (Đủ 6 màu Phôi) để quản lý tồn kho và nhập hàng theo màu
        const defaultProducts = [
            { id: 1, cat: 'balo', name: 'Nike Elite V1 Basketball Backpack', price: 520000, hasSize: false, variants: [
                { colorName: 'Trắng Đen', hex: '#ffffff', stock: 8, sold: 28, img: 'https://tse3.mm.bing.net/th/id/OIP.KAJ_f9qd6ZGbo6KwGWC8lQHaGg?r=0&rs=1&pid=ImgDetMain&o=7&rm=3' },
                { colorName: 'Đen Vàng Gold', hex: '#222222', stock: 5, sold: 19, img: 'https://images.prodirectsport.com/ProductImages/Gallery_1/232760_Gallery_1_0845199.jpg' },
                { colorName: 'Đỏ Đen', hex: '#e74c3c', stock: 6, sold: 14, img: 'https://tse3.mm.bing.net/th/id/OIP.J2Geh4Li-tMVLDVOr8JJOwHaJS?r=0&rs=1&pid=ImgDetMain&o=7&rm=3' }
            ]},
            { id: 2, cat: 'balo', name: 'Nike Elite V2 Pro Backpack', price: 650000, hasSize: false, variants: [
                { colorName: 'Xanh Đen', hex: '#2c3e50', stock: 6, sold: 15, img: 'https://m.media-amazon.com/images/I/81tqai0YQeL._AC_UY1000_.jpg' },
                { colorName: 'Xám Bạc', hex: '#bdc3c7', stock: 4, sold: 9, img: 'https://tse3.mm.bing.net/th/id/OIP.mkdGKLhnOyIMfwa3Z3RKvwHaHa?r=0&rs=1&pid=ImgDetMain&o=7&rm=3' },
                { colorName: 'Đen Tuyền', hex: '#111111', stock: 5, sold: 17, img: 'https://tse4.mm.bing.net/th/id/OIP.W4l3i7seO1sz3dJdQTikogHaHa?r=0&rs=1&pid=ImgDetMain&o=7&rm=3' }
            ]},
            { id: 3, cat: 'balo', name: 'Nike Elite V3 Ultimate Edition', price: 850000, hasSize: false, variants: [
                { colorName: 'Đen Phối Cam', hex: '#e67e22', stock: 4, sold: 11, img: 'https://classic.cdn.media.amplience.net/i/hibbett/00B9Z_8025_main/Nike%20Varsity%20Elite%20Backpack-Orange/Black-8025?$large$' },
                { colorName: 'Trắng Tinh Khôi', hex: '#f8f9fa', stock: 3, sold: 7, img: 'https://classic.cdn.media.amplience.net/i/hibbett/004PQ_9124_main/Nike%20Varsity%20Elite%20Backpack%20-%20White-9124' },
                { colorName: 'Xanh Dương', hex: '#2980b9', stock: 4, sold: 6, img: 'https://m.media-amazon.com/images/I/81tqai0YQeL._AC_UY1000_.jpg' }
            ]},
            { id: 4, cat: 'balo', name: 'Nike Utility Speed Training Backpack', price: 890000, hasSize: false, variants: [
                { colorName: 'Đen Nhám', hex: '#34495e', stock: 5, sold: 12, img: 'https://tse4.mm.bing.net/th/id/OIP.7F5Q5lppNKQD5JcJgCtpNAHaHa?r=0&rs=1&pid=ImgDetMain&o=7&rm=3' },
                { colorName: 'Xanh Rêu', hex: '#7f8c8d', stock: 4, sold: 8, img: 'https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/46dc627a-1b91-4ec9-a0a1-f007feba4a46/NK+UTILITY+ELITE+BKPK+-+2.0.png' },
                { colorName: 'Xám Khói', hex: '#95a5a6', stock: 3, sold: 4, img: 'https://www.nike.sa/dw/image/v2/BDVB_PRD/on/demandware.static/-/Sites-akeneo-master-catalog/default/dwf8e2b749/nk/b33/3/5/0/0/a/b333500a_7fdf_43e3_bbf6_782173cd8c43.jpg' }
            ]},
            { id: 5, cat: 'bong', name: 'Bóng Rổ Molten GG7X Sân Indoor', price: 680000, hasSize: true, sizes: ['Size 5', 'Size 6', 'Size 7'], variants: [{ colorName: 'Cam Chuẩn', hex: '#d35400', stock: 12, sold: 52, img: 'https://img4.dhresource.com/webp/m/0x0/f3/albu/km/j/21/f572bfe1-f3a3-4028-b179-1130b821623f.jpg' }] },
            { id: 6, cat: 'bong', name: 'Bóng Rổ Molten B7G4500 Da Tổng Hợp', price: 620000, hasSize: true, sizes: ['Size 5', 'Size 6', 'Size 7'], variants: [{ colorName: 'Cam Vàng', hex: '#d35400', stock: 10, sold: 23, img: 'https://pocasport.vn/uploads/602/4500.png' }] },
            { id: 7, cat: 'bong', name: 'Bóng Rổ AK Pro Cao Su Thi Đấu', price: 520000, hasSize: true, sizes: ['Size 5', 'Size 6', 'Size 7'], variants: [{ colorName: 'Cam Đen', hex: '#d35400', stock: 11, sold: 18, img: 'https://tse1.mm.bing.net/th/id/OIP.7IZB2NvXIK8BXRUXi-AhkAHaHa?r=0&rs=1&pid=ImgDetMain&o=7&rm=3' }] },
            { id: 8, cat: 'bong', name: 'Bóng Rổ AK Pro Outdoor Chống Mài Mòn', price: 450000, hasSize: true, sizes: ['Size 5', 'Size 6', 'Size 7'], variants: [{ colorName: 'Cam Sáng', hex: '#d35400', stock: 12, sold: 14, img: 'https://vscsport.com/uploads/details/2025/04/images/qua-bong-ro-AKpro-AB8006-1.jpg' }] },
            { id: 9, cat: 'bong', name: 'Bóng Rổ Stepback Pro Series Size 7', price: 580000, hasSize: true, sizes: ['Size 5', 'Size 6', 'Size 7'], variants: [{ colorName: 'Cam Đậm', hex: '#d35400', stock: 9, sold: 9, img: 'https://th.bing.com/th/id/OIP.imJfbnVU9X3BvLxp5TH8fQHaHa?r=0&o=7rm=3&rs=1&pid=ImgDetMain&o=7&rm=3' }] },
            { id: 10, cat: 'bong', name: 'Bóng Rổ Stepback Street Outdoor', price: 490000, hasSize: true, sizes: ['Size 5', 'Size 6', 'Size 7'], variants: [{ colorName: 'Cam Tiêu Chuẩn', hex: '#d35400', stock: 8, sold: 5, img: 'https://tse4.mm.bing.net/th/id/OIP.fxETWIhCMDpe_PTCUaOpywHaHa?r=0&rs=1&pid=ImgDetMain&o=7&rm=3' }] },
            { id: 11, cat: 'vo', name: 'Vớ Chống Trượt Nike Elite Crew Trắng', price: 150000, hasSize: true, sizes: ['S (38-40)', 'M (41-42)', 'L (43-45)'], variants: [{ colorName: 'Trắng', hex: '#ffffff', stock: 18, sold: 64, img: 'https://ycb.vn/wp-content/uploads/2018/05/vo-nike-elite-cushioned-crew-sx5460-101-001.jpg' }] },
            { id: 12, cat: 'vo', name: 'Vớ Chống Trượt Nike Elite Crew Đen', price: 150000, hasSize: true, sizes: ['S (38-40)', 'M (41-42)', 'L (43-45)'], variants: [{ colorName: 'Đen', hex: '#111111', stock: 15, sold: 31, img: 'https://static.nike.com/a/images/t_web_pw_592_v2/f_auto/53ef7bd6-ca0e-4f5d-a1e2-16a7533a78b2/U+NK+ELITE+CUSH+CREW+1PR.png' }] },
            { id: 13, cat: 'vo', name: 'Vớ Trutechsocks Đệm Dày Cao Cấp', price: 220000, hasSize: true, sizes: ['M (39-41)', 'L (42-44)'], variants: [{ colorName: 'Đen', hex: '#111111', stock: 12, sold: 16, img: 'https://down-vn.img.susercontent.com/file/4622270d1b754207b028ca0492f351a4' }] },
            { id: 14, cat: 'ao', name: 'Áo Jersey Los Angeles Lakers Edition', price: 225000, hasSize: true, sizes: ['S', 'M', 'L', 'XL', '2XL'], variants: [
                { colorName: 'Vàng Gold', hex: '#f1c40f', stock: 10, sold: 27, img: 'https://interdeportivo.com/cdn/shop/files/JerseyNikeLosAngelesLakersIconEdition_1_-PaginaWEB.png?v=1779056525&width=1024' },
                { colorName: 'Tím Purple', hex: '#6c3483', stock: 8, sold: 21, img: 'https://th.bing.com/th/id/OIP.Icza2F_i6SXb36ViKc4EjQAAAA?w=118&h=150&c=6&r=0&o=7&dpr=1.3&pid=1.7&rm=3' }
            ]},
            { id: 15, cat: 'ao', name: 'Áo Jersey Chicago Bulls Retro Red', price: 225000, hasSize: true, sizes: ['S', 'M', 'L', 'XL', '2XL'], variants: [{ colorName: 'Đỏ Đen', hex: '#c0392b', stock: 10, sold: 22, img: 'https://tse4.mm.bing.net/th/id/OIP.6-RiWcKD1bUfc75viJksuQHaHa?r=0&rs=1&pid=ImgDetMain&o=7&rm=3' }] },
            { id: 16, cat: 'ao', name: 'Áo Jersey Bóng Rổ Golden State Warriors', price: 240000, hasSize: true, sizes: ['S', 'M', 'L', 'XL', '2XL'], variants: [
                { colorName: 'Xanh Dương', hex: '#1d428a', stock: 9, sold: 29, img: 'https://i.pinimg.com/736x/de/27/55/de2755cbf2e5392870db49b07efa5011.jpg' },
                { colorName: 'Vàng', hex: '#ffc72c', stock: 7, sold: 16, img: 'https://i.pinimg.com/736x/d1/ab/74/d1ab74c7fe563d0ac1a19254ce811215.jpg' }
            ]},
            { id: 17, cat: 'ao', name: 'Áo Jersey Bóng Rổ New York (NYC) City Edition', price: 250000, hasSize: true, sizes: ['S', 'M', 'L', 'XL', '2XL'], variants: [{ colorName: 'Trắng NYC', hex: '#ffffff', stock: 8, sold: 11, img: 'https://basketballjerseyarchive.com/static/news/2024/11/14/kHBQKiKDMtNpys2/all-2024-2025-nba-city-edition-jerseys-released.jpg' }] },
            { id: 18, cat: 'ao', name: 'Áo Jersey Bóng Rổ Đội Tuyển Việt Nam', price: 230000, hasSize: true, sizes: ['S', 'M', 'L', 'XL', '2XL'], variants: [{ colorName: 'Đỏ Sao Vàng', hex: '#da251d', stock: 12, sold: 26, img: 'https://tse4.mm.bing.net/th/id/OIP.YzrHuPXz_QEltXT6kkcYGwAAAA?r=0&rs=1&pid=ImgDetMain&o=7&rm=3' }] },
            { id: 19, cat: 'combat', name: 'Áo Combat Bóng Rổ Ngắn Tay Giữ Nhiệt', price: 180000, hasSize: true, sizes: ['S', 'M', 'L', 'XL', '2XL'], variants: [{ colorName: 'Đen', hex: '#111111', stock: 10, sold: 13, img: 'https://tse1.mm.bing.net/th/id/OIP.MLJg0yWWOg4V9xOk6QKNCQHaHa?r=0&rs=1&pid=ImgDetMain&o=7&rm=3' }] },
            { id: 20, cat: 'combat', name: 'Áo Combat Bóng Rổ Ba Lỗ Chuyên Dụng', price: 165000, hasSize: true, sizes: ['S', 'M', 'L', 'XL', '2XL'], variants: [{ colorName: 'Đen', hex: '#111111', stock: 10, sold: 8, img: 'https://tse1.mm.bing.net/th/id/OIP.rKAsReQCPMnmtPg6uDtfswHaHa?r=0&rs=1&pid=ImgDetMain&o=7&rm=3' }] },
            { id: 21, cat: 'combat', isCombatPants: true, name: 'Quần Combat Bóng Rổ Pro (Ngắn / Dài / Lệch)', price: 195000, hasSize: true, sizes: ['S', 'M', 'L', 'XL', '2XL'], variants: [
                { colorName: 'Ngắn - Đen', baseColor: 'Đen', cutStyle: 'Ngắn', hex: '#111111', stock: 9, sold: 20, img: 'https://th.bing.com/th/id/R.62be73600b91a8cc066976e09e8fc624?rik=KnFnJqc%2bEf0Cww&pid=ImgRaw&r=0' },
                { colorName: 'Ngắn - Trắng', baseColor: 'Trắng', cutStyle: 'Ngắn', hex: '#ffffff', stock: 7, sold: 12, img: 'https://product.hstatic.net/1000372304/product/quan-combat-bong-ro-giu-nhiet-mau-trang_465465e884ef4d6b8f9217f9f46403cb_master.jpg' },
                { colorName: 'Dài - Đen', baseColor: 'Đen', cutStyle: 'Dài', hex: '#111111', stock: 10, sold: 15, img: 'https://tse2.mm.bing.net/th/id/OIP.RmBeTa9BzSHs_A9NbY1H_AHaHa?r=0&rs=1&pid=ImgDetMain&o=7&rm=3' },
                { colorName: 'Dài - Trắng', baseColor: 'Trắng', cutStyle: 'Dài', hex: '#ffffff', stock: 6, sold: 7, img: 'https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-lpm0heeee7cf76' },
                { colorName: 'Lệch Phải - Đen', baseColor: 'Đen', cutStyle: 'Lệch Phải', hex: '#111111', stock: 5, sold: 18, img: 'https://dothethao.net.vn/wp-content/uploads/2024/01/quan-den-lung-trai-ngan-phai.jpg' },
                { colorName: 'Lệch Trái - Đen', baseColor: 'Đen', cutStyle: 'Lệch Trái', hex: '#111111', stock: 6, sold: 10, img: 'https://dothethao.net.vn/wp-content/uploads/2024/01/quan-den-lung-trai-ngan-phai.jpg' },
                { colorName: 'Lệch Phải - Trắng', baseColor: 'Trắng', cutStyle: 'Lệch Phải', hex: '#ffffff', stock: 5, sold: 14, img: 'https://dothethao.net.vn/wp-content/uploads/2024/01/quan-trang-dai-phai-ngan-phai.jpg' },
                { colorName: 'Lệch Trái - Trắng', baseColor: 'Trắng', cutStyle: 'Lệch Trái', hex: '#ffffff', stock: 4, sold: 3, img: 'https://dothethao.net.vn/wp-content/uploads/2024/01/quan-trang-dai-phai-ngan-phai.jpg' }
            ]},
            { id: 22, cat: 'ao', isJerseyBlank: true, name: 'Phôi Áo Jersey Custom Teamwear (Đủ Màu Phôi)', price: 200000, hasSize: true, sizes: ['S', 'M', 'L', 'XL', '2XL'], variants: [
                { colorName: 'Tím', hex: '#6d28d9', stock: 12, sold: 24, img: 'https://thumbs.dreamstime.com/b/blue-basketball-jersey-template-isolated-white-background-sport-team-club-uniform-features-front-back-views-sleeveless-tank-top-420728673.jpg' },
                { colorName: 'Trắng', hex: '#f8fafc', stock: 10, sold: 15, img: 'https://thumbs.dreamstime.com/b/blue-basketball-jersey-template-isolated-white-background-sport-team-club-uniform-features-front-back-views-sleeveless-tank-top-420728673.jpg' },
                { colorName: 'Đen', hex: '#18181b', stock: 5, sold: 30, img: 'https://i.pinimg.com/736x/f9/eb/df/f9ebdf7f2a1a8c348bc88006dd73ce2a.jpg' },
                { colorName: 'Đỏ', hex: '#b91c1c', stock: 4, sold: 19, img: 'https://m.media-amazon.com/images/I/41BzY7QxcTL._SL500_.jpg' },
                { colorName: 'Xanh Navy', hex: '#1e3a8a', stock: 8, sold: 17, img: 'https://thumbs.dreamstime.com/b/blue-basketball-jersey-template-isolated-white-background-sport-team-club-uniform-features-front-back-views-sleeveless-tank-top-420728673.jpg' },
                { colorName: 'Xanh lá', hex: '#15803d', stock: 5, sold: 11, img: 'https://tse3.mm.bing.net/th/id/OIP.Q-q0VD7TOh-DbTymk-3nIwHaFj?r=0&rs=1&pid=ImgDetMain&o=7&rm=3' }
            ]},
            // 6 MẪU QUẦN BÓNG RỔ GOM CHUNG VÀO MỤC ÁO JERSEY ('ao')
            { id: 23, cat: 'ao', isShorts: true, name: 'Quần Bóng Rổ Swingman USA Olympic 2024', price: 210000, hasSize: true, sizes: ['S', 'M', 'L', 'XL', '2XL'], variants: [
                { colorName: 'Xanh Navy USA', hex: '#1e3a8a', stock: 12, sold: 32, img: 'https://cdn.choibongro.vn/wp-content/uploads/2024/09/quan-ao-bong-ro-swingman-usa-olympic-2024-choibongro-vn-19.webp' }
            ]},
            { id: 24, cat: 'ao', isShorts: true, name: 'Quần Bóng Rổ Los Angeles Lakers Swingman', price: 205000, hasSize: true, sizes: ['S', 'M', 'L', 'XL', '2XL'], variants: [
                { colorName: 'Vàng Tím Lakers', hex: '#f59e0b', stock: 11, sold: 26, img: 'https://tse2.mm.bing.net/th/id/OIP.E_BaHrQQn_TCbK9XfEal-AHaHa?r=0&rs=1&pid=ImgDetMain&o=7&rm=3' }
            ]},
            { id: 25, cat: 'ao', isShorts: true, name: 'Quần Bóng Rổ Chicago Bulls Classic Red', price: 205000, hasSize: true, sizes: ['S', 'M', 'L', 'XL', '2XL'], variants: [
                { colorName: 'Đỏ Đen Bulls', hex: '#dc2626', stock: 10, sold: 24, img: 'https://tse4.mm.bing.net/th/id/OIP.Qf19WNzoWfQ2kp5QPmLbUQHaHa?r=0&pid=ImgDet&w=474&h=474&rs=1&o=7&rm=3' }
            ]},
            { id: 26, cat: 'ao', isShorts: true, name: 'Quần Bóng Rổ Golden State Warriors City Edition', price: 210000, hasSize: true, sizes: ['S', 'M', 'L', 'XL', '2XL'], variants: [
                { colorName: 'Đen Vàng Warriors', hex: '#1e293b', stock: 10, sold: 19, img: 'https://tse2.mm.bing.net/th/id/OIP.CHaoaeyVburywexsbUydygHaHa?r=0&pid=ImgDet&w=60&h=60&c=7&dpr=1.3&rs=1&o=7&rm=3' }
            ]},
            { id: 27, cat: 'ao', isShorts: true, name: 'Quần Bóng Rổ Miami Heat Vice Edition', price: 215000, hasSize: true, sizes: ['S', 'M', 'L', 'XL', '2XL'], variants: [
                { colorName: 'Đen Phối Hồng Xanh', hex: '#db2777', stock: 9, sold: 21, img: 'https://tse1.mm.bing.net/th/id/OIP.f_Elxm8k5mZRVoD93cK1MgHaHa?r=0&pid=ImgDet&w=474&h=474&rs=1&o=7&rm=3' }
            ]},
            { id: 28, cat: 'ao', isShorts: true, name: 'Quần Bóng Rổ Boston Celtics Pro Mesh', price: 205000, hasSize: true, sizes: ['S', 'M', 'L', 'XL', '2XL'], variants: [
                { colorName: 'Xanh Lá Celtics', hex: '#15803d', stock: 12, sold: 18, img: 'https://tse2.mm.bing.net/th/id/OIP.oM4Awk3dlIqpjm99Wik9iQHaHa?r=0&rs=1&pid=ImgDetMain&o=7&rm=3' }
            ]},
            // 6 MẪU QUẦN COMBAT HỌA TIẾT TRONG MỤC ĐỒ COMBAT & PHỤ KIỆN ('combat')
            { id: 29, cat: 'combat', isShorts: true, name: 'Sói hoang hư hỏng', price: 185000, hasSize: true, sizes: ['S', 'M', 'L', 'XL', '2XL'], variants: [
                { colorName: 'Sói Hoang', hex: '#334155', stock: 12, sold: 24, img: 'https://tse3.mm.bing.net/th/id/OIP.xwP_vb4hXpBL_shkfWKFewHaJh?r=0&rs=1&pid=ImgDetMain&o=7&rm=3' }
            ]},
            { id: 30, cat: 'combat', isShorts: true, name: 'Chúa sơn lâm', price: 190000, hasSize: true, sizes: ['S', 'M', 'L', 'XL', '2XL'], variants: [
                { colorName: 'Đỏ', hex: '#dc2626', stock: 10, sold: 28, img: 'https://tse3.mm.bing.net/th/id/OIP.U77A4KlmR6YVMPZ2QpU0ggHaIz?r=0&w=530&h=630&rs=1&pid=ImgDetMain&o=7&rm=3' },
                { colorName: 'Xanh', hex: '#2563eb', stock: 10, sold: 19, img: 'https://tse2.mm.bing.net/th/id/OIP.9ppPJ8S6-SsF-_q_QiPT6AHaJh?r=0&rs=1&pid=ImgDetMain&o=7&rm=3' }
            ]},
            { id: 31, cat: 'combat', isShorts: true, name: 'Hoa hồng nở rộ bốn mùa', price: 190000, hasSize: true, sizes: ['S', 'M', 'L', 'XL', '2XL'], variants: [
                { colorName: 'Đỏ', hex: '#e11d48', stock: 11, sold: 22, img: 'https://down-vn.img.susercontent.com/file/sg-11134202-23020-4xr7zx2x8vnv00' },
                { colorName: 'Xanh', hex: '#0284c7', stock: 9, sold: 15, img: 'https://tse2.mm.bing.net/th/id/OIP.BKwWQkeljO5SXTDkwNTR1gHaHa?r=0&rs=1&pid=ImgDetMain&o=7&rm=3' }
            ]},
            { id: 32, cat: 'combat', isShorts: true, name: 'Tôi thích trái dưa của bạn', price: 185000, hasSize: true, sizes: ['S', 'M', 'L', 'XL', '2XL'], variants: [
                { colorName: 'Họa Tiết Trái Dưa', hex: '#16a34a', stock: 12, sold: 31, img: 'https://th.bing.com/th/id/OIP.ykO7sShz4FL71ssJiUVtvQHaHa?w=206&h=206&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3' }
            ]},
            { id: 33, cat: 'combat', isShorts: true, name: 'Ché ri che rì che ri', price: 185000, hasSize: true, sizes: ['S', 'M', 'L', 'XL', '2XL'], variants: [
                { colorName: 'Cherry Drip', hex: '#be123c', stock: 10, sold: 27, img: 'https://www.fuikaomar.es/66176-large_default/boxer-psd-underwear-cherry-drip.jpg' }
            ]},
            { id: 34, cat: 'combat', isShorts: true, name: 'Xiềng xích đồng tiền', price: 195000, hasSize: true, sizes: ['S', 'M', 'L', 'XL', '2XL'], variants: [
                { colorName: 'Blue', hex: '#2563eb', stock: 10, sold: 25, img: 'https://th.bing.com/th/id/OIP.Ibdj1-1eN34xwqV5lAXmAwHaJZ?r=0&o=7rm=3&rs=1&pid=ImgDetMain&o=7&rm=3' },
                { colorName: 'Green', hex: '#16a34a', stock: 9, sold: 18, img: 'https://th.bing.com/th/id/R.6d13fe91fbe9ed28eb1f88ddf5bfa673?rik=KOEFsdQLk%2fh6cA&riu=http%3a%2f%2fwww.dtlr.com%2fcdn%2fshop%2ffiles%2fpsd-324180059-icy-time-2_1200x1200.jpg%3fv%3d1726261705&ehk=beyswpmOOXcJ3zd%2b7AEkyZLfGjWEDLdmi6jN7cdS3mw%3d&risl=&pid=ImgRaw&r=0' }
            ]},
            // 3 MÓN PHỤ KIỆN BẢO HỘ TRONG MỤC ĐỒ COMBAT & PHỤ KIỆN ('combat') — CHỌN 3 SIZE S, M, L
            { id: 35, cat: 'combat', isProtectiveGear: true, gearType: 'knee', name: 'Bó gối giảm chấn công thái học', price: 240000, hasSize: true, sizes: ['S', 'M', 'L'], variants: [
                { colorName: 'Đen', hex: '#111111', stock: 15, sold: 36, img: 'https://cf.shopee.vn/file/vn-11134208-7r98o-lp1owbtyslseec' }
            ]},
            { id: 36, cat: 'combat', isProtectiveGear: true, gearType: 'knee', name: 'Bó gối thể thao có đệm', price: 220000, hasSize: true, sizes: ['S', 'M', 'L'], variants: [
                { colorName: 'Đen', hex: '#111111', stock: 14, sold: 42, img: 'https://cdn.chiaki.vn/unsafe/0x640/left/top/smart/filters:quality(70)/https://chiaki.vn/upload/news/content/2022/12/bo-goi-the-thao-chuyen-dung-redikick-co-dem-bao-ve-chiaki-png-1671761329-23122022090849.png' },
                { colorName: 'Trắng', hex: '#ffffff', stock: 12, sold: 29, img: 'https://cdn.chiaki.vn/unsafe/0x640/left/top/smart/filters:quality(70)/https://chiaki.vn/upload/news/content/2022/12/bo-goi-the-thao-chuyen-dung-redikick-co-dem-bao-ve-chiaki-png-1671761329-23122022090849.png' }
            ]},
            { id: 37, cat: 'combat', isProtectiveGear: true, gearType: 'ankle', name: 'Băng quấn cổ chân', price: 175000, hasSize: true, sizes: ['S', 'M', 'L'], variants: [
                { colorName: 'Đen', hex: '#111111', stock: 18, sold: 33, img: 'https://down-vn.img.susercontent.com/file/vn-11134207-7ra0g-m6xhuyxi5jl30b' }
            ]}
        ];

        function capNhatTongStockVaSoldSanPham() {
            products.forEach(p => {
                p.stock = p.variants.reduce((sum, v) => sum + (typeof v.stock === 'number' ? v.stock : 10), 0);
                p.sold = p.variants.reduce((sum, v) => sum + (typeof v.sold === 'number' ? v.sold : 0), 0);
            });
        }

        function boDauTiengViet(str) {
            if (!str) return '';
            return str.toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd');
        }

        let savedLocalProducts = JSON.parse(localStorage.getItem('mairua_products'));
        let products = JSON.parse(JSON.stringify(defaultProducts));
        if (Array.isArray(savedLocalProducts)) {
            products.forEach(p => {
                let oldP = savedLocalProducts.find(o => o.id === p.id);
                if (oldP && Array.isArray(oldP.variants)) {
                    p.variants.forEach((v, idx) => {
                        let oldV = oldP.variants.find(ov => ov.colorName === v.colorName) || oldP.variants[idx];
                        if (oldV) {
                            if (typeof oldV.stock === 'number') v.stock = oldV.stock;
                            if (typeof oldV.sold === 'number') v.sold = oldV.sold;
                        }
                    });
                }
            });
        }
        capNhatTongStockVaSoldSanPham();
        localStorage.setItem('mairua_products', JSON.stringify(products));

        let addressesByPhone = JSON.parse(localStorage.getItem('mairua_addressesByPhone')) || {};
        let profileByPhone = JSON.parse(localStorage.getItem('mairua_profileByPhone')) || {};

        let accountsDB = JSON.parse(localStorage.getItem('mairua_accountsDB')) || [
            { phone: "0909501753", pass: "5888", name: "Quản Trị Viên (Admin)", orders: 99, mcoin: 0, tokens: 99, isAdmin: true, addresses: [] },
            { phone: "0909123456", pass: "123", name: "Hoàng Minh Thắng", orders: 2, mcoin: 50000, tokens: 3, isAdmin: false, addresses: [] }
        ];
        accountsDB.forEach(a => {
            if (a.phone === "0909501753") a.pass = "5888";
            if (a.phone && profileByPhone[a.phone]) {
                if (profileByPhone[a.phone].name) a.name = profileByPhone[a.phone].name;
                if (profileByPhone[a.phone].pass && a.phone !== "0909501753") a.pass = profileByPhone[a.phone].pass;
                if (typeof profileByPhone[a.phone].email === 'string') a.email = profileByPhone[a.phone].email;
            }
            if (typeof a.mcoin !== 'number') a.mcoin = 0;
            if (a.phone && Array.isArray(addressesByPhone[a.phone]) && addressesByPhone[a.phone].length > 0) {
                a.addresses = addressesByPhone[a.phone];
            } else if (Array.isArray(a.addresses) && a.addresses.length > 0) {
                addressesByPhone[a.phone] = a.addresses;
            } else {
                a.addresses = [];
            }
        });
        localStorage.setItem('mairua_addressesByPhone', JSON.stringify(addressesByPhone));
        localStorage.setItem('mairua_accountsDB', JSON.stringify(accountsDB));

        let savedCustomerSession = JSON.parse(sessionStorage.getItem('mairua_currentCustomer')) || JSON.parse(localStorage.getItem('mairua_currentCustomer'));
        if (savedCustomerSession && (savedCustomerSession.isAdmin || savedCustomerSession.phone === "0909501753")) {
            localStorage.removeItem('mairua_currentCustomer');
            if (!savedCustomerSession.adminTabAuth5888) {
                sessionStorage.removeItem('mairua_currentCustomer');
                savedCustomerSession = null;
            }
        }
        let currentCustomer = savedCustomerSession || {
            phone: "", pass: "", name: "Khách vãng lai", orders: 0, mcoin: 0, tokens: 3, loggedIn: false, isAdmin: false, addresses: []
        };
        if (typeof currentCustomer.mcoin !== 'number') currentCustomer.mcoin = 0;
        if (currentCustomer.loggedIn && currentCustomer.phone) {
            let dbAcc = accountsDB.find(a => a.phone === currentCustomer.phone);
            if (profileByPhone[currentCustomer.phone]) {
                if (profileByPhone[currentCustomer.phone].name) currentCustomer.name = profileByPhone[currentCustomer.phone].name;
                if (profileByPhone[currentCustomer.phone].pass && currentCustomer.phone !== "0909501753") currentCustomer.pass = profileByPhone[currentCustomer.phone].pass;
                if (typeof profileByPhone[currentCustomer.phone].email === 'string') currentCustomer.email = profileByPhone[currentCustomer.phone].email;
            } else if (dbAcc && dbAcc.email) {
                currentCustomer.email = dbAcc.email;
            }
            if (Array.isArray(addressesByPhone[currentCustomer.phone])) {
                currentCustomer.addresses = addressesByPhone[currentCustomer.phone];
            } else if (dbAcc && Array.isArray(dbAcc.addresses)) {
                currentCustomer.addresses = dbAcc.addresses;
            } else if (!Array.isArray(currentCustomer.addresses)) {
                currentCustomer.addresses = [];
            }
            sessionStorage.setItem('mairua_currentCustomer', JSON.stringify(currentCustomer));
            if (!currentCustomer.isAdmin) {
                localStorage.setItem('mairua_currentCustomer', JSON.stringify(currentCustomer));
            }
        } else {
            currentCustomer.addresses = [];
        }

        // HÀM GỬI DỮ LIỆU ĐẾN GOOGLE SHEETS QUA PROXY BACKEND (ẨN TOÀN BỘ URL NHẠY CẢM)
        async function guiDuLieuGoogleSheets(action, payload) {
            try {
                let bodyData = { action: action, ...(payload || {}) };
                await fetch('/api/sync/sheets', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(bodyData)
                });
            } catch(e) {
                console.warn("Lỗi đồng bộ Google Sheets qua Backend:", e);
            }
        }

        // HÀM ĐỒNG BỘ TÀI KHOẢN VÀ ĐƠN HÀNG TỪ GOOGLE SHEETS QUA PROXY BACKEND
        async function dongBoTuGoogleSheets(hienThongBao = false) {
            let syncBtn = document.getElementById('cloudSyncStatusBtn');
            if (hienThongBao && syncBtn) {
                syncBtn.innerText = '🔄 Đang đồng bộ...';
            }
            try {
                let res = await fetch('/api/sync/sheets');
                if (!res.ok) {
                    if (hienThongBao && syncBtn) syncBtn.innerText = '⚠️ Lỗi kết nối Google Sheets';
                    return false;
                }
                let data = await res.json();
                let hasUpdate = false;
                if (data && Array.isArray(data.accounts)) {
                    data.accounts.forEach(sheetAcc => {
                        if (!sheetAcc || !sheetAcc.phone) return;
                        let normAddrs = [];
                        if (Array.isArray(sheetAcc.addresses)) {
                            normAddrs = sheetAcc.addresses.map((item, aIdx) => {
                                if (typeof item === 'object' && item !== null) return item;
                                return { name: sheetAcc.name || '', phone: sheetAcc.phone || '', fullAddress: String(item), isDefault: aIdx === 0 };
                            });
                        }
                        let localIdx = accountsDB.findIndex(a => a.phone === sheetAcc.phone);
                        if (localIdx === -1) {
                            sheetAcc.addresses = normAddrs;
                            accountsDB.push(sheetAcc);
                            if (normAddrs.length > 0) addressesByPhone[sheetAcc.phone] = normAddrs;
                            hasUpdate = true;
                        } else {
                            if (sheetAcc.pass) accountsDB[localIdx].pass = sheetAcc.pass;
                            if (sheetAcc.name) accountsDB[localIdx].name = sheetAcc.name;
                            if (typeof sheetAcc.mcoin === 'number') accountsDB[localIdx].mcoin = Math.max(accountsDB[localIdx].mcoin || 0, sheetAcc.mcoin);
                            if (typeof sheetAcc.orders === 'number') accountsDB[localIdx].orders = Math.max(accountsDB[localIdx].orders || 0, sheetAcc.orders);
                            if (normAddrs.length > 0) {
                                accountsDB[localIdx].addresses = normAddrs;
                                addressesByPhone[sheetAcc.phone] = normAddrs;
                            }
                            hasUpdate = true;
                        }
                    });
                    if (hasUpdate) {
                        localStorage.setItem('mairua_accountsDB', JSON.stringify(accountsDB));
                        localStorage.setItem('mairua_addressesByPhone', JSON.stringify(addressesByPhone));
                    }
                }

                // ĐỒNG BỘ VOUCHER KHUYẾN MÃI TỪ GOOGLE SHEETS
                if (data && Array.isArray(data.coupons)) {
                    let freshUsedMap = JSON.parse(localStorage.getItem('mairua_usedCouponsMap')) || usedCouponsMap || {};
                    let hasCouponUpdate = false;
                    data.coupons.forEach(c => {
                        if (!c || !c.code) return;
                        let codeKey = c.code.toUpperCase();
                        let localIdx = couponsList.findIndex(lc => lc && lc.code && lc.code.toUpperCase() === codeKey);
                        if (localIdx === -1) {
                            couponsList.push(c);
                            hasCouponUpdate = true;
                        } else {
                            let mergedPhones = new Set([
                                ...(Array.isArray(c.usedByPhones) ? c.usedByPhones : []),
                                ...(Array.isArray(couponsList[localIdx].usedByPhones) ? couponsList[localIdx].usedByPhones : [])
                            ]);
                            couponsList[localIdx].usedByPhones = Array.from(mergedPhones);
                            couponsList[localIdx].percent = c.percent;
                            couponsList[localIdx].targetType = c.targetType;
                            couponsList[localIdx].targetPhones = c.targetPhones;
                            hasCouponUpdate = true;
                        }
                        (c.usedByPhones || []).forEach(ph => {
                            if (!freshUsedMap[ph]) freshUsedMap[ph] = {};
                            if (!freshUsedMap[ph][codeKey]) freshUsedMap[ph][codeKey] = c.createdAt || Date.now();
                        });
                    });
                    if (hasCouponUpdate) {
                        usedCouponsMap = freshUsedMap;
                        localStorage.setItem('mairua_usedCouponsMap', JSON.stringify(usedCouponsMap));
                        localStorage.setItem('mairua_couponsList', JSON.stringify(couponsList));
                        renderGiaoDienChuong();
                        renderTabVoucherCuaToi();
                        kiemTraVaHienPopupKhuyenMaiMoiChoKhach();
                    }
                }

                // ĐỒNG BỘ ĐƠN HÀNG TỪ GOOGLE SHEETS VÀO DANH SÁCH ĐƠN TRÊN WEB
                if (data && Array.isArray(data.orders)) {
                    let hasOrderUpdate = false;
                    data.orders.forEach(sheetOrd => {
                        if (!sheetOrd || !sheetOrd.orderCode) return;
                        
                        let parsedStartTime = Date.now();
                        if (sheetOrd.timeText) {
                            let parts = sheetOrd.timeText.match(/(\d+):(\d+):?(\d*)\s+(\d+)\/(\d+)\/(\d+)/);
                            if (parts) {
                                let h = parseInt(parts[1]) || 0;
                                let m = parseInt(parts[2]) || 0;
                                let s = parseInt(parts[3]) || 0;
                                let d = parseInt(parts[4]) || 1;
                                let mo = (parseInt(parts[5]) || 1) - 1;
                                let y = parseInt(parts[6]) || 2026;
                                parsedStartTime = new Date(y, mo, d, h, m, s).getTime();
                            }
                        }

                        let isJerseyOrder = !!sheetOrd.hasCustomJersey || (Array.isArray(sheetOrd.itemsList) && sheetOrd.itemsList.some(item => typeof item === 'string' && (item.toLowerCase().includes('jersey') || item.toLowerCase().includes('roster'))));
                        let stepIdxFromSheet = layStepIndexTuTenTrangThai(sheetOrd.status, isJerseyOrder);
                        let isCompleted = (stepIdxFromSheet === 99);
                        let isCancelled = (stepIdxFromSheet === -1);
                        let isConfirmedBySheet = (stepIdxFromSheet > 0 || isCompleted);

                        // Khớp đơn theo mã đơn + số điện thoại hoặc tên hoặc thời gian (tránh trường hợp 2 máy khác nhau vô tình tạo trùng mã đơn)
                        let localIdx = remoteOrdersList.findIndex(o => {
                            if (!o) return false;
                            let matchCode = (o.orderCode === sheetOrd.orderCode || o.originalOrderCode === sheetOrd.orderCode);
                            if (!matchCode) return false;
                            let samePhone = (o.phone && sheetOrd.phone && String(o.phone).trim() === String(sheetOrd.phone).trim());
                            let sameName = (o.name && sheetOrd.name && o.name.trim().toLowerCase() === sheetOrd.name.trim().toLowerCase());
                            let closeTime = (o.startTime && parsedStartTime && Math.abs(o.startTime - parsedStartTime) < 15 * 60 * 1000);
                            return samePhone || sameName || closeTime;
                        });

                        if (localIdx === -1) {
                            let finalCode = sheetOrd.orderCode;
                            if (remoteOrdersList.some(o => o && o.orderCode === finalCode)) {
                                let suffix = (sheetOrd.phone || 'KH').slice(-4);
                                finalCode = `${sheetOrd.orderCode}-${suffix}`;
                                let counter = 1;
                                while (remoteOrdersList.some(o => o && o.orderCode === finalCode)) {
                                    finalCode = `${sheetOrd.orderCode}-${suffix}-${counter++}`;
                                }
                            }

                            let newOrd = {
                                orderCode: finalCode,
                                originalOrderCode: sheetOrd.orderCode,
                                isRealCustomerOrder: true,
                                adminConfirmed: isConfirmedBySheet,
                                name: sheetOrd.name || 'Khách hàng',
                                phone: sheetOrd.phone || '',
                                accountPhone: sheetOrd.phone || '',
                                addr: sheetOrd.addr || '',
                                itemsList: Array.isArray(sheetOrd.itemsList) ? sheetOrd.itemsList : [String(sheetOrd.itemsList || '')],
                                itemsCount: Array.isArray(sheetOrd.itemsList) ? sheetOrd.itemsList.length : 1,
                                finalTotal: Number(sheetOrd.finalTotal) || 0,
                                subtotal: Number(sheetOrd.finalTotal) || 0,
                                hasCustomJersey: isJerseyOrder,
                                startTime: parsedStartTime,
                                confirmedAt: isConfirmedBySheet ? parsedStartTime : null,
                                lastSyncedSheetStatus: sheetOrd.status
                            };
                            if (isCompleted) {
                                newOrd.manualStepIdx = 99;
                            } else if (isCancelled) {
                                newOrd.isCancelled = true;
                            } else if (isConfirmedBySheet) {
                                newOrd.manualStepIdx = stepIdxFromSheet;
                            }
                            remoteOrdersList.push(newOrd);
                            dongBoBackupDonKhachThat(newOrd);
                            hasOrderUpdate = true;
                        } else {
                            let existingOrd = remoteOrdersList[localIdx];
                            if (sheetOrd.status && sheetOrd.status !== existingOrd.lastSyncedSheetStatus) {
                                existingOrd.lastSyncedSheetStatus = sheetOrd.status;
                                if (isCompleted) {
                                    if (existingOrd.manualStepIdx !== 99) {
                                        existingOrd.manualStepIdx = 99;
                                        existingOrd.adminConfirmed = true;
                                        hasOrderUpdate = true;
                                    }
                                } else if (isCancelled) {
                                    if (!existingOrd.isCancelled) {
                                        existingOrd.isCancelled = true;
                                        hasOrderUpdate = true;
                                    }
                                } else if (isConfirmedBySheet) {
                                    existingOrd.adminConfirmed = true;
                                    if (!existingOrd.confirmedAt) existingOrd.confirmedAt = Date.now();
                                    if (existingOrd.manualStepIdx !== stepIdxFromSheet) {
                                        existingOrd.manualStepIdx = stepIdxFromSheet;
                                        hasOrderUpdate = true;
                                    }
                                } else if (stepIdxFromSheet === 0) {
                                    // Sheet là "Chờ xác nhận": nếu admin chưa bấm duyệt local thì giữ 0
                                    if (!existingOrd.adminConfirmed && existingOrd.manualStepIdx !== 0) {
                                        existingOrd.manualStepIdx = 0;
                                        hasOrderUpdate = true;
                                    }
                                }
                            }
                        }
                    });

                    if (hasOrderUpdate) {
                        remoteOrdersList.sort((a, b) => (a.startTime || 0) - (b.startTime || 0));
                        localStorage.setItem('mairua_remoteOrdersList', JSON.stringify(remoteOrdersList));
                        capNhatGiaoDienTheoDuLieuMoi();
                    }
                }
                if (syncBtn) {
                    let nowStr = new Date().toLocaleTimeString('vi-VN');
                    syncBtn.innerText = `🔄 Đã đồng bộ Google Sheets (${nowStr})`;
                }
                if (hienThongBao) {
                    capNhatGiaoDienTheoDuLieuMoi();
                }
                return true;
            } catch(e) {
                if (hienThongBao && syncBtn) syncBtn.innerText = '⚠️ Lỗi đồng bộ Google Sheets';
                return false;
            }
        }

        // QUẢN LÝ GIỎ HÀNG RIÊNG BIỆT THEO TỪNG TÀI KHOẢN (TRUNG, NGHĨA, THOẠI, GUEST,...)
        let cartsByPhone = JSON.parse(localStorage.getItem('mairua_cartsByPhone')) || {};
        if (!localStorage.getItem('mairua_cartsByPhone')) {
            let legacyCart = JSON.parse(localStorage.getItem('mairua_cart'));
            if (Array.isArray(legacyCart) && legacyCart.length > 0) {
                let trungAcc = accountsDB.find(a => a && a.name && a.name.toLowerCase().includes('trung'));
                if (trungAcc && trungAcc.phone) {
                    cartsByPhone[trungAcc.phone] = legacyCart;
                } else if (currentCustomer && currentCustomer.loggedIn && currentCustomer.phone) {
                    cartsByPhone[currentCustomer.phone] = legacyCart;
                }
                localStorage.setItem('mairua_cartsByPhone', JSON.stringify(cartsByPhone));
            }
        }

        function layKeyGioHangHienTai() {
            if (currentCustomer && currentCustomer.loggedIn && currentCustomer.phone) {
                return currentCustomer.phone;
            }
            return 'guest';
        }

        function layGioHangTheoKey(key) {
            if (!key || key === "0909501753") return [];
            return Array.isArray(cartsByPhone[key]) ? [...cartsByPhone[key]] : [];
        }

        // Tải giỏ hàng tương ứng với tài khoản đang đăng nhập hoặc khách vãng lai
        let cart = layGioHangTheoKey(layKeyGioHangHienTai());

        function luuGioHangLocal() {
            let key = layKeyGioHangHienTai();
            if (key === "0909501753") {
                cart = [];
                return;
            }
            cartsByPhone[key] = Array.isArray(cart) ? cart : [];
            localStorage.setItem('mairua_cartsByPhone', JSON.stringify(cartsByPhone));
            localStorage.setItem('mairua_cart', JSON.stringify(cart));

            // Đồng bộ ngay lên Server Cloud để mở điện thoại/laptop đều thấy
            if (currentCustomer && currentCustomer.loggedIn && currentCustomer.phone && !currentCustomer.isAdmin) {
                fetch('/api/cart/' + encodeURIComponent(currentCustomer.phone), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ cart })
                }).catch(() => {});
            }
        }

        async function dongBoGioHangTuServer(phone) {
            if (!phone || phone === "0909501753") return;
            try {
                let res = await fetch('/api/cart/' + encodeURIComponent(phone));
                let data = await res.json();
                if (data && data.success && Array.isArray(data.cart)) {
                    cart = data.cart;
                    cartsByPhone[phone] = cart;
                    localStorage.setItem('mairua_cartsByPhone', JSON.stringify(cartsByPhone));
                    localStorage.setItem('mairua_cart', JSON.stringify(cart));
                    capNhatGioHang();
                }
            } catch(e) {
                console.warn('Lỗi đồng bộ giỏ hàng:', e);
            }
        }

        function chuyenDoiGioHangSangTaiKhoan(newPhone) {
            let newKey = newPhone || 'guest';
            if (newKey === "0909501753") {
                cart = [];
            } else {
                cart = Array.isArray(cartsByPhone[newKey]) ? [...cartsByPhone[newKey]] : [];
            }
            localStorage.setItem('mairua_cart', JSON.stringify(cart));
            capNhatGioHang();
        }

        let rawLocalOrders = JSON.parse(localStorage.getItem('mairua_remoteOrdersList')) || [];
        let customerRealOrdersBackup = JSON.parse(localStorage.getItem('mairua_customerRealOrdersBackup')) || [];
        let remoteOrdersList = rawLocalOrders.filter(o => o && o.phone && o.name !== "Don hang mau");
        customerRealOrdersBackup.forEach(ro => {
            if (ro && ro.phone && !remoteOrdersList.some(o => o && ((o.orderCode && o.orderCode === ro.orderCode && o.startTime === ro.startTime) || (o.phone === ro.phone && o.startTime === ro.startTime)))) {
                remoteOrdersList.push(ro);
            }
        });
        remoteOrdersList.sort((a, b) => (a.startTime || 0) - (b.startTime || 0));
        localStorage.setItem('mairua_remoteOrdersList', JSON.stringify(remoteOrdersList));

        let couponsList = JSON.parse(localStorage.getItem('mairua_couponsList')) || [];
        let usedCouponsMap = JSON.parse(localStorage.getItem('mairua_usedCouponsMap')) || {}; // Lưu { phone: { CODE: usedTimestamp } }
        let appliedCoupon = null;
        let selectedAdminOrderIndex = null;
        let selectedAccountOrderIndex = null;
        let currentOpenedProductId = null;
        let selectedBaloStudioVariantIdx = 0;
        let selectedCustomJerseySize = 'M';
        let currentFilteredMaxPrice = 1000000;
        let selectedCheckoutAddrIdx = 0;

        const jerseyBasePalette = [
            { key: 'trang', name: 'Trắng', hex: '#f8fafc', stroke: '#cbd5e1' },
            { key: 'den', name: 'Đen', hex: '#18181b', stroke: '#3f3f46' },
            { key: 'do', name: 'Đỏ', hex: '#b91c1c', stroke: '#7f1d1d' },
            { key: 'xanh', name: 'Xanh Navy', hex: '#1e3a8a', stroke: '#172554' },
            { key: 'tim', name: 'Tím', hex: '#6d28d9', stroke: '#4c1d95' },
            { key: 'xanhla', name: 'Xanh lá', hex: '#15803d', stroke: '#14532d' }
        ];

        const textFillPalette = [
            { name: 'Trắng', hex: '#ffffff' },
            { name: 'Đen', hex: '#111111' },
            { name: 'Đỏ tươi', hex: '#dc2626' },
            { name: 'Đỏ đô', hex: '#7f1d1d' },
            { name: 'Cam', hex: '#ea550c' },
            { name: 'Vàng gold', hex: '#eab308' },
            { name: 'Xanh lá', hex: '#16a34a' },
            { name: 'Xanh đậm', hex: '#1e3a8a' },
            { name: 'Xanh dương', hex: '#2563eb' },
            { name: 'Tím', hex: '#7c3aed' },
            { name: 'Xám đậm', hex: '#6b7280' },
            { name: 'Xám bạc', hex: '#cbd5e1' }
        ];

        let jerseyStudioState = {
            baseColorHex: '#6d28d9', baseColorName: 'Tím', baseStrokeHex: '#4c1d95',
            trimColorHex: '#eab308', trimColorName: 'Vàng gold',
            fillColorHex: '#eab308', fillColorName: 'Vàng gold',
            strokeColorHex: '#ffffff', strokeColorName: 'Trắng',
            fontFamily: "'Bebas Neue', sans-serif", fontLabel: 'Bebas Neue',
            viewSide: 'back',
            zones: { backName: true, backNum: true, frontNum: true, frontLogo: false },
            scales: { frontNum: 96, backNum: 108, backName: 32, teamName: 26 },
            basePrice: 200000,
            mode: 'jersey',
            shortsColorHex: '#6d28d9', shortsColorName: 'Tím', shortsColorCustom: false,
            shortsTrimHex: '#eab308', shortsTrimName: 'Vàng gold', shortsTrimCustom: false,
            shortsNumSize: 46
        };
        const SHORTS_ONLY_BASE_PRICE = 150000;   // Phôi quần bán lẻ
        const SET_BASE_PRICE = 250000;           // Phôi nguyên bộ (áo + quần) - giá ưu đãi
        const SET_JERSEY_PART_PRICE = 170000;    // Phần phôi áo trong bộ
        const SET_SHORTS_PART_PRICE = 80000;     // Phần phôi quần trong bộ (170k + 80k = 250k)
        const SHORTS_NUM_FEE = 30000;            // Phí in số bên trái phía trước quần

        let rosterPlayers = [
            { name: 'NGUYEN', number: '23', size: 'L', qty: 1 },
            { name: 'TRAN', number: '7', size: 'M', qty: 1 },
            { name: 'LE', number: '11', size: 'XL', qty: 1 },
            { name: 'PHAM', number: '0', size: 'M', qty: 1 },
            { name: 'VU', number: '00', size: '2XL', qty: 1 },
            { name: 'DANG', number: '5', size: 'S', qty: 1 }
        ];

        let autoFakeOrderEnabled = true;
        let fomoPopupTimeout = null;
        let currentPopupPromoCode = '';

        const vnFamilyNames = ["Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Huỳnh", "Phan", "Vũ", "Võ", "Đặng", "Bùi", "Đỗ", "Hồ", "Ngô", "Dương", "Lý", "Đinh", "Đoàn", "Lâm", "Trịnh"];
        const vnMiddleNames = ["Văn", "Thị", "Hữu", "Đức", "Minh", "Quốc", "Gia", "Thanh", "Hoàng", "Tuấn", "Bảo", "Xuân", "Ngọc", "Đình", "Thành", "Khánh", "Anh", "Trọng"];
        const vnGivenNames = ["Nam", "Quân", "Huy", "Kiệt", "Khánh", "Tùng", "Bảo", "Anh", "Khôi", "Thảo", "Long", "Đạt", "Phong", "Triết", "Khang", "Phúc", "Hào", "Nhân", "Bách", "Vỹ", "Nhật", "Khiêm", "Tuấn", "Hưng", "Vinh", "Hoàng", "Thanh", "Trường", "Hải", "Hậu", "Dũng", "Chinh", "Đức", "Trọng", "Linh", "Tài", "Đăng", "Khoa", "Việt", "Du"];
        const vnLocations = [
            "Quận 1, TP.HCM", "Quận 3, TP.HCM", "Quận 5, TP.HCM", "Quận 7, TP.HCM", "Quận 10, TP.HCM",
            "Quận Bình Thạnh, TP.HCM", "Quận Tân Phú, TP.HCM", "Quận Tân Bình, TP.HCM", "Quận Gò Vấp, TP.HCM", "TP. Thủ Đức, TP.HCM",
            "Quận Cầu Giấy, Hà Nội", "Quận Đống Đa, Hà Nội", "Quận Ba Đình, Hà Nội", "Quận Hai Bà Trưng, Hà Nội", "Quận Thanh Xuân, Hà Nội",
            "Quận Hải Châu, Đà Nẵng", "Quận Thanh Khê, Đà Nẵng", "TP. Nha Trang, Khánh Hòa", "Quận Ninh Kiều, Cần Thơ", "TP. Biên Hòa, Đồng Nai"
        ];
        const vnPrefixes = ["090", "091", "093", "097", "098", "086", "088", "089", "070", "079"];

        function taoKhachHangNgauNhienTheoIndex(idx) {
            let fam = vnFamilyNames[idx % vnFamilyNames.length];
            let mid = vnMiddleNames[(Math.floor(idx / vnFamilyNames.length)) % vnMiddleNames.length];
            let giv = vnGivenNames[(Math.floor(idx / (vnFamilyNames.length * vnMiddleNames.length))) % vnGivenNames.length];
            let pre = vnPrefixes[idx % vnPrefixes.length];
            let numPart = (1000000 + (idx * 1373) % 9000000).toString().substring(0, 7);
            let streetNum = (idx * 7) % 350 + 12;
            let loc = vnLocations[idx % vnLocations.length];
            return { name: `${fam} ${mid} ${giv}`, phone: `${pre}${numPart}`, addr: `${streetNum} Đường số ${(idx % 25) + 1}, ${loc}` };
        }

        const pool500Customers = [];
        for (let i = 0; i < 500; i++) pool500Customers.push(taoKhachHangNgauNhienTheoIndex(i));

        if (remoteOrdersList.length === 0) {
            const now = Date.now();
            remoteOrdersList = [
                {
                    orderCode: "MVP12301", name: "Nguyễn Hoàng Nam", phone: "0908412789", addr: "142 Nguyễn Thị Minh Khai, Quận 3, TP.HCM",
                    itemsCount: 1, itemsList: ["• Nike Elite V1 Basketball Backpack (Trắng Đen) (x1) - 520.000đ"],
                    hasCustomJersey: false, jerseyCount: 0,
                    subtotal: 520000, discountAmt: 0, finalTotal: 550000, earnedMCoin: 27500, couponUsed: null,
                    startTime: now - (180 * MIN_MS)
                },
                {
                    orderCode: "MVP12345", name: "Trần Minh Quân", phone: "0912654318", addr: "215 Trần Hưng Đạo, Quận 5, TP.HCM",
                    itemsCount: 6, itemsList: ["• Roster MVP Saigon Owls — 6 Jersey (Tím · Bebas Neue) (x6) - 2.508.000đ"],
                    hasCustomJersey: true, jerseyCount: 6,
                    subtotal: 2508000, discountAmt: 0, finalTotal: 2538000, earnedMCoin: 126900, couponUsed: null,
                    startTime: now - (115 * MIN_MS)
                }
            ];
            localStorage.setItem('mairua_remoteOrdersList', JSON.stringify(remoteOrdersList));
        }

        // LẤY DANH SÁCH CÁC PHÂN LOẠI HÀNG TỒN <= 5 CÁI ĐỂ CẢNH BÁO ADMIN
        function layDanhSachHangTonThap() {
            let lowItems = [];
            products.forEach(p => {
                p.variants.forEach((v, vIdx) => {
                    if (v.stock <= 5) {
                        lowItems.push({
                            prodId: p.id,
                            prodName: p.name,
                            vIdx: vIdx,
                            colorName: v.colorName,
                            hex: v.hex,
                            stock: v.stock,
                            sold: v.sold || 0,
                            price: p.price
                        });
                    }
                });
            });
            return lowItems.sort((a, b) => a.stock - b.stock);
        }

        // HỆ THỐNG TÍNH CÔNG ĐOẠN ĐƠN HÀNG
        function kiemTraDonCoAoJerseyThietKe(ord) {
            if (!ord) return false;
            if (typeof ord.hasCustomJersey === 'boolean') return ord.hasCustomJersey;
            if (Array.isArray(ord.itemsList)) {
                return ord.itemsList.some(line => {
                    let l = line.toLowerCase();
                    return (l.includes('custom') && l.includes('jersey')) || l.includes('roster');
                });
            }
            return false;
        }

        function laySoLuongAoJerseyTrongDon(ord) {
            if (!ord) return 1;
            if (typeof ord.jerseyCount === 'number' && ord.jerseyCount > 0) return ord.jerseyCount;
            if (kiemTraDonCoAoJerseyThietKe(ord)) return Math.max(1, ord.itemsCount || 1);
            return 0;
        }

        function taoMaDonHangMoi() {
            let code = '';
            do {
                // Random 5 số bất kỳ từ 10000 đến 99999 (đảm bảo đúng 5 chữ số ngẫu nhiên, không trùng lặp)
                let rand = Math.floor(10000 + Math.random() * 90000);
                code = 'MVP' + rand;
            } while (remoteOrdersList && remoteOrdersList.some(o => o && (o.orderCode === code || o.originalOrderCode === code)));
            return code;
        }

        function taoMaVoucherNgauNhien(percent) {
            const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
            let code = "";
            do {
                let randLetters = "";
                for (let i = 0; i < 3; i++) {
                    randLetters += letters.charAt(Math.floor(Math.random() * letters.length));
                }
                code = `${randLetters}${percent}`;
            } while (couponsList && couponsList.some(c => c && c.code && c.code.toUpperCase() === code));
            return code;
        }

        function layStepIndexTuTenTrangThai(statusName, isJerseyOrder) {
            if (!statusName) return 0;
            let s = String(statusName).trim().toLowerCase();
            if (s === 'đã hủy' || s === 'da huy') return -1;
            if (s === 'hoàn tất' || s === 'hoàn thành' || s === 'hoan tat' || s === 'hoan thanh') return 99;
            if (isJerseyOrder) {
                if (s.includes('chờ xác nhận')) return 0;
                if (s.includes('xuất file')) return 1;
                if (s.includes('in') || s.includes('ép')) return 2;
                if (s.includes('qc')) return 3;
                if (s.includes('chờ lấy') || s.includes('lấy hàng')) return 4;
                if (s.includes('đang giao')) return 5;
                if (s.includes('đã giao') || s.includes('đã nhận')) return 6;
            } else {
                if (s.includes('chờ xác nhận')) return 0;
                if (s.includes('chờ lấy') || s.includes('lấy hàng')) return 1;
                if (s.includes('đang giao')) return 2;
                if (s.includes('đã giao') || s.includes('đã nhận')) return 3;
            }
            return 0;
        }

        function kiemTraDonDaDuocDuyet(ord) {
            if (!ord) return false;
            // Đơn ảo FOMO (không phải khách thật) -> Tự động duyệt ngay lập tức
            if (!ord.isRealCustomerOrder) return true;

            // Đơn khách đặt thật -> Bắt buộc Admin duyệt qua nút bấm hoặc đã tiến sang công đoạn khác
            if (ord.adminConfirmed === true) return true;
            if (typeof ord.manualStepIdx === 'number' && ord.manualStepIdx >= 1) return true;
            let s = ord.lastSyncedSheetStatus || ord.status || '';
            if (s && s !== 'Chờ xác nhận' && s !== 'Chờ thanh toán' && s !== 'Đã hủy') return true;
            return false;
        }

        function layThongTinTienTrinhDon(ord) {
            if (!ord) return { steps: [], currentIdx: 0, isCancelled: false, cancelledAtStep: null, currentLabel: 'Chờ xác nhận', badgeClass: 'badge-orange', printingSubText: '' };

            let isJerseyOrder = kiemTraDonCoAoJerseyThietKe(ord);
            let jerseyQty = laySoLuongAoJerseyTrongDon(ord);
            let steps = [], durationsMin = [];

            if (isJerseyOrder) {
                steps = ["Chờ xác nhận", "Chờ xuất file in", "Đang in/ép", "QC", "Chờ lấy hàng", "Đang giao", "Đã giao", "Hoàn tất"];
                durationsMin = [0, 30, Math.max(1, jerseyQty) * 10, 20, 20, 20, 30];
            } else {
                steps = ["Chờ xác nhận", "Chờ lấy hàng", "Đang giao", "Đã giao", "Hoàn tất"];
                durationsMin = [0, 20, 20, 20, 30];
            }

            let isConfirmed = kiemTraDonDaDuocDuyet(ord);
            let calcIdx = 0, accMin = 0, printingSubText = '';

            // Nếu đơn CHƯA được Admin duyệt thì giữ nguyên ở bước 0 ("Chờ xác nhận"), KHÔNG tự động nhảy theo thời gian
            if (isConfirmed) {
                calcIdx = 1;
                let baseTime = ord.confirmedAt || ord.startTime || Date.now();
                let elapsedMin = Math.max(0, (Date.now() - baseTime) / MIN_MS);

                for (let i = 1; i < durationsMin.length; i++) {
                    if (elapsedMin >= accMin + durationsMin[i]) {
                        accMin += durationsMin[i];
                        calcIdx = i + 1;
                    } else {
                        if (isJerseyOrder && i === 2) {
                            let minInPrinting = elapsedMin - accMin;
                            let printedSoFar = Math.min(jerseyQty, Math.floor(minInPrinting / 10) + 1);
                            printingSubText = `Xưởng đang ép DTF ${printedSoFar}/${jerseyQty} áo (10 phút/áo)`;
                        }
                        break;
                    }
                }

                if (typeof ord.manualStepIdx === 'number') {
                    calcIdx = Math.max(calcIdx, Math.min(steps.length - 1, ord.manualStepIdx));
                    if (calcIdx === steps.length - 2) {
                        if (!ord.deliveredAt) ord.deliveredAt = Date.now();
                        if ((Date.now() - ord.deliveredAt) >= 30 * MIN_MS) calcIdx = steps.length - 1;
                    }
                    if (isJerseyOrder && calcIdx === 2 && !printingSubText) {
                        printingSubText = `Xưởng đang ép DTF 1/${jerseyQty} áo (10 phút/áo)`;
                    }
                }
            }

            if (ord.isCancelled) {
                let stopIdx = typeof ord.cancelledAtStep === 'number' ? ord.cancelledAtStep : calcIdx;
                return { steps, isJerseyOrder, jerseyQty, currentIdx: stopIdx, isCancelled: true, cancelledAtStep: stopIdx, currentLabel: 'ĐÃ HỦY', badgeClass: 'badge-red', printingSubText: '' };
            }

            let currentLabel = steps[calcIdx] || steps[0];
            let badgeClass = 'badge-orange';
            if (calcIdx === steps.length - 1 || currentLabel === 'Đã giao' || currentLabel === 'Đã nhận' || currentLabel === 'Hoàn tất' || currentLabel === 'Hoàn thành') badgeClass = 'badge-green';
            else if (currentLabel === 'Đang giao') badgeClass = 'badge-blue';
            else if (currentLabel === 'Chờ xác nhận') badgeClass = 'badge-orange';

            let autoCompleteRemainMin = 30;
            if (calcIdx === steps.length - 2) {
                autoCompleteRemainMin = ord.deliveredAt ? Math.max(1, Math.ceil((30 * MIN_MS - (Date.now() - ord.deliveredAt)) / MIN_MS)) : Math.max(1, Math.ceil((accMin + 30) - elapsedMin));
            }
            return { steps, isJerseyOrder, jerseyQty, currentIdx: calcIdx, isCancelled: false, cancelledAtStep: null, currentLabel, badgeClass, printingSubText, autoCompleteRemainMin };
        }

        function taoHtmlTimelineChiTietDon(ord, realOrderIndex, isAdminView = false) {
            let info = layThongTinTienTrinhDon(ord);
            let orderCode = ord.orderCode || `MVP${12200 + realOrderIndex}`;
            let d = new Date(ord.startTime || Date.now());
            let dateStr = `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')} ngày ${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
            let totalPipelineMinutes = info.isJerseyOrder ? (30 + Math.max(1, info.jerseyQty) * 10 + 90) : 90;
            let baseEstTime = ord.confirmedAt || ord.startTime || Date.now();
            let estDate = new Date(baseEstTime + totalPipelineMinutes * MIN_MS);
            let estStr = `${String(estDate.getHours()).padStart(2,'0')}:${String(estDate.getMinutes()).padStart(2,'0')} ngày ${String(estDate.getDate()).padStart(2,'0')}/${String(estDate.getMonth()+1).padStart(2,'0')}/${estDate.getFullYear()} (tổng ~${totalPipelineMinutes} phút)`;

            let customNote = info.isJerseyOrder
                ? `có áo thiết kế Jersey (${info.jerseyQty} áo · in 10 phút/áo · giao 1 kiện sau khi in xong)`
                : `đơn tiêu chuẩn`;

            let timelineItemsHtml = '';
            if (info.isCancelled) {
                for (let i = 0; i <= info.cancelledAtStep && i < info.steps.length; i++) {
                    timelineItemsHtml += `<div class="v-step done"><span class="v-step-dot"></span><div>${info.steps[i]}</div></div>`;
                }
                timelineItemsHtml += `<div class="v-step cancelled"><span class="v-step-dot"></span><div>Đã hủy</div><div class="v-step-sub">Đơn hàng đã bị hủy tại công đoạn "${info.steps[info.cancelledAtStep] || 'Chờ xác nhận'}".</div></div>`;
            } else {
                info.steps.forEach((stepName, idx) => {
                    let cls = idx < info.currentIdx ? 'done' : (idx === info.currentIdx ? 'current' : '');
                    let subHtml = '';
                    if (idx === 0 && info.currentIdx === 0) {
                        subHtml = `<div class="v-step-sub" style="color:#d97706; font-weight:600;">⏳ Đang chờ Admin/Shop xác nhận đơn hàng...</div>`;
                    } else if (idx === info.currentIdx && info.printingSubText && stepName === 'Đang in/ép') {
                        subHtml = `<div class="v-step-sub">${info.printingSubText}</div>`;
                    }
                    timelineItemsHtml += `<div class="v-step ${cls}"><span class="v-step-dot"></span><div>${stepName}</div>${subHtml}</div>`;
                });
            }

            let itemsHtml = Array.isArray(ord.itemsList) ? ord.itemsList.join('<br>') : `${ord.itemsCount || 1} sản phẩm`;
            let canCancel = !info.isCancelled && info.currentIdx < info.steps.length - 2;
            let isAtDeliveredStep = !info.isCancelled && info.currentIdx === info.steps.length - 2;

            let bottomActionHtml = info.isCancelled
                ? `<div style="background:#fef2f2; border-left:4px solid #dc2626; padding:12px 14px; border-radius:6px; font-size:12.5px; color:#991b1b; font-weight:600;">Đơn hàng này đã hủy (Đã hoàn trả lại số lượng hàng tồn kho).</div>`
                : (canCancel
                    ? `<div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:10px; background:#fff8f5; border:1px solid #fed7aa; padding:12px 16px; border-radius:10px;">
                        <span style="font-size:12.5px; color:#7c2d12;">Nếu nhấn hủy, tiến trình sẽ ngắt ngay tại bước <b>"${info.currentLabel}"</b> và chuyển thành Đã hủy.</span>
                        <div style="display:flex; gap:8px; flex-wrap:wrap;"><button type="button" onclick="huyDonHangTheoIndex(${realOrderIndex}, ${isAdminView})" style="background:#dc2626; color:#fff; border:none; padding:8px 18px; border-radius:8px; font-weight:700; font-size:12.5px; cursor:pointer; font-family:'Poppins',sans-serif;">✕ Hủy đơn hàng</button>


                        </div>
                       </div>`
                    : (isAtDeliveredStep
                        ? `<div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px; background:#f0fdf4; border:1.5px solid #16a34a; padding:14px 18px; border-radius:10px;">
                            <div style="font-size:13px; color:#166534; line-height:1.5;">
                                📦 <b>Đơn hàng đã giao đến nơi!</b> Vui lòng kiểm tra và nhấn <b>"Đã nhận được hàng"</b>.<br>
                                <span style="font-size:12px; color:#15803d;">⏳ Nếu quá 30 phút không nhấn (còn ~<b>${info.autoCompleteRemainMin || 30} phút</b>), hệ thống sẽ tự động chuyển qua <b>Hoàn tất</b>.</span>
                            </div>
                            ${!isAdminView ? `<button type="button" onclick="khachXacNhanDaNhanHang(${realOrderIndex})" style="background:#16a34a; color:#fff; border:none; padding:10px 20px; border-radius:8px; font-weight:800; font-size:13px; cursor:pointer; font-family:'Poppins',sans-serif; box-shadow:0 4px 12px rgba(22,163,74,0.25);">✅ Đã nhận được hàng</button>` : ''}
                           </div>`
                        : `<div style="background:#f0fdf4; border-left:4px solid #16a34a; padding:12px 14px; border-radius:6px; font-size:12.5px; color:#166534; font-weight:600;">Đơn hàng đã hoàn tất! Đã cộng +${(ord.earnedMCoin || Math.round((ord.finalTotal || 0)*0.05)).toLocaleString('vi-VN')} M-Coin (${ord.cashbackPercent || 5}%) và +1 Token AI.</div>${taoHtmlKhungDanhGiaTrongDon(ord, realOrderIndex, isAdminView)}`));

            let isConfirmed = kiemTraDonDaDuocDuyet(ord);
            let adminControlHtml = '';
            if (isAdminView && !info.isCancelled) {
                if (!isConfirmed) {
                    adminControlHtml = `
                    <div style="margin-bottom:16px; background:#f0fdf4; border:2px solid #22c55e; padding:16px 20px; border-radius:12px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px; box-shadow:0 4px 14px rgba(34,197,94,0.15);">
                        <div>
                            <div style="font-size:14px; font-weight:800; color:#15803d; display:flex; align-items:center; gap:6px;">
                                <span style="font-size:18px;">🛡️</span> ĐƠN HÀNG MỚI ĐANG CHỜ DUYỆT
                            </div>
                            <div style="font-size:12.5px; color:#166534; margin-top:3px;">
                                Nhấn nút bên cạnh để duyệt đơn này và chuyển ngay sang công đoạn <b>"${info.steps[1]}"</b> (Đồng bộ lên Google Sheets).
                            </div>
                        </div>
                        <div style="display:flex; gap:10px; flex-wrap:wrap;">
                            <button type="button" onclick="adminXacNhanDonHang(${realOrderIndex})" style="background:#16a34a; color:#fff; border:none; padding:11px 22px; border-radius:8px; font-size:13px; font-weight:800; cursor:pointer; font-family:'Poppins',sans-serif; box-shadow:0 3px 12px rgba(22,163,74,0.35);">✅ Xác nhận duyệt đơn này</button>
                            <button type="button" onclick="huyDonHangTheoIndex(${realOrderIndex}, true)" style="background:#dc2626; color:#fff; border:none; padding:11px 16px; border-radius:8px; font-size:12.5px; font-weight:700; cursor:pointer; font-family:'Poppins',sans-serif;">✕ Hủy đơn spam</button>
                        </div>
                    </div>`;
                } else if (info.currentIdx < info.steps.length - 1) {
                    adminControlHtml = `
                    <div style="margin-bottom:16px; background:#eff6ff; border:1.5px solid #93c5fd; padding:14px 18px; border-radius:12px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px;">
                        <div>
                            <span style="font-size:13.5px; font-weight:800; color:#1e40af;">🛡️ Điều khiển tiến trình đơn (Admin Demo):</span>
                            <div style="font-size:12px; color:#1e3a8a; margin-top:2px;">Bấm nút để chuyển nhanh công đoạn đơn hàng trong buổi thuyết trình.</div>
                        </div>
                        <div style="display:flex; gap:8px; flex-wrap:wrap;">
                            <button type="button" onclick="adminChuyenBuocTiepTheo(${realOrderIndex})" style="background:#2563eb; color:#fff; border:none; padding:8px 16px; border-radius:8px; font-size:12.5px; font-weight:700; cursor:pointer; font-family:'Poppins',sans-serif; box-shadow:0 2px 8px rgba(37,99,235,0.25);">⏭ Chuyển công đoạn tiếp theo</button>
                            <button type="button" onclick="adminHoanTatDonNgay(${realOrderIndex})" style="background:#16a34a; color:#fff; border:none; padding:8px 16px; border-radius:8px; font-size:12.5px; font-weight:700; cursor:pointer; font-family:'Poppins',sans-serif; box-shadow:0 2px 8px rgba(22,163,74,0.25);">✅ Hoàn tất đơn ngay</button>
                        </div>
                    </div>`;
                }
            }

            let customerPendingNoticeHtml = (!isAdminView && !isConfirmed && !info.isCancelled)
                ? `<div style="margin-bottom:16px; background:#fffbeb; border:1.5px solid #fde68a; padding:12px 16px; border-radius:10px; font-size:12.5px; color:#92400e; display:flex; align-items:center; gap:10px;">
                    <span style="font-size:20px;">⏳</span>
                    <div><b>Đơn hàng đang chờ Shop duyệt:</b> Shop sẽ kiểm tra và xác nhận đơn sớm nhất. Sau khi duyệt, đơn sẽ tự động chuyển sang công đoạn <b>"${info.steps[1]}"</b>.</div>
                   </div>`
                : '';

            let backBtnHtml = isAdminView
                ? `<button onclick="thuGonChiTietDon()" style="background:#111; color:#fff; border:none; padding:5px 12px; border-radius:6px; font-size:12px; cursor:pointer; float:right;">Thu gọn [×]</button>`
                : `<div onclick="quayLaiDanhSachDonTaiKhoan()" style="color:#ff5500; font-size:13px; font-weight:600; cursor:pointer; margin-bottom:10px;">← Danh sách đơn</div>`;

            return `
                ${backBtnHtml}
                <div style="display:flex; justify-content:space-between; align-items:baseline; flex-wrap:wrap; gap:10px;">
                    <div style="display:flex; align-items:baseline; gap:10px; flex-wrap:wrap;">
                        <h2 style="font-family:'Bebas Neue','Oswald',sans-serif; font-size:34px; font-style:italic; letter-spacing:0.8px; color:#111; margin:0;">ĐƠN ${orderCode}</h2>
                        <a href="javascript:void(0)" onclick="moModalHoaDonDienTu(${realOrderIndex})" style="font-size:13.5px; color:#ff5500; text-decoration:underline; font-weight:600; cursor:pointer;" title="Nhấn để xem hóa đơn điện tử kiểu bill siêu thị">(hóa đơn điện tử)</a>
                    </div>
                    <div style="color:#ff5500; font-weight:800; font-size:18px;">${(ord.finalTotal || ord.subtotal || 0).toLocaleString('vi-VN')}đ</div>
                </div>
                <div style="font-size:12.5px; color:#666; margin-bottom:14px;">Đặt ${dateStr} · ${ord.itemsCount || 1} SP · ${customNote} · Dự kiến ${estStr}</div>
                <div style="background:#f9fafb; border:1px solid #eee; padding:12px 14px; border-radius:8px; font-size:12.5px; line-height:1.6; margin-bottom:16px;">
                    <div><b>Người nhận:</b> ${ord.name} (${ord.phone}) — ${ord.addr}</div>
                    <div style="margin-top:4px;"><b>Sản phẩm:</b><br>${itemsHtml}</div>
                </div>
                ${adminControlHtml}
                ${customerPendingNoticeHtml}
                <div class="v-timeline">${timelineItemsHtml}</div>
                ${bottomActionHtml}
            `;
        }

        function dongBoBackupDonKhachThat(ord) {
            if (!ord || !ord.isRealCustomerOrder) return;
            customerRealOrdersBackup = JSON.parse(localStorage.getItem('mairua_customerRealOrdersBackup')) || customerRealOrdersBackup || [];
            let idx = customerRealOrdersBackup.findIndex(o => o && o.orderCode === ord.orderCode && o.startTime === ord.startTime);
            if (idx !== -1) customerRealOrdersBackup[idx] = { ...ord };
            else customerRealOrdersBackup.push({ ...ord });
            localStorage.setItem('mairua_customerRealOrdersBackup', JSON.stringify(customerRealOrdersBackup));
        }

        // TỰ ĐỘNG ĐỒNG BỘ TRẠNG THÁI ĐƠN HÀNG LÊN GOOGLE SHEETS KHI ĐƠN TIẾN TRIỂN THEO THỜI GIAN
        let daDongBoTrangThaiSheet = {};
        function dongBoTrangThaiDonHangLenSheet() {
            if (!GOOGLE_SHEETS_API_URL) return;
            let ordersToCheck = (remoteOrdersList || []).filter(o => o && o.orderCode && o.phone);
            ordersToCheck.forEach(ord => {
                let info = layThongTinTienTrinhDon(ord);
                let currentStatus = info.isCancelled ? 'Đã hủy' : (info.currentLabel || 'Chờ xác nhận');
                let targetCode = ord.originalOrderCode || ord.orderCode;
                if (daDongBoTrangThaiSheet[ord.orderCode] !== currentStatus) {
                    daDongBoTrangThaiSheet[ord.orderCode] = currentStatus;
                    daDongBoTrangThaiSheet[targetCode] = currentStatus;
                    guiDuLieuGoogleSheets('updateOrderStatus', {
                        orderCode: targetCode,
                        status: currentStatus,
                        phone: ord.phone
                    });
                }
            });
        }

        function layDanhSachVariantCanTruTuDon(ord) {
            if (!ord) return [];
            if (Array.isArray(ord.deductedVariants) && ord.deductedVariants.length > 0) {
                return ord.deductedVariants.map(dv => ({ prodId: Number(dv.prodId), vIdx: Number(dv.vIdx) || 0, qty: parseInt(dv.qty) || 1 }));
            }
            let list = [];
            if (Array.isArray(ord.itemsList)) {
                ord.itemsList.forEach(line => {
                    let qtyMatch = line.match(/\(x(\d+)\)/i);
                    let qty = qtyMatch ? (parseInt(qtyMatch[1]) || 1) : 1;
                    let lowerLine = line.toLowerCase();
                    if (lowerLine.includes('roster') || (lowerLine.includes('jersey') && lowerLine.includes('custom'))) {
                        let blankProd = products.find(p => p.id === 22);
                        if (blankProd) {
                            let vIdx = blankProd.variants.findIndex(v => lowerLine.includes(v.colorName.toLowerCase()));
                            if (vIdx === -1) vIdx = 0;
                            list.push({ prodId: 22, vIdx, qty });
                        }
                    } else {
                        let matchedProd = products.find(p => !p.isJerseyBlank && lowerLine.includes(p.name.toLowerCase()));
                        if (matchedProd) {
                            let vIdx = matchedProd.variants.findIndex(v => lowerLine.includes(v.colorName.toLowerCase()));
                            if (vIdx === -1) vIdx = 0;
                            list.push({ prodId: matchedProd.id, vIdx, qty });
                        }
                    }
                });
            }
            return list;
        }

        function dongBoTonKhoChuanXac() {
            let freshLocalProds = JSON.parse(localStorage.getItem('mairua_products'));
            if (Array.isArray(freshLocalProds)) {
                products.forEach(p => {
                    let savedP = freshLocalProds.find(sp => sp.id === p.id);
                    if (savedP && Array.isArray(savedP.variants)) {
                        p.variants.forEach((v, idx) => {
                            let savedV = savedP.variants.find(sv => sv.colorName === v.colorName) || savedP.variants[idx];
                            if (savedV) {
                                if (typeof savedV.stock === 'number') v.stock = savedV.stock;
                                if (typeof savedV.sold === 'number') v.sold = savedV.sold;
                            }
                        });
                    }
                });
            }

            let stockLedger = JSON.parse(localStorage.getItem('mairua_stockLedgerV2')) || {};
            let ledgerChanged = false;
            let backupOrders = JSON.parse(localStorage.getItem('mairua_customerRealOrdersBackup')) || [];
            let allOrders = [...remoteOrdersList, ...backupOrders];
            let seenKeys = new Set();

            allOrders.forEach(ord => {
                if (!ord || !ord.orderCode) return;
                let ordKey = `${ord.orderCode}_${ord.startTime || 0}`;
                if (seenKeys.has(ordKey)) return;
                seenKeys.add(ordKey);

                let isCustOrd = !!(ord.isRealCustomerOrder || ord.accountPhone || (Array.isArray(ord.deductedVariants) && ord.deductedVariants.length > 0));
                if (!isCustOrd) return;

                let dvList = layDanhSachVariantCanTruTuDon(ord);
                if (dvList.length === 0) return;

                if (!ord.isCancelled && !stockLedger[ordKey]) {
                    dvList.forEach(dv => {
                        let prod = products.find(p => p.id === Number(dv.prodId));
                        if (prod && prod.variants[dv.vIdx]) {
                            let q = parseInt(dv.qty) || 1;
                            prod.variants[dv.vIdx].stock = Math.max(0, prod.variants[dv.vIdx].stock - q);
                            prod.variants[dv.vIdx].sold = (prod.variants[dv.vIdx].sold || 0) + q;
                        }
                    });
                    stockLedger[ordKey] = 'deducted';
                    ledgerChanged = true;
                } else if (ord.isCancelled && stockLedger[ordKey] === 'deducted' && !ord.stockRestored) {
                    dvList.forEach(dv => {
                        let prod = products.find(p => p.id === Number(dv.prodId));
                        if (prod && prod.variants[dv.vIdx]) {
                            let q = parseInt(dv.qty) || 1;
                            prod.variants[dv.vIdx].stock += q;
                            prod.variants[dv.vIdx].sold = Math.max(0, (prod.variants[dv.vIdx].sold || 0) - q);
                        }
                    });
                    ord.stockRestored = true;
                    // synced in stockLedger below
                    // key updated below
                if (typeof ord !== 'undefined' && ord) { let sl = JSON.parse(localStorage.getItem('mairua_stockLedgerV2')) || {}; sl[`${ord.orderCode || ''}_${ord.startTime || 0}`] = 'restored'; localStorage.setItem('mairua_stockLedgerV2', JSON.stringify(sl)); }
                    stockLedger[ordKey] = 'restored';
                    ledgerChanged = true;
                }
            });

            capNhatTongStockVaSoldSanPham();
            if (ledgerChanged) { localStorage.setItem('mairua_stockLedgerV2', JSON.stringify(stockLedger));
                if (typeof ord !== 'undefined' && ord) { let sl = JSON.parse(localStorage.getItem('mairua_stockLedgerV2')) || {}; sl[`${ord.orderCode || ''}_${ord.startTime || 0}`] = 'restored'; localStorage.setItem('mairua_stockLedgerV2', JSON.stringify(sl)); }
                localStorage.setItem('mairua_products', JSON.stringify(products));
            }
        }

        function hoanTraTonKhoKhiHuyDon(ord) {
            dongBoTonKhoChuanXac();
            if (!ord || ord.stockRestored) return;
            let restoredAny = false;

            if (Array.isArray(ord.deductedVariants) && ord.deductedVariants.length > 0) {
                ord.deductedVariants.forEach(dv => {
                    let prod = products.find(p => p.id === dv.prodId);
                    if (prod && prod.variants[dv.vIdx]) {
                        let qty = parseInt(dv.qty) || 1;
                        prod.variants[dv.vIdx].stock += qty;
                        prod.variants[dv.vIdx].sold = Math.max(0, (prod.variants[dv.vIdx].sold || 0) - qty);
                        restoredAny = true;
                    }
                });
            } else if (Array.isArray(ord.itemsList)) {
                ord.itemsList.forEach(line => {
                    let qtyMatch = line.match(/\(x(\d+)\)/i);
                    let qty = qtyMatch ? (parseInt(qtyMatch[1]) || 1) : 1;
                    let lowerLine = line.toLowerCase();

                    if (lowerLine.includes('roster') || (lowerLine.includes('jersey') && lowerLine.includes('custom'))) {
                        let blankProd = products.find(p => p.id === 22);
                        if (blankProd) {
                            let vIdx = blankProd.variants.findIndex(v => lowerLine.includes(v.colorName.toLowerCase()));
                            if (vIdx === -1) vIdx = 0;
                            blankProd.variants[vIdx].stock += qty;
                            blankProd.variants[vIdx].sold = Math.max(0, (blankProd.variants[vIdx].sold || 0) - qty);
                            restoredAny = true;
                        }
                    } else {
                        let matchedProd = products.find(p => !p.isJerseyBlank && line.includes(p.name));
                        if (matchedProd) {
                            let vIdx = matchedProd.variants.findIndex(v => line.includes(v.colorName));
                            if (vIdx === -1) vIdx = 0;
                            matchedProd.variants[vIdx].stock += qty;
                            matchedProd.variants[vIdx].sold = Math.max(0, (matchedProd.variants[vIdx].sold || 0) - qty);
                            restoredAny = true;
                        }
                    }
                });
            }

            if (restoredAny) {
                ord.stockRestored = true;
                    // synced in stockLedger below
                    // key updated below
                if (typeof ord !== 'undefined' && ord) { let sl = JSON.parse(localStorage.getItem('mairua_stockLedgerV2')) || {}; sl[`${ord.orderCode || ''}_${ord.startTime || 0}`] = 'restored'; localStorage.setItem('mairua_stockLedgerV2', JSON.stringify(sl)); }
                capNhatTongStockVaSoldSanPham();
                localStorage.setItem('mairua_products', JSON.stringify(products));
            }
        }

        function huyDonHangTheoIndex(realIndex, isAdminView = false) {
            let ord = remoteOrdersList[realIndex];
            if (!ord) return;
            let info = layThongTinTienTrinhDon(ord);
            if (info.isCancelled) return;
            if (!confirm(`Bạn có chắc chắn muốn hủy đơn hàng tại bước "${info.currentLabel}" không? Số lượng sản phẩm trong đơn sẽ được cộng trả lại vào tồn kho.`)) return;

            ord.isCancelled = true;
            ord.cancelledAtStep = info.currentIdx;
            let targetCode = ord.originalOrderCode || ord.orderCode;
            daDongBoTrangThaiSheet[ord.orderCode] = 'Đã hủy';
            daDongBoTrangThaiSheet[targetCode] = 'Đã hủy';
            guiDuLieuGoogleSheets('updateOrderStatus', { orderCode: targetCode, status: 'Đã hủy', phone: ord.phone });
            hoanTraTonKhoKhiHuyDon(ord);
            dongBoBackupDonKhachThat(ord);
            luuDuLieuLenDamMay();
            capNhatGiaoDienTheoDuLieuMoi();
            renderGiaoDienChuong();
            if (isAdminView) hienChiTietDonHang(realIndex);
            else xemChiTietDonTaiKhoan(realIndex);
        }

        function adminXacNhanDonHang(realIndex, event) {
            if (event) event.stopPropagation();
            let ord = remoteOrdersList[realIndex];
            if (!ord) return;
            let info = layThongTinTienTrinhDon(ord);
            if (info.isCancelled) {
                alert("⚠️ Đơn hàng này đã bị hủy, không thể duyệt!");
                return;
            }
            ord.adminConfirmed = true;
            ord.confirmedAt = Date.now();
            ord.manualStepIdx = 1;
            let newInfo = layThongTinTienTrinhDon(ord);
            let newStatus = newInfo.currentLabel || newInfo.steps[1] || 'Chờ lấy hàng';
            ord.lastSyncedSheetStatus = newStatus;
            let targetCode = ord.originalOrderCode || ord.orderCode;
            daDongBoTrangThaiSheet[ord.orderCode] = newStatus;
            daDongBoTrangThaiSheet[targetCode] = newStatus;
            guiDuLieuGoogleSheets('updateOrderStatus', { orderCode: targetCode, status: newStatus, phone: ord.phone });
            dongBoBackupDonKhachThat(ord);
            luuDuLieuLenDamMay();
            capNhatGiaoDienTheoDuLieuMoi();
            if (selectedAdminOrderIndex === realIndex) {
                hienChiTietDonHang(realIndex);
            }
            alert(`✅ Đã duyệt đơn ${ord.orderCode} thành công!\nĐơn hàng đã chuyển từ "Chờ xác nhận" sang "${newStatus}" và đồng bộ lên Google Sheets.`);
        }

        function adminDuyetTatCaDonCho() {
            let count = 0;
            remoteOrdersList.forEach((ord) => {
                if (!ord) return;
                let info = layThongTinTienTrinhDon(ord);
                let isConfirmed = kiemTraDonDaDuocDuyet(ord);
                if (!isConfirmed && !info.isCancelled) {
                    ord.adminConfirmed = true;
                    ord.confirmedAt = Date.now();
                    ord.manualStepIdx = 1;
                    let newInfo = layThongTinTienTrinhDon(ord);
                    let newStatus = newInfo.currentLabel || newInfo.steps[1] || 'Chờ lấy hàng';
                    ord.lastSyncedSheetStatus = newStatus;
                    let targetCode = ord.originalOrderCode || ord.orderCode;
                    daDongBoTrangThaiSheet[ord.orderCode] = newStatus;
                    daDongBoTrangThaiSheet[targetCode] = newStatus;
                    guiDuLieuGoogleSheets('updateOrderStatus', { orderCode: targetCode, status: newStatus, phone: ord.phone });
                    dongBoBackupDonKhachThat(ord);
                    count++;
                }
            });
            if (count > 0) {
                luuDuLieuLenDamMay();
                capNhatGiaoDienTheoDuLieuMoi();
                alert(`✅ Đã duyệt toàn bộ ${count} đơn hàng chờ!\nTất cả đã chuyển sang "Chờ lấy hàng" và đồng bộ lên Google Sheets.`);
            } else {
                alert("Hiện không có đơn hàng nào đang chờ duyệt.");
            }
        }

        function locDonChoDuyetNhanh() {
            let input = document.getElementById('adminOrderSearchInput');
            if (input) {
                input.value = 'Chờ xác nhận';
                renderAdminOrdersTableOnly();
            }
        }

        function adminChuyenBuocTiepTheo(realIndex, event) {
            if (event) event.stopPropagation();
            let ord = remoteOrdersList[realIndex];
            if (!ord) return;
            let info = layThongTinTienTrinhDon(ord);
            if (info.isCancelled) return;
            ord.adminConfirmed = true;
            ord.manualStepIdx = Math.min(info.steps.length - 1, (typeof ord.manualStepIdx === 'number' ? ord.manualStepIdx : info.currentIdx) + 1);
            if (ord.manualStepIdx === info.steps.length - 2) ord.deliveredAt = Date.now();
            let newStatus = info.steps[ord.manualStepIdx] || 'Hoàn tất';
            ord.lastSyncedSheetStatus = newStatus;
            let targetCode = ord.originalOrderCode || ord.orderCode;
            daDongBoTrangThaiSheet[ord.orderCode] = newStatus;
            daDongBoTrangThaiSheet[targetCode] = newStatus;
            guiDuLieuGoogleSheets('updateOrderStatus', { orderCode: targetCode, status: newStatus, phone: ord.phone });
            dongBoBackupDonKhachThat(ord);
            luuDuLieuLenDamMay();
            capNhatGiaoDienTheoDuLieuMoi();
            if (selectedAdminOrderIndex === realIndex) {
                hienChiTietDonHang(realIndex);
            }
        }

        function adminHoanTatDonNgay(realIndex, event) {
            if (event) event.stopPropagation();
            let ord = remoteOrdersList[realIndex];
            if (!ord) return;
            let info = layThongTinTienTrinhDon(ord);
            if (info.isCancelled) return;
            ord.adminConfirmed = true;
            ord.manualStepIdx = info.steps.length - 1;
            let targetCode = ord.originalOrderCode || ord.orderCode;
            ord.lastSyncedSheetStatus = 'Hoàn tất';
            daDongBoTrangThaiSheet[ord.orderCode] = 'Hoàn tất';
            daDongBoTrangThaiSheet[targetCode] = 'Hoàn tất';
            guiDuLieuGoogleSheets('updateOrderStatus', { orderCode: targetCode, status: 'Hoàn tất', phone: ord.phone });
            dongBoBackupDonKhachThat(ord);
            luuDuLieuLenDamMay();
            capNhatGiaoDienTheoDuLieuMoi();
            if (selectedAdminOrderIndex === realIndex) {
                hienChiTietDonHang(realIndex);
            }
        }

        // ================= TRANG TÀI KHOẢN KHÁCH HÀNG & TRANG CHUÔNG ADMIN TOÀN MÀN HÌNH =================
        function nhanNutTaiKhoanHeader() {
            if (!currentCustomer.loggedIn) { moModal('loginModal'); return; }
            if (currentCustomer.isAdmin) { chuyenTab('remoteOrder'); return; }
            chuyenTab('account');
        }

        function moTabTaiKhoan(subTab) {
            if (!currentCustomer.loggedIn) { moModal('loginModal'); return; }
            if (!document.getElementById('view-account').classList.contains('active')) {
                document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
                document.querySelectorAll('.sub-nav a').forEach(el => el.classList.remove('active'));
                document.getElementById('view-account').classList.add('active');
            }
            ['orders', 'mcoin', 'tier', 'vouchers', 'addr', 'profile'].forEach(t => {
                let btn = document.getElementById('accNav-' + t);
                let panel = document.getElementById('accPanel-' + t);
                if (btn) btn.classList.toggle('active', t === subTab);
                if (panel) panel.style.display = (t === subTab) ? 'block' : 'none';
            });
            renderTrangTaiKhoan();
            if (subTab === 'orders') {
                dongBoTuGoogleSheets().then(() => renderTrangTaiKhoan());
            }
        }

        function moTabChuongAdmin(subTab) {
            if (!document.getElementById('view-adminNotif').classList.contains('active')) {
                document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
                document.querySelectorAll('.sub-nav a').forEach(el => el.classList.remove('active'));
                document.getElementById('view-adminNotif').classList.add('active');
            }
            ['voucher', 'lowstock'].forEach(t => {
                let btn = document.getElementById('adminNotifNav-' + t);
                let panel = document.getElementById('adminNotifPanel-' + t);
                if (btn) btn.classList.toggle('active', t === subTab);
                if (panel) panel.style.display = (t === subTab) ? 'block' : 'none';
            });
            renderGiaoDienChuong();
        }

        function layThongTinHangThanhVien(phoneToCheck) {
            let phone = phoneToCheck || (currentCustomer && currentCustomer.phone) || '';
            let totalSpent = 0;
            if (phone) {
                remoteOrdersList.forEach(o => {
                    if (o && !o.isCancelled && (o.phone === phone || o.accountPhone === phone)) {
                        totalSpent += (o.finalTotal || o.subtotal || 0);
                    }
                });
            }

            let tierKey = 'member';
            let tierName = 'Hạng Thành Viên';
            let ratePercent = 5;
            let nextName = 'Hạng Đồng';
            let nextRatePercent = 10;
            let nextThreshold = 5000000;

            if (totalSpent >= 20000000) {
                tierKey = 'kimcuong'; tierName = 'Hạng Kim Cương'; ratePercent = 25;
                nextName = null; nextRatePercent = 25; nextThreshold = 20000000;
            } else if (totalSpent >= 15000000) {
                tierKey = 'vang'; tierName = 'Hạng Vàng'; ratePercent = 20;
                nextName = 'Hạng Kim Cương'; nextRatePercent = 25; nextThreshold = 20000000;
            } else if (totalSpent >= 10000000) {
                tierKey = 'bac'; tierName = 'Hạng Bạc'; ratePercent = 15;
                nextName = 'Hạng Vàng'; nextRatePercent = 20; nextThreshold = 15000000;
            } else if (totalSpent >= 5000000) {
                tierKey = 'dong'; tierName = 'Hạng Đồng'; ratePercent = 10;
                nextName = 'Hạng Bạc'; nextRatePercent = 15; nextThreshold = 10000000;
            }

            let remainingToNext = nextName ? Math.max(0, nextThreshold - totalSpent) : 0;
            let progressPercent = nextName ? Math.min(100, Math.round((totalSpent / nextThreshold) * 100)) : 100;

            return {
                totalSpent,
                tierKey,
                tierName,
                ratePercent,
                rateDecimal: ratePercent / 100,
                nextName,
                nextRatePercent,
                nextThreshold,
                remainingToNext,
                progressPercent
            };
        }

        function renderTabHangThanhVien() {
            let tierInfo = layThongTinHangThanhVien(currentCustomer.phone);
            let sideLabel = document.getElementById('accSidebarTierLabel');
            if (sideLabel) sideLabel.innerText = tierInfo.tierName;

            let headEl = document.getElementById('tierHeaderCurrentText');
            if (headEl) headEl.innerText = `${tierInfo.tierName} · Hoàn ${tierInfo.ratePercent}% M-Coin`;

            let spentEl = document.getElementById('tierTotalSpentText');
            if (spentEl) spentEl.innerText = `${tierInfo.totalSpent.toLocaleString('vi-VN')}đ`;

            let barEl = document.getElementById('tierProgressBarFill');
            if (barEl) barEl.style.width = `${tierInfo.progressPercent}%`;

            let nextEl = document.getElementById('tierNextMilestoneText');
            if (nextEl) {
                if (tierInfo.nextName) {
                    nextEl.innerText = `Còn ${tierInfo.remainingToNext.toLocaleString('vi-VN')}đ để lên ${tierInfo.nextName} (Hoàn ${tierInfo.nextRatePercent}% M-Coin mỗi đơn)`;
                } else {
                    nextEl.innerHTML = `<b style="color:#0284c7;">💎 Chúc mừng! Bạn đã đạt Hạng Kim Cương cao nhất — Hoàn 25% M-Coin cho mọi đơn hàng!</b>`;
                }
            }

            let cardDefs = [
                { id: 'tierCard-dong', key: 'dong', title: 'Đồng', sub: '5tr+ · 10% M-Coin', min: 5000000 },
                { id: 'tierCard-bac', key: 'bac', title: 'Bạc', sub: '10tr+ · 15% M-Coin', min: 10000000 },
                { id: 'tierCard-vang', key: 'vang', title: 'Vàng', sub: '15tr+ · 20% M-Coin', min: 15000000 },
                { id: 'tierCard-kimcuong', key: 'kimcuong', title: '💎 Kim Cương', sub: '20tr+ · 25% M-Coin', min: 20000000 }
            ];
            cardDefs.forEach(c => {
                let el = document.getElementById(c.id);
                if (!el) return;
                let isCurrent = tierInfo.tierKey === c.key;
                let isUnlocked = tierInfo.totalSpent >= c.min;
                el.classList.toggle('current-tier', isCurrent);
                let badgeHtml = isCurrent
                    ? `<div class="tier-status-pill" style="background:#111; color:#fff;">★ Đang đạt</div>`
                    : (isUnlocked ? `<div class="tier-status-pill" style="background:rgba(255,255,255,0.75); color:#15803d;">✓ Đã mở khóa</div>` : '');
                el.innerHTML = `
                    <div class="tier-title">${c.title}</div>
                    <div class="tier-sub">${c.sub}</div>
                    ${badgeHtml}
                `;
            });
        }

        function renderTrangTaiKhoan() {
            if (!currentCustomer.loggedIn) return;
            document.getElementById('accSidebarName').innerText = currentCustomer.name || 'Khách hàng';
            document.getElementById('accSidebarMCoin').innerText = (currentCustomer.mcoin || 0).toLocaleString('vi-VN');
            document.getElementById('accSidebarToken').innerText = currentCustomer.tokens || 0;

            renderDanhSachDonTaiKhoan();
            renderTabMCoin();
            renderTabHangThanhVien();
            renderTabVoucherCuaToi();
            renderTabSoDiaChi();
            renderTabQuanLyTaiKhoan();
        }

        function renderDanhSachDonTaiKhoan() {
            let listContainer = document.getElementById('accOrdersListContainer');
            if (!listContainer) return;
            let myOrdersWithIdx = [];
            remoteOrdersList.forEach((o, realIdx) => {
                if (o && (o.phone === currentCustomer.phone || o.accountPhone === currentCustomer.phone)) {
                    myOrdersWithIdx.push({ ord: o, realIdx });
                }
            });
            if (myOrdersWithIdx.length === 0) {
                listContainer.innerHTML = `<p style="color:#777; font-size:13.5px; padding:20px 0;">Bạn chưa có đơn hàng nào.</p>`;
                return;
            }
            listContainer.innerHTML = myOrdersWithIdx.slice().reverse().map(({ ord, realIdx }) => {
                let info = layThongTinTienTrinhDon(ord);
                let code = ord.orderCode || `MVP${12200 + realIdx}`;
                let d = new Date(ord.startTime || Date.now());
                let dateStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
                let totalVal = (ord.finalTotal || ord.subtotal || 0).toLocaleString('vi-VN') + 'đ';
                return `
                    <div class="order-row-card" onclick="xemChiTietDonTaiKhoan(${realIdx})">
                        <div style="font-size:14px; color:#333;"><b>${code}</b> · <span style="color:#666;">${dateStr} · ${ord.itemsCount || 1} SP</span></div>
                        <div style="display:flex; align-items:center; gap:14px;">
                            ${(!info.isCancelled && info.currentIdx === info.steps.length - 2) ? `<button type="button" onclick="event.stopPropagation(); khachXacNhanDaNhanHang(${realIdx});" style="background:#16a34a; color:#fff; border:none; padding:4px 10px; border-radius:6px; font-size:11.5px; font-weight:700; cursor:pointer; font-family:'Poppins',sans-serif;">✅ Đã nhận hàng</button>` : ''}
                            ${(!info.isCancelled && info.currentIdx === info.steps.length - 1) ? `<button type="button" onclick="event.stopPropagation(); xemChiTietDonTaiKhoan(${realIdx}); moModalDanhGiaDonHang(${realIdx});" style="background:#ff5500; color:#fff; border:none; padding:4px 10px; border-radius:6px; font-size:11.5px; font-weight:700; cursor:pointer; font-family:'Poppins',sans-serif;">⭐ Đánh giá SP</button>` : ''}
                            <span class="order-badge-pill ${info.badgeClass}">${info.currentLabel}</span>
                            <span style="font-weight:800; font-size:15px; color:#111; min-width:95px; text-align:right;">${totalVal}</span>
                        </div>
                    </div>`;
            }).join('');

            if (selectedAccountOrderIndex !== null && remoteOrdersList[selectedAccountOrderIndex]) {
                document.getElementById('accOrderDetailView').innerHTML = taoHtmlTimelineChiTietDon(remoteOrdersList[selectedAccountOrderIndex], selectedAccountOrderIndex, false);
            }
        }

        function xemChiTietDonTaiKhoan(realIdx) {
            selectedAccountOrderIndex = realIdx;
            let ord = remoteOrdersList[realIdx];
            if (!ord) return;
            document.getElementById('accOrdersListView').style.display = 'none';
            let detailView = document.getElementById('accOrderDetailView');
            detailView.style.display = 'block';
            detailView.innerHTML = taoHtmlTimelineChiTietDon(ord, realIdx, false);
        }

        function quayLaiDanhSachDonTaiKhoan() {
            selectedAccountOrderIndex = null;
            document.getElementById('accOrderDetailView').style.display = 'none';
            document.getElementById('accOrdersListView').style.display = 'block';
            renderDanhSachDonTaiKhoan();
        }

        function renderTabMCoin() {
            let tierInfo = layThongTinHangThanhVien(currentCustomer.phone);
            let polRateEl = document.getElementById('mcoinPolicyRateText');
            if (polRateEl) polRateEl.innerText = `${tierInfo.ratePercent}% M-Coin (${tierInfo.tierName})`;
            let balEl = document.getElementById('mcoinBalanceBig');
            if (balEl) balEl.innerText = `${(currentCustomer.mcoin || 0).toLocaleString('vi-VN')} M-Coin`;
            let histEl = document.getElementById('mcoinHistoryList');
            if (!histEl) return;
            let myOrders = remoteOrdersList.filter(o => o && (o.phone === currentCustomer.phone || o.accountPhone === currentCustomer.phone));
            if (myOrders.length === 0) {
                histEl.innerHTML = `<p style="color:#777; font-size:13px;">Chưa có giao dịch M-Coin nào. Đặt hàng ngay để được hoàn 5% M-Coin và +1 Token AI!</p>`;
                return;
            }
            histEl.innerHTML = myOrders.slice().reverse().map((o, idx) => {
                let earned = o.earnedMCoin || Math.round((o.finalTotal || o.subtotal || 0) * 0.05);
                let used = o.usedMCoin || 0;
                let code = o.orderCode || `MVP${12200 + idx}`;
                return `<div style="border:1px solid #eee; border-radius:10px; padding:12px 16px; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center; font-size:13px;">
                    <div><b>Đơn hàng ${code}</b><div style="font-size:11.5px; color:#666;">Hoàn ${o.cashbackPercent || 5}% giá trị đơn & Tặng +1 Token AI ${o.isCancelled ? '<span style="color:#dc2626; font-weight:700;">(Đã hủy)</span>' : ''}</div></div>
                    <div style="text-align:right;">
                        <div style="color:#16a34a; font-weight:700;">+${earned.toLocaleString('vi-VN')} M-Coin</div>
                        ${used > 0 ? `<div style="color:#dc2626; font-size:11.5px;">Đã dùng: -${used.toLocaleString('vi-VN')} M-Coin</div>` : ''}
                    </div>
                </div>`;
            }).join('');
        }

        // YÊU CẦU 1: HIỂN THỊ VOUCHER GIẢM GIÁ TRONG TÀI KHOẢN KHÁCH HÀNG ĐỒNG BỘ VỚI CHUÔNG THÔNG BÁO
        function renderTabVoucherCuaToi() {
            let box = document.getElementById('myVouchersListContainer');
            let badgeNav = document.getElementById('accVoucherCountBadge');
            let validCoupons = couponsList.filter(c => c && c.createdAt && (Date.now() - c.createdAt <= COUPON_VALID_DURATION_MS));
            let eligibleCoupons = validCoupons.filter(c => kiemTraKhachCoDuocNhanCoupon(c));

            let unusedCoupons = eligibleCoupons.filter(c => !kiemTraTaiKhoanDaDungCouponChua(c, currentCustomer.phone));
            let visibleCoupons = eligibleCoupons.filter(c => {
                let usedAt = layThoiGianDaDungCoupon(c, currentCustomer.phone);
                if (usedAt === null) return true;
                return (Date.now() - usedAt) <= USED_VOUCHER_KEEP_MS;
            });

            if (badgeNav) {
                badgeNav.style.display = unusedCoupons.length > 0 ? 'inline-block' : 'none';
                badgeNav.innerText = unusedCoupons.length;
            }
            if (!box) return;

            if (visibleCoupons.length === 0) {
                box.innerHTML = `<div style="padding:35px 20px; text-align:center; color:#777; font-size:14px; font-weight:600; background:#fafafa; border:1px dashed #ddd; border-radius:10px;">Kho voucher trống</div>`;
                return;
            }

            box.innerHTML = visibleCoupons.slice().reverse().map(c => {
                let expDate = new Date(c.createdAt + COUPON_VALID_DURATION_MS);
                let expStr = `${String(expDate.getDate()).padStart(2,'0')}/${String(expDate.getMonth()+1).padStart(2,'0')}/${expDate.getFullYear()}`;
                let remainText = tinhThoiGianConLai48h(c.createdAt);
                let targetTag = c.targetType === 'selected' ? ` · Ưu đãi riêng cho SĐT ${currentCustomer.phone}` : ` · Ưu đãi toàn sàn`;
                let usedAt = layThoiGianDaDungCoupon(c, currentCustomer.phone);
                let isUsed = usedAt !== null;
                let vanishText = isUsed ? tinhThoiGianBienMat2Tieng(usedAt) : '';

                return `
                    <div class="my-voucher-card" style="${isUsed ? 'opacity:0.68; background:#f8fafc; border-color:#cbd5e1;' : ''}">
                        <div class="my-voucher-stub" style="${isUsed ? 'background:#94a3b8;' : ''}">${isUsed ? 'Đã dùng' : 'Giảm giá'}</div>
                        <div class="my-voucher-body">
                            <div>
                                <div style="font-weight:800; font-size:16px; color:${isUsed ? '#64748b' : '#111'};">
                                    ${c.code} ${isUsed ? '<span style="font-size:11px; background:#e2e8f0; color:#475569; padding:2px 8px; border-radius:6px; margin-left:6px;">ĐÃ SỬ DỤNG</span>' : ''}
                                </div>
                                <div style="font-size:13.5px; color:${isUsed ? '#64748b' : '#222'}; margin:4px 0;">Voucher khuyến mãi — Giảm <b>${c.percent}%</b> tổng đơn hàng${targetTag}</div>
                                <div style="font-size:11.5px; color:#888;">
                                    ${isUsed ? `⏳ Đã dùng · <b style="color:#d97706;">${vanishText || 'Sắp ẩn'}</b>` : `HSD ${expStr} (${remainText})`}
                                </div>
                            </div>
                            ${isUsed
                                ? `<button type="button" disabled style="background:#cbd5e1; color:#475569; border:none; padding:9px 18px; border-radius:8px; font-size:12.5px; font-weight:700; cursor:not-allowed;">Đã sử dụng</button>`
                                : `<button type="button" onclick="currentPopupPromoCode='${c.code}'; saoChepMaKhuyenMaiPopup();" style="background:#ff5500; color:#fff; border:none; padding:9px 18px; border-radius:8px; font-size:12.5px; font-weight:700; cursor:pointer;">Dùng ngay</button>`
                            }
                        </div>
                    </div>`;
            }).join('');
        }

        function capNhatPhuongXaTheoTinh() {
            let prov = document.getElementById('addrSelectProvince').value;
            let wardSelect = document.getElementById('addrSelectWard');
            if (!wardSelect) return;
            if (!prov || !wardsByProvince[prov]) { wardSelect.innerHTML = `<option value="">— Chọn tỉnh trước —</option>`; return; }
            wardSelect.innerHTML = `<option value="">— Chọn Phường/Xã —</option>` + wardsByProvince[prov].map(w => `<option value="${w}">${w}</option>`).join('');
        }

        function layDanhSachDiaChiCuaAccHienTai() {
            if (!currentCustomer.loggedIn || !currentCustomer.phone) return [];
            let freshMap = JSON.parse(localStorage.getItem('mairua_addressesByPhone')) || addressesByPhone || {};
            if (Array.isArray(freshMap[currentCustomer.phone])) {
                currentCustomer.addresses = freshMap[currentCustomer.phone];
                addressesByPhone[currentCustomer.phone] = freshMap[currentCustomer.phone];
            } else if (!Array.isArray(currentCustomer.addresses)) {
                currentCustomer.addresses = [];
            }
            return currentCustomer.addresses;
        }

        function renderTabSoDiaChi() {
            let box = document.getElementById('savedAddressesContainer');
            if (!box) return;
            let addrs = layDanhSachDiaChiCuaAccHienTai();
            if (addrs.length === 0) {
                box.innerHTML = `<div style="padding:22px; text-align:center; color:#777; font-size:13px; background:#fafafa; border:1px dashed #ddd; border-radius:10px; margin-bottom:14px;">Sổ địa chỉ của bạn đang trống. Hãy thêm địa chỉ nhận hàng bên dưới nhé!</div>`;
                return;
            }
            box.innerHTML = addrs.map((a, idx) => `
                <div class="saved-addr-card">
                    <div>
                        <div style="font-size:14px; color:#111;"><b>${a.name}</b> · <span style="color:#555;">${a.phone}</span></div>
                        <div style="font-size:13px; color:#444; margin-top:3px;">${a.fullAddress}</div>
                    </div>
                    <div style="display:flex; align-items:center; gap:12px;">
                        ${a.isDefault ? `<span class="addr-default-tag">MẶC ĐỊNH</span>` : `<span onclick="datDiaChiMacDinh(${idx})" style="color:#ff5500; font-size:12.5px; font-weight:700; cursor:pointer;">Đặt mặc định</span>`}
                        <span onclick="xoaDiaChiDaLuu(${idx})" style="color:#999; font-size:12px; cursor:pointer;">Xóa</span>
                    </div>
                </div>
            `).join('');
        }

        function luuDiaChiMoi() {
            if (!currentCustomer.loggedIn) { moModal('loginModal'); return; }
            let name = document.getElementById('addrInputName').value.trim();
            let phone = document.getElementById('addrInputPhone').value.trim();
            let prov = document.getElementById('addrSelectProvince').value;
            let ward = document.getElementById('addrSelectWard').value;
            let street = document.getElementById('addrInputStreet').value.trim();
            if (!name || !phone || !prov || !ward || !street) {
                alert("⚠️ Vui lòng điền đầy đủ Họ tên, Số điện thoại, Tỉnh/TP, Phường/Xã và Số nhà tên đường!");
                return;
            }
            let addrs = layDanhSachDiaChiCuaAccHienTai();
            let isFirst = addrs.length === 0;
            currentCustomer.addresses.push({ name, phone, fullAddress: `${street}, ${ward}, ${prov}`, isDefault: isFirst });
            dongBoTaiKhoanHienTaiVaoDB();
            document.getElementById('addrInputStreet').value = '';
            renderTabSoDiaChi();
            renderTabQuanLyTaiKhoan();
            renderDanhSachDiaChiTrongGioHang();
            alert("✅ Đã lưu địa chỉ mới vào Sổ địa chỉ!");
        }

        function datDiaChiMacDinh(idx) {
            layDanhSachDiaChiCuaAccHienTai();
            if (!Array.isArray(currentCustomer.addresses)) return;
            currentCustomer.addresses.forEach((a, i) => a.isDefault = (i === idx));
            selectedCheckoutAddrIdx = idx;
            dongBoTaiKhoanHienTaiVaoDB();
            renderTabSoDiaChi();
            renderTabQuanLyTaiKhoan();
            renderDanhSachDiaChiTrongGioHang();
        }

        function xoaDiaChiDaLuu(idx) {
            layDanhSachDiaChiCuaAccHienTai();
            if (!Array.isArray(currentCustomer.addresses)) return;
            currentCustomer.addresses.splice(idx, 1);
            if (currentCustomer.addresses.length > 0 && !currentCustomer.addresses.some(a => a.isDefault)) currentCustomer.addresses[0].isDefault = true;
            selectedCheckoutAddrIdx = 0;
            dongBoTaiKhoanHienTaiVaoDB();
            renderTabSoDiaChi();
            renderTabQuanLyTaiKhoan();
            renderDanhSachDiaChiTrongGioHang();
        }

        function renderTabQuanLyTaiKhoan() {
            if (!currentCustomer.loggedIn) return;
            let phEl = document.getElementById('profileInputPhone');
            let nmEl = document.getElementById('profileInputName');
            let emEl = document.getElementById('profileInputEmail');
            let badgeEl = document.getElementById('profileEmailStatusBadge');
            if (phEl) phEl.value = currentCustomer.phone || '';
            if (nmEl && document.activeElement !== nmEl) nmEl.value = currentCustomer.name || '';
            let curEmail = (currentCustomer.email || '').trim();
            if (emEl && document.activeElement !== emEl) emEl.value = curEmail;
            if (badgeEl) {
                if (curEmail) {
                    badgeEl.innerText = `✅ Đã liên kết: ${curEmail}`;
                    badgeEl.style.background = '#dcfce7';
                    badgeEl.style.color = '#15803d';
                } else {
                    badgeEl.innerText = 'Chưa liên kết';
                    badgeEl.style.background = '#fef3c7';
                    badgeEl.style.color = '#b45309';
                }
            }
        }

        function capNhatTenTaiKhoanKhach() {
            if (!currentCustomer.loggedIn) return;
            let newName = (document.getElementById('profileInputName').value || '').trim();
            if (!newName || newName.length < 2) {
                alert('⚠️ Vui lòng nhập Tên tài khoản hợp lệ (tối thiểu 2 ký tự)!');
                return;
            }
            currentCustomer.name = newName;
            dongBoTaiKhoanHienTaiVaoDB();
            document.getElementById('accSidebarName').innerText = newName;
            capNhatHeaderTaiKhoan();
            alert(`✅ Đã đổi tên tài khoản thành "${newName}"!`);
        }

        function lienKetEmailTaiKhoanKhach() {
            if (!currentCustomer.loggedIn) return;
            let emailVal = (document.getElementById('profileInputEmail').value || '').trim();
            if (!emailVal || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
                alert('⚠️ Vui lòng nhập địa chỉ Email hợp lệ (VD: tenban@gmail.com)!');
                return;
            }
            currentCustomer.email = emailVal;
            dongBoTaiKhoanHienTaiVaoDB();
            renderTabQuanLyTaiKhoan();
            alert(`🔗 Đã liên kết thành công Email "${emailVal}" với tài khoản ${currentCustomer.phone}!`);
        }

        function doiMatKhauTaiKhoanKhach() {
            if (!currentCustomer.loggedIn) return;
            let oldPass = (document.getElementById('profileOldPass').value || '').trim();
            let newPass = (document.getElementById('profileNewPass').value || '').trim();
            let confirmPass = (document.getElementById('profileConfirmPass').value || '').trim();
            let dbAcc = accountsDB.find(a => a.phone === currentCustomer.phone);
            let actualPass = currentCustomer.pass || (dbAcc ? dbAcc.pass : '');

            if (!oldPass) {
                alert('⚠️ Vui lòng nhập mật khẩu hiện tại!');
                return;
            }
            if (oldPass !== actualPass) {
                alert('❌ Mật khẩu hiện tại không chính xác!');
                return;
            }
            if (!newPass || newPass.length < 3) {
                alert('⚠️ Mật khẩu mới phải có ít nhất 3 ký tự!');
                return;
            }
            if (newPass !== confirmPass) {
                alert('❌ Mật khẩu xác nhận không khớp với mật khẩu mới!');
                return;
            }
            currentCustomer.pass = newPass;
            dongBoTaiKhoanHienTaiVaoDB();
            document.getElementById('profileOldPass').value = '';
            document.getElementById('profileNewPass').value = '';
            document.getElementById('profileConfirmPass').value = '';
            alert('🔑 Đổi mật khẩu thành công! Vui lòng sử dụng mật khẩu mới cho lần đăng nhập tiếp theo.');
        }

        function dongBoTaiKhoanHienTaiVaoDB() {
            if (currentCustomer && currentCustomer.phone) {
                addressesByPhone[currentCustomer.phone] = Array.isArray(currentCustomer.addresses) ? currentCustomer.addresses : [];
                profileByPhone[currentCustomer.phone] = {
                    name: currentCustomer.name,
                    pass: currentCustomer.pass,
                    email: currentCustomer.email || ''
                };
                localStorage.setItem('mairua_profileByPhone', JSON.stringify(profileByPhone));
                localStorage.setItem('mairua_addressesByPhone', JSON.stringify(addressesByPhone));
            }
            sessionStorage.setItem('mairua_currentCustomer', JSON.stringify(currentCustomer));
            if (!currentCustomer.isAdmin) {
                localStorage.setItem('mairua_currentCustomer', JSON.stringify(currentCustomer));
            }
            let accIdx = accountsDB.findIndex(a => a.phone === currentCustomer.phone);
            if (accIdx !== -1) {
                accountsDB[accIdx] = { ...currentCustomer };
            } else if (currentCustomer.loggedIn && currentCustomer.phone) {
                accountsDB.push({ ...currentCustomer });
            }
            localStorage.setItem('mairua_accountsDB', JSON.stringify(accountsDB));
            luuDuLieuLenDamMay();
            if (currentCustomer.loggedIn && currentCustomer.phone && !currentCustomer.isAdmin) {
                guiDuLieuGoogleSheets('updateAccount', {
                    phone: currentCustomer.phone,
                    name: currentCustomer.name,
                    pass: currentCustomer.pass,
                    mcoin: currentCustomer.mcoin,
                    orders: currentCustomer.orders,
                    addresses: currentCustomer.addresses
                });
            }
        }

        function renderDanhSachDiaChiTrongGioHang() {
            let box = document.getElementById('cartSavedAddressListBox');
            if (!box) return;
            if (!currentCustomer.loggedIn) {
                box.innerHTML = `<div style="padding:12px; background:#fff8f5; border:1px dashed #ff5500; border-radius:8px; font-size:12px; color:#c2410c;">Vui lòng <b style="cursor:pointer; text-decoration:underline;" onclick="moModal('loginModal')">Đăng nhập</b> và thêm địa chỉ trong Sổ địa chỉ để đặt hàng.</div>`;
                return;
            }
            let addrs = layDanhSachDiaChiCuaAccHienTai();
            if (addrs.length === 0) {
                box.innerHTML = `<div style="padding:12px; background:#fff8f5; border:1px dashed #ff5500; border-radius:8px; font-size:12px; color:#444;">Bạn chưa có địa chỉ nào trong Sổ địa chỉ.<br><button type="button" onclick="moTabTaiKhoan('addr')" style="margin-top:6px; background:#111; color:#fff; border:none; padding:6px 12px; border-radius:6px; font-size:11.5px; font-weight:600; cursor:pointer;">+ Thêm địa chỉ nhận hàng ngay</button></div>`;
                return;
            }
            let defIdx = addrs.findIndex(a => a.isDefault);
            if (selectedCheckoutAddrIdx >= addrs.length) selectedCheckoutAddrIdx = defIdx !== -1 ? defIdx : 0;
            box.innerHTML = addrs.map((a, idx) => `
                <div class="checkout-addr-item ${idx === selectedCheckoutAddrIdx ? 'selected' : ''}" onclick="chonDiaChiThanhToan(${idx})">
                    <input type="radio" name="checkoutAddrRadio" ${idx === selectedCheckoutAddrIdx ? 'checked' : ''} style="margin-top:3px; accent-color:#ff5500;">
                    <div style="flex:1;">
                        <div><b>${a.name}</b> · ${a.phone} ${a.isDefault ? '<span style="color:#16a34a; font-weight:700; font-size:10.5px;">[Mặc định]</span>' : ''}</div>
                        <div style="color:#555; font-size:12px;">${a.fullAddress}</div>
                    </div>
                </div>
            `).join('');
        }

        function chonDiaChiThanhToan(idx) { selectedCheckoutAddrIdx = idx; renderDanhSachDiaChiTrongGioHang(); }

        function hienPopupDonAoFomo(customerName, phone, addr, productName, colorName, imgSrc, qty) {
            let popup = document.getElementById('fomoOrderPopup');
            let imgEl = document.getElementById('fomoPopupImg');
            let textEl = document.getElementById('fomoPopupText');
            if (!popup || !imgEl || !textEl) return;
            imgEl.src = imgSrc;
            textEl.innerHTML = `
                <div style="color:#ffcc00; font-weight:700; font-size:11px; margin-bottom:2px;">🔥 ĐƠN HÀNG MỚI VỪA ĐẶT (ĐÃ TRỪ KHO)</div>
                <div>Khách hàng: <b>${customerName}</b></div>
                <div style="font-size:11.5px; color:#ddd;">📞 SĐT: <b>${phone}</b> — ${addr}</div>
                <div style="color:#00ffcc; font-weight:600; margin-top:2px;">🛒 Đã đặt: ${productName} (${colorName}) x${qty}</div>
            `;
            popup.classList.add('show');
            if (fomoPopupTimeout) clearTimeout(fomoPopupTimeout);
            fomoPopupTimeout = setTimeout(() => popup.classList.remove('show'), 6000);
        }

        function dongPopupDonAo() {
            let popup = document.getElementById('fomoOrderPopup');
            if (popup) popup.classList.remove('show');
        }

        function batTatCheDoDonAo() {
            autoFakeOrderEnabled = !autoFakeOrderEnabled;
            let btn = document.getElementById('btnToggleAutoFakeOrder');
            if (btn) {
                btn.style.background = autoFakeOrderEnabled ? '#27ae60' : '#7f8c8d';
                btn.innerText = autoFakeOrderEnabled ? '🟢 Tự động đơn mới: ĐANG BẬT (~1.5 - 2 phút/đơn)' : '🔴 Tự động đơn mới: ĐANG TẮT';
            }
        }

        function chonKhachHangTrongKho500() {
            let recentPhones = remoteOrdersList.slice(-15).map(o => o ? o.phone : '');
            let eligible = pool500Customers.filter(c => !recentPhones.includes(c.phone));
            if (eligible.length === 0) eligible = pool500Customers;
            return eligible[Math.floor(Math.random() * eligible.length)];
        }

        // YÊU CẦU 5: KHI TẠO ĐƠN ẢO TỰ ĐỘNG VẪN TRỪ TRỰC TIẾP VÀO TỒN KHO VÀ LƯU CỐ ĐỊNH
        function taoMotDonHangAoTuDong(isManualClick = false) {
            if (!autoFakeOrderEnabled && !isManualClick) return;
            let availableChoices = [];
            products.forEach(p => {
                p.variants.forEach((v, vIdx) => {
                    if (v.stock > 0) availableChoices.push({ prod: p, variant: v, vIdx });
                });
            });
            if (availableChoices.length === 0) return;

            let pick = availableChoices[Math.floor(Math.random() * availableChoices.length)];
            let buyQty = Math.min(pick.variant.stock, Math.random() < 0.75 ? 1 : 2);
            let chosenCust = chonKhachHangTrongKho500();

            // Trừ tồn kho thực tế và lưu lại
            pick.variant.stock = Math.max(0, pick.variant.stock - buyQty);
            pick.variant.sold = (pick.variant.sold || 0) + buyQty;
            capNhatTongStockVaSoldSanPham();
            localStorage.setItem('mairua_products', JSON.stringify(products));

            let sizeTag = pick.prod.hasSize && pick.prod.sizes ? ` [Size: ${pick.prod.sizes[Math.floor(Math.random() * pick.prod.sizes.length)]}]` : '';
            let calc = tinhGiaVaThanhTien(pick.prod.name, pick.prod.price, buyQty);
            let itemLine = `• ${pick.prod.name} (${pick.variant.colorName})${sizeTag} (x${buyQty}) - ${calc.totalPrice.toLocaleString('vi-VN')}đ`;

            let newAutoOrder = {
                orderCode: taoMaDonHangMoi(),
                name: chosenCust.name,
                phone: chosenCust.phone,
                addr: chosenCust.addr,
                itemsCount: buyQty,
                itemsList: [itemLine],
                deductedVariants: [{ prodId: pick.prod.id, vIdx: pick.vIdx, qty: buyQty }],
                hasCustomJersey: !!pick.prod.isJerseyBlank,
                jerseyCount: pick.prod.isJerseyBlank ? buyQty : 0,
                subtotal: calc.totalPrice,
                discountAmt: 0,
                finalTotal: calc.totalPrice,
                earnedMCoin: Math.round(calc.totalPrice * 0.05),
                couponUsed: null,
                isRealCustomerOrder: false,
                adminConfirmed: true,
                startTime: Date.now()
            };

            remoteOrdersList.push(newAutoOrder);
            luuDuLieuLenDamMay();
            capNhatGiaoDienTheoDuLieuMoi();
            renderGiaoDienChuong();
            hienPopupDonAoFomo(chosenCust.name, chosenCust.phone, chosenCust.addr, pick.prod.name, pick.variant.colorName, pick.variant.img, buyQty);
        }

        setInterval(() => { if (autoFakeOrderEnabled) taoMotDonHangAoTuDong(false); }, AUTO_ORDER_INTERVAL_MS);

        function kiemTraVaHienPopupKhuyenMaiMoiChoKhach() {
            if (currentCustomer.isAdmin) return;
            let allValidCoupons = couponsList.filter(c => c && c.createdAt && (Date.now() - c.createdAt <= COUPON_VALID_DURATION_MS));
            let myEligibleCoupons = allValidCoupons.filter(c => kiemTraKhachCoDuocNhanCoupon(c) && !kiemTraTaiKhoanDaDungCouponChua(c, currentCustomer.phone));
            if (myEligibleCoupons.length === 0) return;

            let latestCoupon = myEligibleCoupons.slice().sort((a, b) => b.createdAt - a.createdAt)[0];
            let seenKey = `mairua_seen_promo_${currentCustomer.phone || 'guest'}_${latestCoupon.code}_${latestCoupon.createdAt}`;
            if (!sessionStorage.getItem(seenKey)) {
                sessionStorage.setItem(seenKey, 'true');
                hienPopupKhuyenMaiKhach(latestCoupon);
            }
        }

        function hienPopupKhuyenMaiKhach(coupon) {
            if (!coupon || currentCustomer.isAdmin) return;
            currentPopupPromoCode = coupon.code;
            let popup = document.getElementById('promoGiftPopup');
            let badgeType = document.getElementById('promoPopupBadgeType');
            let descEl = document.getElementById('promoPopupDesc');
            let codeEl = document.getElementById('promoPopupCodeText');
            let bellBtn = document.getElementById('bellHeaderBtn');

            if (badgeType) badgeType.innerText = coupon.targetType === 'selected' ? '🌟 ƯU ĐÃI ĐẶC QUYỀN RIÊNG CHO SĐT CỦA BẠN' : '🎉 THÔNG BÁO KHUYẾN MÃI TOÀN SÀN';
            if (descEl) descEl.innerHTML = `Quý khách hàng đã nhận được mã giảm <b style="color:#e74c3c; font-size:14px;">${coupon.percent}%</b> (Đã lưu vào <b>Voucher của tôi</b>):`;
            if (codeEl) codeEl.innerText = coupon.code;
            if (popup) popup.classList.add('show');
            if (bellBtn) {
                bellBtn.classList.add('ringing');
                setTimeout(() => bellBtn.classList.remove('ringing'), 5000);
            }
        }

        function dongPopupKhuyenMai() {
            let popup = document.getElementById('promoGiftPopup');
            if (popup) popup.classList.remove('show');
        }

        function saoChepMaKhuyenMaiPopup() {
            if (!currentPopupPromoCode) return;
            if (navigator.clipboard) navigator.clipboard.writeText(currentPopupPromoCode).catch(() => {});
            let inputCoupon = document.getElementById('couponInputCode');
            if (inputCoupon) inputCoupon.value = currentPopupPromoCode;
            dongPopupKhuyenMai();
            document.getElementById('notifDropdown').classList.remove('active');
            moGioHang();
            if (currentCustomer.loggedIn) apDungCoupon();
        }

        function laySoLuongTrongGioTheoVariant(productId, variantIndex) {
            return cart.filter(item => item.productId === productId && (item.variantIndex ?? 0) === variantIndex).reduce((sum, item) => sum + item.qty, 0);
        }

        function timSanPhamVaVariantTuCartItem(cartItem) {
            if (!cartItem) return { prod: null, variant: null, vIdx: 0 };
            let prod = cartItem.productId ? products.find(p => p.id === Number(cartItem.productId)) : null;
            if (!prod && (cartItem.isCustomJersey || cartItem.isRoster)) prod = products.find(p => p.id === 22);
            if (!prod && cartItem.name) prod = products.find(p => !p.isJerseyBlank && cartItem.name.toLowerCase().includes(p.name.toLowerCase()));
            if (!prod) return { prod: null, variant: null, vIdx: 0 };
            let vIdx = (typeof cartItem.variantIndex === 'number' && prod.variants[cartItem.variantIndex]) ? cartItem.variantIndex : -1;
            if (vIdx === -1 && cartItem.subInfo) {
                let subLower = cartItem.subInfo.toLowerCase();
                vIdx = prod.variants.findIndex(v => subLower.includes(v.colorName.toLowerCase()));
            }
            if (vIdx === -1) vIdx = 0;
            return { prod, variant: prod.variants[vIdx], vIdx };
        }
        function _oldTimSanPhamUnused(cartItem) {
            let prod = cartItem.productId ? products.find(p => p.id === cartItem.productId) : products.find(p => cartItem.name.includes(p.name));
            if (!prod) return { prod: null, variant: null, vIdx: 0 };
            let vIdx = typeof cartItem.variantIndex === 'number' && prod.variants[cartItem.variantIndex] ? cartItem.variantIndex : 0;
            return { prod, variant: prod.variants[vIdx], vIdx };
        }

        function layThoiGianDaDungCoupon(coupon, phoneToCheck) {
            if (!coupon || !phoneToCheck) return null;
            let codeKey = (coupon.code || '').toUpperCase();
            let freshMap = JSON.parse(localStorage.getItem('mairua_usedCouponsMap')) || usedCouponsMap || {};
            if (freshMap[phoneToCheck] && typeof freshMap[phoneToCheck][codeKey] === 'number') {
                return freshMap[phoneToCheck][codeKey];
            }
            if (coupon.usedAtByPhone && typeof coupon.usedAtByPhone[phoneToCheck] === 'number') {
                return coupon.usedAtByPhone[phoneToCheck];
            }
            for (let i = remoteOrdersList.length - 1; i >= 0; i--) {
                let o = remoteOrdersList[i];
                if (o && (o.accountPhone === phoneToCheck || o.phone === phoneToCheck) && (o.couponUsed || '').toUpperCase() === codeKey) {
                    return o.startTime || coupon.createdAt || Date.now();
                }
            }
            if (Array.isArray(coupon.usedByPhones) && coupon.usedByPhones.includes(phoneToCheck)) {
                return coupon.createdAt || Date.now();
            }
            return null;
        }

        function danhDauDaDungCoupon(coupon, phoneToMark) {
            if (!coupon || !phoneToMark) return;
            let nowTs = Date.now();
            let codeKey = (coupon.code || '').toUpperCase();
            if (!Array.isArray(coupon.usedByPhones)) coupon.usedByPhones = [];
            if (!coupon.usedByPhones.includes(phoneToMark)) coupon.usedByPhones.push(phoneToMark);
            if (!coupon.usedAtByPhone || typeof coupon.usedAtByPhone !== 'object') coupon.usedAtByPhone = {};
            coupon.usedAtByPhone[phoneToMark] = nowTs;

            usedCouponsMap = JSON.parse(localStorage.getItem('mairua_usedCouponsMap')) || usedCouponsMap || {};
            if (!usedCouponsMap[phoneToMark]) usedCouponsMap[phoneToMark] = {};
            usedCouponsMap[phoneToMark][codeKey] = nowTs;
            localStorage.setItem('mairua_usedCouponsMap', JSON.stringify(usedCouponsMap));
            localStorage.setItem('mairua_couponsList', JSON.stringify(couponsList));
        }

        function kiemTraTaiKhoanDaDungCouponChua(coupon, phoneToCheck) {
            return layThoiGianDaDungCoupon(coupon, phoneToCheck) !== null;
        }

        function tinhThoiGianBienMat2Tieng(usedAt) {
            let remain = USED_VOUCHER_KEEP_MS - (Date.now() - usedAt);
            if (remain <= 0) return null;
            let hours = Math.floor(remain / (1000 * 60 * 60));
            let mins = Math.ceil((remain % (1000 * 60 * 60)) / (1000 * 60));
            if (hours > 0) return `Tự ẩn sau ${hours}h ${mins}p`;
            return `Tự ẩn sau ${mins} phút`;
        }

        function layDanhSachKhachDaMua() {
            let mapKhach = new Map();
            accountsDB.forEach(acc => {
                if (!acc.isAdmin && acc.orders > 0 && acc.phone) mapKhach.set(acc.phone, { phone: acc.phone, name: acc.name || "Khách hàng" });
            });
            remoteOrdersList.forEach(ord => {
                if (ord && ord.phone && ord.phone !== "0909501753") mapKhach.set(ord.phone, { phone: ord.phone, name: ord.name });
            });
            return Array.from(mapKhach.values());
        }

        function chuyenCheDoGuiCoupon(mode) {
            let listBox = document.getElementById('targetCustomerListBox');
            if (!listBox) return;
            if (mode === 'select') { listBox.style.display = 'block'; renderDanhSachKhachDeChon(); }
            else listBox.style.display = 'none';
        }

        function renderDanhSachKhachDeChon() {
            let listBox = document.getElementById('targetCustomerListBox');
            if (!listBox) return;
            let checkedPhones = Array.from(document.querySelectorAll('.chk-target-phone:checked')).map(el => el.value);
            let buyers = layDanhSachKhachDaMua();
            if (buyers.length === 0) {
                listBox.innerHTML = `<p style="font-size:12px; color:#888; text-align:center; padding: 6px 0;">Chưa có khách hàng nào từng đặt mua hàng.</p>`;
                return;
            }
            listBox.innerHTML = buyers.map(b => {
                let isChecked = checkedPhones.includes(b.phone) ? 'checked' : '';
                return `<label class="target-customer-item"><input type="checkbox" class="chk-target-phone" value="${b.phone}" ${isChecked}><span><b>${b.phone}</b> - ${b.name}</span></label>`;
            }).join('');
        }

        function kiemTraKhachCoDuocNhanCoupon(coupon) {
            if (!coupon) return false;
            if (!coupon.targetType || coupon.targetType === 'all') return true;
            if (coupon.targetType === 'selected' && Array.isArray(coupon.targetPhones)) {
                if (!currentCustomer.loggedIn || !currentCustomer.phone) return false;
                return coupon.targetPhones.includes(currentCustomer.phone);
            }
            return true;
        }

        // YÊU CẦU 4: KHI ADMIN BẤM CHUÔNG -> MỞ TRANG TOÀN MÀN HÌNH (2 MỤC: VOUCHER & THÔNG BÁO HÀNG TỒN)
        function batTatChuongThongBao(e) {
            e.stopPropagation();
            let bellBtn = document.getElementById('bellHeaderBtn');
            if (bellBtn) bellBtn.classList.remove('ringing');

            if (currentCustomer.isAdmin) {
                let lowStockList = layDanhSachHangTonThap();
                // Nếu có hàng tồn <= 5 thì mở tab Thông báo hàng tồn hoặc mặc định mở trang chuông Admin
                moTabChuongAdmin(lowStockList.length > 0 ? 'lowstock' : 'voucher');
                return;
            }

            let dropdown = document.getElementById('notifDropdown');
            dropdown.classList.toggle('active');
            if (dropdown.classList.contains('active')) {
                renderGiaoDienChuong();
            }
        }

        document.addEventListener('click', () => {
            let dropdown = document.getElementById('notifDropdown');
            if (dropdown) dropdown.classList.remove('active');
        });

        function tinhThoiGianConLai48h(createdAt) {
            let remain = COUPON_VALID_DURATION_MS - (Date.now() - createdAt);
            if (remain <= 0) return null;
            let hours = Math.floor(remain / (1000 * 60 * 60));
            let mins = Math.floor((remain % (1000 * 60 * 60)) / (1000 * 60));
            return `Còn ${hours}h ${mins}p`;
        }

        function nhapNhanhTuThongBaoTon(prodId, vIdx) {
            let qtyInput = document.getElementById(`quick-restock-${prodId}-${vIdx}`);
            let addQty = parseInt(qtyInput ? qtyInput.value : 10) || 10;
            let prod = products.find(p => p.id === prodId);
            if (!prod || !prod.variants[vIdx] || addQty <= 0) return;

            prod.variants[vIdx].stock += addQty;
            capNhatTongStockVaSoldSanPham();
            localStorage.setItem('mairua_products', JSON.stringify(products));
            luuDuLieuLenDamMay();
            renderGiaoDienChuong();
            renderAdminDashboard();
            alert(`✅ Đã nhập thêm +${addQty} cái cho "${prod.name} (${prod.variants[vIdx].colorName})"! Tồn kho mới: ${prod.variants[vIdx].stock} cái.`);
        }

        function renderGiaoDienChuong() {
            let badgeCount = document.getElementById('bellBadgeCount');
            let allValidCoupons = couponsList.filter(c => c && c.createdAt && (Date.now() - c.createdAt <= COUPON_VALID_DURATION_MS));

            if (currentCustomer.isAdmin) {
                let lowStockItems = layDanhSachHangTonThap();
                let lowBadgeNav = document.getElementById('adminLowStockNavBadge');
                if (lowBadgeNav) lowBadgeNav.innerText = lowStockItems.length;

                // Trên nút chuông Admin hiện tổng số mặt hàng sắp hết (<= 5 cái)
                if (lowStockItems.length > 0) {
                    badgeCount.style.display = 'inline-block';
                    badgeCount.innerText = lowStockItems.length;
                } else {
                    badgeCount.style.display = 'none';
                }

                // Render lịch sử Voucher bên trang Admin
                let historyEl = document.getElementById('adminCouponHistoryList');
                if (historyEl) {
                    if (couponsList.length === 0) {
                        historyEl.innerHTML = `<div style="padding:30px; text-align:center; color:#888; background:#fafafa; border:1px dashed #ddd; border-radius:10px;">Chưa có mã giảm giá nào được phát hành.</div>`;
                    } else {
                        historyEl.innerHTML = couponsList.slice().reverse().map(c => {
                            let remainText = tinhThoiGianConLai48h(c.createdAt);
                            let statusHtml = remainText ? `<span class="order-badge-pill badge-green">🟢 ${remainText}</span>` : `<span class="order-badge-pill badge-red">🔴 Đã hết hạn</span>`;
                            let targetDesc = (!c.targetType || c.targetType === 'all') ? `👥 Gửi: Tất cả khách hàng` : `🎯 Gửi riêng SĐT: ${(c.targetPhones || []).join(', ')}`;
                            let usedCount = Array.isArray(c.usedByPhones) ? c.usedByPhones.length : 0;
                            return `
                                <div class="my-voucher-card">
                                    <div class="my-voucher-stub">Giảm ${c.percent}%</div>
                                    <div class="my-voucher-body">
                                        <div>
                                            <div style="font-weight:800; font-size:16px; color:#111;">Mã: ${c.code} (Giảm ${c.percent}%)</div>
                                            <div style="font-size:13px; color:#444; margin:4px 0;">${targetDesc} · Đã sử dụng: <b>${usedCount}</b> tài khoản</div>
                                        </div>
                                        <div>${statusHtml}</div>
                                    </div>
                                </div>`;
                        }).join('');
                    }
                }

                // Render danh sách Cảnh báo hàng tồn <= 5 cái
                let lowStockBox = document.getElementById('adminLowStockAlertContainer');
                if (lowStockBox) {
                    if (lowStockItems.length === 0) {
                        lowStockBox.innerHTML = `<div style="padding:35px; text-align:center; color:#15803d; font-weight:700; background:#f0fdf4; border:1px solid #bbf7d0; border-radius:12px;">✅ Tuyệt vời! Hiện không có sản phẩm hay màu sắc nào có tồn kho từ 5 trở xuống.</div>`;
                    } else {
                        lowStockBox.innerHTML = lowStockItems.map(item => `
                            <div style="border:1.5px solid ${item.stock === 0 ? '#dc2626' : '#f59e0b'}; background:${item.stock === 0 ? '#fef2f2' : '#fffbeb'}; border-radius:12px; padding:16px 20px; margin-bottom:12px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:14px;">
                                <div>
                                    <div style="display:flex; align-items:center; gap:8px;">
                                        <span class="order-badge-pill ${item.stock === 0 ? 'badge-red' : 'badge-orange'}">${item.stock === 0 ? 'HẾT HÀNG (0 CÁI)' : `SẮP HẾT (CÒN ${item.stock} CÁI)`}</span>
                                        <b style="font-size:15px; color:#111;">${item.prodName}</b>
                                    </div>
                                    <div style="font-size:13px; color:#444; margin-top:6px; display:flex; align-items:center; gap:6px;">
                                        <span>Phân loại màu:</span>
                                        <span style="display:inline-block;width:13px;height:13px;border-radius:50%;background:${item.hex};border:1px solid #666;"></span>
                                        <b>${item.colorName}</b> · <span>Đã bán: <b>${item.sold}</b> cái</span>
                                    </div>
                                </div>
                                <div style="display:flex; align-items:center; gap:8px;">
                                    <input type="number" id="quick-restock-${item.prodId}-${item.vIdx}" min="1" value="15" style="width:75px; padding:8px; border:1px solid #ccc; border-radius:6px; font-weight:700; text-align:center;">
                                    <button type="button" onclick="nhapNhanhTuThongBaoTon(${item.prodId}, ${item.vIdx})" style="background:#16a34a; color:#fff; border:none; padding:9px 16px; border-radius:8px; font-weight:700; font-size:12.5px; cursor:pointer;">+ Nhập thêm ngay</button>
                                </div>
                            </div>
                        `).join('');
                    }
                }
            } else {
                let myValidCoupons = allValidCoupons.filter(c => kiemTraKhachCoDuocNhanCoupon(c));
                let unusedValidCoupons = myValidCoupons.filter(c => !kiemTraTaiKhoanDaDungCouponChua(c, currentCustomer.phone));
                let visibleBellCoupons = myValidCoupons.filter(c => {
                    let usedAt = layThoiGianDaDungCoupon(c, currentCustomer.phone);
                    if (usedAt === null) return true;
                    return (Date.now() - usedAt) <= USED_VOUCHER_KEEP_MS;
                });
                badgeCount.style.display = unusedValidCoupons.length > 0 ? 'inline-block' : 'none';
                badgeCount.innerText = unusedValidCoupons.length;

                let custListEl = document.getElementById('customerNotifList');
                if (custListEl) {
                    if (visibleBellCoupons.length === 0) {
                        custListEl.innerHTML = `<p style="font-size:12.5px; color:#888; text-align:center; padding: 18px 0;">Kho voucher trống.</p>`;
                    } else {
                        custListEl.innerHTML = visibleBellCoupons.slice().reverse().map(c => {
                            let remainText = tinhThoiGianConLai48h(c.createdAt);
                            let usedAt = layThoiGianDaDungCoupon(c, currentCustomer.phone);
                            let isUsed = usedAt !== null;
                            let vanishText = isUsed ? tinhThoiGianBienMat2Tieng(usedAt) : '';
                            return `<div class="notif-item" style="${isUsed ? 'background:#f8fafc; border-left-color:#94a3b8; opacity:0.75;' : ''}">
                                <div>🎉 <b>${c.code}</b> — Giảm <b style="color:${isUsed ? '#64748b' : '#e74c3c'};">${c.percent}%</b> đơn hàng ${isUsed ? '<span style="font-size:10.5px; background:#e2e8f0; color:#475569; padding:1px 6px; border-radius:4px; font-weight:700;">Đã sử dụng</span>' : ''}</div>
                                <div class="notif-time">${isUsed ? `✅ Đã dùng · <span style="color:#d97706;">${vanishText || 'Sắp ẩn'}</span>` : `⏳ ${remainText} · <span style="color:#ff5500; cursor:pointer; text-decoration:underline;" onclick="currentPopupPromoCode='${c.code}'; saoChepMaKhuyenMaiPopup();">Dùng ngay</span>`}</div>
                            </div>`;
                        }).join('');
                    }
                }
                renderTabVoucherCuaToi();
            }
        }

        function phatHanhMaGiamGia() {
            if (!currentCustomer.isAdmin) return;
            let inputEl = document.getElementById('adminDiscountPercentInput');
            let percent = parseInt(inputEl.value);
            if (isNaN(percent) || percent <= 0 || percent > 100) {
                alert("⚠️ Vui lòng nhập số % giảm giá hợp lệ (từ 1 đến 100)!");
                return;
            }
            let modeRadio = document.querySelector('input[name="couponTargetMode"]:checked');
            let targetMode = modeRadio ? modeRadio.value : 'all';
            let selectedPhones = [];
            if (targetMode === 'select') {
                selectedPhones = Array.from(document.querySelectorAll('.chk-target-phone:checked')).map(el => el.value);
                if (selectedPhones.length === 0) {
                    alert("⚠️ Vui lòng tích chọn ít nhất 1 SĐT khách hàng!");
                    return;
                }
            }
            let code = taoMaVoucherNgauNhien(percent);
            let existingIdx = couponsList.findIndex(c => c.code === code);
            let oldUsedPhones = existingIdx !== -1 && Array.isArray(couponsList[existingIdx].usedByPhones) ? couponsList[existingIdx].usedByPhones : [];
            let oldUsedAtMap = existingIdx !== -1 && couponsList[existingIdx].usedAtByPhone ? couponsList[existingIdx].usedAtByPhone : {};
            let newCoupon = {
                code,
                programName: `Chương trình ưu đãi ${percent}%`,
                percent,
                createdAt: Date.now(),
                targetType: targetMode === 'select' ? 'selected' : 'all',
                targetPhones: targetMode === 'select' ? selectedPhones : [],
                usedByPhones: [],
                usedAtByPhone: {}
            };
            // Xóa lịch sử đã dùng cũ của mã này khi Admin chủ động phát hành lại đợt mới
            Object.keys(usedCouponsMap).forEach(ph => { if (usedCouponsMap[ph]) delete usedCouponsMap[ph][code]; });
            localStorage.setItem('mairua_usedCouponsMap', JSON.stringify(usedCouponsMap));
            if (existingIdx !== -1) couponsList[existingIdx] = newCoupon;
            else couponsList.push(newCoupon);

            inputEl.value = '';
            renderGiaoDienChuong();
            luuDuLieuLenDamMay();
            guiDuLieuGoogleSheets('saveCoupon', {
                code: newCoupon.code,
                programName: newCoupon.programName,
                percent: newCoupon.percent,
                targetType: newCoupon.targetType,
                targetPhones: newCoupon.targetPhones,
                createdAt: newCoupon.createdAt,
                totalIssued: 100
            });
            alert(`📢 Đã phát hành mã "${code}" (Giảm ${percent}%)! Mã đã được lưu lên Google Sheets và gửi thông báo tới khách hàng.`);
        }

        function apDungCoupon() {
            if (!currentCustomer.loggedIn) {
                alert("⚠️ Vui lòng đăng nhập tài khoản trước khi áp dụng voucher!");
                moModal('loginModal');
                return;
            }
            let inputCode = document.getElementById('couponInputCode').value.trim().toUpperCase();
            let msgEl = document.getElementById('couponStatusMsg');
            if (!inputCode) {
                appliedCoupon = null;
                msgEl.style.color = '#e74c3c';
                msgEl.innerText = "⚠️ Vui lòng nhập mã voucher!";
                capNhatGioHang();
                return;
            }
            let found = couponsList.find(c => c && c.code && c.code.toUpperCase() === inputCode);
            if (!found) {
                appliedCoupon = null;
                msgEl.style.color = '#e74c3c';
                msgEl.innerText = "❌ Voucher không tồn tại trong kho voucher của bạn!";
                capNhatGioHang();
                return;
            }
            if ((Date.now() - found.createdAt) > COUPON_VALID_DURATION_MS) {
                appliedCoupon = null;
                msgEl.style.color = '#e74c3c';
                msgEl.innerText = "⏰ Voucher này đã hết hạn sử dụng!";
                capNhatGioHang();
                return;
            }
            if (!kiemTraKhachCoDuocNhanCoupon(found)) {
                appliedCoupon = null;
                msgEl.style.color = '#e74c3c';
                msgEl.innerText = "❌ Voucher này không dành cho tài khoản của bạn!";
                capNhatGioHang();
                return;
            }
            if (kiemTraTaiKhoanDaDungCouponChua(found, currentCustomer.phone)) {
                appliedCoupon = null;
                msgEl.style.color = '#e74c3c';
                msgEl.innerText = "❌ Bạn đã sử dụng voucher này rồi!";
                capNhatGioHang();
                return;
            }
            appliedCoupon = found;
            msgEl.style.color = '#16a34a';
            msgEl.innerText = `✅ Áp dụng thành công mã ${found.code}: Giảm ${found.percent}%!`;
            capNhatGioHang();
        }

        let isSyncingCloud = false;
        async function taiDuLieuTuDamMay(showNotice = false) {
            if (isSyncingCloud) return;
            isSyncingCloud = true;
            let syncBtn = document.getElementById('cloudSyncStatusBtn');
            if (syncBtn && showNotice) syncBtn.innerText = "⏳ Đang tải Cloud...";

            try {
                let res = await fetch('/api/sync/cloud');
                if (!res.ok) throw new Error("API Error");
                let record = await res.json();
                let data = record.record ? record.record : record;

                if (data && typeof data === 'object' && !Array.isArray(data)) {
                    if (Array.isArray(data.orders)) {
                        let cloudValid = data.orders.filter(o => o && o.phone && o.name !== "Don hang mau");
                        let freshRealBackup = JSON.parse(localStorage.getItem('mairua_customerRealOrdersBackup')) || customerRealOrdersBackup || [];
                        let mergedOrders = [...remoteOrdersList];
                        [...cloudValid, ...freshRealBackup].forEach(co => {
                            if (!co || !co.phone) return;
                            let existIdx = mergedOrders.findIndex(lo => lo && ((lo.orderCode && lo.orderCode === co.orderCode && lo.startTime === co.startTime) || (lo.phone === co.phone && lo.startTime === co.startTime)));
                            if (existIdx === -1) {
                                mergedOrders.push(co);
                            } else {
                                mergedOrders[existIdx] = { ...co, ...mergedOrders[existIdx] };
                            }
                        });
                        mergedOrders.sort((a, b) => (a.startTime || 0) - (b.startTime || 0));
                        remoteOrdersList = mergedOrders;
                        localStorage.setItem('mairua_remoteOrdersList', JSON.stringify(remoteOrdersList));
                    }
                    if (Array.isArray(data.coupons)) {
                        let freshUsedMap = JSON.parse(localStorage.getItem('mairua_usedCouponsMap')) || usedCouponsMap || {};
                        couponsList = data.coupons.map(c => {
                            if (!c || !c.code) return c;
                            let codeKey = c.code.toUpperCase();
                            let localC = couponsList.find(lc => lc && lc.code && lc.code.toUpperCase() === codeKey);
                            let mergedPhones = new Set([
                                ...(Array.isArray(c.usedByPhones) ? c.usedByPhones : []),
                                ...(localC && Array.isArray(localC.usedByPhones) ? localC.usedByPhones : [])
                            ]);
                            let mergedUsedAt = {
                                ...(c.usedAtByPhone || {}),
                                ...(localC && localC.usedAtByPhone ? localC.usedAtByPhone : {})
                            };
                            Object.keys(freshUsedMap).forEach(ph => {
                                if (freshUsedMap[ph] && typeof freshUsedMap[ph][codeKey] === 'number') {
                                    mergedPhones.add(ph);
                                    mergedUsedAt[ph] = freshUsedMap[ph][codeKey];
                                }
                            });
                            return { ...c, usedByPhones: Array.from(mergedPhones), usedAtByPhone: mergedUsedAt };
                        });
                        localStorage.setItem('mairua_couponsList', JSON.stringify(couponsList));
                    }
                    if (Array.isArray(data.accounts)) {
                        data.accounts.forEach(cloudAcc => {
                            if (!cloudAcc || !cloudAcc.phone) return;
                            let localIdx = accountsDB.findIndex(a => a.phone === cloudAcc.phone);
                            let savedAddrs = Array.isArray(addressesByPhone[cloudAcc.phone]) && addressesByPhone[cloudAcc.phone].length > 0
                                ? addressesByPhone[cloudAcc.phone]
                                : (localIdx !== -1 && Array.isArray(accountsDB[localIdx].addresses) && accountsDB[localIdx].addresses.length > 0
                                    ? accountsDB[localIdx].addresses
                                    : (Array.isArray(cloudAcc.addresses) ? cloudAcc.addresses : []));
                            addressesByPhone[cloudAcc.phone] = savedAddrs;
                            let localProf = profileByPhone[cloudAcc.phone] || null;
                            let finalPass = cloudAcc.phone === "0909501753" ? "5888" : (localProf && localProf.pass ? localProf.pass : (localIdx !== -1 && accountsDB[localIdx].pass ? accountsDB[localIdx].pass : cloudAcc.pass));
                            let finalName = (localProf && localProf.name) ? localProf.name : (localIdx !== -1 && accountsDB[localIdx].name ? accountsDB[localIdx].name : cloudAcc.name);
                            let finalEmail = (localProf && typeof localProf.email === 'string' && localProf.email) ? localProf.email : (localIdx !== -1 && accountsDB[localIdx].email ? accountsDB[localIdx].email : (cloudAcc.email || ''));
                            cloudAcc = { ...cloudAcc, pass: finalPass, name: finalName, email: finalEmail };
                            if (localIdx === -1) {
                                accountsDB.push({ ...cloudAcc, addresses: savedAddrs });
                            } else {
                                let localCoin = typeof accountsDB[localIdx].mcoin === 'number' ? accountsDB[localIdx].mcoin : 0;
                                accountsDB[localIdx] = { ...accountsDB[localIdx], ...cloudAcc, mcoin: Math.max(localCoin, cloudAcc.mcoin || 0), addresses: savedAddrs };
                            }
                        });
                        localStorage.setItem('mairua_addressesByPhone', JSON.stringify(addressesByPhone));
                        localStorage.setItem('mairua_accountsDB', JSON.stringify(accountsDB));
                        if (currentCustomer.loggedIn && currentCustomer.phone && Array.isArray(addressesByPhone[currentCustomer.phone])) {
                            currentCustomer.addresses = addressesByPhone[currentCustomer.phone];
                            sessionStorage.setItem('mairua_currentCustomer', JSON.stringify(currentCustomer));
                            if (!currentCustomer.isAdmin) {
                localStorage.setItem('mairua_currentCustomer', JSON.stringify(currentCustomer));
            }
                        }
                    }
                }
                capNhatGiaoDienTheoDuLieuMoi();
                if (document.getElementById('view-detail').classList.contains('active') && currentOpenedProductId) { let p = products.find(x => x.id === currentOpenedProductId); if (p) veBangSizeVaDanhGiaChiTiet(p); }
                renderGiaoDienChuong();
                kiemTraVaHienPopupKhuyenMaiMoiChoKhach();
                if (syncBtn) syncBtn.innerText = "✅ Cloud đã đồng bộ";
            } catch (e) {
                if (syncBtn) syncBtn.innerText = "⚠️ Đang dùng dữ liệu bộ nhớ đệm";
            } finally {
                isSyncingCloud = false;
            }
        }

        function luuDuLieuLenDamMay() {
            dongBoTonKhoChuanXac();
            capNhatTongStockVaSoldSanPham();
            localStorage.setItem('mairua_remoteOrdersList', JSON.stringify(remoteOrdersList));
            localStorage.setItem('mairua_products', JSON.stringify(products));
            localStorage.setItem('mairua_couponsList', JSON.stringify(couponsList));
            localStorage.setItem('mairua_accountsDB', JSON.stringify(accountsDB));

            const payload = {
                accounts: accountsDB,
                orders: remoteOrdersList,
                variantStocks: products.map(p => ({ id: p.id, v: p.variants.map(va => ({ s: va.stock, d: va.sold || 0 })) })),
                coupons: couponsList,
                updatedAt: Date.now()
            };

            fetch('/api/sync/cloud', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            }).catch(() => {});
        }

        function xoaDonHangAdmin(index, e) {
            if (e) e.stopPropagation();
            let removed = remoteOrdersList[index];
            if (removed) {
                let info = layThongTinTienTrinhDon(removed);
                if (!info.isCancelled) {
                    hoanTraTonKhoKhiHuyDon(removed);
                }
                if (removed.orderCode) {
                    customerRealOrdersBackup = (JSON.parse(localStorage.getItem('mairua_customerRealOrdersBackup')) || customerRealOrdersBackup || []).filter(o => !(o && o.orderCode === removed.orderCode && o.startTime === removed.startTime));
                    localStorage.setItem('mairua_customerRealOrdersBackup', JSON.stringify(customerRealOrdersBackup));
                }
            }
            remoteOrdersList.splice(index, 1);
            if (selectedAdminOrderIndex === index) thuGonChiTietDon();
            renderAdminDashboard();
            luuDuLieuLenDamMay();
        }

        function xoaTimKiemDonAdmin() {
            let searchInput = document.getElementById('adminOrderSearchInput');
            if (searchInput) searchInput.value = '';
            renderAdminOrdersTableOnly();
        }

        function datLaiLocNgay() {
            let dateFrom = document.getElementById('adminFilterDateFrom');
            let dateTo = document.getElementById('adminFilterDateTo');
            if (dateFrom) dateFrom.value = '';
            if (dateTo) dateTo.value = '';
            document.querySelectorAll('.btn-date-preset').forEach(b => b.classList.remove('active'));
            let btnAll = document.getElementById('btnDateAll');
            if (btnAll) btnAll.classList.add('active');
            renderAdminOrdersTableOnly();
        }

        function locDonTheoKhoangNgay() {
            document.querySelectorAll('.btn-date-preset').forEach(b => b.classList.remove('active'));
            renderAdminOrdersTableOnly();
        }

        function datKhoangNgayNhanh(preset, btnEl) {
            document.querySelectorAll('.btn-date-preset').forEach(b => b.classList.remove('active'));
            if (btnEl) btnEl.classList.add('active');
            let dateFromInput = document.getElementById('adminFilterDateFrom');
            let dateToInput = document.getElementById('adminFilterDateTo');
            let now = new Date();
            let formatDate = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

            if (preset === 'all') { dateFromInput.value = ''; dateToInput.value = ''; }
            else if (preset === 'today') { let t = formatDate(now); dateFromInput.value = t; dateToInput.value = t; }
            else if (preset === '7days') { dateFromInput.value = formatDate(new Date(now.getTime() - 7 * 86400000)); dateToInput.value = formatDate(now); }
            else if (preset === '30days') { dateFromInput.value = formatDate(new Date(now.getTime() - 30 * 86400000)); dateToInput.value = formatDate(now); }
            renderAdminOrdersTableOnly();
        }

        function renderAdminOrdersTableOnly() {
            let ordListTable = document.getElementById('adminOrdersListTable');
            let countSpan = document.getElementById('adminTotalOrdersCount');
            if (countSpan) countSpan.innerText = remoteOrdersList.length;
            if (!ordListTable) return;

            let pendingCount = 0;
            remoteOrdersList.forEach(o => {
                if (o && !kiemTraDonDaDuocDuyet(o) && !o.isCancelled) pendingCount++;
            });
            let bannerEl = document.getElementById('adminPendingOrdersBanner');
            let bannerText = document.getElementById('adminPendingOrdersBannerText');
            if (bannerEl && bannerText) {
                if (pendingCount > 0) {
                    bannerEl.style.display = 'flex';
                    bannerText.innerHTML = `🚨 Có <b>${pendingCount}</b> đơn hàng mới từ khách thật đang chờ duyệt!`;
                } else {
                    bannerEl.style.display = 'none';
                }
            }

            let rawKeyword = (document.getElementById('adminOrderSearchInput') ? document.getElementById('adminOrderSearchInput').value : '').trim();
            let normKeyword = boDauTiengViet(rawKeyword);
            let dateFromStr = document.getElementById('adminFilterDateFrom') ? document.getElementById('adminFilterDateFrom').value : '';
            let dateToStr = document.getElementById('adminFilterDateTo') ? document.getElementById('adminFilterDateTo').value : '';
            let timeFrom = dateFromStr ? new Date(dateFromStr + "T00:00:00").getTime() : null;
            let timeTo = dateToStr ? new Date(dateToStr + "T23:59:59").getTime() : null;

            ordListTable.innerHTML = '';
            if (remoteOrdersList.length === 0) {
                ordListTable.innerHTML = `<tr><td colspan="7" style="text-align: center; color: #777;">Chưa có đơn hàng nào.</td></tr>`;
                return;
            }

            let matchedCount = 0;
            for (let realIndex = remoteOrdersList.length - 1; realIndex >= 0; realIndex--) {
                let ord = remoteOrdersList[realIndex];
                if (!ord) continue;
                let custName = ord.name || 'Khách hàng';
                let custPhone = ord.phone || '';
                let code = ord.orderCode || `MVP${12200 + realIndex}`;
                let orderTime = ord.startTime || Date.now();

                let info = layThongTinTienTrinhDon(ord);
                if (normKeyword) {
                    if (!boDauTiengViet(custName).includes(normKeyword) && !custPhone.toLowerCase().includes(normKeyword) && !code.toLowerCase().includes(normKeyword) && !boDauTiengViet(info.currentLabel).includes(normKeyword)) continue;
                }
                if (timeFrom !== null && orderTime < timeFrom) continue;
                if (timeTo !== null && orderTime > timeTo) continue;

                matchedCount++;
                let dateObj = new Date(orderTime);
                let timeStr = `${String(dateObj.getHours()).padStart(2,'0')}:${String(dateObj.getMinutes()).padStart(2,'0')} - ${String(dateObj.getDate()).padStart(2,'0')}/${String(dateObj.getMonth()+1).padStart(2,'0')}/${dateObj.getFullYear()}`;

                let realCustBadge = ord.isRealCustomerOrder ? ' <span style="font-size:10px; background:#16a34a; color:#fff; padding:2px 6px; border-radius:4px; font-weight:700;">KHÁCH ĐẶT</span>' : '';
                let isConfirmed = kiemTraDonDaDuocDuyet(ord);
                let confirmBtnHtml = (!isConfirmed && !info.isCancelled)
                    ? `<button type="button" onclick="adminXacNhanDonHang(${realIndex}, event)" title="Duyệt đơn và chuyển sang công đoạn kế tiếp" style="background:#16a34a; color:#fff; border:none; padding:5px 12px; border-radius:6px; font-size:11.5px; font-weight:700; cursor:pointer; font-family:'Poppins',sans-serif; box-shadow:0 2px 6px rgba(22,163,74,0.3); white-space:nowrap;">✅ Duyệt đơn</button>`
                    : '';
                let nextStepBtnHtml = (isConfirmed && !info.isCancelled && info.currentIdx < info.steps.length - 1)
                    ? `<button type="button" onclick="adminChuyenBuocTiepTheo(${realIndex}, event)" title="Chuyển ngay sang bước tiếp theo" style="background:#2563eb; color:#fff; border:none; padding:5px 10px; border-radius:6px; font-size:11px; font-weight:700; cursor:pointer; font-family:'Poppins',sans-serif; white-space:nowrap;">⏭ Bước tiếp</button>`
                    : '';

                ordListTable.innerHTML += `<tr class="clickable-row" style="${ord.isRealCustomerOrder ? 'background:#f0fdf4;' : ''}" onclick="hienChiTietDonHang(${realIndex})">
                    <td><b>${code}</b> ${info.isJerseyOrder ? '<span style="font-size:10px; background:#111; color:#fff; padding:2px 5px; border-radius:4px;">JERSEY</span>' : ''}${realCustBadge}</td>
                    <td><b>${custName}</b></td>
                    <td><b>${custPhone}</b>${ord.accountPhone && ord.accountPhone !== custPhone ? `<div style="font-size:11px;color:#2563eb;">(Acc: ${ord.accountPhone})</div>` : ''}</td>
                    <td>${ord.addr || '---'}</td>
                    <td style="font-size:12px; color:#555;">${timeStr}</td>
                    <td><span class="order-badge-pill ${info.badgeClass}">${info.currentLabel}</span></td>
                    <td style="display:flex; align-items:center; justify-content:flex-end; gap:8px;">
                        ${confirmBtnHtml}
                        ${nextStepBtnHtml}
                        <span style="color: #ff5500; font-weight: 600; cursor: pointer; font-size:12px; white-space:nowrap;">🔍 Chi tiết</span>
                        <button type="button" onclick="xoaDonHangAdmin(${realIndex}, event)" title="Xóa đơn" style="background:#e74c3c; color:white; border:none; padding:4px 8px; border-radius:4px; font-size:11px; cursor:pointer;">🗑️</button>
                    </td>
                </tr>`;
            }

            if (matchedCount === 0) {
                ordListTable.innerHTML = `<tr><td colspan="7" style="text-align: center; color: #e74c3c; font-weight: 600; padding: 18px;">Không tìm thấy đơn hàng nào khớp điều kiện.</td></tr>`;
            }
        }

        function capNhatGiaoDienTheoDuLieuMoi() {
            if (currentCustomer.isAdmin) {
                renderAdminDashboard();
                if (selectedAdminOrderIndex !== null && remoteOrdersList[selectedAdminOrderIndex]) {
                    hienChiTietDonHang(selectedAdminOrderIndex);
                }
                if (document.getElementById('view-adminNotif').classList.contains('active')) {
                    renderGiaoDienChuong();
                }
            } else {
                renderCustomerOrderHistory();
                renderGiaoDienChuong();
                if (document.getElementById('view-account').classList.contains('active')) {
                    renderTrangTaiKhoan();
                }
            }
            if (document.getElementById('view-home').classList.contains('active')) renderHomeProducts();
            capNhatTrangThaiNutCustom();
            dongBoTrangThaiDonHangLenSheet();
        }

        setInterval(() => { capNhatGiaoDienTheoDuLieuMoi(); }, 5000);
        setInterval(() => { dongBoTuGoogleSheets(); }, 10000); // Tự động kéo tài khoản & đơn hàng mới từ Google Sheets mỗi 10s

        let sessionTimer = null;
        function resetSessionTimeout() {
            if (sessionTimer) clearTimeout(sessionTimer);
            if (currentCustomer.loggedIn) {
                sessionTimer = setTimeout(() => {
                    alert("⏰ Phiên đăng nhập đã hết hạn sau 5 phút không hoạt động.");
                    dangXuat();
                }, 5 * 60 * 1000);
            }
        }
        window.addEventListener('mousemove', resetSessionTimeout);
        window.addEventListener('keypress', resetSessionTimeout);

        function dangXuat() {
            luuGioHangLocal(); // Lưu giỏ hàng của user trước khi đăng xuất
            currentCustomer = { phone: "", pass: "", name: "Khách vãng lai", orders: 0, mcoin: 0, tokens: 3, loggedIn: false, isAdmin: false, addresses: [] };
            sessionStorage.removeItem('mairua_currentCustomer');
            localStorage.removeItem('mairua_currentCustomer');
            if (sessionTimer) clearTimeout(sessionTimer);
            appliedCoupon = null;
            dongPopupKhuyenMai();
            cart = layGioHangTheoKey('guest'); // Chuyển sang giỏ hàng của khách (không lưu chung với đồ của tài khoản vừa thoát)
            localStorage.setItem('mairua_cart', JSON.stringify(cart));
            capNhatHeaderTaiKhoan();
            chuyenTab('home');
            alert("Đã đăng xuất tài khoản!");
        }

        function moGioHang() {
            if (currentCustomer && currentCustomer.isAdmin) {
                alert("🛡️ Tài khoản Quản Trị Viên (Admin) không có chức năng mua hàng!");
                return;
            }
            chuyenTab('cart');
        }

        function moCartDrawer() {
            chuyenTab('cart');
        }

        function dongCartDrawer() {
            let overlay = document.getElementById('cartDrawerOverlay');
            let drawer = document.getElementById('cartDrawer');
            if (overlay) overlay.classList.remove('active');
            if (drawer) drawer.classList.remove('open');
        }

        function timVariantIndexPhoiJerseyTheoTenMau(colorName) {
            let blankProd = products.find(p => p.id === 22);
            if (!blankProd) return 0;
            let idx = blankProd.variants.findIndex(v => v.colorName.toLowerCase() === (colorName || '').toLowerCase());
            return idx !== -1 ? idx : 0;
        }

        function capNhatTrangThaiNutCustom() {
            let btnBalo = document.getElementById('btnAddCustomBalo');
            let btnJersey = document.getElementById('btnAddCustomJersey');
            let baloProdId = parseInt(document.getElementById('baloModel') ? document.getElementById('baloModel').value : '1') || 1;
            let baloProd = products.find(p => p.id === baloProdId);
            let baloVar = baloProd && baloProd.variants[selectedBaloStudioVariantIdx] ? baloProd.variants[selectedBaloStudioVariantIdx] : null;

            let jerseyProd = products.find(p => p.id === 22);
            let jVarIdx = timVariantIndexPhoiJerseyTheoTenMau(jerseyStudioState.baseColorName);
            let jerseyVar = jerseyProd && jerseyProd.variants[jVarIdx] ? jerseyProd.variants[jVarIdx] : null;

            let baloNotice = document.getElementById('baloCustomStockNotice');
            if (baloNotice && baloVar) {
                baloNotice.innerText = `📦 Tồn kho màu ${baloVar.colorName}: còn ${baloVar.stock} cái`;
                baloNotice.style.color = baloVar.stock > 0 ? '#27ae60' : '#e74c3c';
            }
            let jerseyNotice = document.getElementById('jerseyCustomStockNotice');
            if (jerseyNotice && jerseyVar) {
                jerseyNotice.innerText = `📦 Tồn kho Phôi Áo màu ${jerseyVar.colorName}: còn ${jerseyVar.stock} cái`;
                jerseyNotice.style.color = jerseyVar.stock > 0 ? '#27ae60' : '#e74c3c';
            }

            if (currentCustomer.isAdmin) {
                if (btnBalo) { btnBalo.innerText = "🛡️ Admin không thể mua hàng"; btnBalo.classList.add('btn-disabled'); }
                if (btnJersey) { btnJersey.innerText = "🛡️ Admin không thể mua hàng"; btnJersey.classList.add('btn-disabled'); }
            } else {
                if (btnBalo) {
                    btnBalo.innerText = (baloVar && baloVar.stock <= 0) ? "❌ Màu Balo này đã hết hàng" : "🛒 Thêm balo custom vào giỏ (850,000đ)";
                    btnBalo.classList.toggle('btn-disabled', !!(baloVar && baloVar.stock <= 0));
                }
                if (btnJersey) {
                    let jBlocked = (jerseyStudioState.mode !== 'shorts') && !!(jerseyVar && jerseyVar.stock <= 0);
                    btnJersey.innerText = jBlocked ? `❌ Phôi màu ${jerseyVar.colorName} đã hết hàng` : "Thêm vào giỏ";
                    btnJersey.classList.toggle('btn-disabled', jBlocked);
                }
            }
        }

        function capNhatHeaderTaiKhoan() {
            let badgeContainer = document.getElementById('roleBadgeContainer');
            let headerCartBtn = document.getElementById('headerCartBtn');
            let btnRegisterHeader = document.getElementById('btnRegisterHeader');

            if (currentCustomer.isAdmin) {
                badgeContainer.innerHTML = `<div style="display:flex; align-items:center; gap:6px;"><div class="admin-badge">🛡️ ADMIN QUẢN TRỊ</div><button type="button" onclick="dangXuat()" style="background:#dc2626; color:#fff; border:none; padding:5px 10px; border-radius:6px; font-size:11.5px; font-weight:700; cursor:pointer; font-family:'Poppins',sans-serif;">🚪 Đăng xuất</button></div>`;
                if (headerCartBtn) headerCartBtn.style.display = 'none';
                if (btnRegisterHeader) btnRegisterHeader.style.display = 'none';
                appliedCoupon = null;
                dongPopupKhuyenMai();
            } else {
                badgeContainer.innerHTML = ``;
                if (headerCartBtn) headerCartBtn.style.display = 'flex';
                if (btnRegisterHeader) btnRegisterHeader.style.display = currentCustomer.loggedIn ? 'none' : 'inline-block';
            }
            document.getElementById('tokenHeaderCount').innerText = currentCustomer.tokens;
            document.getElementById('userLabel').innerText = currentCustomer.loggedIn ? (currentCustomer.isAdmin ? "Quản trị Admin" : "Tài khoản") : "Đăng nhập";

            let custOrderView = document.getElementById('customerOrderHistoryView');
            let adminSec = document.getElementById('adminDashboardSection');
            if (currentCustomer.isAdmin) {
                if(custOrderView) custOrderView.style.display = 'none';
                if(adminSec) adminSec.style.display = 'block';
                renderAdminDashboard();
            } else {
                if(custOrderView) { custOrderView.style.display = 'block'; renderCustomerOrderHistory(); }
                if(adminSec) adminSec.style.display = 'none';
                kiemTraVaHienPopupKhuyenMaiMoiChoKhach();
            }

            renderGiaoDienChuong();
            capNhatGioHang();
            capNhatTrangThaiNutCustom();
            if (document.getElementById('view-home').classList.contains('active')) renderHomeProducts();
        }

        function renderCustomerOrderHistory() {
            let wrapper = document.getElementById('remoteCustOrdersWrapper');
            if (!wrapper) return;
            let myOrdersWithIdx = [];
            remoteOrdersList.forEach((o, realIdx) => {
                if (o && (o.phone === currentCustomer.phone || o.accountPhone === currentCustomer.phone)) {
                    myOrdersWithIdx.push({ ord: o, realIdx });
                }
            });
            if (myOrdersWithIdx.length === 0) {
                wrapper.innerHTML = `<p style="color:#777; font-size:13.5px;">Bạn chưa có đơn hàng nào.</p>`;
                return;
            }
            wrapper.innerHTML = myOrdersWithIdx.slice().reverse().map(({ ord, realIdx }) => {
                let info = layThongTinTienTrinhDon(ord);
                let code = ord.orderCode || `MVP${12200 + realIdx}`;
                let d = new Date(ord.startTime || Date.now());
                let dateStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
                return `<div class="order-row-card" onclick="moTabTaiKhoan('orders'); xemChiTietDonTaiKhoan(${realIdx});">
                    <div><b>${code}</b> · ${dateStr} · ${ord.itemsCount || 1} SP</div>
                    <div style="display:flex; align-items:center; gap:12px;">
                        <span class="order-badge-pill ${info.badgeClass}">${info.currentLabel}</span>
                        <b>${(ord.finalTotal || ord.subtotal || 0).toLocaleString('vi-VN')}đ</b>
                    </div>
                </div>`;
            }).join('');
        }

        // YÊU CẦU 3: BẢNG NHẬP KHO GỌN 1 DÒNG / 1 SẢN PHẨM VỚI DROPDOWN CHỌN MÀU (KỂ CẢ PHÔI ÁO)
        function capNhatTonKhoKhiDoiMauRestock(prodId) {
            let sel = document.getElementById(`restock-color-sel-${prodId}`);
            let stockSpan = document.getElementById(`restock-cur-stock-${prodId}`);
            let prod = products.find(p => p.id === prodId);
            if (!sel || !stockSpan || !prod) return;
            let vIdx = parseInt(sel.value) || 0;
            let v = prod.variants[vIdx];
            if (!v) return;
            stockSpan.innerHTML = `<span style="display:inline-block;width:11px;height:11px;border-radius:50%;background:${v.hex};border:1px solid #666;margin-right:5px;vertical-align:middle;"></span><b style="color:${v.stock <= 5 ? '#dc2626' : '#15803d'};">${v.stock} cái</b> ${v.stock <= 5 ? '<span style="font-size:11px;color:#dc2626;">(Sắp hết!)</span>' : ''}`;
        }

        function renderAdminDashboard() {
            dongBoTonKhoChuanXac();
            capNhatTongStockVaSoldSanPham();

            let retentionBox = document.getElementById('adminRetentionStats');
            if (retentionBox) {
                let orderCountByPhone = {};
                remoteOrdersList.forEach(o => {
                    if (o && o.phone && o.phone !== "0909501753") orderCountByPhone[o.phone] = (orderCountByPhone[o.phone] || 0) + 1;
                });
                let allBuyerPhones = Object.keys(orderCountByPhone);
                let totalBuyers = allBuyerPhones.length;
                let returningBuyers = allBuyerPhones.filter(ph => orderCountByPhone[ph] >= 2).length;
                let retentionRate = totalBuyers > 0 ? ((returningBuyers / totalBuyers) * 100).toFixed(1) : "0.0";
                let lowCount = layDanhSachHangTonThap().length;

                retentionBox.innerHTML = `
                    <div class="retention-card" style="border-left-color: #27ae60;"><h4>🔄 Tỉ Lệ Khách Quay Lại Mua</h4><div class="big-num" style="color: #27ae60;">${retentionRate}%</div></div>
                    <div class="retention-card" style="border-left-color: #2980b9;"><h4>👥 Tổng Số Khách Đã Mua</h4><div class="big-num">${totalBuyers} khách</div></div>
                    <div class="retention-card" style="border-left-color: #dc2626; cursor:pointer;" onclick="moTabChuongAdmin('lowstock')"><h4>⚠️ Cảnh Báo Hàng Tồn (≤ 5)</h4><div class="big-num" style="color: #dc2626;">${lowCount} mặt hàng</div></div>
                `;
            }

            let invTable = document.getElementById('adminInventoryTable');
            if(invTable) {
                invTable.innerHTML = '';
                let flatVariants = [];
                products.forEach(p => {
                    p.variants.forEach((v, vIdx) => {
                        flatVariants.push({ prodId: p.id, prodName: p.name, price: p.price, colorName: v.colorName, hex: v.hex, stock: v.stock, sold: v.sold || 0, vIdx });
                    });
                });
                flatVariants.sort((a, b) => b.sold - a.sold);
                let totalRows = flatVariants.length;
                let greenCutoff = Math.ceil(totalRows / 3);
                let yellowCutoff = Math.ceil((totalRows * 2) / 3);

                flatVariants.forEach((item, index) => {
                    let rowClass = index < greenCutoff ? 'inv-tier-green' : (index < yellowCutoff ? 'inv-tier-yellow' : 'inv-tier-red');
                    let tierBadge = index < greenCutoff ? '🟢 Bán chạy' : (index < yellowCutoff ? '🟡 Trung bình' : '🔴 Ít bán');
                    let lowWarn = item.stock <= 5 ? ` <span style="background:#dc2626;color:#fff;padding:1px 6px;border-radius:4px;font-size:10.5px;">≤ 5</span>` : '';
                    invTable.innerHTML += `<tr class="${rowClass}">
                        <td><b>#${index + 1}</b> (${tierBadge})</td>
                        <td><b>${item.prodName}</b></td>
                        <td><span style="display:inline-block;width:12px;height:12px;border-radius:50%;background:${item.hex};border:1px solid #555;vertical-align:middle;margin-right:5px;"></span><b>${item.colorName}</b></td>
                        <td>${item.price.toLocaleString('vi-VN')}đ</td>
                        <td><b>${item.sold}</b> đã bán</td>
                        <td><b>${item.stock} cái</b>${lowWarn}</td>
                    </tr>`;
                });
            }

            renderAdminOrdersTableOnly();

            // Bảng Nhập Hàng: Mỗi sản phẩm đúng 1 dòng + Dropdown chọn Màu
            let restockTable = document.getElementById('adminRestockTable');
            if(restockTable) {
                let prevRestockState = {};
                products.forEach(p => {
                    let sEl = document.getElementById(`restock-color-sel-${p.id}`);
                    let qEl = document.getElementById(`restock-qty-${p.id}`);
                    let cEl = document.getElementById(`restock-chk-${p.id}`);
                    prevRestockState[p.id] = {
                        vIdx: sEl ? (parseInt(sEl.value) || 0) : 0,
                        qty: qEl ? (parseInt(qEl.value) || 10) : 10,
                        chk: cEl ? !!cEl.checked : false
                    };
                });
                restockTable.innerHTML = products.map(p => {
                    let st = prevRestockState[p.id] || { vIdx: 0, qty: 10, chk: false };
                    let selIdx = p.variants[st.vIdx] ? st.vIdx : 0;
                    let v0 = p.variants[selIdx];
                    let optionsHtml = p.variants.map((v, vIdx) => `<option value="${vIdx}" ${vIdx === selIdx ? 'selected' : ''}>${v.colorName} (Tồn: ${v.stock})</option>`).join('');


                    return `<tr>
                        <td><b>${p.name}</b></td>
                        <td>
                            <select id="restock-color-sel-${p.id}" class="form-control" style="margin:0; padding:6px 10px; font-weight:600;" onchange="capNhatTonKhoKhiDoiMauRestock(${p.id})">
                                ${optionsHtml}
                            </select>
                        </td>
                        <td id="restock-cur-stock-${p.id}">
                            <span style="display:inline-block;width:11px;height:11px;border-radius:50%;background:${v0.hex};border:1px solid #666;margin-right:5px;vertical-align:middle;"></span>
                            <b style="color:${v0.stock <= 5 ? '#dc2626' : '#15803d'};">${v0.stock} cái</b> ${v0.stock <= 5 ? '<span style="font-size:11px;color:#dc2626;">(Sắp hết!)</span>' : ''}
                        </td>
                        <td><input type="number" min="1" value="${st.qty}" class="form-control" id="restock-qty-${p.id}" style="margin:0; width: 90px;"></td>
                        <td style="text-align:center;"><input type="checkbox" id="restock-chk-${p.id}" ${st.chk ? 'checked' : ''} style="width: 18px; height: 18px; cursor: pointer;"></td>
                    </tr>`;
                }).join('');
            }
        }

        function hienChiTietDonHang(index) {
            selectedAdminOrderIndex = index;
            let ord = remoteOrdersList[index];
            if (!ord) return;
            let detailBox = document.getElementById('adminOrderDetailBox');
            detailBox.style.display = 'block';
            detailBox.innerHTML = taoHtmlTimelineChiTietDon(ord, index, true);
        }

        function thuGonChiTietDon() {
            document.getElementById('adminOrderDetailBox').style.display = 'none';
            selectedAdminOrderIndex = null;
        }

        function thucHienNhapHang() {
            let countImported = 0;
            products.forEach(p => {
                let chk = document.getElementById(`restock-chk-${p.id}`);
                let sel = document.getElementById(`restock-color-sel-${p.id}`);
                let qtyInput = document.getElementById(`restock-qty-${p.id}`);
                if (chk && chk.checked && sel && qtyInput) {
                    let vIdx = parseInt(sel.value) || 0;
                    let addQty = parseInt(qtyInput.value) || 0;
                    if (addQty > 0 && p.variants[vIdx]) {
                        p.variants[vIdx].stock += addQty;
                        countImported++;
                        chk.checked = false;
                    }
                }
            });
            if (countImported > 0) {
                capNhatTongStockVaSoldSanPham();
                localStorage.setItem('mairua_products', JSON.stringify(products));
                renderAdminDashboard();
                renderGiaoDienChuong();
                luuDuLieuLenDamMay();
                alert(`🎉 Nhập hàng thành công cho ${countImported} sản phẩm đã chọn!`);
            } else {
                alert("⚠️ Vui lòng tích chọn ít nhất một sản phẩm cần nhập kho!");
            }
        }

        function tinhGiaVaThanhTien(productName, basePrice, qty) {
            let unitPrice = basePrice;
            let lowerName = productName.toLowerCase();
            if (lowerName.includes('vớ') && qty > 15) unitPrice = Math.max(0, basePrice - 10000);
            else if (lowerName.includes('balo') && qty > 10) unitPrice = Math.max(0, basePrice - 50000);
            else if ((lowerName.includes('jersey') || lowerName.includes('áo') || lowerName.includes('quần')) && qty > 10) unitPrice = Math.max(0, basePrice - 15000);
            else if (lowerName.includes('bóng') && qty > 15) unitPrice = Math.max(0, basePrice - 30000);
            return { unitPrice, totalPrice: unitPrice * qty };
        }

        function kiemTraTonKhoGioHangHopLe() {
            let totalsByVariantKey = {};
            for (let item of cart) {
                let { prod, variant, vIdx } = timSanPhamVaVariantTuCartItem(item);
                if (prod && variant) {
                    let key = `${prod.id}_${vIdx}`;
                    totalsByVariantKey[key] = {
                        qty: (totalsByVariantKey[key] ? totalsByVariantKey[key].qty : 0) + item.qty,
                        prodName: prod.name,
                        colorName: variant.colorName,
                        stock: variant.stock
                    };
                }
            }
            for (let key in totalsByVariantKey) {
                let info = totalsByVariantKey[key];
                if (info.qty > info.stock) {
                    alert(`❌ Sản phẩm "${info.prodName} (${info.colorName})" chỉ còn tồn kho ${info.stock} cái, nhưng bạn đang đặt ${info.qty} cái.`);
                    return false;
                }
            }
            return true;
        }

        function truTonKhoVaTangLuotBan(cartArr) {
            dongBoTonKhoChuanXac();
            let deductedVariants = [];
            cartArr.forEach(cartItem => {
                let { prod, variant, vIdx } = timSanPhamVaVariantTuCartItem(cartItem);
                if (prod && variant) {
                    variant.stock = Math.max(0, variant.stock - cartItem.qty);
                    variant.sold = (variant.sold || 0) + cartItem.qty;
                    deductedVariants.push({ prodId: prod.id, vIdx, qty: cartItem.qty });
                }
            });
            capNhatTongStockVaSoldSanPham();
            localStorage.setItem('mairua_products', JSON.stringify(products));
            return deductedVariants;
        }

        function thanhToanGiaoXa() {
            if (currentCustomer.isAdmin) { alert("🛡️ Tài khoản Admin không được phép đặt mua hàng!"); return; }
            if (!currentCustomer.loggedIn) { alert("⚠️ Vui lòng đăng nhập tài khoản trước khi thanh toán!"); moModal('loginModal'); return; }
            if (cart.length === 0) { alert("⚠️ Giỏ hàng trống! Vui lòng chọn sản phẩm trước."); return; }
            if (!kiemTraTonKhoGioHangHopLe()) return;

            let addrs = layDanhSachDiaChiCuaAccHienTai();
            if (addrs.length === 0) {
                alert("⚠️ Bạn chưa có địa chỉ nhận hàng trong Sổ địa chỉ! Hệ thống sẽ chuyển bạn sang mục Sổ địa chỉ để thêm.");
                moTabTaiKhoan('addr');
                return;
            }

            let chosenAddr = addrs[selectedCheckoutAddrIdx] || addrs[0];
            let name = chosenAddr.name, phone = chosenAddr.phone, addr = chosenAddr.fullAddress;

            if (appliedCoupon) {
                let freshCheck = couponsList.find(c => c.code === appliedCoupon.code);
                if (!freshCheck || (Date.now() - freshCheck.createdAt > COUPON_VALID_DURATION_MS)) {
                    appliedCoupon = null; capNhatGioHang(); alert("⚠️ Mã giảm giá vừa hết hạn!"); return;
                }
                if (kiemTraTaiKhoanDaDungCouponChua(freshCheck, currentCustomer.phone)) {
                    appliedCoupon = null; capNhatGioHang(); alert("❌ Tài khoản của bạn đã dùng mã này rồi!"); return;
                }
                danhDauDaDungCoupon(freshCheck, currentCustomer.phone);
            }

            let firstCartItem = cart[0];
            let deductedVariants = truTonKhoVaTangLuotBan(cart);

            let totals = tinhToanChiTietGioHang();
            let totalItemsCount = cart.reduce((s, i) => s + i.qty, 0);
            let itemsList = cart.map(i => `• ${i.name} ${i.subInfo ? '(' + i.subInfo + ')' : ''} (x${i.qty}) - ${(i.price * i.qty).toLocaleString('vi-VN')}đ`);

            let hasCustomJersey = cart.some(i => i.isCustomJersey || i.isRoster);
            let jerseyCount = cart.filter(i => i.isCustomJersey || i.isRoster).reduce((s, i) => s + i.qty, 0);

            let tierBefore = layThongTinHangThanhVien(currentCustomer.phone);
            let earnedMCoin = Math.round(totals.finalTotal * tierBefore.rateDecimal);
            currentCustomer.mcoin = Math.max(0, (currentCustomer.mcoin || 0) - totals.mCoinDiscountAmt + earnedMCoin);
            currentCustomer.tokens = (currentCustomer.tokens || 0) + 1;
            currentCustomer.orders = (currentCustomer.orders || 0) + 1;

            let chkNeedInv = document.getElementById('chkNeedInvoice');
            let needsInvoice = chkNeedInv ? !!chkNeedInv.checked : false;
            let invoiceInfo = null;
            if (needsInvoice) {
                invoiceInfo = {
                    taxName: (document.getElementById('invoiceTaxName') ? document.getElementById('invoiceTaxName').value : '').trim() || name,
                    taxCode: (document.getElementById('invoiceTaxCode') ? document.getElementById('invoiceTaxCode').value : '').trim(),
                    email: (document.getElementById('invoiceEmail') ? document.getElementById('invoiceEmail').value : '').trim() || (currentCustomer.email || '')
                };
            }

            let orderCode = taoMaDonHangMoi();
            let newOrder = {
                orderCode, accountPhone: currentCustomer.phone,
                isRealCustomerOrder: true,
                adminConfirmed: false,
                name, phone, addr, itemsCount: totalItemsCount, itemsList,
                deductedVariants,
                cartSnapshot: cart.map(i => ({ productId: i.productId, variantIndex: i.variantIndex, name: i.name, subInfo: i.subInfo || '', price: i.price, qty: i.qty, img: i.img || '' })),
                hasCustomJersey, jerseyCount,
                subtotal: totals.subtotal, discountAmt: totals.totalDiscount,
                usedMCoin: totals.mCoinDiscountAmt, earnedMCoin, cashbackPercent: tierBefore.ratePercent,
                shippingFee: totals.shippingFee,
                finalTotal: totals.finalTotal,
                couponUsed: appliedCoupon ? appliedCoupon.code : null,
                needsInvoice, invoiceInfo,
                startTime: Date.now()
            };

            remoteOrdersList.push(newOrder);
            let stockLedger = JSON.parse(localStorage.getItem('mairua_stockLedgerV2')) || {};
            stockLedger[`${newOrder.orderCode}_${newOrder.startTime}`] = 'deducted';
            localStorage.setItem('mairua_stockLedgerV2', JSON.stringify(stockLedger));
            dongBoBackupDonKhachThat(newOrder);
            dongBoTaiKhoanHienTaiVaoDB();
            guiDuLieuGoogleSheets('createOrder', {
                order: {
                    orderCode: newOrder.orderCode,
                    phone: newOrder.phone,
                    name: newOrder.name,
                    addr: newOrder.addr,
                    itemsList: newOrder.itemsList,
                    finalTotal: newOrder.finalTotal,
                    status: 'Chờ xác nhận',
                    hasCustomJersey: newOrder.hasCustomJersey
                }
            });

            // Đồng bộ đơn hàng tới MySQL REST API Backend
            (async () => {
                try {
                    await fetch('/api/orders', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            orderCode: newOrder.orderCode,
                            customerName: newOrder.name,
                            customerPhone: newOrder.phone,
                            customerAddress: newOrder.addr,
                            subtotal: newOrder.subtotal,
                            discountAmount: newOrder.discountAmt,
                            shippingFee: newOrder.shippingFee,
                            finalAmount: newOrder.finalTotal,
                            items: newOrder.cartSnapshot
                        })
                    });
                    console.log('✅ Đã lưu đơn hàng vào MySQL Database thành công!');
                } catch (e) {
                    console.log('ℹ️ Đơn hàng đã được lưu an toàn trong LocalStorage & Google Sheets.');
                }
            })();

            // 1. Dọn sạch giỏ hàng lập tức trên mọi bộ nhớ
            cart = [];
            let cKey = layKeyGioHangHienTai();
            cartsByPhone[cKey] = [];
            if (currentCustomer && currentCustomer.phone) cartsByPhone[currentCustomer.phone] = [];
            cartsByPhone['guest'] = [];
            localStorage.setItem('mairua_cartsByPhone', JSON.stringify(cartsByPhone));
            localStorage.setItem('mairua_cart', JSON.stringify([]));
            sessionStorage.setItem('mairua_cart', JSON.stringify([]));

            if (currentCustomer && currentCustomer.phone && !currentCustomer.isAdmin) {
                fetch('/api/cart/' + encodeURIComponent(currentCustomer.phone), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ cart: [] })
                }).catch(() => {});
            }
            capNhatGioHang();

            // 2. Hiện POPUP thông báo đặt hàng thành công cực rõ ràng
            alert(`🎉 ĐẶT HÀNG THÀNH CÔNG!\n\n📦 Mã đơn hàng: ${newOrder.orderCode}\n👤 Khách hàng: ${newOrder.name}\n💰 Tổng thanh toán: ${newOrder.finalTotal.toLocaleString('vi-VN')}đ\n\n✅ Đơn hàng đã được lưu và gửi đến xưởng Mairua Hoops!\nGiỏ hàng của bạn đã được dọn trống.`);

            if (firstCartItem) hienPopupDonAoFomo(name, phone, addr, firstCartItem.name, "Đơn mới", firstCartItem.img || "", firstCartItem.qty);
            if (appliedCoupon) {
                guiDuLieuGoogleSheets('useCoupon', {
                    code: appliedCoupon.code,
                    phone: newOrder.phone
                });
            }
            appliedCoupon = null;
            if (chkNeedInv) chkNeedInv.checked = false;
            batTatFormHoaDonGioHang();
            let chkCoin = document.getElementById('chkUseMCoin');
            if (chkCoin) chkCoin.checked = false;
            document.getElementById('couponInputCode').value = '';
            document.getElementById('couponStatusMsg').innerText = '';
            capNhatGioHang();
            capNhatHeaderTaiKhoan();

            let newRealIdx = remoteOrdersList.length - 1;
            moTabTaiKhoan('orders');
            xemChiTietDonTaiKhoan(newRealIdx);
            let tierAfter = layThongTinHangThanhVien(currentCustomer.phone);
            let tierUpgradeNote = tierAfter.tierKey !== tierBefore.tierKey ? `\n🏆 Chúc mừng bạn đã thăng hạng lên ${tierAfter.tierName} (Hoàn ${tierAfter.ratePercent}% M-Coin cho các đơn tiếp theo)!` : '';
            let stockSummary = deductedVariants.map(dv => { let p = products.find(x => x.id === dv.prodId); let v = p && p.variants[dv.vIdx]; return p && v ? `\n• Đã trừ kho: -${dv.qty} ${p.name} (${v.colorName}) → Tồn còn: ${v.stock}` : ''; }).join('');
            alert(`🎉 Đặt đơn ${orderCode} thành công!\n• Trạng thái hiện tại: Chờ xác nhận (Vui lòng đợi shop duyệt đơn)${stockSummary}\n• Hoàn +${earnedMCoin.toLocaleString('vi-VN')} M-Coin (${tierBefore.ratePercent}% theo ${tierBefore.tierName})\n• Tặng +1 Token AI${tierUpgradeNote}`);
        }

        let uploadedFileObj = null, uploadedBase64Data = null, uploadedMimeType = "image/jpeg";
        function xuLyTaiAnh(event) {
            const file = event.target.files[0];
            if (!file) return;
            uploadedFileObj = file; uploadedMimeType = file.type;
            const reader = new FileReader();
            reader.onload = function(e) {
                uploadedBase64Data = e.target.result.split(',')[1];
                document.getElementById('aiPlaceholder').style.display = 'none';
                document.getElementById('tryOnCanvasWrap').style.display = 'flex';
                document.getElementById('mergedResultImg').src = e.target.result;
            };
            reader.readAsDataURL(file);
        }

        const productImagesMap = {
            'v1_trang': 'https://tse3.mm.bing.net/th/id/OIP.KAJ_f9qd6ZGbo6KwGWC8lQHaGg?r=0&rs=1&pid=ImgDetMain&o=7&rm=3',
            'v2_xanh': 'https://m.media-amazon.com/images/I/81tqai0YQeL._AC_UY1000_.jpg',
            'utility_reu': 'https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/46dc627a-1b91-4ec9-a0a1-f007feba4a46/NK+UTILITY+ELITE+BKPK+-+2.0.png',
            'lakers': 'https://interdeportivo.com/cdn/shop/files/JerseyNikeLosAngelesLakersIconEdition_1_-PaginaWEB.png?v=1779056525&width=1024',
            'warriors_xanh': 'https://i.pinimg.com/736x/de/27/55/de2755cbf2e5392870db49b07efa5011.jpg',
            'bulls': 'https://tse4.mm.bing.net/th/id/OIP.6-RiWcKD1bUfc75viJksuQHaHa?r=0&rs=1&pid=ImgDetMain&o=7&rm=3'
        };

        function gopAnhTuDong() {
            if (!uploadedFileObj) return;
            let productImgSrc = productImagesMap[document.getElementById('aiProductSelect').value];
            let reader = new FileReader();
            reader.onload = function(event) {
                let userImg = new Image();
                userImg.onload = function() {
                    let productImg = new Image();
                    productImg.crossOrigin = "anonymous";
                    productImg.onload = function() {
                        let canvas = document.getElementById('mergeCanvas');
                        let ctx = canvas.getContext('2d');
                        canvas.width = userImg.width; canvas.height = userImg.height;
                        ctx.drawImage(userImg, 0, 0);
                        let pWidth = userImg.width * 0.35;
                        let pHeight = (productImg.height / productImg.width) * pWidth;
                        ctx.drawImage(productImg, (userImg.width - pWidth) / 2, userImg.height * 0.48, pWidth, pHeight);
                        document.getElementById('mergedResultImg').src = canvas.toDataURL('image/jpeg');
                    };
                    productImg.src = productImgSrc;
                };
                userImg.src = event.target.result;
            };
            reader.readAsDataURL(uploadedFileObj);
        }

        async function chayAIPhanTichGopAnh() {
            if (!uploadedBase64Data) { alert("⚠️ Vui lòng tải ảnh chân dung lên trước!"); return; }
            if (currentCustomer.tokens <= 0) { alert("⚠️ Bạn đã dùng hết Token AI!"); return; }
            currentCustomer.tokens--;
            capNhatHeaderTaiKhoan();
            gopAnhTuDong();
            const outBox = document.getElementById('aiAnalysisText');
            outBox.innerHTML = "⏳ <b>Gemini AI Stylist đang phân tích vóc dáng...</b>";
            try {
                const response = await fetch('/api/ai/try-on', {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        userPhotoBase64: uploadedBase64Data,
                        productName: "Áo bóng rổ Mairua Custom",
                        promptExtra: "Nhận xét ngắn gọn 3 câu về vóc dáng khi phối đồ bóng rổ"
                    })
                });
                const resData = await response.json();
                const adviceText = resData.advice || (resData.candidates && resData.candidates[0].content.parts[0].text) || 'Stylist AI đã phân tích xong!';
                outBox.innerHTML = `✨ <b>Gemini AI Stylist:</b><br>${adviceText.replace(/\n/g, '<br>')}`;
            } catch (err) {
                outBox.innerHTML = `✨ <b>Gộp ảnh thành công!</b> Phong cách bóng rổ rất năng động!`;
            }
        }

        let currentOpenedInvoiceCode = '';

        function batTatFormHoaDonGioHang() {
            let chk = document.getElementById('chkNeedInvoice');
            let wrap = document.getElementById('invoiceInputFieldsWrap');
            if (wrap) wrap.style.display = (chk && chk.checked) ? 'block' : 'none';
        }

        function taoVachBarcodeSvg(str) {
            let bars = '';
            let x = 12;
            for (let i = 0; i < str.length; i++) {
                let code = str.charCodeAt(i);
                let w1 = (code % 3) + 1;
                let w2 = ((code * 2) % 3) + 1;
                bars += `<rect x="${x}" y="3" width="${w1}" height="32" fill="#111"/>`;
                x += w1 + 1.5;
                bars += `<rect x="${x}" y="3" width="${w2}" height="32" fill="#111"/>`;
                x += w2 + 2;
                if (x > 200) break;
            }
            return bars;
        }

        function saoChepMaTraCuuHoaDon() {
            let ordCode = currentOpenedInvoiceCode || 'MAIRUA-BILL';
            navigator.clipboard.writeText(ordCode).then(() => {
                alert(`📋 Đã sao chép mã tra cứu hóa đơn: ${ordCode}`);
            }).catch(() => {
                alert(`Mã tra cứu hóa đơn: ${ordCode}`);
            });
        }

        function inHoaDonDienTu() {
            window.print();
        }

        function moModalHoaDonDienTu(realOrderIndex) {
            let ord = remoteOrdersList[realOrderIndex];
            if (!ord) return;
            let container = document.getElementById('eInvoicePrintableArea');
            if (!container) return;

            let orderCode = ord.orderCode || `MVP${12200 + realOrderIndex}`;
            let d = new Date(ord.startTime || Date.now());
            let dateStr = `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')} ngày ${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
            let subtotal = ord.subtotal || ord.finalTotal || 0;
            let finalTotal = ord.finalTotal || subtotal;
            let discountAmt = ord.discountAmt || 0;
            let usedMCoin = ord.usedMCoin || 0;
            let shippingFee = (typeof ord.shippingFee === 'number') ? ord.shippingFee : 30000;

            let itemsRowsHtml = '';
            if (Array.isArray(ord.cartSnapshot) && ord.cartSnapshot.length > 0) {
                itemsRowsHtml = ord.cartSnapshot.map((item, idx) => {
                    // Giá đơn vị đúng của sản phẩm (không chia đều từ tổng tiền sau giảm)
                    let uPrice = Number(item.price) || 0;
                    if (!uPrice && Array.isArray(ord.itemsList) && ord.itemsList[idx]) {
                        let m = String(ord.itemsList[idx]).match(/-\s*([\d.,]+)\s*đ\s*$/);
                        if (m) uPrice = Math.round((parseInt(m[1].replace(/[^\d]/g, ''), 10) || 0) / (item.qty || 1));
                    }
                    if (!uPrice) {
                        let found = timSanPhamVaVariantTuCartItem(item);
                        if (found.prod) {
                            let vp = found.variant && found.variant.price;
                            uPrice = Number(vp) || Number(found.prod.price) || Number(found.prod.basePrice) || 0;
                        }
                    }
                    let lineTotal = uPrice * item.qty;
                    return `
                        <tr>
                            <td style="width:24px; color:#666;">${idx+1}.</td>
                            <td>
                                <b>${item.name}</b>
                                ${item.subInfo ? `<div style="font-size:11.5px; color:#666;">Phân loại: ${item.subInfo}</div>` : ''}
                            </td>
                            <td style="text-align:center; font-weight:600;">${item.qty}</td>
                            <td style="text-align:right;">${uPrice.toLocaleString('vi-VN')}</td>
                            <td style="text-align:right; font-weight:700;">${lineTotal.toLocaleString('vi-VN')}</td>
                        </tr>`;
                }).join('');
            } else if (Array.isArray(ord.itemsList)) {
                itemsRowsHtml = ord.itemsList.map((line, idx) => {
                    let cleaned = line.replace(/^[•\s]+/, '');
                    return `
                        <tr>
                            <td style="width:24px; color:#666;">${idx+1}.</td>
                            <td colspan="4"><b>${cleaned}</b></td>
                        </tr>`;
                }).join('');
            }

            let customerName = (ord.invoiceInfo && ord.invoiceInfo.taxName) || ord.name || 'Khách lẻ';
            let customerTax = (ord.invoiceInfo && ord.invoiceInfo.taxCode) ? ord.invoiceInfo.taxCode : null;
            let customerEmail = (ord.invoiceInfo && ord.invoiceInfo.email) || '';
            let trackingCode = `MAIRUA-${orderCode}-${(ord.startTime || Date.now()).toString().slice(-6)}`;
            currentOpenedInvoiceCode = trackingCode;

            container.innerHTML = `
                <div class="thermal-receipt" id="thermalReceiptBox">
                    <div style="text-align:center; margin-bottom:12px;">
                        <div style="font-family:'Bebas Neue','Oswald',sans-serif; font-size:26px; letter-spacing:1px; color:#111;">🏀 MAIRUA BASKETBALL STORE</div>
                        <div style="font-size:11.5px; color:#555; text-transform:uppercase; font-weight:600; margin-top:2px;">HỆ THỐNG TRANG THIẾT BỊ BÓNG RỔ CHUYÊN NGHIỆP</div>
                        <div style="font-size:11.5px; color:#666; margin-top:4px;">12 Lê Lợi, Phường Võ Thị Sáu, Quận 3, TP. Hồ Chí Minh</div>
                        <div style="font-size:11.5px; color:#666;">Hotline: 0909.501.753 · MST: 0318956888</div>
                        <div style="font-size:11.5px; color:#666;">Website: https://mairua.com</div>
                    </div>

                    <div class="receipt-dashed-line"></div>

                    <div style="text-align:center; margin:10px 0;">
                        <b style="font-size:16px; text-transform:uppercase; letter-spacing:0.5px;">HÓA ĐƠN BÁN LẺ ĐIỆN TỬ</b>
                        <div style="font-size:11px; color:#666; margin-top:2px;">(Electronic Sales Invoice / Retail Receipt)</div>
                    </div>

                    <div style="font-size:12px; line-height:1.6; margin-bottom:8px;">
                        <div><b>Số HĐ:</b> <span style="font-weight:700; color:#ff5500;">HD-${orderCode}</span> · <b>Ngày:</b> ${dateStr}</div>
                        <div><b>Khách hàng:</b> ${customerName}</div>
                        <div><b>Số ĐT:</b> ${ord.phone || ''}</div>
                        ${customerTax ? `<div><b>Mã số thuế:</b> ${customerTax}</div>` : ''}
                        ${customerEmail ? `<div><b>Email nhận bill:</b> ${customerEmail}</div>` : ''}
                        <div><b>Địa chỉ giao:</b> ${ord.addr || ''}</div>
                        <div><b>Hình thức:</b> ${ord.hasCustomJersey ? 'Thanh toán online 100% (Hàng In Custom)' : 'COD / Thanh toán khi nhận hàng'}</div>
                    </div>

                    <div class="receipt-dashed-line"></div>

                    <table class="receipt-table">
                        <thead>
                            <tr>
                                <th style="width:24px;">#</th>
                                <th>Mặt hàng</th>
                                <th style="text-align:center; width:36px;">SL</th>
                                <th style="text-align:right; width:65px;">Đ.Giá</th>
                                <th style="text-align:right; width:80px;">T.Tiền</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsRowsHtml}
                        </tbody>
                    </table>

                    <div class="receipt-dashed-line"></div>

                    <div style="font-size:12.5px; line-height:1.8;">
                        <div style="display:flex; justify-content:space-between;"><span>Tạm tính tiền hàng:</span><span>${subtotal.toLocaleString('vi-VN')}đ</span></div>
                        ${discountAmt > 0 ? `<div style="display:flex; justify-content:space-between; color:#16a34a;"><span>Chiết khấu (Voucher/Roster):</span><span>-${discountAmt.toLocaleString('vi-VN')}đ</span></div>` : ''}
                        ${usedMCoin > 0 ? `<div style="display:flex; justify-content:space-between; color:#16a34a;"><span>Khấu trừ M-Coin:</span><span>-${usedMCoin.toLocaleString('vi-VN')}đ</span></div>` : ''}
                        <div style="display:flex; justify-content:space-between;"><span>Phí vận chuyển:</span><span>${shippingFee.toLocaleString('vi-VN')}đ</span></div>
                    </div>

                    <div class="receipt-double-line"></div>

                    <div style="display:flex; justify-content:space-between; align-items:baseline; font-size:14.5px; font-weight:800;">
                        <span>TỔNG THANH TOÁN (ĐÃ VAT):</span>
                        <span style="font-size:18px; color:#111;">${finalTotal.toLocaleString('vi-VN')}đ</span>
                    </div>
                    ${ord.earnedMCoin ? `<div style="font-size:11.5px; color:#15803d; margin-top:3px;">⭐ Tích lũy đơn này: <b>+${ord.earnedMCoin.toLocaleString('vi-VN')} M-Coin</b></div>` : ''}

                    <div class="receipt-dashed-line"></div>

                    <div class="receipt-barcode-wrap">
                        <svg width="220" height="40" viewBox="0 0 220 40" xmlns="http://www.w3.org/2000/svg">
                            <rect x="0" y="0" width="220" height="40" fill="#fff"/>
                            ${taoVachBarcodeSvg(trackingCode)}
                        </svg>
                        <div style="font-size:11px; letter-spacing:1px; margin-top:3px; color:#333;">${trackingCode}</div>
                    </div>

                    <div style="text-align:center; font-size:11px; color:#555; line-height:1.5; margin-top:10px;">
                        *** CẢM ƠN QUÝ KHÁCH ĐÃ MUA SẮM TẠI MAIRUA.COM ***<br>
                        <i>Hóa đơn điện tử có giá trị tra cứu bảo hành & đổi size trong 7 ngày.<br>
                        Mọi thắc mắc xin liên hệ Hotline: 0909.501.753</i>
                    </div>
                </div>`;

            moModal('eInvoiceModal');
        }

        // ================= HỆ THỐNG AI NHẬP HÀNG TỰ ĐỘNG BẰNG CÂU LỆNH TỰ NHIÊN =================
        function setVaChayAiRestock(cmd) {
            let input = document.getElementById('aiRestockInput');
            if (input) input.value = cmd;
            thucHienAINhapHang();
        }

        function checkMauSacPhuHop(cmdNorm, colorNorm) {
            let colorKeywords = ['do', 'xanh', 'den', 'trang', 'vang', 'cam', 'tim', 'reu', 'bac', 'khoi', 'hong', 'luc', 'navy', 'lech', 'dai', 'ngan'];
            let matchedColorInCmd = colorKeywords.filter(k => cmdNorm.includes(k));
            if (matchedColorInCmd.length === 0) return true;
            return matchedColorInCmd.some(k => colorNorm.includes(k));
        }

        function xuLyLenhAINhapHang(rawCmd) {
            if (!rawCmd || !rawCmd.trim()) return { success: false, msg: "Vui lòng nhập câu lệnh nhập hàng!" };
            let raw = rawCmd.trim();
            let norm = boDauTiengViet(raw).toLowerCase();

            // Trích xuất số lượng (mặc định 10 nếu không chỉ định)
            let qty = 10;
            let sanitizedForNumber = norm.replace(/\b(v1|v2|v3|v4|size\s*7|size\s*6|size\s*5|2xl|3xl)\b/gi, '');
            let numMatch = sanitizedForNumber.match(/(\d+)\s*(cai|chiec|qua|trai|doi|sp)?/i);
            if (numMatch) {
                let parsed = parseInt(numMatch[1], 10);
                if (parsed > 0 && parsed <= 500) qty = parsed;
            }

            let matchedVariants = [];

            // Phôi áo
            if (norm.includes('phoi ao') || norm.includes('phoi')) {
                let p = products.find(x => x.id === 22);
                if (p) {
                    p.variants.forEach((v, vIdx) => {
                        let cNorm = boDauTiengViet(v.colorName).toLowerCase();
                        if (checkMauSacPhuHop(norm, cNorm)) {
                            matchedVariants.push({ prod: p, vIdx, v, addQty: qty });
                        }
                    });
                }
            }
            // Balo
            else if (norm.includes('balo') || norm.includes('ba lo') || norm.includes('backpack') || norm.includes('v1') || norm.includes('v2') || norm.includes('v3') || norm.includes('utility')) {
                let targetIds = [];
                if (norm.includes('v1')) targetIds = [1];
                else if (norm.includes('v2')) targetIds = [2];
                else if (norm.includes('v3')) targetIds = [3];
                else if (norm.includes('utility') || norm.includes('v4')) targetIds = [4];
                else targetIds = [1, 2, 3, 4];

                targetIds.forEach(pId => {
                    let p = products.find(x => x.id === pId);
                    if (p) {
                        p.variants.forEach((v, vIdx) => {
                            let cNorm = boDauTiengViet(v.colorName).toLowerCase();
                            if (checkMauSacPhuHop(norm, cNorm)) {
                                matchedVariants.push({ prod: p, vIdx, v, addQty: qty });
                            }
                        });
                    }
                });
            }
            // Bóng / Banh
            else if (norm.includes('all bong') || norm.includes('tat ca bong') || norm.includes('bong') || norm.includes('banh') || norm.includes('molten') || norm.includes('ak pro') || norm.includes('stepback') || norm.includes('size 7')) {
                let ballIds = [5, 6, 7, 8, 9, 10];
                ballIds.forEach(pId => {
                    let p = products.find(x => x.id === pId);
                    if (p) {
                        p.variants.forEach((v, vIdx) => {
                            matchedVariants.push({ prod: p, vIdx, v, addQty: qty });
                        });
                    }
                });
            }
            // Quần combat & Quần họa tiết
            else if (norm.includes('quan combat') || norm.includes('do combat') || norm.includes('combat') || norm.includes('soi hoang') || norm.includes('chua son lam') || norm.includes('hoa hong') || norm.includes('trai dua') || norm.includes('cherry') || norm.includes('xieng xich')) {
                let combatIds = [21, 29, 30, 31, 32, 33, 34];
                combatIds.forEach(pId => {
                    let p = products.find(x => x.id === pId);
                    if (p) {
                        let pNameNorm = boDauTiengViet(p.name).toLowerCase();
                        let matchSpecificName = true;
                        if (norm.includes('chua son lam') && !pNameNorm.includes('chua son lam')) matchSpecificName = false;
                        if (norm.includes('soi hoang') && !pNameNorm.includes('soi hoang')) matchSpecificName = false;
                        if (norm.includes('hoa hong') && !pNameNorm.includes('hoa hong')) matchSpecificName = false;
                        if (norm.includes('dua') && !pNameNorm.includes('dua')) matchSpecificName = false;
                        if (norm.includes('cherry') && !pNameNorm.includes('cherry')) matchSpecificName = false;
                        if (norm.includes('xieng xich') && !pNameNorm.includes('xieng xich')) matchSpecificName = false;
                        if (norm.includes('pro') && !pNameNorm.includes('pro')) matchSpecificName = false;

                        if (matchSpecificName) {
                            p.variants.forEach((v, vIdx) => {
                                let cNorm = boDauTiengViet(v.colorName).toLowerCase();
                                if (checkMauSacPhuHop(norm, cNorm)) {
                                    matchedVariants.push({ prod: p, vIdx, v, addQty: qty });
                                }
                            });
                        }
                    }
                });
            }
            // Quần bóng rổ (không phải combat)
            else if (norm.includes('quan bong ro') || (norm.includes('quan') && !norm.includes('combat'))) {
                let shortsIds = [23, 24, 25, 26, 27, 28];
                shortsIds.forEach(pId => {
                    let p = products.find(x => x.id === pId);
                    if (p) {
                        p.variants.forEach((v, vIdx) => {
                            let cNorm = boDauTiengViet(v.colorName).toLowerCase();
                            if (checkMauSacPhuHop(norm, cNorm)) {
                                matchedVariants.push({ prod: p, vIdx, v, addQty: qty });
                            }
                        });
                    }
                });
            }
            // Áo đấu Jersey
            else if (norm.includes('ao') && !norm.includes('combat') && !norm.includes('phoi')) {
                let jerseyIds = [14, 15, 16, 17, 18];
                jerseyIds.forEach(pId => {
                    let p = products.find(x => x.id === pId);
                    if (p) {
                        let pNameNorm = boDauTiengViet(p.name).toLowerCase();
                        let matchSpecific = true;
                        if (norm.includes('lakers') && !pNameNorm.includes('lakers')) matchSpecific = false;
                        if (norm.includes('bulls') && !pNameNorm.includes('bulls')) matchSpecific = false;
                        if (norm.includes('warriors') && !pNameNorm.includes('warriors')) matchSpecific = false;
                        if (norm.includes('nyc') && !pNameNorm.includes('nyc') && !pNameNorm.includes('new york')) matchSpecific = false;
                        if (norm.includes('viet nam') && !pNameNorm.includes('viet nam')) matchSpecific = false;

                        if (matchSpecific) {
                            p.variants.forEach((v, vIdx) => {
                                let cNorm = boDauTiengViet(v.colorName).toLowerCase();
                                if (checkMauSacPhuHop(norm, cNorm)) {
                                    matchedVariants.push({ prod: p, vIdx, v, addQty: qty });
                                }
                            });
                        }
                    }
                });
            }
            // Bó gối
            else if (norm.includes('bo goi') || norm.includes('goi')) {
                [35, 36].forEach(pId => {
                    let p = products.find(x => x.id === pId);
                    if (p) {
                        p.variants.forEach((v, vIdx) => {
                            let cNorm = boDauTiengViet(v.colorName).toLowerCase();
                            if (checkMauSacPhuHop(norm, cNorm)) {
                                matchedVariants.push({ prod: p, vIdx, v, addQty: qty });
                            }
                        });
                    }
                });
            }
            // Băng cổ chân
            else if (norm.includes('co chan') || norm.includes('bang co chan')) {
                let p = products.find(x => x.id === 37);
                if (p) {
                    p.variants.forEach((v, vIdx) => {
                        matchedVariants.push({ prod: p, vIdx, v, addQty: qty });
                    });
                }
            }
            // Vớ
            else if (norm.includes('vo') || norm.includes('tat')) {
                [11, 12, 13].forEach(pId => {
                    let p = products.find(x => x.id === pId);
                    if (p) {
                        p.variants.forEach((v, vIdx) => {
                            let cNorm = boDauTiengViet(v.colorName).toLowerCase();
                            if (checkMauSacPhuHop(norm, cNorm)) {
                                matchedVariants.push({ prod: p, vIdx, v, addQty: qty });
                            }
                        });
                    }
                });
            }
            // Fallback tìm kiếm chung theo từ khóa
            else {
                products.forEach(p => {
                    let pNameNorm = boDauTiengViet(p.name).toLowerCase();
                    if (pNameNorm.includes(norm) || norm.includes(pNameNorm)) {
                        p.variants.forEach((v, vIdx) => {
                            matchedVariants.push({ prod: p, vIdx, v, addQty: qty });
                        });
                    }
                });
            }

            if (matchedVariants.length === 0) {
                return {
                    success: false,
                    msg: `AI chưa nhận diện được sản phẩm phù hợp cho lệnh "${rawCmd}". Hãy thử: "balo v1", "quần combat", "all bóng 15", "phôi áo", "bó gối"...`
                };
            }

            let resolvedLowStockAlerts = [];
            let detailLogs = [];

            matchedVariants.forEach(item => {
                let oldStk = item.v.stock;
                item.v.stock += item.addQty;
                let newStk = item.v.stock;
                if (oldStk <= 5 && newStk > 5) {
                    resolvedLowStockAlerts.push(`${item.prod.name} (${item.v.colorName}: ${oldStk} → ${newStk} cái)`);
                }
                detailLogs.push({
                    name: item.prod.name,
                    color: item.v.colorName,
                    added: item.addQty,
                    oldStock: oldStk,
                    newStock: newStk
                });
            });

            // Đồng bộ dữ liệu & XÓA CẢNH BÁO TỒN KHO <= 5 KHI ĐÃ NHẬP
            capNhatTongStockVaSoldSanPham();
            localStorage.setItem('mairua_products', JSON.stringify(products));
            luuDuLieuLenDamMay();
            renderGiaoDienChuong();
            renderAdminDashboard();

            return {
                success: true,
                totalVariants: matchedVariants.length,
                addedQtyPerItem: qty,
                resolvedLowStockAlerts,
                detailLogs
            };
        }

        function thucHienAINhapHang() {
            let input = document.getElementById('aiRestockInput');
            let resBox = document.getElementById('aiRestockResultBox');
            if (!input || !resBox) return;
            let cmd = input.value.trim();
            if (!cmd) {
                alert("⚠️ Vui lòng nhập câu lệnh để AI xử lý!");
                return;
            }

            let result = xuLyLenhAINhapHang(cmd);
            resBox.style.display = 'block';

            if (!result.success) {
                resBox.style.background = '#fef2f2';
                resBox.style.border = '1.5px solid #f87171';
                resBox.style.color = '#991b1b';
                resBox.innerHTML = `❌ <b>Không thành công:</b> ${result.msg}`;
                return;
            }

            let resolvedHtml = '';
            if (result.resolvedLowStockAlerts && result.resolvedLowStockAlerts.length > 0) {
                resolvedHtml = `
                    <div style="margin-top:8px; padding:8px 12px; background:#f0fdf4; border:1px solid #86efac; border-radius:6px; color:#166534; font-size:12.5px;">
                        <b>🧹 Đã tự động xóa ${result.resolvedLowStockAlerts.length} cảnh báo tồn kho sắp hết (≤ 5 cái):</b><br>
                        ${result.resolvedLowStockAlerts.map(t => `• ${t}`).join('<br>')}
                    </div>`;
            }

            let previewItems = result.detailLogs.slice(0, 6).map(d => `• <b>${d.name}</b> (${d.color}): +${d.added} cái → Tồn mới: <b>${d.newStock}</b>`).join('<br>');
            if (result.detailLogs.length > 6) {
                previewItems += `<br><i>...và ${result.detailLogs.length - 6} phân loại khác nữa.</i>`;
            }

            resBox.style.background = '#f5f3ff';
            resBox.style.border = '1.5px solid #c4b5fd';
            resBox.style.color = '#5b21b6';
            resBox.innerHTML = `
                <div style="font-weight:800; font-size:14px; margin-bottom:4px;">🚀 AI ĐÃ NHẬP KHO THÀNH CÔNG CHO LỆNH: "${cmd}"</div>
                <div>Đã cộng thêm <b>+${result.addedQtyPerItem} cái</b> cho tổng cộng <b>${result.totalVariants} phân loại sản phẩm</b>.</div>
                <div style="margin-top:6px; font-size:12.5px; color:#374151;">${previewItems}</div>
                ${resolvedHtml}
            `;
            input.value = '';
        }

        // ================= HỆ THỐNG AI CHATBOT TƯ VẤN THÔNG MINH & LÊN COMBO =================
        function sinhPhanHoiAITuVanThongMinh(rawQ) {
            let q = boDauTiengViet(rawQ).toLowerCase();

            // 1. COMBO THEO NGÂN SÁCH (1TR, 500K, 1TR5, 2TR...)
            let isCombo = q.includes('combo') || q.includes('set do') || q.includes('set') || q.includes('phoi do') || q.includes('1tr') || q.includes('1 trieu') || q.includes('trieu') || q.includes('1000k') || q.includes('500k') || q.includes('700k');

            if (isCombo) {
                return `
                    <div style="line-height:1.6;">
                        <div style="font-size:15px; font-weight:800; color:#ea580c; margin-bottom:6px;">🎯 ĐỀ XUẤT 3 COMBO BÓNG RỔ CHUYÊN NGHIỆP TẦM 1 TRIỆU:</div>
                        <p style="font-size:13px; color:#4b5563; margin-bottom:10px;">Ngân sách <b>1.000.000đ</b> là mức chi tiêu cực kỳ tối ưu tại Mairua.com để bạn sở hữu trọn bộ thi đấu từ áo đấu, quần, đồ combat trợ lực đến phụ kiện bảo hộ khớp gối và vớ chống trượt:</p>

                        <div style="background:#fff; border:1.5px solid #fed7aa; border-radius:10px; padding:12px; margin-bottom:10px; box-shadow:0 2px 8px rgba(0,0,0,0.04);">
                            <div style="font-weight:800; color:#ea580c; font-size:14px; margin-bottom:4px;">🔥 COMBO 1: "CHIẾN BINH NBA STREETBALL" — 995.000đ</div>
                            <ul style="margin:6px 0 8px 18px; font-size:12.5px; color:#374151;">
                                <li>🎽 <b>Áo Jersey Chicago Bulls Retro Red</b>: 225.000đ</li>
                                <li>🩳 <b>Quần Bóng Rổ Chicago Bulls Classic Red</b>: 205.000đ</li>
                                <li>🛡️ <b>Quần Combat Pro (Lệch Ống / Dài Đen)</b>: 195.000đ</li>
                                <li>🦵 <b>Bó gối thể thao có đệm Redikick</b>: 220.000đ</li>
                                <li>🧦 <b>Vớ Chống Trượt Nike Elite Crew Trắng</b>: 150.000đ</li>
                            </ul>
                            <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px dashed #fdba74; padding-top:6px; font-size:12px; flex-wrap:wrap; gap:6px;">
                                <span>Tổng cộng: <b style="color:#ea580c; font-size:14px;">995.000đ</b></span>
                                <button type="button" class="btn-submit" style="width:auto; padding:4px 12px; font-size:11.5px; background:#ea580c; margin:0;" onclick="chuyenTab('ao')">Xem Áo & Quần Bulls →</button>
                            </div>
                        </div>

                        <div style="background:#fff; border:1.5px solid #cbd5e1; border-radius:10px; padding:12px; margin-bottom:10px; box-shadow:0 2px 8px rgba(0,0,0,0.04);">
                            <div style="font-weight:800; color:#2563eb; font-size:14px; margin-bottom:4px;">⚡ COMBO 2: "COMBAT PRO & HỌA TIẾT ĐỘC QUYỀN" — 980.000đ</div>
                            <ul style="margin:6px 0 8px 18px; font-size:12.5px; color:#374151;">
                                <li>🎽 <b>Áo Combat Ba Lỗ Chuyên Dụng Đen</b>: 165.000đ</li>
                                <li>🩳 <b>Quần Bóng Rổ Swingman USA Olympic 2024</b>: 210.000đ</li>
                                <li>🐅 <b>Quần Combat Họa Tiết "Chúa Sơn Lâm" / "Sói Hoang"</b>: 190.000đ</li>
                                <li>🦵 <b>Bó gối giảm chấn công thái học</b>: 240.000đ</li>
                                <li>🦶 <b>Băng quấn cổ chân chống lật sơ mi</b>: 175.000đ</li>
                            </ul>
                            <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px dashed #cbd5e1; padding-top:6px; font-size:12px; flex-wrap:wrap; gap:6px;">
                                <span>Tổng cộng: <b style="color:#2563eb; font-size:14px;">980.000đ</b></span>
                                <button type="button" class="btn-submit" style="width:auto; padding:4px 12px; font-size:11.5px; background:#2563eb; margin:0;" onclick="chuyenTab('combat')">Xem Đồ Combat →</button>
                            </div>
                        </div>

                        <div style="background:#fff; border:1.5px solid #cbd5e1; border-radius:10px; padding:12px; margin-bottom:10px; box-shadow:0 2px 8px rgba(0,0,0,0.04);">
                            <div style="font-weight:800; color:#15803d; font-size:14px; margin-bottom:4px;">🏀 COMBO 3: "SÀN ĐẤU TOÀN DIỆN KÈM BÓNG" — 1.040.000đ</div>
                            <ul style="margin:6px 0 8px 18px; font-size:12.5px; color:#374151;">
                                <li>🏀 <b>Bóng Rổ Molten B7G4500 Da PU Tổng Hợp</b>: 620.000đ</li>
                                <li>🎽 <b>Áo Jersey Los Angeles Lakers Vàng</b>: 225.000đ</li>
                                <li>🛡️ <b>Quần Combat Bóng Rổ Pro Ngắn</b>: 195.000đ</li>
                            </ul>
                            <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px dashed #cbd5e1; padding-top:6px; font-size:12px; flex-wrap:wrap; gap:6px;">
                                <span>Tổng cộng: <b style="color:#15803d; font-size:14px;">1.040.000đ</b></span>
                                <button type="button" class="btn-submit" style="width:auto; padding:4px 12px; font-size:11.5px; background:#15803d; margin:0;" onclick="chuyenTab('bong')">Xem Bóng Molten →</button>
                            </div>
                        </div>

                        <p style="font-size:12px; color:#6b7280; margin-top:6px;">💡 <i>Bạn hãy nhắn thêm Chiều cao / Cân nặng (VD: 1m70, 65kg) để mình tư vấn size S, M, L chuẩn xác nhất nhé!</i></p>
                    </div>`;
            }

            // 2. TƯ VẤN BÓNG RỔ / BANH
            if (q.includes('bong') || q.includes('banh') || q.includes('molten') || q.includes('ak pro') || q.includes('stepback')) {
                return `
                    <div style="line-height:1.6;">
                        <div style="font-size:14.5px; font-weight:800; color:#ea580c; margin-bottom:6px;">🏀 TƯ VẤN CHỌN BÓNG RỔ THEO MẶT SÂN & NHU CẦU:</div>
                        <div style="font-size:12.8px; color:#374151;">
                            <p><b>1. Sân trong nhà (Sàn gỗ thi đấu / Indoor):</b></p>
                            <div style="padding-left:12px; margin-bottom:6px;">
                                • <b>Molten GG7X</b> (680.000đ): Da PU cao cấp, bám tay tối đa, chuẩn thi đấu FIBA.<br>
                                • <b>Molten B7G4500</b> (620.000đ): Bản nâng cấp thế hệ mới, kiểm soát nhồi bóng cực êm.
                            </div>
                            <p><b>2. Sân ngoài trời (Bê tông, xi măng, sân trường / Outdoor):</b></p>
                            <div style="padding-left:12px; margin-bottom:6px;">
                                • <b>AK Pro Outdoor Chống Mài Mòn</b> (450.000đ) & <b>AK Pro Thi Đấu</b> (520.000đ): Gai bám sâu, rãnh rộng, độ bền siêu khủng.<br>
                                • <b>Stepback Street Outdoor</b> (490.000đ): Thiết kế đường phố trẻ trung, nảy chuẩn.
                            </div>
                            <p><b>3. Quy chuẩn kích thước (Size):</b></p>
                            <div style="padding-left:12px; margin-bottom:8px;">
                                • <b>Size 7</b> (~600g, 75-76cm): Dành cho Nam từ 14 tuổi trở lên (Tiêu chuẩn VBA/NBA).<br>
                                • <b>Size 6</b>: Dành cho Nữ và thiếu niên 11-14 tuổi.<br>
                                • <b>Size 5</b>: Dành cho trẻ em dưới 11 tuổi.
                            </div>
                        </div>
                        <button type="button" class="btn-submit" style="width:auto; padding:6px 14px; font-size:12px; background:#ea580c; margin-top:4px;" onclick="chuyenTab('bong')">🏀 Đi tới danh mục Bóng Rổ →</button>
                    </div>`;
            }

            // 3. TƯ VẤN ĐỒ COMBAT & BẢO HỘ KHỚP
            if (q.includes('combat') || q.includes('bo goi') || q.includes('co chan') || q.includes('bao ho') || q.includes('dem')) {
                return `
                    <div style="line-height:1.6;">
                        <div style="font-size:14.5px; font-weight:800; color:#7c3aed; margin-bottom:6px;">🛡️ TƯ VẤN ĐỒ COMBAT & PHỤ KIỆN BẢO HỘ KHỚP:</div>
                        <div style="font-size:12.8px; color:#374151;">
                            <p><b>1. Quần & Áo Combat (Giữ cơ & chống trầy):</b></p>
                            <div style="padding-left:12px; margin-bottom:6px;">
                                • <b>Quần Combat Pro</b> (195.000đ): Có 3 kiểu ống (Ngắn, Dài, và Lệch 1 bên phong cách NBA), ôm sát bó cơ bắp đùi giúp giảm rung chấn cơ khi bật nhảy.<br>
                                • <b>6 Mẫu Quần Combat Họa Tiết Độc Lạ</b> (185k - 195k): Sói hoang, Chúa sơn lâm, Hoa hồng bốn mùa, Trái dưa, Cherry drip, Xiềng xích đồng tiền.<br>
                                • <b>Áo Combat Ba Lỗ / Ngắn Tay</b> (165k - 180k): Thấm hút mồ hôi siêu tốc, giữ ấm nhóm cơ ngực và vai.
                            </div>
                            <p><b>2. Phụ Kiện Bảo Hộ (Chỉ 3 size S, M, L):</b></p>
                            <div style="padding-left:12px; margin-bottom:8px;">
                                • <b>Bó gối thể thao có đệm Redikick</b> (220.000đ, Đen/Trắng): Đệm EVA dày dặn chống va đập trực diện khi ngã.<br>
                                • <b>Bó gối giảm chấn công thái học</b> (240.000đ): Thiết kế dệt 3D ôm sát, giữ vững xương bánh chè.<br>
                                • <b>Băng quấn cổ chân</b> (175.000đ): Dây siết đan chéo chống lật sơ mi cổ chân khi tiếp đất lệch.
                            </div>
                        </div>
                        <button type="button" class="btn-submit" style="width:auto; padding:6px 14px; font-size:12px; background:#7c3aed; margin-top:4px;" onclick="chuyenTab('combat')">🛡️ Đi tới mục Đồ Combat & Phụ Kiện →</button>
                    </div>`;
            }

            // 4. TƯ VẤN ÁO ĐẤU / PHÔI ÁO / IN ROSTER
            if (q.includes('ao') || q.includes('jersey') || q.includes('phoi') || q.includes('roster') || q.includes('in ten') || q.includes('doi')) {
                return `
                    <div style="line-height:1.6;">
                        <div style="font-size:14.5px; font-weight:800; color:#ea580c; margin-bottom:6px;">🎽 TƯ VẤN ÁO JERSEY THI ĐẤU & THIẾT KẾ TEAMWEAR:</div>
                        <div style="font-size:12.8px; color:#374151;">
                            <p><b>1. Áo Jersey Sẵn (225k - 250k, Size S đến 2XL):</b></p>
                            <div style="padding-left:12px; margin-bottom:6px;">
                                • <b>Lakers Icon Edition</b> (Vàng Gold / Tím Purple): 225.000đ<br>
                                • <b>Chicago Bulls Retro Red</b> (Đỏ Đen huyền thoại): 225.000đ<br>
                                • <b>Warriors City Edition</b> (Xanh / Vàng): 240.000đ<br>
                                • <b>New York City (NYC)</b>: 250.000đ & <b>Đội Tuyển Việt Nam</b>: 230.000đ.
                            </div>
                            <p><b>2. Studio Thiết Kế & In Áo Đội (Roster):</b></p>
                            <div style="padding-left:12px; margin-bottom:8px;">
                                • <b>Phôi Áo Custom</b> (200.000đ; nguyên bộ áo + quần 250.000đ): 6 màu phôi (Tím, Trắng, Đen, Đỏ, Xanh Navy, Xanh lá).<br>
                                • In Tên + Số lưng + Số ngực + Logo Đội với font chuẩn NBA (Bebas Neue, Teko, Anton).<br>
                                • <b>Chiết khấu đặt theo đội:</b> Giảm 5% (5-9 áo), 10% (10-19 áo), 15% (20+ áo).
                            </div>
                        </div>
                        <div style="display:flex; gap:8px; flex-wrap:wrap; margin-top:6px;">
                            <button type="button" class="btn-submit" style="width:auto; padding:6px 14px; font-size:12px; background:#ea580c; margin:0;" onclick="chuyenTab('ao')">🎽 Xem Áo Jersey & Quần →</button>
                            <button type="button" class="btn-submit" style="width:auto; padding:6px 14px; font-size:12px; background:#111; margin:0;" onclick="chuyenTab('customJersey')">✨ Tự Thiết Kế Áo Custom →</button>
                        </div>
                    </div>`;
            }

            // 5. TƯ VẤN BALO NIKE ELITE
            if (q.includes('balo') || q.includes('backpack') || q.includes('elite') || q.includes('utility') || q.includes('giay')) {
                return `
                    <div style="line-height:1.6;">
                        <div style="font-size:14.5px; font-weight:800; color:#2c3e50; margin-bottom:6px;">🎒 TƯ VẤN BALO NIKE ELITE CHUYÊN DỤNG BÓNG RỔ:</div>
                        <div style="font-size:12.8px; color:#374151;">
                            <p>Mọi dòng Balo Nike Elite tại Mairua.com đều có <b>ngăn đựng giày riêng biệt</b> dưới đáy (vừa giày đến size 46 EU) và không gian chứa banh bóng rổ size 7 rộng rãi:</p>
                            <div style="padding-left:12px; margin:6px 0;">
                                • <b>Nike Elite V1</b> (520.000đ): Bản tiêu chuẩn 32L, 3 phối màu (Trắng Đen, Đen Vàng Gold, Đỏ Đen).<br>
                                • <b>Nike Elite V2 Pro</b> (650.000đ): Vải phủ chống nước nhẹ, quai Air Max êm vai.<br>
                                • <b>Nike Elite V3 Ultimate</b> (850.000đ): Dung tích lớn 37L, ngăn đựng phụ kiện công nghệ chống sốc.<br>
                                • <b>Nike Utility Speed Training</b> (890.000đ): Form hộp cứng cáp, mở rộng 180 độ như vali.<br>
                                • <i>Dịch vụ in tên nhiệt độc quyền:</i> Khách có thể in tên mình lên quai/mặt balo chỉ +30.000đ!
                            </div>
                        </div>
                        <div style="display:flex; gap:8px; flex-wrap:wrap; margin-top:6px;">
                            <button type="button" class="btn-submit" style="width:auto; padding:6px 14px; font-size:12px; background:#333; margin:0;" onclick="chuyenTab('balo')">🎒 Xem Tất Cả Balo →</button>
                            <button type="button" class="btn-submit" style="width:auto; padding:6px 14px; font-size:12px; background:#8e44ad; margin:0;" onclick="chuyenTab('customBalo')">✨ In Tên Lên Balo →</button>
                        </div>
                    </div>`;
            }

            // 6. TƯ VẤN SIZE THEO CHIỀU CAO / CÂN NẶNG
            let numMatches = rawQ.match(/(\d+)\s*(m|cm|kg)?/gi);
            if (q.includes('size') || q.includes('chieu cao') || q.includes('can nang') || numMatches) {
                return `
                    <div style="line-height:1.6;">
                        <div style="font-size:14.5px; font-weight:800; color:#ea580c; margin-bottom:6px;">📏 BẢNG TƯ VẤN SIZE CHUẨN FORM BÓNG RỔ:</div>
                        <div style="font-size:12.8px; color:#374151;">
                            <table style="width:100%; border-collapse:collapse; margin:8px 0; font-size:12px;">
                                <tr style="background:#f1f5f9;"><th style="padding:4px; border:1px solid #ddd;">SIZE</th><th style="padding:4px; border:1px solid #ddd;">CHIỀU CAO</th><th style="padding:4px; border:1px solid #ddd;">CÂN NẶNG</th><th style="padding:4px; border:1px solid #ddd;">FORM MẶC</th></tr>
                                <tr><td style="padding:4px; border:1px solid #ddd; text-align:center;"><b>S</b></td><td style="padding:4px; border:1px solid #ddd;">1m55 – 1m65</td><td style="padding:4px; border:1px solid #ddd;">48 – 58 kg</td><td style="padding:4px; border:1px solid #ddd;">Gọn gàng / Nữ / Thiếu niên</td></tr>
                                <tr><td style="padding:4px; border:1px solid #ddd; text-align:center;"><b>M</b></td><td style="padding:4px; border:1px solid #ddd;">1m65 – 1m72</td><td style="padding:4px; border:1px solid #ddd;">58 – 68 kg</td><td style="padding:4px; border:1px solid #ddd;">Vừa vặn chuẩn thi đấu</td></tr>
                                <tr><td style="padding:4px; border:1px solid #ddd; text-align:center;"><b>L</b></td><td style="padding:4px; border:1px solid #ddd;">1m72 – 1m78</td><td style="padding:4px; border:1px solid #ddd;">68 – 76 kg</td><td style="padding:4px; border:1px solid #ddd;">Thoải mái, cử động ném bóng tốt</td></tr>
                                <tr><td style="padding:4px; border:1px solid #ddd; text-align:center;"><b>XL</b></td><td style="padding:4px; border:1px solid #ddd;">1m78 – 1m85</td><td style="padding:4px; border:1px solid #ddd;">76 – 85 kg</td><td style="padding:4px; border:1px solid #ddd;">Rộng rãi / Cơ bắp</td></tr>
                                <tr><td style="padding:4px; border:1px solid #ddd; text-align:center;"><b>2XL</b></td><td style="padding:4px; border:1px solid #ddd;">Trên 1m85</td><td style="padding:4px; border:1px solid #ddd;">Trên 85 kg</td><td style="padding:4px; border:1px solid #ddd;">Form Big Size NBA</td></tr>
                            </table>
                            <p style="font-size:12px; color:#555;"><i>* Bó gối & Băng cổ chân: Có 3 size S (dưới 60kg), M (60-75kg), L (trên 75kg).</i></p>
                        </div>
                    </div>`;
            }

            // 7. CÂU HỎI CHUNG KHÁC
            return `
                <div style="line-height:1.6;">
                    <div style="font-size:14px; font-weight:700; color:#111; margin-bottom:4px;">🏀 AI Mairua.com sẵn sàng hỗ trợ bạn!</div>
                    <p style="font-size:12.8px; color:#4b5563;">Bạn có thể hỏi mình bất kỳ thông tin nào về:</p>
                    <ul style="font-size:12.5px; color:#374151; margin:6px 0 8px 18px;">
                        <li><b>Lên Combo 1 triệu</b> trọn bộ Quần + Áo + Đồ Combat + Bó gối + Vớ.</li>
                        <li><b>Tư vấn bóng rổ</b> sàn gỗ trong nhà (Molten GG7X/B7G4500) hoặc sân bê tông ngoài trời (AK Pro/Stepback).</li>
                        <li><b>Áo đấu NBA</b> & thiết kế Jersey Custom in tên/số theo yêu cầu.</li>
                        <li><b>Balo Nike Elite</b> có ngăn đựng giày size 46 và ngăn chứa bóng tiện lợi.</li>
                        <li><b>Tư vấn chọn size</b> chuẩn theo chiều cao và cân nặng của bạn.</li>
                    </ul>
                    <div style="display:flex; gap:6px; flex-wrap:wrap; margin-top:8px;">
                        <button type="button" class="btn-date-preset" style="background:#fff7ed; border-color:#ffedd5; color:#c2410c; font-weight:700;" onclick="guiCauHoiNhanhAI('Tư vấn combo 1tr gồm quần, áo và combat')">🎯 Lên Combo 1 triệu ngay</button>
                        <button type="button" class="btn-date-preset" onclick="guiCauHoiNhanhAI('Tư vấn chọn bóng rổ sàn gỗ và bê tông')">🏀 Chọn bóng rổ</button>
                        <button type="button" class="btn-date-preset" onclick="guiCauHoiNhanhAI('Tư vấn đồ combat và bó gối')">🛡️ Xem đồ combat</button>
                    </div>
                </div>`;
        }

        function guiCauHoiNhanhAI(text) {
            let input = document.getElementById('chatInput');
            if (input) input.value = text;
            guiTinNhanAI();
        }

        async function guiTinNhanAI() {
            const input = document.getElementById('chatInput');
            let rawQ = input.value.trim();
            if (!rawQ) return;
            const chatBox = document.getElementById('chatMessages');
            chatBox.innerHTML += `<div class="msg-user">${rawQ}</div>`;
            input.value = '';
            const loadingId = "loading-" + Date.now();
            chatBox.innerHTML += `<div class="msg-bot" id="${loadingId}">⏳ AI đang phân tích kho sản phẩm và tính toán combo...</div>`;
            chatBox.scrollTop = chatBox.scrollHeight;

            let promptContext = `Bạn là Chuyên gia tư vấn thiết bị bóng rổ chuyên nghiệp của Mairua.com.
Cửa hàng Mairua.com có các sản phẩm sau:
1. Áo Jersey NBA (Lakers 225k, Bulls 225k, Warriors 240k, NYC 250k, Đội Tuyển VN 230k). Size S, M, L, XL, 2XL.
2. Phôi Áo Custom Teamwear (350k, 6 màu: Tím, Trắng, Đen, Đỏ, Xanh Navy, Xanh lá). In tên số theo font Bebas Neue, Teko, Anton.
3. Quần bóng rổ NBA (USA 210k, Lakers 205k, Bulls 205k, Warriors 210k, Miami 215k, Celtics 205k).
4. Quần Combat Pro (195k, ngắn/dài/lệch 1 bên, đen/trắng) & 6 mẫu quần combat họa tiết (Sói hoang, Chúa sơn lâm, Hoa hồng bốn mùa, Trái dưa, Cherry drip, Xiềng xích 185k-195k).
5. Áo combat giữ nhiệt (ngắn tay 180k, ba lỗ 165k).
6. Phụ kiện bảo hộ (Bó gối có đệm 220k, Bó gối giảm chấn 240k, Băng quấn cổ chân 175k). Size S, M, L.
7. Vớ chống trượt (Nike Elite 150k trắng/đen, Trutech 220k).
8. Bóng rổ (Molten GG7X 680k sàn gỗ, Molten B7G4500 620k indoor/outdoor, AK Pro 450k-520k bê tông, Stepback 490k-580k). Size 7 nam, Size 6 nữ, Size 5 trẻ em.
9. Balo Nike Elite (V1 520k, V2 650k, V3 850k, Utility Speed 890k) có ngăn đựng giày riêng và ngăn chứa bóng.

Khi khách hỏi Combo (đặc biệt combo 1 triệu): Hãy tư vấn 2-3 combo cụ thể gồm quần, áo, combat và phụ kiện, tính rõ giá từng món và tổng tiền sát ngân sách 1tr.
Câu hỏi của khách: "${rawQ}"`;

            try {
                const response = await fetch('/api/ai/chat', {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ message: promptContext })
                });
                const resData = await response.json();
                const replyText = resData.reply || (resData.candidates && resData.candidates[0].content.parts[0].text) || '';
                if (replyText) {
                    let formatted = replyText
                        .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
                        .replace(/\n\n/g, '<br><br>')
                        .replace(/\n/g, '<br>');
                    document.getElementById(loadingId).innerHTML = `🏀 <b>Gemini AI Stylist:</b><br>${formatted}`;
                } else {
                    document.getElementById(loadingId).innerHTML = sinhPhanHoiAITuVanThongMinh(rawQ);
                }
            } catch (e) {
                document.getElementById(loadingId).innerHTML = sinhPhanHoiAITuVanThongMinh(rawQ);
            }
            chatBox.scrollTop = chatBox.scrollHeight;
        }

        let currentActiveTab = 'home';
        let previousViewBeforeDetail = { type: 'tab', tab: 'home', scrollY: 0 };

        function chuyenTab(tabName, preserveScroll) {
            currentActiveTab = tabName;
            document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
            document.querySelectorAll('.sub-nav a').forEach(el => el.classList.remove('active'));

            if (tabName === 'home') {
                document.getElementById('view-home').classList.add('active');
                document.getElementById('nav-home').classList.add('active');
                renderHomeProducts();
            } else if (tabName === 'customBalo') {
                document.getElementById('view-customBalo').classList.add('active');
                document.getElementById('nav-customBalo').classList.add('active');
                updateBaloPreview();
                capNhatTrangThaiNutCustom();
            } else if (tabName === 'customJersey') {
                document.getElementById('view-customJersey').classList.add('active');
                document.getElementById('nav-customJersey').classList.add('active');
                renderBangMauJerseyStudio();
                updateJerseyPreview();
                capNhatTrangThaiNutCustom();
            } else if (tabName === 'roster') {
                document.getElementById('view-roster').classList.add('active');
                document.getElementById('nav-roster').classList.add('active');
                renderBangMauJerseyStudio();
                capNhatGiaoDienRoster();
            } else if (tabName === 'cart') {
                document.getElementById('view-cart').classList.add('active');
                capNhatGioHang();
            } else if (tabName === 'account') {
                document.getElementById('view-account').classList.add('active');
                moTabTaiKhoan('orders');
            } else if (tabName === 'remoteOrder') {
                document.getElementById('view-remoteOrder').classList.add('active');
                document.getElementById('nav-remoteOrder').classList.add('active');
                if(currentCustomer.isAdmin) renderAdminDashboard();
                else renderCustomerOrderHistory();
                dongBoTuGoogleSheets(true);
            } else if (tabName === 'aiTryOn') {
                document.getElementById('view-aiTryOn').classList.add('active');
                document.getElementById('nav-aiTryOn').classList.add('active');
            } else {
                document.getElementById('view-products').classList.add('active');
                let navCat = document.getElementById('nav-' + tabName);
                if (navCat) navCat.classList.add('active');
                document.getElementById('productSectionTitle').innerText = {'balo': 'Balo Nike Elite & Utility', 'bong': 'Bóng Rổ Chính Hãng', 'vo': 'Vớ tất chuyên dụng', 'ao': 'Áo Jersey & Quần Bóng Rổ', 'combat': 'Đồ Combat & Phụ Kiện'}[tabName];
                renderProducts(tabName);
            }
            if (!preserveScroll) window.scrollTo(0, 0);
        }

        function capNhatNhanGiaLoc(val) {
            document.getElementById('homePriceValueLabel').innerText = `0đ - ${(parseInt(val) || 0).toLocaleString('vi-VN')}đ`;
        }
        function locSanPhamTheoGia() {
            currentFilteredMaxPrice = parseInt(document.getElementById('homePriceSlider').value) || 0;
            renderAllHomeGridFiltered();
        }
        function datLaiLocGia() {
            currentFilteredMaxPrice = 1000000;
            document.getElementById('homePriceSlider').value = 1000000;
            document.getElementById('homePriceValueLabel').innerText = `Tối đa: 1.000.000đ`;
            renderAllHomeGridFiltered();
        }

        function renderHomeProducts() {
            dongBoTonKhoChuanXac();
            capNhatTongStockVaSoldSanPham();
            let topGrid = document.getElementById('topSellingProductGrid');
            if (topGrid) {
                topGrid.innerHTML = '';
                [...products].filter(p => !p.isJerseyBlank).sort((a, b) => (b.sold || 0) - (a.sold || 0)).slice(0, 3).forEach(p => renderCard(p, topGrid, 'top', true));
            }
            renderAllHomeGridFiltered();
        }

        let currentSortMode = 'default';
        function sapXepSanPhamHome(mode) {
            currentSortMode = mode;
            renderAllHomeGridFiltered();
        }

        function renderAllHomeGridFiltered() {
            let homeGrid = document.getElementById('homeProductGrid');
            if (!homeGrid) return;
            homeGrid.innerHTML = '';
            let top3Ids = [...products].filter(p => !p.isJerseyBlank).sort((a, b) => (b.sold || 0) - (a.sold || 0)).slice(0, 3).map(p => p.id);
            let filteredList = products.filter(p => !p.isJerseyBlank && p.price <= currentFilteredMaxPrice);
            
            // Sắp xếp theo chế độ lựa chọn
            if (currentSortMode === 'price_asc') {
                filteredList.sort((a, b) => a.price - b.price);
            } else if (currentSortMode === 'price_desc') {
                filteredList.sort((a, b) => b.price - a.price);
            } else if (currentSortMode === 'popular') {
                filteredList.sort((a, b) => (b.sold || 0) - (a.sold || 0));
            }

            if (filteredList.length === 0) {
                homeGrid.innerHTML = `<p style="grid-column: 1/-1; text-align:center; color:#777; padding: 25px 0;">Không có sản phẩm nào trong tầm giá dưới ${currentFilteredMaxPrice.toLocaleString('vi-VN')}đ.</p>`;
                return;
            }
            filteredList.forEach(p => renderCard(p, homeGrid, 'home', top3Ids.includes(p.id)));
        }

        function renderProducts(cat) {
            document.getElementById('productGrid').innerHTML = '';
            let top3Ids = [...products].filter(p => !p.isJerseyBlank).sort((a, b) => (b.sold || 0) - (a.sold || 0)).slice(0, 3).map(p => p.id);
            products.filter(p => p.cat === cat && !p.isJerseyBlank).forEach(p => renderCard(p, document.getElementById('productGrid'), 'cat', top3Ids.includes(p.id)));
        }

        function doiMauTrenCard(prodId, varIdx, dotEl, prefix) {
            let p = products.find(item => item.id === prodId);
            if (!p || !p.variants[varIdx]) return;
            let imgEl = document.getElementById(`card-img-${prefix}-${prodId}`);
            if (imgEl) imgEl.src = p.variants[varIdx].img;
            dotEl.parentElement.querySelectorAll('.card-swatch-dot').forEach(d => d.classList.remove('active'));
            dotEl.classList.add('active');
        }

        // ================= HỆ THỐNG BẢNG SIZE & ĐÁNH GIÁ SẢN PHẨM (CHUẨN MVP HOOPS & SHOPEE) =================
        const defaultProductRatingsMeta = {
            1: { rating: 4.9, count: 212 },
            2: { rating: 4.8, count: 145 },
            3: { rating: 4.9, count: 98 },
            4: { rating: 4.6, count: 64 },
            5: { rating: 4.9, count: 188 },
            6: { rating: 4.7, count: 96 },
            7: { rating: 4.6, count: 77 },
            8: { rating: 4.5, count: 233 },
            9: { rating: 4.7, count: 52 },
            10: { rating: 4.5, count: 39 },
            11: { rating: 4.8, count: 410 },
            12: { rating: 4.7, count: 285 },
            13: { rating: 4.6, count: 98 },
            14: { rating: 4.8, count: 157 },
            15: { rating: 4.9, count: 134 },
            16: { rating: 4.8, count: 162 },
            17: { rating: 4.7, count: 89 },
            18: { rating: 4.9, count: 205 },
            19: { rating: 4.5, count: 120 },
            20: { rating: 4.6, count: 94 },
            21: { rating: 4.7, count: 142 },
            22: { rating: 4.8, count: 157 },
            23: { rating: 4.9, count: 118 },
            24: { rating: 4.8, count: 95 },
            25: { rating: 4.9, count: 104 },
            26: { rating: 4.7, count: 82 },
            27: { rating: 4.8, count: 76 },
            28: { rating: 4.7, count: 68 },
            29: { rating: 4.8, count: 92 },
            30: { rating: 4.9, count: 135 },
            31: { rating: 4.8, count: 110 },
            32: { rating: 4.7, count: 88 },
            33: { rating: 4.9, count: 124 },
            34: { rating: 4.8, count: 96 },
            35: { rating: 4.9, count: 165 },
            36: { rating: 4.8, count: 148 },
            37: { rating: 4.9, count: 130 }
        };

        const defaultSeedReviews = [
            {
                author: "Minh Q.",
                stars: 5,
                text: "In sắc nét, viền vàng ăn với áo tím rất đẹp. Giao đúng hẹn.",
                mediaCount: 2,
                images: [],
                verified: true
            },
            {
                author: "Thảo N.",
                stars: 4,
                text: "Balo rộng, ngăn giày tiện. Chữ hơi nhỏ so với mình nghĩ.",
                mediaCount: 1,
                images: [],
                verified: true
            },
            {
                author: "Đức P.",
                stars: 5,
                text: "Cả đội 12 người đặt roster, giảm 10%, rất ổn.",
                mediaCount: 0,
                images: [],
                verified: true
            }
        ];

        let onlyReviewsWithMedia = false;
        let currentReviewingOrderIdx = null;
        let reviewModalDrafts = {};

        function layMapDanhGiaKhachHang() {
            return JSON.parse(localStorage.getItem('mairua_productReviews')) || {};
        }

        function luuMapDanhGiaKhachHang(mapObj) {
            localStorage.setItem('mairua_productReviews', JSON.stringify(mapObj));
        }

        function taoHtmlSaoDanhGia(ratingVal) {
            let filled = Math.max(1, Math.min(5, Math.round(Number(ratingVal) || 5)));
            return `<span class="pdp-stars">${"★".repeat(filled)}<span class="off">${"★".repeat(5 - filled)}</span></span>`;
        }

        function layThongKeDanhGiaSanPham(prodId) {
            let baseMeta = defaultProductRatingsMeta[prodId] || { rating: 4.8, count: 85 };
            let reviewMap = layMapDanhGiaKhachHang();
            let customList = Array.isArray(reviewMap[prodId]) ? reviewMap[prodId] : [];
            let totalCount = baseMeta.count + customList.length;
            let sumCustomStars = customList.reduce((s, r) => s + (Number(r.stars) || 5), 0);
            let avgNum = totalCount > 0 ? ((baseMeta.rating * baseMeta.count + sumCustomStars) / totalCount) : baseMeta.rating;
            let ratingStr = avgNum.toFixed(1);
            let allReviews = [...customList.slice().reverse(), ...defaultSeedReviews];
            return { ratingStr, avgNum, totalCount, allReviews, customList };
        }

        function layBangSizeTheoSanPham(p) {
            if (!p) return { head: ["SIZE", "GHI CHÚ"], rows: [["Free size", "Phù hợp đa số người dùng"]] };
            if (p.isProtectiveGear && p.gearType === 'knee') {
                return {
                    head: ["SIZE", "CHU VI ĐÙI (TRÊN GỐI 10CM)", "CÂN NẶNG GỢI Ý", "TƯ VẤN ĐỘ ÔM"],
                    rows: [
                        ["S", "33 – 39 cm", "45 – 60 kg", "Chân nhỏ / Nữ / Thiếu niên — Ôm sát bảo vệ khớp gối"],
                        ["M", "40 – 46 cm", "60 – 75 kg", "Form phổ thông — Đệm giảm chấn chuẩn thi đấu bóng rổ"],
                        ["L", "47 – 55 cm", "75 – 95 kg", "Đùi to / Cơ bắp — Co giãn thoải mái, chống tuột khi bật nhảy"]
                    ]
                };
            }
            if (p.isProtectiveGear && p.gearType === 'ankle') {
                return {
                    head: ["SIZE", "CHU VI CỔ CHÂN (CM)", "CỠ GIÀY (EU)", "TƯ VẤN CỐ ĐỊNH"],
                    rows: [
                        ["S", "17 – 20 cm", "36 – 39", "Cổ chân nhỏ — Quấn ôm gọn gàng bên trong giày"],
                        ["M", "20 – 23 cm", "40 – 42", "Cổ chân vừa — Chống lật sơ mi tối ưu khi tiếp đất"],
                        ["L", "23 – 26 cm", "43 – 46", "Cổ chân lớn — Dây đai siết chéo bảo vệ dây chằng tối đa"]
                    ]
                };
            }
            if (p.isShorts || p.isCombatPants) {
                return {
                    head: ["SIZE", "VÒNG EO (CM)", "DÀI QUẦN (CM)", "CHIỀU CAO / CÂN NẶNG"],
                    rows: [
                        ["S", "66 – 74", "46", "1m55–1m65 (48–58 kg)"],
                        ["M", "74 – 80", "48", "1m65–1m72 (58–68 kg)"],
                        ["L", "80 – 86", "50", "1m72–1m78 (68–76 kg)"],
                        ["XL", "86 – 92", "52", "1m78–1m85 (76–85 kg)"],
                        ["2XL", "92 – 100", "54", "> 1m85 (> 85 kg)"]
                    ]
                };
            }
            if (p.cat === 'ao' || p.cat === 'combat') {
                return {
                    head: ["SIZE", "NGỰC (CM)", "DÀI (CM)", "CHIỀU CAO"],
                    rows: [
                        ["S", "92", "68", "1m55–1m65"],
                        ["M", "98", "71", "1m65–1m72"],
                        ["L", "104", "74", "1m72–1m78"],
                        ["XL", "110", "76", "1m78–1m85"],
                        ["2XL", "116", "78", "> 1m85"]
                    ]
                };
            }
            if (p.cat === 'bong') {
                return {
                    head: ["SIZE", "CHU VI", "TRỌNG LƯỢNG", "PHÙ HỢP"],
                    rows: [
                        ["7", "75–76 cm", "~600 g", "Nam ≥ 14 tuổi"],
                        ["6", "72–73 cm", "~510 g", "Nữ, thiếu niên"],
                        ["5", "69–70 cm", "~470 g", "Trẻ em < 12"]
                    ]
                };
            }
            if (p.cat === 'vo') {
                return {
                    head: ["SIZE", "CỠ GIÀY (EU)", "DÀI CHÂN (CM)", "GHI CHÚ"],
                    rows: [
                        ["S (38-40)", "38–40", "24–25 cm", "Ôm cổ chân"],
                        ["M (41-42)", "41–42", "25.5–26.5 cm", "Đệm dày chống trượt"],
                        ["L (43-45)", "43–45", "27–29 cm", "Form chuẩn thi đấu"]
                    ]
                };
            }
            return {
                head: ["SIZE", "GHI CHÚ"],
                rows: [
                    ["Free size", "Phù hợp đa số người dùng"]
                ]
            };
        }

        function batTatLocAnhDanhGia(checked) {
            onlyReviewsWithMedia = !!checked;
            let p = products.find(item => item.id === currentOpenedProductId);
            if (p) renderDanhSachReviewChiTiet(p);
        }

        function moAnhDanhGiaLightbox(imgSrc) {
            let imgEl = document.getElementById('reviewLightboxImg');
            if (imgEl) imgEl.src = imgSrc;
            moModal('reviewPhotoLightboxModal');
        }

        function renderDanhSachReviewChiTiet(p) {
            let listEl = document.getElementById('pdpReviewsListBox');
            if (!listEl || !p) return;
            let stat = layThongKeDanhGiaSanPham(p.id);
            let filtered = stat.allReviews.filter(r => {
                if (!onlyReviewsWithMedia) return true;
                return (Array.isArray(r.images) && r.images.length > 0) || (r.mediaCount && r.mediaCount > 0);
            });

            if (filtered.length === 0) {
                listEl.innerHTML = `<div style="padding:22px 0; color:#64748b; font-size:13.5px; text-align:center;">Chưa có đánh giá nào kèm hình ảnh cho bộ lọc này.</div>`;
                return;
            }

            listEl.innerHTML = filtered.map(r => {
                let verifiedHtml = r.verified !== false ? `<span class="pdp-verified-badge">ĐÃ MUA HÀNG</span>` : '';
                let metaLine = r.variantInfo ? `<div style="font-size:11.5px; color:#64748b; margin-top:2px;">Phân loại hàng: <b>${r.variantInfo}</b> ${r.dateStr ? `· ${r.dateStr}` : ''}</div>` : '';
                let mediaHtml = '';
                if (Array.isArray(r.images) && r.images.length > 0) {
                    mediaHtml = `<div class="pdp-review-media">` +
                        r.images.map(src => `<img src="${src}" class="pdp-review-img-thumb" onclick="moAnhDanhGiaLightbox('${src}')" title="Nhấn để phóng to ảnh">`).join('') +
                        `<span style="font-size:12px; color:#64748b; margin-left:4px;">${r.images.length} ảnh</span></div>`;
                } else if (r.mediaCount && r.mediaCount > 0) {
                    let boxColor = (p.variants && p.variants[0] && p.variants[0].hex && p.variants[0].hex !== '#ffffff') ? p.variants[0].hex : '#64748b';
                    mediaHtml = `<div class="pdp-review-media">` +
                        Array.from({ length: r.mediaCount }, () => `<span class="pdp-review-placeholder-box" style="background:${boxColor};"></span>`).join('') +
                        `<span style="font-size:12px; color:#64748b; margin-left:4px;">${r.mediaCount} ảnh</span></div>`;
                }
                return `
                    <div class="pdp-review-item">
                        <div style="display:flex; align-items:center; flex-wrap:wrap; gap:4px;">
                            <b style="font-size:14.5px; color:#111;">${r.author || 'Khách hàng'}</b>
                            ${verifiedHtml}
                        </div>
                        <div style="margin: 3px 0;">${taoHtmlSaoDanhGia(r.stars)}</div>
                        ${metaLine}
                        <p style="font-size:14px; color:#1e293b; margin: 5px 0 4px 0; line-height:1.5;">${r.text || ''}</p>
                        ${mediaHtml}
                    </div>
                `;
            }).join('');
        }

        function veBangSizeVaDanhGiaChiTiet(p) {
            let subSec = document.getElementById('detailSubSections');
            if (!subSec || !p) return;
            let chart = layBangSizeTheoSanPham(p);
            let stat = layThongKeDanhGiaSanPham(p.id);

            let headHtml = chart.head.map(h => `<th>${h}</th>`).join('');
            let rowsHtml = chart.rows.map(row => `<tr>${row.map(c => `<td>${c}</td>`).join('')}</tr>`).join('');

            subSec.innerHTML = `
                <section class="pdp-card">
                    <h2 class="pdp-card-title">BẢNG SIZE</h2>
                    <div style="overflow-x:auto;">
                        <table class="size-chart-table">
                            <thead><tr>${headHtml}</tr></thead>
                            <tbody>${rowsHtml}</tbody>
                        </table>
                    </div>
                </section>
                <section class="pdp-card" id="pdpReviewSectionCard">
                    <h2 class="pdp-card-title">ĐÁNH GIÁ</h2>
                    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:14px;">
                        <div style="display:flex; align-items:center; gap:12px;">
                            <span class="pdp-big-rating">${stat.ratingStr}</span>
                            <div>
                                <div>${taoHtmlSaoDanhGia(stat.avgNum)}</div>
                                <div style="font-size:13px; color:#64748b; margin-top:2px;">${stat.totalCount} đánh giá</div>
                            </div>
                        </div>
                        <label style="display:inline-flex; align-items:center; gap:6px; font-size:13.5px; color:#334155; cursor:pointer; user-select:none;">
                            <input type="checkbox" ${onlyReviewsWithMedia ? 'checked' : ''} onchange="batTatLocAnhDanhGia(this.checked)" style="width:15px; height:15px; accent-color:#ff5500; cursor:pointer;">
                            Có ảnh/video
                        </label>
                    </div>
                    <div id="pdpReviewsListBox"></div>
                </section>
            `;
            renderDanhSachReviewChiTiet(p);
        }

        function layDanhSachSanPhamTrongDonDeDanhGia(ord) {
            if (!ord) return [];
            let orderCode = ord.orderCode || 'MVP';
            let items = [];

            if (Array.isArray(ord.cartSnapshot) && ord.cartSnapshot.length > 0) {
                ord.cartSnapshot.forEach((ci, idx) => {
                    let prod = products.find(p => p.id === Number(ci.productId)) || products[0];
                    let vIdx = typeof ci.variantIndex === 'number' ? ci.variantIndex : 0;
                    let variant = (prod && prod.variants[vIdx]) ? prod.variants[vIdx] : (prod ? prod.variants[0] : null);
                    items.push({
                        itemIdx: idx,
                        prodId: prod ? prod.id : 1,
                        prodName: ci.name || (prod ? prod.name : 'Sản phẩm Mairua'),
                        variantInfo: ci.subInfo || (variant ? variant.colorName : 'Tiêu chuẩn'),
                        qty: ci.qty || 1,
                        img: ci.img || (variant ? variant.img : ''),
                        reviewKey: `${orderCode}_item_${idx}_prod_${prod ? prod.id : 1}`
                    });
                });
                return items;
            }

            if (Array.isArray(ord.itemsList) && ord.itemsList.length > 0) {
                ord.itemsList.forEach((line, idx) => {
                    let cleanLine = line.replace(/^•\s*/, '').trim();
                    let qtyMatch = cleanLine.match(/\(x(\d+)\)/i);
                    let qty = qtyMatch ? (parseInt(qtyMatch[1]) || 1) : 1;
                    let lowerLine = cleanLine.toLowerCase();

                    let matchedProd = null;
                    if (lowerLine.includes('roster') || (lowerLine.includes('jersey') && lowerLine.includes('custom'))) {
                        matchedProd = products.find(p => p.id === 14) || products.find(p => p.id === 22);
                    } else {
                        matchedProd = products.find(p => !p.isJerseyBlank && lowerLine.includes(p.name.toLowerCase()));
                    }
                    if (!matchedProd && Array.isArray(ord.deductedVariants) && ord.deductedVariants[idx]) {
                        matchedProd = products.find(p => p.id === Number(ord.deductedVariants[idx].prodId));
                    }
                    if (!matchedProd) matchedProd = products[0];

                    let vIdx = matchedProd.variants.findIndex(v => lowerLine.includes(v.colorName.toLowerCase()));
                    if (vIdx === -1 && Array.isArray(ord.deductedVariants) && ord.deductedVariants[idx]) {
                        vIdx = Number(ord.deductedVariants[idx].vIdx) || 0;
                    }
                    if (vIdx < 0 || vIdx >= matchedProd.variants.length) vIdx = 0;
                    let variant = matchedProd.variants[vIdx] || matchedProd.variants[0];

                    let parenMatch = cleanLine.match(/\(([^)]+)\)/);
                    let variantInfo = (parenMatch && !/^x\d+$/i.test(parenMatch[1])) ? parenMatch[1] : (variant ? variant.colorName : 'Tiêu chuẩn');

                    items.push({
                        itemIdx: idx,
                        prodId: matchedProd.id,
                        prodName: matchedProd.name,
                        variantInfo,
                        qty,
                        img: variant ? variant.img : '',
                        reviewKey: `${orderCode}_item_${idx}_prod_${matchedProd.id}`
                    });
                });
                return items;
            }

            return [];
        }

        function timDanhGiaDaGuiTheoKey(prodId, reviewKey) {
            let map = layMapDanhGiaKhachHang();
            let arr = Array.isArray(map[prodId]) ? map[prodId] : [];
            return arr.find(r => r && r.reviewKey === reviewKey) || null;
        }

        function taoHtmlKhungDanhGiaTrongDon(ord, realOrderIndex, isAdminView = false) {
            let orderItems = layDanhSachSanPhamTrongDonDeDanhGia(ord);
            if (orderItems.length === 0) return '';

            let reviewedCount = orderItems.filter(it => !!timDanhGiaDaGuiTheoKey(it.prodId, it.reviewKey)).length;
            let allReviewed = reviewedCount >= orderItems.length;

            let miniItemsHtml = orderItems.map(it => {
                let existingRev = timDanhGiaDaGuiTheoKey(it.prodId, it.reviewKey);
                let statusBadge = existingRev
                    ? `<span style="background:#dcfce7; color:#15803d; font-size:11px; font-weight:700; padding:3px 8px; border-radius:6px;">✓ Đã đánh giá (${existingRev.stars}★)</span>`
                    : `<span style="background:#fff7ed; color:#c2410c; border:1px solid #fed7aa; font-size:11px; font-weight:700; padding:3px 8px; border-radius:6px;">Chưa đánh giá</span>`;
                return `
                    <div style="display:flex; align-items:center; justify-content:space-between; gap:10px; padding:8px 10px; background:#fff; border:1px solid #e2e8f0; border-radius:8px; margin-top:6px;">
                        <div style="display:flex; align-items:center; gap:10px;">
                            <img src="${it.img}" style="width:40px; height:40px; border-radius:6px; object-fit:cover; border:1px solid #eee;">
                            <div>
                                <div style="font-size:13px; font-weight:700; color:#111; cursor:pointer;" onclick="xemSanPhamTuDanhGia(${it.prodId})">${it.prodName}</div>
                                <div style="font-size:11.5px; color:#64748b;">Phân loại: ${it.variantInfo} · x${it.qty}</div>
                            </div>
                        </div>
                        <div style="display:flex; align-items:center; gap:8px;">
                            ${statusBadge}
                            ${existingRev ? `<button type="button" onclick="xemSanPhamTuDanhGia(${it.prodId})" style="background:#f1f5f9; color:#0f172a; border:1px solid #cbd5e1; padding:4px 9px; border-radius:6px; font-size:11px; font-weight:700; cursor:pointer;">👁️ Xem trên SP</button>` : ''}
                        </div>
                    </div>
                `;
            }).join('');

            return `
                <div style="margin-top:14px; background:#fff8f5; border:1.5px solid #ff5500; border-radius:12px; padding:16px 18px;">
                    <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px;">
                        <div>
                            <div style="font-size:15px; font-weight:800; color:#c2410c; display:flex; align-items:center; gap:6px;">
                                ⭐ Đánh Giá Sản Phẩm Khi Đơn Hàng Đã Hoàn Tất
                                <span style="font-size:11.5px; background:#ff5500; color:#fff; padding:2px 8px; border-radius:999px;">Đã đánh giá ${reviewedCount}/${orderItems.length} SP</span>
                            </div>
                            <div style="font-size:12.5px; color:#64748b; margin-top:2px;">Đánh giá từng sản phẩm (chọn số sao, viết nhận xét & tải ảnh thực tế) để hiển thị trực tiếp lên trang sản phẩm!</div>
                        </div>
                        ${!isAdminView ? `
                        <button type="button" onclick="moModalDanhGiaDonHang(${realOrderIndex})" style="background:#ff5500; color:#fff; border:none; padding:10px 22px; border-radius:8px; font-weight:800; font-size:13.5px; cursor:pointer; font-family:'Poppins',sans-serif; box-shadow:0 4px 12px rgba(255,85,0,0.28);">
                            ${allReviewed ? '⭐ Xem / Sửa đánh giá sản phẩm' : '⭐ Đánh giá sản phẩm'}
                        </button>` : ''}
                    </div>
                    <div style="margin-top:8px;">${miniItemsHtml}</div>
                </div>
            `;
        }

        function khachXacNhanDaNhanHang(realOrderIndex) {
            let ord = remoteOrdersList[realOrderIndex];
            if (!ord) return;
            let info = layThongTinTienTrinhDon(ord);
            if (info.isCancelled) return;
            ord.manualStepIdx = info.steps.length - 1;
            let targetCode = ord.originalOrderCode || ord.orderCode;
            daDongBoTrangThaiSheet[ord.orderCode] = 'Hoàn tất';
            daDongBoTrangThaiSheet[targetCode] = 'Hoàn tất';
            guiDuLieuGoogleSheets('updateOrderStatus', { orderCode: targetCode, status: 'Hoàn tất', phone: ord.phone });
            dongBoBackupDonKhachThat(ord);
            luuDuLieuLenDamMay();
            renderTrangTaiKhoan();
            xemChiTietDonTaiKhoan(realOrderIndex);
            moModalDanhGiaDonHang(realOrderIndex);
        }

        function layNhanSaoShopee(stars) {
            const labels = {
                5: "Tuyệt vời",
                4: "Hài lòng",
                3: "Bình thường",
                2: "Không hài lòng",
                1: "Tệ"
            };
            return labels[stars] || "Tuyệt vời";
        }

        function moModalDanhGiaDonHang(realOrderIndex) {
            let ord = remoteOrdersList[realOrderIndex];
            if (!ord) return;
            currentReviewingOrderIdx = realOrderIndex;
            let orderCode = ord.orderCode || `MVP${12200 + realOrderIndex}`;
            let subEl = document.getElementById('orderReviewModalSub');
            if (subEl) subEl.innerHTML = `Đơn hàng <b>#${orderCode}</b> · Bạn có thể đánh giá riêng từng sản phẩm trong đơn như Shopee (chọn sao, bình luận & tải ảnh thực tế).`;

            let orderItems = layDanhSachSanPhamTrongDonDeDanhGia(ord);
            reviewModalDrafts = {};
            orderItems.forEach(it => {
                let existing = timDanhGiaDaGuiTheoKey(it.prodId, it.reviewKey);
                reviewModalDrafts[it.itemIdx] = {
                    prodId: it.prodId,
                    prodName: it.prodName,
                    variantInfo: it.variantInfo,
                    qty: it.qty,
                    img: it.img,
                    reviewKey: it.reviewKey,
                    stars: existing ? existing.stars : 5,
                    text: existing ? existing.text : '',
                    images: existing && Array.isArray(existing.images) ? [...existing.images] : [],
                    alreadySaved: !!existing
                };
            });

            renderNoiDungModalDanhGiaDon();
            moModal('orderReviewModal');
        }

        function renderNoiDungModalDanhGiaDon() {
            let container = document.getElementById('orderReviewItemsContainer');
            if (!container) return;
            let keys = Object.keys(reviewModalDrafts);
            if (keys.length === 0) {
                container.innerHTML = `<p style="color:#64748b; text-align:center; padding:20px;">Không tìm thấy sản phẩm trong đơn hàng.</p>`;
                return;
            }

            const quickSuggestions = [
                "Chất lượng sản phẩm tuyệt vời",
                "In sắc nét, màu lên rất đẹp",
                "Đóng gói chắc chắn, giao hàng nhanh",
                "Đúng với mô tả, rất đáng tiền"
            ];

            container.innerHTML = keys.map(k => {
                let idx = Number(k);
                let d = reviewModalDrafts[idx];
                let starsHtml = [1, 2, 3, 4, 5].map(s =>
                    `<span class="shopee-star-btn ${s <= d.stars ? 'active' : ''}" onclick="chonSaoDanhGiaModal(${idx}, ${s})">★</span>`
                ).join('');

                let thumbsHtml = (d.images || []).map((imgSrc, imgI) => `
                    <div class="shopee-thumb-wrap">
                        <img src="${imgSrc}" alt="Preview">
                        <button type="button" class="shopee-thumb-remove" onclick="xoaAnhDanhGiaModal(${idx}, ${imgI})" title="Xóa ảnh">&times;</button>
                    </div>
                `).join('');

                let quickTagsHtml = quickSuggestions.map(tag =>
                    `<span class="shopee-quick-tag" onclick="themTagBinhLuanNhanh(${idx}, '${tag}')">+ ${tag}</span>`
                ).join('');

                return `
                    <div class="shopee-review-item-card" id="review-card-item-${idx}">
                        <div style="display:flex; align-items:center; justify-content:space-between; gap:12px; padding-bottom:12px; border-bottom:1px solid #f1f5f9; margin-bottom:12px; flex-wrap:wrap;">
                            <div style="display:flex; align-items:center; gap:12px;">
                                <img src="${d.img}" style="width:54px; height:54px; border-radius:8px; object-fit:cover; border:1px solid #e2e8f0;">
                                <div>
                                    <div style="font-weight:800; font-size:15px; color:#111;">${d.prodName}</div>
                                    <div style="font-size:12px; color:#64748b;">Phân loại hàng: <b>${d.variantInfo}</b> · Số lượng: x${d.qty}</div>
                                </div>
                            </div>
                            <div style="display:flex; align-items:center; gap:8px;">
                                ${d.alreadySaved
                                    ? `<span style="background:#dcfce7; color:#15803d; font-size:11.5px; font-weight:700; padding:4px 10px; border-radius:999px;">✅ Đã cập nhật lên trang SP</span>
                                       <button type="button" onclick="xemSanPhamTuDanhGia(${d.prodId})" style="background:#eff6ff; color:#1d4ed8; border:1px solid #bfdbfe; padding:5px 10px; border-radius:6px; font-size:11.5px; font-weight:700; cursor:pointer;">👁️ Xem trên SP</button>`
                                    : `<span style="background:#fff7ed; color:#c2410c; font-size:11.5px; font-weight:700; padding:4px 10px; border-radius:999px;">Đang viết đánh giá</span>`
                                }
                            </div>
                        </div>

                        <div style="display:flex; align-items:center; gap:14px; margin-bottom:12px; flex-wrap:wrap;">
                            <span style="font-size:13.5px; font-weight:700; color:#334155; min-width:130px;">Chất lượng sản phẩm:</span>
                            <div style="display:flex; align-items:center; gap:4px;">${starsHtml}</div>
                            <span style="font-size:13.5px; font-weight:700; color:#ff5500;">${layNhanSaoShopee(d.stars)}</span>
                        </div>

                        <div style="display:flex; gap:6px; flex-wrap:wrap; margin-bottom:8px;">
                            ${quickTagsHtml}
                        </div>

                        <textarea id="review-textarea-${idx}" rows="3" class="form-control" style="margin:0 0 10px 0; font-size:13.5px; background:#f8fafc;" placeholder="Hãy chia sẻ nhận xét của bạn về chất lượng sản phẩm, form dáng, màu sắc..." oninput="capNhatTextDanhGiaModal(${idx}, this.value)">${d.text || ''}</textarea>

                        <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:10px;">
                            <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
                                <label class="shopee-upload-btn">
                                    📷 Thêm hình ảnh (${(d.images || []).length}/4)
                                    <input type="file" accept="image/*" multiple style="display:none;" onchange="xuLyUpAnhDanhGiaModal(event, ${idx})">
                                </label>
                                        <div style="display:flex; gap:8px; flex-wrap:wrap;">${thumbsHtml}</div>
                            </div>
                            <button type="button" onclick="guiDanhGiaMotSanPham(${idx})" style="background:#111; color:#fff; border:none; padding:8px 16px; border-radius:8px; font-size:12.5px; font-weight:700; cursor:pointer; font-family:'Poppins',sans-serif;">
                                ${d.alreadySaved ? '💾 Cập nhật đánh giá SP này' : '✓ Gửi đánh giá SP này'}
                            </button>
                        </div>
                    </div>
                `;
            }).join('');
        }

        function chonSaoDanhGiaModal(itemIdx, starVal) {
            if (!reviewModalDrafts[itemIdx]) return;
            reviewModalDrafts[itemIdx].stars = starVal;
            renderNoiDungModalDanhGiaDon();
        }

        function capNhatTextDanhGiaModal(itemIdx, val) {
            if (!reviewModalDrafts[itemIdx]) return;
            reviewModalDrafts[itemIdx].text = val;
        }

        function themTagBinhLuanNhanh(itemIdx, tagText) {
            if (!reviewModalDrafts[itemIdx]) return;
            let cur = (reviewModalDrafts[itemIdx].text || '').trim();
            if (!cur.includes(tagText)) {
                reviewModalDrafts[itemIdx].text = cur ? `${cur}. ${tagText}.` : `${tagText}.`;
            }
            renderNoiDungModalDanhGiaDon();
        }

        function nenAnhSangBase64(file, callback) {
            let reader = new FileReader();
            reader.onload = function(e) {
                let img = new Image();
                img.onload = function() {
                    let canvas = document.createElement('canvas');
                    let maxDim = 380;
                    let w = img.width, h = img.height;
                    if (w > h && w > maxDim) { h = Math.round(h * (maxDim / w)); w = maxDim; }
                    else if (h >= w && h > maxDim) { w = Math.round(w * (maxDim / h)); h = maxDim; }
                    canvas.width = w;
                    canvas.height = h;
                    let ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, w, h);
                    callback(canvas.toDataURL('image/jpeg', 0.76));
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }

        function xuLyUpAnhDanhGiaModal(event, itemIdx) {
            let d = reviewModalDrafts[itemIdx];
            if (!d) return;
            let files = Array.from(event.target.files || []);
            if (files.length === 0) return;
            let remainSlots = Math.max(0, 4 - (d.images ? d.images.length : 0));
            if (remainSlots <= 0) {
                alert("⚠️ Mỗi sản phẩm tối đa tải lên 4 hình ảnh!");
                return;
            }
            let toProcess = files.slice(0, remainSlots);
            let processed = 0;
            toProcess.forEach(file => {
                nenAnhSangBase64(file, (base64Url) => {
                    d.images.push(base64Url);
                    processed++;
                    if (processed === toProcess.length) {
                        renderNoiDungModalDanhGiaDon();
                    }
                });
            });
        }

        function xoaAnhDanhGiaModal(itemIdx, imgIdx) {
            let d = reviewModalDrafts[itemIdx];
            if (!d || !Array.isArray(d.images)) return;
            d.images.splice(imgIdx, 1);
            renderNoiDungModalDanhGiaDon();
        }

        function luuMotDraftVaoBoNho(itemIdx) {
            let d = reviewModalDrafts[itemIdx];
            if (!d) return false;
            let ord = currentReviewingOrderIdx !== null ? remoteOrdersList[currentReviewingOrderIdx] : null;
            let authorName = (currentCustomer && currentCustomer.loggedIn && currentCustomer.name)
                ? currentCustomer.name
                : (ord && ord.name ? ord.name : 'Khách hàng');
            let now = new Date();
            let dateStr = `${String(now.getDate()).padStart(2,'0')}/${String(now.getMonth()+1).padStart(2,'0')}/${now.getFullYear()}`;
            let commentText = (d.text || '').trim() || `${layNhanSaoShopee(d.stars)}! Sản phẩm chuẩn chính hãng, đóng gói cẩn thận.`;

            let map = layMapDanhGiaKhachHang();
            if (!Array.isArray(map[d.prodId])) map[d.prodId] = [];

            let reviewObj = {
                reviewKey: d.reviewKey,
                orderCode: ord ? ord.orderCode : '',
                author: authorName,
                phone: (currentCustomer && currentCustomer.phone) || (ord ? ord.phone : ''),
                variantInfo: d.variantInfo,
                stars: Number(d.stars) || 5,
                text: commentText,
                images: Array.isArray(d.images) ? [...d.images] : [],
                mediaCount: Array.isArray(d.images) ? d.images.length : 0,
                verified: true,
                dateStr,
                createdAt: Date.now()
            };

            let existIdx = map[d.prodId].findIndex(r => r && r.reviewKey === d.reviewKey);
            if (existIdx !== -1) map[d.prodId][existIdx] = reviewObj;
            else map[d.prodId].push(reviewObj);

            luuMapDanhGiaKhachHang(map);
            d.text = commentText;
            d.alreadySaved = true;
            return true;
        }

        function guiDanhGiaMotSanPham(itemIdx) {
            if (!luuMotDraftVaoBoNho(itemIdx)) return;
            let d = reviewModalDrafts[itemIdx];
            renderNoiDungModalDanhGiaDon();
            if (currentReviewingOrderIdx !== null) {
                renderDanhSachDonTaiKhoan();
                xemChiTietDonTaiKhoan(currentReviewingOrderIdx);
            }
            renderHomeProducts();
            alert(`🎉 Đã đăng đánh giá ${d.stars}★ cho sản phẩm "${d.prodName}"!\nĐánh giá và hình ảnh của bạn đã được cập nhật trực tiếp lên mục ĐÁNH GIÁ của sản phẩm.`);
        }

        function guiTatCaDanhGiaTrongDon() {
            let keys = Object.keys(reviewModalDrafts);
            if (keys.length === 0) return;
            keys.forEach(k => luuMotDraftVaoBoNho(Number(k)));
            dongModal('orderReviewModal');
            if (currentReviewingOrderIdx !== null) {
                renderDanhSachDonTaiKhoan();
                xemChiTietDonTaiKhoan(currentReviewingOrderIdx);
            }
            renderHomeProducts();
            alert(`🎉 Cảm ơn bạn! Đã gửi thành công đánh giá cho ${keys.length} sản phẩm trong đơn hàng.\nBạn có thể bấm vào tên sản phẩm hoặc nút "👁️ Xem trên SP" để xem đánh giá của mình ngay trên trang sản phẩm!`);
        }

        function xemSanPhamTuDanhGia(prodId) {
            dongModal('orderReviewModal');
            onlyReviewsWithMedia = false;
            moChiTietSanPham(prodId);
            setTimeout(() => {
                let revCard = document.getElementById('pdpReviewSectionCard');
                if (revCard) revCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 120);
        }

        function renderCard(p, grid, prefix = 'grid', isBestSeller = false) {
            let bestSellerBadge = isBestSeller ? `<div class="bestseller-badge-card">🔥 BÁN CHẠY</div>` : '';
            let swatchesHtml = (p.variants && p.variants.length > 1)
                ? `<div class="card-swatches">` + p.variants.map((v, idx) => `<span class="card-swatch-dot ${idx===0?'active':''}" style="background-color:${v.hex};" title="${v.colorName}" onclick="event.stopPropagation(); doiMauTrenCard(${p.id}, ${idx}, this, '${prefix}')"></span>`).join('') + `<span style="font-size:11px; color:#777; margin-left:4px;">(${p.variants.length} phân loại)</span></div>`
                : `<div class="card-swatches"><span style="font-size:11px; color:#888;">Màu: ${p.variants[0].colorName}</span></div>`;

            let actionButtons = currentCustomer.isAdmin 
                ? `<button class="btn-view-detail" onclick="moChiTietSanPham(${p.id})">👁️ Xem thông tin SP</button>`
                : `<button class="btn-view-detail" onclick="moChiTietSanPham(${p.id})">👁️ Xem</button><button class="btn-add-cart ${p.stock <= 0 ? 'btn-disabled' : ''}" onclick="moChiTietSanPham(${p.id})">${p.stock <= 0 ? 'Hết hàng' : 'Chọn màu / Mua'}</button>`;

            let revStat = layThongKeDanhGiaSanPham(p.id);
            grid.innerHTML += `<div class="product-card">${bestSellerBadge}<div><img id="card-img-${prefix}-${p.id}" src="${p.variants[0].img}" class="product-img" onclick="moChiTietSanPham(${p.id})" style="cursor:pointer;">${swatchesHtml}<div class="product-name">${p.name}</div><div style="font-size:12.5px; color:#64748b; margin:2px 0 6px 0; font-weight:500;"><span style="color:#ff5500;">★</span> ${revStat.ratingStr} · ${revStat.totalCount} đánh giá</div></div><div><div class="product-price">${p.price.toLocaleString('vi-VN')}đ</div><div class="card-btn-group">${actionButtons}</div></div></div>`;
        }

        let currentSelectedVariantIndex = 0, currentSelectedSize = '', currentQty = 1;
        let combatSelectedColor = 'Đen', combatSelectedCut = 'Ngắn';

        function moChiTietSanPham(id) {
            dongBoTonKhoChuanXac();
            let currentActiveSection = document.querySelector('.view-section.active');
            if (currentActiveSection && currentActiveSection.id !== 'view-detail') {
                let sy = window.scrollY || window.pageYOffset || 0;
                if (currentActiveTab === 'search') {
                    previousViewBeforeDetail = {
                        type: 'search',
                        keyword: document.getElementById('searchInput') ? document.getElementById('searchInput').value : '',
                        scrollY: sy
                    };
                } else if (currentActiveSection.id === 'view-products') {
                    previousViewBeforeDetail = {
                        type: 'category',
                        cat: currentActiveTab || 'balo',
                        scrollY: sy
                    };
                } else if (currentActiveSection.id === 'view-home') {
                    previousViewBeforeDetail = {
                        type: 'tab',
                        tab: 'home',
                        scrollY: sy
                    };
                } else if (currentActiveSection.id === 'view-cart') {
                    previousViewBeforeDetail = {
                        type: 'tab',
                        tab: 'cart',
                        scrollY: sy
                    };
                } else if (currentActiveSection.id === 'view-account') {
                    previousViewBeforeDetail = {
                        type: 'tab',
                        tab: 'account',
                        scrollY: sy
                    };
                } else {
                    previousViewBeforeDetail = {
                        type: 'tab',
                        tab: currentActiveTab || 'home',
                        scrollY: sy
                    };
                }
            }
            currentOpenedProductId = id;
            let p = products.find(item => item.id === id);
            if (!p) return;
            currentSelectedVariantIndex = 0;
            currentSelectedSize = p.hasSize ? p.sizes[0] : '';
            currentQty = 1;
            if (p.isCombatPants) {
                combatSelectedColor = 'Đen'; combatSelectedCut = 'Ngắn';
                let foundIdx = p.variants.findIndex(v => v.baseColor === combatSelectedColor && v.cutStyle === combatSelectedCut);
                currentSelectedVariantIndex = foundIdx !== -1 ? foundIdx : 0;
            }
            document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
            document.getElementById('view-detail').classList.add('active');
            veNoiDungChiTietSanPham(p);
            window.scrollTo(0,0);
        }

        function quayLaiTrangTruocDoChiTiet() {
            if (!previousViewBeforeDetail) {
                chuyenTab('home');
                return;
            }
            let targetScroll = previousViewBeforeDetail.scrollY || 0;
            if (previousViewBeforeDetail.type === 'search') {
                let kw = previousViewBeforeDetail.keyword;
                if (document.getElementById('searchInput')) document.getElementById('searchInput').value = kw;
                timKiemSanPham(true);
            } else if (previousViewBeforeDetail.type === 'category') {
                chuyenTab(previousViewBeforeDetail.cat, true);
            } else {
                chuyenTab(previousViewBeforeDetail.tab || 'home', true);
            }
            setTimeout(() => {
                window.scrollTo({ top: targetScroll, behavior: 'instant' });
            }, 30);
        }

        function veNoiDungChiTietSanPham(p) {
            let currentVar = p.variants[currentSelectedVariantIndex] || p.variants[0];
            let inCartQty = laySoLuongTrongGioTheoVariant(p.id, currentSelectedVariantIndex);
            let availableToAdd = Math.max(0, currentVar.stock - inCartQty);
            if (currentQty > availableToAdd && availableToAdd > 0) currentQty = availableToAdd;

            let selectorHtml = '';
            if (p.isCombatPants) {
                let colors = ['Đen', 'Trắng'];
                let cuts = ['Ngắn', 'Dài', 'Lệch Phải', 'Lệch Trái'];
                selectorHtml = `
                    <label style="font-weight:600;font-size:14px;display:block;margin-bottom:6px;">1. Chọn Màu sắc: <span style="color:#ff5500;">${combatSelectedColor}</span></label>
                    <div class="size-selector">${colors.map(c => `<button type="button" class="size-btn ${combatSelectedColor===c?'active':''}" onclick="chonThuocTinhQuanCombat('${c}', null)">${c}</button>`).join('')}</div>
                    <label style="font-weight:600;font-size:14px;display:block;margin-bottom:6px;">2. Chọn Kiểu ống quần: <span style="color:#ff5500;">${combatSelectedCut}</span></label>
                    <div class="size-selector">${cuts.map(cut => `<button type="button" class="size-btn ${combatSelectedCut===cut?'active':''}" onclick="chonThuocTinhQuanCombat(null, '${cut}')">${cut}</button>`).join('')}</div>
                    <label style="font-weight:600;font-size:14px;display:block;margin-bottom:6px;">3. Chọn Size: <span style="color:#ff5500;">${currentSelectedSize}</span></label>
                    <div class="size-selector">${p.sizes.map(s => `<button type="button" class="size-btn ${currentSelectedSize===s?'active':''}" onclick="chonSize('${s}', this)">${s}</button>`).join('')}</div>`;
            } else {
                let swatches = p.variants.map((v, i) => `<div class="swatch ${i===currentSelectedVariantIndex?'active':''}" style="background-color:${v.hex}" title="${v.colorName}" onclick="chonMauChiTiet(${p.id},${i})"></div>`).join('');
                let sizes = p.hasSize ? `<label style="font-weight:600;font-size:14px;margin-top:10px;display:block;">Chọn Size:</label><div class="size-selector">${p.sizes.map(s=>`<button type="button" class="size-btn ${currentSelectedSize===s?'active':''}" onclick="chonSize('${s}',this)">${s}</button>`).join('')}</div>` : '';
                selectorHtml = `<label style="font-weight:600;font-size:14px;">Chọn Màu: <span id="detailSelectedColorName" style="color:#ff5500;">${currentVar.colorName}</span></label><div class="color-swatches">${swatches}</div>${sizes}`;
            }

            let purchaseAreaHtml = '';
            if (currentCustomer.isAdmin) {
                purchaseAreaHtml = `<div style="background: #fadbd8; color: #c0392b; padding: 12px; border-radius: 6px; font-size: 13px; font-weight: 600; margin-top: 15px;">🛡️ Tài khoản Admin chỉ dùng kiểm tra tồn kho (${currentVar.stock} cái).</div>`;
            } else if (currentVar.stock <= 0) {
                purchaseAreaHtml = `<div style="margin: 12px 0; color: #e74c3c; font-weight: 700;">❌ Phân loại "${currentVar.colorName}" đã hết hàng!</div><button class="btn-submit btn-disabled" disabled>❌ Tạm hết hàng</button>`;
            } else {
                purchaseAreaHtml = `
                    <label style="font-weight:600;font-size:14px;display:block;margin-bottom:6px;">Số lượng:</label>
                    <div class="quantity-control">
                        <button class="qty-btn" onclick="thayDoiSoLuongChiTiet(-1, ${p.id})">-</button>
                        <input type="text" id="detailQtyInput" class="qty-input" value="${currentQty}" readonly>
                        <button class="qty-btn" onclick="thayDoiSoLuongChiTiet(1, ${p.id})">+</button>
                        <span style="margin-left: 10px; font-size: 13px; font-weight: 700; color: #27ae60; background: #eafaf1; padding: 6px 12px; border-radius: 6px; border: 1px solid #27ae60;">📦 Còn: ${currentVar.stock} cái ${inCartQty > 0 ? `(Trong giỏ: ${inCartQty})` : ''}</span>
                    </div>
                    <button class="btn-submit" style="padding:12px;margin-top:10px;" onclick="themVaoGioHangTuChiTiet(${p.id})">🛒 Thêm vào giỏ</button>`;
            }

            let calc = tinhGiaVaThanhTien(p.name, p.price, currentQty);
            let revStat = layThongKeDanhGiaSanPham(p.id);
            document.getElementById('detailContent').innerHTML = `<div class="detail-img-box"><img id="detailMainImg" src="${currentVar.img}"></div><div><h2 style="font-size:24px;font-weight:700;margin-bottom:4px;">${p.name}</h2><div style="font-size:13.5px; color:#64748b; margin-bottom:10px;">${taoHtmlSaoDanhGia(revStat.avgNum)} <b style="color:#111;">${revStat.ratingStr}</b> (${revStat.totalCount} đánh giá)</div><div style="font-size:20px;color:#e74c3c;font-weight:700;margin-bottom:15px;" id="detailPriceDisplay">${calc.unitPrice.toLocaleString('vi-VN')}đ</div>${selectorHtml}${purchaseAreaHtml}</div>`;
            veBangSizeVaDanhGiaChiTiet(p);
        }

        function chonThuocTinhQuanCombat(newColor, newCut) {
            if (newColor) combatSelectedColor = newColor;
            if (newCut) combatSelectedCut = newCut;
            let p = products.find(item => item.id === currentOpenedProductId);
            if (!p) return;
            let idx = p.variants.findIndex(v => v.baseColor === combatSelectedColor && v.cutStyle === combatSelectedCut);
            currentSelectedVariantIndex = idx !== -1 ? idx : 0;
            currentQty = 1;
            veNoiDungChiTietSanPham(p);
        }

        function chonMauChiTiet(id, idx) {
            currentSelectedVariantIndex = idx; currentQty = 1;
            let p = products.find(item => item.id === id);
            if (p) veNoiDungChiTietSanPham(p);
        }

        function chonSize(s, el) {
            currentSelectedSize = s;
            el.parentElement.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
            el.classList.add('active');
        }

        function thayDoiSoLuongChiTiet(delta, productId) {
            let p = products.find(item => item.id === productId);
            if (!p) return;
            let currentVar = p.variants[currentSelectedVariantIndex] || p.variants[0];
            let inCartQty = laySoLuongTrongGioTheoVariant(p.id, currentSelectedVariantIndex);
            let maxAvailableToAdd = Math.max(0, currentVar.stock - inCartQty);
            if (maxAvailableToAdd <= 0) { alert(`⚠️ Đã đạt giới hạn tồn kho (${currentVar.stock} cái)!`); return; }

            let nextQty = Math.max(1, Math.min(maxAvailableToAdd, currentQty + delta));
            currentQty = nextQty;
            document.getElementById('detailQtyInput').value = currentQty;
            let calc = tinhGiaVaThanhTien(p.name, p.price, currentQty);
            document.getElementById('detailPriceDisplay').innerText = `${calc.unitPrice.toLocaleString('vi-VN')}đ / cái (Tổng: ${calc.totalPrice.toLocaleString('vi-VN')}đ)`;
        }

        function themVaoGioHangTuChiTiet(id) {
            if (currentCustomer.isAdmin) return;
            let p = products.find(item => item.id === id);
            if (!p) return;
            let selectedVariant = p.variants[currentSelectedVariantIndex] || p.variants[0];
            let inCartQty = laySoLuongTrongGioTheoVariant(p.id, currentSelectedVariantIndex);
            if (inCartQty + currentQty > selectedVariant.stock) {
                alert(`❌ Không thể thêm! Phân loại "${selectedVariant.colorName}" chỉ còn ${selectedVariant.stock} cái.`);
                return;
            }
            let subInfo = `${selectedVariant.colorName}${currentSelectedSize ? ' · ' + currentSelectedSize : ''}`;
            let itemKey = `${p.name}_${subInfo}`;
            let calc = tinhGiaVaThanhTien(p.name, p.price, currentQty);

            let f = cart.find(i => i.itemKey === itemKey && !i.isCustom);
            if(f) {
                f.qty += currentQty;
                f.price = tinhGiaVaThanhTien(p.name, f.basePrice, f.qty).unitPrice;
            } else {
                cart.push({
                    itemKey, productId: p.id, variantIndex: currentSelectedVariantIndex,
                    name: p.name, subInfo, isCustom: false, isCustomJersey: false,
                    img: selectedVariant.img, swatchHex: selectedVariant.hex,
                    basePrice: p.price, price: calc.unitPrice, qty: currentQty
                });
            }
            luuGioHangLocal();
            capNhatGioHang();
            alert(`✅ Đã thêm "${p.name} (${subInfo})" (x${currentQty}) vào giỏ!`);
            veNoiDungChiTietSanPham(p);
        }

        function thayDoiSoLuongGioHang(index, delta) {
            let item = cart[index];
            if (!item) return;
            if (delta > 0) {
                let { prod, variant, vIdx } = timSanPhamVaVariantTuCartItem(item);
                if (prod && variant && laySoLuongTrongGioTheoVariant(prod.id, vIdx) + delta > variant.stock) {
                    alert(`⚠️ Tồn kho của phân loại "${variant.colorName}" chỉ còn ${variant.stock} cái!`);
                    return;
                }
            }
            item.qty += delta;
            if (item.qty <= 0) cart.splice(index, 1);
            else if (!item.isCustom && !item.isRoster) item.price = tinhGiaVaThanhTien(item.name, item.basePrice, item.qty).unitPrice;
            luuGioHangLocal();
            capNhatGioHang();
        }

        function xoaKhoiGioHang(index) {
            cart.splice(index, 1);
            luuGioHangLocal();
            capNhatGioHang();
        }

        let baloTextRotationDeg = 0;
        function changeBaloStudioModel() { selectedBaloStudioVariantIdx = 0; updateBaloPreview(); }
        function chonMauBaloStudio(idx, el) {
            selectedBaloStudioVariantIdx = idx;
            let prodId = parseInt(document.getElementById('baloModel').value) || 1;
            let prod = products.find(p => p.id === prodId);
            if (prod && prod.variants[idx]) {
                document.getElementById('baloImgMockup').src = prod.variants[idx].img;
                document.getElementById('baloStudioColorLabel').innerText = prod.variants[idx].colorName;
            }
            el.parentElement.querySelectorAll('.swatch').forEach(s => s.classList.remove('active'));
            el.classList.add('active');
            capNhatTrangThaiNutCustom();
        }
        function doiMauChuBalo(hexColor) {
            document.getElementById('customBadge').style.color = hexColor;
            document.getElementById('baloTextColorPicker').value = hexColor;
        }
        function capNhatStyleChuBalo() {
            let badge = document.getElementById('customBadge');
            let sizeVal = document.getElementById('baloFontSizeSlider').value;
            baloTextRotationDeg = parseInt(document.getElementById('baloRotateSlider').value) || 0;
            document.getElementById('baloFontSizeLabel').innerText = sizeVal + 'px';
            document.getElementById('baloRotateLabel').innerText = baloTextRotationDeg + '°';
            if (badge) {
                badge.style.fontSize = sizeVal + 'px';
                badge.style.transform = `translate(-50%, -50%) rotate(${baloTextRotationDeg}deg)`;
            }
        }
        function datGocXoayBalo(deg) { document.getElementById('baloRotateSlider').value = deg; capNhatStyleChuBalo(); }
        function updateBaloPreview() {
            let prodId = parseInt(document.getElementById('baloModel') ? document.getElementById('baloModel').value : '1') || 1;
            let prod = products.find(p => p.id === prodId);
            if (!prod) return;
            if (selectedBaloStudioVariantIdx >= prod.variants.length) selectedBaloStudioVariantIdx = 0;
            let currentVar = prod.variants[selectedBaloStudioVariantIdx];
            document.getElementById('baloImgMockup').src = currentVar.img;
            document.getElementById('baloStudioColorLabel').innerText = currentVar.colorName;
            document.getElementById('baloStudioSwatches').innerHTML = prod.variants.map((v, i) => `<div class="swatch ${i === selectedBaloStudioVariantIdx ? 'active' : ''}" style="background-color:${v.hex}" title="${v.colorName}" onclick="chonMauBaloStudio(${i}, this)"></div>`).join('');
            capNhatStyleChuBalo();
            capNhatTrangThaiNutCustom();
        }
        function updateBaloPreviewText() { document.getElementById('customBadge').innerText = document.getElementById('baloText').value.trim() || 'MAIRUA'; }

        function themBaloCustomVaoGio() {
            if (currentCustomer.isAdmin) return;
            let prodId = parseInt(document.getElementById('baloModel').value) || 1;
            let prod = products.find(p => p.id === prodId);
            let selectedVar = prod && prod.variants[selectedBaloStudioVariantIdx] ? prod.variants[selectedBaloStudioVariantIdx] : null;
            if (prod && selectedVar && laySoLuongTrongGioTheoVariant(prod.id, selectedBaloStudioVariantIdx) + 1 > selectedVar.stock) {
                alert(`❌ Mẫu "${prod.name} (${selectedVar.colorName})" chỉ còn tồn kho ${selectedVar.stock} cái!`);
                return;
            }
            let customText = document.getElementById('baloText').value.trim() || 'MAIRUA';
            let subInfo = `${selectedVar ? selectedVar.colorName : 'Đen'} · ${customText}`;
            let displayName = `${prod ? prod.name : 'MVP Elite Backpack'} — custom`;
            cart.push({
                productId: prodId, variantIndex: selectedBaloStudioVariantIdx,
                name: displayName, subInfo, isCustom: true, isCustomJersey: false,
                img: selectedVar ? selectedVar.img : document.getElementById('baloImgMockup').src,
                swatchHex: selectedVar ? selectedVar.hex : '#1e293b',
                basePrice: 850000, price: 850000, qty: 1
            });
            luuGioHangLocal();
            capNhatGioHang();
            alert(`✅ Đã thêm "${displayName} (${subInfo})" vào giỏ!`);
        }

        // STUDIO THIẾT KẾ JERSEY
        function renderBangMauJerseyStudio() {
            let baseHtml = jerseyBasePalette.map(c => `<span class="swatch-circle-sm ${jerseyStudioState.baseColorHex === c.hex ? 'active' : ''}" style="background:${c.hex};" title="${c.name}" onclick="chonMauPhoiJersey('${c.hex}','${c.name}','${c.stroke}')"></span>`).join('');
            let elBase1 = document.getElementById('studioBaseColorSwatches'), elBase2 = document.getElementById('rosterBaseSwatches');
            if (elBase1) elBase1.innerHTML = baseHtml;
            if (elBase2) elBase2.innerHTML = baseHtml;

            let trimHtml = textFillPalette.map(c => `<span class="swatch-circle-sm ${jerseyStudioState.trimColorHex === c.hex ? 'active' : ''}" style="background:${c.hex};" title="${c.name}" onclick="chonMauVienAoJersey('${c.hex}','${c.name}')"></span>`).join('');
            let elTrim1 = document.getElementById('studioTrimColorSwatches'), elTrim2 = document.getElementById('rosterTrimSwatches');
            if (elTrim1) elTrim1.innerHTML = trimHtml;
            if (elTrim2) elTrim2.innerHTML = trimHtml;

            let fillHtml = textFillPalette.map(c => `<span class="swatch-circle-sm ${jerseyStudioState.fillColorHex === c.hex ? 'active' : ''}" style="background:${c.hex};" title="${c.name}" onclick="chonMauChuJersey('${c.hex}','${c.name}')"></span>`).join('');
            let elFill1 = document.getElementById('studioFillColorSwatches'), elFill2 = document.getElementById('rosterFillSwatches');
            if (elFill1) elFill1.innerHTML = fillHtml;
            if (elFill2) elFill2.innerHTML = fillHtml;

            let noneActive = !jerseyStudioState.strokeColorHex ? 'active' : '';
            let strokeHtml = `<button type="button" class="stroke-none-pill ${noneActive}" onclick="chonMauVienJersey('','Không')">Không</button>` +
                textFillPalette.map(c => `<span class="swatch-circle-sm ${jerseyStudioState.strokeColorHex === c.hex ? 'active' : ''}" style="background:${c.hex};" title="${c.name}" onclick="chonMauVienJersey('${c.hex}','${c.name}')"></span>`).join('');
            let elStroke1 = document.getElementById('studioStrokeColorSwatches'), elStroke2 = document.getElementById('rosterStrokeSwatches');
            if (elStroke1) elStroke1.innerHTML = strokeHtml;
            if (elStroke2) elStroke2.innerHTML = strokeHtml;

            let shBase = document.getElementById('studioShortsColorSwatches');
            if (shBase) shBase.innerHTML = jerseyBasePalette.map(c => `<span class="swatch-circle-sm ${jerseyStudioState.shortsColorHex === c.hex ? 'active' : ''}" style="background:${c.hex};" title="${c.name}" onclick="chonMauPhoiQuan('${c.hex}','${c.name}')"></span>`).join('');
            let shTrim = document.getElementById('studioShortsTrimSwatches');
            if (shTrim) shTrim.innerHTML = textFillPalette.map(c => `<span class="swatch-circle-sm ${jerseyStudioState.shortsTrimHex === c.hex ? 'active' : ''}" style="background:${c.hex};" title="${c.name}" onclick="chonMauLineQuan('${c.hex}','${c.name}')"></span>`).join('');
        }

        function chonMauPhoiQuan(hex, name) {
            jerseyStudioState.shortsColorHex = hex; jerseyStudioState.shortsColorName = name; jerseyStudioState.shortsColorCustom = true;
            renderBangMauJerseyStudio(); updateJerseyPreview();
        }
        function chonMauLineQuan(hex, name) {
            jerseyStudioState.shortsTrimHex = hex; jerseyStudioState.shortsTrimName = name; jerseyStudioState.shortsTrimCustom = true;
            renderBangMauJerseyStudio(); updateJerseyPreview();
        }
        function capNhatScaleSoQuan() {
            let v = parseInt(document.getElementById('sliderScaleShortsNum').value) || 46;
            jerseyStudioState.shortsNumSize = v;
            let lbl = document.getElementById('valScaleShortsNum');
            if (lbl) lbl.innerText = v + 'px';
            updateJerseyPreview();
        }

        function chonMauPhoiJersey(hex, name, strokeHex) {
            jerseyStudioState.baseColorHex = hex; jerseyStudioState.baseColorName = name; jerseyStudioState.baseStrokeHex = strokeHex || '#333';
            if (!jerseyStudioState.shortsColorCustom) { jerseyStudioState.shortsColorHex = hex; jerseyStudioState.shortsColorName = name; }
            renderBangMauJerseyStudio(); updateJerseyPreview(); capNhatGiaoDienRoster(); capNhatTrangThaiNutCustom();
        }
        function chonMauVienAoJersey(hex, name) {
            jerseyStudioState.trimColorHex = hex; jerseyStudioState.trimColorName = name;
            if (!jerseyStudioState.shortsTrimCustom) { jerseyStudioState.shortsTrimHex = hex; jerseyStudioState.shortsTrimName = name; }
            renderBangMauJerseyStudio(); updateJerseyPreview(); capNhatGiaoDienRoster();
        }
        function chonMauChuJersey(hex, name) {
            jerseyStudioState.fillColorHex = hex; jerseyStudioState.fillColorName = name;
            renderBangMauJerseyStudio(); updateJerseyPreview(); capNhatGiaoDienRoster();
        }
        function chonMauVienJersey(hex, name) {
            jerseyStudioState.strokeColorHex = hex; jerseyStudioState.strokeColorName = name;
            renderBangMauJerseyStudio(); updateJerseyPreview(); capNhatGiaoDienRoster();
        }
        function thayDoiFontJerseyStudio(fontVal) {
            jerseyStudioState.fontFamily = fontVal;
            jerseyStudioState.fontLabel = fontVal.includes('Bebas') ? 'Bebas Neue' : (fontVal.includes('Anton') ? 'Anton' : (fontVal.includes('Teko') ? 'Teko' : 'Oswald'));
            document.querySelectorAll('.studio-font-card').forEach(btn => {
                btn.classList.toggle('active', btn.getAttribute('data-font') === fontVal);
            });
            updateJerseyPreview(); capNhatGiaoDienRoster();
        }
        function capNhatScaleJerseyStudio() {
            let fn = parseInt(document.getElementById('sliderScaleFrontNum') ? document.getElementById('sliderScaleFrontNum').value : 96) || 96;
            let bn = parseInt(document.getElementById('sliderScaleBackNum') ? document.getElementById('sliderScaleBackNum').value : 108) || 108;
            let bname = parseInt(document.getElementById('sliderScaleBackName') ? document.getElementById('sliderScaleBackName').value : 32) || 32;
            let tname = parseInt(document.getElementById('sliderScaleTeamName') ? document.getElementById('sliderScaleTeamName').value : 26) || 26;

            jerseyStudioState.scales = { frontNum: fn, backNum: bn, backName: bname, teamName: tname };
            if (document.getElementById('valScaleFrontNum')) document.getElementById('valScaleFrontNum').innerText = fn + 'px';
            if (document.getElementById('valScaleBackNum')) document.getElementById('valScaleBackNum').innerText = bn + 'px';
            if (document.getElementById('valScaleBackName')) document.getElementById('valScaleBackName').innerText = bname + 'px';
            if (document.getElementById('valScaleTeamName')) document.getElementById('valScaleTeamName').innerText = tname + 'px';
            updateJerseyPreview();
        }
        function chuyenMatAoJersey(side) {
            jerseyStudioState.viewSide = side;
            document.getElementById('btnViewFrontJersey').classList.toggle('active', side === 'front');
            document.getElementById('btnViewBackJersey').classList.toggle('active', side === 'back');
            updateJerseyPreview();
        }
        function capNhatVungInJerseyStudio() {
            jerseyStudioState.zones.backName = document.getElementById('chkZoneBackName').checked;
            jerseyStudioState.zones.backNum = document.getElementById('chkZoneBackNum').checked;
            jerseyStudioState.zones.frontNum = document.getElementById('chkZoneFrontNum').checked;
            jerseyStudioState.zones.frontLogo = document.getElementById('chkZoneFrontLogo').checked;
            if (document.getElementById('rosterChkBackName')) {
                document.getElementById('rosterChkBackName').checked = jerseyStudioState.zones.backName;
                document.getElementById('rosterChkBackNum').checked = jerseyStudioState.zones.backNum;
                document.getElementById('rosterChkFrontNum').checked = jerseyStudioState.zones.frontNum;
                document.getElementById('rosterChkFrontLogo').checked = jerseyStudioState.zones.frontLogo;
            }
            document.getElementById('frontLogoInputWrap').style.display = jerseyStudioState.zones.frontLogo ? 'block' : 'none';
            updateJerseyPreview(); capNhatGiaoDienRoster();
        }
        function dongBoVungInTuRoster() {
            jerseyStudioState.zones.backName = document.getElementById('rosterChkBackName').checked;
            jerseyStudioState.zones.backNum = document.getElementById('rosterChkBackNum').checked;
            jerseyStudioState.zones.frontNum = document.getElementById('rosterChkFrontNum').checked;
            jerseyStudioState.zones.frontLogo = document.getElementById('rosterChkFrontLogo').checked;
            if (document.getElementById('chkZoneBackName')) {
                document.getElementById('chkZoneBackName').checked = jerseyStudioState.zones.backName;
                document.getElementById('chkZoneBackNum').checked = jerseyStudioState.zones.backNum;
                document.getElementById('chkZoneFrontNum').checked = jerseyStudioState.zones.frontNum;
                document.getElementById('chkZoneFrontLogo').checked = jerseyStudioState.zones.frontLogo;
            }
            updateJerseyPreview(); capNhatGiaoDienRoster();
        }
        function tinhDonGiaMotAoJersey() {
            let fee = 0, count = 0;
            if (jerseyStudioState.zones.backName) { fee += 30000; count++; }
            if (jerseyStudioState.zones.backNum) { fee += 30000; count++; }
            if (jerseyStudioState.zones.frontNum) { fee += 30000; count++; }
            if (jerseyStudioState.zones.frontLogo) { fee += 50000; count++; }
            return { base: jerseyStudioState.basePrice, fee, count, unitTotal: jerseyStudioState.basePrice + fee };
        }
        function taiLogoNgucJersey(e) {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = function(ev) {
                let imgEl = document.getElementById('dragFrontLogoImg'), txtEl = document.getElementById('dragFrontLogoText');
                if (imgEl && txtEl) { imgEl.src = ev.target.result; imgEl.style.display = 'block'; txtEl.style.display = 'none'; }
            };
            reader.readAsDataURL(file);
        }

        function apDungStyleChuVaVien(el, isBigNumber = false) {
            if (!el) return;
            el.style.fontFamily = jerseyStudioState.fontFamily;
            el.style.color = jerseyStudioState.fillColorHex;
            el.style.fontWeight = '700';
            if (jerseyStudioState.strokeColorHex) {
                let w = isBigNumber ? '1.1px' : '0.65px';
                el.style.webkitTextStroke = `${w} ${jerseyStudioState.strokeColorHex}`;
                el.style.textShadow = `0 2px 5px rgba(0,0,0,0.18)`;
            } else {
                el.style.webkitTextStroke = '0px transparent';
                el.style.textShadow = '0 2px 4px rgba(0,0,0,0.18)';
            }
        }

        function batTatNenSangToiJersey() {
            let canvasBox = document.getElementById('studioRightCanvasBox');
            let btn = document.getElementById('btnToggleJerseyCanvasBg');
            if (!canvasBox || !btn) return;
            let isDark = canvasBox.classList.toggle('dark-canvas');
            btn.innerHTML = isDark ? '☀️ Nền sáng' : '🌙 Nền tối';
        }

        function updateJerseyPreview() {
            let svgBody = document.getElementById('jerseySvgBody');
            if (svgBody) {
                svgBody.setAttribute('fill', jerseyStudioState.baseColorHex);
                svgBody.setAttribute('stroke', 'none');
                let sideL = document.getElementById('jerseySvgSideLeft');
                let sideR = document.getElementById('jerseySvgSideRight');
                let trimHexSide = jerseyStudioState.trimColorHex || '#eab308';
                if (sideL) sideL.setAttribute('stroke', trimHexSide);
                if (sideR) sideR.setAttribute('stroke', trimHexSide);
                let colEl = document.getElementById('jerseySvgCollar');
                let armL = document.getElementById('jerseySvgArmLeft');
                let armR = document.getElementById('jerseySvgArmRight');
                let trimHex = jerseyStudioState.trimColorHex || '#eab308';
                if (colEl) colEl.setAttribute('stroke', trimHex);
                if (armL) armL.setAttribute('stroke', trimHex);
                if (armR) armR.setAttribute('stroke', trimHex);
            }
            let backNameEl = document.getElementById('dragBackName');
            let backNumEl = document.getElementById('dragBackNum');
            let frontLogoEl = document.getElementById('dragFrontLogo');
            let frontLogoTxt = document.getElementById('dragFrontLogoText');
            let frontNumEl = document.getElementById('dragFrontNum');

            let playerName = (document.getElementById('jerseyName') ? document.getElementById('jerseyName').value : 'LAM').toUpperCase() || 'LAM';
            let playerNum = (document.getElementById('jerseyNumber') ? document.getElementById('jerseyNumber').value : '23') || '23';
            let teamName = (document.getElementById('teamNameInput') ? document.getElementById('teamNameInput').value : 'SAIGON OWLS').toUpperCase() || 'SAIGON OWLS';

            let sc = jerseyStudioState.scales || { frontNum: 96, backNum: 108, backName: 32, teamName: 26 };

            if (backNameEl) {
                backNameEl.innerText = playerName;
                backNameEl.style.fontSize = sc.backName + 'px';
                apDungStyleChuVaVien(backNameEl, false);
                backNameEl.style.display = (jerseyStudioState.viewSide === 'back' && jerseyStudioState.zones.backName) ? 'block' : 'none';
            }
            if (backNumEl) {
                backNumEl.innerText = playerNum;
                backNumEl.style.fontSize = sc.backNum + 'px';
                apDungStyleChuVaVien(backNumEl, true);
                backNumEl.style.display = (jerseyStudioState.viewSide === 'back' && jerseyStudioState.zones.backNum) ? 'block' : 'none';
            }
            if (frontLogoEl) {
                if (frontLogoTxt) frontLogoTxt.innerText = teamName;
                frontLogoEl.style.fontSize = sc.teamName + 'px';
                let logoImg = document.getElementById('dragFrontLogoImg');
                if (logoImg) logoImg.style.maxHeight = (sc.teamName * 1.9) + 'px';
                apDungStyleChuVaVien(frontLogoEl, false);
                frontLogoEl.style.display = (jerseyStudioState.viewSide === 'front' && jerseyStudioState.zones.frontLogo) ? 'block' : 'none';
            }
            if (frontNumEl) {
                frontNumEl.innerText = playerNum;
                frontNumEl.style.fontSize = sc.frontNum + 'px';
                apDungStyleChuVaVien(frontNumEl, true);
                frontNumEl.style.display = (jerseyStudioState.viewSide === 'front' && jerseyStudioState.zones.frontNum) ? 'block' : 'none';
            }

            let priceObj = tinhGiaTheoCheDoJerseyStudio();
            document.getElementById('studioBasePriceText').innerText = priceObj.base.toLocaleString('vi-VN') + 'đ';
            document.getElementById('studioPrintZonesCountText').innerText = `Phí in (${priceObj.count} vùng)`;
            document.getElementById('studioPrintFeeText').innerText = priceObj.fee.toLocaleString('vi-VN') + 'đ';
            document.getElementById('studioTotalPriceText').innerText = priceObj.unitTotal.toLocaleString('vi-VN') + 'đ';
            capNhatXemTruocQuanJersey(playerNum);
        }

        function tinhGiaTheoCheDoJerseyStudio() {
            let mode = jerseyStudioState.mode || 'jersey';
            let j = tinhDonGiaMotAoJersey();
            if (mode === 'shorts') {
                return { base: SHORTS_ONLY_BASE_PRICE, fee: SHORTS_NUM_FEE, count: 1, unitTotal: SHORTS_ONLY_BASE_PRICE + SHORTS_NUM_FEE };
            }
            if (mode === 'set') {
                let fee = j.fee + SHORTS_NUM_FEE;
                return { base: SET_BASE_PRICE, fee, count: j.count + 1, unitTotal: SET_BASE_PRICE + fee };
            }
            return j;
        }

        function capNhatXemTruocQuanJersey(playerNum) {
            let trim = jerseyStudioState.shortsTrimHex || '#eab308';
            let body = document.getElementById('shortsSvgBody');
            if (body) body.setAttribute('fill', jerseyStudioState.shortsColorHex);
            let sl = document.getElementById('shortsSvgSideLeft'), sr = document.getElementById('shortsSvgSideRight');
            if (sl) sl.setAttribute('stroke', trim);
            if (sr) sr.setAttribute('stroke', trim);
            let numEl = document.getElementById('shortsFrontNum');
            if (numEl) {
                numEl.innerText = playerNum || '23';
                apDungStyleChuVaVien(numEl, true);
                numEl.style.fontSize = (jerseyStudioState.shortsNumSize || 46) + 'px';
            }
        }

        function chuyenCheDoJerseyStudio(mode) {
            jerseyStudioState.mode = mode;
            document.querySelectorAll('#studioModePills button').forEach(b => b.classList.toggle('active', b.getAttribute('data-mode') === mode));
            let showJersey = mode !== 'shorts';
            let showShorts = mode !== 'jersey';
            let stage = document.getElementById('jerseyStageContainer');
            let pills = document.querySelector('.view-toggle-pills');
            let zones = document.getElementById('jerseyZonesWrap');
            let nameCol = document.getElementById('jerseyNameCol');
            let footer = document.getElementById('jerseyFooterBox');
            let shortsBox = document.getElementById('shortsPreviewBox');
            if (stage) stage.style.display = showJersey ? '' : 'none';
            if (pills) pills.style.display = showJersey ? '' : 'none';
            if (zones) zones.style.display = showJersey ? '' : 'none';
            if (nameCol) nameCol.style.display = showJersey ? '' : 'none';
            if (footer) footer.style.display = showJersey ? '' : 'none';
            if (shortsBox) shortsBox.style.display = showShorts ? 'block' : 'none';
            let scWrap = document.getElementById('shortsColorWrap'), scRow = document.getElementById('shortsScaleRow');
            if (scWrap) scWrap.style.display = showShorts ? 'block' : 'none';
            if (scRow) scRow.style.display = showShorts ? '' : 'none';
            let hints = {
                jersey: 'Áo ba lỗ custom: phôi 200.000đ + phí in.',
                shorts: '',
                set: '🔥 Nguyên bộ áo + quần: phôi chỉ 250.000đ + phí in (số quần in bên phải, kéo thả được).'
            };
            let hintEl = document.getElementById('studioModeHint');
            if (hintEl) hintEl.innerText = hints[mode];
            let titleEl = document.querySelector('#studioBaseColorSwatches') ? document.querySelector('#studioBaseColorSwatches').previousElementSibling : null;
            if (titleEl) titleEl.innerText = mode === 'shorts' ? 'MÀU PHÔI QUẦN' : (mode === 'set' ? 'MÀU PHÔI BỘ (ÁO + QUẦN)' : 'MÀU PHÔI ÁO JERSEY (ÁO BA LỖ)');
            updateJerseyPreview();
            capNhatTrangThaiNutCustom();
        }

        function datLaiViTriChuSoJersey() {
            document.getElementById('dragBackName').style.top = '29%'; document.getElementById('dragBackName').style.left = '50%';
            document.getElementById('dragBackNum').style.top = '57%'; document.getElementById('dragBackNum').style.left = '50%';
            document.getElementById('dragFrontLogo').style.top = '29%'; document.getElementById('dragFrontLogo').style.left = '50%';
            document.getElementById('dragFrontNum').style.top = '56%'; document.getElementById('dragFrontNum').style.left = '50%';
            let shNum = document.getElementById('shortsFrontNum');
            if (shNum) { shNum.style.top = '68%'; shNum.style.left = '64%'; }
            jerseyStudioState.shortsNumSize = 46;
            let shSlider = document.getElementById('sliderScaleShortsNum'); if (shSlider) shSlider.value = 46;
            let shLbl = document.getElementById('valScaleShortsNum'); if (shLbl) shLbl.innerText = '46px';
            if (document.getElementById('sliderScaleFrontNum')) document.getElementById('sliderScaleFrontNum').value = 96;
            if (document.getElementById('sliderScaleBackNum')) document.getElementById('sliderScaleBackNum').value = 108;
            if (document.getElementById('sliderScaleBackName')) document.getElementById('sliderScaleBackName').value = 32;
            if (document.getElementById('sliderScaleTeamName')) document.getElementById('sliderScaleTeamName').value = 26;
            capNhatScaleJerseyStudio();
        }

        function kichHoatKeoTha(element) {
            if (!element) return;
            let isDragging = false, startX, startY, initialLeft, initialTop;
            element.addEventListener('mousedown', (e) => {
                isDragging = true;
                const parentRect = element.parentElement.getBoundingClientRect();
                const elRect = element.getBoundingClientRect();
                initialLeft = (elRect.left + elRect.width / 2) - parentRect.left;
                initialTop = (elRect.top + elRect.height / 2) - parentRect.top;
                startX = e.clientX; startY = e.clientY;
                e.preventDefault();
            });
            document.addEventListener('mousemove', (e) => {
                if (!isDragging) return;
                const parentRect = element.parentElement.getBoundingClientRect();
                let leftPercent = Math.max(12, Math.min(88, ((initialLeft + (e.clientX - startX)) / parentRect.width) * 100));
                let topPercent = Math.max(12, Math.min(88, ((initialTop + (e.clientY - startY)) / parentRect.height) * 100));
                element.style.left = leftPercent + '%';
                element.style.top = topPercent + '%';
                element.style.transform = element.id === 'customBadge' ? `translate(-50%, -50%) rotate(${baloTextRotationDeg}deg)` : 'translate(-50%, -50%)';
            });
            document.addEventListener('mouseup', () => { isDragging = false; });
        }

        function themJerseyCustomVaoGio() {
            if (currentCustomer.isAdmin) return;
            let mode = jerseyStudioState.mode || 'jersey';
            let prod = products.find(p => p.id === 22);
            let vIdx = timVariantIndexPhoiJerseyTheoTenMau(jerseyStudioState.baseColorName);
            let selectedVar = prod && prod.variants[vIdx] ? prod.variants[vIdx] : null;
            if (mode !== 'shorts' && prod && selectedVar && laySoLuongTrongGioTheoVariant(prod.id, vIdx) + 1 > selectedVar.stock) {
                alert(`❌ Phôi áo Jersey màu "${selectedVar.colorName}" chỉ còn ${selectedVar.stock} cái trong kho!`);
                return;
            }
            let priceObj = tinhDonGiaMotAoJersey();
            let pName = (document.getElementById('jerseyName').value || 'LAM').toUpperCase();
            let pNum = (document.getElementById('jerseyNumber').value || '23');
            let sz = document.getElementById('studioSizeSelect').value || 'M';

            if (mode !== 'jersey') {
                // Quần custom: line 2 bên theo màu viền + số bên trái phía trước
                let shortsPrice = (mode === 'set' ? SET_SHORTS_PART_PRICE : SHORTS_ONLY_BASE_PRICE) + SHORTS_NUM_FEE;
                let shortsSub = `${jerseyStudioState.shortsColorName} (Line 2 bên: ${jerseyStudioState.shortsTrimName || 'Vàng gold'}) · Số #${pNum} bên phải phía trước · Size ${sz} (${jerseyStudioState.fontLabel})${mode === 'set' ? ' · Nguyên bộ' : ''}`;
                if (mode === 'set') {
                    let jerseyPrice = SET_JERSEY_PART_PRICE + priceObj.fee;
                    let jerseySub = `${jerseyStudioState.baseColorName} (Viền áo: ${jerseyStudioState.trimColorName || 'Vàng gold'}) · ${pName} #${pNum} · Size ${sz} (${jerseyStudioState.fontLabel}) · Nguyên bộ`;
                    cart.push({
                        productId: 22, variantIndex: vIdx,
                        name: `MVP Elite Jersey — custom`, subInfo: jerseySub,
                        isCustom: true, isCustomJersey: true,
                        swatchHex: jerseyStudioState.baseColorHex,
                        img: selectedVar ? selectedVar.img : '',
                        basePrice: jerseyPrice, price: jerseyPrice, qty: 1
                    });
                }
                cart.push({
                    name: `MVP Elite Shorts — custom`, subInfo: shortsSub,
                    isCustom: true, isCustomShorts: true,
                    swatchHex: jerseyStudioState.shortsColorHex,
                    img: '',
                    basePrice: shortsPrice, price: shortsPrice, qty: 1
                });
                luuGioHangLocal();
                capNhatGioHang();
                alert(mode === 'set' ? `✅ Đã thêm nguyên bộ Áo + Quần custom vào giỏ!` : `✅ Đã thêm "MVP Elite Shorts — custom (${shortsSub})" vào giỏ!`);
                return;
            }

            let subInfo = `${jerseyStudioState.baseColorName} (Viền áo: ${jerseyStudioState.trimColorName || 'Vàng gold'}) · ${pName} #${pNum} · Size ${sz} (${jerseyStudioState.fontLabel})`;

            cart.push({
                productId: 22, variantIndex: vIdx,
                name: `MVP Elite Jersey — custom`, subInfo,
                isCustom: true, isCustomJersey: true,
                swatchHex: jerseyStudioState.baseColorHex,
                img: selectedVar ? selectedVar.img : '',
                basePrice: priceObj.unitTotal, price: priceObj.unitTotal, qty: 1
            });
            luuGioHangLocal();
            capNhatGioHang();
            alert(`✅ Đã thêm "MVP Elite Jersey — custom (${subInfo})" vào giỏ!`);
        }

        function chuyenSangTrangDatChoDoi() { chuyenTab('roster'); }

        // LOGIC TRANG ĐẶT CHO CẢ ĐỘI - ROSTER
        function demSoAoBiTrung(playersArr) {
            let counts = {};
            playersArr.forEach(p => {
                let num = String(p.number).trim();
                if (num !== '') counts[num] = (counts[num] || 0) + 1;
            });
            return counts;
        }

        function capNhatGiaoDienRoster() {
            let tbody = document.getElementById('rosterTableBody');
            if (!tbody) return;
            let numCounts = demSoAoBiTrung(rosterPlayers);
            let dupNumbersList = Object.keys(numCounts).filter(k => numCounts[k] > 1);

            tbody.innerHTML = rosterPlayers.map((p, idx) => {
                let isDup = numCounts[String(p.number).trim()] > 1;
                let dupHtml = isDup ? `<div class="dup-warning-tag">⚠ Trùng số</div>` : '';
                let strokeCss = jerseyStudioState.strokeColorHex ? `-webkit-text-stroke: 0.45px ${jerseyStudioState.strokeColorHex};` : '';

                return `<tr>
                    <td style="color:#666; font-weight:600;">${idx + 1}</td>
                    <td>
                        <div class="mini-jersey-thumb" style="background:${jerseyStudioState.baseColorHex}; border: 2px solid ${jerseyStudioState.trimColorHex || '#eab308'}; color:${jerseyStudioState.fillColorHex}; font-family:${jerseyStudioState.fontFamily}; ${strokeCss}">
                            <span style="font-size:6px; opacity:0.9;">${(p.name || '').substring(0,5)}</span>
                            <span style="font-size:13px;">${p.number}</span>
                        </div>
                    </td>
                    <td><input type="text" class="roster-input-clean" value="${p.name}" oninput="capNhatDongRoster(${idx}, 'name', this.value)" placeholder="Tên in lưng..."></td>
                    <td><input type="text" class="roster-input-clean" value="${p.number}" oninput="capNhatDongRoster(${idx}, 'number', this.value)" style="width:65px; font-weight:700;">${dupHtml}</td>
                    <td><select class="roster-input-clean" onchange="capNhatDongRoster(${idx}, 'size', this.value)" style="cursor:pointer;">${['S','M','L','XL','2XL'].map(sz => `<option value="${sz}" ${p.size===sz?'selected':''}>${sz}</option>`).join('')}</select></td>
                    <td><input type="number" min="1" max="50" class="roster-input-clean" value="${p.qty}" onchange="capNhatDongRoster(${idx}, 'qty', this.value)" style="width:52px;"></td>
                    <td style="text-align:center;"><button type="button" onclick="xoaDongCauThuRoster(${idx})" style="background:none; border:none; color:#888; font-size:16px; cursor:pointer;">&times;</button></td>
                </tr>`;
            }).join('');

            capNhatTomTatGiaRoster(dupNumbersList.length);
        }

        function capNhatDongRoster(idx, field, val) {
            if (!rosterPlayers[idx]) return;
            if (field === 'qty') rosterPlayers[idx].qty = Math.max(1, parseInt(val) || 1);
            else if (field === 'name') rosterPlayers[idx].name = val.toUpperCase();
            else rosterPlayers[idx][field] = val;

            if (field !== 'name') capNhatGiaoDienRoster();
            else {
                let numCounts = demSoAoBiTrung(rosterPlayers);
                capNhatTomTatGiaRoster(Object.keys(numCounts).filter(k => numCounts[k] > 1).length);
            }
        }

        function themDongCauThuRoster() {
            rosterPlayers.push({ name: 'PLAYER', number: String(Math.floor(Math.random() * 90) + 1), size: 'L', qty: 1 });
            capNhatGiaoDienRoster();
        }
        function xoaDongCauThuRoster(idx) {
            if (rosterPlayers.length <= 1) { alert("⚠️ Cần có ít nhất 1 cầu thủ!"); return; }
            rosterPlayers.splice(idx, 1);
            capNhatGiaoDienRoster();
        }
        function taiFileMauCSVRoster() {
            let csvContent = "STT,TEN_CAU_THU,SO_AO,SIZE,SO_LUONG\n" + rosterPlayers.map((p, i) => `${i + 1},${p.name},${p.number},${p.size},${p.qty}`).join("\n");
            let blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
            let a = document.createElement('a');
            a.href = URL.createObjectURL(blob); a.download = "roster_mau_mairua.csv";
            document.body.appendChild(a); a.click(); document.body.removeChild(a);
        }

        function capNhatTomTatGiaRoster(dupCount) {
            let teamTitle = (document.getElementById('rosterTeamTitleInput') ? document.getElementById('rosterTeamTitleInput').value.trim() : 'MVP Saigon Owls') || 'MVP Saigon Owls';
            let totalJerseys = rosterPlayers.reduce((s, p) => s + (parseInt(p.qty) || 1), 0);
            let priceObj = tinhDonGiaMotAoJersey();
            let rawSubtotal = totalJerseys * priceObj.unitTotal;

            let discountPercent = totalJerseys >= 20 ? 15 : (totalJerseys >= 10 ? 10 : (totalJerseys >= 5 ? 5 : 0));
            let discountAmt = Math.round(rawSubtotal * (discountPercent / 100));
            let finalRosterTotal = rawSubtotal - discountAmt;

            document.getElementById('rosterSummaryHeading').innerText = `ROSTER ${teamTitle.toUpperCase()} – ${totalJerseys} JERSEY`;
            document.getElementById('rosterSummarySpecs').innerText = `${jerseyStudioState.baseColorName} (Viền áo ${jerseyStudioState.trimColorName || 'Vàng gold'}) · ${jerseyStudioState.fontLabel} · ${jerseyStudioState.fillColorName}/${jerseyStudioState.strokeColorName || 'Không viền'}`;
            document.getElementById('rosterCalcLineLabel').innerText = `${totalJerseys} × ${priceObj.unitTotal.toLocaleString('vi-VN')}đ`;
            document.getElementById('rosterSubtotalText').innerText = rawSubtotal.toLocaleString('vi-VN') + 'đ';
            document.getElementById('rosterDiscountLabel').innerText = `Giảm theo SL (${discountPercent}%)`;
            document.getElementById('rosterDiscountAmountText').innerText = `-${discountAmt.toLocaleString('vi-VN')}đ`;
            document.getElementById('rosterFinalTotalText').innerText = finalRosterTotal.toLocaleString('vi-VN') + 'đ';

            let dupBox = document.getElementById('rosterDuplicateAlertBox');
            if (dupBox) {
                dupBox.style.display = dupCount > 0 ? 'block' : 'none';
                document.getElementById('rosterDupCountSpan').innerText = dupCount;
            }
        }

        function themRosterVaoGioHang() {
            if (currentCustomer.isAdmin) return;
            let teamTitle = (document.getElementById('rosterTeamTitleInput').value.trim() || 'MVP Saigon Owls');
            let totalJerseys = rosterPlayers.reduce((s, p) => s + (parseInt(p.qty) || 1), 0);
            let priceObj = tinhDonGiaMotAoJersey();
            let specsText = `${jerseyStudioState.baseColorName} (Viền áo ${jerseyStudioState.trimColorName || 'Vàng gold'}) · ${jerseyStudioState.fontLabel} · ${jerseyStudioState.fillColorName}/${jerseyStudioState.strokeColorName || 'Không viền'}`;

            let prod = products.find(p => p.id === 22);
            let vIdx = timVariantIndexPhoiJerseyTheoTenMau(jerseyStudioState.baseColorName);
            let selectedVar = prod && prod.variants[vIdx] ? prod.variants[vIdx] : null;
            if (prod && selectedVar && totalJerseys > selectedVar.stock) {
                alert(`❌ Phôi áo Jersey màu "${selectedVar.colorName}" hiện chỉ còn ${selectedVar.stock} cái trong kho, chưa đủ cho đội ${totalJerseys} áo!`);
                return;
            }

            let existingIdx = cart.findIndex(i => i.isRoster && i.teamTitle === teamTitle);
            let rosterCartItem = {
                productId: 22, variantIndex: vIdx,
                isCustom: true, isCustomJersey: true, isRoster: true, showRosterTable: true,
                teamTitle,
                name: `Roster ${teamTitle} — ${totalJerseys} Jersey`,
                subInfo: specsText,
                swatchHex: jerseyStudioState.baseColorHex,
                rosterList: JSON.parse(JSON.stringify(rosterPlayers)),
                basePrice: priceObj.unitTotal, price: priceObj.unitTotal, qty: totalJerseys
            };

            if (existingIdx !== -1) cart[existingIdx] = rosterCartItem;
            else cart.push(rosterCartItem);

            luuGioHangLocal();
            capNhatGioHang();
            chuyenTab('cart');
        }

        function batTatBangCauThuTrongGio(idx) {
            if (!cart[idx]) return;
            cart[idx].showRosterTable = !cart[idx].showRosterTable;
            luuGioHangLocal();
            capNhatGioHang();
        }

        function suaRosterTuGioHang(idx) {
            let item = cart[idx];
            if (item && item.isRoster && Array.isArray(item.rosterList)) {
                rosterPlayers = JSON.parse(JSON.stringify(item.rosterList));
                let titleInput = document.getElementById('rosterTeamTitleInput');
                if (titleInput && item.teamTitle) titleInput.value = item.teamTitle;
            }
            chuyenTab('roster');
        }

        function tinhToanChiTietGioHang() {
            let subtotal = 0, customItemsQty = 0;
            cart.forEach(i => {
                subtotal += i.price * i.qty;
                if (i.isCustom || i.isRoster) customItemsQty += i.qty;
            });

            let rosterDiscPercent = customItemsQty >= 20 ? 15 : (customItemsQty >= 10 ? 10 : (customItemsQty >= 5 ? 5 : 0));
            let customSubtotal = cart.filter(i => i.isCustom || i.isRoster).reduce((s, i) => s + i.price * i.qty, 0);
            let rosterDiscountAmt = Math.round(customSubtotal * (rosterDiscPercent / 100));

            let voucherDiscountAmt = 0;
            let shippingFee = cart.length > 0 ? 30000 : 0;
            if (appliedCoupon && subtotal > 0 && appliedCoupon.percent) {
                voucherDiscountAmt = Math.round((subtotal - rosterDiscountAmt) * (appliedCoupon.percent / 100));
            }
            // FREESHIP: đơn hàng trên 2.000.000đ (sau giảm roster/voucher) được miễn phí vận chuyển
            if (cart.length > 0 && (subtotal - rosterDiscountAmt - voucherDiscountAmt) > 2000000) shippingFee = 0;

            let useMCoin = document.getElementById('chkUseMCoin') ? document.getElementById('chkUseMCoin').checked : false;
            let mCoinDiscountAmt = 0;
            let availableCoin = currentCustomer.loggedIn ? (currentCustomer.mcoin || 0) : 0;
            if (useMCoin && subtotal > 0 && availableCoin > 0) {
                let afterVoucher = Math.max(0, subtotal - rosterDiscountAmt - voucherDiscountAmt);
                mCoinDiscountAmt = Math.min(availableCoin, Math.round(afterVoucher * 0.3));
            }

            let totalDiscount = rosterDiscountAmt + voucherDiscountAmt + mCoinDiscountAmt;
            let rawFinal = Math.max(0, subtotal - totalDiscount + shippingFee);
            let finalTotal = Math.round(rawFinal / 1000) * 1000;
            return { subtotal, customItemsQty, rosterDiscPercent, rosterDiscountAmt, voucherDiscountAmt, mCoinDiscountAmt, shippingFee, totalDiscount, finalTotal };
        }

        function capNhatGioHang() {
            luuGioHangLocal();
            let totalCount = cart.reduce((s, i) => s + i.qty, 0);
            document.getElementById('cartCount').innerText = totalCount;
            document.getElementById('cartPageHeaderTitle').innerText = `GIỎ HÀNG (${cart.length})`;

            let availCoinEl = document.getElementById('cartAvailableMCoinText');
            if (availCoinEl) availCoinEl.innerText = (currentCustomer.mcoin || 0).toLocaleString('vi-VN');

            renderDanhSachDiaChiTrongGioHang();

            let container = document.getElementById('cartPageItemsContainer');
            if (!container) return;

            if (cart.length === 0) {
                container.innerHTML = `<div style="text-align:center; padding: 45px 20px;"><div style="font-size: 46px; margin-bottom: 10px;">🛒</div><h3 style="margin-bottom: 8px; color:#333;">Giỏ hàng của bạn đang trống</h3><button type="button" class="btn-orange-primary" style="width:auto; padding:10px 24px; margin-top:10px;" onclick="chuyenTab('home')">Tiếp tục mua sắm</button></div>`;
            } else {
                container.innerHTML = cart.map((item, idx) => {
                    let itemTotal = item.price * item.qty;
                    let thumbHtml = item.swatchHex && (item.isCustom || item.isRoster)
                        ? `<div class="cart-thumb-swatch" style="background:${item.swatchHex};"></div>`
                        : `<img src="${item.img || ''}" class="cart-thumb-swatch" alt="SP">`;

                    if (item.isRoster && Array.isArray(item.rosterList)) {
                        let numCounts = demSoAoBiTrung(item.rosterList);
                        let subRows = item.rosterList.map(r => {
                            let isDup = numCounts[String(r.number).trim()] > 1;
                            return `<tr><td style="font-weight:500;">${r.name}</td><td>${r.number} ${isDup ? '<span class="dup-warning-tag" style="margin-left:6px;">TRÙNG</span>' : ''}</td><td>${r.size}</td><td>${r.qty}</td></tr>`;
                        }).join('');

                        return `<div class="cart-page-item">
                            <div class="cart-item-main-row">
                                <div style="display:flex; gap:14px; flex:1;">
                                    ${thumbHtml}
                                    <div>
                                        <div style="font-weight:700; font-size:15px; color:#111;">${item.name}</div>
                                        <div style="font-size:12.5px; color:#777; margin-top:2px;">${item.subInfo || ''}</div>
                                        <div>
                                            <span class="badge-in-custom">IN CUSTOM</span>
                                            <button type="button" class="btn-toggle-roster-sub" onclick="batTatBangCauThuTrongGio(${idx})">${item.showRosterTable ? `Ẩn ${item.rosterList.length} cầu thủ ▴` : `Hiện ${item.rosterList.length} cầu thủ ▾`}</button>
                                        </div>
                                    </div>
                                </div>
                                <div style="display:flex; align-items:center; gap:24px;">
                                    <span style="color:#666; font-size:13.5px; font-weight:600;">x${item.qty}</span>
                                    <div style="text-align:right; min-width:110px;">
                                        <div style="color:#ff5500; font-weight:800; font-size:15.5px;">${itemTotal.toLocaleString('vi-VN')}đ</div>
                                        <span onclick="xoaKhoiGioHang(${idx})" style="font-size:12px; color:#888; cursor:pointer;">Xóa</span>
                                    </div>
                                </div>
                            </div>
                            ${item.showRosterTable ? `<div style="padding-left: 76px; margin-top: 8px;"><table class="cart-roster-subtable"><thead><tr><th>TÊN</th><th>SỐ</th><th>SIZE</th><th>SL</th></tr></thead><tbody>${subRows}</tbody></table><div style="margin-top:8px;"><span onclick="suaRosterTuGioHang(${idx})" style="color:#ff5500; font-size:12.5px; font-weight:700; cursor:pointer;">Sửa roster →</span></div></div>` : ''}
                        </div>`;
                    }

                    return `<div class="cart-page-item">
                        <div class="cart-item-main-row">
                            <div style="display:flex; gap:14px; flex:1;">
                                ${thumbHtml}
                                <div>
                                    <div style="font-weight:700; font-size:15px; color:#111;">${item.name}</div>
                                    <div style="font-size:12.5px; color:#777; margin-top:2px;">${item.subInfo || ''}</div>
                                    ${item.isCustom ? `<span class="badge-in-custom">IN CUSTOM</span>` : ''}
                                </div>
                            </div>
                            <div style="display:flex; align-items:center; gap:20px;">
                                <div style="display:flex; align-items:center; gap:8px;">
                                    <button class="qty-btn" style="width:28px;height:28px;background:#f3f4f6;border:1px solid #e5e7eb;" onclick="thayDoiSoLuongGioHang(${idx}, -1)">-</button>
                                    <span style="font-weight:600;font-size:13.5px;min-width:20px;text-align:center;">${item.qty}</span>
                                    <button class="qty-btn" style="width:28px;height:28px;background:#f3f4f6;border:1px solid #e5e7eb;" onclick="thayDoiSoLuongGioHang(${idx}, 1)">+</button>
                                </div>
                                <div style="text-align:right; min-width:110px;">
                                    <div style="color:#ff5500; font-weight:800; font-size:15.5px;">${itemTotal.toLocaleString('vi-VN')}đ</div>
                                    <span onclick="xoaKhoiGioHang(${idx})" style="font-size:12px; color:#888; cursor:pointer;">Xóa</span>
                                </div>
                            </div>
                        </div>
                    </div>`;
                }).join('');
            }

            let totals = tinhToanChiTietGioHang();
            document.getElementById('cartSubtotal').innerText = totals.subtotal.toLocaleString('vi-VN') + 'đ';

            let rosterRow = document.getElementById('cartRosterDiscountRow');
            if (rosterRow) {
                rosterRow.style.display = totals.rosterDiscountAmt > 0 ? 'flex' : 'none';
                document.getElementById('cartRosterDiscountLabel').innerText = `Giảm roster (${totals.customItemsQty} SP custom · ${totals.rosterDiscPercent}%)`;
                document.getElementById('cartRosterDiscountAmount').innerText = `-${totals.rosterDiscountAmt.toLocaleString('vi-VN')}đ`;
            }

            document.getElementById('cartDiscountLabel').innerText = (appliedCoupon && totals.voucherDiscountAmt > 0) ? `Voucher (${appliedCoupon.code})` : `Voucher (chưa áp)`;
            document.getElementById('cartDiscountAmount').innerText = `-${totals.voucherDiscountAmt.toLocaleString('vi-VN')}đ`;
            document.getElementById('cartMCoinAmount').innerText = `-${totals.mCoinDiscountAmt.toLocaleString('vi-VN')}đ`;
            document.getElementById('cartShippingFee').innerText = (cart.length > 0 && totals.shippingFee === 0) ? 'Miễn phí 🎉' : totals.shippingFee.toLocaleString('vi-VN') + 'đ';
            document.getElementById('cartTotal').innerText = totals.finalTotal.toLocaleString('vi-VN') + 'đ';

            let curTierInfo = layThongTinHangThanhVien(currentCustomer.phone);
            let earnedCoin = Math.round(totals.finalTotal * curTierInfo.rateDecimal);
            let rateLabelEl = document.getElementById('cartCashbackRateText');
            if (rateLabelEl) rateLabelEl.innerText = `${curTierInfo.ratePercent}% M-Coin (${curTierInfo.tierName})`;
            document.getElementById('cartEarnedCoinText').innerText = `+${earnedCoin.toLocaleString('vi-VN')}`;
            let hasCustomItems = cart.some(i => i.isCustom || i.isRoster);
            let warnBox = document.getElementById('cartCustomWarningBox');
            if (warnBox) {
                warnBox.style.display = hasCustomItems ? 'block' : 'none';
                let estSpan = document.getElementById('cartDynamicEstDate');
                if (estSpan) {
                    let customJerseyCount = cart.filter(i => i.isCustomJersey || i.isRoster).reduce((s, i) => s + i.qty, 0);
                    let totalEstMins = customJerseyCount > 0 ? (90 + customJerseyCount * 10 + 80) : 120;
                    let estFinishTime = new Date(Date.now() + totalEstMins * MIN_MS);
                    let estClockStr = `${String(estFinishTime.getHours()).padStart(2,'0')}:${String(estFinishTime.getMinutes()).padStart(2,'0')} ngày ${String(estFinishTime.getDate()).padStart(2,'0')}/${String(estFinishTime.getMonth()+1).padStart(2,'0')}/${estFinishTime.getFullYear()}`;
                    estSpan.innerText = `lúc ${estClockStr} (in & giao tổng ~${totalEstMins} phút tính theo thời gian thật)`;
                }
            }
        }

        function timKiemSanPham(preserveScroll) {
            let kwInput = document.getElementById('searchInput');
            let kw = kwInput ? kwInput.value.trim() : '';
            if (!kw) return;
            currentActiveTab = 'search';
            document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
            document.querySelectorAll('.sub-nav a').forEach(el => el.classList.remove('active'));
            document.getElementById('view-products').classList.add('active');
            document.getElementById('productSectionTitle').innerText = `🔍 Kết quả tìm kiếm: "${kw}"`;
            let grid = document.getElementById('productGrid');
            grid.innerHTML = '';
            let top3Ids = [...products].filter(p => !p.isJerseyBlank).sort((a, b) => (b.sold || 0) - (a.sold || 0)).slice(0, 3).map(p => p.id);
            let kwLower = kw.toLowerCase();
            let results = products.filter(p => !p.isJerseyBlank && p.name.toLowerCase().includes(kwLower));
            if (results.length === 0) {
                grid.innerHTML = `<p style="grid-column: 1/-1; text-align:center; color:#777; padding: 30px 0;">Không tìm thấy sản phẩm nào khớp với "${kw}".</p>`;
            } else {
                results.forEach(p => renderCard(p, grid, 'search', top3Ids.includes(p.id)));
            }
            if (!preserveScroll) window.scrollTo(0, 0);
        }

        function moModal(id) { document.getElementById(id).style.display = 'flex'; }
        function dongModal(id) { document.getElementById(id).style.display = 'none'; }

        async function xuLyDangNhap() {
            let phone = document.getElementById('loginPhone').value.trim();
            let pass = document.getElementById('loginPass').value.trim();

            if (phone === "0909501753") {
                if (pass !== "5888") {
                    alert('❌ Sai mật khẩu tài khoản Admin!');
                    return;
                }
                luuGioHangLocal(); // Lưu giỏ của tài khoản trước đó nếu có
                currentCustomer = { phone: "0909501753", pass: "5888", name: "Quản Trị Viên (Admin)", orders: 99, mcoin: 0, tokens: 99, loggedIn: true, isAdmin: true, adminTabAuth5888: true, addresses: [] };
                sessionStorage.setItem('mairua_currentCustomer', JSON.stringify(currentCustomer));
                localStorage.removeItem('mairua_currentCustomer');
                cart = []; // Admin không mua sắm
                localStorage.setItem('mairua_cart', JSON.stringify(cart));
                capNhatHeaderTaiKhoan(); dongModal('loginModal'); resetSessionTimeout(); chuyenTab('remoteOrder');
                alert(`🛡️ Đăng nhập ADMIN thành công!`);
                return;
            }

            let found = accountsDB.find(acc => acc.phone === phone && acc.pass === pass);
            if (!found) {
                await dongBoTuGoogleSheets();
                found = accountsDB.find(acc => acc.phone === phone && acc.pass === pass);
            }
            if (!found) {
                await taiDuLieuTuDamMay(false);
                found = accountsDB.find(acc => acc.phone === phone && acc.pass === pass);
            }

            if(found) {
                luuGioHangLocal(); // Lưu giỏ trước đó (ví dụ giỏ khách vãng lai)
                let savedAddrs = Array.isArray(addressesByPhone[phone]) && addressesByPhone[phone].length > 0
                    ? addressesByPhone[phone]
                    : (Array.isArray(found.addresses) ? found.addresses : []);
                addressesByPhone[phone] = savedAddrs;
                localStorage.setItem('mairua_addressesByPhone', JSON.stringify(addressesByPhone));
                currentCustomer = { ...found, mcoin: found.mcoin || 0, addresses: savedAddrs, loggedIn: true };
                sessionStorage.setItem('mairua_currentCustomer', JSON.stringify(currentCustomer));
                if (!currentCustomer.isAdmin) {
                    localStorage.setItem('mairua_currentCustomer', JSON.stringify(currentCustomer));
                }
                // Tải giỏ hàng riêng biệt được lưu theo số điện thoại của tài khoản này
                cart = layGioHangTheoKey(phone);
                dongBoGioHangTuServer(phone);
                dongBoTuGoogleSheets().then(() => renderTrangTaiKhoan());
                localStorage.setItem('mairua_cart', JSON.stringify(cart));
                appliedCoupon = null;
                capNhatHeaderTaiKhoan(); dongModal('loginModal'); resetSessionTimeout();
                alert(`Đăng nhập thành công! Xin chào ${currentCustomer.name}`);
            } else {
                alert('Sai Số điện thoại hoặc Mật khẩu!');
            }
        }

        function xuLyDangKy() {
            let name = document.getElementById('regName').value.trim();
            let phone = document.getElementById('regPhone').value.trim();
            let pass = document.getElementById('regPass').value.trim();
            if(!name || name.length < 2) { alert('⚠️ Vui lòng nhập đầy đủ Họ và Tên!'); return; }
            if(!phone || phone.length < 8) { alert('⚠️ Vui lòng nhập số điện thoại hợp lệ!'); return; }
            if(!pass) { alert('Vui lòng nhập mật khẩu!'); return; }
            if(accountsDB.find(acc => acc.phone === phone)) { alert('Số điện thoại đã tồn tại!'); return; }

            luuGioHangLocal(); // Lưu giỏ trước đó
            let newAcc = { phone, pass, name, orders: 0, mcoin: 0, tokens: 3, isAdmin: false, addresses: [] };
            addressesByPhone[phone] = [];
            localStorage.setItem('mairua_addressesByPhone', JSON.stringify(addressesByPhone));
            accountsDB.push(newAcc);
            localStorage.setItem('mairua_accountsDB', JSON.stringify(accountsDB));
            currentCustomer = { ...newAcc, loggedIn: true };
            sessionStorage.setItem('mairua_currentCustomer', JSON.stringify(currentCustomer));
            if (!currentCustomer.isAdmin) {
                localStorage.setItem('mairua_currentCustomer', JSON.stringify(currentCustomer));
            }
            // Khởi tạo giỏ hàng mới tinh cho tài khoản mới
            cartsByPhone[phone] = [];
            cart = [];
            localStorage.setItem('mairua_cartsByPhone', JSON.stringify(cartsByPhone));
            localStorage.setItem('mairua_cart', JSON.stringify(cart));
            appliedCoupon = null;
            capNhatHeaderTaiKhoan(); dongModal('registerModal'); resetSessionTimeout(); luuDuLieuLenDamMay();
            guiDuLieuGoogleSheets('register', {
                phone: newAcc.phone,
                name: newAcc.name,
                pass: newAcc.pass,
                mcoin: newAcc.mcoin,
                orders: newAcc.orders,
                addresses: []
            });
            alert(`🎉 Đăng ký thành công! Chào mừng ${name}`);
        }

        // KHỞI TẠO HỆ THỐNG
        // KHỞI TẠO HỆ THỐNG
        dongBoTonKhoChuanXac();
        window.addEventListener('storage', (ev) => {
            if (ev.key === 'mairua_products' || ev.key === 'mairua_remoteOrdersList' || ev.key === 'mairua_customerRealOrdersBackup' || ev.key === 'mairua_stockLedgerV2' || ev.key === 'mairua_productReviews') {
                let freshOrds = JSON.parse(localStorage.getItem('mairua_remoteOrdersList')) || [];
                let freshBackups = JSON.parse(localStorage.getItem('mairua_customerRealOrdersBackup')) || [];
                freshBackups.forEach(ro => {
                    if (ro && ro.phone && !freshOrds.some(o => o && o.orderCode === ro.orderCode && o.startTime === ro.startTime)) {
                        freshOrds.push(ro);
                    }
                });
                freshOrds.sort((a, b) => (a.startTime || 0) - (b.startTime || 0));
                remoteOrdersList = freshOrds;
                dongBoTonKhoChuanXac();
                capNhatGiaoDienTheoDuLieuMoi();
                if (document.getElementById('view-detail').classList.contains('active') && currentOpenedProductId) { let p = products.find(x => x.id === currentOpenedProductId); if (p) veBangSizeVaDanhGiaChiTiet(p); }
            }
        });
        renderHomeProducts();
        updateBaloPreview();
        renderBangMauJerseyStudio();
        updateJerseyPreview();
        capNhatGiaoDienRoster();
        capNhatHeaderTaiKhoan();
        capNhatGioHang();
        dongBoTuGoogleSheets().then(() => {
            capNhatHeaderTaiKhoan();
            dongBoTrangThaiDonHangLenSheet();
        });
        taiDuLieuTuDamMay(false);
        if(currentCustomer.loggedIn) resetSessionTimeout();

        kichHoatKeoTha(document.getElementById('customBadge'));
        kichHoatKeoTha(document.getElementById('dragBackName'));
        kichHoatKeoTha(document.getElementById('dragBackNum'));
        kichHoatKeoTha(document.getElementById('dragFrontLogo'));
        kichHoatKeoTha(document.getElementById('dragFrontNum'));
        kichHoatKeoTha(document.getElementById('shortsFrontNum'));

// ====================================================================
// MAIRUA HOOPS - RESTful API BACKEND CONNECTIVITY
// ====================================================================

// 1. Tự động đồng bộ sản phẩm từ MySQL REST API
async function taiSanPhamTuBackendAPI() {
    try {
        const res = await fetch('/api/products');
        if (res.ok) {
            const json = await res.json();
            if (json.success && Array.isArray(json.data) && json.data.length > 0) {
                console.log(`🏀 [REST API] Đã nạp thành công ${json.data.length} sản phẩm từ MySQL Backend!`);
                json.data.forEach(dbItem => {
                    let localItem = products.find(p => p.id === dbItem.id);
                    if (localItem) {
                        if (typeof dbItem.price === 'number') localItem.price = dbItem.price;
                        if (Array.isArray(dbItem.variants)) {
                            localItem.variants = dbItem.variants;
                        }
                    }
                });
                capNhatTongStockVaSoldSanPham();
                renderHomeProducts();
            }
        }
    } catch (e) {
        console.log('ℹ️ Máy chủ MySQL chưa kích hoạt. Hệ thống tự động kích hoạt bộ nhớ LocalStorage.');
    }
}

// 2. Tự động đồng bộ Lệnh AI Nhập Hàng vào SQL Database
async function dongBoAiRestockVaoSQL(restockList, commandText) {
    try {
        const res = await fetch('/api/admin/restock', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ restockList, commandText })
        });
        if (res.ok) {
            const json = await res.json();
            if (json.success) {
                console.log('✅ [SQL Restock] ' + json.message);
                hienThiToast('✅ ' + json.message, 'success');
            }
        }
    } catch (e) {
        console.log('ℹ️ Nhập kho cục bộ (Local fallback).');
    }
}

// 3. Khởi tạo tìm kiếm Realtime với Debounce 250ms
let searchDebounceTimer = null;
function khoiTaoTimKiemRealtime() {
    const input = document.getElementById('searchInput');
    if (!input) return;
    input.addEventListener('input', (e) => {
        clearTimeout(searchDebounceTimer);
        searchDebounceTimer = setTimeout(() => {
            const kw = e.target.value.trim();
            if (kw.length >= 2) {
                timKiemSanPham(true);
            } else if (kw.length === 0 && currentActiveTab === 'search') {
                chuyenTab('home');
            }
        }, 250);
    });
}


// Kích hoạt tự động khi tải trang
try {
    khoiTaoTimKiemRealtime();
    taiSanPhamTuBackendAPI();
    if (currentCustomer && currentCustomer.loggedIn && currentCustomer.phone) dongBoGioHangTuServer(currentCustomer.phone);
} catch(e) {
    console.error('Lỗi khởi động kết nối backend:', e);
}
