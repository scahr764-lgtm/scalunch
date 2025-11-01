# 도시락 주문 시스템 - Supabase 버전

## 🚀 배포 방법

### GitHub에 업로드
```bash
git init
git add .
git commit -m "Initial commit: Supabase 도시락 주문 시스템"
git branch -M main
git remote add origin https://github.com/scahr764-lgtm/scalunch.git
git push -u origin main
```

### Netlify 배포

1. **Netlify 대시보드에서 사이트 생성**
   - https://app.netlify.com 접속
   - "Add new site" → "Import an existing project"
   - GitHub 저장소 선택: `scahr764-lgtm/scalunch`

2. **빌드 설정**
   - Base directory: `supabase`
   - Build command: (비워두기 - 정적 파일만 배포)
   - Publish directory: `supabase`

3. **환경 변수 설정 (선택사항)**
   - Netlify 대시보드 → Site settings → Environment variables
   - 필요시 환경 변수 추가

4. **사이트 배포**
   - "Deploy site" 클릭

## 📋 설정 방법

### 1. Supabase 프로젝트 생성

1. [Supabase](https://supabase.com)에 가입하고 로그인
2. **"New Project"** 버튼 클릭하여 새 프로젝트 생성
   - Organization 선택 (없으면 생성)
   - 프로젝트 이름 입력
   - 데이터베이스 비밀번호 설정 (기억해두세요!)
   - Region 선택 (가장 가까운 지역 권장)
   - **"Create new project"** 클릭
   - 프로젝트 생성 완료까지 1-2분 대기

### 2. Supabase 프로젝트 정보 확인 (URL과 Anon Key 찾기)

프로젝트가 생성되면:

1. **프로젝트 대시보드**로 자동 이동합니다
2. 좌측 메뉴에서 **"Settings" (⚙️)** 클릭
3. **"API"** 메뉴 클릭
4. 여기서 다음 정보를 확인할 수 있습니다:

   **Project URL**:
   - 예: `https://xxxxxxxxxxxxxx.supabase.co`
   - 이 값을 복사하세요

   **anon/public key**:
   - "Project API keys" 섹션에서
   - **"anon" "public"** 키 찾기
   - 키 옆의 **👁️ (보이기)** 아이콘 클릭
   - 또는 **복사** 버튼으로 복사
   - 예: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (매우 긴 문자열)

⚠️ **주의**: `service_role` 키는 사용하지 마세요. 이 키는 서버에서만 사용해야 합니다.

### 3. SQL 스키마 실행

1. Supabase 대시보드 → SQL Editor 이동
2. `schema.sql` 파일의 내용을 복사해서 실행
3. 관리자 계정이 자동으로 생성됩니다:
   - 이메일: `admin`
   - 비밀번호: `1234`
   - 역할: `admin`

### 4. 환경 설정

`app.js` 파일의 상단 부분에서 찾은 값으로 수정하세요:

1. **Supabase 프로젝트 열기**:
   - `supabase/app.js` 파일 열기
   - 상단 3-4번째 줄 수정

2. **수정할 부분**:
   ```javascript
   const DEV_MODE = false; // 실제 운영 시 false로 설정
   const SUPABASE_URL = '여기에 복사한 Project URL 붙여넣기';
   const SUPABASE_ANON_KEY = '여기에 복사한 anon public key 붙여넣기';
   ```

3. **예시** (실제 값으로 변경 필요):
   ```javascript
   const SUPABASE_URL = 'https://abcdefghijklmnop.supabase.co';
   const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNjIzOTAyMiwiZXhwIjoxOTMxODE1MDIyfQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
   ```

4. **저장** 후 페이지 새로고침

### 5. 로그인

#### 관리자 로그인
- 이메일: `admin`
- 비밀번호: `1234`

#### 직원 로그인
- 관리자 화면에서 직원 계정을 추가한 후
- 추가한 이메일과 비밀번호로 로그인

## 데이터베이스 스키마

### users (사용자)
- `user_id`: UUID (기본키)
- `email`: TEXT (고유)
- `name`: TEXT
- `password`: TEXT
- `role`: TEXT ('admin' 또는 'employee')

### vendors (업체)
- `vendor_id`: TEXT (기본키, 예: 'V001')
- `name`: TEXT

### orders (주문)
- `id`: UUID (기본키)
- `date`: DATE
- `user_id`: UUID (users 참조)
- `vendor_id`: TEXT (vendors 참조)
- `status`: TEXT (기본값: 'ordered')

## 보안 주의사항

⚠️ **중요**: 현재 비밀번호는 평문으로 저장됩니다. 실제 운영 환경에서는 반드시 해시된 비밀번호를 사용하세요 (예: bcrypt).

## 기능

- ✅ 관리자 로그인 (admin/1234)
- ✅ 직원 계정 관리 (추가/삭제)
- ✅ 업체 관리 (추가/삭제)
- ✅ 직원 주문/취소
- ✅ 금일 주문 현황 (날짜별 조회)
- ✅ 집계/CSV (기간별 피벗 테이블, CSV 다운로드)
- ✅ 모바일 최적화 UI
- ✅ 주간 선택 (지난주/이번주/다음주)
- ✅ 최근 선택한 업체 자동 선택

## 개발 모드 (Mock)

`USE_MOCK = true`일 때:
- 실제 Supabase 연결 없이 로컬 Mock 데이터로 작동
- 개발용 버튼이 표시되어 빠르게 테스트 가능

## 라이선스

Created by Yeulyee Kim
