import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import ServiceDetailLayout from '../../components/ServiceDetailLayout';
import { analyzeZodiac } from '../../services/ai';
import { getCurrentUser, isLoggedIn } from '../../services/auth';

export default function ZodiacPage() {
  const { t } = useTranslation();
  const [step, setStep] = useState<'intro' | 'input' | 'result'>('intro');
  const [birthDate, setBirthDate] = useState('');
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

  const handleExecute = async () => {
    if (!birthDate) {
      alert('생년월일을 입력해주세요.');
      return;
    }

    if (currentCredits < serviceCost) {
      alert('크레딧이 부족합니다.');
      return;
    }

    setLoading(true);
    try {
      const response = await analyzeZodiac(birthDate) as any;
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
      title={t('services.fortune.zodiac.title')}
      description={t('services.fortune.zodiac.description')}
      icon="pets"
      color="orange"
    >
      {/* Intro Section */}
      {step === 'intro' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined text-3xl text-orange-400">pets</span>
              <h3 className="text-xl font-semibold text-foreground">
                띠 운세
              </h3>
            </div>
            <p className="text-muted-foreground mb-6">
              12띠를 기반으로 올해의 운세를 분석합니다.
              월별 운세와 재물운, 애정운, 직장운, 건강운을 종합적으로 제공합니다.
            </p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-orange-400">calendar_today</span>
                  <span className="text-foreground font-medium">올해 운세</span>
                </div>
                <p className="text-muted-foreground text-sm">연간 총운 분석</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-orange-400">paid</span>
                  <span className="text-foreground font-medium">재물운</span>
                </div>
                <p className="text-muted-foreground text-sm">금전 운세 분석</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-orange-400">favorite</span>
                  <span className="text-foreground font-medium">애정운</span>
                </div>
                <p className="text-muted-foreground text-sm">연애/결혼 운세</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-orange-400">work</span>
                  <span className="text-foreground font-medium">직장운</span>
                </div>
                <p className="text-muted-foreground text-sm">직업/사업 운세</p>
              </div>
            </div>

            <div className="bg-orange-900/20 border border-orange-500 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-foreground font-semibold">띠 운세</p>
                  <p className="text-muted-foreground text-sm">12지신 기반 분석</p>
                </div>
                <div className="text-right">
                  <p className="text-orange-400 font-bold text-xl">{serviceCost} 크레딧</p>
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
              className="w-full px-6 py-4 bg-orange-600 hover:bg-orange-700 text-foreground font-semibold rounded-lg transition-colors"
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

            <h3 className="text-lg font-semibold text-foreground mb-4">생년월일 입력</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-foreground font-medium mb-2">
                  생년월일
                </label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-foreground focus:outline-none focus:border-orange-500"
                />
                <p className="text-muted-foreground text-xs mt-1">
                  생년월일을 기반으로 띠를 자동 판별합니다
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleExecute}
            disabled={!birthDate || currentCredits < serviceCost}
            className={`w-full px-6 py-4 font-semibold rounded-lg transition-colors ${
              birthDate && currentCredits >= serviceCost
                ? 'bg-orange-600 hover:bg-orange-700 text-foreground'
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
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground">AI가 띠 운세를 분석하고 있습니다...</p>
        </div>
      )}

      {/* Result Section */}
      {step === 'result' && result?.analysis && (
        <div className="space-y-4 animate-fadeIn">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <h3 className="text-foreground font-semibold mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-orange-400">pets</span>
              띠 운세
            </h3>

            {result.analysis.zodiac && (
              <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                <h4 className="text-orange-400 font-medium mb-2">
                  {result.analysis.zodiac.animal}띠
                </h4>
                <p className="text-muted-foreground text-sm mb-2">
                  오행: {result.analysis.zodiac.element}
                </p>
                {result.analysis.zodiac.traits && (
                  <div className="mt-2">
                    <p className="text-foreground text-sm">
                      {result.analysis.zodiac.traits.join(', ')}
                    </p>
                  </div>
                )}
              </div>
            )}

            {result.analysis.yearlyFortune && (
              <div className="space-y-3 mb-4">
                <div>
                  <h4 className="text-orange-400 font-medium mb-2">올해 운세</h4>
                  <p className="text-foreground text-sm">{result.analysis.yearlyFortune.overall}</p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <h5 className="text-muted-foreground text-xs mb-1">상반기</h5>
                    <p className="text-foreground text-sm">{result.analysis.yearlyFortune.firstHalf}</p>
                  </div>
                  <div>
                    <h5 className="text-muted-foreground text-xs mb-1">하반기</h5>
                    <p className="text-foreground text-sm">{result.analysis.yearlyFortune.secondHalf}</p>
                  </div>
                </div>
              </div>
            )}

            {result.analysis.detailedFortune && (
              <div className="space-y-2">
                <h4 className="text-orange-400 font-medium mb-2">세부 운세</h4>
                <div className="grid gap-2">
                  <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded">
                    <span className="text-muted-foreground text-xs">재물운:</span>
                    <p className="text-foreground text-sm">{result.analysis.detailedFortune.wealth}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded">
                    <span className="text-muted-foreground text-xs">애정운:</span>
                    <p className="text-foreground text-sm">{result.analysis.detailedFortune.love}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded">
                    <span className="text-muted-foreground text-xs">직장운:</span>
                    <p className="text-foreground text-sm">{result.analysis.detailedFortune.career}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded">
                    <span className="text-muted-foreground text-xs">건강운:</span>
                    <p className="text-foreground text-sm">{result.analysis.detailedFortune.health}</p>
                  </div>
                </div>
              </div>
            )}

            {result.analysis.advice && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <h4 className="text-orange-400 font-medium mb-2">조언</h4>
                {result.analysis.advice.luckyTips && (
                  <ul className="space-y-1">
                    {result.analysis.advice.luckyTips.map((tip: string, idx: number) => (
                      <li key={idx} className="text-muted-foreground text-sm">• {tip}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          <button
            onClick={handleReset}
            className="w-full px-4 py-3 bg-gray-600 hover:bg-gray-500 text-foreground rounded-lg transition"
          >
            다시 분석하기
          </button>
        </div>
      )}
    </ServiceDetailLayout>
  );
}
