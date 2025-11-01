-- 도시락 주문 시스템 Supabase 스키마

-- 1. 사용자 테이블 (users)
CREATE TABLE IF NOT EXISTS users (
  user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password TEXT NOT NULL, -- 실제 운영 시에는 해시된 비밀번호 저장 권장
  role TEXT NOT NULL DEFAULT 'employee', -- 'admin' 또는 'employee'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 관리자 계정 생성 (이메일: admin, 비밀번호: 1234)
-- 주의: 실제 운영 시에는 해시된 비밀번호를 사용해야 합니다
INSERT INTO users (email, name, password, role) 
VALUES ('admin', '관리자', '1234', 'admin')
ON CONFLICT (email) DO NOTHING;

-- 2. 업체 테이블 (vendors)
CREATE TABLE IF NOT EXISTS vendors (
  vendor_id TEXT PRIMARY KEY, -- 예: 'V001'
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 주문 테이블 (orders)
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  vendor_id TEXT REFERENCES vendors(vendor_id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'ordered', -- 'ordered', 'cancelled' 등
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(date, user_id, vendor_id, status) -- 같은 날 같은 사용자가 같은 업체에서 중복 주문 방지
);

-- 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_orders_date ON orders(date);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_vendor_id ON orders(vendor_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- RLS (Row Level Security) 설정
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 vendors를 읽을 수 있음
CREATE POLICY "vendors_select_all" ON vendors FOR SELECT USING (true);

-- vendors 테이블은 모든 사용자에게 허용 (애플리케이션 레벨에서 권한 체크)
-- 주의: 실제 운영 시에는 서버 사이드에서 권한을 체크하는 것을 권장합니다
CREATE POLICY "vendors_insert_all" ON vendors FOR INSERT WITH CHECK (true);
CREATE POLICY "vendors_update_all" ON vendors FOR UPDATE USING (true);
CREATE POLICY "vendors_delete_all" ON vendors FOR DELETE USING (true);

-- 더 안전한 방법 (Supabase Auth 사용 시):
-- CREATE POLICY "vendors_insert_admin" ON vendors FOR INSERT WITH CHECK (
--   EXISTS (SELECT 1 FROM users WHERE user_id = auth.uid() AND role = 'admin')
-- );

-- orders 테이블은 모든 사용자에게 허용 (애플리케이션 레벨에서 권한 체크)
-- 주의: 실제 운영 시에는 서버 사이드에서 권한을 체크하는 것을 권장합니다
CREATE POLICY "orders_select_all" ON orders FOR SELECT USING (true);
CREATE POLICY "orders_insert_all" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "orders_update_all" ON orders FOR UPDATE USING (true);
CREATE POLICY "orders_delete_all" ON orders FOR DELETE USING (true);

-- 더 안전한 방법 (Supabase Auth 사용 시):
-- CREATE POLICY "orders_select_own" ON orders FOR SELECT USING (
--   user_id = auth.uid() OR 
--   EXISTS (SELECT 1 FROM users WHERE user_id = auth.uid() AND role = 'admin')
-- );
-- CREATE POLICY "orders_insert_own" ON orders FOR INSERT WITH CHECK (
--   user_id = auth.uid()
-- );

-- 로그인을 위해 users 테이블은 이메일로 조회 가능하도록 허용
-- 주의: 이는 보안상 취약할 수 있으므로, 실제 운영 시에는 서버 사이드 인증을 사용하는 것을 권장합니다
CREATE POLICY "users_select_for_login" ON users FOR SELECT USING (true);
CREATE POLICY "users_insert_admin" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "users_update_admin" ON users FOR UPDATE USING (true);
CREATE POLICY "users_delete_admin" ON users FOR DELETE USING (true);

-- 더 안전한 방법 (서버 사이드 인증 사용 시):
-- CREATE POLICY "users_select_admin" ON users FOR SELECT USING (
--   EXISTS (SELECT 1 FROM users WHERE user_id = auth.uid() AND role = 'admin') OR
--   user_id = auth.uid()
-- );

-- 참고: Supabase Auth를 사용하지 않고 직접 인증하는 경우
-- 위의 RLS 정책은 조정이 필요할 수 있습니다.
-- 대신 애플리케이션 레벨에서 권한 체크를 수행할 수도 있습니다.

