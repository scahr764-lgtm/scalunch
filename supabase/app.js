  // Configure
  const DEV_MODE = false; // 개발용 빠른 진입 (배포 시 false 권장)
  const SUPABASE_URL = 'https://hlvjrfhmtxjnuqiqvuum.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhsdmpyZmhtdHhqbnVxaXF2dXVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5OTUxNDMsImV4cCI6MjA3NzU3MTE0M30.4siOvbudsfRWmsrIUEIRAcxIEIRe9xZKCS7qA3gubYs';
  const USE_MOCK = DEV_MODE && (SUPABASE_URL.includes('YOUR_PROJECT') || SUPABASE_ANON_KEY === 'YOUR_ANON_KEY');

let supabase = null;
async function initSupabase() {
  // 이미 초기화된 경우 재사용 (Multiple GoTrueClient instances 경고 방지)
  if (supabase) return supabase;
  if (USE_MOCK) return null;
  try {
    const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    return supabase;
  } catch (e) {
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2?bundle');
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    return supabase;
  }
}

// Mock store (로컬 미리보기용)
const MOCK = {
  vendors: [ 
    { vendor_id: 'V001', name: '김밥천국' }, 
    { vendor_id: 'V002', name: '한식당' },
    { vendor_id: 'V003', name: '분식집' }
  ],
  orders: [
    // 홍길동의 주문
    { date: '2025-01-15', user_id: 'emp-001', vendor_id: 'V001', status: 'ordered' },
    { date: '2025-01-16', user_id: 'emp-001', vendor_id: 'V001', status: 'ordered' },
    { date: '2025-01-17', user_id: 'emp-001', vendor_id: 'V002', status: 'ordered' },
    { date: '2025-01-18', user_id: 'emp-001', vendor_id: 'V001', status: 'ordered' },
    // 이영희의 주문
    { date: '2025-01-15', user_id: 'emp-002', vendor_id: 'V002', status: 'ordered' },
    { date: '2025-01-16', user_id: 'emp-002', vendor_id: 'V002', status: 'ordered' },
    { date: '2025-01-17', user_id: 'emp-002', vendor_id: 'V003', status: 'ordered' },
    { date: '2025-01-18', user_id: 'emp-002', vendor_id: 'V003', status: 'ordered' },
    { date: '2025-01-19', user_id: 'emp-002', vendor_id: 'V001', status: 'ordered' },
    // 박철수의 주문
    { date: '2025-01-15', user_id: 'emp-003', vendor_id: 'V001', status: 'ordered' },
    { date: '2025-01-16', user_id: 'emp-003', vendor_id: 'V003', status: 'ordered' },
    { date: '2025-01-17', user_id: 'emp-003', vendor_id: 'V003', status: 'ordered' },
    // 김민수의 주문
    { date: '2025-01-16', user_id: 'emp-004', vendor_id: 'V002', status: 'ordered' },
    { date: '2025-01-17', user_id: 'emp-004', vendor_id: 'V002', status: 'ordered' },
    { date: '2025-01-18', user_id: 'emp-004', vendor_id: 'V002', status: 'ordered' }
  ],
  employees: [
    { user_id: 'emp-001', email: 'hong@example.com', name: '홍길동', password: '1234' },
    { user_id: 'emp-002', email: 'lee@example.com', name: '이영희', password: '1234' },
    { user_id: 'emp-003', email: 'park@example.com', name: '박철수', password: '1234' },
    { user_id: 'emp-004', email: 'kim@example.com', name: '김민수', password: '1234' }
  ]
};

// Elements
const loginSection = document.getElementById('loginSection');
const appSection = document.getElementById('appSection');
const loginEmail = document.getElementById('loginEmail');
const loginPassword = document.getElementById('loginPassword');
const loginBtn = document.getElementById('loginBtn');
const saveId = document.getElementById('saveId');
const asEmployee = document.getElementById('asEmployee');
const asAdmin = document.getElementById('asAdmin');
const logoutBtn = document.getElementById('logoutBtn');
const devBtn = document.getElementById('devBtn');
const userBadge = document.getElementById('userBadge');
const devModeButtons = document.getElementById('devModeButtons');

const loginMsg = document.getElementById('loginMsg');

const empDate = document.getElementById('empDate');
const empVendor = document.getElementById('empVendor');
const orderBtn = document.getElementById('orderBtn');
// const cancelBtn removed for toggle UX
const empMsg = document.getElementById('empMsg');
const cutoffBadge = document.getElementById('cutoffBadge');
// const randomVendorBtn removed
const myStart = document.getElementById('myStart');
const myEnd = document.getElementById('myEnd');
const myOrdersBtn = document.getElementById('myOrdersBtn');
const myOrdersBody = document.getElementById('myOrdersBody');
const myOrdersBodyMobile = document.getElementById('myOrdersBodyMobile');
const weekPrev = document.getElementById('weekPrev');
const weekCurrent = document.getElementById('weekCurrent');
const weekNext = document.getElementById('weekNext');

const adminVendors = document.getElementById('adminVendors');
const vName = document.getElementById('vName');
const addVendorBtn = document.getElementById('addVendorBtn');
const vendorBody = document.getElementById('vendorBody');
const adminSidebar = document.getElementById('adminSidebar');
const contentArea = document.getElementById('contentArea');

const dailyDate = document.getElementById('dailyDate');
const dailyTotal = document.getElementById('dailyTotal');
const dailyVendors = document.getElementById('dailyVendors');
const refreshDaily = document.getElementById('refreshDaily');
const showAllDetails = document.getElementById('showAllDetails');
const detailModal = document.getElementById('detailModal');
const modalVendorName = document.getElementById('modalVendorName');
const modalDate = document.getElementById('modalDate');
const modalTotalCount = document.getElementById('modalTotalCount');
const modalUserList = document.getElementById('modalUserList');
const closeModal = document.getElementById('closeModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const allDetailsModal = document.getElementById('allDetailsModal');
const allModalDate = document.getElementById('allModalDate');
const allModalTotalCount = document.getElementById('allModalTotalCount');
const allDetailsContent = document.getElementById('allDetailsContent');
const closeAllModal = document.getElementById('closeAllModal');
const closeAllModalBtn = document.getElementById('closeAllModalBtn');

const empUserId = document.getElementById('empUserId');
const empUserName = document.getElementById('empUserName');
const empPassword = document.getElementById('empPassword');
const addEmployeeBtn = document.getElementById('addEmployeeBtn');
const employeeBody = document.getElementById('employeeBody');

const reportStart = document.getElementById('reportStart');
const reportEnd = document.getElementById('reportEnd');
const searchReports = document.getElementById('searchReports');
const downloadCSV = document.getElementById('downloadCSV');
const reportsBody = document.getElementById('reportsBody');

let reportsData = []; // CSV 다운로드를 위한 데이터 저장
let reportsRawData = []; // RAW DATA 저장 (이름, 날짜, 업체)

let currentUser = null; // { id, email, role, name }
const DEFAULT_CUTOFF = '10:30'; // TODO: 서버 연동 시 날짜별 마감시간 로드
let __isOrdered = false;

// 로컬 날짜를 YYYY-MM-DD 형식으로 반환 (UTC 문제 해결)
function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Simple in-memory cache (ms TTL)
const CACHE = {
  vendors: { data: null, ts: 0, ttl: 30000 },
  myOrders: { key: '', data: null, ts: 0, ttl: 20000 }
};

function setView(loggedIn) {
  if (loggedIn) {
    loginSection.classList.add('hidden');
    appSection.classList.remove('hidden');
    logoutBtn.classList.remove('hidden');
    userBadge.classList.remove('hidden');
  } else {
    loginSection.classList.remove('hidden');
    appSection.classList.add('hidden');
    logoutBtn.classList.add('hidden');
    userBadge.classList.add('hidden');
  }
}

// UI helpers
const toastEl = document.getElementById('toast');
function toast(message, tone = 'info') {
  if (!toastEl) return;
  toastEl.textContent = message;
  toastEl.classList.remove('hidden');
  toastEl.classList.remove('bg-emerald-600','bg-rose-600','bg-slate-900');
  toastEl.classList.add(tone === 'success' ? 'bg-emerald-600' : tone === 'error' ? 'bg-rose-600' : 'bg-slate-900');
  setTimeout(()=> toastEl.classList.add('hidden'), 1800);
}
function setLoading(btn, loading) {
  if (!btn) return;
  btn.disabled = !!loading;
  if (loading) {
    btn.dataset.oldText = btn.textContent;
    btn.textContent = '처리 중...';
    btn.classList.add('opacity-70','cursor-not-allowed');
  } else {
    if (btn.dataset.oldText) btn.textContent = btn.dataset.oldText;
    btn.classList.remove('opacity-70','cursor-not-allowed');
  }
}

function devLogin() {
  if (!DEV_MODE) return;
  currentUser = { id: 'dev-admin', email: 'admin@local', role: 'admin', name: '관리자(DEV)' };
  userBadge.textContent = `${currentUser.name} · ${currentUser.role}`;
  setView(true);
  initApp();
}

async function ensureProfile(userId) {
  // profiles: id (uuid, pk), name text, role text
  if (USE_MOCK) return { id: userId, name: '개발자', role: 'admin' };
  const { data, error } = await supabase
    .from('profiles')
    .select('id,name,role')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw error;
  if (!data) {
    const { error: insErr } = await supabase
      .from('profiles')
      .insert({ id: userId, name: '', role: 'employee' });
    if (insErr) throw insErr;
    return { id: userId, name: '', role: 'employee' };
  }
  return data;
}

// 실제 로그인 처리
async function handleLogin() {
  console.log('handleLogin called');
  const email = loginEmail?.value?.trim();
  const password = loginPassword?.value?.trim();
  
  console.log('Login attempt:', { email, passwordLength: password?.length });
  
  if (!email || !password) {
    if (loginMsg) loginMsg.textContent = '이메일과 비밀번호를 입력해주세요';
    return;
  }
  
  if (loginMsg) loginMsg.textContent = '';
  setLoading(loginBtn, true);
  
  // 아이디 저장 처리
  if (saveId && saveId.checked) {
    try {
      localStorage.setItem('savedLoginId', email);
      localStorage.setItem('saveIdChecked', 'true');
    } catch (e) {
      console.warn('아이디 저장 실패:', e);
    }
  } else {
    try {
      localStorage.removeItem('savedLoginId');
      localStorage.removeItem('saveIdChecked');
    } catch (e) {
      console.warn('아이디 저장 정보 삭제 실패:', e);
    }
  }
  
  try {
    if (USE_MOCK) {
      // Mock 모드: 간단한 체크
      if (email === 'admin' && password === '1234') {
        currentUser = { id: 'mock-admin', email: 'admin', role: 'admin', name: '관리자' };
      } else {
        const emp = MOCK.employees.find(e => (e.email === email || e.user_id === email) && e.password === password);
        if (emp) {
          currentUser = { id: emp.user_id, email: emp.email, role: 'employee', name: emp.name };
        } else {
          loginMsg.textContent = '이메일 또는 비밀번호가 올바르지 않습니다';
          setLoading(loginBtn, false);
          return;
        }
      }
    } else {
      // Supabase 초기화 확인
      if (!supabase) {
        await initSupabase();
        if (!supabase) {
          loginMsg.textContent = '데이터베이스 연결에 실패했습니다. 페이지를 새로고침해주세요.';
          console.error('Supabase not initialized');
          setLoading(loginBtn, false);
          return;
        }
      }
      
      // Supabase: users 테이블에서 조회
      // RLS가 활성화되어 있어도 이메일로 조회는 허용되어야 함
      const { data: user, error } = await supabase
        .from('users')
        .select('user_id, email, name, password, role')
        .eq('email', email)
        .maybeSingle();
      
      if (error) {
        console.error('Login query error:', error);
        loginMsg.textContent = `오류: ${error.message || '데이터베이스 조회 실패'}`;
        setLoading(loginBtn, false);
        return;
      }
      
      if (!user) {
        loginMsg.textContent = '이메일 또는 비밀번호가 올바르지 않습니다';
        setLoading(loginBtn, false);
        return;
      }
      
      // 비밀번호 확인 (실제 운영 시에는 해시 비교 필요)
      if (user.password !== password) {
        loginMsg.textContent = '이메일 또는 비밀번호가 올바르지 않습니다';
        setLoading(loginBtn, false);
        return;
      }
      
      currentUser = {
        id: user.user_id,
        email: user.email,
        role: user.role,
        name: user.name
      };
      
      console.log('Login successful:', currentUser);
    }
    
    userBadge.textContent = `${currentUser.name} · ${currentUser.role}`;
    setView(true);
    initApp();
    if (loginEmail) loginEmail.value = '';
    if (loginPassword) loginPassword.value = '';
  } catch (err) {
    console.error('Login error:', err);
    loginMsg.textContent = `로그인 중 오류가 발생했습니다: ${err.message || err}`;
  } finally {
    setLoading(loginBtn, false);
  }
}

function chooseRole(role) {
  loginMsg.textContent = '';
  currentUser = role === 'admin'
    ? { id: 'mock-admin', email: 'admin@local', role: 'admin', name: '관리자(미리보기)' }
    : { id: 'mock-emp', email: 'emp@local', role: 'employee', name: '직원(미리보기)' };
  userBadge.textContent = `${currentUser.name} · ${currentUser.role}`;
  setView(true);
  initApp();
}

async function handleLogout() {
  if (!USE_MOCK) await supabase.auth.signOut();
  currentUser = null;
  setView(false);
}

// Vendors
// Mock vendor map 초기화
if (USE_MOCK) {
  window.__vendorMap = {};
  MOCK.vendors.forEach(v => { window.__vendorMap[v.vendor_id] = v.name; });
}

async function loadVendors(forceRefresh = false) {
  console.log('loadVendors called, forceRefresh:', forceRefresh, 'USE_MOCK:', USE_MOCK);
  // caching
  const now = Date.now();
  if (!forceRefresh && CACHE.vendors.data && now - CACHE.vendors.ts < CACHE.vendors.ttl) {
    console.log('loadVendors: using cached data');
    renderVendors(CACHE.vendors.data);
    return;
  }
  
  if (USE_MOCK) {
    const data = MOCK.vendors.slice().sort((a,b)=>a.name.localeCompare(b.name));
    CACHE.vendors = { data, ts: now, ttl: CACHE.vendors.ttl };
    console.log('loadVendors: MOCK data loaded', data);
    renderVendors(data);
  } else {
    try {
      if (!supabase) {
        console.error('loadVendors: supabase client not initialized');
        toast('데이터베이스 연결이 되지 않았습니다', 'error');
        return;
      }
      console.log('loadVendors: fetching from Supabase...');
      const { data, error } = await supabase
        .from('vendors')
        .select('vendor_id,name')
        .order('name');
      
      if (error) {
        console.error('loadVendors error:', error);
        toast('업체 목록을 불러오는데 실패했습니다', 'error');
        return;
      }
      
      console.log('loadVendors: Supabase data received', data);
      CACHE.vendors = { data: data || [], ts: now, ttl: CACHE.vendors.ttl };
      renderVendors(data || []);
    } catch (err) {
      console.error('loadVendors exception:', err);
      toast('업체 목록을 불러오는데 실패했습니다', 'error');
    }
  }
}

function renderVendors(data){
  if (!data || !Array.isArray(data)) {
    console.warn('renderVendors: invalid data', data);
    data = [];
  }
  
  // employee select
  if (empVendor) {
    console.log('renderVendors: empVendor element found, rendering', data.length, 'vendors');
    empVendor.innerHTML = '';
    if (data.length === 0) {
      const emptyOpt = document.createElement('option'); 
      emptyOpt.value = ''; 
      emptyOpt.textContent = '등록된 업체가 없습니다'; 
      emptyOpt.disabled = true;
      empVendor.appendChild(emptyOpt);
      console.warn('renderVendors: No vendors found');
    } else {
      const ph = document.createElement('option'); ph.value = ''; ph.textContent = '업체 선택'; empVendor.appendChild(ph);
      data.forEach(v => {
        const o = document.createElement('option'); 
        o.value = v.vendor_id; 
        o.textContent = `${v.name} (${v.vendor_id})`; 
        empVendor.appendChild(o);
      });
      
      // 최근 선택한 업체 자동 선택 (localStorage에서 가져오기)
      if (currentUser && currentUser.id) {
        try {
          const lastVendorKey = `lastVendor_${currentUser.id}`;
          const lastVendorId = localStorage.getItem(lastVendorKey);
          if (lastVendorId && data.find(v => v.vendor_id === lastVendorId)) {
            empVendor.value = lastVendorId;
            console.log('최근 선택한 업체 자동 선택:', lastVendorId);
          }
        } catch (e) {
          console.warn('최근 업체 불러오기 실패:', e);
        }
      }
      
      console.log('renderVendors: employee select rendered with', empVendor.options.length, 'options');
    }
  } else {
    console.error('renderVendors: empVendor element not found!');
  }
  
  // admin table
  if (vendorBody) {
    vendorBody.innerHTML = '';
    data.forEach(v => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td class="p-2">${v.vendor_id}</td><td class="p-2">${v.name}</td>
                      <td class="p-2"><button class="px-2 py-1 text-sm border rounded" data-del="${v.vendor_id}">삭제</button></td>`;
      vendorBody.appendChild(tr);
    });
  }
  
  // vendor map for display
  window.__vendorMap = {};
  data.forEach(v => { window.__vendorMap[v.vendor_id] = v.name; });
  
  console.log('Vendors rendered:', data.length, 'items');
}

async function addVendor() {
  const name = vName.value.trim();
  if (!name) return;
  // auto id Vxxx
  setLoading(addVendorBtn, true);
  if (USE_MOCK) {
    const max = MOCK.vendors.map(r=>parseInt(String(r.vendor_id).replace(/^[Vv]/,'')||'0',10)).reduce((a,b)=>Math.max(a,b),0);
    const next = 'V' + String(max+1).padStart(3,'0');
    MOCK.vendors.push({ vendor_id: next, name });
    vName.value=''; 
    // 캐시 완전히 무효화
    CACHE.vendors.data = null;
    CACHE.vendors.ts = 0;
    await loadVendors(true);
    toast('업체가 추가되었습니다','success');
  } else {
    const { data: rows } = await supabase.from('vendors').select('vendor_id');
    const max = (rows||[]).map(r => parseInt(String(r.vendor_id).replace(/^[Vv]/,'')||'0',10)).reduce((a,b)=>Math.max(a,b),0);
    const next = 'V' + String(max+1).padStart(3,'0');
    const { error, data: insertedData } = await supabase
      .from('vendors')
      .insert({ vendor_id: next, name })
      .select();
    
    if (!error && insertedData) { 
      vName.value=''; 
      // 캐시 완전히 무효화
      CACHE.vendors.data = null;
      CACHE.vendors.ts = 0;
      // 즉시 새로고침
      await loadVendors(true); 
      toast('업체가 추가되었습니다','success'); 
    } else { 
      console.error('Add vendor error:', error);
      toast(`오류: ${error?.message || '업체 추가 실패'}`,'error');
    }
  }
  setLoading(addVendorBtn, false);
}

vendorBody.addEventListener('click', async (e) => {
  const vid = e.target && e.target.getAttribute('data-del');
  if (!vid) return;
  if (!confirm('삭제하시겠습니까?')) return;
  if (USE_MOCK) {
    const idx = MOCK.vendors.findIndex(v=>v.vendor_id===vid); if (idx>-1) MOCK.vendors.splice(idx,1);
  } else {
    const { error } = await supabase.from('vendors').delete().eq('vendor_id', vid);
    if (error) {
      console.error('Delete vendor error:', error);
      toast(`오류: ${error.message || '업체 삭제 실패'}`,'error');
      return;
    }
  }
  // 캐시 완전히 무효화
  CACHE.vendors.data = null;
  CACHE.vendors.ts = 0;
  await loadVendors(true);
  toast('삭제되었습니다','success');
});

// Orders
async function placeOrder() {
  empMsg.textContent = '';
  const d = empDate.value; const vid = empVendor.value;
  if (!d || !vid) { 
    empMsg.textContent = '날짜/업체를 선택하세요.';
    toast('날짜와 업체를 모두 선택해주세요', 'error');
    return; 
  }
  
  setLoading(orderBtn, true);
  if (USE_MOCK) {
    const existIdx = MOCK.orders.findIndex(o=>o.date===d && o.user_id===currentUser.id && o.status==='ordered');
    if (existIdx !== -1) {
      // 같은 날짜에 이미 주문이 있으면 업체만 변경
      const existing = MOCK.orders[existIdx];
      if (existing.vendor_id === vid) {
        empMsg.textContent = '이미 같은 업체로 주문되어 있습니다';
        toast('이미 같은 업체로 주문되어 있습니다', 'info');
        setLoading(orderBtn, false);
        return;
      }
      const oldVendorId = existing.vendor_id;
      existing.vendor_id = vid;
      empMsg.textContent = '주문 변경 완료 (' + (window.__vendorMap?.[oldVendorId] || oldVendorId) + ' → ' + (window.__vendorMap?.[vid] || vid) + ')';
      toast('주문 변경 완료','success');
    } else {
      // 새 주문 생성 전 확인 다이얼로그
      const vendorName = window.__vendorMap?.[vid] || vid;
      // YYYY-MM-DD 형식을 로컬 날짜로 파싱하여 표시
      const dateParts = d.split('-');
      const localDate = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
      const dateStr = localDate.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'long' });
      const confirmMsg = `날짜: ${dateStr}\n업체: ${vendorName}\n\n주문하시겠습니까?`;
      if (!confirm(confirmMsg)) {
        setLoading(orderBtn, false);
        return;
      }
      
      MOCK.orders.push({ date: d, user_id: currentUser.id, vendor_id: vid, status: 'ordered' });
      empMsg.textContent = '주문 완료';
      toast('주문 완료','success');
      
      // 최근 선택한 업체 저장 (localStorage)
      if (currentUser && currentUser.id) {
        try {
          localStorage.setItem(`lastVendor_${currentUser.id}`, vid);
        } catch (e) {
          console.warn('최근 업체 저장 실패:', e);
        }
      }
    }
  } else {
    const { data: exist } = await supabase
      .from('orders')
      .select('id,status,vendor_id')
      .eq('date', d).eq('user_id', currentUser.id).eq('status', 'ordered').maybeSingle();
    
    if (!exist) {
      // 새 주문 생성 전 확인 다이얼로그
      const vendorName = window.__vendorMap?.[vid] || vid;
      // YYYY-MM-DD 형식을 로컬 날짜로 파싱하여 표시
      const dateParts = d.split('-');
      const localDate = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
      const dateStr = localDate.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'long' });
      const confirmMsg = `날짜: ${dateStr}\n업체: ${vendorName}\n\n주문하시겠습니까?`;
      if (!confirm(confirmMsg)) {
        setLoading(orderBtn, false);
        return;
      }
      
      // 새 주문 생성
      const { error } = await supabase.from('orders').insert({ date: d, user_id: currentUser.id, vendor_id: vid, status: 'ordered' });
      if (error) {
        console.error('placeOrder insert error:', error);
        empMsg.textContent = '주문 실패: ' + error.message;
        toast('주문 실패', 'error');
        setLoading(orderBtn, false);
        return;
      }
      empMsg.textContent = '주문 완료';
      toast('주문 완료','success');
      
      // 최근 선택한 업체 저장 (localStorage)
      if (currentUser && currentUser.id) {
        try {
          localStorage.setItem(`lastVendor_${currentUser.id}`, vid);
        } catch (e) {
          console.warn('최근 업체 저장 실패:', e);
        }
      }
    } else {
      // 같은 날짜에 이미 주문이 있으면 업체만 변경 (업데이트) - 확인 다이얼로그 없이 즉시 변경
      if (exist.vendor_id === vid) {
        empMsg.textContent = '이미 같은 업체로 주문되어 있습니다';
        toast('이미 같은 업체로 주문되어 있습니다', 'info');
        setLoading(orderBtn, false);
        return;
      }
      const { error } = await supabase.from('orders').update({ vendor_id: vid }).eq('id', exist.id);
      if (error) {
        console.error('placeOrder update error:', error);
        empMsg.textContent = '주문 변경 실패: ' + error.message;
        toast('주문 변경 실패', 'error');
        setLoading(orderBtn, false);
        return;
      }
      empMsg.textContent = '주문 변경 완료 (' + (window.__vendorMap?.[exist.vendor_id] || exist.vendor_id) + ' → ' + (window.__vendorMap?.[vid] || vid) + ')';
      toast('주문 변경 완료','success');
    }
  }
  setLoading(orderBtn, false);
  // invalidate myOrders cache and refresh
  CACHE.myOrders.ts = 0; CACHE.myOrders.key = ''; CACHE.myOrders.data = null;
  await loadMyOrders();
}

async function cancelOrder() {
  empMsg.textContent = '';
  const d = empDate.value; if (!d) return;
  setLoading(orderBtn, true);
  if (USE_MOCK) {
    for (let i = MOCK.orders.length-1; i>=0; i--) {
      const o = MOCK.orders[i];
      if (o.date===d && o.user_id===currentUser.id) MOCK.orders.splice(i,1);
    }
  } else {
    const { error } = await supabase.from('orders').delete().eq('date', d).eq('user_id', currentUser.id);
    if (error) {
      console.error('cancelOrder error:', error);
      toast('주문 취소 실패: ' + error.message, 'error');
      setLoading(orderBtn, false);
      return;
    }
  }
  empMsg.textContent = '취소 완료';
  toast('취소 완료','success');
  setLoading(orderBtn, false);
  // invalidate myOrders cache and refresh
  CACHE.myOrders.ts = 0; CACHE.myOrders.key = ''; CACHE.myOrders.data = null;
  await loadMyOrders();
  await refreshToggleState();
}

// 내 주문 조회에서 취소하는 함수
async function cancelMyOrder(orderDate, orderId) {
  if (!confirm(`날짜 ${orderDate}의 주문을 취소하시겠습니까?`)) return;
  
  if (USE_MOCK) {
    for (let i = MOCK.orders.length-1; i>=0; i--) {
      const o = MOCK.orders[i];
      if (o.date === orderDate && o.user_id === currentUser.id && o.status === 'ordered') {
        MOCK.orders.splice(i, 1);
      }
    }
    toast('주문이 취소되었습니다', 'success');
  } else {
    try {
      let deleteQuery = supabase
        .from('orders')
        .delete()
        .eq('date', orderDate)
        .eq('user_id', currentUser.id)
        .eq('status', 'ordered');
      
      // orderId가 있으면 더 정확하게 삭제
      if (orderId) {
        deleteQuery = deleteQuery.eq('id', orderId);
      }
      
      const { error } = await deleteQuery;
      
      if (error) {
        console.error('cancelMyOrder error:', error);
        toast('주문 취소 실패: ' + error.message, 'error');
        return;
      }
      toast('주문이 취소되었습니다', 'success');
    } catch (err) {
      console.error('cancelMyOrder exception:', err);
      toast('주문 취소 중 오류가 발생했습니다', 'error');
      return;
    }
  }
  
  // 캐시 무효화 및 목록 새로고침
  CACHE.myOrders.ts = 0;
  CACHE.myOrders.key = '';
  CACHE.myOrders.data = null;
  await loadMyOrders();
  
  // 오늘 날짜의 주문을 취소한 경우 토글 상태도 업데이트
  const today = getLocalDateString();
  if (orderDate === today) {
    await refreshToggleState();
  }
}

// 전역 함수로 등록 (onclick에서 사용)
window.cancelMyOrder = cancelMyOrder;

// My orders
async function loadMyOrders() {
  const s = myStart.value; const e = myEnd.value;
  if (!s || !e) {
    myOrdersBody.innerHTML = '<tr><td colspan="4" class="p-4 text-center text-slate-500">조회할 기간을 선택하세요</td></tr>';
    if (myOrdersBodyMobile) myOrdersBodyMobile.innerHTML = '<div class="text-center text-slate-500 py-8">조회할 기간을 선택하세요</div>';
    return;
  }
  if (!currentUser || !currentUser.id) {
    console.error('loadMyOrders: currentUser not set');
    myOrdersBody.innerHTML = '<tr><td colspan="4" class="p-4 text-center text-red-500">로그인이 필요합니다</td></tr>';
    if (myOrdersBodyMobile) myOrdersBodyMobile.innerHTML = '<div class="text-center text-red-500 py-8">로그인이 필요합니다</div>';
    return;
  }
  
  // 오늘 날짜 (지난 날짜 필터링용) - 로컬 날짜 사용
  const today = getLocalDateString();
  
  let vmap = window.__vendorMap || {}; // Use let to allow reassignment
  // cache key by user+range
  const key = `${currentUser.id}|${s}|${e}`;
  const now = Date.now();
  if (CACHE.myOrders.data && CACHE.myOrders.key===key && now - CACHE.myOrders.ts < CACHE.myOrders.ttl) {
    myOrdersBody.innerHTML = CACHE.myOrders.data;
    if (myOrdersBodyMobile) myOrdersBodyMobile.innerHTML = CACHE.myOrders.dataMobile || '';
    return;
  }
  
  // 업체 이름 맵이 비어있으면 먼저 로드
  if (!vmap || Object.keys(vmap).length === 0) {
    await loadVendors();
    const refreshedVmap = window.__vendorMap || {};
    if (Object.keys(refreshedVmap).length > 0) {
      vmap = refreshedVmap;
    }
  }
  
  if (USE_MOCK) {
    const rows = MOCK.orders
      .filter(o=>o.user_id===currentUser.id && o.date>=s && o.date<=e && o.date>=today && o.status==='ordered')
      .sort((a,b)=>a.date.localeCompare(b.date)); // 오름차순 정렬
    if (rows.length > 0) {
            // 데스크톱: 테이블 형태 - 개선된 디자인
            const tableHtml = rows.map((o, idx)=>{
              const vendorName = vmap[o.vendor_id] || o.vendor_id || '(미지정)';
              const mockId = o.id || `mock-${o.date}-${idx}`;
              return `<tr class="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/30 transition-all duration-200">
                <td class="p-4 font-semibold text-slate-700">📅 ${o.date}</td>
                <td class="p-4">
                  <div class="flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full bg-brand"></span>
                    <span class="font-medium text-slate-800">${vendorName}</span>
                  </div>
                </td>
                <td class="p-4">
                  <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-200/50">
                    ✓ ${o.status||'ordered'}
                  </span>
                </td>
                <td class="p-4">
                  <button class="px-4 py-2 text-sm font-semibold bg-gradient-to-r from-red-50 to-rose-50 text-red-600 rounded-xl hover:from-red-100 hover:to-rose-100 active:scale-95 transition-all border border-red-200/50 shadow-sm hover:shadow" 
                          onclick="cancelMyOrder('${o.date}', '${mockId}')">
                    ✕ 취소
                  </button>
                </td>
              </tr>`;
            }).join('');
            myOrdersBody.innerHTML = tableHtml;
            
            // 모바일: 카드 형태 - 개선된 디자인
            const mobileHtml = rows.map((o, idx)=>{
              const vendorName = vmap[o.vendor_id] || o.vendor_id || '(미지정)';
              const mockId = o.id || `mock-${o.date}-${idx}`;
              return `<div class="bg-gradient-to-br from-white to-blue-50/30 rounded-xl p-5 border border-slate-200/60 shadow-sm hover:shadow-md transition-all">
                <div class="flex justify-between items-start mb-4">
                  <div class="flex-1">
                    <div class="flex items-center gap-2 mb-2">
                      <span class="text-lg">📅</span>
                      <div class="font-bold text-lg text-slate-800">${o.date}</div>
                    </div>
                    <div class="flex items-center gap-2">
                      <span class="w-2 h-2 rounded-full bg-brand"></span>
                      <span class="font-semibold text-slate-700">${vendorName}</span>
                    </div>
                  </div>
                  <span class="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-200/50">
                    ✓ 주문됨
                  </span>
                </div>
                <button class="w-full py-3 bg-gradient-to-r from-red-50 to-rose-50 text-red-600 rounded-xl font-bold hover:from-red-100 hover:to-rose-100 active:scale-95 transition-all border border-red-200/50 shadow-sm" 
                        onclick="cancelMyOrder('${o.date}', '${mockId}')">
                  ✕ 주문 취소
                </button>
              </div>`;
            }).join('');
            if (myOrdersBodyMobile) myOrdersBodyMobile.innerHTML = mobileHtml;
    } else {
      myOrdersBody.innerHTML = '<tr><td colspan="4" class="p-4 text-center text-slate-500">조회된 주문이 없습니다</td></tr>';
      if (myOrdersBodyMobile) myOrdersBodyMobile.innerHTML = '<div class="text-center text-slate-500 py-8">조회된 주문이 없습니다</div>';
    }
    const html = myOrdersBody.innerHTML; // 캐시용
    CACHE.myOrders = { key, data: html, ts: now, ttl: CACHE.myOrders.ttl };
  } else {
    try {
      if (!supabase) {
        console.error('loadMyOrders: supabase client not initialized');
        myOrdersBody.innerHTML = '<tr><td colspan="4" class="p-4 text-center text-red-500">데이터베이스 연결 오류</td></tr>';
        if (myOrdersBodyMobile) myOrdersBodyMobile.innerHTML = '<div class="text-center text-red-500 py-8">데이터베이스 연결 오류</div>';
        return;
      }
      // Supabase Auth를 사용하지 않으므로 currentUser.id를 직접 사용
      // 시작일과 오늘 중 늦은 날짜 사용 (지난 날짜 제외)
      const startDate = s > today ? s : today;
      console.log('loadMyOrders: querying orders for user_id:', currentUser.id, 'date range:', startDate, 'to', e);
      
      const { data, error } = await supabase
        .from('orders')
        .select('id,date,vendor_id,status')
        .eq('user_id', currentUser.id)
        .eq('status', 'ordered')
        .gte('date', startDate)
        .lte('date', e);
      
      if (error) {
        console.error('loadMyOrders error:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        myOrdersBody.innerHTML = '<tr><td colspan="4" class="p-4 text-center text-red-500">조회 중 오류가 발생했습니다: ' + (error.message || '알 수 없는 오류') + '</td></tr>';
        if (myOrdersBodyMobile) myOrdersBodyMobile.innerHTML = '<div class="text-center text-red-500 py-8">조회 중 오류가 발생했습니다: ' + (error.message || '알 수 없는 오류') + '</div>';
        toast('주문 조회 실패: ' + (error.message || '알 수 없는 오류'), 'error');
        return;
      }
      
      // 클라이언트 측에서 오늘 이후 날짜만 필터링하고 오름차순 정렬
      const filteredData = (data || [])
        .filter(o => o.date >= today)
        .sort((a, b) => a.date.localeCompare(b.date)); // 오름차순 정렬
      
      if (filteredData && filteredData.length > 0) {
        // 데스크톱: 테이블 형태 - 개선된 디자인
        const tableHtml = filteredData.map(o=>{
          const vendorName = vmap[o.vendor_id] || o.vendor_id || '(미지정)';
          return `<tr class="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/30 transition-all duration-200">
            <td class="p-4 font-semibold text-slate-700">📅 ${o.date}</td>
            <td class="p-4">
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-brand"></span>
                <span class="font-medium text-slate-800">${vendorName}</span>
              </div>
            </td>
            <td class="p-4">
              <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-200/50">
                ✓ ${o.status||'ordered'}
              </span>
            </td>
            <td class="p-4">
              <button class="px-4 py-2 text-sm font-semibold bg-gradient-to-r from-red-50 to-rose-50 text-red-600 rounded-xl hover:from-red-100 hover:to-rose-100 active:scale-95 transition-all border border-red-200/50 shadow-sm hover:shadow" 
                      onclick="cancelMyOrder('${o.date}', '${o.id||''}')">
                ✕ 취소
              </button>
            </td>
          </tr>`;
        }).join('');
        myOrdersBody.innerHTML = tableHtml;
        
        // 모바일: 카드 형태 - 개선된 디자인
        const mobileHtml = filteredData.map(o=>{
          const vendorName = vmap[o.vendor_id] || o.vendor_id || '(미지정)';
          return `<div class="bg-gradient-to-br from-white to-blue-50/30 rounded-xl p-5 border border-slate-200/60 shadow-sm hover:shadow-md transition-all">
            <div class="flex justify-between items-start mb-4">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-2">
                  <span class="text-lg">📅</span>
                  <div class="font-bold text-lg text-slate-800">${o.date}</div>
                </div>
                <div class="flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full bg-brand"></span>
                  <span class="font-semibold text-slate-700">${vendorName}</span>
                </div>
              </div>
              <span class="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-200/50">
                ✓ 주문됨
              </span>
            </div>
            <button class="w-full py-3 bg-gradient-to-r from-red-50 to-rose-50 text-red-600 rounded-xl font-bold hover:from-red-100 hover:to-rose-100 active:scale-95 transition-all border border-red-200/50 shadow-sm" 
                    onclick="cancelMyOrder('${o.date}', '${o.id||''}')">
              ✕ 주문 취소
            </button>
          </div>`;
        }).join('');
        if (myOrdersBodyMobile) myOrdersBodyMobile.innerHTML = mobileHtml;
      } else {
        myOrdersBody.innerHTML = '<tr><td colspan="4" class="p-4 text-center text-slate-500">조회된 주문이 없습니다</td></tr>';
        if (myOrdersBodyMobile) myOrdersBodyMobile.innerHTML = '<div class="text-center text-slate-500 py-8">조회된 주문이 없습니다</div>';
      }
      const html = myOrdersBody.innerHTML; // 캐시용
      CACHE.myOrders = { key, data: html, ts: now, ttl: CACHE.myOrders.ttl };
    } catch (err) {
      console.error('loadMyOrders exception:', err);
      myOrdersBody.innerHTML = '<tr><td colspan="4" class="p-4 text-center text-red-500">조회 중 오류가 발생했습니다</td></tr>';
      if (myOrdersBodyMobile) myOrdersBodyMobile.innerHTML = '<div class="text-center text-red-500 py-8">조회 중 오류가 발생했습니다</div>';
      toast('주문 조회 실패', 'error');
    }
  }
}

// Daily orders overview (업체별 주문자 수)
async function loadDailyOrders(targetDate) {
  if (!targetDate) {
    if (dailyDate) targetDate = dailyDate.value || getLocalDateString();
    else return;
  }
  
  if (USE_MOCK) {
    const rows = MOCK.orders.filter(o=>o.date===targetDate && o.status==='ordered');
    // 업체별로 주문한 고유 사용자 수 계산
    const vendorUsers = {}; // { vendor_id: Set<user_id> }
    rows.forEach(r => {
      const vid = r.vendor_id || '';
      if (!vendorUsers[vid]) vendorUsers[vid] = new Set();
      vendorUsers[vid].add(r.user_id);
    });
    
    const vmap = window.__vendorMap || {};
    const entries = Object.keys(vendorUsers).map(vid => ({
      vendor_name: vmap[vid] || MOCK.vendors.find(v=>v.vendor_id===vid)?.name || vid || '(미지정)',
      user_count: vendorUsers[vid].size
    })).sort((a,b) => b.user_count - a.user_count || a.vendor_name.localeCompare(b.vendor_name));
    
    const totalUsers = new Set(rows.map(r=>r.user_id)).size;
    if (dailyTotal) dailyTotal.textContent = totalUsers;
    if (dailyVendors) {
      dailyVendors.innerHTML = entries.map(e => {
        // vendor_id 찾기 (vendor_name으로 역매핑)
        const vendorId = MOCK.vendors.find(v => v.name === e.vendor_name)?.vendor_id || '';
        return `<tr>
          <td class="p-3 font-medium">${e.vendor_name}</td>
          <td class="p-3">${e.user_count}명</td>
          <td class="p-3">
            <button onclick="showVendorDetail('${vendorId}', '${e.vendor_name}', '${targetDate}')" 
                    class="px-3 py-1.5 text-sm bg-brand text-white rounded-lg hover:bg-brand-dark active:scale-95 transition-transform font-medium">
              상세 보기
            </button>
          </td>
        </tr>`;
      }).join('');
    }
  } else {
    // Supabase: 업체별 주문자 수 조회
    const { data: rows, error } = await supabase
      .from('orders')
      .select('vendor_id, user_id')
      .eq('date', targetDate)
      .eq('status', 'ordered');
    
    if (error) {
      console.error('loadDailyOrders error:', error);
      if (dailyTotal) dailyTotal.textContent = '0';
      if (dailyVendors) dailyVendors.innerHTML = '';
      return;
    }
    
    // 업체별로 주문한 고유 사용자 수 계산
    const vendorUsers = {}; // { vendor_id: Set<user_id> }
    (rows || []).forEach(r => {
      const vid = r.vendor_id || '';
      if (!vendorUsers[vid]) vendorUsers[vid] = new Set();
      vendorUsers[vid].add(r.user_id);
    });
    
    // 업체명 조회
    const vmap = window.__vendorMap || {};
    const vendorIds = Object.keys(vendorUsers);
    if (vendorIds.length > 0 && !vmap[vendorIds[0]]) {
      const { data: vendors } = await supabase.from('vendors').select('vendor_id, name');
      (vendors || []).forEach(v => { vmap[v.vendor_id] = v.name; });
      window.__vendorMap = vmap;
    }
    
    const entries = Object.keys(vendorUsers).map(vid => ({
      vendor_id: vid,
      vendor_name: vmap[vid] || vid || '(미지정)',
      user_count: vendorUsers[vid].size
    })).sort((a,b) => b.user_count - a.user_count || a.vendor_name.localeCompare(b.vendor_name));
    
    const totalUsers = new Set((rows || []).map(r=>r.user_id)).size;
    if (dailyTotal) dailyTotal.textContent = totalUsers;
    if (dailyVendors) {
      dailyVendors.innerHTML = entries.map(e => 
        `<tr>
          <td class="p-3 font-medium">${e.vendor_name}</td>
          <td class="p-3">${e.user_count}명</td>
          <td class="p-3">
            <button onclick="showVendorDetail('${e.vendor_id || ''}', '${e.vendor_name}', '${targetDate}')" 
                    class="px-3 py-1.5 text-sm bg-brand text-white rounded-lg hover:bg-brand-dark active:scale-95 transition-transform font-medium">
              상세 보기
            </button>
          </td>
        </tr>`
      ).join('');
    }
  }
}

// 업체별 상세 보기 모달 표시
async function showVendorDetail(vendorId, vendorName, targetDate) {
  if (!detailModal || !modalVendorName || !modalDate || !modalUserList || !modalTotalCount) return;
  
  // 모달 헤더 정보 설정
  modalVendorName.textContent = vendorName || '업체명 미지정';
  
  // 날짜 포맷팅 (YYYY-MM-DD → YYYY년 MM월 DD일)
  const dateParts = targetDate.split('-');
  const formattedDate = `${dateParts[0]}년 ${parseInt(dateParts[1])}월 ${parseInt(dateParts[2])}일`;
  modalDate.textContent = formattedDate;
  
  // 초기 총 인원 수 (로딩 중)
  modalTotalCount.textContent = '총 0명';
  
  // 로딩 상태
  modalUserList.innerHTML = '<div class="text-center py-8 text-slate-500">불러오는 중...</div>';
  
  // 모달 표시
  detailModal.classList.remove('hidden');
  detailModal.classList.add('flex');
  
  try {
    let userNames = [];
    
    if (USE_MOCK) {
      // Mock 모드: 해당 날짜와 업체의 주문자 ID 조회
      const orders = MOCK.orders.filter(o => o.date === targetDate && o.vendor_id === vendorId && o.status === 'ordered');
      const userIds = [...new Set(orders.map(o => o.user_id))];
      
      // 사용자 이름 조회
      userNames = userIds.map(uid => {
        const user = MOCK.employees.find(e => (e.user_id || e.email) === uid);
        return user ? user.name : uid;
      }).sort();
    } else {
      // Supabase 모드: 주문자 조회
      const { data: orders, error } = await supabase
        .from('orders')
        .select('user_id')
        .eq('date', targetDate)
        .eq('vendor_id', vendorId)
        .eq('status', 'ordered');
      
      if (error) {
        console.error('showVendorDetail error:', error);
        modalUserList.innerHTML = '<div class="text-center py-8 text-red-500">데이터를 불러오는 중 오류가 발생했습니다</div>';
        modalTotalCount.textContent = '총 0명';
        return;
      }
      
      const userIds = [...new Set((orders || []).map(o => o.user_id))];
      
      // 사용자 이름 조회
      if (userIds.length > 0) {
        const { data: users, error: userError } = await supabase
          .from('users')
          .select('user_id, name, email')
          .in('user_id', userIds);
        
        if (userError) {
          console.error('showVendorDetail user query error:', userError);
          modalUserList.innerHTML = '<div class="text-center py-8 text-red-500">사용자 정보를 불러오는 중 오류가 발생했습니다</div>';
          modalTotalCount.textContent = '총 0명';
          return;
        }
        
        // user_id로 매핑
        const userMap = {};
        (users || []).forEach(u => {
          userMap[u.user_id] = u.name || u.email || u.user_id;
        });
        
        userNames = userIds.map(uid => userMap[uid] || uid).sort();
      }
    }
    
    // 총 인원 수 업데이트
    modalTotalCount.textContent = `총 ${userNames.length}명`;
    
    // 주문자 목록 렌더링
    if (userNames.length === 0) {
      modalUserList.innerHTML = '<div class="text-center py-8 text-slate-500">주문자가 없습니다</div>';
    } else {
      modalUserList.innerHTML = userNames.map((name, idx) => 
        `<div class="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
          <span class="flex items-center justify-center w-8 h-8 rounded-full bg-brand text-white font-bold text-sm">${idx + 1}</span>
          <span class="font-medium text-slate-800">${name}</span>
        </div>`
      ).join('');
    }
  } catch (err) {
    console.error('showVendorDetail exception:', err);
    modalUserList.innerHTML = '<div class="text-center py-8 text-red-500">오류가 발생했습니다</div>';
    modalTotalCount.textContent = '총 0명';
  }
}

// 전역 함수로 등록 (onclick에서 사용)
window.showVendorDetail = showVendorDetail;

// Employee management
async function loadEmployees() {
  if (USE_MOCK) {
    renderEmployees(MOCK.employees);
  } else {
    // Supabase: users 테이블에서 role='employee'인 사용자만 조회
    const { data, error } = await supabase
      .from('users')
      .select('user_id, email, name')
      .eq('role', 'employee')
      .order('email');
    if (error) {
      console.error('loadEmployees error:', error);
      toast('직원 목록을 불러오는데 실패했습니다', 'error');
      return;
    }
    renderEmployees(data || []);
  }
}

function renderEmployees(data) {
  if (!employeeBody) return;
  employeeBody.innerHTML = '';
  (data || []).forEach(emp => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="p-2">${emp.email || emp.user_id || ''}</td>
      <td class="p-2">${emp.name || ''}</td>
      <td class="p-2">
        <button class="px-2 py-1 text-sm border rounded text-red-600 hover:bg-red-50" data-del="${emp.user_id || emp.email}">삭제</button>
      </td>`;
    employeeBody.appendChild(tr);
  });
}

async function addEmployee() {
  const email = empUserId?.value?.trim();
  const name = empUserName?.value?.trim();
  const password = empPassword?.value?.trim() || '1234'; // 기본값 1234
  
  if (!email || !name) {
    toast('아이디와 이름을 입력해주세요', 'error');
    return;
  }
  
  setLoading(addEmployeeBtn, true);
  
  if (USE_MOCK) {
    // Mock: 간단히 추가
    const exists = MOCK.employees.some(e => (e.email || e.user_id) === email);
    if (exists) {
      toast('이미 존재하는 아이디입니다', 'error');
      setLoading(addEmployeeBtn, false);
      return;
    }
    const newEmp = {
      user_id: `emp-${Date.now()}`,
      email: email,
      name: name,
      password: password
    };
    MOCK.employees.push(newEmp);
    empUserId.value = '';
    empUserName.value = '';
    if (empPassword) empPassword.value = '1234'; // 기본값으로 리셋
    await loadEmployees();
    toast('직원이 추가되었습니다', 'success');
  } else {
    // Supabase: users 테이블에 추가
    // 실제로는 Supabase Auth를 사용하거나, users 테이블 구조에 맞춰야 함
    // 여기서는 간단한 구조를 가정: user_id, email, name, password, role
    const { error } = await supabase
      .from('users')
      .insert({
        email: email,
        name: name,
        password: password, // 실제로는 해시되어야 함
        role: 'employee'
      });
    
    if (!error) {
      empUserId.value = '';
      empUserName.value = '';
      if (empPassword) empPassword.value = '1234'; // 기본값으로 리셋
      await loadEmployees();
      toast('직원이 추가되었습니다', 'success');
    } else {
      if (error.code === '23505') { // Unique violation
        toast('이미 존재하는 아이디입니다', 'error');
      } else {
        toast(error.message, 'error');
      }
    }
  }
  setLoading(addEmployeeBtn, false);
}

// Reports: 이름별 업체별 주문 개수 (피벗 테이블 형태)
let reportsPivotData = {}; // { userName: { vendorName: count, ... }, ... }
let reportsVendors = []; // 업체 목록

async function loadReports() {
  const start = reportStart?.value;
  const end = reportEnd?.value;
  if (!start || !end) {
    toast('시작일과 종료일을 입력해주세요', 'error');
    return;
  }
  
  setLoading(searchReports, true);
  reportsPivotData = {};
  reportsVendors = [];
  reportsData = [];
  reportsRawData = []; // RAW DATA 초기화
  
  if (USE_MOCK) {
    // Mock: 주문 데이터에서 사용자별, 업체별 개수 집계
    const orders = MOCK.orders.filter(o => o.date >= start && o.date <= end && o.status === 'ordered');
    const users = MOCK.employees || [];
    const vmap = window.__vendorMap || {};
    
    // RAW DATA 수집 (이름, 날짜, 업체)
    orders.forEach(o => {
      const user = users.find(u => (u.user_id || u.email) === o.user_id) || { name: o.user_id, email: o.user_id };
      const userName = user.name || user.email || o.user_id;
      let vendorName = vmap[o.vendor_id];
      if (!vendorName) {
        const vendor = MOCK.vendors.find(v => v.vendor_id === o.vendor_id);
        vendorName = vendor ? vendor.name : (o.vendor_id || '(미지정)');
      }
      
      reportsRawData.push({
        name: userName,
        date: o.date,
        vendor: vendorName
      });
    });
    
    // { user_id: { vendor_id: count } }
    const userVendorCounts = {};
    orders.forEach(o => {
      if (!userVendorCounts[o.user_id]) userVendorCounts[o.user_id] = {};
      const vid = o.vendor_id || '';
      userVendorCounts[o.user_id][vid] = (userVendorCounts[o.user_id][vid] || 0) + 1;
    });
    
    // 사용자별 업체별 집계
    Object.keys(userVendorCounts).forEach(userId => {
      const user = users.find(u => (u.user_id || u.email) === userId) || { name: userId, email: userId };
      const userName = user.name || user.email || userId;
      
      if (!reportsPivotData[userName]) reportsPivotData[userName] = {};
      
      Object.keys(userVendorCounts[userId]).forEach(vendorId => {
        // 업체명 찾기: vmap -> MOCK.vendors -> vendorId -> '(미지정)'
        let vendorName = vmap[vendorId];
        if (!vendorName) {
          const vendor = MOCK.vendors.find(v => v.vendor_id === vendorId);
          vendorName = vendor ? vendor.name : (vendorId || '(미지정)');
        }
        
        if (!reportsVendors.includes(vendorName)) {
          reportsVendors.push(vendorName);
        }
        
        reportsPivotData[userName][vendorName] = (reportsPivotData[userName][vendorName] || 0) + userVendorCounts[userId][vendorId];
        
        // CSV용 데이터도 저장
        reportsData.push({
          name: userName,
          vendor_name: vendorName,
          count: userVendorCounts[userId][vendorId]
        });
      });
    });
    
    // 디버깅: 업체 목록 확인
    console.log('reportsVendors:', reportsVendors);
    console.log('reportsPivotData:', reportsPivotData);
    
    renderReportsPivot();
  } else {
    // Supabase: 주문 데이터 조회 (날짜 필드 포함) - 모든 필드 조회로 변경
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*') // 모든 필드 조회 (date 포함)
      .gte('date', start)
      .lte('date', end)
      .eq('status', 'ordered');
    
    if (ordersError) {
      console.error('ordersError:', ordersError);
      toast('주문 데이터를 불러오는데 실패했습니다', 'error');
      setLoading(searchReports, false);
      return;
    }
    
    // 디버깅: 주문 데이터 확인
    console.log('Supabase orders 조회 결과:', orders);
    console.log('주문 개수:', orders ? orders.length : 0);
    if (orders && orders.length > 0) {
      console.log('첫 번째 주문 샘플 (전체):', JSON.stringify(orders[0], null, 2));
      console.log('첫 번째 주문의 date 값:', orders[0].date);
      console.log('첫 번째 주문의 모든 키:', Object.keys(orders[0]));
      if (!orders[0].date) {
        console.error('⚠️ 첫 번째 주문에 date 필드가 없습니다!');
      }
    } else {
      console.warn('주문 데이터가 없습니다.');
    }
    
    // 사용자 정보 조회
    const userIds = [...new Set((orders || []).map(o => o.user_id))];
    const { data: users } = await supabase
      .from('users')
      .select('user_id, email, name')
      .in('user_id', userIds);
    
    const userMap = {};
    (users || []).forEach(u => { userMap[u.user_id] = u; });
    
    // 업체 정보 조회
    const vendorIds = [...new Set((orders || []).map(o => o.vendor_id).filter(Boolean))];
    const { data: vendors } = await supabase
      .from('vendors')
      .select('vendor_id, name')
      .in('vendor_id', vendorIds);
    
    const vmap = {};
    (vendors || []).forEach(v => { vmap[v.vendor_id] = v.name; });
    window.__vendorMap = { ...window.__vendorMap, ...vmap };
    
    // RAW DATA 수집 (이름, 날짜, 업체)
    (orders || []).forEach(o => {
      const user = userMap[o.user_id] || { name: o.user_id, email: o.user_id };
      const userName = user.name || user.email || o.user_id;
      const vendorName = vmap[o.vendor_id] || o.vendor_id || '(미지정)';
      
      // 날짜 확인 및 디버깅
      if (!o.date) {
        console.warn('주문 데이터에 날짜가 없습니다:', o);
        console.warn('주문 객체의 모든 키:', Object.keys(o));
      }
      
      // 날짜가 있으면 그대로 사용, 없으면 빈 문자열
      const orderDate = o.date || '';
      
      reportsRawData.push({
        name: userName,
        date: orderDate,
        vendor: vendorName
      });
    });
    
    // 디버깅: RAW DATA 확인
    console.log('reportsRawData 샘플 (최대 5개):', reportsRawData.slice(0, 5));
    console.log('reportsRawData 총 개수:', reportsRawData.length);
    
    // 집계
    const userVendorCounts = {};
    (orders || []).forEach(o => {
      if (!userVendorCounts[o.user_id]) userVendorCounts[o.user_id] = {};
      const vid = o.vendor_id || '';
      userVendorCounts[o.user_id][vid] = (userVendorCounts[o.user_id][vid] || 0) + 1;
    });
    
    // 사용자별 업체별 집계
    Object.keys(userVendorCounts).forEach(userId => {
      const user = userMap[userId] || { name: userId, email: userId };
      const userName = user.name || user.email || userId;
      
      if (!reportsPivotData[userName]) reportsPivotData[userName] = {};
      
      Object.keys(userVendorCounts[userId]).forEach(vendorId => {
        const vendorName = vmap[vendorId] || vendorId || '(미지정)';
        if (!reportsVendors.includes(vendorName)) reportsVendors.push(vendorName);
        
        reportsPivotData[userName][vendorName] = (reportsPivotData[userName][vendorName] || 0) + userVendorCounts[userId][vendorId];
        
        // CSV용 데이터도 저장
        reportsData.push({
          name: userName,
          vendor_name: vendorName,
          count: userVendorCounts[userId][vendorId]
        });
      });
    });
    
    renderReportsPivot();
  }
  
  setLoading(searchReports, false);
}

function renderReportsPivot() {
  const thead = document.getElementById('reportsHead');
  const tbody = document.getElementById('reportsBody');
  
  if (!thead || !tbody) {
    console.error('reportsHead or reportsBody not found');
    return;
  }
  
  // 업체명 정렬
  const sortedVendors = [...reportsVendors].sort();
  
  // 헤더 생성
  let headerHTML = '<tr><th class="p-2 border border-slate-300 sticky left-0 bg-slate-100">이름</th>';
  sortedVendors.forEach(vendor => {
    headerHTML += `<th class="p-2 border border-slate-300 bg-slate-100">${vendor}</th>`;
  });
  headerHTML += '<th class="p-2 border border-slate-300 bg-slate-50 font-semibold">합계</th></tr>';
  thead.innerHTML = headerHTML;
  
  // 디버깅
  console.log('Header HTML:', headerHTML);
  console.log('Vendors:', sortedVendors);
  
  // 사용자명 정렬
  const userNames = Object.keys(reportsPivotData).sort();
  
  // 바디 생성
  tbody.innerHTML = '';
  userNames.forEach(userName => {
    const userData = reportsPivotData[userName];
    const tr = document.createElement('tr');
    
    let rowHTML = `<td class="p-2 border border-slate-300 sticky left-0 bg-white font-medium">${userName}</td>`;
    let total = 0;
    
    sortedVendors.forEach(vendor => {
      const count = userData[vendor] || 0;
      total += count;
      rowHTML += `<td class="p-2 border border-slate-300 text-center">${count > 0 ? count : '-'}</td>`;
    });
    
    rowHTML += `<td class="p-2 border border-slate-300 bg-slate-50 font-semibold text-center">${total}</td>`;
    tr.innerHTML = rowHTML;
    tbody.appendChild(tr);
  });
  
  // 합계 행 추가
  if (userNames.length > 0) {
    const tr = document.createElement('tr');
    let rowHTML = '<td class="p-2 border border-slate-300 bg-slate-50 font-semibold sticky left-0">합계</td>';
    let grandTotal = 0;
    
    sortedVendors.forEach(vendor => {
      let vendorTotal = 0;
      userNames.forEach(userName => {
        vendorTotal += (reportsPivotData[userName][vendor] || 0);
      });
      grandTotal += vendorTotal;
      rowHTML += `<td class="p-2 border border-slate-300 bg-slate-50 font-semibold text-center">${vendorTotal}</td>`;
    });
    
    rowHTML += `<td class="p-2 border border-slate-300 bg-slate-200 font-bold text-center">${grandTotal}</td>`;
    tr.innerHTML = rowHTML;
    tbody.appendChild(tr);
  }
}

function downloadReportsCSV() {
  if (!reportsPivotData || Object.keys(reportsPivotData).length === 0) {
    toast('다운로드할 데이터가 없습니다', 'error');
    return;
  }
  
  // SheetJS가 로드되지 않았으면 경고
  if (typeof XLSX === 'undefined') {
    toast('Excel 라이브러리를 불러오는 중입니다. 잠시 후 다시 시도해주세요.', 'error');
    return;
  }
  
  // 워크북 생성
  const wb = XLSX.utils.book_new();
  
  // === 첫 번째 시트: 피벗 테이블 ===
  const headers = ['이름', ...reportsVendors.sort(), '합계'];
  const userNames = Object.keys(reportsPivotData).sort();
  
  // 피벗 테이블 데이터 생성
  const pivotRows = userNames.map(userName => {
    const userData = reportsPivotData[userName];
    let total = 0;
    const row = [userName];
    
    reportsVendors.sort().forEach(vendor => {
      const count = userData[vendor] || 0;
      total += count;
      row.push(count);
    });
    
    row.push(total);
    return row;
  });
  
  // 합계 행
  const totalRow = ['합계'];
  let grandTotal = 0;
  reportsVendors.sort().forEach(vendor => {
    let vendorTotal = 0;
    userNames.forEach(userName => {
      vendorTotal += (reportsPivotData[userName][vendor] || 0);
    });
    grandTotal += vendorTotal;
    totalRow.push(vendorTotal);
  });
  totalRow.push(grandTotal);
  pivotRows.push(totalRow);
  
  // 피벗 테이블 워크시트 생성
  const pivotData = [headers, ...pivotRows];
  const ws1 = XLSX.utils.aoa_to_sheet(pivotData);
  XLSX.utils.book_append_sheet(wb, ws1, '집계');
  
  // === 두 번째 시트: RAW DATA ===
  // RAW DATA 헤더
  const rawHeaders = ['이름', '날짜', '업체'];
  
  // RAW DATA 정렬 (이름순 → 날짜순)
  const sortedRawData = [...reportsRawData].sort((a, b) => {
    const nameCompare = a.name.localeCompare(b.name);
    if (nameCompare !== 0) return nameCompare;
    return a.date.localeCompare(b.date);
  });
  
  // 디버깅: RAW DATA 확인
  console.log('downloadReportsCSV - reportsRawData 개수:', reportsRawData.length);
  console.log('downloadReportsCSV - sortedRawData 샘플:', sortedRawData.slice(0, 3));
  
  // RAW DATA 행 생성
  const rawRows = sortedRawData.map(item => {
    // 날짜 확인 및 변환
    let dateValue = item.date || '';
    
    // 날짜가 있는 경우만 변환
    if (dateValue && typeof dateValue === 'string' && dateValue.match(/^\d{4}-\d{2}-\d{2}$/)) {
      // Excel 날짜 형식으로 변환
      const dateParts = dateValue.split('-');
      const dateObj = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
      // Date 객체를 사용하면 SheetJS가 날짜로 인식
      dateValue = dateObj;
    } else if (dateValue && typeof dateValue !== 'string') {
      // 이미 Date 객체이거나 다른 형식인 경우
      console.log('날짜 형식 확인:', dateValue, typeof dateValue);
    } else if (!dateValue) {
      console.warn('날짜가 없습니다:', item);
    }
    
    return [item.name, dateValue, item.vendor];
  });
  
  const rawData = [rawHeaders, ...rawRows];
  
  // RAW DATA 워크시트 생성
  const ws2 = XLSX.utils.aoa_to_sheet(rawData);
  
  // 날짜 열 형식 설정 (B열 - 날짜)
  const range = XLSX.utils.decode_range(ws2['!ref'] || 'A1');
  for (let row = 1; row <= range.e.r; row++) { // 헤더 포함 (row 0은 헤더)
    const cellAddress = XLSX.utils.encode_cell({ r: row, c: 1 }); // B열 (인덱스 1)
    const cell = ws2[cellAddress];
    if (cell && cell.v instanceof Date) {
      // 날짜 형식 지정
      cell.z = 'yyyy-mm-dd';
      cell.t = 'd'; // 날짜 타입 명시
    } else if (cell && row > 0) { // 헤더가 아닌 경우
      // 날짜 문자열인 경우 Date 객체로 변환
      const cellValue = cell.v;
      if (typeof cellValue === 'string' && cellValue.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const dateParts = cellValue.split('-');
        const dateObj = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
        cell.v = dateObj;
        cell.z = 'yyyy-mm-dd';
        cell.t = 'd';
      }
    }
  }
  
  XLSX.utils.book_append_sheet(wb, ws2, 'RAW DATA');
  
  // Excel 파일 다운로드
  const start = reportStart?.value || 'start';
  const end = reportEnd?.value || 'end';
  XLSX.writeFile(wb, `집계_${start}_${end}.xlsx`);
  
  toast('Excel 파일이 다운로드되었습니다 (시트 2개: 집계, RAW DATA)', 'success');
}

// Init
// 이번 주(월~금)의 시작일과 종료일 계산
function getThisWeekRange() {
  const today = new Date();
  const day = today.getDay(); // 0(일) ~ 6(토)
  // 월요일까지의 날짜 차이 (월요일=1, 일요일이면 -6)
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(today);
  monday.setDate(today.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);
  
  const friday = new Date(monday);
  friday.setDate(monday.getDate() + 4); // 월요일 + 4일 = 금요일
  friday.setHours(23, 59, 59, 999);
  
  return {
    start: getLocalDateString(monday), // 로컬 날짜 사용
    end: getLocalDateString(friday) // 로컬 날짜 사용
  };
}

// 특정 주의 날짜 범위 계산 (weekOffset: -1=지난주, 0=이번주, 1=다음주)
function getWeekRange(weekOffset = 0) {
  const today = new Date();
  const day = today.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(today);
  monday.setDate(today.getDate() + diffToMonday + (weekOffset * 7));
  monday.setHours(0, 0, 0, 0);
  
  const friday = new Date(monday);
  friday.setDate(monday.getDate() + 4);
  friday.setHours(23, 59, 59, 999);
  
  return {
    start: getLocalDateString(monday), // 로컬 날짜 사용
    end: getLocalDateString(friday) // 로컬 날짜 사용
  };
}

// 주간 선택 버튼 활성 상태 업데이트
function updateWeekButtonState(selectedWeek) {
  const inactiveClass = 'px-4 py-2 text-sm bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 active:scale-95 transition-transform font-medium';
  const activeClass = 'px-4 py-2 text-sm bg-brand text-white rounded-lg hover:bg-brand-dark active:scale-95 transition-transform font-medium';
  
  // 모든 버튼 초기화
  if (weekPrev) weekPrev.className = inactiveClass;
  if (weekCurrent) weekCurrent.className = inactiveClass;
  if (weekNext) weekNext.className = inactiveClass;
  
  // 선택된 버튼 활성화
  if (selectedWeek === -1 && weekPrev) weekPrev.className = activeClass;
  if (selectedWeek === 0 && weekCurrent) weekCurrent.className = activeClass;
  if (selectedWeek === 1 && weekNext) weekNext.className = activeClass;
}

function initApp() {
  const today = getLocalDateString(); // 로컬 날짜 사용
  empDate.value = today;
  if (dailyDate) dailyDate.value = today; // 금일 주문 현황 기본 날짜
  // default range: 이번 주(월~금), 지난 날짜 제외
  const weekRange = getThisWeekRange();
  myStart.value = weekRange.start;
  myEnd.value = weekRange.end;
  updateWeekButtonState(0); // 이번주 버튼 활성화
  userBadge.textContent = `${currentUser.name} · ${currentUser.role}`;
  // Sidebar: 관리자만 표시
  const empPanel = document.getElementById('empPanel');
  if (currentUser.role === 'admin') {
    adminSidebar.classList.remove('hidden');
    adminSidebar.classList.remove('md:hidden');
    adminSidebar.classList.add('md:block');
    // 직원 패널 숨기기
    if (empPanel) empPanel.classList.add('hidden');
    // default panel
    showPanel('daily');
  } else {
    adminSidebar.classList.add('hidden');
    adminSidebar.classList.add('md:hidden');
    adminSidebar.classList.remove('md:block');
    // 직원 패널 보이기
    if (empPanel) empPanel.classList.remove('hidden');
    // 관리자 패널들 숨기기
    Array.from(contentArea.querySelectorAll('[data-panel]')).forEach(el=>el.classList.add('hidden'));
    // 직원 모드일 때 업체 목록 강제 새로고침
    console.log('initApp: employee mode - forcing vendor reload');
    setTimeout(() => loadVendors(true).catch(err => console.error('initApp: loadVendors failed', err)), 100);
  }
  console.log('initApp: currentUser.role =', currentUser.role);
  // 관리자 모드일 때만 일반 로드
  if (currentUser.role === 'admin') {
    loadVendors().catch(err => console.error('initApp: loadVendors failed', err));
  }
  loadEmployees(); // 직원 목록 로드
  if (currentUser.role === 'employee') {
    // 직원 모드일 때 자동으로 이번 주 주문 조회
    setTimeout(() => loadMyOrders().catch(err => console.error('initApp: loadMyOrders failed', err)), 200);
  }
  updateCutoffBadge();
}

// Panel switching
function showPanel(name) {
  if (!contentArea) return;
  const panels = Array.from(contentArea.querySelectorAll('[data-panel]'));
  panels.forEach(el => {
    if (el.getAttribute('data-panel') === name) el.classList.remove('hidden'); else el.classList.add('hidden');
  });
  // 관리자 모드일 때 직원 패널은 항상 숨기기
  if (currentUser && currentUser.role === 'admin') {
    const empPanel = document.getElementById('empPanel');
    if (empPanel) empPanel.classList.add('hidden');
  }
  // 금일 주문 현황 패널을 선택했을 때 자동 로드
  if (name === 'daily') {
    loadDailyOrders();
  }
  // 직원 계정 관리 패널을 선택했을 때 자동 로드
  if (name === 'employees') {
    loadEmployees();
  }
  // 집계/CSV 패널을 선택했을 때 날짜 기본값 설정
  if (name === 'reports') {
    const today = getLocalDateString(); // 로컬 날짜 사용
    const ym = today.slice(0,7);
    if (reportStart) reportStart.value = ym + '-01';
    if (reportEnd) reportEnd.value = today;
  }
  // nav active style
  if (adminSidebar) {
    Array.from(adminSidebar.querySelectorAll('.nav-btn')).forEach(btn => {
      if (btn.getAttribute('data-nav') === name) {
        btn.classList.add('bg-slate-900','text-white');
        btn.classList.remove('hover:bg-slate-100');
      } else {
        btn.classList.remove('bg-slate-900','text-white');
        btn.classList.add('hover:bg-slate-100');
      }
    });
  }
}

// Events
if (asEmployee) asEmployee.addEventListener('click', () => chooseRole('employee'));
if (asAdmin) asAdmin.addEventListener('click', () => chooseRole('admin'));
if (adminSidebar) adminSidebar.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-nav]');
  if (!btn) return;
  showPanel(btn.getAttribute('data-nav'));
});
if (empDate) empDate.addEventListener('change', () => { updateCutoffBadge(); refreshToggleState(); });

// 오늘 날짜로 이동 버튼
const todayBtn = document.getElementById('todayBtn');
if (todayBtn) {
  todayBtn.addEventListener('click', () => {
    const today = getLocalDateString(); // 로컬 날짜 사용
    empDate.value = today;
    updateCutoffBadge();
    refreshToggleState();
    toast('오늘 날짜로 이동했습니다', 'info');
  });
}

// Enter 키로 주문하기 (날짜/업체 입력 필드에서)
if (empDate) {
  empDate.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (empVendor && empVendor.value) {
        placeOrder();
      } else {
        empVendor?.focus();
      }
    }
  });
}
if (empVendor) {
  empVendor.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const d = empDate.value;
      const vid = empVendor.value;
      if (d && vid) {
        placeOrder();
      }
    }
  });
}

function updateCutoffBadge() {
  if (!cutoffBadge) return;
  const sel = empDate.value;
  if (!sel) { cutoffBadge.textContent = '마감: -'; cutoffBadge.className = 'mt-1 text-xs inline-block px-2 py-1 rounded bg-slate-100 text-slate-700'; return; }
  // 오늘이면 마감 비교 - 로컬 날짜 사용
  const today = getLocalDateString();
  const cutoff = DEFAULT_CUTOFF;
  cutoffBadge.textContent = `마감: ${cutoff}`;
  if (sel === today) {
    const now = new Date(); // 로컬 시간 기준
    const [h,m] = cutoff.split(':').map(n=>parseInt(n,10));
    const cutoffDate = new Date(); 
    cutoffDate.setHours(h, m, 0, 0); // 로컬 시간 기준으로 설정
    const diff = cutoffDate.getTime() - now.getTime();
    // 상태 색상: 여유(>30m)=slate, 임박(<=30m && >0)=amber, 지남(<=0)=rose
    if (diff <= 0) {
      cutoffBadge.className = 'mt-1 text-xs inline-block px-2 py-1 rounded bg-rose-100 text-rose-700';
      // 주문 불가 상태 시각화
      if (orderBtn) {
        orderBtn.disabled = true;
        orderBtn.textContent = '마감됨';
        orderBtn.classList.add('opacity-60','cursor-not-allowed');
      }
    } else if (diff <= 30*60*1000) {
      cutoffBadge.className = 'mt-1 text-xs inline-block px-2 py-1 rounded bg-amber-100 text-amber-800';
      if (orderBtn) {
        orderBtn.disabled = false;
        orderBtn.textContent = '주문';
        orderBtn.classList.remove('opacity-60','cursor-not-allowed');
      }
    } else {
      cutoffBadge.className = 'mt-1 text-xs inline-block px-2 py-1 rounded bg-slate-100 text-slate-700';
      if (orderBtn) {
        orderBtn.disabled = false;
        orderBtn.textContent = '주문';
        orderBtn.classList.remove('opacity-60','cursor-not-allowed');
      }
    }
  } else {
    cutoffBadge.className = 'mt-1 text-xs inline-block px-2 py-1 rounded bg-slate-100 text-slate-700';
    if (orderBtn) {
      orderBtn.disabled = false;
      orderBtn.textContent = '주문';
      orderBtn.classList.remove('opacity-60','cursor-not-allowed');
    }
  }
}

// Determine current state and set toggle label
async function refreshToggleState() {
  const d = empDate.value; if (!d) return;
  if (USE_MOCK) {
    __isOrdered = MOCK.orders.some(o=>o.user_id===currentUser.id && o.date===d && o.status==='ordered');
  } else {
    const { data } = await supabase.from('orders').select('id,status').eq('date', d).eq('user_id', currentUser.id).maybeSingle();
    __isOrdered = !!(data && data.status === 'ordered');
  }
  if (orderBtn && !orderBtn.disabled) {
    if (__isOrdered) {
      orderBtn.textContent = '취소하기';
      orderBtn.classList.remove('bg-brand');
      orderBtn.classList.add('bg-slate-600');
    } else {
      orderBtn.textContent = '주문하기';
      orderBtn.classList.remove('bg-slate-600');
      orderBtn.classList.add('bg-brand');
    }
  }
}

logoutBtn.addEventListener('click', handleLogout);
addVendorBtn.addEventListener('click', addVendor);
if (addEmployeeBtn) addEmployeeBtn.addEventListener('click', addEmployee);

// 직원 삭제 이벤트
if (employeeBody) {
  employeeBody.addEventListener('click', async (e) => {
    const empId = e.target && e.target.getAttribute('data-del');
    if (!empId) return;
    if (!confirm('정말 삭제하시겠습니까?')) return;
    
    if (USE_MOCK) {
      const idx = MOCK.employees.findIndex(e => (e.user_id || e.email) === empId);
      if (idx > -1) MOCK.employees.splice(idx, 1);
    } else {
      const { error } = await supabase
        .from('users')
        .delete()
        .or(`user_id.eq.${empId},email.eq.${empId}`);
      if (error) {
        toast(error.message, 'error');
        return;
      }
    }
    await loadEmployees();
    toast('직원이 삭제되었습니다', 'success');
  });
}
// Toggle handler
if (orderBtn) orderBtn.addEventListener('click', async () => {
  if (orderBtn.disabled) return;
  await refreshToggleState();
  if (__isOrdered) await cancelOrder(); else await placeOrder();
  await refreshToggleState();
});
if (refreshDaily) refreshDaily.addEventListener('click', () => loadDailyOrders());
if (dailyDate) dailyDate.addEventListener('change', () => loadDailyOrders());

// 전체 상세 보기 버튼
if (showAllDetails) {
  showAllDetails.addEventListener('click', async () => {
    const targetDate = dailyDate?.value || getLocalDateString();
    await showAllVendorsDetail(targetDate);
  });
}

// 전체 상세 보기 모달 표시 함수
async function showAllVendorsDetail(targetDate) {
  if (!allDetailsModal || !allModalDate || !allModalTotalCount || !allDetailsContent) return;
  
  // 날짜 포맷팅
  const dateParts = targetDate.split('-');
  const formattedDate = `${dateParts[0]}년 ${parseInt(dateParts[1])}월 ${parseInt(dateParts[2])}일`;
  allModalDate.textContent = formattedDate;
  
  // 초기값
  allModalTotalCount.textContent = '총 0명';
  allDetailsContent.innerHTML = '<div class="text-center py-8 text-slate-500">불러오는 중...</div>';
  
  // 모달 표시
  allDetailsModal.classList.remove('hidden');
  allDetailsModal.classList.add('flex');
  
  try {
    let vendorData = []; // { vendor_id, vendor_name, userNames: [] }
    let totalCount = 0;
    
    if (USE_MOCK) {
      // Mock 모드: 모든 업체별 주문자 조회
      const rows = MOCK.orders.filter(o => o.date === targetDate && o.status === 'ordered');
      
      // 업체별로 그룹화
      const vendorUsers = {}; // { vendor_id: Set<user_id> }
      rows.forEach(r => {
        const vid = r.vendor_id || '';
        if (!vendorUsers[vid]) vendorUsers[vid] = new Set();
        vendorUsers[vid].add(r.user_id);
      });
      
      const vmap = window.__vendorMap || {};
      const vendors = MOCK.vendors;
      
      // 각 업체별 주문자 이름 조회
      for (const vid of Object.keys(vendorUsers)) {
        const userIds = [...vendorUsers[vid]];
        const userNames = userIds.map(uid => {
          const user = MOCK.employees.find(e => (e.user_id || e.email) === uid);
          return user ? user.name : uid;
        }).sort();
        
        const vendorName = vmap[vid] || vendors.find(v => v.vendor_id === vid)?.name || vid || '(미지정)';
        vendorData.push({
          vendor_id: vid,
          vendor_name: vendorName,
          userNames: userNames,
          count: userNames.length
        });
        totalCount += userNames.length;
      }
      
      // 주문자 수 내림차순, 업체명 오름차순 정렬
      vendorData.sort((a, b) => b.count - a.count || a.vendor_name.localeCompare(b.vendor_name));
    } else {
      // Supabase 모드: 모든 업체별 주문자 조회
      const { data: orders, error } = await supabase
        .from('orders')
        .select('vendor_id, user_id')
        .eq('date', targetDate)
        .eq('status', 'ordered');
      
      if (error) {
        console.error('showAllVendorsDetail error:', error);
        allDetailsContent.innerHTML = '<div class="text-center py-8 text-red-500">데이터를 불러오는 중 오류가 발생했습니다</div>';
        return;
      }
      
      // 업체별로 그룹화
      const vendorUsers = {}; // { vendor_id: Set<user_id> }
      (orders || []).forEach(r => {
        const vid = r.vendor_id || '';
        if (!vendorUsers[vid]) vendorUsers[vid] = new Set();
        vendorUsers[vid].add(r.user_id);
      });
      
      // 업체명 조회
      const vmap = window.__vendorMap || {};
      const vendorIds = Object.keys(vendorUsers);
      if (vendorIds.length > 0) {
        const { data: vendors } = await supabase.from('vendors').select('vendor_id, name');
        (vendors || []).forEach(v => { vmap[v.vendor_id] = v.name; });
        window.__vendorMap = vmap;
      }
      
      // 각 업체별 주문자 이름 조회
      const userIds = [...new Set((orders || []).map(o => o.user_id))];
      let userMap = {};
      
      if (userIds.length > 0) {
        const { data: users, error: userError } = await supabase
          .from('users')
          .select('user_id, name, email')
          .in('user_id', userIds);
        
        if (!userError && users) {
          users.forEach(u => {
            userMap[u.user_id] = u.name || u.email || u.user_id;
          });
        }
      }
      
      // 업체별 데이터 구성
      for (const vid of vendorIds) {
        const userIdsForVendor = [...vendorUsers[vid]];
        const userNames = userIdsForVendor.map(uid => userMap[uid] || uid).sort();
        const vendorName = vmap[vid] || vid || '(미지정)';
        
        vendorData.push({
          vendor_id: vid,
          vendor_name: vendorName,
          userNames: userNames,
          count: userNames.length
        });
        totalCount += userNames.length;
      }
      
      // 주문자 수 내림차순, 업체명 오름차순 정렬
      vendorData.sort((a, b) => b.count - a.count || a.vendor_name.localeCompare(b.vendor_name));
    }
    
    // 총 인원 수 업데이트
    allModalTotalCount.textContent = `총 ${totalCount}명`;
    
    // 업체별 섹션 렌더링
    if (vendorData.length === 0) {
      allDetailsContent.innerHTML = '<div class="text-center py-8 text-slate-500">주문 내역이 없습니다</div>';
    } else {
      allDetailsContent.innerHTML = vendorData.map((vendor, vendorIdx) => 
        `<div class="bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-xl p-6 border border-slate-200 shadow-sm">
          <div class="flex items-center justify-between mb-4 pb-3 border-b border-slate-300">
            <div class="flex items-center gap-3">
              <span class="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-brand to-brand-dark text-white font-bold text-lg">${vendorIdx + 1}</span>
              <div>
                <h3 class="text-xl font-bold text-slate-800">${vendor.vendor_name}</h3>
                <p class="text-sm text-slate-600 mt-1">주문자 ${vendor.count}명</p>
              </div>
            </div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
            ${vendor.userNames.map((name, idx) => 
              `<div class="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition">
                <span class="flex items-center justify-center w-7 h-7 rounded-full bg-brand/20 text-brand font-bold text-sm">${idx + 1}</span>
                <span class="font-medium text-slate-700">${name}</span>
              </div>`
            ).join('')}
          </div>
        </div>`
      ).join('');
    }
  } catch (err) {
    console.error('showAllVendorsDetail exception:', err);
    allDetailsContent.innerHTML = '<div class="text-center py-8 text-red-500">오류가 발생했습니다</div>';
    allModalTotalCount.textContent = '총 0명';
  }
}

// 전체 상세 보기 모달 닫기 이벤트
if (closeAllModal) {
  closeAllModal.addEventListener('click', () => {
    if (allDetailsModal) {
      allDetailsModal.classList.add('hidden');
      allDetailsModal.classList.remove('flex');
    }
  });
}
if (closeAllModalBtn) {
  closeAllModalBtn.addEventListener('click', () => {
    if (allDetailsModal) {
      allDetailsModal.classList.add('hidden');
      allDetailsModal.classList.remove('flex');
    }
  });
}
// 모달 배경 클릭 시 닫기
if (allDetailsModal) {
  allDetailsModal.addEventListener('click', (e) => {
    if (e.target === allDetailsModal) {
      allDetailsModal.classList.add('hidden');
      allDetailsModal.classList.remove('flex');
    }
  });
}

// 모달 닫기 이벤트
if (closeModal) {
  closeModal.addEventListener('click', () => {
    if (detailModal) {
      detailModal.classList.add('hidden');
      detailModal.classList.remove('flex');
    }
  });
}
if (closeModalBtn) {
  closeModalBtn.addEventListener('click', () => {
    if (detailModal) {
      detailModal.classList.add('hidden');
      detailModal.classList.remove('flex');
    }
  });
}
// 모달 배경 클릭 시 닫기
if (detailModal) {
  detailModal.addEventListener('click', (e) => {
    if (e.target === detailModal) {
      detailModal.classList.add('hidden');
      detailModal.classList.remove('flex');
    }
  });
}
if (devBtn) {
  if (DEV_MODE) devBtn.classList.remove('hidden');
  devBtn.addEventListener('click', devLogin);
}
if (myOrdersBtn) myOrdersBtn.addEventListener('click', loadMyOrders);

// 주간 선택 버튼 이벤트
if (weekPrev) weekPrev.addEventListener('click', () => {
  const range = getWeekRange(-1);
  myStart.value = range.start;
  myEnd.value = range.end;
  updateWeekButtonState(-1);
  loadMyOrders();
});

if (weekCurrent) weekCurrent.addEventListener('click', () => {
  const range = getWeekRange(0);
  myStart.value = range.start;
  myEnd.value = range.end;
  updateWeekButtonState(0);
  loadMyOrders();
});

if (weekNext) weekNext.addEventListener('click', () => {
  const range = getWeekRange(1);
  myStart.value = range.start;
  myEnd.value = range.end;
  updateWeekButtonState(1);
  loadMyOrders();
});

// 날짜 입력 필드가 변경되면 버튼 상태 업데이트
if (myStart && myEnd) {
  const updateButtonStateOnDateChange = () => {
    const start = myStart.value;
    const end = myEnd.value;
    const currentRange = getWeekRange(0);
    const prevRange = getWeekRange(-1);
    const nextRange = getWeekRange(1);
    
    if (start === currentRange.start && end === currentRange.end) {
      updateWeekButtonState(0);
    } else if (start === prevRange.start && end === prevRange.end) {
      updateWeekButtonState(-1);
    } else if (start === nextRange.start && end === nextRange.end) {
      updateWeekButtonState(1);
    } else {
      // 수동으로 날짜를 변경한 경우 모든 버튼 비활성화
      updateWeekButtonState(null);
    }
  };
  
  myStart.addEventListener('change', updateButtonStateOnDateChange);
  myEnd.addEventListener('change', updateButtonStateOnDateChange);
}
if (searchReports) searchReports.addEventListener('click', loadReports);
if (downloadCSV) downloadCSV.addEventListener('click', downloadReportsCSV);

// 로그인 버튼 이벤트 리스너
if (loginBtn) {
  loginBtn.addEventListener('click', handleLogin);
  console.log('Login button event listener attached');
}
if (loginEmail) {
  loginEmail.addEventListener('keypress', (e) => { 
    if (e.key === 'Enter') {
      e.preventDefault();
      handleLogin(); 
    }
  });
}
if (loginPassword) {
  loginPassword.addEventListener('keypress', (e) => { 
    if (e.key === 'Enter') {
      e.preventDefault();
      handleLogin(); 
    }
  });
}

// Session restore
(async () => {
  await initSupabase();
  
  // 저장된 아이디 불러오기
  try {
    const savedId = localStorage.getItem('savedLoginId');
    const saveIdChecked = localStorage.getItem('saveIdChecked') === 'true';
    
    if (savedId && loginEmail) {
      loginEmail.value = savedId;
    }
    if (saveId && saveIdChecked) {
      saveId.checked = true;
    }
  } catch (e) {
    console.warn('저장된 아이디 불러오기 실패:', e);
  }
  
  if (USE_MOCK) {
    // Mock 모드일 때 개발용 버튼 표시
    if (devModeButtons) devModeButtons.classList.remove('hidden');
    setView(false);
    return;
  } else {
    // 실제 Supabase 모드일 때 개발용 버튼 숨김
    if (devModeButtons) devModeButtons.classList.add('hidden');
  }
  
  // 실제 Supabase 연동 시 세션 복원 (필요시)
  // 현재는 매번 로그인하도록 설정
  setView(false);
  
  /* Supabase Auth를 사용하는 경우의 세션 복원 예시:
  const { data: { session } } = await supabase.auth.getSession();
  if (session && session.user) {
    const prof = await ensureProfile(session.user.id);
    currentUser = { id: session.user.id, email: session.user.email, role: prof.role, name: prof.name || session.user.email };
    userBadge.textContent = `${currentUser.name} · ${currentUser.role}`;
    setView(true);
    initApp();
  } else {
    setView(false);
  }
  */
})();


