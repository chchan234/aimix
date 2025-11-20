import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'wouter';
import ServiceDetailLayout from '../../components/ServiceDetailLayout';
import ResultCard from '../../components/ResultCard';
import { analyzeBodyType } from '../../services/ai';
import { isLoggedIn } from '../../services/auth';

interface BodyAnalysisResult {
  bodyType: string;
  proportions: {
    shoulder: string;
    waist: string;
    hip: string;
    legs?: string;
  };
  exerciseRecommendations?: {
    exercise: string;
    reason: string;
    frequency: string;
  }[];
  fashionRecommendations?: {
    tops: string[];
    bottoms: string[];
    avoid: string[];
    tips: string;
  };
  postureAnalysis?: {
    current: string;
    improvements: string[];
  };
  overallComment?: string;
}

export default function BodyAnalysisPage() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<'intro' | 'upload' | 'result'>('intro');
  const [imagePreview, setImagePreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BodyAnalysisResult | null>(null);
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
      const response = await analyzeBodyType(imagePreview) as any;

      if (response.success) {
        setResult(response.analysis);
        setStep('result');
      } else {
        setError(response.error || '분석에 실패했습니다.');
      }
    } catch (err: any) {
      console.error('Body analysis error:', err);
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
      title="AI 체형 분석"
      description="나의 체형을 분석하고 맞춤 조언을 받아보세요"
      icon="accessibility_new"
      color="teal"
    >
      {/* Introduction */}
      {step === 'intro' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined text-3xl text-teal-400">accessibility_new</span>
              <h3 className="text-xl font-semibold text-foreground">
                AI 체형 분석
              </h3>
            </div>
            <p className="text-muted-foreground mb-6">
              전신 사진을 업로드하면 AI가 체형을 분석하고 맞춤 조언을 제공합니다.
              어깨, 허리, 힙의 비율을 분석하여 운동, 패션, 자세 교정 팁을 알려드립니다.
            </p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-teal-400">straighten</span>
                  <span className="text-foreground font-medium">체형 분류</span>
                </div>
                <p className="text-muted-foreground text-sm">어깨, 허리, 힙 비율 분석</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-teal-400">fitness_center</span>
                  <span className="text-foreground font-medium">운동 추천</span>
                </div>
                <p className="text-muted-foreground text-sm">체형에 맞는 운동 가이드</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-teal-400">checkroom</span>
                  <span className="text-foreground font-medium">패션 조언</span>
                </div>
                <p className="text-muted-foreground text-sm">체형에 어울리는 스타일</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-teal-400">self_improvement</span>
                  <span className="text-foreground font-medium">자세 교정</span>
                </div>
                <p className="text-muted-foreground text-sm">바른 자세 유지 팁</p>
              </div>
            </div>

            <div className="bg-teal-900/20 border border-teal-500 rounded-lg p-4 mt-6 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-foreground font-semibold">AI 체형 분석</p>
                  <p className="text-muted-foreground text-sm">체형 분석 + 맞춤 추천</p>
                </div>
                <div className="text-right">
                  <p className="text-teal-400 font-bold text-xl">25 크레딧</p>
                </div>
              </div>
            </div>

            <button
              onClick={handleStartTest}
              className="w-full px-6 py-4 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg transition-colors"
            >
              시작하기 (25 크레딧)
            </button>
          </div>
        </div>
      )}

      {/* Upload */}
      {step === 'upload' && !loading && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">전신 사진 업로드</h3>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />

            {imagePreview ? (
              <div className="space-y-4">
                <div className="relative max-w-sm mx-auto">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full rounded-lg"
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
                className="w-full p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-teal-500 transition-colors"
              >
                <span className="material-symbols-outlined text-4xl text-muted-foreground block mb-2">add_photo_alternate</span>
                <span className="text-muted-foreground">클릭하여 전신 사진 업로드</span>
              </button>
            )}

            <p className="text-gray-500 text-sm mt-3 text-center">
              전신이 잘 보이는 정면 사진을 업로드해주세요
            </p>
          </div>

          <button
            onClick={handleAnalyze}
            disabled={!imagePreview}
            className={`w-full px-6 py-4 font-semibold rounded-lg transition-colors ${
              imagePreview
                ? 'bg-teal-600 hover:bg-teal-700 text-white'
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
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground">AI가 체형을 분석하고 있습니다...</p>
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
          {/* Body Type */}
          <div className="bg-gradient-to-r from-teal-900 to-cyan-900 rounded-lg p-6 text-center">
            <p className="text-white/70 text-sm mb-2">당신의 체형</p>
            <h3 className="text-2xl font-bold text-white mb-2">
              {result.bodyType}
            </h3>
          </div>

          {/* Proportions */}
          {result.proportions && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-foreground mb-4">
                <span className="material-symbols-outlined align-middle mr-2">straighten</span>
                비율 분석
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {result.proportions.shoulder && (
                  <div>
                    <p className="text-muted-foreground text-sm">어깨</p>
                    <p className="text-foreground font-medium">
                      {typeof result.proportions.shoulder === 'string'
                        ? result.proportions.shoulder
                        : (result.proportions.shoulder as any).description || (result.proportions.shoulder as any).ratio}
                    </p>
                  </div>
                )}
                {result.proportions.waist && (
                  <div>
                    <p className="text-muted-foreground text-sm">허리</p>
                    <p className="text-foreground font-medium">
                      {typeof result.proportions.waist === 'string'
                        ? result.proportions.waist
                        : (result.proportions.waist as any).description || (result.proportions.waist as any).ratio}
                    </p>
                  </div>
                )}
                {result.proportions.hip && (
                  <div>
                    <p className="text-muted-foreground text-sm">힙</p>
                    <p className="text-foreground font-medium">
                      {typeof result.proportions.hip === 'string'
                        ? result.proportions.hip
                        : (result.proportions.hip as any).description || (result.proportions.hip as any).ratio}
                    </p>
                  </div>
                )}
                {result.proportions.legs && (
                  <div>
                    <p className="text-muted-foreground text-sm">다리</p>
                    <p className="text-foreground font-medium">
                      {typeof result.proportions.legs === 'string'
                        ? result.proportions.legs
                        : (result.proportions.legs as any).description || (result.proportions.legs as any).ratio}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Exercise Recommendations */}
          {result.exerciseRecommendations && result.exerciseRecommendations.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-foreground mb-4">
                <span className="material-symbols-outlined align-middle mr-2">fitness_center</span>
                추천 운동
              </h3>
              <div className="space-y-4">
                {result.exerciseRecommendations.map((rec, index) => (
                  <div key={index} className="p-3 bg-teal-500/10 rounded-lg">
                    <p className="text-teal-400 font-medium">{rec.exercise}</p>
                    <p className="text-muted-foreground text-sm mt-1">{rec.reason}</p>
                    <p className="text-muted-foreground text-xs mt-1">권장: {rec.frequency}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Fashion Recommendations */}
          {result.fashionRecommendations && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-foreground mb-4">
                <span className="material-symbols-outlined align-middle mr-2">checkroom</span>
                패션 추천
              </h3>
              <div className="space-y-4">
                {result.fashionRecommendations.tops && result.fashionRecommendations.tops.length > 0 && (
                  <div>
                    <p className="text-teal-400 text-sm font-medium mb-2">상의</p>
                    <div className="flex flex-wrap gap-2">
                      {result.fashionRecommendations.tops.map((top, index) => (
                        <span key={index} className="px-3 py-1 bg-teal-500/20 text-teal-400 rounded-lg text-sm">
                          {top}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {result.fashionRecommendations.bottoms && result.fashionRecommendations.bottoms.length > 0 && (
                  <div>
                    <p className="text-teal-400 text-sm font-medium mb-2">하의</p>
                    <div className="flex flex-wrap gap-2">
                      {result.fashionRecommendations.bottoms.map((bottom, index) => (
                        <span key={index} className="px-3 py-1 bg-teal-500/20 text-teal-400 rounded-lg text-sm">
                          {bottom}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {result.fashionRecommendations.avoid && result.fashionRecommendations.avoid.length > 0 && (
                  <div>
                    <p className="text-orange-400 text-sm font-medium mb-2">피해야 할 스타일</p>
                    <div className="flex flex-wrap gap-2">
                      {result.fashionRecommendations.avoid.map((item, index) => (
                        <span key={index} className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-lg text-sm">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {result.fashionRecommendations.tips && (
                  <p className="text-muted-foreground text-sm mt-2">{result.fashionRecommendations.tips}</p>
                )}
              </div>
            </div>
          )}

          {/* Posture Analysis */}
          {result.postureAnalysis && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-foreground mb-4">
                <span className="material-symbols-outlined align-middle mr-2">self_improvement</span>
                자세 분석
              </h3>
              {result.postureAnalysis.current && (
                <p className="text-muted-foreground mb-3">{result.postureAnalysis.current}</p>
              )}
              {result.postureAnalysis.improvements && result.postureAnalysis.improvements.length > 0 && (
                <div>
                  <p className="text-teal-400 text-sm font-medium mb-2">개선점</p>
                  <ul className="space-y-2">
                    {result.postureAnalysis.improvements.map((tip: any, index: number) => (
                      <li key={index} className="flex items-start gap-2 text-muted-foreground">
                        <span className="material-symbols-outlined text-teal-400 text-sm mt-1">tips_and_updates</span>
                        {typeof tip === 'string' ? tip : (
                          <div>
                            {tip.issue && <span className="font-medium">{tip.issue}</span>}
                            {tip.solution && <span className="block text-sm">{tip.solution}</span>}
                            {tip.exercise && <span className="block text-xs text-teal-400">{tip.exercise}</span>}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
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

          {/* Download Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-foreground mb-4">
              <span className="material-symbols-outlined align-middle mr-2">download</span>
              결과 저장하기
            </h3>
            <ResultCard
              serviceType="body-analysis"
              serviceName="AI 체형 분석"
              mainResult={result.bodyType}
              highlights={[
                { label: '어깨', value: typeof result.proportions?.shoulder === 'string' ? result.proportions.shoulder : (result.proportions?.shoulder as any)?.description || '' },
                { label: '허리', value: typeof result.proportions?.waist === 'string' ? result.proportions.waist : (result.proportions?.waist as any)?.description || '' },
                { label: '힙', value: typeof result.proportions?.hip === 'string' ? result.proportions.hip : (result.proportions?.hip as any)?.description || '' },
              ]}
              colorTheme="teal"
              creditsRequired={1}
            />
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
