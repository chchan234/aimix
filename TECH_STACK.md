# 기술 스택 (Tech Stack)

Face Reading AI 프로젝트에서 사용한 기술 스택 목록입니다.

---

## 🎨 프론트엔드 (Frontend)

### 핵심 프레임워크
| 기술 | 버전 | 용도 |
|------|------|------|
| React | 18.3.1 | UI 라이브러리 |
| TypeScript | 5.6.3 | 타입 안정성 |
| Vite | 5.4.20 | 빌드 도구 및 개발 서버 |
| Wouter | 3.3.5 | 경량 라우팅 라이브러리 |

### 스타일링
| 기술 | 버전 | 용도 |
|------|------|------|
| Tailwind CSS | 3.4.17 | 유틸리티 CSS 프레임워크 |
| Tailwind Animate | 1.0.7 | CSS 애니메이션 |
| Framer Motion | 11.13.1 | 고급 애니메이션 및 인터랙션 |
| class-variance-authority | 0.7.1 | 조건부 스타일 관리 |
| tailwind-merge | 2.6.0 | Tailwind 클래스 병합 유틸리티 |

### UI 컴포넌트 라이브러리
**Radix UI** - 접근성 기반 헤드리스 UI 컴포넌트 (20+ 컴포넌트)
- Accordion, Alert Dialog, Avatar, Checkbox, Collapsible
- Context Menu, Dialog, Dropdown Menu, Hover Card
- Label, Menubar, Navigation Menu, Popover
- Progress, Radio Group, Scroll Area, Select
- Separator, Slider, Slot, Switch, Tabs
- Toast, Toggle, Toggle Group, Tooltip

**기타 UI 컴포넌트**
| 기술 | 버전 | 용도 |
|------|------|------|
| Lucide React | 0.453.0 | 아이콘 라이브러리 |
| Recharts | 2.15.2 | 차트 및 데이터 시각화 |
| Vaul | 1.1.2 | 드로어(Drawer) 컴포넌트 |
| cmdk | 1.1.1 | 커맨드 팔레트 |
| Embla Carousel | 8.6.0 | 캐러셀 컴포넌트 |
| React Day Picker | 8.10.1 | 날짜 선택기 |
| React Resizable Panels | 2.1.7 | 리사이즈 가능한 패널 |

### 폼 관리 및 검증
| 기술 | 버전 | 용도 |
|------|------|------|
| React Hook Form | 7.55.0 | 폼 상태 관리 |
| Zod | 3.24.2 | 스키마 기반 타입 검증 |
| @hookform/resolvers | 3.10.0 | Zod와 React Hook Form 통합 |
| zod-validation-error | 3.4.0 | Zod 에러 포맷팅 |
| input-otp | 1.4.2 | OTP 입력 컴포넌트 |

### 상태 관리 및 데이터 페칭
| 기술 | 버전 | 용도 |
|------|------|------|
| TanStack Query (React Query) | 5.60.5 | 서버 상태 관리 및 캐싱 |
| Supabase Client | 2.81.0 | Supabase와의 실시간 통신 |

### 국제화 (i18n)
| 기술 | 버전 | 용도 |
|------|------|------|
| i18next | 25.6.1 | 국제화 프레임워크 |
| react-i18next | 16.2.4 | React 바인딩 |

### 이미지 처리
| 기술 | 버전 | 용도 |
|------|------|------|
| browser-image-compression | 2.0.2 | 클라이언트 측 이미지 압축 |
| react-dropzone | 14.3.8 | 드래그앤드롭 파일 업로드 |
| html2canvas | 1.4.1 | DOM을 캔버스로 변환 (결과 공유) |

### 유틸리티
| 기술 | 버전 | 용도 |
|------|------|------|
| date-fns | 3.6.0 | 날짜 포맷팅 및 조작 |
| clsx | 2.1.1 | 조건부 클래스명 관리 |
| React Icons | 5.4.0 | 아이콘 컬렉션 |

---

## ⚙️ 백엔드 (Backend)

### 핵심 프레임워크
| 기술 | 버전 | 용도 |
|------|------|------|
| Express | 4.21.2 | Node.js 웹 프레임워크 |
| TypeScript | 5.6.3 | 타입 안정성 |
| tsx | 4.20.5 | TypeScript 실행 환경 (개발) |
| esbuild | 0.25.0 | 프로덕션 빌드 도구 |

### 데이터베이스
| 기술 | 버전 | 용도 |
|------|------|------|
| Neon Database | 0.10.4 | 서버리스 PostgreSQL |
| Drizzle ORM | 0.39.1 | TypeScript ORM |
| Drizzle Kit | 0.31.4 | 마이그레이션 도구 |
| drizzle-zod | 0.7.0 | Zod 스키마 생성 |

### 인증 및 세션
| 기술 | 버전 | 용도 |
|------|------|------|
| Passport.js | 0.7.0 | 인증 미들웨어 |
| passport-local | 1.0.0 | 로컬 인증 전략 |
| express-session | 1.18.1 | 세션 관리 |
| connect-pg-simple | 10.0.0 | PostgreSQL 세션 스토어 |
| memorystore | 1.6.7 | 메모리 기반 세션 스토어 |
| jsonwebtoken | 9.0.2 | JWT 토큰 생성 및 검증 |

### AI 및 외부 서비스
| 기술 | 버전 | 용도 |
|------|------|------|
| OpenAI SDK | 6.8.1 | GPT 기반 얼굴 분석 AI |
| Supabase | 2.81.0 | 백엔드 서비스 (DB, 스토리지, 인증) |

### 파일 업로드
| 기술 | 버전 | 용도 |
|------|------|------|
| Multer | 2.0.2 | 멀티파트 폼 데이터 처리 |

### 보안 및 미들웨어
| 기술 | 버전 | 용도 |
|------|------|------|
| CORS | 2.8.5 | Cross-Origin Resource Sharing |
| express-rate-limit | 8.2.1 | API 요청 속도 제한 |
| Zod | 3.24.2 | 서버 측 입력 검증 |

### 실시간 통신
| 기술 | 버전 | 용도 |
|------|------|------|
| ws | 8.18.0 | WebSocket 서버 |

---

## 🛠️ 개발 도구 (Development Tools)

### 빌드 및 개발 도구
| 기술 | 버전 | 용도 |
|------|------|------|
| Vite | 5.4.20 | 번들러 및 개발 서버 |
| @vitejs/plugin-react | 4.7.0 | React 지원 플러그인 |
| esbuild | 0.25.0 | 고속 JavaScript 번들러 |
| PostCSS | 8.4.47 | CSS 후처리기 |
| Autoprefixer | 10.4.20 | CSS 자동 벤더 프리픽스 |

### Vite 플러그인
| 플러그인 | 버전 | 용도 |
|---------|------|------|
| @replit/vite-plugin-cartographer | 0.4.2 | 코드 매핑 도구 |
| @replit/vite-plugin-dev-banner | 0.1.1 | 개발 배너 표시 |
| @replit/vite-plugin-runtime-error-modal | 0.0.3 | 런타임 에러 모달 |

### TypeScript 타입 정의
- @types/node
- @types/react
- @types/react-dom
- @types/express
- @types/express-session
- @types/cors
- @types/jsonwebtoken
- @types/multer
- @types/passport
- @types/passport-local
- @types/ws
- @types/connect-pg-simple

---

## 📦 배포 및 인프라 (Deployment & Infrastructure)

| 서비스 | 용도 |
|--------|------|
| Vercel | 통합 모노레포 배포 (프론트엔드 + 백엔드 API) |
| Supabase | PostgreSQL 데이터베이스 호스팅 |
| Supabase | 백엔드 서비스 (스토리지, 인증) |

### 모노레포 배포 구조
```
aiports.org/          → 클라이언트 (React + Vite)
aiports.org/api/*     → 백엔드 API (Express + TypeScript)
aiports.org/health    → 서버 헬스 체크
```

---

## 🎯 아키텍처 특징

### ✅ 풀스택 TypeScript
- 프론트엔드부터 백엔드까지 완전한 타입 안정성
- 타입 기반 API 통신으로 런타임 에러 최소화

### ✅ 통합 모노레포 아키텍처
- 단일 Vercel 프로젝트로 프론트엔드 + 백엔드 배포
- 클라이언트와 API가 동일 도메인 (CORS 불필요)
- Supabase PostgreSQL + Vercel 서버리스 함수
- 자동 스케일링 및 비용 효율적 운영

### ✅ 모던 빌드 시스템
- Vite + esbuild로 빠른 개발 경험 (HMR)
- 최적화된 프로덕션 빌드

### ✅ 컴포넌트 기반 UI
- Radix UI로 접근성(a11y) 보장
- Tailwind CSS로 일관된 디자인 시스템

### ✅ AI 통합
- OpenAI GPT-4 Vision 모델로 얼굴 분석
- 다층 신경망 기반 이미지 인식

### ✅ 다국어 지원
- i18next로 한국어/영어 지원
- 동적 언어 전환 가능

### ✅ 성능 최적화
- TanStack Query로 서버 상태 캐싱
- 이미지 압축 및 최적화
- 코드 스플리팅 및 레이지 로딩

### ✅ 보안
- Rate limiting으로 API 남용 방지
- Zod 스키마 검증으로 입력 보안
- CORS 정책 적용
- JWT 기반 인증

---

## 📊 프로젝트 통계

```
총 의존성: 90개
- 프로덕션 의존성: 76개
- 개발 의존성: 14개

주요 번들 크기:
- index.css: 76.21 KB (gzip: 12.34 KB)
- index.js: 1,127.11 KB (gzip: 328.85 KB)
- server: 46.9 KB
```

---

## 🔄 개발 워크플로우

```bash
# 개발 서버 실행
npm run dev

# TypeScript 타입 체크
npm run check

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start

# 데이터베이스 스키마 푸시
npm run db:push
```

---

**마지막 업데이트**: 2025-01-15
