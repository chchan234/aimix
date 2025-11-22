import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';
import { Loader2 } from 'lucide-react';
import ServiceDetailLayout from '../../components/ServiceDetailLayout';
import { analyzePalmistry } from '../../services/ai';
import { getCurrentUser, isLoggedIn, getToken } from '../../services/auth';
import { useSavedResult } from '../../hooks/useSavedResult';

export default function PalmistryPage() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();

  // Check for saved result in URL
  const params = new URLSearchParams(window.location.search);
  const resultId = params.get('resultId');

  const [step, setStep] = useState<'intro' | 'input' | 'result'>(resultId ? 'result' : 'intro');
  const [hand, setHand] = useState<'left' | 'right'>('right');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [currentCredits, setCurrentCredits] = useState(0);

  // Load saved result if resultId is in URL
  const { loading: loadingSavedResult, error: savedResultError } = useSavedResult<any>((resultData) => {
    setResult(resultData);
    setStep("result");
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const serviceCost = 25;

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = await getCurrentUser();
        setCurrentCredits(user.credits);
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      }
    };
    fetchUserData();
  }, []);

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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleExecute = async () => {
    if (!imagePreview) {
      alert('손바닥 이미지를 업로드해주세요.');
      return;
    }

    if (currentCredits < serviceCost) {
      alert('크레딧이 부족합니다.');
      return;
    }

    setLoading(true);
    try {
      const response = await analyzePalmistry(imagePreview, hand) as any;
      setResult(response);
      setStep('result');

      if (response.credits?.remaining !== undefined) {
        setCurrentCredits(response.credits.remaining);
      }
    } catch (error) {
      console.error('Error:', error);
      alert(error instanceof Error ? error.message : '분석 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveResult = async () => {
    if (!result) {
      alert('저장할 결과가 없습니다.');
      return;
    }

    try {
      setSaving(true);
      const token = getToken();
      if (!token) {
        alert('로그인이 필요합니다.');
        setLocation('/login');
        return;
      }

      const response = await fetch('/api/results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          serviceType: 'palmistry',
          inputData: {},
          resultData: result,
          aiModel: 'gemini',
          tokensUsed: 0,
          processingTime: 0,
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          alert('로그인이 필요합니다.');
          setLocation('/login');
          return;
        }
        throw new Error('Failed to save result');
      }

      alert('결과가 저장되었습니다! "내 결과물"에서 확인할 수 있습니다.');
    } catch (error) {
      console.error('Error saving result:', error);
      alert('결과 저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setImagePreview(null);
    setStep('input');
  };

  return (
    <ServiceDetailLayout
      title={t('services.fortune.palmistry.title')}
      description={t('services.fortune.palmistry.description')}
      icon="back_hand"
      color="green"
    >
      {loadingSavedResult && (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-green-500" />
          <span className="ml-3 text-muted-foreground">저장된 결과를 불러오는 중...</span>
        </div>
      )}

      {savedResultError && (
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 text-red-400">
          {savedResultError}
        </div>
      )}

      {/* Intro Section */}
      {!loadingSavedResult && !savedResultError && step === 'intro' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined text-3xl text-green-600 dark:text-green-400">back_hand</span>
              <h3 className="text-xl font-semibold text-foreground">
                AI 수상 분석
              </h3>
            </div>
            <p className="text-muted-foreground mb-6">
              손바닥 사진을 업로드하면 AI가 손금을 분석하여 운세와 성격을 알려드립니다.
              생명선, 운명선, 감정선, 지능선, 재물선, 결혼선, 태양선을 포함한 종합 분석을 제공합니다.
            </p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-green-600 dark:text-green-400">health_and_safety</span>
                  <span className="text-foreground font-medium">생명선</span>
                </div>
                <p className="text-muted-foreground text-sm">건강과 생명력 분석</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-green-600 dark:text-green-400">psychology</span>
                  <span className="text-foreground font-medium">지능선</span>
                </div>
                <p className="text-muted-foreground text-sm">지적 능력과 사고방식</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-green-600 dark:text-green-400">favorite</span>
                  <span className="text-foreground font-medium">감정선</span>
                </div>
                <p className="text-muted-foreground text-sm">감정과 인간관계</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-green-600 dark:text-green-400">trending_up</span>
                  <span className="text-foreground font-medium">운명선</span>
                </div>
                <p className="text-muted-foreground text-sm">인생 방향과 성공</p>
              </div>
            </div>

            <div className="bg-green-900/20 border border-green-500 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-foreground font-semibold">수상 분석</p>
                  <p className="text-muted-foreground text-sm">AI 손금 분석</p>
                </div>
                <div className="text-right">
                  <p className="text-green-600 dark:text-green-400 font-bold text-xl">{serviceCost} 크레딧</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                if (!isLoggedIn()) {
                  alert('로그인이 필요한 서비스입니다. 로그인 후 이용해주세요.');
                  return;
                }
                setStep('input');
              }}
              className="w-full px-6 py-4 bg-green-600 hover:bg-green-700 text-foreground font-semibold rounded-lg transition-colors"
            >
              시작하기 ({serviceCost} 크레딧)
            </button>
          </div>
        </div>
      )}

      {/* Input Section */}
      {!loadingSavedResult && !savedResultError && step === 'input' && !loading && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setStep('intro')}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
            >
              <span className="material-symbols-outlined">arrow_back</span>
              뒤로가기
            </button>

            <h3 className="text-lg font-semibold text-foreground mb-4">손바닥 사진 업로드</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-foreground font-medium mb-2">
                  손 선택
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setHand('right')}
                    className={`p-3 rounded-lg border text-center transition ${
                      hand === 'right'
                        ? 'border-green-500 bg-green-500/10 text-green-600 dark:text-green-400'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-500 text-foreground'
                    }`}
                  >
                    오른손
                  </button>
                  <button
                    onClick={() => setHand('left')}
                    className={`p-3 rounded-lg border text-center transition ${
                      hand === 'left'
                        ? 'border-green-500 bg-green-500/10 text-green-600 dark:text-green-400'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-500 text-foreground'
                    }`}
                  >
                    왼손
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-foreground font-medium mb-2">
                  손바닥 이미지 업로드
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-foreground hover:border-green-500 transition"
                >
                  {imagePreview ? '이미지 변경하기' : '이미지 선택하기'}
                </button>
                <p className="text-muted-foreground text-xs mt-1">
                  손바닥이 선명하게 보이는 사진을 업로드해주세요
                </p>
              </div>

              {imagePreview && (
                <div className="rounded-lg overflow-hidden border border-green-500/20">
                  <img
                    src={imagePreview}
                    alt="Hand preview"
                    className="w-full h-auto"
                  />
                </div>
              )}
            </div>
          </div>

          <button
            onClick={handleExecute}
            disabled={!imagePreview || currentCredits < serviceCost}
            className={`w-full px-6 py-4 font-semibold rounded-lg transition-colors ${
              imagePreview && currentCredits >= serviceCost
                ? 'bg-green-600 hover:bg-green-700 text-foreground'
                : 'bg-gray-600 text-muted-foreground cursor-not-allowed'
            }`}
          >
            {currentCredits < serviceCost ? '크레딧 부족' : '분석하기'}
          </button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground">AI가 손금을 분석하고 있습니다...</p>
        </div>
      )}

      {/* Result Section */}
      {!loadingSavedResult && !savedResultError && step === 'result' && result?.analysis && (
        <div className="space-y-4 animate-fadeIn">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <h3 className="text-foreground font-semibold mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-green-600 dark:text-green-400">back_hand</span>
              수상 분석 결과
            </h3>

            {result.analysis.handShape && (
              <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                <h4 className="text-green-600 dark:text-green-400 font-medium mb-2">손 모양</h4>
                <p className="text-foreground text-sm mb-1">{result.analysis.handShape.type}</p>
                <p className="text-muted-foreground text-sm">{result.analysis.handShape.description}</p>
              </div>
            )}

            {result.analysis.majorLines && (
              <div className="space-y-3">
                <h4 className="text-green-600 dark:text-green-400 font-medium">주요 손금 분석</h4>
                {Object.entries(result.analysis.majorLines).map(([key, value]: [string, any]) => {
                  const lineNames: { [key: string]: string } = {
                    lifeLine: '생명선',
                    fateLine: '운명선',
                    heartLine: '감정선',
                    headLine: '지능선',
                    moneyLine: '재물선',
                    marriageLine: '결혼선',
                    sunLine: '태양선'
                  };
                  const lineName = lineNames[key] || key;

                  // Get the main fortune field for this line type
                  const fortuneField = value.healthFortune || value.careerFortune ||
                    value.loveFortune || value.thinkingStyle || value.wealthFortune ||
                    value.marriageTiming || value.fameFortune || '';

                  return (
                    <div key={key} className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                      <p className="text-green-600 dark:text-green-400 font-medium text-sm mb-2">{lineName}</p>
                      {value.appearance && (
                        <p className="text-foreground text-sm mb-1">{value.appearance}</p>
                      )}
                      {value.meaning && (
                        <p className="text-muted-foreground text-xs mb-1">{value.meaning}</p>
                      )}
                      {fortuneField && (
                        <p className="text-muted-foreground text-xs">{fortuneField}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {result.analysis.advice && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <h4 className="text-green-600 dark:text-green-400 font-medium mb-2">조언</h4>
                <div className="space-y-3">
                  {result.analysis.advice.doThis && Array.isArray(result.analysis.advice.doThis) && (
                    <div>
                      <p className="text-sm text-green-600 dark:text-green-400 mb-1">이렇게 하세요:</p>
                      <ul className="space-y-1">
                        {result.analysis.advice.doThis.map((item: string, idx: number) => (
                          <li key={idx} className="text-muted-foreground text-sm">• {item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {result.analysis.advice.avoidThis && Array.isArray(result.analysis.advice.avoidThis) && (
                    <div>
                      <p className="text-sm text-red-600 dark:text-red-400 mb-1">피하세요:</p>
                      <ul className="space-y-1">
                        {result.analysis.advice.avoidThis.map((item: string, idx: number) => (
                          <li key={idx} className="text-muted-foreground text-sm">• {item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {result.analysis.advice.luckyTips && Array.isArray(result.analysis.advice.luckyTips) && (
                    <div>
                      <p className="text-sm text-purple-600 dark:text-purple-400 mb-1">행운 팁:</p>
                      <ul className="space-y-1">
                        {result.analysis.advice.luckyTips.map((item: string, idx: number) => (
                          <li key={idx} className="text-muted-foreground text-sm">• {item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {result.analysis.advice.finalMessage && (
                    <p className="text-muted-foreground text-sm mt-2 italic">
                      {result.analysis.advice.finalMessage}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <button
              onClick={handleSaveResult}
              disabled={saving}
              className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <span className="material-symbols-outlined animate-spin">progress_activity</span>
                  저장 중...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">save</span>
                  결과 저장하기
                </>
              )}
            </button>

            <button
              onClick={handleReset}
              className="w-full px-4 py-3 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-foreground rounded-lg transition"
            >
              다시 분석하기
            </button>
          </div>
        </div>
      )}
    </ServiceDetailLayout>
  );
}
