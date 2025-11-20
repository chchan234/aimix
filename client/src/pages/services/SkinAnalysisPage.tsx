import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'wouter';
import ServiceDetailLayout from '../../components/ServiceDetailLayout';
import { analyzeSkin } from '../../services/ai';
import { isLoggedIn } from '../../services/auth';

interface SkinAnalysisResult {
  skinType: string;
  skinAge: number | string;
  conditions: {
    hydration: {
      level?: number | string;
      score?: number | string;
      description: string;
    };
    oiliness: {
      level?: number | string;
      score?: number | string;
      description: string;
    };
    sensitivity: {
      level?: number | string;
      score?: number | string;
      description: string;
    };
    elasticity: {
      level?: number | string;
      score?: number | string;
      description: string;
    };
  };
  concerns: string[] | any[];
  skincare?: {
    morning: string[] | { steps: string[] };
    evening: string[] | { steps: string[] };
    weekly?: string[];
  };
  ingredients?: {
    recommended: string[] | any[];
    avoid: string[] | any[];
  };
  lifestyle?: string[];
  overallComment?: string;
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

  const getScoreColor = (score: number | string) => {
    const numScore = typeof score === 'string' ? parseInt(score) : score;
    // Convert 1-10 scale to percentage for display
    const percentage = numScore <= 10 ? numScore * 10 : numScore;
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-yellow-500';
    if (percentage >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const normalizeScore = (score: number | string) => {
    const numScore = typeof score === 'string' ? parseInt(score) : score;
    // Convert 1-10 scale to percentage
    return numScore <= 10 ? numScore * 10 : numScore;
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
              <span className="material-symbols-outlined text-3xl text-pink-600 dark:text-pink-400">face_retouching_natural</span>
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
                  <span className="material-symbols-outlined text-pink-600 dark:text-pink-400">water_drop</span>
                  <span className="text-foreground font-medium">수분 분석</span>
                </div>
                <p className="text-muted-foreground text-sm">피부 수분도 측정</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-pink-600 dark:text-pink-400">spa</span>
                  <span className="text-foreground font-medium">피부 타입</span>
                </div>
                <p className="text-muted-foreground text-sm">건성/지성/복합성 판별</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-pink-600 dark:text-pink-400">science</span>
                  <span className="text-foreground font-medium">성분 추천</span>
                </div>
                <p className="text-muted-foreground text-sm">피부에 맞는 성분</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-pink-600 dark:text-pink-400">schedule</span>
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
                  <p className="text-pink-600 dark:text-pink-400 font-bold text-xl">30 크레딧</p>
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
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Results */}
      {step === 'result' && result && (
        <div className="space-y-6">
          {/* Skin Type & Age */}
          <div className="bg-gradient-to-r from-pink-900 to-purple-900 rounded-lg p-6 text-center">
            <p className="text-white/70 text-sm mb-2">당신의 피부 타입</p>
            <h3 className="text-2xl font-bold text-white mb-2">
              {result.skinType}
            </h3>
            {result.skinAge && (
              <p className="text-pink-300">피부 나이: {typeof result.skinAge === 'string' ? result.skinAge : `${result.skinAge}세`}</p>
            )}
          </div>

          {/* Skin Conditions */}
          {result.conditions && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-foreground mb-4">
                <span className="material-symbols-outlined align-middle mr-2">analytics</span>
                피부 상태 지표
              </h3>
              <div className="space-y-4">
                {result.conditions.hydration && (
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-muted-foreground text-sm">수분도</span>
                      <span className="text-foreground text-sm">{normalizeScore(result.conditions.hydration.score || result.conditions.hydration.level || 0)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className={`${getScoreColor(result.conditions.hydration.score || result.conditions.hydration.level || 0)} h-2 rounded-full`} style={{ width: `${normalizeScore(result.conditions.hydration.score || result.conditions.hydration.level || 0)}%` }}></div>
                    </div>
                    {result.conditions.hydration.description && (
                      <p className="text-muted-foreground text-xs mt-1">{result.conditions.hydration.description}</p>
                    )}
                  </div>
                )}
                {result.conditions.oiliness && (
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-muted-foreground text-sm">유분도</span>
                      <span className="text-foreground text-sm">{normalizeScore(result.conditions.oiliness.score || result.conditions.oiliness.level || 0)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className={`${getScoreColor(100 - normalizeScore(result.conditions.oiliness.score || result.conditions.oiliness.level || 0))} h-2 rounded-full`} style={{ width: `${normalizeScore(result.conditions.oiliness.score || result.conditions.oiliness.level || 0)}%` }}></div>
                    </div>
                    {result.conditions.oiliness.description && (
                      <p className="text-muted-foreground text-xs mt-1">{result.conditions.oiliness.description}</p>
                    )}
                  </div>
                )}
                {result.conditions.sensitivity && (
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-muted-foreground text-sm">민감도</span>
                      <span className="text-foreground text-sm">{normalizeScore(result.conditions.sensitivity.score || result.conditions.sensitivity.level || 0)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className={`${getScoreColor(100 - normalizeScore(result.conditions.sensitivity.score || result.conditions.sensitivity.level || 0))} h-2 rounded-full`} style={{ width: `${normalizeScore(result.conditions.sensitivity.score || result.conditions.sensitivity.level || 0)}%` }}></div>
                    </div>
                    {result.conditions.sensitivity.description && (
                      <p className="text-muted-foreground text-xs mt-1">{result.conditions.sensitivity.description}</p>
                    )}
                  </div>
                )}
                {result.conditions.elasticity && (
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-muted-foreground text-sm">탄력도</span>
                      <span className="text-foreground text-sm">{normalizeScore(result.conditions.elasticity.score || result.conditions.elasticity.level || 0)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className={`${getScoreColor(result.conditions.elasticity.score || result.conditions.elasticity.level || 0)} h-2 rounded-full`} style={{ width: `${normalizeScore(result.conditions.elasticity.score || result.conditions.elasticity.level || 0)}%` }}></div>
                    </div>
                    {result.conditions.elasticity.description && (
                      <p className="text-muted-foreground text-xs mt-1">{result.conditions.elasticity.description}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Concerns */}
          {result.concerns && result.concerns.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-foreground mb-4">
                <span className="material-symbols-outlined align-middle mr-2">warning</span>
                주요 고민
              </h3>
              <div className="flex flex-wrap gap-2">
                {result.concerns.map((concern: any, index: number) => (
                  <span key={index} className="px-3 py-2 bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 rounded-lg text-sm">
                    {typeof concern === 'string' ? concern : concern.issue || concern.name || JSON.stringify(concern)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Recommended Ingredients */}
          {result.ingredients && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-foreground mb-4">
                <span className="material-symbols-outlined align-middle mr-2">science</span>
                성분 추천
              </h3>
              {result.ingredients.recommended && result.ingredients.recommended.length > 0 && (
                <div className="mb-4">
                  <p className="text-pink-600 dark:text-pink-400 text-sm font-medium mb-2">추천 성분</p>
                  <div className="flex flex-wrap gap-2">
                    {result.ingredients.recommended.map((ingredient, index) => (
                      <span key={index} className="px-3 py-2 bg-pink-500/20 text-pink-600 dark:text-pink-400 rounded-lg text-sm">
                        {typeof ingredient === 'string' ? ingredient : (ingredient as any).ingredient || (ingredient as any).reason}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {result.ingredients.avoid && result.ingredients.avoid.length > 0 && (
                <div>
                  <p className="text-orange-600 dark:text-orange-400 text-sm font-medium mb-2">피해야 할 성분</p>
                  <div className="flex flex-wrap gap-2">
                    {result.ingredients.avoid.map((ingredient, index) => (
                      <span key={index} className="px-3 py-2 bg-orange-500/20 text-orange-600 dark:text-orange-400 rounded-lg text-sm">
                        {typeof ingredient === 'string' ? ingredient : (ingredient as any).ingredient || (ingredient as any).reason}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Routine Suggestion */}
          {result.skincare && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-foreground mb-4">
                <span className="material-symbols-outlined align-middle mr-2">schedule</span>
                스킨케어 루틴
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.skincare.morning && (
                  (() => {
                    const morningSteps = Array.isArray(result.skincare.morning)
                      ? result.skincare.morning
                      : (result.skincare.morning as { steps: string[] }).steps;
                    return morningSteps && morningSteps.length > 0 ? (
                      <div>
                        <p className="text-yellow-600 dark:text-yellow-400 font-semibold mb-2">
                          <span className="material-symbols-outlined align-middle mr-1 text-sm">wb_sunny</span>
                          모닝 루틴
                        </p>
                        <ol className="space-y-1 text-sm text-muted-foreground">
                          {morningSteps.map((step: string, index: number) => (
                            <li key={index}>{step}</li>
                          ))}
                        </ol>
                      </div>
                    ) : null;
                  })()
                )}
                {result.skincare.evening && (
                  (() => {
                    const eveningSteps = Array.isArray(result.skincare.evening)
                      ? result.skincare.evening
                      : (result.skincare.evening as { steps: string[] }).steps;
                    return eveningSteps && eveningSteps.length > 0 ? (
                      <div>
                        <p className="text-indigo-600 dark:text-indigo-400 font-semibold mb-2">
                          <span className="material-symbols-outlined align-middle mr-1 text-sm">nights_stay</span>
                          나이트 루틴
                        </p>
                        <ol className="space-y-1 text-sm text-muted-foreground">
                          {eveningSteps.map((step: string, index: number) => (
                            <li key={index}>{step}</li>
                          ))}
                        </ol>
                      </div>
                    ) : null;
                  })()
                )}
              </div>
              {result.skincare.weekly && result.skincare.weekly.length > 0 && (
                <div className="mt-4">
                  <p className="text-purple-600 dark:text-purple-400 font-semibold mb-2">
                    <span className="material-symbols-outlined align-middle mr-1 text-sm">calendar_month</span>
                    주간 케어
                  </p>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {result.skincare.weekly.map((step, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-purple-600 dark:text-purple-400 text-sm mt-0.5">check</span>
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Lifestyle Tips */}
          {result.lifestyle && result.lifestyle.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-foreground mb-4">
                <span className="material-symbols-outlined align-middle mr-2">self_improvement</span>
                생활 습관 조언
              </h3>
              <ul className="space-y-2">
                {result.lifestyle.map((tip, index) => (
                  <li key={index} className="flex items-start gap-2 text-muted-foreground">
                    <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-sm mt-1">eco</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Overall Comment */}
          {result.overallComment && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-foreground mb-4">
                <span className="material-symbols-outlined align-middle mr-2">summarize</span>
                종합 평가
              </h3>
              <p className="text-muted-foreground">{result.overallComment}</p>
            </div>
          )}

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
