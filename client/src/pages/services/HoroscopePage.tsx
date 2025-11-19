import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';
import ServiceDetailLayout from '../../components/ServiceDetailLayout';
import { analyzeHoroscope } from '../../services/ai';
import { getCurrentUser, isLoggedIn } from '../../services/auth';

const ZODIAC_SIGNS = [
  { value: 'aries', label: '양자리 (3/21-4/19)' },
  { value: 'taurus', label: '황소자리 (4/20-5/20)' },
  { value: 'gemini', label: '쌍둥이자리 (5/21-6/21)' },
  { value: 'cancer', label: '게자리 (6/22-7/22)' },
  { value: 'leo', label: '사자자리 (7/23-8/22)' },
  { value: 'virgo', label: '처녀자리 (8/23-9/22)' },
  { value: 'libra', label: '천칭자리 (9/23-10/22)' },
  { value: 'scorpio', label: '전갈자리 (10/23-11/22)' },
  { value: 'sagittarius', label: '사수자리 (11/23-12/21)' },
  { value: 'capricorn', label: '염소자리 (12/22-1/19)' },
  { value: 'aquarius', label: '물병자리 (1/20-2/18)' },
  { value: 'pisces', label: '물고기자리 (2/19-3/20)' },
];

export default function HoroscopePage() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<'intro' | 'input' | 'result'>('intro');
  const [birthDate, setBirthDate] = useState('');
  const [zodiacSign, setZodiacSign] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [currentCredits, setCurrentCredits] = useState(0);

  const serviceCost = 15;

  useEffect(() => {
    if (!isLoggedIn()) {
      alert('로그인 후 이용해주세요.');
      setLocation('/');
      return;
    }

    const fetchUserData = async () => {
      try {
        const user = await getCurrentUser();
        setCurrentCredits(user.credits);
      } catch (error) {
        console.error('Failed to fetch user data:', error);
        alert('로그인 후 이용해주세요.');
        setLocation('/');
      }
    };
    fetchUserData();
  }, [setLocation]);

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
      const response = await analyzeHoroscope(birthDate, zodiacSign || undefined) as any;
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
      title={t('services.fortune.horoscope.title')}
      description={t('services.fortune.horoscope.description')}
      icon="star"
      color="yellow"
    >
      {/* Intro Section */}
      {step === 'intro' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined text-3xl text-yellow-400">star</span>
              <h3 className="text-xl font-semibold text-foreground">
                별자리 운세
              </h3>
            </div>
            <p className="text-muted-foreground mb-6">
              서양 점성술을 기반으로 별자리 운세를 제공합니다.
              오늘, 이번 주, 이번 달, 올해의 운세와 함께 세부 운세를 확인하세요.
            </p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-yellow-400">today</span>
                  <span className="text-foreground font-medium">오늘 운세</span>
                </div>
                <p className="text-muted-foreground text-sm">당일 운세 분석</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-yellow-400">date_range</span>
                  <span className="text-foreground font-medium">주간 운세</span>
                </div>
                <p className="text-muted-foreground text-sm">이번 주 운세 전망</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-yellow-400">calendar_month</span>
                  <span className="text-foreground font-medium">월간 운세</span>
                </div>
                <p className="text-muted-foreground text-sm">이번 달 운세 예측</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-yellow-400">auto_awesome</span>
                  <span className="text-foreground font-medium">행운 요소</span>
                </div>
                <p className="text-muted-foreground text-sm">행운의 숫자/색상</p>
              </div>
            </div>

            <div className="bg-yellow-900/20 border border-yellow-500 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-foreground font-semibold">별자리 운세</p>
                  <p className="text-muted-foreground text-sm">서양 점성술 분석</p>
                </div>
                <div className="text-right">
                  <p className="text-yellow-400 font-bold text-xl">{serviceCost} 크레딧</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setStep('input')}
              className="w-full px-6 py-4 bg-yellow-600 hover:bg-yellow-700 text-foreground font-semibold rounded-lg transition-colors"
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
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-foreground focus:outline-none focus:border-yellow-500"
                />
              </div>

              <div>
                <label className="block text-foreground font-medium mb-2">
                  별자리 (선택사항)
                </label>
                <select
                  value={zodiacSign}
                  onChange={(e) => setZodiacSign(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-foreground focus:outline-none focus:border-yellow-500"
                >
                  <option value="">자동 판별</option>
                  {ZODIAC_SIGNS.map((sign) => (
                    <option key={sign.value} value={sign.value}>
                      {sign.label}
                    </option>
                  ))}
                </select>
                <p className="text-muted-foreground text-xs mt-1">
                  비워두면 생년월일로 자동 판별됩니다
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleExecute}
            disabled={!birthDate || currentCredits < serviceCost}
            className={`w-full px-6 py-4 font-semibold rounded-lg transition-colors ${
              birthDate && currentCredits >= serviceCost
                ? 'bg-yellow-600 hover:bg-yellow-700 text-foreground'
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
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground">AI가 별자리 운세를 분석하고 있습니다...</p>
        </div>
      )}

      {/* Result Section */}
      {step === 'result' && result?.analysis && (
        <div className="space-y-4 animate-fadeIn">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <h3 className="text-foreground font-semibold mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-yellow-400">star</span>
              별자리 운세
            </h3>

            {result.analysis.zodiacSign && (
              <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                <h4 className="text-yellow-400 font-medium mb-2">
                  {result.analysis.zodiacSign.name}
                </h4>
                <p className="text-muted-foreground text-sm">{result.analysis.zodiacSign.period}</p>
                <p className="text-foreground text-sm mt-2">{result.analysis.zodiacSign.element}</p>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <h4 className="text-yellow-400 font-medium mb-2">오늘의 운세</h4>
                <p className="text-foreground text-sm">{result.analysis.dailyFortune}</p>
              </div>

              <div>
                <h4 className="text-yellow-400 font-medium mb-2">이번 주 운세</h4>
                <p className="text-foreground text-sm">{result.analysis.weeklyFortune}</p>
              </div>

              <div>
                <h4 className="text-yellow-400 font-medium mb-2">이번 달 운세</h4>
                <p className="text-foreground text-sm">{result.analysis.monthlyFortune}</p>
              </div>
            </div>

            {result.analysis.luckyElements && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <h4 className="text-yellow-400 font-medium mb-2">행운의 요소</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">숫자:</span>
                    <span className="text-foreground ml-2">
                      {result.analysis.luckyElements.numbers?.join(', ')}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">색상:</span>
                    <span className="text-foreground ml-2">
                      {result.analysis.luckyElements.colors?.join(', ')}
                    </span>
                  </div>
                </div>
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
