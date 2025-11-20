import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';
import ServiceDetailLayout from '../../components/ServiceDetailLayout';
import { analyzeMarriageCompatibility } from '../../services/ai';
import { getCurrentUser, isLoggedIn } from '../../services/auth';

export default function MarriageCompatibilityPage() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<'intro' | 'input' | 'result'>('intro');
  const [person1Name, setPerson1Name] = useState('');
  const [person1BirthDate, setPerson1BirthDate] = useState('');
  const [person2Name, setPerson2Name] = useState('');
  const [person2BirthDate, setPerson2BirthDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [currentCredits, setCurrentCredits] = useState(0);

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

  const handleExecute = async () => {
    if (!person1Name || !person1BirthDate || !person2Name || !person2BirthDate) {
      alert('모든 정보를 입력해주세요.');
      return;
    }

    if (currentCredits < serviceCost) {
      alert('크레딧이 부족합니다.');
      return;
    }

    setLoading(true);
    try {
      const response = await analyzeMarriageCompatibility(
        person1Name,
        person1BirthDate,
        person2Name,
        person2BirthDate
      ) as any;
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

  const handleReset = () => {
    setResult(null);
    setStep('input');
  };

  return (
    <ServiceDetailLayout
      title={t('services.fortune.marriageCompatibility.title')}
      description={t('services.fortune.marriageCompatibility.description')}
      icon="family_restroom"
      color="red"
    >
      {/* Intro Section */}
      {step === 'intro' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined text-3xl text-red-600 dark:text-red-400">family_restroom</span>
              <h3 className="text-xl font-semibold text-foreground">
                결혼 궁합
              </h3>
            </div>
            <p className="text-muted-foreground mb-6">
              두 사람의 이름과 생년월일을 기반으로 결혼 궁합을 종합적으로 분석합니다.
              사주 궁합, 이름 궁합, 세부 결혼 궁합 항목을 포함한 100점 만점 평가를 제공합니다.
            </p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-red-600 dark:text-red-400">balance</span>
                  <span className="text-foreground font-medium">사주 궁합</span>
                </div>
                <p className="text-muted-foreground text-sm">오행/음양 조화</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-red-600 dark:text-red-400">edit</span>
                  <span className="text-foreground font-medium">이름 궁합</span>
                </div>
                <p className="text-muted-foreground text-sm">획수 조화 분석</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-red-600 dark:text-red-400">event</span>
                  <span className="text-foreground font-medium">결혼 적기</span>
                </div>
                <p className="text-muted-foreground text-sm">최적 결혼 시기</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-red-600 dark:text-red-400">lightbulb</span>
                  <span className="text-foreground font-medium">조언</span>
                </div>
                <p className="text-muted-foreground text-sm">행복한 결혼 조언</p>
              </div>
            </div>

            <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-foreground font-semibold">결혼 궁합</p>
                  <p className="text-muted-foreground text-sm">종합 궁합 분석</p>
                </div>
                <div className="text-right">
                  <p className="text-red-600 dark:text-red-400 font-bold text-xl">{serviceCost} 크레딧</p>
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
              className="w-full px-6 py-4 bg-red-600 hover:bg-red-700 text-foreground font-semibold rounded-lg transition-colors"
            >
              시작하기 ({serviceCost} 크레딧)
            </button>
          </div>
        </div>
      )}

      {/* Input Section */}
      {step === 'input' && !loading && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setStep('intro')}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
            >
              <span className="material-symbols-outlined">arrow_back</span>
              뒤로가기
            </button>

            <h3 className="text-lg font-semibold text-foreground mb-4">정보 입력</h3>

            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                <h4 className="text-foreground font-medium mb-3">나</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-foreground text-sm font-medium mb-2">
                      이름
                    </label>
                    <input
                      type="text"
                      value={person1Name}
                      onChange={(e) => setPerson1Name(e.target.value)}
                      placeholder="홍길동"
                      className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-foreground focus:outline-none focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-foreground text-sm font-medium mb-2">
                      생년월일
                    </label>
                    <input
                      type="date"
                      value={person1BirthDate}
                      onChange={(e) => setPerson1BirthDate(e.target.value)}
                      className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-foreground focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                <h4 className="text-foreground font-medium mb-3">상대방</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-foreground text-sm font-medium mb-2">
                      이름
                    </label>
                    <input
                      type="text"
                      value={person2Name}
                      onChange={(e) => setPerson2Name(e.target.value)}
                      placeholder="김영희"
                      className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-foreground focus:outline-none focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-foreground text-sm font-medium mb-2">
                      생년월일
                    </label>
                    <input
                      type="date"
                      value={person2BirthDate}
                      onChange={(e) => setPerson2BirthDate(e.target.value)}
                      className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-foreground focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleExecute}
            disabled={!person1Name || !person1BirthDate || !person2Name || !person2BirthDate || currentCredits < serviceCost}
            className={`w-full px-6 py-4 font-semibold rounded-lg transition-colors ${
              person1Name && person1BirthDate && person2Name && person2BirthDate && currentCredits >= serviceCost
                ? 'bg-red-600 hover:bg-red-700 text-foreground'
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
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground">AI가 결혼 궁합을 분석하고 있습니다...</p>
        </div>
      )}

      {/* Result Section */}
      {step === 'result' && result?.analysis && (
        <div className="space-y-4 animate-fadeIn">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <h3 className="text-foreground font-semibold mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-red-600 dark:text-red-400">family_restroom</span>
              결혼 궁합
            </h3>

            <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700 text-center">
              <div className="text-4xl font-bold text-red-600 dark:text-red-400 mb-2">
                {result.analysis.overallScore}점
              </div>
              <div className="text-foreground text-lg mb-2">{result.analysis.grade}</div>
              <p className="text-muted-foreground text-sm">{result.analysis.suitability}</p>
            </div>

            {result.analysis.sajuCompatibility && (
              <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                <h4 className="text-red-600 dark:text-red-400 font-medium mb-2">
                  사주 궁합 ({result.analysis.sajuCompatibility.score}/{result.analysis.sajuCompatibility.maxScore}점)
                </h4>
                <div className="space-y-2">
                  <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded">
                    <span className="text-muted-foreground text-xs">오행 상생상극:</span>
                    <p className="text-foreground text-sm">{result.analysis.sajuCompatibility.elementHarmony.analysis}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded">
                    <span className="text-muted-foreground text-xs">음양 조화:</span>
                    <p className="text-foreground text-sm">{result.analysis.sajuCompatibility.yinYangBalance.analysis}</p>
                  </div>
                </div>
              </div>
            )}

            {result.analysis.nameCompatibility && (
              <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                <h4 className="text-red-600 dark:text-red-400 font-medium mb-2">
                  이름 궁합 ({result.analysis.nameCompatibility.score}/{result.analysis.nameCompatibility.maxScore}점)
                </h4>
                <div className="space-y-2">
                  <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded">
                    <span className="text-muted-foreground text-xs">획수 조화:</span>
                    <p className="text-foreground text-sm">{result.analysis.nameCompatibility.strokeHarmony.analysis}</p>
                  </div>
                </div>
              </div>
            )}

            {result.analysis.detailedAnalysis && (
              <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                <h4 className="text-red-600 dark:text-red-400 font-medium mb-2">세부 결혼 궁합</h4>
                <div className="grid gap-2">
                  {Object.entries(result.analysis.detailedAnalysis).map(([key, value]: [string, any]) => (
                    <div key={key} className="bg-gray-50 dark:bg-gray-700 p-2 rounded">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-muted-foreground text-xs capitalize">{key}:</span>
                        <span className="text-foreground text-xs font-medium">{value.score}점</span>
                      </div>
                      <p className="text-foreground text-sm">{value.analysis}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.analysis.bestMarriageTiming && (
              <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                <h4 className="text-red-600 dark:text-red-400 font-medium mb-2">결혼 적기</h4>
                <p className="text-foreground text-sm mb-2">{result.analysis.bestMarriageTiming.reason}</p>
                {result.analysis.bestMarriageTiming.recommendedPeriods && (
                  <div className="text-muted-foreground text-xs">
                    추천: {result.analysis.bestMarriageTiming.recommendedPeriods.join(', ')}
                  </div>
                )}
              </div>
            )}

            {result.analysis.advice && (
              <div>
                <h4 className="text-red-600 dark:text-red-400 font-medium mb-2">조언</h4>
                <div className="space-y-2">
                  {result.analysis.advice.strengths && (
                    <div>
                      <h5 className="text-muted-foreground text-xs mb-1">강점</h5>
                      <ul className="space-y-1">
                        {result.analysis.advice.strengths.map((item: string, idx: number) => (
                          <li key={idx} className="text-foreground text-sm">• {item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {result.analysis.advice.tips && (
                    <div>
                      <h5 className="text-muted-foreground text-xs mb-1">행복한 결혼을 위한 조언</h5>
                      <ul className="space-y-1">
                        {result.analysis.advice.tips.map((tip: string, idx: number) => (
                          <li key={idx} className="text-foreground text-sm">• {tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleReset}
            className="w-full px-4 py-3 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-foreground rounded-lg transition"
          >
            다시 분석하기
          </button>
        </div>
      )}
    </ServiceDetailLayout>
  );
}
