# AIMIX 프로젝트 현황 및 작업 가이드

> 최종 업데이트: 2025-11-18 18:15
> 작성자: Claude (AI Assistant)
> 상태: ✅ **배포 완료** - Big Five & Stress 테스트 구현 완료, TypeScript 오류 수정

---

## 🚨🚨🚨 절대 잊지 말아야 할 것 - 3일째 반복 중 🚨🚨🚨

### ❌ 절대 하지 말아야 할 것:
1. **❌ SERVER 프로젝트를 별도로 배포하지 마세요**
2. **❌ CLIENT 프로젝트를 별도로 배포하지 마세요**
3. **❌ `cd server && vercel deploy` 명령어 사용 금지**
4. **❌ `cd client && vercel deploy` 명령어 사용 금지**

### ✅ 반드시 지켜야 할 것:
1. **✅ AIMIX 프로젝트 하나로만 배포**
2. **✅ Vercel 프로젝트 목록에는 오직 "aimix"만 존재해야 함**
3. **✅ client와 server는 aimix 프로젝트 내부의 디렉토리일 뿐**
4. **✅ 배포는 루트에서만: `cd /Users/ichan-u/aimix && vercel --prod`**

### 📌 배포 결정 사항 (반복 금지!)
- **이전**: client 프로젝트 + server 프로젝트 (별도 배포) → 관리 어려움
- **현재**: **AIMIX 단일 프로젝트로 통합** (최종 결정)
- **이유**: 관리 복잡도 감소, 환경 변수 통합 관리

---

## 📋 목차
1. [프로젝트 개요](#프로젝트-개요)
2. [프로젝트 구조](#프로젝트-구조)
3. [배포 현황](#배포-현황)
4. [현재 이슈 및 해결](#현재-이슈-및-해결)
5. [환경 변수 관리](#환경-변수-관리)
6. [개발 워크플로우](#개발-워크플로우)
7. [앞으로 해야 할 일](#앞으로-해야-할-일)
8. [체크리스트](#체크리스트)

---

## 🎯 프로젝트 개요

**프로젝트명**: AIMIX (The Essential AI Platform)
**버전**: 1.0.0
**설명**: 통합 AI 플랫폼 서비스

### 기술 스택
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript
- **Database**: Supabase (PostgreSQL)
- **배포**: Vercel
- **인증**: JWT, Kakao OAuth
- **AI**: Google Gemini API, OpenAI API

자세한 기술 스택은 [`TECH_STACK.md`](./TECH_STACK.md) 참조

---

## 📁 프로젝트 구조

### 모노레포 구성
```
aimix/
├── client/              # 프론트엔드 (React + Vite)
│   ├── src/
│   │   ├── components/  # React 컴포넌트
│   │   ├── pages/       # 페이지 컴포넌트
│   │   ├── services/    # API 서비스 레이어
│   │   └── ...
│   ├── .env             # 로컬 개발용
│   ├── .env.local       # 로컬 개발용 (gitignored)
│   ├── .env.vercel.production  # Vercel 프로덕션 설정
│   └── vercel.json      # Vercel 배포 설정
│
├── server/              # 백엔드 (Express + TypeScript)
│   ├── src/
│   │   ├── routes/      # API 라우트
│   │   ├── services/    # 비즈니스 로직
│   │   ├── middleware/  # Express 미들웨어
│   │   └── ...
│   ├── .env             # 서버 환경 변수
│   └── vercel.json      # Vercel 배포 설정
│
├── package.json         # 루트 패키지 (workspace 관리)
├── PLATFORM_ARCHITECTURE.md  # 아키텍처 문서
├── SECURITY.md          # 보안 가이드
├── TECH_STACK.md        # 기술 스택 문서
└── PROJECT_STATUS.md    # 이 파일
```

### Workspace 구성
- **Root**: 모노레포 관리 (npm workspaces)
- **Client**: 독립적인 프론트엔드 애플리케이션
- **Server**: 독립적인 백엔드 API 서버

---

## 🚀 배포 현황

### ✅ 최종 배포 구조 (단일 프로젝트)
**AIMIX 프로젝트 하나로 통합 배포** - client와 server 별도 프로젝트 없음

### 현재 Vercel 배포 상태

#### AIMIX 통합 프로젝트 (유일한 프로젝트)
- **프로젝트 ID**: `prj_NGeXtH8j9O0RTWBKn4SpVdDltoEl`
- **조직 ID**: `team_3pBCIJ6m8O3nnQdO16JCUOeh`
- **프로젝트명**: `aimix`
- **상태**: ✅ 활성 (`.vercel/project.json` 존재)
- **Production URL**: `https://aiports.org` (또는 `https://aimix.vercel.app`)
- **용도**: **Frontend + Backend 통합 배포**

#### ✅ 배포 상태 (2025-11-18 10:45)
- **Frontend**: ✅ 정상 배포 및 작동
- **Backend API**: ✅ Vercel Serverless 함수로 배포 완료
- **API 엔드포인트**: `https://aiports.org/api` (정상 작동)
- **OAuth 로그인**: ✅ Kakao OAuth 콜백 404 에러 수정 완료
- **최종 배포 URL**: `https://aimix-5otbh4bpa-chanwoos-projects-bd61ed6a.vercel.app`
- **Production 도메인**: `https://aiports.org`

### ❌ 삭제된 프로젝트들 (절대 재생성 금지!)
- ~~server 프로젝트~~ (삭제됨 - 재생성 금지)
- ~~client 프로젝트~~ (삭제됨 - 재생성 금지)

---

## 🐛 현재 이슈 및 해결

### Issue #1: 로그인 에러 (Failed to fetch) - ✅ **해결 완료**
**발생일**: 2025-01-18
**해결일**: 2025-01-18
**환경**: 운영 환경 (Production)
**상태**: ✅ **수정 완료** - Production 재배포 완료, 기능 테스트 대기

#### 에러 메시지
```
Uncaught (in promise) TypeError: Failed to fetch
    at getOAuthState (auth.ts:145)
    at loginWithKakao (auth.ts:161)
    at handleKakaoLogin (LoginPage.tsx:43)
```

#### 근본 원인 분석 (2025-01-18 14:00)
🚨 **심각한 발견**: **모든 Vercel 환경 변수에 `\n` (개행 문자) 포함됨**

1. **영향받는 환경 변수** (확인됨)
   ```bash
   ❌ VITE_API_URL="https://server-xxx.vercel.app\n"
   ❌ DATABASE_URL="postgresql://...\n"
   ❌ JWT_SECRET="...\n"
   ❌ SUPABASE_URL="https://ssmrlqzbwigzwtlpjsiz.supabase.co\n"
   ❌ CLIENT_URL="http://localhost:5173\n"
   ❌ 기타 모든 환경 변수 (~13개)
   ```

2. **영향 범위**
   - ✅ Development 환경: 모든 변수 영향
   - ✅ Preview 환경: 모든 변수 영향 (추정)
   - ✅ Production 환경: 모든 변수 영향 (확인됨)

3. **발생 원인 추정**
   - 환경 변수 추가 시 텍스트 파일에서 복사하면서 개행 포함
   - `echo "value"` 사용 (올바름: `echo -n "value"`)
   - 스크립트 자동화 시 개행 처리 오류

#### 해결 조치

##### ✅ 완료된 작업 (2025-01-18 15:00)
1. **로컬 파일 수정 완료**
   ```bash
   # 수정 완료: client/.env.vercel.production
   VITE_API_URL="https://server-g3aajfl7q-chanwoos-projects-bd61ed6a.vercel.app"
   ```

2. **수정 가이드 문서 작성 완료**
   - `VERCEL_ENV_FIX_GUIDE.md` 생성
   - 전체 환경 변수 목록 정리
   - 우선순위별 수정 순서 정의
   - CLI 및 대시보드 수정 방법 안내

3. **자동화 스크립트 작성**
   - `fix-vercel-env.sh` 생성 (정보 제공용)
   - `update-env-vars.sh` 생성 (실행 스크립트)
   - 환경 변수 목록 및 올바른 값 정리

4. **Vercel Production 환경 변수 수정 완료** ✅
   - Playwright로 `VITE_API_URL` 수정 완료 (1/11)
   - CLI로 나머지 10개 환경 변수 수정 완료 (10/11)
   - 총 11개 환경 변수 수정 완료:
     ✅ VITE_API_URL
     ✅ KAKAO_REST_API_KEY
     ✅ DATABASE_URL
     ✅ SUPABASE_URL
     ✅ SUPABASE_ANON_KEY
     ✅ SUPABASE_SERVICE_KEY
     ✅ JWT_SECRET
     ✅ CLIENT_URL
     ✅ SENDGRID_API_KEY
     ✅ EMAIL_FROM
     ✅ PORT

5. **Production 재배포 완료** ✅
   ```bash
   vercel --prod
   # 배포 URL: https://aimix-k0ngjd2k2-chanwoos-projects-bd61ed6a.vercel.app
   # 배포 ID: D9j8PQS55WKuat2heSyaubAgRwZk
   ```

##### ⏳ 남은 작업
1. **기능 테스트** (사용자 테스트 필요)
   - [ ] 이메일 로그인 테스트
   - [ ] 카카오 로그인 테스트
   - [ ] API 호출 정상 작동 확인
   - [ ] 데이터베이스 연결 확인

2. **Preview & Development 환경 변수 수정** (선택적)
   - [ ] Preview 환경 변수 수정
   - [ ] Development 환경 변수 수정

### Issue #2: 카카오 로그인 404 에러 - ✅ **해결 완료**
**발생일**: 2025-11-18 10:40
**해결일**: 2025-11-18 10:45
**환경**: 운영 환경 (Production)
**상태**: ✅ **수정 완료** - 배포 완료 및 테스트 완료

#### 에러 메시지
```
404: NOT_FOUND
Code: NOT_FOUND
ID: icn1::zj9z6-1763429926558-72605062a105
```

#### 근본 원인 분석
🔍 **라우팅 설정 오류**: `vercel.json`의 rewrites 설정이 `/oauth/*` 경로를 서버리스 함수로 라우팅

**문제 상황**:
1. 카카오 OAuth는 `https://aiports.org/oauth/kakao/callback`으로 리디렉션 (프론트엔드 라우트)
2. `vercel.json`이 `/oauth/*`를 서버리스 함수(`/api`)로 라우팅
3. 프론트엔드 라우터가 작동하지 않아 404 발생
4. `KakaoCallback.tsx` 컴포넌트가 로드되지 않음

**실제 OAuth 플로우**:
1. 사용자가 "Kakao로 계속하기" 클릭
2. 카카오 인증 페이지로 이동 (redirect_uri: `/oauth/kakao/callback`)
3. 카카오가 GET 요청으로 `/oauth/kakao/callback?code=xxx&state=yyy` 리디렉션
4. **프론트엔드 라우터**가 `KakaoCallback` 컴포넌트 로드 (이 부분이 막혀있었음!)
5. 컴포넌트가 서버의 `/api/auth/kakao/callback`로 POST 요청
6. 서버가 토큰 교환 후 응답

#### 해결 방법
1. **vercel.json 수정** - `/oauth/*`, `/auth/*` rewrite 제거
   ```json
   "rewrites": [
     {
       "source": "/api/:path*",
       "destination": "/api"
     }
   ]
   ```

2. **라우팅 구조 명확화**
   - `/api/*` → 서버리스 함수 (백엔드 API)
   - `/oauth/*` → 프론트엔드 SPA 라우트
   - 다른 모든 경로 → 프론트엔드 SPA 라우트

3. **Production 배포**
   ```bash
   vercel --prod
   # 배포 URL: https://aimix-5otbh4bpa-chanwoos-projects-bd61ed6a.vercel.app
   ```

4. **테스트 완료**
   - ✅ 카카오 로그인 페이지로 정상 리디렉션
   - ✅ OAuth callback 경로 정상 작동
   - ✅ 프론트엔드 라우터 정상 동작

### Issue #3: 크레딧 차감 실패 에러 - ✅ **해결 완료**
**발생일**: 2025-11-18 11:00
**해결일**: 2025-11-18 11:15
**환경**: 운영 환경 (Production)
**상태**: ✅ **수정 완료** - 데이터베이스 migration 실행 완료, 사용자 테스트 필요

#### 에러 메시지
```
Error: Failed to deduct credits
    at ps (ai.ts:43:11)
    at async b (SajuPage.tsx:51:24)
```

#### 근본 원인 분석
🔍 **데이터베이스 함수 누락**: PostgreSQL `deduct_credits` 함수가 production 데이터베이스에 생성되지 않음

**문제 상황**:
1. 사용자가 사주팔자 서비스 시도
2. 서버: `server/src/middleware/credits.ts:51`에서 `supabase.rpc('deduct_credits', ...)` 호출
3. 데이터베이스에 `deduct_credits` 함수가 존재하지 않음
4. PostgreSQL 에러 발생 → 500 Internal Server Error
5. 프론트엔드에서 "Failed to deduct credits" 표시

**함수 목적**:
- Atomic credit deduction (원자적 크레딧 차감)
- Race condition 방지
- Row-level locking으로 동시성 문제 해결
- 크레딧 부족 시 자동 실패 (credits >= p_amount 조건)

#### 해결 방법
1. **Migration SQL 확인**
   - 파일: `server/migrations/003_atomic_credit_deduction.sql`
   - 함수 생성 SQL 존재 확인

2. **Supabase SQL Editor에서 실행** ✅
   ```sql
   CREATE OR REPLACE FUNCTION deduct_credits(
     p_user_id UUID,
     p_amount INTEGER
   )
   RETURNS TABLE (
     id UUID,
     email TEXT,
     username TEXT,
     credits INTEGER,
     email_verified BOOLEAN,
     provider TEXT,
     profile_image_url TEXT,
     created_at TIMESTAMP WITH TIME ZONE,
     updated_at TIMESTAMP WITH TIME ZONE
   ) AS $$
   BEGIN
     -- Atomically check and deduct credits in a single operation
     RETURN QUERY
     UPDATE users
     SET credits = credits - p_amount,
         updated_at = NOW()
     WHERE users.id = p_user_id
       AND users.credits >= p_amount  -- Atomic check
     RETURNING
       users.id,
       users.email,
       users.username,
       users.credits,
       users.email_verified,
       users.provider,
       users.profile_image_url,
       users.created_at,
       users.updated_at;
   END;
   $$ LANGUAGE plpgsql;
   ```

3. **실행 결과**
   - ✅ Success. No rows returned (함수 생성 완료)
   - 함수가 production 데이터베이스에 정상 생성됨

4. **테스트 필요**
   - [ ] 사주팔자 서비스 크레딧 차감 테스트
   - [ ] 얼굴 분석 서비스 크레딧 차감 테스트
   - [ ] 꿈 해몽 서비스 크레딧 차감 테스트
   - [ ] 이야기 생성 서비스 크레딧 차감 테스트
   - [ ] 크레딧 부족 시 에러 처리 확인

### Issue #4: Big Five & Stress 테스트 구현 및 버그 수정 - ✅ **완료**
**작업일**: 2025-11-18 18:00
**환경**: 전체 (개발 + 운영)
**상태**: ✅ **구현 및 배포 완료**

#### 구현 내용
🎯 **엔터테인먼트 카테고리 확장**: 성격 분석 서비스 2개 추가

**1. Big Five 성격 테스트** (30 크레딧)
   - 25개 질문 (OCEAN 모델: 개방성, 성실성, 외향성, 친화성, 신경성)
   - 긍정/부정 질문 방향성 점수 계산
   - AI 분석: 성격 특성별 강점/어려움, 커리어 추천, 대인관계 조언
   - 경로: `/services/bigfive-test`

**2. 스트레스 지수 측정** (25 크레딧)
   - 20개 질문 (4개 카테고리: 업무/커리어, 대인관계, 건강, 일상생활)
   - 전체 스트레스 수준 % 계산 + 카테고리별 점수
   - 색상 코딩 (빨강/주황/노랑/초록)
   - AI 분석: 스트레스 관리 전략, 이완 기법, 생활습관 개선
   - 경로: `/services/stress-test`

#### 버그 수정
🐛 **TypeScript 컴파일 오류**
1. **문제**: `req.user.id` 타입 오류 (ai.ts, results.ts)
   - **원인**: JWT decode에서 `userId` 속성 사용하는데 `id`로 접근
   - **해결**: `req.user.id` → `req.user.userId` 변경 (11곳)

2. **문제**: `openAIClient is not defined` (openai.ts)
   - **원인**: 변수명 불일치
   - **해결**: `openAIClient` → `client` 변경

3. **문제**: `parseJSON is not defined` (openai.ts)
   - **원인**: 메서드 호출 방식 오류
   - **해결**: `parseJSON()` → `client.parseJSON()` 변경

4. **문제**: Big Five/Stress 테스트에서 `client.generateText()` 메서드 없음
   - **원인**: 존재하지 않는 메서드 사용
   - **해결**: `client.chat()` 메서드로 변경

5. **문제**: Gemini `responseModalities` 타입 오류
   - **원인**: TypeScript 타입 정의 미지원
   - **해결**: `as any` 타입 assertion 추가

6. **문제**: `imageData.inlineData` undefined 가능성
   - **해결**: null check 추가

🐛 **런타임 오류**
1. **문제**: "require is not defined" 브라우저 오류
   - **원인**: ES 모듈 환경에서 `require()` 사용
   - **해결**:
     - `bigFiveQuestions`, `stressQuestions` top-level import 추가
     - `calculateBigFiveScores()`, `calculateStressScores()` 함수에서 `require()` 제거

#### 커밋 이력
- `ecc46f8`: feat: Add Big 5 and Stress tests to personality assessment
- `bf75ed5`: feat: Add temporary admin route for credit management
- `6d7ce56`: fix: Fix TypeScript compilation errors
- `b63fed9`: fix: Replace require() with ES module imports for Big Five and Stress tests

#### 배포 완료
- ✅ 최종 배포: `https://aimix-e8co3xkvj-chanwoos-projects-bd61ed6a.vercel.app`
- ✅ TypeScript 컴파일: 오류 없음
- ✅ 빌드 성공: Client 472.59 kB
- ✅ 상태: Ready

---

## 🔐 환경 변수 관리

### 환경별 설정 파일

#### Client
```bash
.env                    # 로컬 개발 기본값 (git 추적)
.env.local              # 로컬 개발 오버라이드 (gitignored)
.env.production.local   # 프로덕션 로컬 테스트용
.env.vercel.production  # Vercel 프로덕션 자동 생성
.env.example            # 예제 파일 (git 추적)
```

#### Server
```bash
.env                    # 로컬 개발 + 프로덕션 설정
.env.example            # 예제 파일 (git 추적)
```

### 주요 환경 변수

#### Client (프론트엔드)
```bash
# API 서버 URL
VITE_API_URL=http://localhost:3000                    # 로컬
VITE_API_URL=https://server-XXX.vercel.app            # 프로덕션 (임시)
VITE_API_URL=https://aimix.vercel.app/api             # 프로덕션 (통합 후)

# Supabase
VITE_SUPABASE_URL=https://ssmrlqzbwigzwtlpjsiz.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...

# Kakao OAuth
VITE_KAKAO_JS_KEY=9e0a475379aaea1b331087df8ab03780
```

#### Server (백엔드)
```bash
# 데이터베이스
DATABASE_URL=postgresql://...
SUPABASE_URL=https://ssmrlqzbwigzwtlpjsiz.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGc...

# 인증
JWT_SECRET=your-secret-key

# Kakao OAuth
KAKAO_REST_API_KEY=your-kakao-rest-api-key
KAKAO_REDIRECT_URI=http://localhost:5173/oauth/kakao/callback  # 로컬
KAKAO_REDIRECT_URI=https://aimix.vercel.app/oauth/kakao/callback  # 프로덕션

# AI APIs
GEMINI_API_KEY=AIzaSy...
OPENAI_API_KEY=sk-proj-...

# Client URL (CORS)
CLIENT_URL=http://localhost:5173                      # 로컬
CLIENT_URL=https://aimix.vercel.app                   # 프로덕션
```

### 환경 변수 설정 가이드

#### Vercel 대시보드에서 설정
1. https://vercel.com/dashboard 접속
2. 프로젝트 선택 (`aimix`)
3. **Settings** → **Environment Variables**
4. 각 환경별로 설정:
   - `Production`: 프로덕션 환경
   - `Preview`: PR 미리보기
   - `Development`: 개발 환경

#### Vercel CLI로 설정
```bash
# 환경 변수 추가
vercel env add VITE_API_URL production
vercel env add KAKAO_REST_API_KEY production

# 환경 변수 조회
vercel env ls

# 환경 변수 제거
vercel env rm VITE_API_URL production
```

---

## 💻 개발 워크플로우

### 로컬 개발 환경 설정

#### 1. 저장소 클론
```bash
git clone https://github.com/chchan234/aimix.git
cd aimix
```

#### 2. 의존성 설치
```bash
# 루트에서 모든 workspace 설치
npm install
```

#### 3. 환경 변수 설정
```bash
# Client
cp client/.env.example client/.env.local
# 필요한 값 수정

# Server
cp server/.env.example server/.env
# 필요한 값 수정 (DATABASE_URL, JWT_SECRET 등)
```

#### 4. 개발 서버 실행

**Option 1: 동시 실행 (권장)**
```bash
# 루트에서 실행 - client와 server 동시 시작
npm run dev
```

**Option 2: 개별 실행**
```bash
# Terminal 1 - Client
npm run dev:client

# Terminal 2 - Server
npm run dev:server
```

**Option 3: 각 디렉토리에서 실행**
```bash
# Terminal 1
cd client
npm run dev

# Terminal 2
cd server
npm run dev
```

#### 5. 접속 확인
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

### 빌드 및 배포

#### 로컬 빌드 테스트
```bash
# 전체 빌드
npm run build

# 개별 빌드
npm run build:client
npm run build:server
```

#### Vercel 배포
```bash
# 프리뷰 배포
vercel

# 프로덕션 배포
vercel --prod
```

### Git 워크플로우

#### 브랜치 전략
```bash
main        # 프로덕션
develop     # 개발 (통합)
feature/*   # 기능 개발
fix/*       # 버그 수정
```

#### 커밋 메시지 규칙
```bash
feat: 새로운 기능 추가
fix: 버그 수정
docs: 문서 수정
style: 코드 포맷팅
refactor: 코드 리팩토링
test: 테스트 코드
chore: 빌드 설정 등
```

---

## 📝 앞으로 해야 할 일

### 🚨 긴급 (High Priority)

#### 1. ✅ 모든 Vercel 환경 변수 수정 - **완료**
**소요 시간**: 약 15분
**완료일**: 2025-01-18 15:00

**작업 순서**:
- [x] **Step 1**: Vercel 대시보드 접속
- [x] **Step 2**: Production 환경 변수 수정 (우선순위 1)
  - [x] `VITE_API_URL` - 개행 제거 (Playwright 사용)
  - [x] `KAKAO_REST_API_KEY` - 개행 제거 (CLI 사용)
- [x] **Step 3**: Production 환경 변수 수정 (우선순위 2)
  - [x] `DATABASE_URL` - 개행 제거
  - [x] `SUPABASE_URL` - 개행 제거
  - [x] `SUPABASE_ANON_KEY` - 개행 제거
  - [x] `SUPABASE_SERVICE_KEY` - 개행 제거
  - [x] `JWT_SECRET` - 개행 제거
  - [x] `CLIENT_URL` - 개행 제거 + 값 변경 (`https://aimix.vercel.app`)
- [x] **Step 4**: Production 환경 변수 수정 (우선순위 3)
  - [x] `SENDGRID_API_KEY` - 개행 제거
  - [x] `EMAIL_FROM` - 개행 제거
  - [x] `PORT` - 개행 제거
- [ ] **Step 5**: Preview & Development 환경도 동일하게 수정 (선택적)

📖 **상세 가이드**: [`VERCEL_ENV_FIX_GUIDE.md`](./VERCEL_ENV_FIX_GUIDE.md)

#### 2. ✅ 재배포 - **완료**
- [x] Production 재배포: `vercel --prod`
- [x] 배포 완료 (배포 ID: D9j8PQS55WKuat2heSyaubAgRwZk)
- [ ] 로그인 기능 테스트 (사용자 테스트 필요)
  - [ ] 이메일 로그인
  - [ ] 카카오 로그인
- [ ] API 호출 정상 작동 확인
- [ ] 데이터베이스 연결 확인

### 🔧 기능 개선 (Medium Priority)

#### 3. 프로젝트 통합 완료
- [ ] **client와 server 별도 Vercel 프로젝트 정리**
  - [ ] 기존 `server` Vercel 프로젝트 삭제 여부 결정
  - [ ] 단일 `aimix` 프로젝트로 통합 배포 설정
- [ ] **Vercel 배포 설정 통합**
  - [ ] 루트 `vercel.json` 작성 (client + server 동시 배포)
  - [ ] 또는 Monorepo 배포 전략 선택
- [ ] **환경 변수 통합 관리**
  - [ ] Vercel 대시보드에서 `aimix` 프로젝트 환경 변수 설정
  - [ ] Client와 Server 환경 변수 모두 설정

### 🔧 기능 개선 (Medium Priority)

#### 3. 환경 변수 관리 개선
- [ ] `.env.example` 파일 최신화
- [ ] 환경 변수 검증 스크립트 작성
- [ ] 민감 정보 보안 강화 (Vercel만 사용, 로컬 파일 제거)

#### 4. 배포 자동화
- [ ] GitHub Actions CI/CD 파이프라인 구축
  - [ ] 자동 테스트
  - [ ] 자동 빌드
  - [ ] Vercel 자동 배포
- [ ] PR 프리뷰 배포 설정

#### 5. 문서화
- [ ] README.md 작성
- [ ] API 문서화 (Swagger/OpenAPI)
- [ ] 개발자 가이드 작성
- [ ] 배포 가이드 작성

### 📚 기술 부채 (Low Priority)

#### 6. 코드 품질 개선
- [ ] TypeScript 타입 오류 수정
- [ ] ESLint/Prettier 설정 통일
- [ ] 테스트 코드 작성 (Unit, Integration, E2E)
- [ ] 코드 리뷰 프로세스 정립

#### 7. 성능 최적화
- [ ] 프론트엔드 번들 크기 최적화
- [ ] 이미지 최적화
- [ ] API 응답 시간 개선
- [ ] 캐싱 전략 구현

#### 8. 모니터링 및 로깅
- [ ] 에러 추적 시스템 (Sentry 등)
- [ ] 성능 모니터링 (Vercel Analytics)
- [ ] 로그 수집 및 분석
- [ ] 알림 시스템 구축

---

## ✅ 체크리스트

### 배포 전 체크리스트
- [ ] 모든 환경 변수 설정 완료
- [ ] 로컬 빌드 성공
- [ ] TypeScript 컴파일 에러 없음
- [ ] 테스트 통과
- [ ] 보안 취약점 검사
- [ ] 성능 테스트
- [ ] CORS 설정 확인
- [ ] API 엔드포인트 정상 작동
- [ ] 인증 플로우 정상 작동

### 운영 환경 모니터링 체크리스트
- [ ] API 응답 시간 정상
- [ ] 에러율 임계값 이하
- [ ] 데이터베이스 연결 정상
- [ ] 외부 API (Gemini, OpenAI) 정상
- [ ] 카카오 OAuth 정상
- [ ] 이메일 전송 정상
- [ ] 크레딧 시스템 정상

### 보안 체크리스트
- [ ] JWT Secret 안전하게 관리
- [ ] API 키 노출 방지
- [ ] CORS 적절히 설정
- [ ] Rate Limiting 적용
- [ ] SQL Injection 방어
- [ ] XSS 방어
- [ ] CSRF 방어 (OAuth state)
- [ ] HTTPS 강제 적용

---

## 🔗 관련 문서

- [플랫폼 아키텍처](./PLATFORM_ARCHITECTURE.md)
- [기술 스택 상세](./TECH_STACK.md)
- [보안 가이드](./SECURITY.md)

---

## 📞 문제 발생 시 대응

### 1. 로그 확인
```bash
# Vercel 로그 확인
vercel logs <deployment-url>

# 로컬 서버 로그
npm run dev:server  # 콘솔에 로그 출력
```

### 2. 환경 변수 확인
```bash
# Vercel 환경 변수 조회
vercel env ls

# 로컬 환경 변수 테스트
node -e "console.log(process.env.VITE_API_URL)"
```

### 3. 배포 상태 확인
```bash
# Vercel 배포 목록
vercel ls

# 특정 배포 상세 정보
vercel inspect <deployment-url>
```

### 4. 롤백
```bash
# Vercel에서 이전 배포로 롤백
# 대시보드에서 이전 배포의 "Promote to Production" 클릭
```

---

## 📅 변경 이력

| 날짜 | 버전 | 변경 사항 | 작성자 |
|------|------|-----------|--------|
| 2025-01-18 | 1.0.0 | 최초 문서 작성, 프로젝트 현황 정리 | Claude |
| 2025-01-18 | 1.0.1 | 로그인 에러 원인 파악 및 로컬 수정 완료 | Claude |
| 2025-01-18 | 1.1.0 | 🚨 심각한 문제 발견: 모든 Vercel 환경 변수에 \n 포함 확인 | Claude |
| 2025-01-18 | 1.1.1 | VERCEL_ENV_FIX_GUIDE.md 생성, 수정 가이드 작성 | Claude |
| 2025-01-18 | 1.1.2 | fix-vercel-env.sh 스크립트 작성 | Claude |
| 2025-01-18 | 1.2.0 | 프로젝트 상황 문서 대폭 업데이트 (이슈, TODO, 우선순위) | Claude |
| 2025-01-18 | 2.0.0 | ✅ 환경 변수 수정 완료, Production 재배포 완료 (배포 ID: D9j8PQS55WKuat2heSyaubAgRwZk) | Claude |
| 2025-11-18 | 2.1.0 | ✅ Big Five 성격 테스트 구현 완료 (30 크레딧, 25 질문) | Claude |
| 2025-11-18 | 2.1.1 | ✅ 스트레스 지수 측정 구현 완료 (25 크레딧, 20 질문) | Claude |
| 2025-11-18 | 2.2.0 | 🐛 TypeScript 컴파일 오류 6건 수정 (req.user.userId, client 메서드) | Claude |
| 2025-11-18 | 2.2.1 | 🐛 런타임 require() 오류 수정 (ES 모듈 import로 변경) | Claude |
| 2025-11-18 | 2.3.0 | ✅ Production 배포 완료 (커밋: b63fed9, 배포: aimix-e8co3xkvj) | Claude |
| 2025-11-18 | 2.4.0 | 📝 SERVICES_STATUS.md 업데이트 (구현 완료: 12개/31개, 38.7%) | Claude |

---

## 📌 다음 작업

**최근 완료**: ✅ Big Five & Stress 테스트 구현 및 배포 완료 (2025-11-18)
**현재 상태**: 🟢 정상 운영 중 - 12개 서비스 제공
**다음 작업**: 🎨 이미지 편집 카테고리 구현 시작
**담당자**: 개발팀

**신규 서비스 테스트 필요**:
- [ ] Big Five 성격 테스트 사용자 테스트
- [ ] 스트레스 지수 측정 사용자 테스트
- [ ] 크레딧 차감 정상 작동 확인
- [ ] 결과 저장 및 조회 테스트

**Production 배포 정보**:
- 배포 URL: https://aimix-e8co3xkvj-chanwoos-projects-bd61ed6a.vercel.app
- 배포 커밋: b63fed9
- 배포일시: 2025-11-18 18:00
- 상태: ✅ Ready

**구현 완료 서비스** (12개):
- 🔮 운세/점술: 8개 (사주, 관상, 수상, 별자리, 띠, 연애궁합, 이름궁합, 결혼궁합)
- 🎮 엔터테인먼트: 4개 (MBTI, 에니어그램, Big Five, 스트레스)

**관련 문서**:
- 📊 [서비스 현황](./SERVICES_STATUS.md)
- 🏗️ [플랫폼 아키텍처](./PLATFORM_ARCHITECTURE.md)
- 📚 [기술 스택](./TECH_STACK.md)

