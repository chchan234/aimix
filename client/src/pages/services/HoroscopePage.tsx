import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';
import ServiceDetailLayout from '../../components/ServiceDetailLayout';
import ExecuteButton from '../../components/ExecuteButton';
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

    setLoading(true);
    try {
      const response = await analyzeHoroscope(birthDate, zodiacSign || undefined) as any;
      setResult(response);

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

  return (
    <ServiceDetailLayout
      title={t('services.fortune.horoscope.title')}
      description={t('services.fortune.horoscope.description')}
      icon="star"
      color="yellow"
    >
      <div className="space-y-6">
        <div className="bg-gray-50 dark:bg-[#0d0d0d] rounded-lg p-4 border border-yellow-500/20">
          <h3 className="text-foreground font-semibold mb-2">서비스 안내</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            서양 점성술을 기반으로 별자리 운세를 제공합니다.
            오늘, 이번 주, 이번 달, 올해의 운세와 함께 세부 운세를 확인하세요.
          </p>
        </div>

        {!result && (
          <div className="space-y-4">
            <div>
              <label className="block text-foreground font-medium mb-2">
                생년월일
              </label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0d0d0d] border border-gray-300 dark:border-gray-600 rounded-lg text-foreground focus:outline-none focus:border-yellow-500"
              />
            </div>

            <div>
              <label className="block text-foreground font-medium mb-2">
                별자리 (선택사항)
              </label>
              <select
                value={zodiacSign}
                onChange={(e) => setZodiacSign(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0d0d0d] border border-gray-300 dark:border-gray-600 rounded-lg text-foreground focus:outline-none focus:border-yellow-500"
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

            <ExecuteButton
              credits={serviceCost}
              currentCredits={currentCredits}
              onClick={handleExecute}
              loading={loading}
              disabled={!birthDate}
            />
          </div>
        )}

        {result?.analysis && (
          <div className="space-y-4 animate-fadeIn">
            <div className="bg-yellow-500/10 rounded-lg p-4 border border-yellow-500/20">
              <h3 className="text-foreground font-semibold mb-3">⭐ 별자리 운세</h3>

              {result.analysis.zodiacSign && (
                <div className="mb-4 pb-4 border-b border-yellow-500/10">
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
                <div className="mt-4 pt-4 border-t border-yellow-500/10">
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
              onClick={() => setResult(null)}
              className="w-full px-4 py-3 bg-yellow-600 hover:bg-yellow-700 text-foreground rounded-lg transition"
            >
              다시 분석하기
            </button>
          </div>
        )}
      </div>
    </ServiceDetailLayout>
  );
}
