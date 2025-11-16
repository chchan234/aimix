# AI 엔터테인먼트 통합 플랫폼 아키텍처

## 📋 프로젝트 개요

### 비전
다양한 AI 서비스를 하나의 플랫폼에서 제공하는 웹 애플리케이션으로, 사용자가 재미있고 유용한 여러 AI 기능을 쉽게 이용할 수 있도록 통합된 경험을 제공합니다.

### 핵심 가치
- **통합된 경험**: 한 계정으로 모든 AI 서비스 이용
- **간편한 결제**: 크레딧 시스템으로 유연한 이용
- **개인화**: 사용자별 맞춤 서비스 및 히스토리 관리
- **확장성**: 새로운 AI 서비스를 쉽게 추가 가능한 구조

### 핵심 전략
- **프롬프트 엔지니어링 기반**: 모든 서비스는 전문화된 프롬프트로 구현
- **단순한 AI 스택**: 2개의 AI 모델만 사용 (GPT-4o mini, Gemini 2.5 Flash Image)
- **빠른 확장**: 코드 변경 없이 DB에서 프롬프트 관리
- **지속적인 개선**: A/B 테스팅으로 프롬프트 품질 향상

---

## 🎯 서비스 카테고리

### 1. 운세/점술 서비스 (Fortune & Divination)

#### 1.1 AI 관상 분석 (현재 구현됨)
- **개인 관상 분석**: 얼굴 특징 기반 성격 및 운세 분석
- **커플 궁합 분석**: 두 사람의 관상 기반 궁합도 측정
- **가족 관상**: 가족 구성원 간 관계 분석
- **비즈니스 관상**: 비즈니스 파트너십 분석

**구현 방식**:
- AI 모델: GPT-4o mini
- 입력: 얼굴 이미지 (Vision API)
- 프롬프트: 30년 경력 관상가 페르소나 + 얼굴 특징 분석
- 출력: JSON (구조화된 관상 리포트)

#### 1.2 AI 사주팔자
- **사주 기본 분석**: 생년월일시 기반 사주 풀이
- **운세 예측**: 연/월/일 운세 및 길흉화복
- **궁합 분석**: 연인/부부 궁합 측정
- **대운/세운**: 10년 대운 및 연간 세운 분석

**구현 방식**:
- AI 모델: GPT-4o mini
- 입력: 생년월일시 + 음양오행 계산 결과
- 프롬프트: 역학 전문가 페르소나 + 천간지지 해석
- 출력: JSON (사주 풀이, 운세, 조언)

#### 1.3 AI 타로 카드
- **오늘의 운세**: 일일 타로 카드 뽑기
- **연애 운세**: 연애/결혼 관련 타로
- **직업 운세**: 진로/사업 관련 타로
- **스프레드 리딩**: 3장, 5장, 10장 스프레드

**구현 방식**:
- AI 모델: GPT-4o mini
- 입력: 뽑힌 카드 정보 + 질문 주제
- 프롬프트: 직관력 뛰어난 타로 리더 페르소나 + 카드 의미
- 출력: JSON (카드별 해석, 종합 메시지)
- 데이터: 78장 타로 카드 DB (메이저/마이너 아르카나)

#### 1.4 AI 꿈 해몽
- **꿈 내용 입력 및 분석**
- **꿈 키워드 추출 및 의미 해석**
- **길몽/흉몽 판단**
- **관련 운세 조언**

**구현 방식**:
- AI 모델: GPT-4o mini
- 입력: 꿈 내용 텍스트
- 프롬프트: 꿈 해몽 전문가 페르소나 + 상징 분석
- 출력: JSON (키워드, 의미, 길흉 판단)

#### 1.5 AI 토정비결
- **연간 운세 예측**
- **월별 상세 운세**
- **재물운, 건강운, 애정운 분석**

**구현 방식**:
- AI 모델: GPT-4o mini
- 입력: 생년월일 + 64괘 계산 결과
- 프롬프트: 토정비결 전문가 페르소나 + 현대적 해석
- 출력: JSON (연/월 운세, 분야별 운)

---

### 2. 이미지 서비스 (Image Services)

#### 2.1 AI 사진 합성
- **시대별 사진**: 과거(조선시대, 80년대 등) 또는 미래 스타일
- **성별 변환**: 이성으로 변환된 모습
- **나이 변환**: 어렸을 때/늙었을 때 모습
- **헤어스타일 변경**: 다양한 헤어스타일 시뮬레이션

**구현 방식**:
- AI 모델: Gemini 2.5 Flash Image (Nano Banana)
- 입력: 원본 이미지 + 변환 스타일 프롬프트
- 프롬프트: 자연어 명령 (예: "이 사람을 20년 후 모습으로 변환해줘")
- 출력: 변환된 이미지 URL

#### 2.2 AI 프로필 사진 생성
- **증명사진**: 여권, 이력서용 증명사진
- **SNS 프로필**: Instagram, LinkedIn 스타일
- **캐릭터화**: 애니메이션/웹툰 스타일 변환
- **아바타 생성**: 3D 아바타 생성

**구현 방식**:
- AI 모델: Gemini 2.5 Flash Image (이미지 편집 모드)
- 입력: 원본 얼굴 사진
- 프롬프트: 스타일 지정 (예: "프로필 사진으로 변환", "애니메이션 스타일로")
- 특징: 캐릭터 일관성 유지, 배경 자동 제거

#### 2.3 AI 이미지 생성
- **텍스트-이미지**: 프롬프트 기반 이미지 생성
- **이미지 확장**: 기존 이미지 확장 (Outpainting)
- **이미지 편집**: AI 기반 inpainting
- **컨셉 아트**: 캐릭터, 배경, 제품 디자인

**구현 방식**:
- AI 모델: Gemini 2.5 Flash Image (생성 모드)
- 입력: 텍스트 프롬프트 또는 원본 이미지 + 편집 명령
- 프롬프트: 자연어 명령 (예: "판타지 숲 배경에 성이 있는 풍경")
- 출력: 생성된 이미지 URL (최대 1024x1024)

#### 2.4 AI 커플 합성
- **미래 아기 얼굴**: 두 사람의 아기 모습 예측
- **커플 포스터**: 로맨틱 커플 사진 생성
- **결혼 사진**: 웨딩 컨셉 사진 생성

**구현 방식**:
- AI 모델: Gemini 2.5 Flash Image (이미지 병합)
- 입력: 두 사람의 얼굴 이미지
- 프롬프트: 자연어 명령 (예: "두 사람의 특징을 섞어 아기 얼굴 생성")
- 특징: 멀티 이미지 이해 및 병합 능력

---

### 3. 엔터테인먼트 서비스 (Entertainment)

#### 3.1 AI 심리 테스트
- **MBTI 성향 분석**: AI 기반 심화 MBTI 테스트
- **애착 유형 테스트**: 연애 스타일 분석
- **직업 적성 검사**: 진로 및 적성 분석
- **우울/불안 자가 진단**: 정신 건강 체크

**구현 방식**:
- AI 모델: GPT-4o mini
- 입력: 질문-답변 데이터
- 프롬프트: 심리학 전문가 페르소나 + 답변 패턴 분석
- 출력: JSON (성향, 특징, 조언)

#### 3.2 AI 성격 분석
- **필체 분석**: 손글씨 이미지 업로드 분석
- **대화 스타일 분석**: 채팅 패턴 분석
- **텍스트 감정 분석**: 작성한 글 기반 성격 분석

**구현 방식**:
- AI 모델: GPT-4o mini (Vision 또는 Text)
- 입력: 필체 이미지 또는 텍스트
- 프롬프트: 필적학 전문가 또는 심리 분석가 페르소나
- 출력: JSON (성격 특징, 장단점, 조언)

#### 3.3 AI 매칭 서비스
- **이상형 찾기**: 선호도 기반 매칭
- **친구 궁합**: 성격 기반 친구 추천
- **비즈니스 파트너**: 협업 파트너 매칭
- **취미 친구**: 관심사 기반 매칭

**구현 방식**:
- AI 모델: GPT-4o mini
- 입력: 사용자 프로필 + 선호도
- 프롬프트: 매칭 전문가 페르소나 + 궁합 분석
- 출력: JSON (매칭 점수, 이유, 조언)

#### 3.4 AI 게임
- **AI와 대화**: 캐릭터 AI 챗봇
- **AI 스무고개**: AI와 추리 게임
- **이야기 생성기**: 인터랙티브 스토리텔링
- **그림 그리기 게임**: AI와 그림 대결

**구현 방식**:
- AI 모델: GPT-4o mini (텍스트), Gemini 2.5 Flash Image (이미지)
- 입력: 게임 진행 상황 + 사용자 입력
- 프롬프트: 게임별 특화된 프롬프트
- 출력: 게임 응답 (텍스트 또는 이미지)

---

### 4. 실용 서비스 (Utility Services)

#### 4.1 AI 텍스트 생성
- **이메일 작성**: 비즈니스/개인 이메일 자동 생성
- **SNS 캡션**: Instagram, 블로그 포스트 작성
- **광고 문구**: 마케팅 카피라이팅
- **자기소개서**: 입사 지원서 작성 도움

**구현 방식**:
- AI 모델: GPT-4o mini
- 입력: 작성 목적 + 키워드
- 프롬프트: 전문 작가/카피라이터 페르소나
- 출력: 생성된 텍스트

#### 4.2 AI 번역
- **다국어 번역**: 100개 이상 언어 지원
- **문서 번역**: 긴 텍스트 번역
- **실시간 대화 번역**: 채팅 번역
- **전문 번역**: 법률, 의료, 기술 문서

**구현 방식**:
- AI 모델: GPT-4o mini
- 입력: 원문 텍스트 + 언어 쌍
- 프롬프트: 전문 번역가 페르소나 + 맥락 이해
- 출력: 번역된 텍스트

#### 4.3 AI 요약
- **텍스트 요약**: 긴 글을 짧게 요약
- **뉴스 요약**: 여러 기사를 한 번에 요약
- **회의록 정리**: 회의 내용 자동 정리

**구현 방식**:
- AI 모델: GPT-4o mini
- 입력: 원문 텍스트
- 프롬프트: 핵심 추출 전문가 페르소나
- 출력: 요약 텍스트 (bullet points)

#### 4.4 AI 음성 서비스 (향후 확장)
- **TTS (Text-to-Speech)**: 텍스트를 음성으로
- **STT (Speech-to-Text)**: 음성을 텍스트로

---

## 🏗️ 시스템 아키텍처

### 전체 구조 (High-Level Architecture)

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Web App    │  │  Mobile App  │  │   Admin      │      │
│  │   (React)    │  │ (React Native)│  │   Panel      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                      API Gateway Layer                       │
│                  (Express.js + TypeScript)                   │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Authentication │ Rate Limiting │ Request Logging     │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                 ⭐ Prompt Engine Layer ⭐                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Template Manager  │  Variable Injector  │  Validator│  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   Fortune    │  │    Image     │  │    Utility   │    │
│  │  Templates   │  │  Templates   │  │  Templates   │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                 ⭐ AI Service Layer ⭐                       │
│  ┌─────────────────────────┐  ┌─────────────────────────┐  │
│  │      GPT-4o mini        │  │  Gemini 2.5 Flash Image │  │
│  │  (텍스트/분석 서비스)    │  │  (Nano Banana 🍌)      │  │
│  │  - 관상, 사주, 타로     │  │  - 사진 합성/편집      │  │
│  │  - 심리테스트, 성격분석 │  │  - 프로필 생성         │  │
│  │  - 텍스트 생성, 번역    │  │  - 이미지 생성         │  │
│  └─────────────────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                      Data Layer                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ PostgreSQL   │  │    Redis     │  │  Supabase    │      │
│  │   (Neon)     │  │   Cache +    │  │   Storage    │      │
│  │              │  │   Session    │  │              │      │
│  │ - Users      │  │              │  │ - Images     │      │
│  │ - Prompts ⭐ │  │ - Prompt     │  │ - Files      │      │
│  │ - Results    │  │   Cache      │  │              │      │
│  │ - Credits    │  │              │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### 핵심 차별점

#### ⭐ Prompt Engine 중심 아키텍처
```
기존: Service → AI API 직접 호출
변경: Service → Prompt Engine → AI API

장점:
1. 코드 변경 없이 프롬프트 수정 가능
2. A/B 테스팅 간편
3. 버전 관리 및 롤백 가능
4. 일관된 품질 관리
```

#### ⭐ 2개 AI 모델만 사용
```
텍스트/분석: GPT-4o mini (OpenAI)
이미지: Gemini 2.5 Flash Image (Google AI - Nano Banana 🍌)

장점:
1. 비용 효율 (DALL-E 3 대비 40% 저렴)
2. 관리 포인트 감소 (2개 AI만)
3. 자연어 편집 (직관적인 프롬프트)
4. 캐릭터 일관성 유지
```

---

## 🛠️ 상세 기술 스택

### 프론트엔드 (Frontend)

#### 핵심 프레임워크
```json
{
  "framework": "React 18.3+",
  "language": "TypeScript 5.6+",
  "build": "Vite 5.4+",
  "routing": "Wouter 3.3+ (현재) → React Router 6.x (확장)"
}
```

#### 상태 관리
```json
{
  "server-state": "TanStack Query v5",
  "client-state": "Zustand 4.x (추가 예정)",
  "form": "React Hook Form 7.x + Zod",
  "cache": "TanStack Query Cache"
}
```

#### UI/UX
```json
{
  "components": "Radix UI",
  "styling": "Tailwind CSS 3.4+",
  "animation": "Framer Motion 11.x",
  "charts": "Recharts 2.x",
  "icons": "Lucide React"
}
```

#### 국제화
```json
{
  "i18n": "i18next 25.x",
  "languages": ["ko", "en", "ja", "zh"]
}
```

---

### 백엔드 (Backend)

#### 핵심 프레임워크
```json
{
  "runtime": "Node.js 20.x LTS",
  "framework": "Express 4.x",
  "language": "TypeScript 5.6+",
  "build": "esbuild"
}
```

#### ⭐ Prompt Engine 구조
```typescript
/server
  /services
    /prompt-engine          # 핵심 엔진
      prompt-manager.ts     # 템플릿 관리
      prompt-renderer.ts    # 변수 치환
      ai-client.ts          # AI API 클라이언트

    /fortune                # 운세 서비스
      /face-reading
        templates/          # 프롬프트 템플릿
        service.ts          # 비즈니스 로직
      /saju
      /tarot
      /dream
      /tojeong

    /image                  # 이미지 서비스
      /synthesis
        templates/
        service.ts
      /generation
      /profile

    /entertainment          # 엔터테인먼트
      /psychology
      /personality
      /matching
      /games

    /utility                # 실용 서비스
      /text
      /translation
      /summary

  /middleware
    auth.ts                 # JWT 인증
    rate-limit.ts           # 요청 제한
    validation.ts           # Zod 검증

  /utils
    image-processor.ts      # 이미지 처리
    cache-manager.ts        # Redis 캐시
    logger.ts               # 구조화 로깅
```

---

## 🤖 AI 서비스 통합

### GPT-4o mini (OpenAI)

#### 사용 서비스
```typescript
const gptServices = [
  // 운세/점술
  'face-reading',      // 관상 분석
  'saju',              // 사주팔자
  'tarot',             // 타로
  'dream',             // 꿈해몽
  'tojeong',           // 토정비결

  // 엔터테인먼트
  'psychology-test',   // 심리테스트
  'personality',       // 성격분석
  'matching',          // 매칭
  'ai-chat',           // AI 대화

  // 실용
  'text-generation',   // 텍스트 생성
  'translation',       // 번역
  'summary'            // 요약
];
```

#### API 설정
```typescript
const openaiConfig = {
  model: 'gpt-4o-mini',
  pricing: {
    input: '$0.150 / 1M tokens',
    output: '$0.600 / 1M tokens'
  },
  capabilities: [
    'Text generation',
    'Image analysis (Vision)',
    'JSON mode',
    'Function calling'
  ],
  limits: {
    maxTokens: 16385,
    contextWindow: 128000
  }
};
```

---

### Gemini 2.5 Flash Image (Nano Banana 🍌)

#### 사용 서비스
```typescript
const geminiImageServices = [
  // 이미지 합성/편집
  'age-transformation',    // 나이 변환
  'gender-swap',           // 성별 변환
  'era-style',             // 시대별 스타일
  'hairstyle',             // 헤어스타일

  // 프로필 생성
  'id-photo',              // 증명사진
  'sns-profile',           // SNS 프로필
  'character-style',       // 캐릭터화

  // 이미지 생성
  'text2img',              // 텍스트→이미지
  'image-editing',         // 이미지 편집
  'couple-baby',           // 미래 아기 (이미지 병합)
  'concept-art'            // 컨셉 아트
];
```

#### API 설정
```typescript
const geminiImageConfig = {
  model: 'gemini-2.5-flash-image',
  codename: 'nano-banana',
  pricing: {
    perImage: '$0.039',
    tokensPerImage: 1290,
    costPerMillionTokens: '$30'
  },
  freeTier: {
    requestsPerDay: 500,
    provider: 'Google AI Studio'
  },
  capabilities: [
    'Text-to-Image generation',
    'Image editing with natural language',
    'Character consistency across edits',
    'Multi-image understanding and merging',
    'Surgical edits with simple prompts',
    'Aspect ratio control'
  ],
  limits: {
    maxResolution: '1024x1024',
    supportedFormats: ['PNG', 'JPEG', 'WEBP'],
    aspectRatios: ['1:1', '16:9', '9:16', '4:3', '3:4']
  },
  apiAccess: [
    'Google AI Studio',
    'Gemini API',
    'Vertex AI (Enterprise)'
  ]
};
```

#### 핵심 강점
```typescript
const nanoBananaAdvantages = {
  naturalLanguage: '자연어 명령으로 직관적 편집',
  consistency: '캐릭터/객체 일관성 유지',
  multiImage: '여러 이미지 이해 및 병합',
  costEffective: 'DALL-E 3 대비 40% 저렴',
  versatile: '생성과 편집 모두 가능'
};
```

---

## 📊 Prompt Engine 상세 설계

### 1. Prompt Template 스키마

```typescript
interface PromptTemplate {
  // 식별자
  id: string;
  service_type: string;        // 'face-reading', 'saju', etc.
  ai_model: 'gpt-4o-mini' | 'gemini-2.5-flash-image';
  version: string;             // 'v1.0', 'v1.1' (A/B 테스팅)

  // 프롬프트 내용
  system_prompt?: string;      // AI 역할 정의
  user_prompt_template: string; // 변수 포함 템플릿

  // AI 파라미터
  parameters: {
    // GPT-4o mini
    temperature?: number;      // 0.0 - 1.0
    max_tokens?: number;
    top_p?: number;
    response_format?: 'json' | 'text';

    // Gemini 2.5 Flash Image (Nano Banana)
    aspect_ratio?: '1:1' | '16:9' | '9:16' | '4:3' | '3:4';
    number_of_images?: number; // 1-4
    include_safety_ratings?: boolean;
    // 편집 모드 설정
    edit_mode?: 'generate' | 'edit' | 'merge';
    reference_images?: string[]; // 참조 이미지 (캐릭터 일관성)
  };

  // 출력 설정
  output_format: 'json' | 'text' | 'markdown' | 'image';
  validation_schema?: ZodSchema;

  // 메타데이터
  description: string;
  author: string;
  is_active: boolean;

  // 성능 추적
  avg_tokens?: number;
  avg_response_time?: number;
  usage_count: number;

  created_at: Date;
  updated_at: Date;
}
```

### 2. Prompt Engine 구현

```typescript
// /server/services/prompt-engine/prompt-manager.ts

export class PromptEngine {
  private db: Database;
  private redis: Redis;
  private openai: OpenAI;
  private geminiImage: GoogleGenerativeAI;

  /**
   * 프롬프트 템플릿 로드 (캐싱)
   */
  async getTemplate(serviceType: string): Promise<PromptTemplate> {
    const cacheKey = `prompt:${serviceType}`;

    // Redis 캐시 확인
    const cached = await this.redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    // A/B 테스팅 중인 경우 랜덤 선택
    const experiment = await this.getActiveExperiment(serviceType);
    if (experiment) {
      return this.selectTemplateForExperiment(experiment);
    }

    // 최신 활성화 템플릿 로드
    const template = await this.db
      .select()
      .from(promptTemplates)
      .where(eq(promptTemplates.service_type, serviceType))
      .where(eq(promptTemplates.is_active, true))
      .orderBy(desc(promptTemplates.created_at))
      .limit(1);

    // 캐시 저장 (1시간)
    await this.redis.setex(cacheKey, 3600, JSON.stringify(template));

    return template;
  }

  /**
   * 변수 치환
   */
  renderPrompt(template: string, variables: Record<string, any>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return variables[key]?.toString() ?? match;
    });
  }

  /**
   * GPT-4o mini 실행
   */
  async executeTextPrompt(
    serviceType: string,
    variables: Record<string, any>,
    userId?: string
  ): Promise<any> {
    const template = await this.getTemplate(serviceType);

    if (template.ai_model !== 'gpt-4o-mini') {
      throw new Error('Invalid AI model for text prompt');
    }

    const systemPrompt = template.system_prompt || '';
    const userPrompt = this.renderPrompt(
      template.user_prompt_template,
      variables
    );

    const startTime = Date.now();

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: template.parameters.temperature ?? 0.7,
      max_tokens: template.parameters.max_tokens ?? 2000,
      response_format: template.parameters.response_format === 'json'
        ? { type: 'json_object' }
        : undefined
    });

    const responseTime = Date.now() - startTime;
    const tokensUsed = response.usage?.total_tokens ?? 0;

    // 성능 추적
    await this.trackPerformance(template.id, tokensUsed, responseTime);

    // 결과 파싱
    const result = response.choices[0].message.content;

    if (template.output_format === 'json') {
      const parsed = JSON.parse(result);

      // Zod 검증
      if (template.validation_schema) {
        return template.validation_schema.parse(parsed);
      }

      return parsed;
    }

    return result;
  }

  /**
   * Gemini 2.5 Flash Image (Nano Banana) 실행
   */
  async executeImagePrompt(
    serviceType: string,
    variables: Record<string, any>,
    inputImages?: string[] // 편집/병합용 이미지
  ): Promise<string> {
    const template = await this.getTemplate(serviceType);

    if (template.ai_model !== 'gemini-2.5-flash-image') {
      throw new Error('Invalid AI model for image prompt');
    }

    const prompt = this.renderPrompt(
      template.user_prompt_template,
      variables
    );

    const startTime = Date.now();

    const model = this.geminiImage.getGenerativeModel({
      model: 'gemini-2.5-flash-image'
    });

    // 이미지 생성 또는 편집
    const parts = [];

    // 편집 모드인 경우 참조 이미지 추가
    if (inputImages && inputImages.length > 0) {
      for (const imageUrl of inputImages) {
        const imageData = await this.fetchImageAsBase64(imageUrl);
        parts.push({
          inlineData: {
            mimeType: 'image/jpeg',
            data: imageData
          }
        });
      }
    }

    // 프롬프트 추가
    parts.push({ text: prompt });

    const result = await model.generateContent({
      contents: [{ role: 'user', parts }],
      generationConfig: {
        temperature: 0.4,
        candidateCount: template.parameters.number_of_images ?? 1,
      }
    });

    const responseTime = Date.now() - startTime;

    // 성능 추적 (이미지는 고정 1290 토큰)
    await this.trackPerformance(template.id, 1290, responseTime);

    // 생성된 이미지 추출 (base64)
    const imageData = result.response.candidates[0].content.parts[0].inlineData;

    // Supabase Storage 업로드
    const imageUrl = await this.uploadToStorage(
      imageData.data,
      serviceType
    );

    return imageUrl;
  }

  /**
   * 이미지 URL을 Base64로 변환
   */
  private async fetchImageAsBase64(imageUrl: string): Promise<string> {
    const response = await fetch(imageUrl);
    const buffer = await response.arrayBuffer();
    return Buffer.from(buffer).toString('base64');
  }

  /**
   * 성능 추적
   */
  private async trackPerformance(
    templateId: string,
    tokens: number,
    responseTime: number
  ): Promise<void> {
    await this.db
      .update(promptTemplates)
      .set({
        usage_count: sql`${promptTemplates.usage_count} + 1`,
        avg_tokens: sql`
          CASE
            WHEN ${promptTemplates.avg_tokens} IS NULL THEN ${tokens}
            ELSE (${promptTemplates.avg_tokens} * ${promptTemplates.usage_count} + ${tokens}) / (${promptTemplates.usage_count} + 1)
          END
        `,
        avg_response_time: sql`
          CASE
            WHEN ${promptTemplates.avg_response_time} IS NULL THEN ${responseTime}
            ELSE (${promptTemplates.avg_response_time} * ${promptTemplates.usage_count} + ${responseTime}) / (${promptTemplates.usage_count} + 1)
          END
        `
      })
      .where(eq(promptTemplates.id, templateId));
  }
}
```

### 3. 서비스 레이어 예시

```typescript
// /server/services/fortune/face-reading/service.ts

export class FaceReadingService {
  private promptEngine: PromptEngine;

  async analyzeFace(imageUrl: string, userId: string): Promise<FaceReadingResult> {
    // 1. 이미지 전처리
    const processedImage = await this.preprocessImage(imageUrl);

    // 2. 프롬프트 실행
    const result = await this.promptEngine.executeTextPrompt(
      'face-reading',
      {
        forehead_description: processedImage.features.forehead,
        eyes_description: processedImage.features.eyes,
        nose_description: processedImage.features.nose,
        mouth_description: processedImage.features.mouth,
        face_shape_description: processedImage.features.faceShape
      },
      userId
    );

    // 3. 결과 저장
    const savedResult = await this.saveResult(userId, result);

    return savedResult;
  }
}
```

---

---

## 🚀 배포 아키텍처 (Deployment Architecture)

### 통합 모노레포 배포 구조

```
┌─────────────────────────────────────────────────────────────┐
│                    Vercel Monorepo Deployment                │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                   aiports.org                         │   │
│  │  ┌────────────┐              ┌────────────┐          │   │
│  │  │   Client   │              │   Server   │          │   │
│  │  │  (Static)  │              │  (Node.js) │          │   │
│  │  │            │              │            │          │   │
│  │  │  React     │              │  Express   │          │   │
│  │  │  + Vite    │              │  + TS      │          │   │
│  │  └────────────┘              └────────────┘          │   │
│  │       ↓                            ↓                 │   │
│  │  client/dist/*              server/src/index.ts      │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                           ↓
        ┌─────────────────────────────────┐
        │     Routing Configuration       │
        ├─────────────────────────────────┤
        │  /              → client        │
        │  /api/*         → server        │
        │  /health        → server        │
        │  /oauth/*       → client        │
        └─────────────────────────────────┘
```

### 핵심 특징

#### ✅ 단일 도메인 배포
```
모든 트래픽이 aiports.org를 통해 처리됨
- 클라이언트: aiports.org/
- API: aiports.org/api/*
- 헬스 체크: aiports.org/health

장점:
1. CORS 불필요 (Same-Origin)
2. 쿠키/세션 관리 간편
3. 배포 단순화 (하나의 Vercel 프로젝트)
4. 환경 변수 통합 관리
```

#### ✅ 상대 경로 API 호출
```typescript
// 프로덕션: 상대 경로 사용 (같은 도메인)
// 개발: localhost:3000 명시
const API_URL = import.meta.env.DEV ? 'http://localhost:3000' : '';

// 사용 예시
fetch(`${API_URL}/api/auth/login`)
// 개발: http://localhost:3000/api/auth/login
// 프로덕션: /api/auth/login (상대 경로)
```

#### ✅ Vercel 라우팅
```json
{
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "server/src/index.ts"
    },
    {
      "src": "/health",
      "dest": "server/src/index.ts"
    },
    {
      "src": "/(.*)",
      "dest": "client/dist/$1"
    }
  ]
}
```

### 개발 환경 vs 프로덕션 환경

#### 개발 환경 (Development)
```bash
# 터미널 1: 클라이언트 (Vite dev server)
cd client
npm run dev
→ http://localhost:5173

# 터미널 2: 백엔드 (Express + tsx)
cd server
npm run dev
→ http://localhost:3000

# API 호출
fetch('http://localhost:3000/api/...')  # 개발 모드에서 명시적 URL
```

#### 프로덕션 환경 (Production)
```bash
# 단일 Vercel 배포
vercel --prod

# 빌드 과정
1. client/dist/ 생성 (Vite build)
2. server/src/index.ts 컴파일
3. Vercel 라우팅 설정 적용

# API 호출
fetch('/api/...')  # 상대 경로, 같은 도메인
```

### 환경 변수 관리

#### 클라이언트 환경 변수 (VITE_ 접두사)
```bash
VITE_SUPABASE_URL=https://...
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_KAKAO_JS_KEY=9e0a4...
# VITE_API_URL은 더 이상 필요 없음 (상대 경로 사용)
```

#### 서버 환경 변수
```bash
# 데이터베이스
DATABASE_URL=postgresql://...
SUPABASE_URL=https://...
SUPABASE_ANON_KEY=eyJ...

# 인증
JWT_SECRET=29b711...
KAKAO_REST_API_KEY=9e0a4...

# 클라이언트 URL (OAuth 리다이렉트용)
CLIENT_URL=https://aiports.org
```

### 배포 플로우

```
개발자 로컬 환경
    ↓
git push origin master
    ↓
GitHub Repository
    ↓ (자동 배포 트리거)
Vercel CI/CD
    ↓
┌─────────────────────┐
│   빌드 프로세스      │
├─────────────────────┤
│ 1. client 빌드      │
│ 2. server 컴파일    │
│ 3. 환경 변수 주입   │
│ 4. 라우팅 설정      │
└─────────────────────┘
    ↓
aiports.org (프로덕션)
```

---

## 🗄️ 데이터베이스 스키마

### 핵심 테이블

#### Users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(50) UNIQUE,
  provider VARCHAR(20) NOT NULL, -- 'email', 'kakao', 'google'
  provider_id VARCHAR(255),
  profile_image_url TEXT,

  -- 크레딧
  credits INTEGER DEFAULT 0,
  lifetime_credits INTEGER DEFAULT 0,

  -- 구독
  subscription_tier VARCHAR(20), -- 'basic', 'premium', 'pro'
  subscription_end_date TIMESTAMP,

  -- 메타
  locale VARCHAR(10) DEFAULT 'ko',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  INDEX idx_email (email),
  INDEX idx_provider (provider, provider_id)
);
```

#### ⭐ Prompt Templates
```sql
CREATE TABLE prompt_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_type VARCHAR(100) NOT NULL,
  ai_model VARCHAR(30) NOT NULL, -- 'gpt-4o-mini', 'gemini-2.5-flash-image'
  version VARCHAR(10) NOT NULL,

  -- 프롬프트
  system_prompt TEXT,
  user_prompt_template TEXT NOT NULL,

  -- 파라미터
  parameters JSONB NOT NULL DEFAULT '{}',

  -- 출력
  output_format VARCHAR(20) NOT NULL,
  validation_schema JSONB,

  -- 메타
  description TEXT,
  author VARCHAR(100),
  is_active BOOLEAN DEFAULT true,

  -- 성능 추적
  avg_tokens INTEGER,
  avg_response_time INTEGER, -- ms
  usage_count INTEGER DEFAULT 0,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(service_type, version),
  INDEX idx_service_active (service_type, is_active)
);
```

#### ⭐ Prompt Experiments (A/B 테스팅)
```sql
CREATE TABLE prompt_experiments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_type VARCHAR(100) NOT NULL,

  template_a_id UUID REFERENCES prompt_templates(id),
  template_b_id UUID REFERENCES prompt_templates(id),

  traffic_split INTEGER DEFAULT 50, -- A/B 비율
  status VARCHAR(20) DEFAULT 'running',

  -- 결과
  version_a_count INTEGER DEFAULT 0,
  version_b_count INTEGER DEFAULT 0,
  version_a_avg_rating DECIMAL(3,2),
  version_b_avg_rating DECIMAL(3,2),

  started_at TIMESTAMP DEFAULT NOW(),
  ended_at TIMESTAMP,
  winner VARCHAR(10) -- 'A', 'B', 'tie'
);
```

#### Services
```sql
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category VARCHAR(50) NOT NULL,
  service_type VARCHAR(100) NOT NULL,

  name_ko VARCHAR(100) NOT NULL,
  name_en VARCHAR(100) NOT NULL,
  description_ko TEXT,
  description_en TEXT,

  credit_cost INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(category, service_type)
);
```

#### Service Results
```sql
CREATE TABLE service_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id),

  -- 입력
  input_data JSONB,
  input_files TEXT[],

  -- 결과
  result_data JSONB,
  result_files TEXT[],

  -- AI 정보
  ai_model VARCHAR(50),
  prompt_template_id UUID REFERENCES prompt_templates(id),
  tokens_used INTEGER,
  processing_time INTEGER,

  -- 공유
  is_public BOOLEAN DEFAULT false,
  share_token VARCHAR(100) UNIQUE,

  -- 만료 (12개월)
  expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '12 months',

  created_at TIMESTAMP DEFAULT NOW(),

  INDEX idx_user_service (user_id, service_id),
  INDEX idx_share_token (share_token)
);
```

#### Transactions
```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,

  type VARCHAR(20) NOT NULL, -- 'charge', 'use', 'refund'
  credit_amount INTEGER NOT NULL,
  credit_balance_after INTEGER NOT NULL,

  -- 결제 정보
  payment_method VARCHAR(50),
  payment_id VARCHAR(100) UNIQUE,
  actual_amount INTEGER,

  -- 서비스 사용
  service_id UUID REFERENCES services(id),
  result_id UUID REFERENCES service_results(id),

  created_at TIMESTAMP DEFAULT NOW(),

  INDEX idx_user_created (user_id, created_at DESC)
);
```

---

## 🔌 API 설계

### 인증 (Authentication)
```typescript
POST   /api/auth/register              # 회원가입
POST   /api/auth/login                 # 로그인
POST   /api/auth/logout                # 로그아웃
GET    /api/auth/me                    # 현재 사용자
PUT    /api/auth/me                    # 프로필 수정

# OAuth
GET    /api/auth/kakao
GET    /api/auth/google
GET    /api/auth/callback/:provider
```

### 크레딧 & 결제
```typescript
GET    /api/credits/balance            # 잔액 조회
GET    /api/credits/history            # 사용 내역
POST   /api/credits/charge             # 충전
POST   /api/payment/confirm            # 결제 확인
```

### 운세/점술 서비스
```typescript
POST   /api/fortune/face-reading       # 관상 분석
POST   /api/fortune/saju                # 사주팔자
POST   /api/fortune/tarot               # 타로
POST   /api/fortune/dream               # 꿈해몽
POST   /api/fortune/tojeong             # 토정비결
```

### 이미지 서비스
```typescript
POST   /api/image/synthesis/age        # 나이 변환
POST   /api/image/synthesis/gender     # 성별 변환
POST   /api/image/generate/text2img    # 텍스트→이미지
POST   /api/image/profile              # 프로필 생성
```

### 실용 서비스
```typescript
POST   /api/utility/text               # 텍스트 생성
POST   /api/utility/translate          # 번역
POST   /api/utility/summary            # 요약
```

### Admin API (프롬프트 관리)
```typescript
GET    /api/admin/prompts              # 템플릿 목록
GET    /api/admin/prompts/:id          # 템플릿 상세
POST   /api/admin/prompts              # 템플릿 생성
PUT    /api/admin/prompts/:id          # 템플릿 수정
DELETE /api/admin/prompts/:id          # 템플릿 삭제

POST   /api/admin/experiments          # A/B 테스트 시작
GET    /api/admin/experiments/:id      # 실험 결과
POST   /api/admin/experiments/:id/end  # 실험 종료
```

---

## 💰 비용 구조

### AI API 비용 (월 1,000명 사용자 기준)

#### GPT-4o mini
```
가격: Input $0.150/1M, Output $0.600/1M tokens

예상 사용량:
- 총 요청: 10,000 requests/월
- 평균 입력: 500 tokens
- 평균 출력: 1,000 tokens

비용 계산:
- Input: 5M tokens × $0.150 = $750
- Output: 10M tokens × $0.600 = $6,000
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
합계: $6,750/월 (약 900만원)
```

#### Gemini 2.5 Flash Image (Nano Banana)
```
가격: $0.039 per image (1290 output tokens)
무료 티어: 500 requests/day (Google AI Studio)

예상 사용량:
- 총 요청: 5,000 requests/월
- 가격: $0.039 per image

비용 계산:
- 5,000 × $0.039 = $195/월
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
합계: $195/월 (약 26만원)

✅ DALL-E 3 ($0.065/image) 대비 40% 저렴
```

#### 총 AI 비용
```
GPT-4o mini: $6,750/월
Gemini 2.5 Flash Image: $195/월
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
합계: $6,945/월 (약 930만원)

💡 무료 티어 활용 시:
- 500 requests/day × 30일 = 15,000 무료
- 실제 비용: 거의 $0 (초기)
```

### 인프라 비용
```
Vercel Pro: $20
Neon PostgreSQL: $19 ~ $69
Upstash Redis: $10 ~ $80
Supabase: $25 ~ $599
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
합계: $74 ~ $768/월
```

### 총 운영 비용
```
초기 (< 1,000명): $7,019/월 (약 940만원)
- Google AI Studio 무료 티어 활용 시: $6,824/월 (약 910만원)

성장 (1,000~10,000명): $10,000~$20,000/월
확장 (10,000+명): $30,000+/월
```

---

## 🎯 크레딧 가격 체계

### 서비스별 크레딧 비용
```typescript
const servicePricing = {
  fortune: {
    "face-reading": 5,      // 관상
    "couple-reading": 10,   // 커플 궁합
    "saju": 10,             // 사주
    "tarot-1": 2,           // 타로 1장
    "tarot-3": 5,           // 타로 3장
    "dream": 5,             // 꿈해몽
    "tojeong": 8            // 토정비결
  },
  image: {
    "synthesis": 10,        // 사진 합성
    "generation": 15,       // 이미지 생성
    "profile": 8,           // 프로필
    "couple-baby": 20       // 미래 아기
  },
  entertainment: {
    "psychology": 5,        // 심리테스트
    "personality": 8,       // 성격분석
    "matching": 3           // 매칭
  },
  utility: {
    "text-gen": 2,          // 텍스트 (1000자)
    "translate": 1,         // 번역 (1000자)
    "summary": 3            // 요약
  }
};
```

### 크레딧 패키지
```
10 크레딧: 1,000원 (보너스 0)
50 크레딧: 5,000원 (보너스 5 = 10%)
100 크레딧: 10,000원 (보너스 15 = 15%)
500 크레딧: 50,000원 (보너스 100 = 20%)
```

### 구독 플랜
```
Basic: 월 9,900원 (100 크레딧/월)
Premium: 월 29,900원 (350 크레딧/월)
Pro: 월 99,900원 (1,500 크레딧/월)
```

---

## 📅 개발 로드맵

### Phase 1: Prompt Engine 구축 (1개월)
- [ ] Prompt Template 스키마 설계
- [ ] PromptEngine 클래스 구현
- [ ] GPT-4o mini 통합
- [ ] Banana API 통합
- [ ] Admin 프롬프트 관리 UI

### Phase 2: 기존 서비스 마이그레이션 (2주)
- [ ] 관상 분석 → Prompt Engine 전환
- [ ] 프롬프트 최적화
- [ ] 성능 테스트

### Phase 3: 운세 서비스 추가 (2개월)
- [ ] 사주팔자 프롬프트 개발
- [ ] 타로 카드 프롬프트 + DB
- [ ] 꿈해몽 프롬프트
- [ ] 토정비결 프롬프트
- [ ] 각 서비스 A/B 테스팅

### Phase 4: 이미지 서비스 (2개월)
- [ ] Gemini 2.5 Flash Image API 통합
- [ ] 사진 합성/편집 (나이, 성별, 시대)
- [ ] 프로필 사진 생성
- [ ] 미래 아기 얼굴 (이미지 병합)
- [ ] 캐릭터 일관성 프롬프트 최적화

### Phase 5: 엔터테인먼트 & 실용 (1.5개월)
- [ ] 심리테스트 프롬프트
- [ ] 성격분석 프롬프트
- [ ] 텍스트 생성/번역/요약

### Phase 6: 고도화 (지속)
- [ ] 프롬프트 자동 최적화
- [ ] 사용자 피드백 기반 개선
- [ ] 다국어 확장

---

## 📈 수익 모델

### 목표 지표
```
월간 활성 사용자 (MAU): 10,000명
전환율 (무료→유료): 5%
ARPU (유료 사용자당): ₩15,000/월

예상 월 매출:
500명 × ₩15,000 = ₩7,500,000

월 순이익:
매출 ₩7,500,000 - 비용 ₩10,000,000 = -₩2,500,000 (초기)

손익분기점: 약 1,500명 유료 사용자
```

---

## ⚡ 핵심 장점

### 1. 비용 효율성
- 2개 AI 모델만 사용 (관리 단순화)
- Gemini 2.5 Flash Image: DALL-E 3 대비 40% 저렴
- 무료 티어 활용으로 초기 비용 절감 (500 requests/day)
- 프롬프트 최적화로 토큰 사용 최소화
- Redis 캐싱으로 중복 요청 방지

### 2. 빠른 확장
- 새 서비스 = 프롬프트 템플릿 추가
- 코드 변경 없이 DB에서 관리
- 실시간 업데이트 가능

### 3. 품질 관리
- A/B 테스팅으로 지속적 개선
- 프롬프트 버전 관리
- 성능 지표 추적

### 4. 유지보수 용이
- 관리 포인트 감소 (2개 AI만)
- 일관된 아키텍처
- 문제 발생 시 빠른 롤백

---

**문서 버전**: 2.1.0 (Prompt Engine + Gemini 2.5 Flash Image)
**최종 수정일**: 2025-01-15
**작성자**: AI Platform Team

---

## 📚 참고 자료

- [Gemini 2.5 Flash Image 공식 문서](https://ai.google.dev/gemini-api/docs/image-generation)
- [Nano Banana 소개 (Google Developers Blog)](https://developers.googleblog.com/en/introducing-gemini-2-5-flash-image/)
- [Gemini API Pricing](https://ai.google.dev/gemini-api/docs/pricing)
