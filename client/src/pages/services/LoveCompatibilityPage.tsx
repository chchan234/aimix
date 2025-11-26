import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';
import { Loader2 } from 'lucide-react';
import ServiceDetailLayout from '../../components/ServiceDetailLayout';
import { analyzeLoveCompatibility } from '../../services/ai';
import { getCurrentUser, isLoggedIn, getToken, useCredits } from '../../services/auth';
import { useSavedResult } from '../../hooks/useSavedResult';

export default function LoveCompatibilityPage() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();

  // Check for saved result in URL
  const params = new URLSearchParams(window.location.search);
  const resultId = params.get('resultId');

  const [step, setStep] = useState<'intro' | 'input' | 'result'>(resultId ? 'result' : 'intro');
  const [person1BirthDate, setPerson1BirthDate] = useState('');
  const [person2BirthDate, setPerson2BirthDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [startingService, setStartingService] = useState(false);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [currentCredits, setCurrentCredits] = useState(0);


  // Load saved result if resultId is in URL
  const { loading: loadingSavedResult, error: savedResultError } = useSavedResult<any>((resultData) => {
    setResult(resultData);
    setStep("result");
  });

  const serviceCost = 20;

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

  const handleStartService = async () => {
    if (!isLoggedIn()) {
      alert('로그인이 필요한 서비스입니다. 로그인 후 이용해주세요.');
      return;
    }
    if (currentCredits < serviceCost) {
      alert(`크레딧이 부족합니다. 필요: ${serviceCost} 크레딧, 보유: ${currentCredits} 크레딧`);
      return;
    }

    setStartingService(true);
    try {
      const remaining = await useCredits('love-compatibility', serviceCost);
      setCurrentCredits(remaining);
      setStep('input');
    } catch (error) {
      alert(error instanceof Error ? error.message : '서비스 시작에 실패했습니다.');
    } finally {
      setStartingService(false);
    }
  };

  const handleExecute = async () => {
    if (!person1BirthDate || !person2BirthDate) {
      alert('두 사람의 생년월일을 모두 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      const response = await analyzeLoveCompatibility(person1BirthDate, person2BirthDate) as any;
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
          serviceType: 'love-compatibility',
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
    setStep('input');
  };

  return (
    <ServiceDetailLayout
      title={t('services.fortune.loveCompatibility.title')}
      description={t('services.fortune.loveCompatibility.description')}
      icon="favorite"
      color="pink"
    >
      {loadingSavedResult && (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
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
              <span className="material-symbols-outlined text-3xl text-pink-600 dark:text-pink-400">favorite</span>
              <h3 className="text-xl font-semibold text-foreground">
                연애 궁합
              </h3>
            </div>
            <p className="text-muted-foreground mb-6">
              두 사람의 생년월일을 기반으로 연애 궁합을 분석합니다.
              사주 오행 궁합, 성격 조화, 연애 스타일을 종합적으로 평가합니다.
            </p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-pink-600 dark:text-pink-400">balance</span>
                  <span className="text-foreground font-medium">오행 궁합</span>
                </div>
                <p className="text-muted-foreground text-sm">사주 오행 분석</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-pink-600 dark:text-pink-400">psychology</span>
                  <span className="text-foreground font-medium">성격 궁합</span>
                </div>
                <p className="text-muted-foreground text-sm">성격 조화 분석</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-pink-600 dark:text-pink-400">chat</span>
                  <span className="text-foreground font-medium">소통 방식</span>
                </div>
                <p className="text-muted-foreground text-sm">감정 소통 분석</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-pink-600 dark:text-pink-400">lightbulb</span>
                  <span className="text-foreground font-medium">조언</span>
                </div>
                <p className="text-muted-foreground text-sm">관계 발전 조언</p>
              </div>
            </div>

            <div className="bg-pink-900/20 border border-pink-500 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-foreground font-semibold">연애 궁합</p>
                  <p className="text-muted-foreground text-sm">AI 사주 궁합 분석</p>
                </div>
                <div className="text-right">
                  <p className="text-pink-600 dark:text-pink-400 font-bold text-xl">{serviceCost} 크레딧</p>
                </div>
              </div>
            </div>

            <button
              onClick={handleStartService}
              disabled={startingService || (!isLoggedIn() ? false : currentCredits < serviceCost)}
              className={`w-full px-6 py-4 font-semibold rounded-lg transition-colors ${
                !isLoggedIn() || currentCredits >= serviceCost
                  ? 'bg-pink-600 hover:bg-pink-700 text-foreground'
                  : 'bg-gray-400 cursor-not-allowed text-gray-600'
              }`}
            >
              {startingService ? '처리 중...' :
                (!isLoggedIn() ? `시작하기 (${serviceCost} 크레딧)` :
                  currentCredits < serviceCost
                    ? `크레딧 부족 (${currentCredits}/${serviceCost})`
                    : `시작하기 (${serviceCost} 크레딧)`)}
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

            <h3 className="text-lg font-semibold text-foreground mb-4">생년월일 입력</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-foreground font-medium mb-2">
                  나의 생년월일
                </label>
                <input
                  type="date"
                  value={person1BirthDate}
                  onChange={(e) => setPerson1BirthDate(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-foreground focus:outline-none focus:border-pink-500"
                />
              </div>

              <div>
                <label className="block text-foreground font-medium mb-2">
                  상대방 생년월일
                </label>
                <input
                  type="date"
                  value={person2BirthDate}
                  onChange={(e) => setPerson2BirthDate(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-foreground focus:outline-none focus:border-pink-500"
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleExecute}
            disabled={!person1BirthDate || !person2BirthDate || currentCredits < serviceCost}
            className={`w-full px-6 py-4 font-semibold rounded-lg transition-colors ${
              person1BirthDate && person2BirthDate && currentCredits >= serviceCost
                ? 'bg-pink-600 hover:bg-pink-700 text-foreground'
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
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground">AI가 연애 궁합을 분석하고 있습니다...</p>
        </div>
      )}

      {/* Result Section */}
      {!loadingSavedResult && !savedResultError && step === 'result' && result?.analysis && (
        <div className="space-y-4 animate-fadeIn">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <h3 className="text-foreground font-semibold mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-pink-600 dark:text-pink-400">favorite</span>
              연애 궁합
            </h3>

            <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700 text-center">
              <div className="text-4xl font-bold text-pink-600 dark:text-pink-400 mb-2">
                {result.analysis.compatibilityScore}점
              </div>
              <div className="text-foreground text-lg">{result.analysis.grade}</div>
            </div>

            {result.analysis.elementAnalysis && (
              <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                <h4 className="text-pink-600 dark:text-pink-400 font-medium mb-2">사주 오행 궁합</h4>
                {result.analysis.elementAnalysis.interaction && (
                  <p className="text-foreground text-sm mb-2">{result.analysis.elementAnalysis.interaction}</p>
                )}
                {result.analysis.elementAnalysis.yinYangBalance && (
                  <p className="text-muted-foreground text-sm mb-1">{result.analysis.elementAnalysis.yinYangBalance}</p>
                )}
                {result.analysis.elementAnalysis.complementary && (
                  <p className="text-muted-foreground text-sm">{result.analysis.elementAnalysis.complementary}</p>
                )}
              </div>
            )}

            {result.analysis.personalityMatch && (
              <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                <h4 className="text-pink-600 dark:text-pink-400 font-medium mb-2">성격 궁합</h4>
                <div className="space-y-2">
                  {result.analysis.personalityMatch.similarities && (
                    <div>
                      <h5 className="text-muted-foreground text-xs mb-1">유사점</h5>
                      <ul className="space-y-1">
                        {result.analysis.personalityMatch.similarities.map((item: string, idx: number) => (
                          <li key={idx} className="text-foreground text-sm">• {item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {result.analysis.personalityMatch.strengths && (
                    <div>
                      <h5 className="text-muted-foreground text-xs mb-1">강점</h5>
                      <ul className="space-y-1">
                        {result.analysis.personalityMatch.strengths.map((item: string, idx: number) => (
                          <li key={idx} className="text-foreground text-sm">• {item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {result.analysis.detailedCompatibility && (
              <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                <h4 className="text-pink-600 dark:text-pink-400 font-medium mb-2">세부 궁합</h4>
                <div className="grid gap-2">
                  {result.analysis.detailedCompatibility.communication && (
                    <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-muted-foreground text-xs">감정 소통</span>
                        <span className="text-pink-600 dark:text-pink-400 text-xs font-medium">{result.analysis.detailedCompatibility.communication.score}점</span>
                      </div>
                      <p className="text-foreground text-sm">{result.analysis.detailedCompatibility.communication.analysis}</p>
                    </div>
                  )}
                  {result.analysis.detailedCompatibility.values && (
                    <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-muted-foreground text-xs">가치관</span>
                        <span className="text-pink-600 dark:text-pink-400 text-xs font-medium">{result.analysis.detailedCompatibility.values.score}점</span>
                      </div>
                      <p className="text-foreground text-sm">{result.analysis.detailedCompatibility.values.analysis}</p>
                    </div>
                  )}
                  {result.analysis.detailedCompatibility.lifestyle && (
                    <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-muted-foreground text-xs">생활습관</span>
                        <span className="text-pink-600 dark:text-pink-400 text-xs font-medium">{result.analysis.detailedCompatibility.lifestyle.score}점</span>
                      </div>
                      <p className="text-foreground text-sm">{result.analysis.detailedCompatibility.lifestyle.analysis}</p>
                    </div>
                  )}
                  {result.analysis.detailedCompatibility.physical && (
                    <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-muted-foreground text-xs">신체적 궁합</span>
                        <span className="text-pink-600 dark:text-pink-400 text-xs font-medium">{result.analysis.detailedCompatibility.physical.score}점</span>
                      </div>
                      <p className="text-foreground text-sm">{result.analysis.detailedCompatibility.physical.analysis}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {result.analysis.advice && (
              <div>
                <h4 className="text-pink-600 dark:text-pink-400 font-medium mb-2">조언</h4>
                <div className="space-y-3">
                  {result.analysis.advice.forPerson1 && (
                    <div>
                      <p className="text-sm text-pink-600 dark:text-pink-400 mb-1">나에게:</p>
                      <p className="text-foreground text-sm">{result.analysis.advice.forPerson1}</p>
                    </div>
                  )}
                  {result.analysis.advice.forPerson2 && (
                    <div>
                      <p className="text-sm text-pink-600 dark:text-pink-400 mb-1">상대방에게:</p>
                      <p className="text-foreground text-sm">{result.analysis.advice.forPerson2}</p>
                    </div>
                  )}
                  {result.analysis.advice.together && Array.isArray(result.analysis.advice.together) && (
                    <div>
                      <p className="text-sm text-green-600 dark:text-green-400 mb-1">함께 하면 좋은 것:</p>
                      <ul className="space-y-1">
                        {result.analysis.advice.together.map((item: string, idx: number) => (
                          <li key={idx} className="text-muted-foreground text-sm">• {item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {result.analysis.advice.avoid && Array.isArray(result.analysis.advice.avoid) && (
                    <div>
                      <p className="text-sm text-red-600 dark:text-red-400 mb-1">피해야 할 것:</p>
                      <ul className="space-y-1">
                        {result.analysis.advice.avoid.map((item: string, idx: number) => (
                          <li key={idx} className="text-muted-foreground text-sm">• {item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {result.analysis.advice.conflictResolution && (
                    <div>
                      <p className="text-sm text-blue-600 dark:text-blue-400 mb-1">화해법:</p>
                      <p className="text-muted-foreground text-sm">{result.analysis.advice.conflictResolution}</p>
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
