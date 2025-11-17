import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import ServiceDetailLayout from '../../components/ServiceDetailLayout';
import ExecuteButton from '../../components/ExecuteButton';
import { analyzeSaju } from '../../services/ai';
import { getCurrentUser } from '../../services/auth';

export default function SajuPage() {
  const { t } = useTranslation();
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [currentCredits, setCurrentCredits] = useState(0);

  const serviceCost = 25;

  // Fetch user credits on mount
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
    if (!birthDate || !birthTime) {
      alert('생년월일과 태어난 시간을 모두 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      const response = await analyzeSaju(birthDate, birthTime, gender) as any;
      setResult(response);

      // Update credits from response
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
      title={t('services.fortune.saju.title')}
      description={t('services.fortune.saju.description')}
      icon="calendar_today"
      color="purple"
    >
      <div className="space-y-6">
        {/* Service Description */}
        <div className="bg-background-dark rounded-lg p-4 border border-purple-500/20">
          <h3 className="text-white font-semibold mb-2">서비스 안내</h3>
          <p className="text-[#ab9eb7] text-sm leading-relaxed">
            생년월일과 태어난 시간을 기반으로 사주팔자를 분석하고,
            오행의 균형과 운세를 예측해드립니다. AI가 전통 명리학을
            바탕으로 당신의 사주를 해석합니다.
          </p>
        </div>

        {/* Input Form */}
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
                className="w-full px-4 py-3 bg-background-dark border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-white font-medium mb-2">
                태어난 시간
              </label>
              <input
                type="time"
                value={birthTime}
                onChange={(e) => setBirthTime(e.target.value)}
                className="w-full px-4 py-3 bg-background-dark border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
              />
              <p className="text-[#ab9eb7] text-xs mt-1">
                모르는 경우 대략적인 시간을 입력해주세요
              </p>
            </div>

            <div>
              <label className="block text-white font-medium mb-2">
                성별
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    value="male"
                    checked={gender === 'male'}
                    onChange={(e) => setGender(e.target.value as 'male')}
                    className="w-4 h-4 text-purple-600"
                  />
                  <span className="text-white">남성</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    value="female"
                    checked={gender === 'female'}
                    onChange={(e) => setGender(e.target.value as 'female')}
                    className="w-4 h-4 text-purple-600"
                  />
                  <span className="text-white">여성</span>
                </label>
              </div>
            </div>

            <ExecuteButton
              credits={serviceCost}
              currentCredits={currentCredits}
              onClick={handleExecute}
              loading={loading}
              disabled={!birthDate || !birthTime}
            />
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="space-y-4">
            <div className="bg-background-dark rounded-lg p-6 border border-purple-500/20">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined">auto_awesome</span>
                분석 결과
              </h3>
              <div className="text-[#ab9eb7] space-y-4">
                {result.analysis ? (
                  <div className="space-y-4">
                    {result.analysis.saju && (
                      <div>
                        <h4 className="text-white font-medium mb-2">사주팔자</h4>
                        <p className="text-sm">{result.analysis.saju}</p>
                      </div>
                    )}
                    {result.analysis.personality && (
                      <div>
                        <h4 className="text-white font-medium mb-2">성격과 재능</h4>
                        <p className="text-sm">{result.analysis.personality}</p>
                      </div>
                    )}
                    {result.analysis.wealth && (
                      <div>
                        <h4 className="text-white font-medium mb-2">재물운</h4>
                        <p className="text-sm">{result.analysis.wealth}</p>
                      </div>
                    )}
                    {result.analysis.health && (
                      <div>
                        <h4 className="text-white font-medium mb-2">건강운</h4>
                        <p className="text-sm">{result.analysis.health}</p>
                      </div>
                    )}
                    {result.analysis.love && (
                      <div>
                        <h4 className="text-white font-medium mb-2">연애운</h4>
                        <p className="text-sm">{result.analysis.love}</p>
                      </div>
                    )}
                    {result.analysis.career && (
                      <div>
                        <h4 className="text-white font-medium mb-2">사업운</h4>
                        <p className="text-sm">{result.analysis.career}</p>
                      </div>
                    )}
                    {result.analysis.yearlyFortune && (
                      <div>
                        <h4 className="text-white font-medium mb-2">올해 운세</h4>
                        <p className="text-sm">{result.analysis.yearlyFortune}</p>
                      </div>
                    )}
                    {result.analysis.advice && (
                      <div>
                        <h4 className="text-white font-medium mb-2">조언</h4>
                        <p className="text-sm">{result.analysis.advice}</p>
                      </div>
                    )}
                  </div>
                ) : result.rawText ? (
                  <p className="whitespace-pre-wrap text-sm">{result.rawText}</p>
                ) : (
                  <p>결과를 표시할 수 없습니다.</p>
                )}
              </div>
            </div>

            <button
              onClick={() => setResult(null)}
              className="w-full py-3 px-6 bg-background-dark hover:bg-gray-700 text-white rounded-lg transition"
            >
              다시 분석하기
            </button>
          </div>
        )}
      </div>
    </ServiceDetailLayout>
  );
}
