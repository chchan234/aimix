# AIMIX 프로젝트 현황

> 최종 업데이트: 2025-11-19
> 상태: 운영 중

---

## 프로젝트 개요

**프로젝트명**: AIMIX (AI Platform)
**버전**: 1.0.0
**설명**: 통합 AI 플랫폼 서비스 (30개 AI 서비스 제공)

### 기술 스택
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript
- **Database**: Supabase (PostgreSQL)
- **배포**: Vercel (단일 모노레포)
- **인증**: JWT, Kakao OAuth
- **AI**: Google Gemini API, OpenAI API

자세한 내용: [`TECH_STACK.md`](./TECH_STACK.md)

---

## 배포 정보

### 배포 구조
**AIMIX 프로젝트 하나로 통합 배포** (client + server)

- **Production URL**: https://aiports.org
- **API 엔드포인트**: https://aiports.org/api

### 배포 명령
```bash
# 루트 디렉토리에서 실행
cd /Users/ichan-u/aimix && vercel --prod
```

### 주의사항
- client와 server를 별도로 배포하지 않음
- 항상 루트에서 통합 배포

---

## 프로젝트 구조

```
aimix/
├── client/              # 프론트엔드 (React + Vite)
│   ├── src/
│   │   ├── components/  # React 컴포넌트
│   │   ├── pages/       # 페이지 컴포넌트
│   │   └── services/    # API 서비스 레이어
│   └── vercel.json
│
├── server/              # 백엔드 (Express + TypeScript)
│   ├── src/
│   │   ├── routes/      # API 라우트
│   │   ├── services/    # 비즈니스 로직
│   │   └── middleware/  # Express 미들웨어
│   └── vercel.json
│
├── package.json         # 루트 패키지 (workspace 관리)
└── *.md                 # 문서 파일들
```

---

## 개발 워크플로우

### 로컬 개발
```bash
# 의존성 설치
npm install

# 개발 서버 실행 (client + server 동시)
npm run dev

# 개별 실행
npm run dev:client
npm run dev:server
```

### 접속 URL
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

### 빌드 및 배포
```bash
# 전체 빌드
npm run build

# Vercel 배포
vercel --prod
```

---

## 환경 변수

### Client (프론트엔드)
```bash
VITE_API_URL=https://aiports.org/api
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_KAKAO_JS_KEY=...
```

### Server (백엔드)
```bash
DATABASE_URL=...
SUPABASE_URL=...
SUPABASE_SERVICE_KEY=...
JWT_SECRET=...
KAKAO_REST_API_KEY=...
GEMINI_API_KEY=...
OPENAI_API_KEY=...
CLIENT_URL=https://aiports.org
```

---

## 관련 문서

- [서비스 현황](./SERVICES_STATUS.md) - 30개 서비스 목록
- [기술 스택](./TECH_STACK.md) - 상세 기술 스택
- [플랫폼 아키텍처](./PLATFORM_ARCHITECTURE.md) - 시스템 구조
- [보안 가이드](./SECURITY.md) - 보안 설정
- [서비스 UI 템플릿](./SERVICE_UI_TEMPLATE.md) - UI 개발 가이드
- [국제화 가이드](./client/I18N_GUIDE.md) - 다국어 설정

---

## 현재 상태

- 30개 AI 서비스 제공
- 운세/점술 9개, 성격 분석 5개, 이미지 편집 13개, 건강 3개
- Google Gemini + OpenAI 통합
- Vercel 서버리스 배포

---

## 최근 업데이트 (2025-11-19)

### UI/UX 개선
- **로그인 페이지**: 라이트/다크 모드 테마 지원
- **헤더**: 고정 헤더에 불투명 배경 적용 (스크롤 시 콘텐츠 겹침 방지)
- **홈페이지 서비스 카드**: 모든 서비스에 개별 페이지 링크 추가
- **카테고리 페이지**: 서비스 카드 정사각형 비율로 변경 (FortunePage, ImagePage, EntertainmentPage, HealthPage)
- **로그인 체크**: 서비스 시작 시 로그인 상태 확인 및 알럿 표시 (29개 서비스 페이지)
