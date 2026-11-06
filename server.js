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
const fs = require('fs');
const dotenv = require('dotenv');
const mysql = require('mysql2/promise');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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

// Database Pool Connection (Hỗ trợ SQLite chuẩn bảo mật & MySQL)
let pool = null;
let dbConnected = false;
let dbType = 'sqlite'; // 'sqlite' hoặc 'mysql'

function taoSqliteQueryAdapter(sqliteDb) {
    const executeQuery = async (sql, params = []) => {
        let cleanSql = sql.trim();
        // Chuyển đổi tương thích SQL: GREATEST -> MAX
        cleanSql = cleanSql.replace(/GREATEST\s*\(/gi, 'MAX(');
        // Chuyển đổi tương thích UPDATE LIMIT OFFSET trên SQLite
        cleanSql = cleanSql.replace(/WHERE\s+product_id\s*=\s*\?\s+ORDER\s+BY\s+id\s+ASC\s+LIMIT\s+1\s+OFFSET\s*\?/gi, 
            'WHERE id = (SELECT id FROM product_variants WHERE product_id = ? ORDER BY id ASC LIMIT 1 OFFSET ?)');

        const lower = cleanSql.toLowerCase();
        if (lower.startsWith('select') || lower.startsWith('pragma')) {
            const rows = await sqliteDb.all(cleanSql, params);
            return [rows];
        } else {
            const result = await sqliteDb.run(cleanSql, params);
            return [{
                insertId: result.lastID,
                affectedRows: result.changes,
                lastID: result.lastID,
                changes: result.changes
            }];
        }
    };

    return {
        query: executeQuery,
        getConnection: async () => {
            return {
                query: executeQuery,
                beginTransaction: async () => { await sqliteDb.run('BEGIN TRANSACTION'); },
                commit: async () => { await sqliteDb.run('COMMIT'); },
                rollback: async () => { await sqliteDb.run('ROLLBACK'); },
                release: () => {}
            };
        }
    };
}

// Hàm tính giá vốn mặc định theo giá bán: Giá bán - (100.000đ đến 200.000đ)
function tinhGiaVonMacDinh(price) {
    price = Number(price) || 0;
    if (price >= 800000) return Math.max(50000, price - 200000);
    if (price >= 400000) return Math.max(50000, price - 150000);
    if (price >= 150000) return Math.max(30000, price - 100000);
    return Math.max(20000, Math.round(price * 0.6));
}

async function initDatabase() {
    // Nếu có cấu hình DB_CLIENT=mysql và các thông số MySQL rõ ràng thì thử MySQL trước
    if (process.env.DB_CLIENT === 'mysql') {
        try {
            const mysqlPool = mysql.createPool({
                host: process.env.DB_HOST || 'localhost',
                port: Number(process.env.DB_PORT) || 3306,
                user: process.env.DB_USER || 'root',
                password: process.env.DB_PASSWORD || '',
                database: process.env.DB_NAME || 'mairua_db',
                waitForConnections: true,
                connectionLimit: 15,
                queueLimit: 0
            });
            await mysqlPool.query('SELECT 1 + 1 AS test');
            pool = mysqlPool;
            dbConnected = true;
            dbType = 'mysql';
            console.log('🏀 [Database] Kết nối MySQL thành công (database: mairua_db)!');
            return;
        } catch (err) {
            console.warn('⚠️ [Database] Không kết nối được MySQL, tự động kích hoạt SQLite bảo mật:', err.message);
        }
    }

    // MẶC ĐỊNH & KHUYẾN NGHỊ: Khởi tạo SQLite tự động (Zero-config, chạy ngay không cần cài đặt thêm server)
    try {
        const dataDir = path.join(__dirname, 'data');
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
        const dbPath = path.join(dataDir, 'mairua.db');
        const sqliteDb = await open({
            filename: dbPath,
            driver: sqlite3.Database
        });

        await sqliteDb.exec('PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL;');

        // 1. Tạo bảng Accounts
        await sqliteDb.exec(`
            CREATE TABLE IF NOT EXISTS accounts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                phone VARCHAR(20) UNIQUE NOT NULL,
                pass_hash VARCHAR(255) NOT NULL,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100),
                orders_count INT DEFAULT 0,
                mcoin INT DEFAULT 0,
                ai_tokens INT DEFAULT 3,
                tier_level VARCHAR(50) DEFAULT 'Đồng',
                is_admin BOOLEAN DEFAULT 0,
                created_at BIGINT
            );
        `);

        // 2. Tạo bảng Addresses
        await sqliteDb.exec(`
            CREATE TABLE IF NOT EXISTS addresses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                account_phone VARCHAR(20) NOT NULL,
                recipient_name VARCHAR(100) NOT NULL,
                recipient_phone VARCHAR(20) NOT NULL,
                province VARCHAR(100),
                ward VARCHAR(100),
                street VARCHAR(255),
                full_address TEXT NOT NULL,
                is_default BOOLEAN DEFAULT 0
            );
        `);

        // 3. Tạo bảng Products
        await sqliteDb.exec(`
            CREATE TABLE IF NOT EXISTS products (
                id INTEGER PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                category VARCHAR(50),
                price INT NOT NULL,
                cost_price INT DEFAULT 0,
                rating REAL DEFAULT 5.0,
                reviews_count INT DEFAULT 0,
                stock INT DEFAULT 0,
                sold INT DEFAULT 0,
                is_jersey_blank BOOLEAN DEFAULT 0,
                is_accessory BOOLEAN DEFAULT 0,
                has_size BOOLEAN DEFAULT 0,
                sizes TEXT,
                specs TEXT,
                description TEXT
            );
        `);

        // 4. Tạo bảng Product Variants
        await sqliteDb.exec(`
            CREATE TABLE IF NOT EXISTS product_variants (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                product_id INT NOT NULL,
                color_name VARCHAR(100) NOT NULL,
                hex VARCHAR(20) NOT NULL,
                img TEXT NOT NULL,
                stock INT DEFAULT 0,
                sold INT DEFAULT 0,
                cost_price INT DEFAULT 0,
                FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
            );
        `);

        // 5. Tạo bảng Orders
        await sqliteDb.exec(`
            CREATE TABLE IF NOT EXISTS orders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                order_code VARCHAR(50) UNIQUE NOT NULL,
                account_phone VARCHAR(20),
                customer_name VARCHAR(100) NOT NULL,
                customer_phone VARCHAR(20) NOT NULL,
                customer_addr TEXT NOT NULL,
                subtotal INT NOT NULL,
                discount_amt INT DEFAULT 0,
                used_mcoin INT DEFAULT 0,
                earned_mcoin INT DEFAULT 0,
                cashback_percent INT DEFAULT 5,
                shipping_fee INT DEFAULT 30000,
                final_total INT NOT NULL,
                coupon_used VARCHAR(50),
                has_custom_jersey BOOLEAN DEFAULT 0,
                jersey_count INT DEFAULT 0,
                status VARCHAR(50) DEFAULT 'Chờ xác nhận',
                status_step_idx INT DEFAULT 0,
                admin_confirmed BOOLEAN DEFAULT 0,
                is_cancelled BOOLEAN DEFAULT 0,
                needs_invoice BOOLEAN DEFAULT 0,
                invoice_info_json TEXT,
                start_time BIGINT,
                confirmed_at BIGINT,
                delivered_at BIGINT
            );
        `);

        // 6. Tạo bảng Order Items
        await sqliteDb.exec(`
            CREATE TABLE IF NOT EXISTS order_items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                order_code VARCHAR(50) NOT NULL,
                product_id INT,
                variant_index INT DEFAULT 0,
                item_name VARCHAR(255) NOT NULL,
                sub_info VARCHAR(255),
                unit_price INT NOT NULL,
                qty INT NOT NULL,
                custom_design_json TEXT
            );
        `);

        // 7. Tạo bảng Coupons
        await sqliteDb.exec(`
            CREATE TABLE IF NOT EXISTS coupons (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                code VARCHAR(50) UNIQUE NOT NULL,
                percent INT NOT NULL,
                created_at BIGINT NOT NULL,
                target_phone VARCHAR(20),
                is_active BOOLEAN DEFAULT 1
            );
        `);

        // 8. Tạo bảng Coupon Usages
        await sqliteDb.exec(`
            CREATE TABLE IF NOT EXISTS coupon_usages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                code VARCHAR(50) NOT NULL,
                account_phone VARCHAR(20) NOT NULL,
                used_at BIGINT
            );
        `);

        // 9. Tạo bảng Product Reviews
        await sqliteDb.exec(`
            CREATE TABLE IF NOT EXISTS product_reviews (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                product_id INT NOT NULL,
                order_code VARCHAR(50),
                phone VARCHAR(20),
                author_name VARCHAR(100),
                stars INT NOT NULL,
                comment TEXT,
                img TEXT,
                created_at BIGINT
            );
        `);

        // Migration an toàn cho database hiện hữu: Bổ sung cột cost_price nếu chưa có
        try { await sqliteDb.exec(`ALTER TABLE products ADD COLUMN cost_price INT DEFAULT 0;`); } catch(e) {}
        try { await sqliteDb.exec(`ALTER TABLE product_variants ADD COLUMN cost_price INT DEFAULT 0;`); } catch(e) {}

        // Tự động Seed tài khoản Admin nếu bảng accounts còn trống
        const accCount = await sqliteDb.get('SELECT COUNT(*) as count FROM accounts');
        if (!accCount || accCount.count === 0) {
            const salt = await bcrypt.genSalt(10);
            const adminPassHash = await bcrypt.hash('5888', salt);
            await sqliteDb.run(`
                INSERT INTO accounts (phone, pass_hash, name, email, orders_count, mcoin, ai_tokens, tier_level, is_admin, created_at)
                VALUES (?, ?, ?, ?, 99, 999999, 99, 'Kim Cương', 1, ?)
            `, ['0909501753', adminPassHash, 'Admin Mairua Hoops', 'admin@mairua.com', Date.now()]);
            console.log('👑 [SQLite] Đã tự động tạo tài khoản Admin bảo mật: 0909501753 / 5888');
        }

        // Tự động Seed toàn bộ 37 sản phẩm từ products_seed.json nếu bảng products còn trống
        const prodCount = await sqliteDb.get('SELECT COUNT(*) as count FROM products');
        if (!prodCount || prodCount.count === 0) {
            let seedData = [];
            try {
                seedData = require(path.join(__dirname, 'products_seed.json'));
            } catch(e) {
                seedData = [];
            }
            if (Array.isArray(seedData) && seedData.length > 0) {
                for (const p of seedData) {
                    const costPrice = p.cost_price || p.costPrice || tinhGiaVonMacDinh(p.price);
                    await sqliteDb.run(`
                        INSERT OR REPLACE INTO products (id, name, category, price, cost_price, rating, reviews_count, stock, sold, is_jersey_blank, is_accessory, has_size, sizes, specs, description)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    `, [
                        p.id, p.name, p.category, p.price, costPrice, p.rating || 5, p.reviewsCount || 0,
                        p.stock || 0, p.sold || 0, p.isJerseyBlank ? 1 : 0, p.isAccessory ? 1 : 0,
                        p.hasSize ? 1 : 0, JSON.stringify(p.sizes || []), JSON.stringify(p.specs || []),
                        p.description || ''
                    ]);

                    if (Array.isArray(p.variants)) {
                        for (const v of p.variants) {
                            const vCostPrice = v.cost_price || v.costPrice || costPrice;
                            await sqliteDb.run(`
                                INSERT INTO product_variants (product_id, color_name, hex, img, stock, sold, cost_price)
                                VALUES (?, ?, ?, ?, ?, ?, ?)
                            `, [p.id, v.colorName, v.hex, v.img, v.stock || 0, v.sold || 0, vCostPrice]);
                        }
                    }
                }
                console.log(`📦 [SQLite] Đã tự động nạp thành công ${seedData.length} sản phẩm & các biến thể vào Database!`);
            }
        }

        pool = taoSqliteQueryAdapter(sqliteDb);
        dbConnected = true;
        dbType = 'sqlite';
        console.log('🔒 [Database] Khởi chạy SQLite bảo mật thành công tại data/mairua.db!');
    } catch (err) {
        dbConnected = false;
        console.error('⚠️ [Database] Lỗi khởi tạo SQLite:', err);
        console.warn('💡 [Database] Chuyển sang chế độ In-Memory & LocalStorage Fallback.');
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
const fallbackOrders = [];
let fallbackProducts = [];
try { fallbackProducts = require('./products_seed.json'); } catch(e) { fallbackProducts = []; }

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

            for (const p of prods) {
                const [vars] = await pool.query(
                    'SELECT id, color_name AS colorName, hex, img, stock, sold, cost_price AS costPrice FROM product_variants WHERE product_id = ? ORDER BY id ASC',
                    [p.id]
                );
                p.costPrice = p.cost_price || tinhGiaVonMacDinh(p.price);
                vars.forEach(v => {
                    v.costPrice = v.costPrice || v.cost_price || p.costPrice;
                });
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

        // FALLBACK ĐỒNG BỘ CLOUD: Phục vụ trực tiếp danh sách 37 sản phẩm với tồn kho thống nhất
        let prods = JSON.parse(JSON.stringify(fallbackProducts));
        if (cat && cat !== 'all') prods = prods.filter(p => p.cat === cat);
        if (min_price) prods = prods.filter(p => p.price >= Number(min_price));
        if (max_price) prods = prods.filter(p => p.price <= Number(max_price));
        if (search) {
            let sLower = search.toLowerCase();
            prods = prods.filter(p => p.name.toLowerCase().includes(sLower));
        }
        if (sort === 'price_asc') prods.sort((a, b) => a.price - b.price);
        else if (sort === 'price_desc') prods.sort((a, b) => b.price - a.price);

        prods.forEach(p => {
            if (Array.isArray(p.variants)) {
                p.stock = p.variants.reduce((s, v) => s + (v.stock || 0), 0);
                p.sold = p.variants.reduce((s, v) => s + (v.sold || 0), 0);
            }
        });

        res.json({ success: true, source: 'fallback', count: prods.length, data: prods });
    } catch (err) {
        console.error('Lỗi GET /api/products:', err);
        res.status(500).json({ success: false, message: 'Lỗi máy chủ khi lấy danh sách sản phẩm', error: err.message });
    }
});

/**
 * POST /api/products/sync-stocks
 * Đồng bộ toàn bộ tồn kho giữa các thiết bị (Laptop, Điện thoại) lên Server Cloud
 */
app.post('/api/products/sync-stocks', (req, res) => {
    try {
        const { productsList, variantStocks } = req.body;
        if (Array.isArray(productsList) && productsList.length > 0) {
            productsList.forEach(p => {
                const prod = fallbackProducts.find(fp => fp.id === p.id);
                if (prod && Array.isArray(p.variants)) {
                    p.variants.forEach((v, vIdx) => {
                        if (prod.variants[vIdx]) {
                            if (typeof v.stock === 'number') prod.variants[vIdx].stock = v.stock;
                            if (typeof v.sold === 'number') prod.variants[vIdx].sold = v.sold;
                        }
                    });
                    prod.stock = prod.variants.reduce((s, vr) => s + (vr.stock || 0), 0);
                    prod.sold = prod.variants.reduce((s, vr) => s + (vr.sold || 0), 0);
                }
            });
        } else if (Array.isArray(variantStocks)) {
            variantStocks.forEach(vs => {
                const prod = fallbackProducts.find(fp => fp.id === vs.id);
                if (prod && Array.isArray(prod.variants) && Array.isArray(vs.v)) {
                    vs.v.forEach((vItem, vIdx) => {
                        if (prod.variants[vIdx]) {
                            if (typeof vItem.s === 'number') prod.variants[vIdx].stock = vItem.s;
                            if (typeof vItem.d === 'number') prod.variants[vIdx].sold = vItem.d;
                        }
                    });
                    prod.stock = prod.variants.reduce((s, vr) => s + (vr.stock || 0), 0);
                    prod.sold = prod.variants.reduce((s, vr) => s + (vr.sold || 0), 0);
                }
            });
        }

        // Lưu bản sao dự phòng xuống file nếu môi trường cho phép
        try {
            const fs = require('fs');
            fs.writeFileSync('./products_seed.json', JSON.stringify(fallbackProducts, null, 2));
        } catch(e) {}

        res.json({ success: true, message: 'Đã đồng bộ tồn kho thành công lên Máy Chủ Cloud!', count: fallbackProducts.length });
    } catch (err) {
        console.error('Lỗi POST /api/products/sync-stocks:', err);
        res.status(500).json({ success: false, message: 'Lỗi đồng bộ tồn kho', error: err.message });
    }
});

/**
 * POST /api/admin/restock
 * Tính năng "AI Nhập Hàng Tự Động"
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

        // Cập nhật tồn kho vào bộ nhớ Fallback Server
        if (Array.isArray(restockList)) {
            restockList.forEach(item => {
                const prod = fallbackProducts.find(p => p.id === Number(item.productId));
                if (prod && Array.isArray(prod.variants)) {
                    const v = prod.variants[item.variantIndex || 0] || prod.variants[0];
                    if (v) {
                        v.stock = (v.stock || 0) + Number(item.addStock || 0);
                    }
                    prod.stock = prod.variants.reduce((s, vr) => s + (vr.stock || 0), 0);
                }
            });
            try {
                fs.writeFileSync('./products_seed.json', JSON.stringify(fallbackProducts, null, 2));
            } catch(e) {}
        }

        res.json({
            success: true,
            message: 'Đã nhận lệnh nhập hàng và đồng bộ tồn kho toàn hệ thống!',
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

        // Lưu ngay vào danh sách đơn hàng máy chủ (Fallback cho Cloud Render)
        const fbOrder = {
            order_code: genCode,
            orderCode: genCode,
            account_phone: accountPhone || customerPhone,
            accountPhone: accountPhone || customerPhone,
            customer_phone: customerPhone,
            phone: customerPhone,
            customer_name: customerName,
            name: customerName,
            customer_address: customerAddr || req.body.customerAddress,
            addr: customerAddr || req.body.customerAddress,
            subtotal: subtotal || req.body.finalAmount || 0,
            discount_amount: discountAmt || req.body.discountAmount || 0,
            shipping_fee: shippingFee || req.body.shippingFee || 30000,
            final_amount: finalTotal || req.body.finalAmount || 0,
            finalTotal: finalTotal || req.body.finalAmount || 0,
            status: 'Chờ xác nhận',
            status_step_idx: 0,
            has_custom_jersey: hasCustomJersey ? 1 : 0,
            hasCustomJersey: !!hasCustomJersey,
            itemsList: Array.isArray(items) ? items.map(i => `${i.name} (x${i.qty || 1})`) : [],
            itemsCount: Array.isArray(items) ? items.reduce((s, i) => s + (i.qty || 1), 0) : 1,
            cartSnapshot: Array.isArray(items) ? items : [],
            start_time: startTime,
            startTime: startTime
        };
        fallbackOrders.unshift(fbOrder);

        // Trừ tồn kho đồng bộ trong fallbackProducts trên Server Cloud
        if (Array.isArray(items)) {
            items.forEach(item => {
                if (item.productId) {
                    const prod = fallbackProducts.find(p => p.id === Number(item.productId));
                    if (prod && Array.isArray(prod.variants)) {
                        const v = prod.variants[item.variantIndex || 0] || prod.variants[0];
                        if (v) {
                            v.stock = Math.max(0, (v.stock || 0) - Number(item.qty || 1));
                            v.sold = (v.sold || 0) + Number(item.qty || 1);
                        }
                        prod.stock = prod.variants.reduce((s, vr) => s + (vr.stock || 0), 0);
                        prod.sold = prod.variants.reduce((s, vr) => s + (vr.sold || 0), 0);
                    }
                }
            });
        }

        // Dọn sạch giỏ hàng đám mây trên máy chủ ngay lập tức
        if (customerPhone) cloudCarts[customerPhone] = [];
        if (accountPhone) cloudCarts[accountPhone] = [];

        res.status(201).json({
            success: true,
            message: 'Tạo đơn hàng thành công (Lưu trên Server Cloud)',
            orderCode: genCode,
            order: fbOrder
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

        // FALLBACK ĐỒNG BỘ ĐƠN HÀNG: Trả về đơn hàng đã lưu trên máy chủ
        let list = fallbackOrders;
        if (phone) {
            list = fallbackOrders.filter(o => o.phone === phone || o.accountPhone === phone || o.customer_phone === phone || o.account_phone === phone);
        }
        res.json({ success: true, source: 'fallback', count: list.length, data: list });
    } catch (err) {
        console.error('Lỗi GET /api/orders:', err);
        res.status(500).json({ success: false, message: 'Lỗi lấy danh sách đơn', error: err.message });
    }
});

/**
 * PUT /api/orders/:orderCode/status
 */
app.put('/api/orders/:orderCode/status', async (req, res) => {
    try {
        const { orderCode } = req.params;
        const { stepIdx, adminConfirmed, status } = req.body;

        if (dbConnected && pool) {
            let sql = 'UPDATE orders SET status_step_idx = ?';
            const params = [stepIdx];

            if (status) {
                sql += ', status = ?';
                params.push(status);
            }

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
        }

        // Cập nhật ngay trong fallbackOrders trên bộ nhớ máy chủ (hỗ trợ sync đa thiết bị tức thì)
        const fbOrd = fallbackOrders.find(o => o.orderCode === orderCode || o.order_code === orderCode);
        if (fbOrd) {
            if (typeof stepIdx === 'number') {
                fbOrd.status_step_idx = stepIdx;
                fbOrd.manualStepIdx = stepIdx;
            }
            if (status) fbOrd.status = status;
            if (adminConfirmed !== undefined) {
                fbOrd.admin_confirmed = !!adminConfirmed;
                fbOrd.adminConfirmed = !!adminConfirmed;
                if (adminConfirmed && !fbOrd.confirmedAt) fbOrd.confirmedAt = Date.now();
            }
            if (stepIdx === 4 && !fbOrd.deliveredAt) fbOrd.deliveredAt = Date.now();
        }

        return res.json({ success: true, message: `Đã cập nhật tiến trình đơn ${orderCode} sang bước ${stepIdx}` });
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

        // Hoàn lại tồn kho trong fallbackProducts trên Server Cloud
        const ordToCancel = fallbackOrders.find(o => o.orderCode === orderCode || o.order_code === orderCode);
        if (ordToCancel) {
            ordToCancel.status = 'Đã hủy';
            if (Array.isArray(ordToCancel.cartSnapshot)) {
                ordToCancel.cartSnapshot.forEach(item => {
                    if (item.productId) {
                        const prod = fallbackProducts.find(p => p.id === Number(item.productId));
                        if (prod && Array.isArray(prod.variants)) {
                            const v = prod.variants[item.variantIndex || 0] || prod.variants[0];
                            if (v) {
                                v.stock = (v.stock || 0) + Number(item.qty || 1);
                                v.sold = Math.max(0, (v.sold || 0) - Number(item.qty || 1));
                            }
                            prod.stock = prod.variants.reduce((s, vr) => s + (vr.stock || 0), 0);
                            prod.sold = prod.variants.reduce((s, vr) => s + (vr.sold || 0), 0);
                        }
                    }
                });
            }
        }

        res.json({ success: true, message: 'Đã hủy đơn và hoàn trả tồn kho trên Server Cloud' });
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

/**
 * POST /api/chat (Hỗ trợ cả POST /api/ai/chat)
 * AI Chatbot Tư Vấn Thiết Bị Bóng Rổ qua Groq API (Llama 3.3 70B Versatile)
 */
app.post(['/api/chat', '/api/ai/chat'], async (req, res) => {
    try {
        const { message, history } = req.body;
        if (!message || !message.trim()) {
            return res.status(400).json({ success: false, message: 'Nội dung tin nhắn không được để trống' });
        }

        const messagesList = [
            { role: 'system', content: MAIRUA_SYSTEM_PROMPT }
        ];

        // Đưa ngữ cảnh lịch sử trò chuyện nếu có
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
            // Fallback gọi trực tiếp endpoint Groq nếu SDK chưa sẵn sàng
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
