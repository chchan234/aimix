# 다국어 (i18n) 개발 가이드

## ⚠️ 필수 규칙

### 🚨 중요: 모든 페이지에 다국어 적용 필수!
**모든 사용자에게 보이는 텍스트는 반드시 번역 시스템을 사용해야 합니다!**

- ✅ 홈페이지만 다국어 적용 → ❌ **틀렸습니다!**
- ✅ 모든 페이지에 다국어 적용 → ✅ **정답입니다!**

**새 페이지를 만들 때:**
1. 페이지 컴포넌트 생성
2. `useTranslation` 훅 추가
3. 모든 텍스트를 `t()` 함수로 감싸기
4. `ko.json`과 `en.json`에 번역 추가
5. 언어를 변경해서 테스트

**페이지별 체크리스트:**
- [ ] 페이지 제목
- [ ] 모든 카드 제목
- [ ] 모든 카드 설명
- [ ] 모든 버튼 텍스트
- [ ] 모든 안내 문구
- [ ] 카테고리/태그 표시

## 빠른 시작

### 1. 컴포넌트에서 번역 사용하기

```typescript
import { useTranslation } from 'react-i18next';

export default function MyComponent() {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t('mySection.title')}</h1>
      <p>{t('mySection.description')}</p>
    </div>
  );
}
```

### 2. 번역 키 추가하기

**한국어** (`/client/src/i18n/locales/ko.json`):
```json
{
  "mySection": {
    "title": "내 제목",
    "description": "내 설명"
  }
}
```

**영어** (`/client/src/i18n/locales/en.json`):
```json
{
  "mySection": {
    "title": "My Title",
    "description": "My Description"
  }
}
```

## 번역 파일 구조

```
/client/src/i18n/
├── config.ts           # i18n 설정
└── locales/
    ├── ko.json        # 한국어 번역
    └── en.json        # 영어 번역
```

## 번역 키 네이밍 규칙

### 구조
```
{섹션}.{하위섹션}.{키}
```

### 예시
```json
{
  "header": {
    "login": "로그인",
    "signup": "회원가입"
  },
  "home": {
    "heroTitle": "AI 통합 플랫폼",
    "heroButton": "무료로 이용"
  },
  "services": {
    "fortune": {
      "saju": {
        "title": "AI 사주팔자",
        "description": "생년월일시 기반 운세 분석"
      }
    }
  }
}
```

## 카테고리별 번역 키

### 1. Header (헤더)
- `header.login` - 로그인 버튼
- `header.signup` - 회원가입 버튼
- `header.logout` - 로그아웃
- `header.profile` - 프로필
- `header.settings` - 설정

### 2. Sidebar (사이드바)
- `sidebar.home` - 홈
- `sidebar.fortune` - 운세/점술
- `sidebar.image` - 이미지 편집
- `sidebar.entertainment` - 엔터테인먼트
- `sidebar.health` - 건강/웰빙

### 3. 서비스 카드
- `services.{카테고리}.{서비스명}.title` - 서비스 제목
- `services.{카테고리}.{서비스명}.description` - 서비스 설명

예시:
```typescript
const service = {
  title: t('services.fortune.saju.title'),
  description: t('services.fortune.saju.description')
};
```

### 4. 공통 요소
- `common.loading` - 로딩 중...
- `common.error` - 오류 메시지
- `common.success` - 성공 메시지
- `common.cancel` - 취소
- `common.confirm` - 확인

## 변수를 포함한 번역

### 예시: 시간 표시
```json
{
  "timeAgo": {
    "minutes": "{{count}}분 전",
    "hours": "{{count}}시간 전"
  }
}
```

```typescript
t('timeAgo.minutes', { count: 5 })  // "5분 전"
t('timeAgo.hours', { count: 2 })    // "2시간 전"
```

## 체크리스트: 새 기능 추가 시

- [ ] 1. 모든 사용자 대상 텍스트를 하드코딩하지 않았나요?
- [ ] 2. `useTranslation` 훅을 import 했나요?
- [ ] 3. `ko.json`에 한국어 번역을 추가했나요?
- [ ] 4. `en.json`에 영어 번역을 추가했나요?
- [ ] 5. 번역 키 네이밍 규칙을 따랐나요?
- [ ] 6. 언어를 변경해서 테스트했나요?

## 예시: 완전한 컴포넌트

```typescript
import { useTranslation } from 'react-i18next';

export default function ServiceCard() {
  const { t } = useTranslation();

  const services = [
    {
      title: t('services.image.profileGenerator.title'),
      description: t('services.image.profileGenerator.description'),
      icon: 'account_circle',
    },
    {
      title: t('services.image.faceSwap.title'),
      description: t('services.image.faceSwap.description'),
      icon: 'swap_horiz',
    },
  ];

  return (
    <div>
      <h2>{t('home.quickStart')}</h2>
      {services.map((service, index) => (
        <div key={index}>
          <h3>{service.title}</h3>
          <p>{service.description}</p>
        </div>
      ))}
    </div>
  );
}
```

## 주의사항

### ❌ 하지 말아야 할 것
```typescript
// 나쁜 예: 하드코딩된 텍스트
<button>로그인</button>
<h1>AI 서비스</h1>
```

### ✅ 해야 할 것
```typescript
// 좋은 예: 번역 시스템 사용
<button>{t('header.login')}</button>
<h1>{t('services.title')}</h1>
```

## 언어 변경 테스트

1. 앱 실행
2. 헤더의 🌐 언어 아이콘 클릭
3. "English" 선택
4. 모든 텍스트가 영어로 변경되는지 확인
5. 다시 "한국어" 선택
6. 모든 텍스트가 한국어로 돌아오는지 확인

## 문제 해결

### 번역이 표시되지 않는 경우
1. 번역 키가 정확한지 확인
2. `ko.json`과 `en.json` 모두에 키가 있는지 확인
3. JSON 파일의 문법 오류 확인 (콤마, 괄호 등)
4. 컴포넌트에서 `useTranslation` 훅을 사용하고 있는지 확인

### 새로고침 후에도 언어가 유지되지 않는 경우
- localStorage에 `language` 키가 저장되는지 확인
- `i18n/config.ts`에서 `localStorage.getItem('language')` 설정 확인

## 더 많은 정보

- [react-i18next 공식 문서](https://react.i18next.com/)
- [i18next 공식 문서](https://www.i18next.com/)
