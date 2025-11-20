import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';
import ServiceDetailLayout from '../../components/ServiceDetailLayout';
import { analyzeNameCompatibility } from '../../services/ai';
import { getCurrentUser, isLoggedIn } from '../../services/auth';

export default function NameCompatibilityPage() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<'intro' | 'input' | 'result'>('intro');
  const [name1, setName1] = useState('');
  const [name2, setName2] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [currentCredits, setCurrentCredits] = useState(0);

  const serviceCost = 15;

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
    if (!name1 || !name2) {
      alert('두 사람의 이름을 모두 입력해주세요.');
      return;
    }

    if (currentCredits < serviceCost) {
      alert('크레딧이 부족합니다.');
      return;
    }

    setLoading(true);
    try {
      const response = await analyzeNameCompatibility(name1, name2) as any;
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
      title={t('services.fortune.nameCompatibility.title')}
      description={t('services.fortune.nameCompatibility.description')}
      icon="edit"
      color="indigo"
    >
      {/* Intro Section */}
      {step === 'intro' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined text-3xl text-indigo-600 dark:text-indigo-400">edit</span>
              <h3 className="text-xl font-semibold text-foreground">
                이름 궁합
              </h3>
            </div>
            <p className="text-muted-foreground mb-6">
              두 사람의 이름을 기반으로 궁합을 분석합니다.
              획수 분석, 음양오행 배치를 통해 이름이 주는 기운의 조화를 평가합니다.
            </p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-indigo-600 dark:text-indigo-400">calculate</span>
                  <span className="text-foreground font-medium">획수 분석</span>
                </div>
                <p className="text-muted-foreground text-sm">총 획수 조화 분석</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-indigo-600 dark:text-indigo-400">balance</span>
                  <span className="text-foreground font-medium">오행 분석</span>
                </div>
                <p className="text-muted-foreground text-sm">음양오행 배치</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-indigo-600 dark:text-indigo-400">bolt</span>
                  <span className="text-foreground font-medium">이름 기운</span>
                </div>
                <p className="text-muted-foreground text-sm">각 이름의 에너지</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-indigo-600 dark:text-indigo-400">handshake</span>
                  <span className="text-foreground font-medium">시너지</span>
                </div>
                <p className="text-muted-foreground text-sm">기운의 조화</p>
              </div>
            </div>

            <div className="bg-indigo-900/20 border border-indigo-500 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-foreground font-semibold">이름 궁합</p>
                  <p className="text-muted-foreground text-sm">AI 작명학 분석</p>
                </div>
                <div className="text-right">
                  <p className="text-indigo-600 dark:text-indigo-400 font-bold text-xl">{serviceCost} 크레딧</p>
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
              className="w-full px-6 py-4 bg-indigo-600 hover:bg-indigo-700 text-foreground font-semibold rounded-lg transition-colors"
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

            <h3 className="text-lg font-semibold text-foreground mb-4">이름 입력</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-foreground font-medium mb-2">
                  첫 번째 사람 이름
                </label>
                <input
                  type="text"
                  value={name1}
                  onChange={(e) => setName1(e.target.value)}
                  placeholder="홍길동"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-foreground focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-foreground font-medium mb-2">
                  두 번째 사람 이름
                </label>
                <input
                  type="text"
                  value={name2}
                  onChange={(e) => setName2(e.target.value)}
                  placeholder="김영희"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-foreground focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleExecute}
            disabled={!name1 || !name2 || currentCredits < serviceCost}
            className={`w-full px-6 py-4 font-semibold rounded-lg transition-colors ${
              name1 && name2 && currentCredits >= serviceCost
                ? 'bg-indigo-600 hover:bg-indigo-700 text-foreground'
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
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground">AI가 이름 궁합을 분석하고 있습니다...</p>
        </div>
      )}

      {/* Result Section */}
      {step === 'result' && result?.analysis && (
        <div className="space-y-4 animate-fadeIn">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <h3 className="text-foreground font-semibold mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-indigo-600 dark:text-indigo-400">edit</span>
              이름 궁합
            </h3>

            <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700 text-center">
              <div className="text-4xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">
                {result.analysis.compatibilityScore}점
              </div>
              <div className="text-foreground text-lg">{result.analysis.grade}</div>
              <p className="text-muted-foreground text-sm mt-2">{result.analysis.scoreReason}</p>
            </div>

            {result.analysis.strokeAnalysis && (
              <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                <h4 className="text-indigo-600 dark:text-indigo-400 font-medium mb-2">획수 분석</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                    <h5 className="text-foreground text-sm font-medium mb-1">
                      {result.analysis.strokeAnalysis.name1.name}
                    </h5>
                    <p className="text-muted-foreground text-xs">
                      총 {result.analysis.strokeAnalysis.name1.totalStrokes}획
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                    <h5 className="text-foreground text-sm font-medium mb-1">
                      {result.analysis.strokeAnalysis.name2.name}
                    </h5>
                    <p className="text-muted-foreground text-xs">
                      총 {result.analysis.strokeAnalysis.name2.totalStrokes}획
                    </p>
                  </div>
                </div>
              </div>
            )}

            {result.analysis.elementAnalysis && (
              <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                <h4 className="text-indigo-600 dark:text-indigo-400 font-medium mb-2">음양오행 분석</h4>
                <p className="text-foreground text-sm">{result.analysis.elementAnalysis.combined}</p>
              </div>
            )}

            {result.analysis.nameCharacteristics && (
              <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                <h4 className="text-indigo-600 dark:text-indigo-400 font-medium mb-2">이름의 기운</h4>
                <div className="space-y-2">
                  <div>
                    <h5 className="text-muted-foreground text-xs mb-1">첫 번째 이름</h5>
                    <p className="text-foreground text-sm">{result.analysis.nameCharacteristics.name1Energy}</p>
                  </div>
                  <div>
                    <h5 className="text-muted-foreground text-xs mb-1">두 번째 이름</h5>
                    <p className="text-foreground text-sm">{result.analysis.nameCharacteristics.name2Energy}</p>
                  </div>
                  <div>
                    <h5 className="text-muted-foreground text-xs mb-1">시너지</h5>
                    <p className="text-foreground text-sm">{result.analysis.nameCharacteristics.synergy}</p>
                  </div>
                </div>
              </div>
            )}

            {result.analysis.detailedCompatibility && (
              <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                <h4 className="text-indigo-600 dark:text-indigo-400 font-medium mb-2">세부 분석</h4>
                <div className="grid gap-2">
                  <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded">
                    <span className="text-muted-foreground text-xs">연애 궁합:</span>
                    <p className="text-foreground text-sm">{result.analysis.detailedCompatibility.love}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded">
                    <span className="text-muted-foreground text-xs">우정 궁합:</span>
                    <p className="text-foreground text-sm">{result.analysis.detailedCompatibility.friendship}</p>
                  </div>
                </div>
              </div>
            )}

            {result.analysis.advice && (
              <div>
                <h4 className="text-indigo-600 dark:text-indigo-400 font-medium mb-2">조언</h4>
                {result.analysis.advice.tips && (
                  <ul className="space-y-1">
                    {result.analysis.advice.tips.map((tip: string, idx: number) => (
                      <li key={idx} className="text-muted-foreground text-sm">• {tip}</li>
                    ))}
                  </ul>
                )}
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
