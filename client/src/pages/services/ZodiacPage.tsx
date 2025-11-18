import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';
import ServiceDetailLayout from '../../components/ServiceDetailLayout';
import ExecuteButton from '../../components/ExecuteButton';
import { analyzeZodiac } from '../../services/ai';
import { getCurrentUser, isLoggedIn } from '../../services/auth';

export default function ZodiacPage() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const [birthDate, setBirthDate] = useState('');
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
      const response = await analyzeZodiac(birthDate) as any;
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
      title={t('services.fortune.zodiac.title')}
      description={t('services.fortune.zodiac.description')}
      icon="pets"
      color="orange"
    >
      <div className="space-y-6">
        <div className="bg-background-dark rounded-lg p-4 border border-orange-500/20">
          <h3 className="text-white font-semibold mb-2">서비스 안내</h3>
          <p className="text-[#ab9eb7] text-sm leading-relaxed">
            12띠를 기반으로 올해의 운세를 분석합니다.
            월별 운세와 재물운, 애정운, 직장운, 건강운을 종합적으로 제공합니다.
          </p>
        </div>

        {!result && (
          <div className="space-y-4">
            <div>
              <label className="block text-white font-medium mb-2">
                생년월일
              </label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full px-4 py-3 bg-background-dark border border-gray-600 rounded-lg text-white focus:outline-none focus:border-orange-500"
              />
              <p className="text-[#ab9eb7] text-xs mt-1">
                생년월일을 기반으로 띠를 자동 판별합니다
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
            <div className="bg-orange-500/10 rounded-lg p-4 border border-orange-500/20">
              <h3 className="text-white font-semibold mb-3">🐲 띠 운세</h3>

              {result.analysis.zodiac && (
                <div className="mb-4 pb-4 border-b border-orange-500/10">
                  <h4 className="text-orange-400 font-medium mb-2">
                    {result.analysis.zodiac.animal}띠
                  </h4>
                  <p className="text-[#ab9eb7] text-sm mb-2">
                    오행: {result.analysis.zodiac.element}
                  </p>
                  {result.analysis.zodiac.traits && (
                    <div className="mt-2">
                      <p className="text-white text-sm">
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
                    <p className="text-white text-sm">{result.analysis.yearlyFortune.overall}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <h5 className="text-[#ab9eb7] text-xs mb-1">상반기</h5>
                      <p className="text-white text-sm">{result.analysis.yearlyFortune.firstHalf}</p>
                    </div>
                    <div>
                      <h5 className="text-[#ab9eb7] text-xs mb-1">하반기</h5>
                      <p className="text-white text-sm">{result.analysis.yearlyFortune.secondHalf}</p>
                    </div>
                  </div>
                </div>
              )}

              {result.analysis.detailedFortune && (
                <div className="space-y-2">
                  <h4 className="text-orange-400 font-medium mb-2">세부 운세</h4>
                  <div className="grid gap-2">
                    <div className="bg-background-dark p-2 rounded">
                      <span className="text-[#ab9eb7] text-xs">재물운:</span>
                      <p className="text-white text-sm">{result.analysis.detailedFortune.wealth}</p>
                    </div>
                    <div className="bg-background-dark p-2 rounded">
                      <span className="text-[#ab9eb7] text-xs">애정운:</span>
                      <p className="text-white text-sm">{result.analysis.detailedFortune.love}</p>
                    </div>
                    <div className="bg-background-dark p-2 rounded">
                      <span className="text-[#ab9eb7] text-xs">직장운:</span>
                      <p className="text-white text-sm">{result.analysis.detailedFortune.career}</p>
                    </div>
                    <div className="bg-background-dark p-2 rounded">
                      <span className="text-[#ab9eb7] text-xs">건강운:</span>
                      <p className="text-white text-sm">{result.analysis.detailedFortune.health}</p>
                    </div>
                  </div>
                </div>
              )}

              {result.analysis.advice && (
                <div className="mt-4 pt-4 border-t border-orange-500/10">
                  <h4 className="text-orange-400 font-medium mb-2">조언</h4>
                  {result.analysis.advice.luckyTips && (
                    <ul className="space-y-1">
                      {result.analysis.advice.luckyTips.map((tip: string, idx: number) => (
                        <li key={idx} className="text-[#ab9eb7] text-sm">• {tip}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={() => setResult(null)}
              className="w-full px-4 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition"
            >
              다시 분석하기
            </button>
          </div>
        )}
      </div>
    </ServiceDetailLayout>
  );
}
