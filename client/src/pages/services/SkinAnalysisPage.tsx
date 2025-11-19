import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'wouter';
import ServiceDetailLayout from '../../components/ServiceDetailLayout';
import { analyzeSkin } from '../../services/ai';
import { isLoggedIn } from '../../services/auth';

interface SkinAnalysisResult {
  skinType: string;
  skinAge: number;
  conditions: {
    hydration: number;
    oiliness: number;
    sensitivity: number;
    elasticity: number;
  };
  concerns: string[];
  recommendations: {
    skincare: string[];
    ingredients: string[];
    lifestyle: string[];
  };
  routineSuggestion: {
    morning: string[];
    evening: string[];
  };
  confidence: number;
}

export default function SkinAnalysisPage() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<'intro' | 'upload' | 'result'>('intro');
  const [imagePreview, setImagePreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SkinAnalysisResult | null>(null);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auth state monitoring - redirect if logged out
  useEffect(() => {
    const checkAuth = () => {
      if (!isLoggedIn()) {
        setLocation('/login');
      }
    };

    window.addEventListener('focus', checkAuth);
    window.addEventListener('storage', checkAuth);

    return () => {
      window.removeEventListener('focus', checkAuth);
      window.removeEventListener('storage', checkAuth);
    };
  }, [setLocation]);

  const handleStartTest = () => {
    if (!isLoggedIn()) {
      alert('로그인이 필요한 서비스입니다. 로그인 후 이용해주세요.');
      return;
    }
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
      const response = await analyzeSkin(imagePreview) as any;

      if (response.success) {
        setResult(response.analysis);
        setStep('result');
      } else {
        setError(response.error || '분석에 실패했습니다.');
      }
    } catch (err: any) {
      console.error('Skin analysis error:', err);
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

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <ServiceDetailLayout
      title="AI 피부 분석"
      description="나의 피부 상태를 분석하고 관리법을 알아보세요"
      icon="face_retouching_natural"
      color="pink"
    >
      {/* Introduction */}
      {step === 'intro' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined text-3xl text-pink-400">face_retouching_natural</span>
              <h3 className="text-xl font-semibold text-foreground">
                AI 피부 분석
              </h3>
            </div>
            <p className="text-muted-foreground mb-6">
              얼굴 사진을 업로드하면 AI가 피부 상태를 분석하고 맞춤 스킨케어를 추천합니다.
              수분, 유분, 민감도, 탄력을 종합적으로 분석하여 최적의 관리법을 알려드립니다.
            </p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-pink-400">water_drop</span>
                  <span className="text-foreground font-medium">수분 분석</span>
                </div>
                <p className="text-muted-foreground text-sm">피부 수분도 측정</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-pink-400">spa</span>
                  <span className="text-foreground font-medium">피부 타입</span>
                </div>
                <p className="text-muted-foreground text-sm">건성/지성/복합성 판별</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-pink-400">science</span>
                  <span className="text-foreground font-medium">성분 추천</span>
                </div>
                <p className="text-muted-foreground text-sm">피부에 맞는 성분</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-pink-400">schedule</span>
                  <span className="text-foreground font-medium">루틴 제안</span>
                </div>
                <p className="text-muted-foreground text-sm">아침/저녁 스킨케어</p>
              </div>
            </div>

            <div className="bg-pink-900/20 border border-pink-500 rounded-lg p-4 mt-6 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-foreground font-semibold">AI 피부 분석</p>
                  <p className="text-muted-foreground text-sm">피부 상태 + 스킨케어 추천</p>
                </div>
                <div className="text-right">
                  <p className="text-pink-400 font-bold text-xl">30 크레딧</p>
                </div>
              </div>
            </div>

            <button
              onClick={handleStartTest}
              className="w-full px-6 py-4 bg-pink-600 hover:bg-pink-700 text-white font-semibold rounded-lg transition-colors"
            >
              시작하기 (30 크레딧)
            </button>
          </div>
        </div>
      )}

      {/* Upload */}
      {step === 'upload' && !loading && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">얼굴 사진 업로드</h3>

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
                className="w-full p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-pink-500 transition-colors"
              >
                <span className="material-symbols-outlined text-4xl text-muted-foreground block mb-2">add_photo_alternate</span>
                <span className="text-muted-foreground">클릭하여 얼굴 사진 업로드</span>
              </button>
            )}

            <p className="text-gray-500 text-sm mt-3 text-center">
              화장을 지운 맨얼굴 사진이 더 정확한 분석 결과를 제공합니다
            </p>
          </div>

          <button
            onClick={handleAnalyze}
            disabled={!imagePreview}
            className={`w-full px-6 py-4 font-semibold rounded-lg transition-colors ${
              imagePreview
                ? 'bg-pink-600 hover:bg-pink-700 text-white'
                : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-muted-foreground cursor-not-allowed'
            }`}
          >
            분석하기
          </button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground">AI가 피부를 분석하고 있습니다...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 text-red-400">
          {error}
        </div>
      )}

      {/* Results */}
      {step === 'result' && result && (
        <div className="space-y-6">
          {/* Skin Type & Age */}
          <div className="bg-gradient-to-r from-pink-900 to-purple-900 rounded-lg p-6 text-center">
            <p className="text-muted-foreground text-sm mb-2">당신의 피부 타입</p>
            <h3 className="text-2xl font-bold text-white mb-2">
              {result.skinType}
            </h3>
            <p className="text-pink-300">피부 나이: {result.skinAge}세</p>
            <p className="text-pink-300 text-sm">신뢰도 {result.confidence}%</p>
          </div>

          {/* Skin Conditions */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-foreground mb-4">
              <span className="material-symbols-outlined align-middle mr-2">analytics</span>
              피부 상태 지표
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-muted-foreground text-sm">수분도</span>
                  <span className="text-foreground text-sm">{result.conditions.hydration}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className={`${getScoreColor(result.conditions.hydration)} h-2 rounded-full`} style={{ width: `${result.conditions.hydration}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-muted-foreground text-sm">유분도</span>
                  <span className="text-foreground text-sm">{result.conditions.oiliness}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className={`${getScoreColor(100 - result.conditions.oiliness)} h-2 rounded-full`} style={{ width: `${result.conditions.oiliness}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-muted-foreground text-sm">민감도</span>
                  <span className="text-foreground text-sm">{result.conditions.sensitivity}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className={`${getScoreColor(100 - result.conditions.sensitivity)} h-2 rounded-full`} style={{ width: `${result.conditions.sensitivity}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-muted-foreground text-sm">탄력도</span>
                  <span className="text-foreground text-sm">{result.conditions.elasticity}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className={`${getScoreColor(result.conditions.elasticity)} h-2 rounded-full`} style={{ width: `${result.conditions.elasticity}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Concerns */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-foreground mb-4">
              <span className="material-symbols-outlined align-middle mr-2">warning</span>
              주요 고민
            </h3>
            <div className="flex flex-wrap gap-2">
              {result.concerns.map((concern, index) => (
                <span key={index} className="px-3 py-2 bg-orange-500/20 text-orange-400 rounded-lg text-sm">
                  {concern}
                </span>
              ))}
            </div>
          </div>

          {/* Skincare Recommendations */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-foreground mb-4">
              <span className="material-symbols-outlined align-middle mr-2">spa</span>
              스킨케어 추천
            </h3>
            <ul className="space-y-2">
              {result.recommendations.skincare.map((tip, index) => (
                <li key={index} className="flex items-start gap-2 text-muted-foreground">
                  <span className="material-symbols-outlined text-pink-400 text-sm mt-1">check_circle</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          {/* Recommended Ingredients */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-foreground mb-4">
              <span className="material-symbols-outlined align-middle mr-2">science</span>
              추천 성분
            </h3>
            <div className="flex flex-wrap gap-2">
              {result.recommendations.ingredients.map((ingredient, index) => (
                <span key={index} className="px-3 py-2 bg-pink-500/20 text-pink-400 rounded-lg text-sm">
                  {ingredient}
                </span>
              ))}
            </div>
          </div>

          {/* Routine Suggestion */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-foreground mb-4">
              <span className="material-symbols-outlined align-middle mr-2">schedule</span>
              스킨케어 루틴
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-yellow-400 font-semibold mb-2">
                  <span className="material-symbols-outlined align-middle mr-1 text-sm">wb_sunny</span>
                  모닝 루틴
                </p>
                <ol className="space-y-1 text-sm text-muted-foreground">
                  {result.routineSuggestion.morning.map((step, index) => (
                    <li key={index}>{index + 1}. {step}</li>
                  ))}
                </ol>
              </div>
              <div>
                <p className="text-indigo-400 font-semibold mb-2">
                  <span className="material-symbols-outlined align-middle mr-1 text-sm">nights_stay</span>
                  나이트 루틴
                </p>
                <ol className="space-y-1 text-sm text-muted-foreground">
                  {result.routineSuggestion.evening.map((step, index) => (
                    <li key={index}>{index + 1}. {step}</li>
                  ))}
                </ol>
              </div>
            </div>
          </div>

          {/* Lifestyle Tips */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-foreground mb-4">
              <span className="material-symbols-outlined align-middle mr-2">self_improvement</span>
              생활 습관 조언
            </h3>
            <ul className="space-y-2">
              {result.recommendations.lifestyle.map((tip, index) => (
                <li key={index} className="flex items-start gap-2 text-muted-foreground">
                  <span className="material-symbols-outlined text-green-400 text-sm mt-1">eco</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          {/* Try Again */}
          <button
            onClick={handleReset}
            className="w-full px-6 py-4 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-foreground font-semibold rounded-lg transition-colors"
          >
            다시 분석하기
          </button>
        </div>
      )}
    </ServiceDetailLayout>
  );
}
