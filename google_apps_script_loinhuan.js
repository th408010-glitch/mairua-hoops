/**
 * ====================================================================
 * MAIRUA HOOPS - GOOGLE APPS SCRIPT BACKEND (TỔNG HỢP TOÀN DIỆN)
 * Quản lý 4 Sheets: TaiKhoan | Voucher | DonHang | Loinhuan
 * Chuẩn cột tuyệt đối theo giao diện Sheet Loinhuan:
 * Điền BẮT ĐẦU TỪ Ô B11 (DÒNG 11) ĐẾN DÒNG 41:
 * Cột B: Mã SP (BR-001, BR-002... đến BR-031)
 * Cột C: Tên Sản Phẩm
 * Cột D: Phân Loại
 * Cột E: Giá Bán
 * Cột F: Giá Vốn
 * Cột G: Số Lượng Bán
 * Cột H: Doanh Thu (=G*E)
 * Cột I: Tổng Giá Vốn (=G*F)
 * Cột J: Lợi Nhuận Gộp (=H-I)
 * Cột K: Biên LN Gộp (=J/H)
 * Dòng 42: TỔNG CỘNG
 * ====================================================================
 */

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('🏀 MAIRUA TOOL')
    .addItem('⚡ Tự động điền sản phẩm từ B11 & Cập nhật số lượng bán', 'chayTuDongDienSanPhamVaLoiNhuan')
    .addToUi();
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);
  
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheetAcc = ss.getSheetByName('TaiKhoan') || ss.getSheetByName('taikhoan') || ss.getSheetByName('Taikhoan');
    var sheetOrder = ss.getSheetByName('DonHang') || ss.getSheetByName('donhang') || ss.getSheetByName('Donhang');
    var sheetVoucher = getOrCreateVoucherSheet(ss);
    var sheetProfit = ss.getSheetByName('Loinhuan') || ss.getSheetByName('loinhuan') || ss.getSheetByName('Lợi nhuận');
    
    var data = {};
    if (e && e.postData && e.postData.contents) {
      try { data = JSON.parse(e.postData.contents); } catch(err) { data = {}; }
    }
    var action = data.action;

    // 0. TỰ ĐỘNG ĐIỀN TOÀN BỘ SẢN PHẨM TỪ B11 VÀ ĐẾM SỐ LƯỢNG BÁN
    if (action === 'populateLoinhuan') {
      if (sheetProfit) {
        tuDongDienSanPhamVaCapNhatLoiNhuan(ss);
        return ContentService.createTextOutput(JSON.stringify({ status: 'success', message: 'Đã tự động điền toàn bộ sản phẩm từ ô B11 và cập nhật số lượng bán thành công!' }))
          .setMimeType(ContentService.MimeType.JSON);
      }
    }

    // 1. TẠO ĐƠN HÀNG
    if (action === 'createOrder') {
      var ord = data.order || {};
      if (sheetOrder) {
        var targetRow = getFirstEmptyRow(sheetOrder, 2, 7);
        sheetOrder.getRange(targetRow, 2, 1, 9).setValues([[
          ord.orderCode || '',
          "'" + String(ord.phone || '').trim(),
          ord.name || '',
          ord.addr || '',
          Array.isArray(ord.itemsList) ? ord.itemsList.join('\n') : (ord.itemsList || ''),
          Number(ord.finalTotal) || 0,
          ord.status || 'Chờ xác nhận',
          new Date().toLocaleString('vi-VN'),
          ord.hasCustomJersey ? true : false
        ]]);
      }

      if (sheetProfit) {
        capNhatSoLuongBanVaoSheetLoiNhuan(sheetProfit, ord);
      }

      return ContentService.createTextOutput(JSON.stringify({ status: 'success', message: 'Lưu đơn hàng và cập nhật lợi nhuận thành công!' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // 2. CẬP NHẬT TRẠNG THÁI ĐƠN HÀNG
    else if (action === 'updateOrderStatus') {
      if (sheetOrder) {
        var lastR = sheetOrder.getLastRow();
        if (lastR >= 7) {
          var codes = sheetOrder.getRange(7, 2, lastR - 6, 1).getValues();
          for (var j = 0; j < codes.length; j++) {
            if (String(codes[j][0]).trim() === String(data.orderCode).trim()) {
              sheetOrder.getRange(7 + j, 8).setValue(data.status);
              return ContentService.createTextOutput(JSON.stringify({ status: 'success', message: 'Cập nhật trạng thái thành công!' }))
                .setMimeType(ContentService.MimeType.JSON);
            }
          }
        }
      }
      return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'Không tìm thấy đơn hàng!' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // 2.1 CẬP NHẬT ĐỊA CHỈ ĐƠN HÀNG (KHI KHÁCH ĐỔI ĐỊA CHỈ GIAO HÀNG)
    else if (action === 'updateOrderAddress') {
      if (sheetOrder) {
        var lastR = sheetOrder.getLastRow();
        if (lastR >= 7) {
          var codes = sheetOrder.getRange(7, 2, lastR - 6, 1).getValues();
          for (var j = 0; j < codes.length; j++) {
            if (String(codes[j][0]).trim() === String(data.orderCode).trim()) {
              sheetOrder.getRange(7 + j, 5).setValue(data.newAddress || '');
              return ContentService.createTextOutput(JSON.stringify({ status: 'success', message: 'Cập nhật địa chỉ đơn hàng thành công!' }))
                .setMimeType(ContentService.MimeType.JSON);
            }
          }
        }
      }
      return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'Không tìm thấy đơn hàng!' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // 3. ĐĂNG KÝ TÀI KHOẢN
    else if (action === 'register') {
      if (sheetAcc) {
        var lastAccRow = sheetAcc.getLastRow();
        if (lastAccRow >= 7) {
          var existingPhones = sheetAcc.getRange(7, 2, lastAccRow - 6, 1).getValues();
          for (var i = 0; i < existingPhones.length; i++) {
            if (String(existingPhones[i][0]).replace("'", "").trim() === String(data.phone).trim()) {
              return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'Số điện thoại đã tồn tại!' }))
                .setMimeType(ContentService.MimeType.JSON);
            }
          }
        }

        var insertRow = getFirstEmptyRow(sheetAcc, 2, 7);
        sheetAcc.getRange(insertRow, 2, 1, 7).setValues([[
          "'" + String(data.phone).trim(),
          data.name || '',
          data.pass || '',
          Number(data.mcoin) || 0,
          Number(data.orders) || 0,
          formatAddressForSheet(data.addresses),
          new Date().toLocaleString('vi-VN')
        ]]);
      }

      return ContentService.createTextOutput(JSON.stringify({ status: 'success', message: 'Đăng ký thành công!' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // 4. CẬP NHẬT TÀI KHOẢN
    else if (action === 'updateAccount') {
      if (sheetAcc) {
        var lastRow = sheetAcc.getLastRow();
        if (lastRow >= 7) {
          var phones = sheetAcc.getRange(7, 2, lastRow - 6, 1).getValues();
          for (var k = 0; k < phones.length; k++) {
            if (String(phones[k][0]).replace("'", "").trim() === String(data.phone).trim()) {
              var targetR = 7 + k;
              if (data.name !== undefined) sheetAcc.getRange(targetR, 3).setValue(data.name);
              if (data.pass !== undefined) sheetAcc.getRange(targetR, 4).setValue(data.pass);
              if (data.mcoin !== undefined) sheetAcc.getRange(targetR, 5).setValue(Number(data.mcoin));
              if (data.orders !== undefined) sheetAcc.getRange(targetR, 6).setValue(Number(data.orders));
              if (data.addresses !== undefined) sheetAcc.getRange(targetR, 7).setValue(formatAddressForSheet(data.addresses));
              sheetAcc.getRange(targetR, 8).setValue(new Date().toLocaleString('vi-VN'));
              return ContentService.createTextOutput(JSON.stringify({ status: 'success', message: 'Cập nhật thành công!' }))
                .setMimeType(ContentService.MimeType.JSON);
            }
          }
        }
      }
    }

    // 5. PHÁT HÀNH VOUCHER
    else if (action === 'saveCoupon') {
      var lastVR = sheetVoucher.getLastRow();
      var codeFoundRow = -1;
      if (lastVR >= 7) {
        var existingVouchers = sheetVoucher.getRange(7, 2, lastVR - 6, 1).getValues();
        for (var v = 0; v < existingVouchers.length; v++) {
          if (String(existingVouchers[v][0]).trim().toUpperCase() === String(data.code).trim().toUpperCase()) {
            codeFoundRow = 7 + v;
            break;
          }
        }
      }

      var targetVR = codeFoundRow !== -1 ? codeFoundRow : getFirstEmptyRow(sheetVoucher, 2, 7);
      var targetPhonesStr = Array.isArray(data.targetPhones) ? data.targetPhones.join(',') : (data.targetPhones || '');
      var usedByPhonesStr = Array.isArray(data.usedByPhones) ? data.usedByPhones.join(',') : (data.usedByPhones || '');

      sheetVoucher.getRange(targetVR, 2, 1, 7).setValues([[
        String(data.code).toUpperCase().trim(),
        Number(data.percent) || 0,
        data.targetType || 'all',
        targetPhonesStr,
        usedByPhonesStr,
        data.createdAt || Date.now(),
        new Date().toLocaleString('vi-VN')
      ]]);

      return ContentService.createTextOutput(JSON.stringify({ status: 'success', message: 'Lưu voucher thành công!' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // 6. DÙNG VOUCHER
    else if (action === 'useCoupon') {
      var lastVR2 = sheetVoucher.getLastRow();
      if (lastVR2 >= 7) {
        var existingVouchers2 = sheetVoucher.getRange(7, 2, lastVR2 - 6, 1).getValues();
        for (var v2 = 0; v2 < existingVouchers2.length; v2++) {
          if (String(existingVouchers2[v2][0]).trim().toUpperCase() === String(data.code).trim().toUpperCase()) {
            var rowToUpdate = 7 + v2;
            var currentUsedStr = String(sheetVoucher.getRange(rowToUpdate, 6).getValue() || '').trim();
            var usedArr = currentUsedStr ? currentUsedStr.split(',') : [];
            if (data.phone && usedArr.indexOf(String(data.phone)) === -1) {
              usedArr.push(String(data.phone));
              sheetVoucher.getRange(rowToUpdate, 6).setValue(usedArr.join(','));
            }
            return ContentService.createTextOutput(JSON.stringify({ status: 'success', message: 'Đã đánh dấu dùng voucher!' }))
              .setMimeType(ContentService.MimeType.JSON);
          }
        }
      }
    }

    return ContentService.createTextOutput(JSON.stringify({ status: 'success', message: 'Đã nhận yêu cầu' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch(error) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetAcc = ss.getSheetByName('TaiKhoan') || ss.getSheetByName('taikhoan') || ss.getSheetByName('Taikhoan');
  var sheetOrder = ss.getSheetByName('DonHang') || ss.getSheetByName('donhang') || ss.getSheetByName('Donhang');
  var sheetVoucher = getOrCreateVoucherSheet(ss);
  var sheetProfit = ss.getSheetByName('Loinhuan') || ss.getSheetByName('loinhuan') || ss.getSheetByName('Lợi nhuận');

  var accounts = [];
  var orders = [];
  var coupons = [];
  var profitReport = null;

  if (sheetAcc) {
    var lastAccRow = sheetAcc.getLastRow();
    if (lastAccRow >= 7) {
      var accRows = sheetAcc.getRange(7, 2, lastAccRow - 6, 7).getValues();
      for (var i = 0; i < accRows.length; i++) {
        var phone = String(accRows[i][0]).replace("'", "").trim();
        if (phone) {
          var rawAddr = accRows[i][5];
          var addrs = [];
          try {
            addrs = JSON.parse(rawAddr);
          } catch(err) {
            if (rawAddr) addrs = [{ name: accRows[i][1] || '', phone: phone, fullAddress: String(rawAddr), isDefault: true }];
          }
          accounts.push({
            phone: phone,
            name: accRows[i][1] || '',
            pass: String(accRows[i][2] || ''),
            mcoin: Number(accRows[i][3]) || 0,
            orders: Number(accRows[i][4]) || 0,
            addresses: Array.isArray(addrs) ? addrs : []
          });
        }
      }
    }
  }

  if (sheetOrder) {
    var lastOrderRow = sheetOrder.getLastRow();
    if (lastOrderRow >= 7) {
      var ordRows = sheetOrder.getRange(7, 2, lastOrderRow - 6, 9).getValues();
      for (var j = 0; j < ordRows.length; j++) {
        var code = String(ordRows[j][0]).trim();
        if (code) {
          var items = String(ordRows[j][4] || '').split('\n').filter(Boolean);
          orders.push({
            orderCode: code,
            phone: String(ordRows[j][1]).replace("'", "").trim(),
            name: ordRows[j][2] || '',
            addr: ordRows[j][3] || '',
            itemsList: items,
            finalTotal: Number(ordRows[j][5]) || 0,
            status: ordRows[j][6] || 'Chờ xác nhận',
            timeText: String(ordRows[j][7] || ''),
            hasCustomJersey: ordRows[j][8] === true
          });
        }
      }
    }
  }

  if (sheetVoucher) {
    var lastVRow = sheetVoucher.getLastRow();
    if (lastVRow >= 7) {
      var vRows = sheetVoucher.getRange(7, 2, lastVRow - 6, 7).getValues();
      for (var v = 0; v < vRows.length; v++) {
        var vCode = String(vRows[v][0]).trim().toUpperCase();
        if (vCode) {
          var targetPhones = String(vRows[v][3] || '').split(',').map(function(s){return s.trim();}).filter(Boolean);
          var usedByPhones = String(vRows[v][4] || '').split(',').map(function(s){return s.trim();}).filter(Boolean);
          coupons.push({
            code: vCode,
            percent: Number(vRows[v][1]) || 0,
            targetType: vRows[v][2] || 'all',
            targetPhones: targetPhones,
            usedByPhones: usedByPhones,
            createdAt: Number(vRows[v][5]) || Date.now()
          });
        }
      }
    }
  }

  if (sheetProfit) {
    try {
      var lastPRow = sheetProfit.getLastRow();
      var pList = [];
      if (lastPRow >= 11) {
        var pData = sheetProfit.getRange(11, 2, Math.min(lastPRow - 10, 35), 10).getValues();
        for (var p = 0; p < pData.length; p++) {
          if (pData[p][0] && (String(pData[p][0]).startsWith('BR-') || String(pData[p][0]).startsWith('SP-'))) {
            pList.push({
              code: String(pData[p][0]),
              name: String(pData[p][1]),
              category: String(pData[p][2]),
              price: Number(pData[p][3]) || 0,
              costPrice: Number(pData[p][4]) || 0,
              sold: Number(pData[p][5]) || 0,
              revenue: Number(pData[p][6]) || 0,
              totalCost: Number(pData[p][7]) || 0,
              profit: Number(pData[p][8]) || 0,
              margin: String(pData[p][9] || '')
            });
          }
        }
      }

      var revKpi = Number(sheetProfit.getRange(5, 2).getValue()) || 0;
      var costKpi = Number(sheetProfit.getRange(5, 4).getValue()) || 0;
      var profitKpi = Number(sheetProfit.getRange(5, 6).getValue()) || 0;
      var marginKpi = String(sheetProfit.getRange(5, 8).getValue() || '0%');

      profitReport = {
        kpi: {
          totalRevenue: revKpi,
          totalCost: costKpi,
          netProfit: profitKpi,
          margin: marginKpi
        },
        products: pList
      };
    } catch(errProfit) {}
  }

  return ContentService.createTextOutput(JSON.stringify({
    status: 'success',
    accounts: accounts,
    orders: orders,
    coupons: coupons,
    profitReport: profitReport
  })).setMimeType(ContentService.MimeType.JSON);
}

// ====================================================================
// HÀM TỰ ĐỘNG ĐIỀN TOÀN BỘ SẢN PHẨM TỪ Ô B11 (DÒNG 11 ĐẾN 41)
// ====================================================================

function chayTuDongDienSanPhamVaLoiNhuan() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  tuDongDienSanPhamVaCapNhatLoiNhuan(ss);
  SpreadsheetApp.getUi().alert('🏀 MAIRUA THÔNG BÁO:\n\nĐã điền BẮT ĐẦU TỪ Ô B11 thẳng tắp đến dòng 41 và cập nhật số lượng bán thành công!');
}

function tuDongDienSanPhamVaCapNhatLoiNhuan(ss) {
  var sheetProfit = ss.getSheetByName('Loinhuan') || ss.getSheetByName('loinhuan') || ss.getSheetByName('Lợi nhuận');
  var sheetOrder = ss.getSheetByName('DonHang') || ss.getSheetByName('donhang') || ss.getSheetByName('Donhang');
  if (!sheetProfit) return;

  // TOÀN BỘ 31 SẢN PHẨM ĐIỀN BẮT ĐẦU TỪ DÒNG 11 (Ô B11) ĐẾN DÒNG 41
  var catalogFill = [
    { code: 'BR-001', name: 'Nike Elite V1 Basketball Backpack', cat: 'Balo bóng rổ', price: 520000, cost: 370000, defaultSold: 28 },
    { code: 'BR-002', name: 'Nike Elite V2 Pro Backpack', cat: 'Balo bóng rổ', price: 650000, cost: 460000, defaultSold: 18 },
    { code: 'BR-003', name: 'Nike Elite V3 Ultimate Edition', cat: 'Balo bóng rổ', price: 850000, cost: 580000, defaultSold: 12 },
    { code: 'BR-004', name: 'Nike Utility Speed Training Backpack', cat: 'Balo bóng rổ', price: 890000, cost: 620000, defaultSold: 16 },
    { code: 'BR-005', name: 'Bóng Rổ Molten GG7X Sân Indoor', cat: 'Bóng thi đấu', price: 680000, cost: 420000, defaultSold: 24 },
    { code: 'BR-006', name: 'Bóng Rổ Molten B7G4500 Da Tổng Hợp', cat: 'Bóng thi đấu', price: 620000, cost: 390000, defaultSold: 20 },
    { code: 'BR-007', name: 'Bóng Rổ AK Pro Cao Su Thi Đấu', cat: 'Bóng ngoài trời', price: 520000, cost: 320000, defaultSold: 30 },
    { code: 'BR-008', name: 'Bóng Rổ AK Pro Outdoor Chống Mài Mòn', cat: 'Bóng ngoài trời', price: 450000, cost: 280000, defaultSold: 25 },
    { code: 'BR-009', name: 'Bóng Rổ Stepback Pro Series Size 7', cat: 'Bóng thi đấu', price: 580000, cost: 360000, defaultSold: 19 },
    { code: 'BR-010', name: 'Bóng Rổ Stepback Street Outdoor', cat: 'Bóng ngoài trời', price: 490000, cost: 300000, defaultSold: 15 },
    { code: 'BR-011', name: 'Vớ Chống Trượt Nike Elite Crew Trắng', cat: 'Phụ kiện thể thao', price: 150000, cost: 85000, defaultSold: 45 },
    { code: 'BR-012', name: 'Vớ Chống Trượt Nike Elite Crew Đen', cat: 'Phụ kiện thể thao', price: 150000, cost: 85000, defaultSold: 48 },
    { code: 'BR-013', name: 'Vớ Trutechsocks Đệm Dày Cao Cấp', cat: 'Phụ kiện thể thao', price: 220000, cost: 120000, defaultSold: 22 },
    { code: 'BR-014', name: 'Áo Jersey Los Angeles Lakers Edition', cat: 'Áo thi đấu', price: 225000, cost: 120000, defaultSold: 35 },
    { code: 'BR-015', name: 'Áo Jersey Chicago Bulls Retro Red', cat: 'Áo thi đấu', price: 225000, cost: 120000, defaultSold: 32 },
    { code: 'BR-016', name: 'Áo Jersey Golden State Warriors', cat: 'Áo thi đấu', price: 240000, cost: 130000, defaultSold: 29 },
    { code: 'BR-017', name: 'Áo Jersey New York (NYC) City Edition', cat: 'Áo thi đấu', price: 250000, cost: 135000, defaultSold: 20 },
    { code: 'BR-018', name: 'Áo Jersey Đội Tuyển Việt Nam', cat: 'Áo thi đấu', price: 230000, cost: 125000, defaultSold: 26 },
    { code: 'BR-019', name: 'Phôi Áo Jersey Custom Studio', cat: 'Áo thi đấu', price: 200000, cost: 110000, defaultSold: 38 },
    { code: 'BR-020', name: 'Quần Bóng Rổ Swingman USA Olympic', cat: 'Quần thi đấu', price: 210000, cost: 115000, defaultSold: 25 },
    { code: 'BR-021', name: 'Quần Bóng Rổ Los Angeles Lakers Swingman', cat: 'Quần thi đấu', price: 205000, cost: 110000, defaultSold: 27 },
    { code: 'BR-022', name: 'Quần Bóng Rổ Chicago Bulls Classic Red', cat: 'Quần thi đấu', price: 205000, cost: 110000, defaultSold: 24 },
    { code: 'BR-023', name: 'Quần Bóng Rổ Golden State Warriors City Edition', cat: 'Quần thi đấu', price: 210000, cost: 115000, defaultSold: 21 },
    { code: 'BR-024', name: 'Quần Bóng Rổ Miami Heat Vice Edition', cat: 'Quần thi đấu', price: 215000, cost: 115000, defaultSold: 18 },
    { code: 'BR-025', name: 'Quần Bóng Rổ Boston Celtics Pro Mesh', cat: 'Quần thi đấu', price: 205000, cost: 110000, defaultSold: 23 },
    { code: 'BR-026', name: 'Quần Combat Bóng Rổ Pro', cat: 'Đồ Combat', price: 195000, cost: 95000, defaultSold: 42 },
    { code: 'BR-027', name: 'Áo Combat Bóng Rổ Ngắn Tay Giữ Nhiệt', cat: 'Đồ Combat', price: 180000, cost: 90000, defaultSold: 30 },
    { code: 'BR-028', name: 'Áo Combat Bóng Rổ Ba Lỗ Chuyên Dụng', cat: 'Đồ Combat', price: 165000, cost: 85000, defaultSold: 28 },
    { code: 'BR-029', name: 'Bó gối giảm chấn công thái học', cat: 'Phụ kiện bảo hộ', price: 240000, cost: 120000, defaultSold: 26 },
    { code: 'BR-030', name: 'Bó gối thể thao có đệm tổ ong', cat: 'Phụ kiện bảo hộ', price: 220000, cost: 110000, defaultSold: 28 },
    { code: 'BR-031', name: 'Băng quấn bảo vệ cổ chân kép', cat: 'Phụ kiện bảo hộ', price: 175000, cost: 85000, defaultSold: 31 }
  ];

  // ĐẾM SỐ LƯỢNG BÁN TỪ TẤT CẢ ĐƠN HÀNG TRONG SHEET DONHANG
  var realSoldCounts = {};
  if (sheetOrder) {
    var lastOrdR = sheetOrder.getLastRow();
    if (lastOrdR >= 7) {
      var ordItemsData = sheetOrder.getRange(7, 6, lastOrdR - 6, 1).getValues();
      for (var o = 0; o < ordItemsData.length; o++) {
        var itemsStr = String(ordItemsData[o][0] || '');
        if (!itemsStr) continue;
        var lines = itemsStr.split('\n');
        for (var l = 0; l < lines.length; l++) {
          var line = lines[l];
          var qtyMatch = line.match(/\(x(\d+)\)/i);
          var qty = qtyMatch ? (parseInt(qtyMatch[1]) || 1) : 1;
          var lowerLine = line.toLowerCase();

          catalogFill.forEach(function(item) {
            if (lowerLine.indexOf(item.name.toLowerCase()) !== -1 || item.name.toLowerCase().indexOf(lowerLine) !== -1) {
              realSoldCounts[item.code] = (realSoldCounts[item.code] || 0) + qty;
            }
          });
        }
      }
    }
  }

  // 1. DỌN SẠCH CÁC Ô CŨ TỪ DÒNG 11 TRỞ XUỐNG ĐỂ TRÁNH DỮ LIỆU CŨ BỊ ĐÈ LỆCH DÒNG
  var maxR = Math.max(sheetProfit.getLastRow(), 55);
  if (maxR >= 11) {
    sheetProfit.getRange(11, 2, maxR - 10, 10).clearContent();
  }

  // 2. BẮT ĐẦU ĐIỀN CHUẨN XÁC TỪ Ô B11 (DÒNG 11) ĐẾN DÒNG 41
  var startRow = 11; // BẮT ĐẦU NGAY TỪ DÒNG 11 (Ô B11)
  for (var i = 0; i < catalogFill.length; i++) {
    var curRow = startRow + i;
    if (curRow > 41) break;

    var prod = catalogFill[i];
    var soldTotal = Number((prod.defaultSold || 0) + (realSoldCounts[prod.code] || 0));

    // B: Mã SP | C: Tên SP | D: Phân loại | E: Giá bán | F: Giá vốn | G: Số lượng bán (SỐ NGUYÊN NGUYÊN BẢN)
    sheetProfit.getRange(curRow, 2, 1, 6).setValues([[
      prod.code,
      prod.name,
      prod.cat,
      prod.price,
      prod.cost,
      soldTotal
    ]]);

    // H: Doanh thu (=G*E) | I: Tổng vốn (=G*F) | J: Lợi nhuận gộp (=H-I) | K: Biên LN (=J/H)
    sheetProfit.getRange(curRow, 8).setFormula('=G' + curRow + '*E' + curRow);
    sheetProfit.getRange(curRow, 9).setFormula('=G' + curRow + '*F' + curRow);
    sheetProfit.getRange(curRow, 10).setFormula('=H' + curRow + '-I' + curRow);
    sheetProfit.getRange(curRow, 11).setFormula('=IFERROR(IF(H' + curRow + '>0, J' + curRow + '/H' + curRow + ', 0), 0)');

    // ĐỊNH DẠNG SẮC NÉT TIỀN TỆ VÀ PHẦN TRĂM
    sheetProfit.getRange(curRow, 5, 1, 2).setNumberFormat('#,##0 "đ"'); // E, F
    sheetProfit.getRange(curRow, 7).setNumberFormat('#,##0');           // G: Số lượng bán là số nguyên
    sheetProfit.getRange(curRow, 8, 1, 3).setNumberFormat('#,##0 "đ"'); // H, I, J
    sheetProfit.getRange(curRow, 11).setNumberFormat('0.0%');           // K
  }

  // DÒNG TỔNG CỘNG 42 (TÍNH TỔNG TỪ DÒNG 11 ĐẾN 41)
  sheetProfit.getRange(42, 2).setValue('TỔNG CỘNG');
  sheetProfit.getRange(42, 7).setFormula('=SUM(G11:G41)');
  sheetProfit.getRange(42, 8).setFormula('=SUM(H11:H41)');
  sheetProfit.getRange(42, 9).setFormula('=SUM(I11:I41)');
  sheetProfit.getRange(42, 10).setFormula('=SUM(J11:J41)');
  sheetProfit.getRange(42, 11).setFormula('=IFERROR(IF(H42>0, J42/H42, 0), 0)');
  sheetProfit.getRange(42, 7).setNumberFormat('#,##0');
  sheetProfit.getRange(42, 8, 1, 3).setNumberFormat('#,##0 "đ"');
  sheetProfit.getRange(42, 11).setNumberFormat('0.0%');

  // ĐỒNG BỘ 4 THẺ KPI TRÊN ĐẦU (DÒNG 5)
  try {
    sheetProfit.getRange(5, 2).setFormula('=H42');
    sheetProfit.getRange(5, 4).setFormula('=I42');
    sheetProfit.getRange(5, 6).setFormula('=J42');
    sheetProfit.getRange(5, 8).setFormula('=K42');
    sheetProfit.getRange(5, 2).setNumberFormat('#,##0 "đ"');
    sheetProfit.getRange(5, 4).setNumberFormat('#,##0 "đ"');
    sheetProfit.getRange(5, 6).setNumberFormat('#,##0 "đ"');
    sheetProfit.getRange(5, 8).setNumberFormat('0.0%');
  } catch(eKPI) {}
}

function capNhatSoLuongBanVaoSheetLoiNhuan(sheetProfit, ord) {
  try {
    var items = Array.isArray(ord.itemsList) ? ord.itemsList : [String(ord.itemsList || '')];
    var lastRow = sheetProfit.getLastRow();
    if (lastRow < 11) return;

    var nameRange = sheetProfit.getRange(11, 3, lastRow - 10, 1).getValues(); // Cột C: Tên SP
    var soldRange = sheetProfit.getRange(11, 7, lastRow - 10, 1).getValues(); // Cột G: Số lượng bán

    items.forEach(function(line) {
      var qtyMatch = String(line).match(/\(x(\d+)\)/i);
      var qty = qtyMatch ? (parseInt(qtyMatch[1]) || 1) : 1;
      var lowerLine = String(line).toLowerCase();

      for (var r = 0; r < nameRange.length; r++) {
        var prodNameInSheet = String(nameRange[r][0]).toLowerCase().trim();
        if (prodNameInSheet && (lowerLine.indexOf(prodNameInSheet) !== -1 || prodNameInSheet.indexOf(lowerLine) !== -1)) {
          var currentSold = Number(soldRange[r][0]) || 0;
          sheetProfit.getRange(11 + r, 7).setValue(currentSold + qty);
          soldRange[r][0] = currentSold + qty;
          break;
        }
      }
    });
  } catch(e) {}
}

function getOrCreateVoucherSheet(ss) {
  var sheet = ss.getSheetByName('Voucher') || ss.getSheetByName('voucher');
  if (!sheet) {
    sheet = ss.insertSheet('Voucher');
    sheet.getRange(6, 2, 1, 7).setValues([['Mã Coupon', 'Phần trăm', 'Đối tượng', 'SDT nhận', 'SDT đã dùng', 'Thời gian tạo', 'Cập nhật']]);
  }
  return sheet;
}

function getFirstEmptyRow(sheet, colIndex, startRow) {
  var maxRows = sheet.getMaxRows();
  var checkCount = maxRows - startRow + 1;
  if (checkCount <= 0) {
    sheet.insertRowsAfter(maxRows, 50);
    return maxRows + 1;
  }
  var values = sheet.getRange(startRow, colIndex, checkCount, 1).getValues();
  for (var i = 0; i < values.length; i++) {
    if (!values[i][0] || String(values[i][0]).trim() === '') {
      return startRow + i;
    }
  }
  sheet.insertRowsAfter(maxRows, 30);
  return maxRows + 1;
}

function formatAddressForSheet(addresses) {
  if (Array.isArray(addresses)) {
    return JSON.stringify(addresses);
  }
  return String(addresses || '');
}
