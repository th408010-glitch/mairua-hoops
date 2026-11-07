/**
 * ====================================================================
 * MAIRUA HOOPS - WEB & API SERVER (GOOGLE SHEETS CLOUD SYNC)
 * Thương mại điện tử đồ bóng rổ & Custom Studio - mairua.com
 * Công nghệ: Node.js + Express + Google Sheets Cloud Sync + Groq AI
 * ====================================================================
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const GOOGLE_SHEETS_API_URL = process.env.GOOGLE_SHEETS_API_URL || "https://script.google.com/macros/s/AKfycbx6V2t4b_znLJ0UE4UOz28Eh2OzXI5cthhtjhnlBh_e0QpObOeOW7u58MjXQVgxztDk/exec";
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

// BẢO MẬT HỆ THỐNG: Chặn tuyệt đối tải trực tiếp file cấu hình (.env, .sql, thư mục nội bộ)
app.use((req, res, next) => {
    const p = req.path.toLowerCase();
    if (
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
// QUẢN LÝ TỒN KHO TRUNG TÂM (ĐỒNG BỘ ĐA THIẾT BỊ 100% LAPTOP & MOBILE)
// ====================================================================
const INVENTORY_FILE = path.join(__dirname, 'data', 'inventory_products.json');
let serverProducts = [];

function loadServerInventory() {
    try {
        if (!fs.existsSync(path.join(__dirname, 'data'))) {
            fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });
        }
        if (fs.existsSync(INVENTORY_FILE)) {
            const raw = fs.readFileSync(INVENTORY_FILE, 'utf8');
            serverProducts = JSON.parse(raw);
            console.log(`📦 [Inventory] Đã nạp ${serverProducts.length} sản phẩm tồn kho từ ${INVENTORY_FILE}`);
            return;
        }
        // Khởi tạo từ products_seed.json
        const seedPath = path.join(__dirname, 'products_seed.json');
        if (fs.existsSync(seedPath)) {
            const raw = fs.readFileSync(seedPath, 'utf8');
            serverProducts = JSON.parse(raw);
            saveServerInventory();
            console.log(`📦 [Inventory] Đã khởi tạo tồn kho từ products_seed.json (${serverProducts.length} sản phẩm)`);
        }
    } catch (e) {
        console.warn('⚠️ Lỗi nạp tồn kho server:', e.message);
    }
}

function saveServerInventory() {
    try {
        fs.writeFileSync(INVENTORY_FILE, JSON.stringify(serverProducts, null, 2), 'utf8');
    } catch (e) {
        console.warn('⚠️ Lỗi lưu tồn kho server:', e.message);
    }
}

loadServerInventory();

// GET /api/products: Trả về danh sách sản phẩm và số lượng tồn kho thực tế đồng bộ cho mọi máy
app.get('/api/products', (req, res) => {
    if (serverProducts.length === 0) loadServerInventory();
    res.json({ success: true, data: serverProducts });
});

// POST /api/products/deduct: Trừ tồn kho đồng bộ khi có đơn hàng (cả đơn thật và đơn tự động)
app.post('/api/products/deduct', (req, res) => {
    const { deductions } = req.body;
    if (Array.isArray(deductions)) {
        deductions.forEach(d => {
            const prod = serverProducts.find(p => p.id === Number(d.prodId));
            if (prod && Array.isArray(prod.variants)) {
                const vIdx = Number(d.vIdx) || 0;
                const qty = parseInt(d.qty) || 1;
                if (prod.variants[vIdx]) {
                    prod.variants[vIdx].stock = Math.max(0, (prod.variants[vIdx].stock || 0) - qty);
                    prod.variants[vIdx].sold = (prod.variants[vIdx].sold || 0) + qty;
                }
                prod.stock = prod.variants.reduce((s, v) => s + (v.stock || 0), 0);
                prod.sold = prod.variants.reduce((s, v) => s + (v.sold || 0), 0);
            }
        });
        saveServerInventory();
    }
    res.json({ success: true, message: 'Đã trừ tồn kho máy chủ thành công', data: serverProducts });
});

// POST /api/products/restock & /api/admin/restock: Nhập kho thêm số lượng thực tế
app.post(['/api/products/restock', '/api/admin/restock'], (req, res) => {
    const { prodId, vIdx, qty, costPrice, restockList } = req.body;
    let itemsToRestock = [];
    if (Array.isArray(restockList)) {
        itemsToRestock = restockList;
    } else if (prodId !== undefined) {
        itemsToRestock.push({ prodId, vIdx, qty, costPrice });
    }

    if (serverProducts.length === 0) loadServerInventory();

    itemsToRestock.forEach(item => {
        const prod = serverProducts.find(p => p.id === Number(item.prodId || item.id));
        if (prod && Array.isArray(prod.variants)) {
            const v = prod.variants[Number(item.vIdx) || 0];
            if (v) {
                const add = parseInt(item.qty || item.addQty || item.added) || 0;
                v.stock = (v.stock || 0) + add;
                if (item.costPrice || item.unitCost) v.costPrice = Number(item.costPrice || item.unitCost);
            }
            prod.stock = prod.variants.reduce((s, va) => s + (va.stock || 0), 0);
        }
    });

    saveServerInventory();
    res.json({ success: true, message: 'Đã cập nhật số lượng nhập kho vào máy chủ', data: serverProducts });
});

// POST /api/products/sync & /api/products/sync-stocks: Ghi đè cập nhật danh mục sản phẩm từ Admin
app.post(['/api/products/sync', '/api/products/sync-stocks'], (req, res) => {
    const list = req.body.products || req.body.productsList;
    if (Array.isArray(list) && list.length > 0) {
        serverProducts = list;
        saveServerInventory();
        return res.json({ success: true, message: 'Đã đồng bộ kho hàng lên server thành công', data: serverProducts });
    }
    res.json({ success: false, message: 'Danh sách sản phẩm không hợp lệ' });
});

// ====================================================================
// 1. PROXY GOOGLE SHEETS CLOUD SYNC (ĐỒNG BỘ ĐA THIẾT BỊ 100% QUA GOOGLE SHEETS)
// ====================================================================

/**
 * POST /api/sync/sheets
 * Chuyển tiếp gửi đơn hàng, tài khoản, coupon lên Google Sheets từ server
 */
app.post('/api/sync/sheets', async (req, res) => {
    try {
        if (!GOOGLE_SHEETS_API_URL) {
            return res.json({ success: true, message: 'Google Sheets URL chưa được cấu hình' });
        }

        const sheetResponse = await fetch(GOOGLE_SHEETS_API_URL, {
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
 * Lấy toàn bộ đơn hàng, tài khoản và coupon từ Google Sheets về hiển thị
 */
app.get('/api/sync/sheets', async (req, res) => {
    try {
        if (!GOOGLE_SHEETS_API_URL) {
            return res.json({ success: false, message: 'Google Sheets URL chưa được cấu hình' });
        }

        const response = await fetch(GOOGLE_SHEETS_API_URL);
        if (!response.ok) return res.status(response.status).json({ success: false });

        const data = await response.json();
        res.json(data);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ====================================================================
// 2. DỰ PHÒNG CLOUD BACKUP (JSONBIN)
// ====================================================================

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
// 3. PROXY GEMINI AI VIRTUAL TRY-ON
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
// 4. AI CHATBOT TƯ VẤN THỜI TRANG & THIẾT BỊ BÓNG RỔ (GROQ LLAMA 3.3 70B)
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
// 5. PHỤC VỤ FILE TĨNH (FRONTEND)
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
    console.log(`🏀 MAIRUA HOOPS WEB & GOOGLE SHEETS CLOUD SERVER ĐANG CHẠY!`);
    console.log(`🌐 Website       : http://localhost:${PORT}`);
    console.log(`📊 Google Sheets : ${GOOGLE_SHEETS_API_URL}`);
    console.log(`🤖 AI Chatbot    : Groq Llama 3.3 70B Versatile`);
    console.log(`====================================================================`);
});
