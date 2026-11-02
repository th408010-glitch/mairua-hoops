/**
 * ====================================================================
 * MAIRUA HOOPS - FULL-STACK BACKEND RESTful API SERVER
 * Thương mại điện tử đồ bóng rổ & Custom Studio - mairua.com
 * Công nghệ: Node.js + Express + MySQL / SQLite + JWT + Gemini AI Proxy
 * ====================================================================
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'mairua_basketball_hoops_jwt_secret_key_2026';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "AQ.Ab8RN6IFzsbFhUBYigZbgWtlFY8i6Udj_Ea5PT_GN49HPkXqZg";

// Middlewares
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Database Pool Connection
let pool = null;
let dbConnected = false;

async function initDatabase() {
    try {
        pool = mysql.createPool({
            host: process.env.DB_HOST || 'localhost',
            port: Number(process.env.DB_PORT) || 3306,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'mairua_db',
            waitForConnections: true,
            connectionLimit: 15,
            queueLimit: 0
        });

        // Test truy vấn
        await pool.query('SELECT 1 + 1 AS test');
        dbConnected = true;
        console.log('🏀 [Database] Kết nối MySQL thành công (database: mairua_db)!');
    } catch (err) {
        dbConnected = false;
        console.warn('⚠️ [Database] Chưa kết nối được MySQL (XAMPP / MySQL Service chưa bật):', err.message);
        console.warn('💡 [Database] Chế độ In-Memory & LocalStorage Fallback đang sẵn sàng.');
    }
}
initDatabase();

// Hàm tính hạng thành viên theo tổng chi tiêu
function tinhHangThanhVien(totalSpent) {
    if (totalSpent >= 20000000) return { name: 'Kim Cương', ratePercent: 10, rateDecimal: 0.10 };
    if (totalSpent >= 15000000) return { name: 'Vàng', ratePercent: 7, rateDecimal: 0.07 };
    if (totalSpent >= 10000000) return { name: 'Bạc', ratePercent: 6, rateDecimal: 0.06 };
    return { name: 'Đồng', ratePercent: 5, rateDecimal: 0.05 };
}

// ====================================================================
// 1. RESTful APIs: SẢN PHẨM & AI NHẬP HÀNG TỰ ĐỘNG
// ====================================================================

/**
 * GET /api/products
 * Lấy toàn bộ 37 sản phẩm kèm các biến thể màu sắc, hình ảnh và tồn kho
 */

// ====================================================================
// CLOUD CART SYNC (ĐỒNG BỘ GIỎ HÀNG ĐA THIẾT BỊ: ĐIỆN THOẠI & LAPTOP)
// ====================================================================
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

app.get('/api/products', async (req, res) => {
    try {
        const { cat, min_price, max_price, search, sort } = req.query;

        if (dbConnected && pool) {
            let sql = 'SELECT * FROM products WHERE 1=1';
            const params = [];

            if (cat && cat !== 'all') {
                sql += ' AND cat = ?';
                params.push(cat);
            }
            if (min_price) {
                sql += ' AND price >= ?';
                params.push(Number(min_price));
            }
            if (max_price) {
                sql += ' AND price <= ?';
                params.push(Number(max_price));
            }
            if (search) {
                sql += ' AND name LIKE ?';
                params.push(`%${search}%`);
            }

            if (sort === 'price_asc') sql += ' ORDER BY price ASC';
            else if (sort === 'price_desc') sql += ' ORDER BY price DESC';
            else sql += ' ORDER BY id ASC';

            const [prods] = await pool.query(sql, params);

            // Gắn danh sách variants cho từng sản phẩm
            for (const p of prods) {
                const [vars] = await pool.query(
                    'SELECT id, color_name AS colorName, base_color AS baseColor, cut_style AS cutStyle, hex, stock, sold, img_url AS img FROM product_variants WHERE product_id = ? ORDER BY id ASC',
                    [p.id]
                );
                p.variants = vars;
                p.stock = vars.reduce((s, v) => s + (v.stock || 0), 0);
                p.sold = vars.reduce((s, v) => s + (v.sold || 0), 0);
                p.hasSize = !!p.has_size;
                p.isCombatPants = !!p.is_combat_pants;
                p.isJerseyBlank = !!p.is_jersey_blank;
                p.isShorts = !!p.is_shorts;
                p.isProtectiveGear = !!p.is_protective_gear;
                p.gearType = p.gear_type;
                p.sizes = p.sizes_json ? (typeof p.sizes_json === 'string' ? JSON.parse(p.sizes_json) : p.sizes_json) : [];
            }

            return res.json({ success: true, count: prods.length, data: prods });
        }

        res.json({ success: true, source: 'fallback', data: [] });
    } catch (err) {
        console.error('Lỗi GET /api/products:', err);
        res.status(500).json({ success: false, message: 'Lỗi máy chủ khi lấy danh sách sản phẩm', error: err.message });
    }
});

/**
 * POST /api/admin/restock
 * Tính năng "AI Nhập Hàng Tự Động": Cộng tồn kho trực tiếp trong SQL và tự xóa cảnh báo tồn kho <= 5
 */
app.post('/api/admin/restock', async (req, res) => {
    try {
        const { restockList = [], commandText = '' } = req.body;

        if (!restockList || restockList.length === 0) {
            return res.status(400).json({ success: false, message: 'Danh sách sản phẩm nhập kho trống!' });
        }

        if (dbConnected && pool) {
            const conn = await pool.getConnection();
            try {
                await conn.beginTransaction();

                const updated = [];
                for (const item of restockList) {
                    const { productId, variantIndex = 0, colorName, addStock = 10 } = item;

                    let updateQuery = '';
                    let updateParams = [];

                    if (colorName) {
                        updateQuery = 'UPDATE product_variants SET stock = stock + ? WHERE product_id = ? AND color_name = ?';
                        updateParams = [addStock, productId, colorName];
                    } else {
                        // Cập nhật theo variant offset
                        updateQuery = `
                            UPDATE product_variants pv 
                            JOIN (
                                SELECT id FROM product_variants 
                                WHERE product_id = ? 
                                ORDER BY id ASC 
                                LIMIT 1 OFFSET ?
                            ) sub ON pv.id = sub.id 
                            SET pv.stock = pv.stock + ?
                        `;
                        updateParams = [productId, variantIndex, addStock];
                    }

                    await conn.query(updateQuery, updateParams);
                    updated.push({ productId, addStock });
                }

                await conn.commit();
                return res.json({
                    success: true,
                    message: `✅ AI đã tự động nhập hàng thành công cho ${updated.length} phân loại sản phẩm!`,
                    updated
                });
            } catch (txErr) {
                await conn.rollback();
                throw txErr;
            } finally {
                conn.release();
            }
        }

        res.json({
            success: true,
            message: 'Đã nhận lệnh nhập hàng (Chế độ Fallback Local)',
            commandText
        });
    } catch (err) {
        console.error('Lỗi POST /api/admin/restock:', err);
        res.status(500).json({ success: false, message: 'Lỗi thực hiện lệnh nhập hàng', error: err.message });
    }
});

// ====================================================================
// 2. RESTful APIs: XÁC THỰC & SỔ ĐỊA CHỈ & HẠNG THÀNH VIÊN
// ====================================================================

/**
 * POST /api/auth/login
 */
app.post('/api/auth/login', async (req, res) => {
    try {
        const { phone, password } = req.body;

        if (!phone || !password) {
            return res.status(400).json({ success: false, message: 'Vui lòng nhập SĐT và Mật khẩu!' });
        }

        // Admin cố định
        if (phone === '0909501753' && password === '5888') {
            const adminData = {
                phone: '0909501753',
                name: 'Quản Trị Viên (Admin)',
                isAdmin: true,
                tokens: 99,
                mcoin: 0,
                tierLevel: 'Kim Cương',
                addresses: []
            };
            const token = jwt.sign({ phone: adminData.phone, isAdmin: true }, JWT_SECRET, { expiresIn: '7d' });
            return res.json({ success: true, message: 'Đăng nhập Admin thành công!', token, user: adminData });
        }

        if (dbConnected && pool) {
            const [rows] = await pool.query('SELECT * FROM accounts WHERE phone = ?', [phone]);
            if (rows.length === 0) {
                return res.status(401).json({ success: false, message: 'Số điện thoại chưa được đăng ký!' });
            }

            const acc = rows[0];
            let isMatch = false;

            // Kiểm tra mật khẩu (hỗ trợ hash bcrypt hoặc pass dev '123')
            if (password === '123' || password === acc.pass_hash) {
                isMatch = true;
            } else {
                isMatch = await bcrypt.compare(password, acc.pass_hash);
            }

            if (!isMatch) {
                return res.status(401).json({ success: false, message: 'Mật khẩu không chính xác!' });
            }

            // Lấy danh sách địa chỉ của tài khoản
            const [addrs] = await pool.query(
                'SELECT id, recipient_name AS name, recipient_phone AS phone, province, ward, street, full_address AS fullAddress, is_default AS isDefault FROM addresses WHERE account_phone = ? ORDER BY is_default DESC, id DESC',
                [phone]
            );

            const userData = {
                phone: acc.phone,
                name: acc.name,
                email: acc.email,
                orders: acc.orders_count || 0,
                mcoin: acc.mcoin || 0,
                tokens: acc.ai_tokens || 3,
                tierLevel: acc.tier_level || 'Đồng',
                isAdmin: !!acc.is_admin,
                addresses: addrs
            };

            const token = jwt.sign({ phone: acc.phone, isAdmin: !!acc.is_admin }, JWT_SECRET, { expiresIn: '7d' });
            return res.json({ success: true, message: `Xin chào ${acc.name}!`, token, user: userData });
        }

        // Fallback test
        if (password === '123') {
            return res.json({
                success: true,
                message: 'Đăng nhập thành công (Fallback)',
                user: { phone, name: 'Khách hàng Mairua', orders: 1, mcoin: 0, tokens: 3, tierLevel: 'Đồng', isAdmin: false, addresses: [] }
            });
        }

        res.status(401).json({ success: false, message: 'Sai mật khẩu!' });
    } catch (err) {
        console.error('Lỗi POST /api/auth/login:', err);
        res.status(500).json({ success: false, message: 'Lỗi đăng nhập', error: err.message });
    }
});

/**
 * POST /api/auth/register
 */
app.post('/api/auth/register', async (req, res) => {
    try {
        const { phone, password, name, email = null } = req.body;

        if (!phone || !password || !name) {
            return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ SĐT, Tên và Mật khẩu!' });
        }

        if (dbConnected && pool) {
            const [exist] = await pool.query('SELECT phone FROM accounts WHERE phone = ?', [phone]);
            if (exist.length > 0) {
                return res.status(400).json({ success: false, message: 'Số điện thoại này đã được đăng ký!' });
            }

            const salt = await bcrypt.genSalt(10);
            const passHash = await bcrypt.hash(password, salt);

            await pool.query(
                'INSERT INTO accounts (phone, pass_hash, name, email, orders_count, mcoin, ai_tokens, tier_level, is_admin) VALUES (?, ?, ?, ?, 0, 0, 3, \'Đồng\', FALSE)',
                [phone, passHash, name, email]
            );

            const newUser = {
                phone, name, email, orders: 0, mcoin: 0, tokens: 3, tierLevel: 'Đồng', isAdmin: false, addresses: []
            };
            const token = jwt.sign({ phone, isAdmin: false }, JWT_SECRET, { expiresIn: '7d' });

            return res.status(201).json({ success: true, message: 'Đăng ký tài khoản thành công!', token, user: newUser });
        }

        res.status(201).json({ success: true, message: 'Đăng ký thành công (Fallback)' });
    } catch (err) {
        console.error('Lỗi POST /api/auth/register:', err);
        res.status(500).json({ success: false, message: 'Lỗi đăng ký tài khoản', error: err.message });
    }
});

/**
 * PUT /api/account/profile
 */
app.put('/api/account/profile', async (req, res) => {
    try {
        const { phone, name, email, newPassword } = req.body;
        if (!phone) return res.status(400).json({ success: false, message: 'Thiếu số điện thoại!' });

        if (dbConnected && pool) {
            let sql = 'UPDATE accounts SET name = ?, email = ?';
            const params = [name, email];

            if (newPassword) {
                const salt = await bcrypt.genSalt(10);
                const passHash = await bcrypt.hash(newPassword, salt);
                sql += ', pass_hash = ?';
                params.push(passHash);
            }

            sql += ' WHERE phone = ?';
            params.push(phone);

            await pool.query(sql, params);
            return res.json({ success: true, message: 'Cập nhật thông tin tài khoản thành công!' });
        }

        res.json({ success: true, message: 'Đã cập nhật (Fallback)' });
    } catch (err) {
        console.error('Lỗi PUT /api/account/profile:', err);
        res.status(500).json({ success: false, message: 'Lỗi cập nhật profile', error: err.message });
    }
});

/**
 * POST /api/account/addresses
 * Thêm hoặc cập nhật địa chỉ giao hàng
 */
app.post('/api/account/addresses', async (req, res) => {
    try {
        const { accountPhone, recipientName, recipientPhone, province, ward, street, fullAddress, isDefault = false } = req.body;

        if (!accountPhone || !recipientName || !recipientPhone || !fullAddress) {
            return res.status(400).json({ success: false, message: 'Thiếu thông tin địa chỉ bắt buộc!' });
        }

        if (dbConnected && pool) {
            if (isDefault) {
                await pool.query('UPDATE addresses SET is_default = FALSE WHERE account_phone = ?', [accountPhone]);
            }

            const [result] = await pool.query(
                'INSERT INTO addresses (account_phone, recipient_name, recipient_phone, province, ward, street, full_address, is_default) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [accountPhone, recipientName, recipientPhone, province || '', ward || '', street || '', fullAddress, isDefault ? 1 : 0]
            );

            return res.status(201).json({ success: true, message: 'Đã lưu địa chỉ vào sổ địa chỉ!', addressId: result.insertId });
        }

        res.status(201).json({ success: true, message: 'Đã lưu địa chỉ (Fallback)' });
    } catch (err) {
        console.error('Lỗi POST /api/account/addresses:', err);
        res.status(500).json({ success: false, message: 'Lỗi lưu địa chỉ', error: err.message });
    }
});

// ====================================================================
// 3. RESTful APIs: ĐƠN HÀNG, QUY TRÌNH DUYỆT 5 BƯỚC & HOÀN KHO
// ====================================================================

/**
 * POST /api/orders
 * Tạo đơn hàng mới, trừ tồn kho SQL bằng Transaction, tính M-Coin & Hạng thành viên
 */
app.post('/api/orders', async (req, res) => {
    try {
        const {
            orderCode,
            accountPhone,
            customerName,
            customerPhone,
            customerAddr,
            subtotal,
            discountAmt = 0,
            usedMCoin = 0,
            shippingFee = 30000,
            finalTotal,
            couponUsed = null,
            hasCustomJersey = false,
            jerseyCount = 0,
            needsInvoice = false,
            invoiceInfo = null,
            items = []
        } = req.body;

        if (!customerName || !customerPhone || !customerAddr || !items || items.length === 0) {
            return res.status(400).json({ success: false, message: 'Thông tin đơn hàng hoặc giỏ hàng không hợp lệ!' });
        }

        const genCode = orderCode || `MVP${Date.now().toString().slice(-6)}`;
        const startTime = Date.now();

        if (dbConnected && pool) {
            const conn = await pool.getConnection();
            try {
                await conn.beginTransaction();

                // 1. Tính chi tiêu tích lũy và hoàn M-Coin
                let earnedMCoin = 0;
                let cashbackPercent = 5;
                if (accountPhone) {
                    const [accRows] = await conn.query('SELECT * FROM accounts WHERE phone = ?', [accountPhone]);
                    if (accRows.length > 0) {
                        const acc = accRows[0];
                        const tier = tinhHangThanhVien(acc.orders_count * 1000000); // mô phỏng
                        cashbackPercent = tier.ratePercent;
                        earnedMCoin = Math.round(Number(finalTotal) * tier.rateDecimal);

                        // Cập nhật account: cộng 1 đơn, trừ usedMCoin, cộng earnedMCoin, cộng 1 Token AI
                        await conn.query(`
                            UPDATE accounts 
                            SET orders_count = orders_count + 1,
                                mcoin = GREATEST(0, mcoin - ? + ?),
                                ai_tokens = ai_tokens + 1
                            WHERE phone = ?
                        `, [usedMCoin, earnedMCoin, accountPhone]);
                    }
                }

                // 2. Tạo đơn hàng vào bảng orders
                await conn.query(`
                    INSERT INTO orders 
                    (order_code, account_phone, customer_name, customer_phone, customer_addr, subtotal, discount_amt, used_mcoin, earned_mcoin, cashback_percent, shipping_fee, final_total, coupon_used, has_custom_jersey, jersey_count, status_step_idx, admin_confirmed, is_cancelled, needs_invoice, invoice_info_json, start_time)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, FALSE, FALSE, ?, ?, ?)
                `, [
                    genCode, accountPhone || null, customerName, customerPhone, customerAddr,
                    subtotal, discountAmt, usedMCoin, earnedMCoin, cashbackPercent, shippingFee, finalTotal,
                    couponUsed, hasCustomJersey ? 1 : 0, jerseyCount, needsInvoice ? 1 : 0,
                    invoiceInfo ? JSON.stringify(invoiceInfo) : null, startTime
                ]);

                // 3. Thêm chi tiết order_items và trừ tồn kho SQL
                for (const item of items) {
                    await conn.query(`
                        INSERT INTO order_items 
                        (order_code, product_id, variant_index, item_name, sub_info, unit_price, qty, custom_design_json)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    `, [
                        genCode, item.productId || null, item.variantIndex || 0,
                        item.name, item.subInfo || '', item.price, item.qty,
                        item.customDesign ? JSON.stringify(item.customDesign) : null
                    ]);

                    // Trừ tồn kho trong product_variants
                    if (item.productId) {
                        await conn.query(`
                            UPDATE product_variants 
                            SET stock = GREATEST(0, stock - ?), sold = sold + ? 
                            WHERE product_id = ? 
                            ORDER BY id ASC LIMIT 1 OFFSET ?
                        `, [item.qty, item.qty, item.productId, item.variantIndex || 0]);
                    }
                }

                // 4. Nếu có dùng coupon, lưu vào coupon_usages
                if (couponUsed && accountPhone) {
                    await conn.query(
                        'INSERT INTO coupon_usages (code, account_phone) VALUES (?, ?)',
                        [couponUsed, accountPhone]
                    );
                }

                await conn.commit();
                return res.status(201).json({
                    success: true,
                    message: '🎉 Tạo đơn hàng thành công và đã lưu vào MySQL Database!',
                    orderCode: genCode,
                    earnedMCoin
                });
            } catch (txErr) {
                await conn.rollback();
                throw txErr;
            } finally {
                conn.release();
            }
        }

        res.status(201).json({
            success: true,
            message: 'Tạo đơn hàng thành công (Fallback)',
            orderCode: genCode
        });
    } catch (err) {
        console.error('Lỗi POST /api/orders:', err);
        res.status(500).json({ success: false, message: 'Lỗi tạo đơn hàng', error: err.message });
    }
});

/**
 * GET /api/orders
 * Lấy danh sách đơn hàng (Admin xem hết, Khách xem theo SĐT)
 */
app.get('/api/orders', async (req, res) => {
    try {
        const { phone } = req.query;

        if (dbConnected && pool) {
            let sql = 'SELECT * FROM orders';
            const params = [];

            if (phone) {
                sql += ' WHERE customer_phone = ? OR account_phone = ?';
                params.push(phone, phone);
            }

            sql += ' ORDER BY start_time DESC';
            const [orders] = await pool.query(sql, params);

            for (const ord of orders) {
                const [items] = await pool.query('SELECT * FROM order_items WHERE order_code = ?', [ord.order_code]);
                ord.items = items;
            }

            return res.json({ success: true, count: orders.length, data: orders });
        }

        res.json({ success: true, source: 'fallback', data: [] });
    } catch (err) {
        console.error('Lỗi GET /api/orders:', err);
        res.status(500).json({ success: false, message: 'Lỗi lấy danh sách đơn', error: err.message });
    }
});

/**
 * PUT /api/orders/:orderCode/status
 * Cập nhật công đoạn sản xuất (0 -> 1 -> 2 -> 3 -> 4) & Admin duyệt đơn
 */
app.put('/api/orders/:orderCode/status', async (req, res) => {
    try {
        const { orderCode } = req.params;
        const { stepIdx, adminConfirmed } = req.body;

        if (dbConnected && pool) {
            let sql = 'UPDATE orders SET status_step_idx = ?';
            const params = [stepIdx];

            if (adminConfirmed !== undefined) {
                sql += ', admin_confirmed = ?';
                params.push(adminConfirmed ? 1 : 0);
                if (adminConfirmed) {
                    sql += ', confirmed_at = ?';
                    params.push(Date.now());
                }
            }

            if (stepIdx === 4) {
                sql += ', delivered_at = ?';
                params.push(Date.now());
            }

            sql += ' WHERE order_code = ?';
            params.push(orderCode);

            await pool.query(sql, params);
            return res.json({ success: true, message: `Đã cập nhật tiến trình đơn ${orderCode} sang bước ${stepIdx}` });
        }

        res.json({ success: true, message: 'Đã cập nhật trạng thái (Fallback)' });
    } catch (err) {
        console.error('Lỗi PUT /api/orders/:orderCode/status:', err);
        res.status(500).json({ success: false, message: 'Lỗi cập nhật trạng thái', error: err.message });
    }
});

/**
 * POST /api/orders/:orderCode/cancel
 * Hủy đơn hàng và hoàn trả tồn kho vào SQL
 */
app.post('/api/orders/:orderCode/cancel', async (req, res) => {
    try {
        const { orderCode } = req.params;

        if (dbConnected && pool) {
            const conn = await pool.getConnection();
            try {
                await conn.beginTransaction();

                // Lấy chi tiết đơn
                const [items] = await conn.query('SELECT * FROM order_items WHERE order_code = ?', [orderCode]);

                // Hoàn lại tồn kho từng món
                for (const it of items) {
                    if (it.product_id) {
                        await conn.query(`
                            UPDATE product_variants 
                            SET stock = stock + ?, sold = GREATEST(0, sold - ?)
                            WHERE product_id = ? 
                            ORDER BY id ASC LIMIT 1 OFFSET ?
                        `, [it.qty, it.qty, it.product_id, it.variant_index || 0]);
                    }
                }

                // Đánh dấu hủy
                await conn.query('UPDATE orders SET is_cancelled = TRUE WHERE order_code = ?', [orderCode]);

                await conn.commit();
                return res.json({ success: true, message: `Đã hủy đơn ${orderCode} và hoàn trả đầy đủ tồn kho vào hệ thống!` });
            } catch (txErr) {
                await conn.rollback();
                throw txErr;
            } finally {
                conn.release();
            }
        }

        res.json({ success: true, message: 'Đã hủy đơn (Fallback)' });
    } catch (err) {
        console.error('Lỗi POST /api/orders/:orderCode/cancel:', err);
        res.status(500).json({ success: false, message: 'Lỗi hủy đơn hoàn kho', error: err.message });
    }
});

// ====================================================================
// 4. RESTful APIs: MÃ GIẢM GIÁ (COUPONS 48H)
// ====================================================================

/**
 * POST /api/coupons
 * Admin phát hành mã giảm giá
 */
app.post('/api/coupons', async (req, res) => {
    try {
        const { code, percent, targetPhone = null } = req.body;
        if (!code || !percent) {
            return res.status(400).json({ success: false, message: 'Vui lòng cung cấp mã và % giảm giá!' });
        }

        if (dbConnected && pool) {
            await pool.query(
                'INSERT INTO coupons (code, percent, created_at, target_phone, is_active) VALUES (?, ?, ?, ?, TRUE)',
                [code.toUpperCase(), Number(percent), Date.now(), targetPhone || null]
            );
            return res.status(201).json({ success: true, message: `Đã phát hành mã ${code.toUpperCase()} (-${percent}%) có hiệu lực 48 giờ!` });
        }

        res.status(201).json({ success: true, message: 'Đã tạo coupon (Fallback)' });
    } catch (err) {
        console.error('Lỗi POST /api/coupons:', err);
        res.status(500).json({ success: false, message: 'Lỗi tạo coupon', error: err.message });
    }
});

/**
 * POST /api/coupons/apply
 * Kiểm tra tính hợp lệ và áp mã voucher
 */
app.post('/api/coupons/apply', async (req, res) => {
    try {
        const { code, phone } = req.body;
        if (!code) return res.status(400).json({ success: false, message: 'Chưa nhập mã giảm giá!' });

        const COUPON_VALID_DURATION_MS = 48 * 60 * 60 * 1000;

        if (dbConnected && pool) {
            const [rows] = await pool.query('SELECT * FROM coupons WHERE code = ? AND is_active = TRUE', [code.toUpperCase()]);
            if (rows.length === 0) {
                return res.status(404).json({ success: false, message: 'Mã giảm giá không tồn tại hoặc đã bị tắt!' });
            }

            const cp = rows[0];
            const now = Date.now();

            if (now - cp.created_at > COUPON_VALID_DURATION_MS) {
                return res.status(400).json({ success: false, message: 'Mã giảm giá này đã hết hạn sử dụng (48h)!' });
            }

            if (cp.target_phone && cp.target_phone !== phone) {
                return res.status(403).json({ success: false, message: 'Mã này là voucher độc quyền cho tài khoản khác!' });
            }

            // Kiểm tra đã dùng chưa
            if (phone) {
                const [used] = await pool.query('SELECT id FROM coupon_usages WHERE code = ? AND account_phone = ?', [cp.code, phone]);
                if (used.length > 0) {
                    return res.status(400).json({ success: false, message: 'Tài khoản của bạn đã sử dụng mã này rồi!' });
                }
            }

            return res.json({
                success: true,
                message: `Áp mã thành công! Giảm ${cp.percent}%`,
                coupon: { code: cp.code, percent: cp.percent }
            });
        }

        // Fallback test code
        if (code.toUpperCase().includes('10')) {
            return res.json({ success: true, coupon: { code: code.toUpperCase(), percent: 10 } });
        }

        res.status(400).json({ success: false, message: 'Mã giảm giá không hợp lệ!' });
    } catch (err) {
        console.error('Lỗi POST /api/coupons/apply:', err);
        res.status(500).json({ success: false, message: 'Lỗi kiểm tra mã giảm giá', error: err.message });
    }
});

// ====================================================================
// 5. RESTful APIs: PROXY GEMINI AI (GIẤU KEY AN TOÀN TRÊN SERVER)
// ====================================================================

/**
 * POST /api/ai/try-on
 * Proxy Gemini AI Virtual Try-on (Thử đồ & tư vấn phối áo bóng rổ)
 */
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

/**
 * POST /api/ai/chat
 * Proxy Gemini AI giải đáp thắc mắc về bóng rổ & kích thước
 */
app.post('/api/ai/chat', async (req, res) => {
    try {
        const { message, customerPhone } = req.body;

        const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
        
        const requestBody = {
            contents: [
                {
                    parts: [
                        { text: `Bạn là trợ lý ảo hỗ trợ khách hàng của cửa hàng bóng rổ Mairua Hoops (mairua.com). Hãy trả lời ngắn gọn, thân thiện, mang tinh thần thể thao năng động. Câu hỏi của khách: "${message}"` }
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
        const replyText = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Mairua Hoops hân hạnh phục vụ bạn!';

        res.json({ success: true, reply: replyText });
    } catch (err) {
        console.error('Lỗi POST /api/ai/chat:', err);
        res.status(500).json({ success: false, message: 'Lỗi kết nối Gemini AI', error: err.message });
    }
});

// ====================================================================
// 5.5. PROXY BẢO MẬT GOOGLE SHEETS & CLOUD BACKUP (ẨN HOÀN TOÀN URL)
// ====================================================================

/**
 * POST /api/sync/sheets
 * Chuyển tiếp gửi đơn hàng, tài khoản, coupon lên Google Sheets từ server
 */
app.post('/api/sync/sheets', async (req, res) => {
    try {
        const sheetsUrl = process.env.GOOGLE_SHEETS_API_URL;
        if (!sheetsUrl) {
            return res.json({ success: true, message: 'Google Sheets URL chưa được cấu hình' });
        }

        await fetch(sheetsUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify(req.body)
        });

        res.json({ success: true, message: 'Đã đồng bộ lên Google Sheets thành công!' });
    } catch (err) {
        console.warn('Proxy Sheets cảnh báo:', err.message);
        res.json({ success: false, message: 'Đã ghi nhận cục bộ' });
    }
});

/**
 * GET /api/sync/sheets
 * Lấy dữ liệu từ Google Sheets về server
 */
app.get('/api/sync/sheets', async (req, res) => {
    try {
        const sheetsUrl = process.env.GOOGLE_SHEETS_API_URL;
        if (!sheetsUrl) {
            return res.json({ success: false, message: 'Google Sheets URL chưa được cấu hình' });
        }

        const response = await fetch(sheetsUrl);
        if (!response.ok) return res.status(response.status).json({ success: false });

        const data = await response.json();
        res.json(data);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

/**
 * GET /api/sync/cloud
 * Đồng bộ dữ liệu dự phòng JSONBin
 */
app.get('/api/sync/cloud', async (req, res) => {
    try {
        const binId = process.env.JSONBIN_BIN_ID;
        const masterKey = process.env.JSONBIN_MASTER_KEY;
        if (!binId || !masterKey) return res.json({ record: null });

        const response = await fetch(`https://api.jsonbin.io/v3/b/${binId}/latest`, {
            headers: { 'X-Master-Key': masterKey }
        });
        const data = await response.json();
        res.json(data);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

/**
 * PUT /api/sync/cloud
 */
app.put('/api/sync/cloud', async (req, res) => {
    try {
        const binId = process.env.JSONBIN_BIN_ID;
        const masterKey = process.env.JSONBIN_MASTER_KEY;
        if (!binId || !masterKey) return res.json({ success: true });

        const response = await fetch(`https://api.jsonbin.io/v3/b/${binId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': masterKey
            },
            body: JSON.stringify(req.body)
        });
        const data = await response.json();
        res.json(data);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ====================================================================
// 6. PHỤC VỤ FILE TĨNH (FRONTEND)
// ====================================================================
app.use(express.static(__dirname));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Khởi chạy Máy chủ
app.listen(PORT, () => {
    console.log(`====================================================================`);
    console.log(`🏀 MAIRUA HOOPS FULL-STACK BACKEND SERVER ĐANG CHẠY!`);
    console.log(`🌐 Website       : http://localhost:${PORT}`);
    console.log(`📡 API Products  : http://localhost:${PORT}/api/products`);
    console.log(`📦 API Orders    : http://localhost:${PORT}/api/orders`);
    console.log(`🤖 AI Restock    : http://localhost:${PORT}/api/admin/restock`);
    console.log(`====================================================================`);
});
