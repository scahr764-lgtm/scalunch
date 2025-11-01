// 웹앱 진입점: index.html 로드
function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('도시락 주문 시스템');
}

// 성능 최적화를 위한 전역 캐시
const CACHE = {
  users: null,
  orders: null,
  settings: null,
  userIndex: null,
  lastUpdateMap: {},
  cutoffMap: null,
  Vendors: null,
  OrderVendors: null
};

// 캐시된 데이터 가져오기 (30초 캐시)
function getCachedData(sheetName, maxAge = 30000) {
  const now = Date.now();
  const last = CACHE.lastUpdateMap[sheetName] || 0;
  if (CACHE[sheetName] && (now - last) < maxAge) {
    return CACHE[sheetName];
  }
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  if (!sh) return [];
  const data = sh.getDataRange().getValues();
  CACHE[sheetName] = data;
  CACHE.lastUpdateMap[sheetName] = now;
  return data;
}

// 사용자 인덱스 생성 (빠른 검색용)
function createUserIndex() {
  if (CACHE.userIndex) return CACHE.userIndex;
  
  const users = getCachedData('Users');
  const index = {};
  
  for (let i = 1; i < users.length; i++) {
    const userId = String(users[i][0]);
    index[userId] = {
      row: i + 1,
      name: String(users[i][1]),
      role: String(users[i][3])
    };
  }
  
  CACHE.userIndex = index;
  return index;
}

// 날짜 변환 최적화 (캐시 적용)
const DATE_CACHE = {};
function toISODate(rawDate) {
  if (rawDate instanceof Date) {
    const time = rawDate.getTime();
    if (DATE_CACHE[time]) return DATE_CACHE[time];
    
    const result = Utilities.formatDate(rawDate, Session.getScriptTimeZone(), 'yyyy-MM-dd');
    DATE_CACHE[time] = result;
    return result;
  }
  return rawDate;
}

// (한 번만) DB 초기화: Users, Orders, Settings 시트 생성·헤더 세팅
function initializeDB() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  [
    ['Users',    ['UserID','Name','Password','Role']],
    ['Orders',   ['OrderID','Date','UserID','Status']],
    ['Settings', ['Date','CutoffTime']]
  ].forEach(([name, headers]) => {
    let sh = ss.getSheetByName(name);
    if (sh) sh.clear(); else sh = ss.insertSheet(name);
    sh.appendRow(headers);
  });
  
  // 캐시 초기화
  Object.keys(CACHE).forEach(key => CACHE[key] = null);
  CACHE.lastUpdateMap = {};
}

// 로그인 검증 (인덱스 기반 최적화)
function authenticateUser(userId, pw) {
  const userIndex = createUserIndex();
  const user = userIndex[userId.trim()];
  
  if (user) {
    const users = getCachedData('Users');
    const userData = users[user.row - 1];
    if (String(userData[2]) === pw) {
      return { userId: userId.trim(), name: user.name, role: user.role };
    }
  }
  return null;
}

function nowInCentral() {
  const nowUTC = new Date();
  const timeInCentral = Utilities.formatDate(nowUTC, 'America/Chicago', 'HH:mm');
  return timeInCentral;
}

// 주문 중복 체크 (인덱스 기반)
function findExistingOrder(orderDate, userId) {
  const orders = getCachedData('Orders');
  const { dateIdx, userIdx, statusIdx } = getOrdersHeaderInfo();
  for (let i = 1; i < orders.length; i++) {
    const row = orders[i];
    const cell = row[dateIdx];
    const dateStr = cell instanceof Date 
      ? Utilities.formatDate(cell, Session.getScriptTimeZone(), 'yyyy-MM-dd')
      : String(cell);
    if (dateStr === orderDate && String(row[userIdx]) === userId && String(row[statusIdx]) === 'ordered') {
      return { row: i + 1, data: row };
    }
  }
  return null;
}

// 다음 주문 ID 생성
function getNextOrderId() {
  const orders = getCachedData('Orders');
  return orders.length;
}

// 캐시된 마감시간 조회
function getCachedCutoffTime(date) {
  if (!CACHE.cutoffMap) {
    CACHE.cutoffMap = getCutoffMap();
  }
  return CACHE.cutoffMap[date] || null;
}

// Orders 헤더 인덱스 유틸 (헤더 기반으로 안전하게 처리)
function getOrdersHeaderInfo() {
  const orders = getCachedData('Orders');
  const header = orders[0] || [];
  const orderIdx = header.indexOf('OrderID');
  const dateIdx = header.indexOf('Date');
  const userIdx = header.indexOf('UserID');
  const statusIdx = header.indexOf('Status');
  const vendorIdx = header.indexOf('VendorID');
  return {
    header,
    orderIdx: orderIdx !== -1 ? orderIdx : 0,
    dateIdx: dateIdx !== -1 ? dateIdx : 1,
    userIdx: userIdx !== -1 ? userIdx : 2,
    statusIdx: statusIdx !== -1 ? statusIdx : (header.length >= 4 ? 3 : 3),
    vendorIdx,
    hasVendor: vendorIdx !== -1
  };
}

// Orders 행을 헤더 순서에 맞춰 생성
function buildOrderRow(orderId, date, userId, status, vendorId) {
  const { header, orderIdx, dateIdx, userIdx, statusIdx, hasVendor, vendorIdx } = getOrdersHeaderInfo();
  const len = Math.max(header.length, hasVendor ? 5 : 4);
  const row = new Array(len).fill('');
  row[orderIdx] = orderId;
  row[dateIdx] = date;
  row[userIdx] = userId;
  row[statusIdx] = status;
  if (hasVendor && vendorIdx >= 0) row[vendorIdx] = vendorId || '';
  return row;
}

// 주문 추가 (최적화된 버전)
function placeOrder(rawDate, userId) {
  const orderDate = toISODate(rawDate);
  const today = toISODate(new Date());
  const nowCentral = nowInCentral();

  if (orderDate < today) {
    throw new Error('지난 날짜는 주문할 수 없습니다.');
  } else if (orderDate === today) {
    const cutoff = getCachedCutoffTime(orderDate) || '10:30';
    if (nowCentral > cutoff) {
      throw new Error(`${cutoff} (CST) 이후 주문 불가, 관리에 문의하세요`);
    }
  }

  // 중복 체크 (캐시된 데이터 사용)
  const existing = findExistingOrder(orderDate, userId);
  if (existing) {
    return; // 이미 주문됨
  }

  // 배치 추가
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Orders');
  const nextId = getNextOrderId();
  const row = buildOrderRow(nextId, orderDate, userId, 'ordered', '');
  sheet.appendRow(row);
  
  // 캐시 무효화
  CACHE.orders = null;
}

// 주문 취소 (최적화된 버전)
function cancelOrder(rawDate, userId) {
  const orderDate = toISODate(rawDate);
  const today = toISODate(new Date());

  if (orderDate < today) {
    throw new Error('지난 날짜는 취소할 수 없습니다.');
  } else if (orderDate === today) {
    const cutoff = getCachedCutoffTime(orderDate) || '10:00';
    const nowLocal = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'HH:mm');
    if (nowLocal > cutoff) {
      throw new Error(`${cutoff} 이후 취소 불가`);
    }
  }

  const existing = findExistingOrder(orderDate, userId);
  if (!existing) {
    throw new Error('취소할 주문을 찾을 수 없습니다.');
  }

  // 배치 삭제
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Orders');
  sheet.deleteRow(existing.row);
  
  // 캐시 무효화
  CACHE.orders = null;
  return true;
}

// 주문 재개 (최적화된 버전)
function reopenOrder(rawDate, userId) {
  const orderDate = toISODate(rawDate);
  const today = toISODate(new Date());

  if (orderDate < today) {
    throw new Error('지난 날짜는 재주문할 수 없습니다.');
  } else if (orderDate === today) {
    const cutoff = getCachedCutoffTime(orderDate) || '10:00';
    const nowLocal = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'HH:mm');
    if (nowLocal > cutoff) {
      throw new Error(`${cutoff} 이후 재주문 불가, 관리팀 문의하세요`);
    }
  }

  // 취소된 주문 찾기
  const orders = getCachedData('Orders');
  for (let i = 1; i < orders.length; i++) {
    const row = orders[i];
    const dateStr = row[1] instanceof Date
      ? Utilities.formatDate(row[1], Session.getScriptTimeZone(), 'yyyy-MM-dd')
      : String(row[1]);
    if (dateStr === orderDate && String(row[2]) === userId && String(row[3]) === 'cancelled') {
      const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Orders');
      const { statusIdx } = getOrdersHeaderInfo();
      sheet.getRange(i + 1, statusIdx + 1).setValue('ordered');
      
      // 캐시 무효화
      CACHE.orders = null;
      return true;
    }
  }
  throw new Error('재주문할 취소된 주문을 찾을 수 없습니다.');
}

// 직원 화면용: 주문/취소/재주문 토글 (최적화된 버전)
function toggleOrder(rawDate, userId) {
  const orderDate = toISODate(rawDate);
  const today = toISODate(new Date());
  const nowLocal = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'HH:mm');
  const deadline = getCachedCutoffTime(orderDate) || '10:30';

  if (orderDate < today) {
    throw new Error('지난 날짜는 처리할 수 없습니다.');
  }
  if (orderDate === today && nowLocal > deadline) {
    throw new Error(`${deadline} 이후 변경 불가`);
  }

  const existing = findExistingOrder(orderDate, userId);
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Orders');

  if (existing) {
    // 기존 주문 삭제 (취소)
    sheet.deleteRow(existing.row);
    CACHE.orders = null;
    return { Status: 'cancelled' };
  } else {
    // 새 주문 추가
    const nextId = getNextOrderId();
    const row = buildOrderRow(nextId, orderDate, userId, 'ordered', '');
    sheet.appendRow(row);
    CACHE.orders = null;
    return { Status: 'ordered' };
  }
}

// 내 주문 조회 (최적화된 버전)
function getMyOrdersInRange(startDate, endDate, userId) {
  const orders = getCachedData('Orders');
  const result = [];
  const { dateIdx, userIdx, statusIdx } = getOrdersHeaderInfo();
  
  for (let i = 1; i < orders.length; i++) {
    const row = orders[i];
    const cell = row[dateIdx];
    const dateStr = cell instanceof Date
      ? Utilities.formatDate(cell, Session.getScriptTimeZone(), 'yyyy-MM-dd')
      : String(cell);
    
    if (String(row[userIdx]) === userId && dateStr >= startDate && dateStr <= endDate) {
      result.push({
        Date: dateStr,
        UserID: String(row[userIdx]),
        Status: String(row[statusIdx])
      });
    }
  }
  
  return result;
}

// 관리자 전체 주문 조회 (최적화된 버전)
function getAllOrdersInRange(startDate, endDate) {
  const orders = getCachedData('Orders');
  const result = [];
  const { dateIdx, userIdx, statusIdx } = getOrdersHeaderInfo();
  
  for (let i = 1; i < orders.length; i++) {
    const row = orders[i];
    const cell = row[dateIdx];
    const dateStr = cell instanceof Date
      ? Utilities.formatDate(cell, Session.getScriptTimeZone(), 'yyyy-MM-dd')
      : String(cell);
    
    if (dateStr >= startDate && dateStr <= endDate) {
      result.push({
        Date: dateStr,
        UserID: String(row[userIdx]),
        Status: String(row[statusIdx])
      });
    }
  }
  
  return result;
}

// 오늘 주문 건수 (최적화된 버전)
function getOrderCount(date) {
  const orders = getCachedData('Orders');
  let count = 0;
  const { dateIdx, statusIdx } = getOrdersHeaderInfo();
  
  for (let i = 1; i < orders.length; i++) {
    const row = orders[i];
    const cell = row[dateIdx];
    const dateStr = cell instanceof Date
      ? Utilities.formatDate(cell, Session.getScriptTimeZone(), 'yyyy-MM-dd')
      : String(cell);
    
    if (dateStr === date && String(row[statusIdx]) === 'ordered') {
      count++;
    }
  }
  
  return count;
}

// 관리자 일괄 주문 (배치 처리 최적화)
function bulkPlaceOrder(date, userIds) {
  const results = [];
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Orders');
  const batchData = [];
  const existingOrders = new Set();
  
  // 기존 주문 확인 (한 번에)
  const orders = getCachedData('Orders');
  const { dateIdx, userIdx, statusIdx, hasVendor } = getOrdersHeaderInfo();
  for (let i = 1; i < orders.length; i++) {
    const row = orders[i];
    const cell = row[dateIdx];
    const dateStr = cell instanceof Date
      ? Utilities.formatDate(cell, Session.getScriptTimeZone(), 'yyyy-MM-dd')
      : String(cell);
    if (dateStr === date && String(row[statusIdx]) === 'ordered') {
      existingOrders.add(String(row[userIdx]));
    }
  }
  
  // 배치 데이터 준비
  userIds.forEach(uid => {
    if (!existingOrders.has(uid)) {
      const nextId = getNextOrderId() + batchData.length;
      batchData.push([nextId, date, uid, 'ordered']);
      results.push({ userId: uid, success: true });
    } else {
      results.push({ userId: uid, success: false, message: '이미 주문됨' });
    }
  });
  
  // 배치로 한 번에 추가
  if (batchData.length > 0) {
    const startRow = sheet.getLastRow() + 1;
    const rows = batchData.map(([id, d, uid]) => buildOrderRow(id, d, uid, 'ordered', ''));
    const width = Math.max(...rows.map(r => r.length));
    // Normalize row widths
    const norm = rows.map(r => r.concat(new Array(width - r.length).fill('')));
    sheet.getRange(startRow, 1, norm.length, width).setValues(norm);
    CACHE.orders = null; // 캐시 무효화
  }
  
  return results;
}

// 마감시간 읽기/쓰기 (캐시 적용)
function getCutoffTime(date) {
  return getCachedCutoffTime(date);
}

function setCutoffTime(date, timeStr) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Settings');
  const rows = getCachedData('Settings');
  
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === date) {
      sheet.getRange(i + 1, 2).setValue(timeStr);
      CACHE.settings = null; // 캐시 무효화
      CACHE.cutoffMap = null;
      return;
    }
  }
  
  sheet.appendRow([date, timeStr]);
  CACHE.settings = null; // 캐시 무효화
  CACHE.cutoffMap = null;
}

// 직원 계정 관리 (최적화된 버전)
function getEmployees() {
  const users = getCachedData('Users');
  const result = [];
  
  for (let i = 1; i < users.length; i++) {
    const row = users[i];
    result.push({
      userId: String(row[0]),
      name: String(row[1]),
      role: String(row[3])
    });
  }
  
  return result;
}

function addEmployee(userId, name, password, role) {
  const users = getCachedData('Users');
  
  // 중복 체크 (캐시된 데이터 사용)
  for (let i = 1; i < users.length; i++) {
    if (String(users[i][0]) === userId) {
      throw new Error('이미 존재하는 UserID입니다.');
    }
  }
  
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Users');
  sheet.appendRow([userId, name, password, role]);
  
  // 캐시 무효화
  CACHE.users = null;
  CACHE.userIndex = null;
}

function deleteEmployee(userId) {
  const users = getCachedData('Users');
  const targetRows = [];
  
  // 삭제할 행 번호 수집
  for (let i = 1; i < users.length; i++) {
    if (String(users[i][0]) === userId) {
      targetRows.push(i + 1);
    }
  }
  
  if (targetRows.length === 0) {
    throw new Error('삭제할 UserID를 찾을 수 없습니다.');
  }
  
  // 역순으로 삭제 (인덱스 변화 방지)
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Users');
  targetRows.reverse().forEach(rowNum => {
    sheet.deleteRow(rowNum);
  });
  
  // 캐시 무효화
  CACHE.users = null;
  CACHE.userIndex = null;
}

// 관리자용: 시간 제한 없이 주문 (최적화된 버전)
function adminPlaceOrder(date, userId) {
  const today = toISODate(new Date());
  if (date < today) throw new Error('지난 날짜는 주문할 수 없습니다.');

  const existing = findExistingOrder(date, userId);
  if (existing) return; // 이미 주문됨

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Orders');
  const nextId = getNextOrderId();
  const row = buildOrderRow(nextId, date, userId, 'ordered', '');
  sheet.appendRow(row);
  
  // 캐시 무효화
  CACHE.orders = null;
}

// 관리자용 주문 취소 (최적화된 버전)
function adminCancelOrder(rawDate, userId) {
  const orderDate = toISODate(rawDate);
  const existing = findExistingOrder(orderDate, userId);
  
  if (!existing) {
    throw new Error('취소할 주문을 찾을 수 없습니다.');
  }
  
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Orders');
  sheet.deleteRow(existing.row);
  
  // 캐시 무효화
  CACHE.orders = null;
  return true;
}

// 관리자용 날짜별 주문 건수 조회 (최적화된 버전)
function getOrderCountsForRange(startDate, endDate) {
  const orders = getCachedData('Orders');
  const counts = {};
  const { dateIdx, statusIdx } = getOrdersHeaderInfo();
  
  for (let i = 1; i < orders.length; i++) {
    const row = orders[i];
    const cell = row[dateIdx];
    const dateStr = cell instanceof Date
      ? Utilities.formatDate(cell, Session.getScriptTimeZone(), 'yyyy-MM-dd')
      : String(cell);
    
    if (dateStr >= startDate && dateStr <= endDate && String(row[statusIdx]) === 'ordered') {
      counts[dateStr] = (counts[dateStr] || 0) + 1;
    }
  }
  
  return Object.keys(counts).sort().map(d => ({ date: d, count: counts[d] }));
}

// 오늘 개요: 총 건수 + 업체별 집계 한번에 반환
function getTodayOverview(date) {
  const total = getOrderCount(date);
  const vendors = getVendorCountsForRange(date, date);
  return { total: total, vendors: vendors };
}

// 관리자용: 날짜·Name 필터링된 주문 조회 (최적화된 버전)
function getAllOrdersFiltered(startDate, endDate, nameFilter) {
  const users = getCachedData('Users');
  const orders = getCachedData('Orders');
  const idToName = {};
  const result = [];
  const { dateIdx, userIdx, statusIdx } = getOrdersHeaderInfo();
  
  // UserID → Name 매핑 생성
  for (let i = 1; i < users.length; i++) {
    idToName[String(users[i][0])] = String(users[i][1]);
  }
  
  // 주문 필터링
  for (let i = 1; i < orders.length; i++) {
    const row = orders[i];
    const cell = row[dateIdx];
    const dateStr = cell instanceof Date
      ? Utilities.formatDate(cell, Session.getScriptTimeZone(), 'yyyy-MM-dd')
      : String(cell);
    
    if (dateStr < startDate || dateStr > endDate) continue;
    
    const userId = String(row[userIdx]);
    const name = idToName[userId] || '';
    
    if (nameFilter && name.indexOf(nameFilter) === -1) continue;
    
    result.push({
      Date: dateStr,
      UserID: userId,
      Name: name,
      Status: String(row[statusIdx])
    });
  }
  
  return result.sort((a, b) => a.Date.localeCompare(b.Date));
}

// 주문 요약 시트 생성 (최적화된 버전)
function createOrderSummarySheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName('Summary');
  if (sh) {
    sh.clear();
  } else {
    sh = ss.insertSheet('Summary');
  }
  sh.appendRow(['UserID', 'Name', 'Count']);

  // UserID → Name 매핑
  const users = getCachedData('Users');
  const idToName = {};
  for (let i = 1; i < users.length; i++) {
    idToName[String(users[i][0])] = String(users[i][1]);
  }

  // Orders에서 ordered 건만 카운트
  const orders = getCachedData('Orders');
  const counts = {};
  const { userIdx, statusIdx } = getOrdersHeaderInfo();
  for (let i = 1; i < orders.length; i++) {
    const row = orders[i];
    if (String(row[statusIdx]) === 'ordered') {
      const uid = String(row[userIdx]);
      counts[uid] = (counts[uid] || 0) + 1;
    }
  }

  // Summary 시트에 쓰기 (배치 처리)
  const summaryData = [];
  Object.keys(counts).sort().forEach(uid => {
    summaryData.push([uid, idToName[uid] || '', counts[uid]]);
  });
  
  if (summaryData.length > 0) {
    sh.getRange(2, 1, summaryData.length, 3).setValues(summaryData);
  }
}

function getOrderSummary() {
  // Users 시트에서 ID→Name 매핑
  const users = getCachedData('Users');
  const idToName = {};
  for (let i = 1; i < users.length; i++) {
    idToName[String(users[i][0])] = String(users[i][1]);
  }

  // Orders 시트에서 ordered만 집계
  const orders = getCachedData('Orders');
  const counts = {};
  const { userIdx: u2, statusIdx: s2 } = getOrdersHeaderInfo();
  for (let i = 1; i < orders.length; i++) {
    const row = orders[i];
    if (String(row[s2]) === 'ordered') {
      const uid = String(row[u2]);
      counts[uid] = (counts[uid] || 0) + 1;
    }
  }

  // 배열로 변환
  return Object.keys(counts).sort().map(uid => ({
    UserID: uid,
    Name: idToName[uid] || '',
    Count: counts[uid]
  }));
}

// Settings 시트를 한 번만 읽어서 맵 반환 (캐시 적용)
function getCutoffMap() {
  if (CACHE.cutoffMap) return CACHE.cutoffMap;
  
  const settings = getCachedData('Settings');
  const map = {};
  const tz = Session.getScriptTimeZone();
  
  for (let i = 1; i < settings.length; i++) {
    const row = settings[i];
    const key = row[0] instanceof Date
      ? Utilities.formatDate(row[0], tz, 'yyyy-MM-dd')
      : String(row[0]);
    map[key] = String(row[1]);
  }
  
  CACHE.cutoffMap = map;
  return map;
}

// 캐시 무효화 함수
function clearCache() {
  Object.keys(CACHE).forEach(key => CACHE[key] = null);
  CACHE.lastUpdateMap = {};
  Object.keys(DATE_CACHE).forEach(key => delete DATE_CACHE[key]);
}

// 성능 측정 함수
function measurePerformance(func, ...args) {
  const start = Date.now();
  const result = func(...args);
  const end = Date.now();
  console.log(`${func.name} 실행시간: ${end - start}ms`);
  return result;
}

// =====================
// 벤더(도시락 업체) 관련 (비침투형 추가 기능)
// 기존 시트/함수 변경 없이, 별도 시트로 연동합니다.
// =====================

function ensureVendorSchema() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  // Vendors: VendorID, Name
  let v = ss.getSheetByName('Vendors');
  if (!v) {
    v = ss.insertSheet('Vendors');
    v.appendRow(['VendorID','Name']);
  } else {
    const header = v.getRange(1,1,1,Math.max(2, v.getLastColumn())).getValues()[0];
    const expected = ['VendorID','Name'];
    if (header[0] !== expected[0] || header[1] !== expected[1]) {
      v.getRange(1,1,1,expected.length).setValues([expected]);
    }
  }
  // OrderVendors: OrderID, VendorID (주문-업체 매핑)
  let ov = ss.getSheetByName('OrderVendors');
  if (!ov) {
    ov = ss.insertSheet('OrderVendors');
    ov.appendRow(['OrderID','VendorID']);
  } else {
    const header = ov.getRange(1,1,1,Math.max(2, ov.getLastColumn())).getValues()[0];
    const expected = ['OrderID','VendorID'];
    if (header[0] !== expected[0] || header[1] !== expected[1]) {
      ov.getRange(1,1,1,expected.length).setValues([expected]);
    }
  }
}

function getVendors() {
  ensureVendorSchema();
  const rows = getCachedData('Vendors');
  const list = [];
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r[0]) continue;
    list.push({ vendorId: String(r[0]), name: String(r[1] || '') });
  }
  return list;
}

function addVendorAuto(name) {
  ensureVendorSchema();
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Vendors');
  const rows = sheet.getDataRange().getValues();
  let maxNum = 0;
  for (let i = 1; i < rows.length; i++) {
    const id = String(rows[i][0] || '');
    const m = id.match(/^(?:V)?(\d{1,})$/i);
    const n = m && m[1] ? parseInt(m[1], 10) : 0;
    if (n > maxNum) maxNum = n;
  }
  const nextId = 'V' + String(maxNum + 1).padStart(3, '0');
  sheet.appendRow([nextId, String(name || '')]);
  CACHE.Vendors = null;
  CACHE.lastUpdateMap['Vendors'] = 0;
  return { vendorId: nextId, name: String(name || '') };
}

// 내부: OrderID → VendorID 맵 생성
function createOrderVendorMap() {
  ensureVendorSchema();
  const ov = getCachedData('OrderVendors');
  const map = {};
  // 1) OrderVendors 시트 기준으로 매핑
  for (let i = 1; i < ov.length; i++) {
    const row = ov[i];
    const oid = String(row[0] || '');
    const vid = String(row[1] || '');
    if (oid) map[oid] = vid;
  }
  // 2) 레거시 호환: Orders 시트에 VendorID 열이 있는 경우 보완 매핑
  const orders = getCachedData('Orders');
  if (orders.length > 0) {
    const { header, hasVendor } = getOrdersHeaderInfo();
    if (hasVendor) {
      const idIdx = 0; // OrderID는 첫 컬럼 고정
      const vendorIdx = header.indexOf('VendorID');
      for (let i = 1; i < orders.length; i++) {
        const row = orders[i];
        const oid = String(row[idIdx]);
        const vid = String(row[vendorIdx] || '');
        if (oid && vid && !map[oid]) {
          map[oid] = vid;
        }
      }
    }
  }
  return map;
}

// 벤더 삭제 (force=true이면 OrderVendors의 매핑도 함께 삭제)
function deleteVendor(vendorId, force) {
  ensureVendorSchema();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const vSh = ss.getSheetByName('Vendors');
  const ovSh = ss.getSheetByName('OrderVendors');
  const vRows = vSh.getDataRange().getValues();

  // 벤더 존재 확인 및 행 찾기
  let vendorRow = -1;
  for (let i = 1; i < vRows.length; i++) {
    if (String(vRows[i][0]) === String(vendorId)) { vendorRow = i + 1; break; }
  }
  if (vendorRow === -1) throw new Error('존재하지 않는 VendorID입니다.');

  // 참조 여부 확인
  const ovRows = ovSh.getDataRange().getValues();
  let referenced = false;
  for (let i = 1; i < ovRows.length; i++) {
    if (String(ovRows[i][1]) === String(vendorId)) { referenced = true; break; }
  }
  if (referenced && !force) {
    throw new Error('해당 업체를 참조하는 주문이 있어 삭제할 수 없습니다. (강제 삭제 가능)');
  }

  // 강제인 경우 매핑 삭제
  if (referenced && force) {
    for (let i = ovRows.length - 1; i >= 1; i--) {
      if (String(ovRows[i][1]) === String(vendorId)) {
        ovSh.deleteRow(i + 1);
      }
    }
  }

  // 벤더 삭제
  vSh.deleteRow(vendorRow);
  CACHE.Vendors = null;
  CACHE.lastUpdateMap['Vendors'] = 0;
  CACHE.OrderVendors = null;
  CACHE.lastUpdateMap['OrderVendors'] = 0;
  return true;
}

// 벤더 이름 수정
function updateVendorName(vendorId, newName) {
  ensureVendorSchema();
  const vSh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Vendors');
  const rows = vSh.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === String(vendorId)) {
      vSh.getRange(i + 1, 2).setValue(String(newName || ''));
      CACHE.Vendors = null;
      CACHE.lastUpdateMap['Vendors'] = 0;
      return true;
    }
  }
  throw new Error('존재하지 않는 VendorID입니다.');
}

// 주문 + 벤더 지정 (기존 Orders는 그대로, 매핑은 OrderVendors에 저장)
function placeOrderWithVendor(rawDate, userId, vendorId) {
  ensureVendorSchema();
  // 벤더 유효성
  const vendors = getVendors();
  if (!vendors.find(v => v.vendorId === String(vendorId))) {
    throw new Error('존재하지 않는 VendorID입니다.');
  }

  const orderDate = toISODate(rawDate);
  const today = toISODate(new Date());
  const nowCentral = nowInCentral();

  if (orderDate < today) {
    throw new Error('지난 날짜는 주문할 수 없습니다.');
  } else if (orderDate === today) {
    const cutoff = getCachedCutoffTime(orderDate) || '10:30';
    if (nowCentral > cutoff) {
      throw new Error(`${cutoff} (CST) 이후 주문 불가, 관리에 문의하세요`);
    }
  }

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Orders');
  const existing = findExistingOrder(orderDate, userId);
  let orderId;
  if (existing) {
    orderId = String(existing.data[0]);
    // Orders 시트에도 벤더 기록 보완
    const { hasVendor, vendorIdx } = getOrdersHeaderInfo();
    if (hasVendor) {
      const current = String(existing.data[vendorIdx] || '');
      if (current !== String(vendorId)) {
        sheet.getRange(existing.row, vendorIdx + 1).setValue(String(vendorId));
      }
    }
  } else {
    const nextId = getNextOrderId();
    const row = buildOrderRow(nextId, orderDate, userId, 'ordered', String(vendorId));
    sheet.appendRow(row);
    CACHE.orders = null;
    orderId = String(nextId);
  }

  // OrderVendors에 upsert
  const ovSh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('OrderVendors');
  const ovRows = ovSh.getDataRange().getValues();
  let updated = false;
  for (let i = 1; i < ovRows.length; i++) {
    if (String(ovRows[i][0]) === orderId) {
      ovSh.getRange(i + 1, 2).setValue(String(vendorId));
      updated = true;
      break;
    }
  }
  if (!updated) {
    ovSh.appendRow([orderId, String(vendorId)]);
  }
  CACHE.OrderVendors = null;
  CACHE.lastUpdateMap['OrderVendors'] = 0;
  return { OrderID: orderId, VendorID: String(vendorId) };
}

// 토글 + 벤더 지정 (주문 없으면 생성+매핑, 있으면 취소)
function toggleOrderWithVendor(rawDate, userId, vendorId) {
  ensureVendorSchema();
  const vendors = getVendors();
  if (!vendors.find(v => v.vendorId === String(vendorId))) {
    throw new Error('존재하지 않는 VendorID입니다.');
  }

  const orderDate = toISODate(rawDate);
  const today = toISODate(new Date());
  const nowLocal = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'HH:mm');
  const deadline = getCachedCutoffTime(orderDate) || '10:30';
  if (orderDate < today) throw new Error('지난 날짜는 처리할 수 없습니다.');
  if (orderDate === today && nowLocal > deadline) throw new Error(`${deadline} 이후 변경 불가`);

  const existing = findExistingOrder(orderDate, userId);
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Orders');
  if (existing) {
    const orderId = String(existing.data[0]);
    sheet.deleteRow(existing.row);
    CACHE.orders = null;
    // 매핑 삭제
    const ovSh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('OrderVendors');
    const ovRows = ovSh.getDataRange().getValues();
    for (let i = ovRows.length - 1; i >= 1; i--) {
      if (String(ovRows[i][0]) === orderId) {
        ovSh.deleteRow(i + 1);
        break;
      }
    }
    CACHE.OrderVendors = null;
    CACHE.lastUpdateMap['OrderVendors'] = 0;
    return { Status: 'cancelled' };
  } else {
    const nextId = getNextOrderId();
    const row = buildOrderRow(nextId, orderDate, userId, 'ordered', String(vendorId));
    sheet.appendRow(row);
    CACHE.orders = null;
    const ovSh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('OrderVendors');
    ovSh.appendRow([String(nextId), String(vendorId)]);
    CACHE.OrderVendors = null;
    CACHE.lastUpdateMap['OrderVendors'] = 0;
    return { Status: 'ordered' };
  }
}

// 조회(내 주문) + VendorID 포함
function getMyOrdersInRangeWithVendor(startDate, endDate, userId) {
  ensureVendorSchema();
  const orders = getCachedData('Orders');
  const ovMap = createOrderVendorMap();
  const result = [];
  const { dateIdx, userIdx, statusIdx } = getOrdersHeaderInfo();
  for (let i = 1; i < orders.length; i++) {
    const row = orders[i];
    const cell = row[dateIdx];
    const dateStr = cell instanceof Date
      ? Utilities.formatDate(cell, Session.getScriptTimeZone(), 'yyyy-MM-dd')
      : String(cell);
    if (String(row[userIdx]) === userId && dateStr >= startDate && dateStr <= endDate) {
      const oid = String(row[0]);
      result.push({
        OrderID: oid,
        Date: dateStr,
        UserID: String(row[userIdx]),
        Status: String(row[statusIdx]),
        VendorID: ovMap[oid] || ''
      });
    }
  }
  return result;
}

// 조회(관리자 전체) + VendorID 포함
function getAllOrdersInRangeWithVendor(startDate, endDate) {
  ensureVendorSchema();
  const orders = getCachedData('Orders');
  const ovMap = createOrderVendorMap();
  const result = [];
  const { dateIdx, userIdx, statusIdx } = getOrdersHeaderInfo();
  for (let i = 1; i < orders.length; i++) {
    const row = orders[i];
    const cell = row[dateIdx];
    const dateStr = cell instanceof Date
      ? Utilities.formatDate(cell, Session.getScriptTimeZone(), 'yyyy-MM-dd')
      : String(cell);
    if (dateStr >= startDate && dateStr <= endDate) {
      const oid = String(row[0]);
      result.push({
        OrderID: oid,
        Date: dateStr,
        UserID: String(row[userIdx]),
        Status: String(row[statusIdx]),
        VendorID: ovMap[oid] || ''
      });
    }
  }
  return result;
}

// 업체별 전체 집계 (기간 내 ordered만): [{ VendorID, VendorName, Count }]
function getVendorCountsForRange(startDate, endDate) {
  ensureVendorSchema();
  const orders = getCachedData('Orders');
  const ovMap = createOrderVendorMap();
  const vendors = getVendors();
  const idToName = {};
  vendors.forEach(v => idToName[v.vendorId] = v.name);
  const counts = {};
  const { dateIdx, statusIdx } = getOrdersHeaderInfo();
  for (let i = 1; i < orders.length; i++) {
    const row = orders[i];
    const cell = row[dateIdx];
    const dateStr = cell instanceof Date
      ? Utilities.formatDate(cell, Session.getScriptTimeZone(), 'yyyy-MM-dd')
      : String(cell);
    if (dateStr < startDate || dateStr > endDate) continue;
    if (String(row[statusIdx]) !== 'ordered') continue;
    const oid = String(row[0]);
    const vid = ovMap[oid];
    if (!vid) continue;
    counts[vid] = (counts[vid] || 0) + 1;
  }
  return Object.keys(counts).sort().map(vid => ({
    VendorID: vid,
    VendorName: idToName[vid] || '',
    Count: counts[vid]
  }));
}

// 특정 업체에 대한 사용자별 집계: [{ UserID, Name, Count }]
function getVendorUserCountsForRange(startDate, endDate, vendorId) {
  ensureVendorSchema();
  const users = getCachedData('Users');
  const orders = getCachedData('Orders');
  const ovMap = createOrderVendorMap();
  const idToName = {};
  for (let i = 1; i < users.length; i++) {
    idToName[String(users[i][0])] = String(users[i][1]);
  }
  const counts = {};
  const { dateIdx: d2, userIdx: u2b, statusIdx: s2b } = getOrdersHeaderInfo();
  for (let i = 1; i < orders.length; i++) {
    const row = orders[i];
    const cell = row[d2];
    const dateStr = cell instanceof Date
      ? Utilities.formatDate(cell, Session.getScriptTimeZone(), 'yyyy-MM-dd')
      : String(cell);
    if (dateStr < startDate || dateStr > endDate) continue;
    if (String(row[s2b]) !== 'ordered') continue;
    const oid = String(row[0]);
    const vid = ovMap[oid];
    if (String(vid) !== String(vendorId)) continue;
    const uid = String(row[u2b]);
    counts[uid] = (counts[uid] || 0) + 1;
  }
  return Object.keys(counts).sort().map(uid => ({
    UserID: uid,
    Name: idToName[uid] || '',
    Count: counts[uid]
  }));
}

// 기간 내 사용자×업체 집계: [{ UserID, Name, VendorID, VendorName, Count }]
function getUserVendorCountsForRange(startDate, endDate) {
  ensureVendorSchema();
  const users = getCachedData('Users');
  const orders = getCachedData('Orders');
  const ovMap = createOrderVendorMap();
  const vendors = getVendors();
  const idToName = {};
  const vendorName = {};
  for (let i = 1; i < users.length; i++) {
    idToName[String(users[i][0])] = String(users[i][1]);
  }
  vendors.forEach(v => vendorName[v.vendorId] = v.name);
  const { dateIdx, userIdx, statusIdx } = getOrdersHeaderInfo();
  const counts = {};
  for (let i = 1; i < orders.length; i++) {
    const row = orders[i];
    const cell = row[dateIdx];
    const dateStr = cell instanceof Date
      ? Utilities.formatDate(cell, Session.getScriptTimeZone(), 'yyyy-MM-dd')
      : String(cell);
    if (dateStr < startDate || dateStr > endDate) continue;
    if (String(row[statusIdx]) !== 'ordered') continue;
    const oid = String(row[0]);
    const uid = String(row[userIdx]);
    const vid = String(ovMap[oid] || '');
    const key = uid + '|' + vid;
    counts[key] = (counts[key] || 0) + 1;
  }
  return Object.keys(counts).sort().map(k => {
    const [uid, vid] = k.split('|');
    return { UserID: uid, Name: idToName[uid] || '', VendorID: vid, VendorName: vendorName[vid] || '', Count: counts[k] };
  });
}

// 편의: 월(yyyy-mm) 기준
function getUserVendorCountsForMonth(yyyy, mm) {
  const y = String(yyyy);
  const m = String(mm).padStart(2, '0');
  const start = `${y}-${m}-01`;
  const end = Utilities.formatDate(new Date(parseInt(y,10), parseInt(m,10), 0), Session.getScriptTimeZone(), 'yyyy-MM-dd');
  return getUserVendorCountsForRange(start, end);
}

// 사용자×업체 피벗 + 총합: { header: string[], rows: any[][] }
function getUserVendorPivotForRange(startDate, endDate) {
  ensureVendorSchema();
  const users = getCachedData('Users');
  const orders = getCachedData('Orders');
  const ovMap = createOrderVendorMap();
  const vendors = getVendors();
  const idToName = {};
  for (let i = 1; i < users.length; i++) {
    idToName[String(users[i][0])] = String(users[i][1]);
  }
  // 기간 내 실제로 등장한 VendorID 집합 (미지정 포함 '')
  const { dateIdx, userIdx, statusIdx } = getOrdersHeaderInfo();
  const vendorSet = new Set();
  const rows = orders;
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    const cell = r[dateIdx];
    const dateStr = cell instanceof Date
      ? Utilities.formatDate(cell, Session.getScriptTimeZone(), 'yyyy-MM-dd')
      : String(cell);
    if (dateStr < startDate || dateStr > endDate) continue;
    if (String(r[statusIdx]) !== 'ordered') continue;
    const oid = String(r[0]);
    const vid = String(ovMap[oid] || '');
    vendorSet.add(vid); // '' 포함
  }
  // 정렬된 벤더 목록과 표시 이름 맵
  const vendorIds = Array.from(vendorSet).sort();
  const vidToName = { '': '' };
  vendors.forEach(v => vidToName[v.vendorId] = v.name);

  // 사용자×업체 카운트 맵
  const counts = {}; // key: uid|vid -> count
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    const cell = r[dateIdx];
    const dateStr = cell instanceof Date
      ? Utilities.formatDate(cell, Session.getScriptTimeZone(), 'yyyy-MM-dd')
      : String(cell);
    if (dateStr < startDate || dateStr > endDate) continue;
    if (String(r[statusIdx]) !== 'ordered') continue;
    const oid = String(r[0]);
    const uid = String(r[userIdx]);
    const vid = String(ovMap[oid] || '');
    const key = uid + '|' + vid;
    counts[key] = (counts[key] || 0) + 1;
  }

  // 사용자 목록 (기간 내 주문이 있는 사용자만)
  const usersInPeriod = new Set(Object.keys(counts).map(k => k.split('|')[0]));
  const sortedUsers = Array.from(usersInPeriod).sort();

  // 헤더 구성: UserID, Name, [각 VendorName], Total
  const header = ['UserID', 'Name'].concat(vendorIds.map(vid => vidToName[vid] || vid)).concat(['Total']);

  const dataRows = sortedUsers.map(uid => {
    const row = [uid, idToName[uid] || ''];
    let total = 0;
    vendorIds.forEach(vid => {
      const key = uid + '|' + vid;
      const c = counts[key] || 0;
      row.push(c);
      total += c;
    });
    row.push(total);
    return row;
  });

  return { header: header, rows: dataRows };
}