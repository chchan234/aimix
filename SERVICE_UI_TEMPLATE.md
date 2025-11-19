# AI Platform Service UI Template

새로운 서비스 페이지를 추가할 때 이 템플릿을 따라주세요.

## 기본 구조

모든 서비스 페이지는 3단계 플로우를 따릅니다:
1. **Intro** (소개) → 2. **Input/Upload** (입력) → 3. **Result** (결과)

## 파일 구조

```
client/src/pages/services/[ServiceName]Page.tsx
```

## 기본 코드 템플릿

### 이미지 업로드 서비스

```tsx
import { useState, useRef } from 'react';
import ServiceDetailLayout from '../../components/ServiceDetailLayout';
import { apiFunction } from '../../services/ai';

export default function ServiceNamePage() {
  const [step, setStep] = useState<'intro' | 'upload' | 'result'>('intro');
  const [imagePreview, setImagePreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleStartTest = () => {
    setStep('upload');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('이미지 파일만 업로드 가능합니다.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target?.result as string);
      setError('');
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!imagePreview) {
      setError('이미지를 먼저 업로드해주세요.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await apiFunction(imagePreview) as any;

      if (response.success) {
        setResult(response.analysis);
        setStep('result');
      } else {
        setError(response.error || '분석에 실패했습니다.');
      }
    } catch (err: any) {
      console.error('Analysis error:', err);
      setError(err.message || '분석 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep('upload');
    setImagePreview('');
    setResult(null);
    setError('');
  };

  return (
    <ServiceDetailLayout
      title="서비스 제목"
      description="서비스 설명"
      icon="icon_name"
      color="theme_color"
    >
      {/* 아래 섹션들 참조 */}
    </ServiceDetailLayout>
  );
}
```

### 폼 입력 서비스

```tsx
const [step, setStep] = useState<'intro' | 'input' | 'result'>('intro');
```

### 테스트 서비스 (MBTI, 에니어그램 등)

```tsx
const [step, setStep] = useState<'intro' | 'test' | 'result'>('intro');
```

## 섹션별 UI 패턴

### 1. Intro 섹션

```tsx
{step === 'intro' && (
  <div className="space-y-6">
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
      {/* 아이콘 + 제목 */}
      <div className="flex items-center gap-3 mb-4">
        <span className="material-symbols-outlined text-3xl text-{color}-400">service_icon</span>
        <h3 className="text-xl font-semibold text-foreground">
          서비스 타이틀
        </h3>
      </div>

      {/* 서비스 설명 */}
      <p className="text-muted-foreground mb-6">
        서비스 설명 텍스트. 이 서비스가 무엇을 하는지 설명합니다.
        두 번째 문장으로 추가 정보를 제공합니다.
      </p>

      {/* 2x2 기능 카드 그리드 */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-{color}-400">icon_name</span>
            <span className="text-foreground font-medium">기능 1</span>
          </div>
          <p className="text-muted-foreground text-sm">기능 설명</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-{color}-400">icon_name</span>
            <span className="text-foreground font-medium">기능 2</span>
          </div>
          <p className="text-muted-foreground text-sm">기능 설명</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-{color}-400">icon_name</span>
            <span className="text-foreground font-medium">기능 3</span>
          </div>
          <p className="text-muted-foreground text-sm">기능 설명</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-{color}-400">icon_name</span>
            <span className="text-foreground font-medium">기능 4</span>
          </div>
          <p className="text-muted-foreground text-sm">기능 설명</p>
        </div>
      </div>

      {/* 크레딧 정보 카드 */}
      <div className="bg-{color}-900/20 border border-{color}-500 rounded-lg p-4 mt-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-foreground font-semibold">서비스 이름</p>
            <p className="text-muted-foreground text-sm">서비스 상세</p>
          </div>
          <div className="text-right">
            <p className="text-{color}-400 font-bold text-xl">XX 크레딧</p>
          </div>
        </div>
      </div>

      {/* 시작 버튼 */}
      <button
        onClick={handleStartTest}
        className="w-full px-6 py-4 bg-{color}-600 hover:bg-{color}-700 text-white font-semibold rounded-lg transition-colors"
      >
        시작하기 (XX 크레딧)
      </button>
    </div>
  </div>
)}
```

### 2. Upload/Input 섹션

```tsx
{step === 'upload' && !loading && (
  <div className="space-y-6">
    {/* 이미지 업로드 */}
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">사진 업로드</h3>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        accept="image/*"
        className="hidden"
      />

      {imagePreview ? (
        <div className="space-y-4">
          <div className="relative aspect-square max-w-sm mx-auto">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-full h-full object-cover rounded-lg"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-2 right-2 p-2 bg-white dark:bg-gray-800/80 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <span className="material-symbols-outlined text-foreground">refresh</span>
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-{color}-500 transition-colors"
        >
          <span className="material-symbols-outlined text-4xl text-muted-foreground block mb-2">add_photo_alternate</span>
          <span className="text-muted-foreground">클릭하여 사진 업로드</span>
        </button>
      )}

      <p className="text-gray-500 text-sm mt-3 text-center">
        업로드 안내 텍스트
      </p>
    </div>

    {/* 추가 옵션 (필요시) */}
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">옵션 선택</h3>
      {/* 옵션 버튼들 */}
    </div>

    {/* 분석 버튼 */}
    <button
      onClick={handleAnalyze}
      disabled={!imagePreview}
      className={`w-full px-6 py-4 font-semibold rounded-lg transition-colors ${
        imagePreview
          ? 'bg-{color}-600 hover:bg-{color}-700 text-white'
          : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-muted-foreground cursor-not-allowed'
      }`}
    >
      분석하기
    </button>
  </div>
)}
```

### 3. Loading 상태

```tsx
{loading && (
  <div className="text-center py-12">
    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-{color}-500 mx-auto mb-4"></div>
    <p className="text-muted-foreground">AI가 분석하고 있습니다...</p>
  </div>
)}
```

### 4. Error 표시

```tsx
{error && (
  <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 text-red-400">
    {error}
  </div>
)}
```

### 5. Result 섹션

```tsx
{step === 'result' && result && (
  <div className="space-y-6">
    {/* 결과 내용 */}
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
      <h3 className="text-xl font-semibold text-foreground mb-4">
        분석 결과
      </h3>
      {/* 결과 표시 */}
    </div>

    {/* 다시 시도 버튼 */}
    <button
      onClick={handleReset}
      className="w-full px-6 py-4 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-foreground font-semibold rounded-lg transition-colors"
    >
      다시 분석하기
    </button>
  </div>
)}
```

## 테마 컬러 가이드

서비스별 권장 테마 컬러:

| 카테고리 | 컬러 | Tailwind 클래스 |
|---------|------|----------------|
| 운세/점술 | Purple | `purple` |
| 이미지 편집 | Blue, Cyan, Indigo | `blue`, `cyan`, `indigo` |
| 심리 테스트 | Green, Orange | `green`, `orange` |
| 엔터테인먼트 | Pink, Red | `pink`, `red` |
| 건강 | Green, Teal | `green`, `teal` |

## 스타일링 규칙

### 카드 스타일
```css
bg-white dark:bg-gray-800 rounded-lg p-6
```

### 테두리
```css
border border-gray-200 dark:border-gray-700
```

### 입력 필드
```css
w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-foreground focus:outline-none focus:border-{color}-500
```

### 업로드 영역
```css
border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-{color}-500
```

### 기본 버튼
```css
bg-{color}-600 hover:bg-{color}-700 text-white font-semibold rounded-lg
```

### 비활성 버튼
```css
bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-muted-foreground cursor-not-allowed
```

### 보조 버튼
```css
bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-foreground
```

## 아이콘

Google Material Symbols 사용:
```html
<span className="material-symbols-outlined">icon_name</span>
```

자주 사용하는 아이콘:
- `add_photo_alternate` - 이미지 업로드
- `refresh` - 새로고침
- `auto_awesome` - AI/자동
- `psychology` - 분석/심리
- `face` - 얼굴
- `palette` - 컬러
- `star` - 특별/프리미엄
- `check` - 체크/완료

## API 연동

### services/ai.ts에 함수 추가

```typescript
export async function newServiceFunction(param1: string, param2: string) {
  return apiRequest('/api/endpoint', { param1, param2 });
}
```

### 서버 라우트 추가

```typescript
// server/src/routes/[category].ts
router.post('/endpoint', async (req, res) => {
  // 구현
});
```

## 체크리스트

새 서비스 페이지 추가 시:

- [ ] Step state 정의 (`'intro' | 'upload' | 'result'`)
- [ ] Intro 섹션 (설명 + 2x2 기능 카드 + 크레딧 정보)
- [ ] Upload/Input 섹션 (폼/이미지 업로드)
- [ ] Loading 상태
- [ ] Error 처리
- [ ] Result 섹션
- [ ] handleReset 함수
- [ ] ServiceDetailLayout 적용
- [ ] 테마 컬러 일관성
- [ ] Light/Dark 모드 지원
- [ ] API 함수 추가 (ai.ts)
- [ ] 서버 라우트 추가
- [ ] App.tsx 라우트 등록
- [ ] 메뉴에 서비스 추가
