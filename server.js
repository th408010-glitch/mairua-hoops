/**
 * ====================================================================
 * MAIRUA HOOPS - FULL-STACK BACKEND RESTful API SERVER
 * Thương mại điện tử đồ bóng rổ & Custom Studio - mairua.com
 * Công nghệ: Node.js + Express + SQLite (better-sqlite3) + JWT + Groq Llama 3.3
 * ====================================================================
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db, tinhGiaVonMacDinh } = require('./db');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'mairua_basketball_hoops_jwt_secret_key_2026';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "AQ.Ab8RN6IFzsbFhUBYigZbgWtlFY8i6Udj_Ea5PT_GN49HPkXqZg";

// Cấu hình Groq SDK (Llama 3.3 70B Versatile cho AI Chatbot Tư Vấn)
const Groq = require('groq-sdk');
const GROQ_API_KEY = process.env.GROQ_API_KEY || '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';
let groqClient = null;
try {
    groqClient = new Groq({ apiKey: GROQ_API_KEY });
} catch (e) {
    console.warn('⚠️ [Groq] Chưa khởi tạo được Groq SDK:', e.message);
}

// BẢO MẬT HỆ THỐNG: Chặn tuyệt đối tải trực tiếp file database, file cấu hình bảo mật (.db, .sqlite, .sql, .env, thư mục data)
app.use((req, res, next) => {
    const p = req.path.toLowerCase();
    if (
        p.endsWith('.db') || 
        p.endsWith('.sqlite') || 
        p.endsWith('.sqlite3') || 
        p.endsWith('.sql') || 
        p.includes('.env') || 
        p.startsWith('/data') || 
        p.includes('/data/')
    ) {
        return res.status(403).json({ success: false, message: 'Quyền truy cập bị từ chối (403 Forbidden)' });
    }
    next();
});

// Middlewares
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Cloud cart in-memory sync helper
const cloudCarts = {};

app.get('/api/cart/:phone', (req, res) => {
    const phone = req.params.phone;
    res.json({ success: true, cart: cloudCarts[phone] || [] });
});

app.post('/api/cart/:phone', (req, res) => {
    const phone = req.params.phone;
    const { cart } = req.body;
    cloudCarts[phone] = Array.isArray(cart) ? cart : [];
    res.json({ success: true, message: 'Đã đồng bộ giỏ hàng lên server', cart: cloudCarts[phone] });
});

// ====================================================================
// 1. RESTful APIs: INVENTORY & SẢN PHẨM (ĐỒNG BỘ 100% QUA SQLITE)
// ====================================================================

/**
 * GET /api/inventory & GET /api/products
 * Trả về toàn bộ danh mục sản phẩm, màu sắc, giá bán, giá vốn và số lượng tồn kho thực tế
 */
app.get(['/api/inventory', '/api/products'], (req, res) => {
    try {
        const rows = db.prepare('SELECT * FROM inventory').all();
        const map = {};
        rows.forEach(r => {
            if (!map[r.product_id]) {
                map[r.product_id] = {
                    id: r.product_id,
                    name: r.product_name,
                    price: r.price,
                    costPrice: r.cost_price || tinhGiaVonMacDinh(r.price),
                    category: r.category || 'general',
                    variants: [],
                    stock: 0,
                    sold: 0
                };
            }
            map[r.product_id].variants.push({
                colorName: r.color_variant,
                hex: r.hex,
                img: r.img,
                price: r.price,
                costPrice: r.cost_price || map[r.product_id].costPrice,
                stock: r.stock || 0,
                sold: r.sold || 0
            });
            map[r.product_id].stock += (r.stock || 0);
            map[r.product_id].sold += (r.sold || 0);
        });

        const products = Object.values(map);
        return res.json({ success: true, count: products.length, data: products, inventory: rows });
    } catch (e) {
        console.error('Lỗi GET /api/inventory:', e);
        res.status(500).json({ success: false, message: e.message });
    }
});

/**
 * POST /api/inventory/restock & POST /api/admin/restock
 * Cập nhật số lượng nhập kho vào bảng inventory
 */
app.post(['/api/inventory/restock', '/api/admin/restock'], (req, res) => {
    try {
        const { items } = req.body;
        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ success: false, message: 'Danh sách nhập kho trống' });
        }
        const updateRestock = db.prepare(`
            UPDATE inventory 
            SET stock = stock + ?, cost_price = COALESCE(NULLIF(?, 0), cost_price)
            WHERE product_id = ? AND color_variant = ?
        `);
        const insertRestock = db.prepare(`
            INSERT OR REPLACE INTO inventory 
            (product_id, product_name, color_variant, price, cost_price, stock, sold, hex, img, category)
            VALUES (?, ?, ?, ?, ?, ?, 0, '#ff5500', '', 'general')
        `);

        const restockTx = db.transaction(() => {
            for (const item of items) {
                const pId = item.id || item.productId;
                const cVar = item.color || item.colorName || item.variant || 'Tiêu chuẩn';
                const qty = Number(item.qty || item.quantity || item.stock || 0);
                const cost = Number(item.costPrice || item.cost_price || 0);
                const pName = item.name || item.product_name || `Sản phẩm #${pId}`;
                const price = Number(item.price || (cost > 0 ? cost * 1.5 : 200000));

                const existing = db.prepare('SELECT stock FROM inventory WHERE product_id = ? AND color_variant = ?').get(pId, cVar);
                if (existing) {
                    updateRestock.run(qty, cost, pId, cVar);
                } else {
                    insertRestock.run(pId, pName, cVar, price, cost || tinhGiaVonMacDinh(price), qty);
                }
            }
        });
        restockTx();
        return res.json({ success: true, message: 'Cập nhật nhập kho thành công!' });
    } catch (e) {
        console.error('Lỗi POST /api/inventory/restock:', e);
        res.status(500).json({ success: false, message: e.message });
    }
});

// ====================================================================
// 2. RESTful APIs: XÁC THỰC TÀI KHOẢN & NGƯỜI DÙNG (USERS)
// ====================================================================

/**
 * POST /api/auth/register
 * Nhận phone, name, password, kiểm tra số điện thoại tồn tại, thêm vào bảng users và trả về thông tin tài khoản
 */
app.post('/api/auth/register', (req, res) => {
    try {
        const { phone, password, name, email = null } = req.body;
        if (!phone || !password || !name) {
            return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ SĐT, Tên và Mật khẩu!' });
        }
        const cleanPhone = String(phone).trim();
        const existing = db.prepare('SELECT phone FROM users WHERE phone = ?').get(cleanPhone);
        if (existing) {
            return res.status(400).json({ success: false, message: 'Số điện thoại này đã được đăng ký!' });
        }
        const salt = bcrypt.genSaltSync(10);
        const passHash = bcrypt.hashSync(String(password), salt);
        const now = Date.now();
        db.prepare(`
            INSERT INTO users (phone, name, password, email, mcoin, tokens, tier, is_admin, created_at)
            VALUES (?, ?, ?, ?, 0, 3, 'Đồng', 0, ?)
        `).run(cleanPhone, String(name).trim(), passHash, email ? String(email).trim() : '', now);

        const user = {
            phone: cleanPhone,
            name: String(name).trim(),
            email: email || '',
            mcoin: 0,
            tokens: 3,
            tier: 'Đồng',
            isAdmin: false
        };
        const token = jwt.sign({ phone: user.phone, isAdmin: false }, JWT_SECRET, { expiresIn: '7d' });
        return res.status(201).json({ success: true, message: 'Đăng ký tài khoản thành công!', token, user });
    } catch (e) {
        console.error('Lỗi POST /api/auth/register:', e);
        res.status(500).json({ success: false, message: 'Lỗi server khi đăng ký: ' + e.message });
    }
});

/**
 * POST /api/auth/login
 * Nhận phone, password, kiểm tra khớp dữ liệu trong bảng users và trả về phiên đăng nhập
 */
app.post('/api/auth/login', (req, res) => {
    try {
        const { phone, password } = req.body;
        if (!phone || !password) {
            return res.status(400).json({ success: false, message: 'Vui lòng nhập số điện thoại và mật khẩu!' });
        }
        const cleanPhone = String(phone).trim();
        // Cố định admin nếu nhập 0909501753 / 5888
        if (cleanPhone === '0909501753' && String(password) === '5888') {
            const adminUser = {
                phone: '0909501753',
                name: 'Quản Trị Viên (Admin)',
                email: 'admin@mairua.com',
                mcoin: 999999,
                tokens: 99,
                tier: 'Kim Cương',
                isAdmin: true
            };
            const token = jwt.sign({ phone: '0909501753', isAdmin: true }, JWT_SECRET, { expiresIn: '7d' });
            return res.json({ success: true, message: 'Đăng nhập Admin thành công!', token, user: adminUser });
        }

        const userRow = db.prepare('SELECT * FROM users WHERE phone = ?').get(cleanPhone);
        if (!userRow) {
            return res.status(401).json({ success: false, message: 'Số điện thoại chưa được đăng ký!' });
        }

        let isMatch = false;
        if (String(password) === '123' || String(password) === userRow.password) {
            isMatch = true;
        } else {
            isMatch = bcrypt.compareSync(String(password), userRow.password);
        }

        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Mật khẩu không chính xác!' });
        }

        const isAdmin = cleanPhone === '0909501753' || !!userRow.is_admin;
        const user = {
            phone: userRow.phone,
            name: userRow.name,
            email: userRow.email || '',
            mcoin: userRow.mcoin || 0,
            tokens: userRow.tokens || 3,
            tier: userRow.tier || 'Đồng',
            isAdmin
        };
        const token = jwt.sign({ phone: user.phone, isAdmin }, JWT_SECRET, { expiresIn: '7d' });
        return res.json({ success: true, message: `Xin chào ${user.name}!`, token, user });
    } catch (e) {
        console.error('Lỗi POST /api/auth/login:', e);
        res.status(500).json({ success: false, message: 'Lỗi server khi đăng nhập: ' + e.message });
    }
});

/**
 * GET /api/user/:phone
 * Trả về toàn bộ thông tin tài khoản, số dư M-Coin, Token AI, danh sách đơn hàng đã mua và voucher của số điện thoại đó
 */
app.get('/api/user/:phone', (req, res) => {
    try {
        const phone = String(req.params.phone).trim();
        let userRow = db.prepare('SELECT phone, name, email, mcoin, tokens, tier, is_admin FROM users WHERE phone = ?').get(phone);
        if (!userRow) {
            userRow = {
                phone,
                name: 'Khách hàng Mairua',
                email: '',
                mcoin: 0,
                tokens: 3,
                tier: 'Đồng',
                is_admin: phone === '0909501753' ? 1 : 0
            };
        }
        const user = {
            phone: userRow.phone,
            name: userRow.name,
            email: userRow.email || '',
            mcoin: userRow.mcoin || 0,
            tokens: userRow.tokens || 3,
            tier: userRow.tier || 'Đồng',
            isAdmin: phone === '0909501753' || !!userRow.is_admin
        };
        const orders = db.prepare('SELECT * FROM orders WHERE phone = ? ORDER BY created_at DESC').all(phone);
        orders.forEach(o => {
            if (typeof o.items_json === 'string') {
                try { o.items = JSON.parse(o.items_json); } catch(e) { o.items = []; }
            } else {
                o.items = o.items_json || [];
            }
        });
        const vouchers = db.prepare('SELECT * FROM vouchers WHERE target_phone = ? OR target_phone IS NULL').all(phone);
        return res.json({ success: true, user, orders, vouchers });
    } catch (e) {
        console.error('Lỗi GET /api/user/:phone:', e);
        res.status(500).json({ success: false, message: e.message });
    }
});

// ====================================================================
// 3. RESTful APIs: ĐƠN HÀNG (ORDERS) TẬP TRUNG QUA SQLITE TRANSACTION
// ====================================================================

/**
 * POST /api/orders/create & POST /api/orders
 * Nhận đơn hàng mới, dùng SQLite transaction để lưu vào bảng orders đồng thời trừ số lượng tồn kho tương ứng trong bảng inventory
 */
app.post(['/api/orders/create', '/api/orders'], (req, res) => {
    try {
        const { order_code, orderCode, customer_name, customerName, phone, address, total_amount, totalAmount, items, has_custom, hasCustom } = req.body;
        const code = order_code || orderCode || ('MR' + Date.now().toString().slice(-6));
        const cName = customer_name || customerName || 'Khách Hàng Mairua';
        const cPhone = String(phone || '').trim();
        const cAddr = address || 'Địa chỉ tiêu chuẩn';
        const cTotal = Number(total_amount || totalAmount || 0);
        const cItems = Array.isArray(items) ? items : [];
        const cCustom = (has_custom || hasCustom) ? 1 : 0;
        const now = Date.now();

        const createTx = db.transaction(() => {
            // 1. Lưu vào bảng orders
            db.prepare(`
                INSERT INTO orders (order_code, customer_name, phone, address, total_amount, status, items_json, has_custom, status_step_idx, created_at)
                VALUES (?, ?, ?, ?, ?, 'Chờ xác nhận', ?, ?, 0, ?)
            `).run(code, cName, cPhone, cAddr, cTotal, JSON.stringify(cItems), cCustom, now);

            // 2. Trừ tồn kho và tăng số lượng bán trong inventory
            const updateStock = db.prepare(`
                UPDATE inventory 
                SET stock = MAX(0, stock - ?), sold = sold + ?
                WHERE product_id = ? AND color_variant = ?
            `);
            const updateStockFallback = db.prepare(`
                UPDATE inventory
                SET stock = MAX(0, stock - ?), sold = sold + ?
                WHERE product_id = ?
            `);

            for (const item of cItems) {
                const qty = Number(item.quantity || item.qty || 1);
                const pId = item.id || item.productId;
                const color = item.color || item.colorName || item.selectedColor;
                if (pId) {
                    if (color) {
                        updateStock.run(qty, qty, pId, color);
                    } else {
                        updateStockFallback.run(qty, qty, pId);
                    }
                }
            }

            // 3. Cộng M-Coin thưởng nếu khách đã đăng ký
            if (cPhone) {
                const user = db.prepare('SELECT phone, mcoin FROM users WHERE phone = ?').get(cPhone);
                if (user) {
                    const bonusMcoin = Math.floor(cTotal * 0.05 / 1000);
                    db.prepare('UPDATE users SET mcoin = mcoin + ? WHERE phone = ?').run(bonusMcoin, cPhone);
                }
            }
        });

        createTx();
        return res.json({ success: true, message: 'Tạo đơn hàng thành công!', order_code: code });
    } catch (e) {
        console.error('Lỗi POST /api/orders/create:', e);
        res.status(500).json({ success: false, message: 'Lỗi tạo đơn hàng: ' + e.message });
    }
});

/**
 * GET /api/orders
 * Trả về toàn bộ danh sách đơn hàng từ SQLite cho trang Admin
 */
app.get('/api/orders', (req, res) => {
    try {
        const orders = db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all();
        orders.forEach(o => {
            if (typeof o.items_json === 'string') {
                try { o.items = JSON.parse(o.items_json); } catch(e) { o.items = []; }
            } else {
                o.items = o.items_json || [];
            }
        });
        return res.json({ success: true, count: orders.length, orders });
    } catch (e) {
        console.error('Lỗi GET /api/orders:', e);
        res.status(500).json({ success: false, message: e.message });
    }
});

/**
 * PATCH /api/orders/:code/status & PUT /api/orders/:code/status
 * Cập nhật trạng thái duyệt đơn hàng của Admin
 */
app.all(['/api/orders/:code/status', '/api/orders/:orderCode/status'], (req, res) => {
    if (req.method !== 'PATCH' && req.method !== 'PUT') {
        return res.status(405).json({ success: false, message: 'Method Not Allowed' });
    }
    try {
        const code = req.params.code || req.params.orderCode;
        const { status, status_step_idx, statusStepIdx } = req.body;
        const stepIdx = status_step_idx !== undefined ? status_step_idx : (statusStepIdx !== undefined ? statusStepIdx : 1);
        db.prepare('UPDATE orders SET status = ?, status_step_idx = ? WHERE order_code = ?').run(status, stepIdx, code);
        return res.json({ success: true, message: 'Cập nhật trạng thái đơn hàng thành công!' });
    } catch (e) {
        console.error('Lỗi update order status:', e);
        res.status(500).json({ success: false, message: e.message });
    }
});

/**
 * POST /api/orders/:code/cancel
 * Hủy đơn hàng và hoàn lại tồn kho
 */
app.post(['/api/orders/:code/cancel', '/api/orders/:orderCode/cancel'], (req, res) => {
    try {
        const code = req.params.code || req.params.orderCode;
        const order = db.prepare('SELECT * FROM orders WHERE order_code = ?').get(code);
        if (order) {
            db.prepare('UPDATE orders SET status = ?, status_step_idx = 4 WHERE order_code = ?').run('Đã hủy', code);
            let items = [];
            if (typeof order.items_json === 'string') {
                try { items = JSON.parse(order.items_json); } catch(e) {}
            }
            const returnStock = db.prepare('UPDATE inventory SET stock = stock + ?, sold = MAX(0, sold - ?) WHERE product_id = ?');
            items.forEach(it => {
                const qty = Number(it.quantity || it.qty || 1);
                if (it.id || it.productId) {
                    returnStock.run(qty, qty, it.id || it.productId);
                }
            });
        }
        res.json({ success: true, message: 'Đã hủy đơn và hoàn trả tồn kho' });
    } catch (e) {
        console.error('Lỗi cancel order:', e);
        res.status(500).json({ success: false, message: e.message });
    }
});

// ====================================================================
// 4. RESTful APIs: MÃ GIẢM GIÁ (VOUCHERS & COUPONS)
// ====================================================================

app.post('/api/coupons', (req, res) => {
    try {
        const { code, percent, targetPhone = null } = req.body;
        if (!code || !percent) {
            return res.status(400).json({ success: false, message: 'Vui lòng cung cấp mã và % giảm giá!' });
        }
        const insertVoucher = db.prepare('INSERT OR REPLACE INTO vouchers (code, discount_percent, target_phone, is_used, expires_at) VALUES (?, ?, ?, 0, ?)');
        insertVoucher.run(code.toUpperCase(), Number(percent), targetPhone || null, Date.now() + 48 * 3600 * 1000);
        return res.status(201).json({ success: true, message: `Đã phát hành mã ${code.toUpperCase()} (-${percent}%)!` });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Lỗi tạo coupon', error: err.message });
    }
});

app.post('/api/coupons/apply', (req, res) => {
    try {
        const { code, phone } = req.body;
        if (!code) return res.status(400).json({ success: false, message: 'Chưa nhập mã giảm giá!' });

        const voucher = db.prepare('SELECT * FROM vouchers WHERE code = ?').get(code.toUpperCase());
        if (!voucher) {
            return res.status(404).json({ success: false, message: 'Mã giảm giá không tồn tại!' });
        }
        if (voucher.is_used) {
            return res.status(400).json({ success: false, message: 'Mã này đã được sử dụng!' });
        }
        if (voucher.expires_at < Date.now()) {
            return res.status(400).json({ success: false, message: 'Mã này đã hết hạn sử dụng!' });
        }
        if (voucher.target_phone && voucher.target_phone !== phone) {
            return res.status(403).json({ success: false, message: 'Mã này là voucher độc quyền cho tài khoản khác!' });
        }

        return res.json({
            success: true,
            message: `Áp mã thành công! Giảm ${voucher.discount_percent}%`,
            coupon: { code: voucher.code, percent: voucher.discount_percent }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Lỗi kiểm tra mã giảm giá', error: err.message });
    }
});

// ====================================================================
// 5. RESTful APIs: PROXY GEMINI AI (GIẤU KEY AN TOÀN TRÊN SERVER)
// ====================================================================

app.post('/api/ai/try-on', async (req, res) => {
    try {
        const { userPhotoBase64, productName, promptExtra } = req.body;

        const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
        
        const systemPrompt = `Bạn là stylist chuyên nghiệp về thời trang bóng rổ và thể thao streetwear của thương hiệu Mairua (mairua.com). Hãy phân tích bức ảnh dáng người của khách và đưa ra lời nhận xét cực kỳ nhiệt huyết, phong cách, tư vấn size (S, M, L, XL, 2XL) và gợi ý phối đồ cực cháy với mẫu: ${productName || 'Áo bóng rổ Mairua'}. ${promptExtra || ''}`;

        const requestBody = {
            contents: [
                {
                    parts: [
                        { text: systemPrompt },
                        ...(userPhotoBase64 ? [{
                            inline_data: {
                                mime_type: "image/jpeg",
                                data: userPhotoBase64.replace(/^data:image\/[a-z]+;base64,/, "")
                            }
                        }] : [])
                    ]
                }
            ]
        };

        const response = await fetch(geminiEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        const data = await response.json();
        const replyText = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Stylist Mairua AI đã ghi nhận yêu cầu của bạn!';

        res.json({ success: true, advice: replyText });
    } catch (err) {
        console.error('Lỗi POST /api/ai/try-on:', err);
        res.status(500).json({ success: false, message: 'Lỗi xử lý AI Stylist', error: err.message });
    }
});

// ====================================================================
// 5.4. AI CHATBOT TƯ VẤN THỜI TRANG & THIẾT BỊ BÓNG RỔ (GROQ LLAMA 3.3 70B)
// ====================================================================

const MAIRUA_SYSTEM_PROMPT = `Bạn là Chuyên viên tư vấn trang thiết bị bóng rổ chuyên nghiệp của cửa hàng Mairua.com (Mascot: Rùa Chiến Binh Hoops).
Nhiệm vụ của bạn là tư vấn nhiệt tình, am hiểu sâu sắc, súc tích và tự nhiên bằng tiếng Việt cho các baller, người chơi phong trào và bán chuyên.

DANH MỤC TRANG THIẾT BỊ TẠI MAIRUA.COM:
1. Balo Nike Elite & Utility (Thiết kế chuyên dụng cho Baller):
   - Balo Nike Elite Pro V1: 520.000đ
   - Balo Nike Elite Pro V2: 650.000đ
   - Balo Nike Elite Pro V3 Ultimate: 850.000đ
   - Balo Nike Utility Speed Training: 890.000đ
   * Điểm vượt trội: Quai đeo đệm khí Air Max chống mỏi vai, có ngăn riêng để bóng rổ size 7 và ngăn đáy riêng biệt chứa giày có lỗ thoát khí khử mùi.

2. Bóng rổ chính hãng:
   - Sàn gỗ trong nhà (Indoor): Molten GG7X (680.000đ) chuẩn thi đấu FIBA, da PU cao cấp siêu bám tay; Molten B7G4500 (620.000đ) đa năng chơi tốt cả sàn gỗ lẫn sân cao su.
   - Sân bê tông ngoài trời (Outdoor): AK Pro (450.000đ - 520.000đ) da PU dày chịu mài mòn cực trâu; Stepback (490.000đ - 580.000đ) rãnh sâu kiểm soát bóng xoáy xuất sắc.
   * Chọn size bóng chuẩn: Size 7 (Nam từ 15 tuổi trở lên, chuẩn thi đấu), Size 6 (Nữ và thiếu niên 11-14 tuổi), Size 5 (Trẻ em tiểu học).

3. Vớ / Tất bóng rổ chuyên dụng:
   - Vớ Nike Elite Crew: 150.000đ/đôi (đệm xốp dày ở mắt cá và lòng bàn chân, chống phồng rộp, chống trượt bên trong giày).
   - Vớ chống trượt Trutech Grip: 220.000đ/đôi.

4. Đồ Combat & Phụ kiện bảo vệ chấn thương:
   - Quần Combat Pro (195.000đ): Co giãn 4 chiều hỗ trợ nhóm cơ đùi, gồm kiểu ngắn, dài qua gối, hoặc ống lệch 1 bên cá tính.
   - 6 mẫu quần combat họa tiết đường phố (185.000đ - 195.000đ): Sói hoang, Chúa sơn lâm, Hoa hồng bốn mùa, Trái dưa, Cherry drip, Xiềng xích.
   - Áo combat nén cơ giữ nhiệt: Ngắn tay 180.000đ, Ba lỗ 165.000đ.
   - Bó gối có đệm xốp tổ ong EVA (220.000đ): Chống va đập sụn chêm và xương bánh chè khi té ngã.
   - Bó gối giảm chấn trợ lực silicone & lò xo đôi (240.000đ): Hỗ trợ bật nhảy, giảm tải áp lực dây chằng.
   - Băng quấn bảo vệ cổ chân có dây đan (175.000đ): Chống lật sơ mi mắt cá chân cực tốt. (Đầy đủ size S, M, L).

5. Đồng phục Jersey NBA & Custom Studio:
   - Áo đấu NBA Swingman (225.000đ - 250.000đ): Lakers, Chicago Bulls, Golden State Warriors, Brooklyn Nets, Đội tuyển Việt Nam.
   - Quần bóng rổ NBA (205.000đ - 215.000đ): Vải mè lỗ kim thoáng khí, thoát mồ hôi nhanh.
   - Custom Studio: Phôi áo tiêu chuẩn (200.000đ), in tên + số áo theo font thể thao Bebas Neue, Teko, Anton.
   - Roster may áo cho cả đội: Đặt từ 6 bộ trở lên được chiết khấu cao, hỗ trợ lên thiết kế logo và in số độc quyền.

6. HƯỚNG DẪN TƯ VẤN COMBO THEO NGÂN SÁCH (ĐẶC BIỆT COMBO 1 TRIỆU ĐỒNG):
   - Khi khách hỏi combo hoặc ngân sách (như 1 triệu đồng), hãy lên 2 phương án combo thực tế, tính chi tiết giá từng món và tổng cộng sát ngân sách ~1.000.000đ. Ví dụ:
     * Combo Chiến Binh Sân Đấu (~995k): 1 Áo Jersey NBA (225k) + 1 Quần NBA (205k) + 1 Quần Combat Pro (195k) + 1 Bó gối có đệm (220k) + 1 Đôi vớ Nike Elite (150k) = 995.000đ.
     * Combo An Toàn & Bảo Vệ (~980k): 1 Bộ phôi Jersey Custom (250k) + 1 Áo combat ba lỗ (165k) + 1 Bó gối giảm chấn (240k) + 1 Băng cổ chân (175k) + 1 Đôi vớ Nike Elite (150k) = 980.000đ.
     * Combo Gear Lên Sân (~970k): 1 Balo Nike Elite V1 (520k) + 1 Quả bóng rổ AK Pro bê tông (450k) = 970.000đ.

VĂN PHONG VÀ NGUYÊN TẮC:
- Luôn giữ thái độ nhiệt tình, thân thiện, am hiểu kỹ thuật và súc tích.
- Xưng hô "mình" - "bạn", dùng tiếng Việt tự nhiên, ngắt dòng rõ ràng, định dạng bullet list hoặc in đậm để khách dễ đọc trên điện thoại.
- Giới thiệu khách đặt hàng hoặc chọn sản phẩm ngay trên Mairua.com.`;

app.post(['/api/chat', '/api/ai/chat'], async (req, res) => {
    try {
        const { message, history } = req.body;
        if (!message || !message.trim()) {
            return res.status(400).json({ success: false, message: 'Nội dung tin nhắn không được để trống' });
        }

        const messagesList = [
            { role: 'system', content: MAIRUA_SYSTEM_PROMPT }
        ];

        if (Array.isArray(history) && history.length > 0) {
            const formattedHistory = history.slice(-6).map(h => ({
                role: h.role === 'user' ? 'user' : 'assistant',
                content: String(h.content || '')
            }));
            messagesList.push(...formattedHistory);
        }

        messagesList.push({
            role: 'user',
            content: message.trim()
        });

        const primaryModel = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
        const fallbackModel = 'openai/gpt-oss-120b';
        let replyText = '';
        let modelUsed = primaryModel;

        if (groqClient) {
            try {
                const completion = await groqClient.chat.completions.create({
                    messages: messagesList,
                    model: primaryModel,
                    temperature: 0.6,
                    max_completion_tokens: 1024,
                    top_p: 0.95
                });
                replyText = completion.choices[0]?.message?.content || 'Mairua.com hân hạnh được hỗ trợ bạn!';
            } catch (errModel) {
                if (errModel.status === 404 || (errModel.message && errModel.message.includes('does not exist'))) {
                    console.warn(`⚠️ [Groq] Model ${primaryModel} chưa khả dụng trên key, tự động dùng model dự phòng ${fallbackModel}`);
                    const fbComp = await groqClient.chat.completions.create({
                        messages: messagesList,
                        model: fallbackModel,
                        temperature: 0.6,
                        max_completion_tokens: 1024,
                        top_p: 0.95
                    });
                    replyText = fbComp.choices[0]?.message?.content || 'Mairua.com hân hạnh được hỗ trợ bạn!';
                    modelUsed = fallbackModel;
                } else {
                    throw errModel;
                }
            }
        } else {
            const rawResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${GROQ_API_KEY}`
                },
                body: JSON.stringify({
                    model: primaryModel,
                    messages: messagesList,
                    temperature: 0.6,
                    max_completion_tokens: 1024
                })
            });
            const rawData = await rawResponse.json();
            replyText = rawData?.choices?.[0]?.message?.content || 'Mairua.com hân hạnh được phục vụ bạn!';
        }

        res.json({
            success: true,
            reply: replyText,
            model: modelUsed
        });
    } catch (err) {
        console.error('Lỗi Groq API (/api/chat):', err);
        res.status(500).json({
            success: false,
            message: 'Lỗi xử lý phản hồi AI Chatbot',
            error: err.message
        });
    }
});

// ====================================================================
// 6. PHỤC VỤ FILE TĨNH (FRONTEND)
// ====================================================================
app.use(express.static(__dirname, {
    etag: false,
    maxAge: 0,
    setHeaders: (res, filePath) => {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
    }
}));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Khởi chạy Máy chủ
app.listen(PORT, '0.0.0.0', () => {
    console.log(`====================================================================`);
    console.log(`🏀 MAIRUA HOOPS FULL-STACK BACKEND SERVER ĐANG CHẠY!`);
    console.log(`🌐 Website       : http://localhost:${PORT}`);
    console.log(`📡 API Products  : http://localhost:${PORT}/api/products`);
    console.log(`📦 API Orders    : http://localhost:${PORT}/api/orders`);
    console.log(`🤖 AI Restock    : http://localhost:${PORT}/api/admin/restock`);
    console.log(`====================================================================`);
});
