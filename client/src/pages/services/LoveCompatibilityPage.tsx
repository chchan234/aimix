import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import ServiceDetailLayout from '../../components/ServiceDetailLayout';
import { analyzeLoveCompatibility } from '../../services/ai';
import { getCurrentUser, isLoggedIn } from '../../services/auth';

export default function LoveCompatibilityPage() {
  const { t } = useTranslation();
  const [step, setStep] = useState<'intro' | 'input' | 'result'>('intro');
  const [person1BirthDate, setPerson1BirthDate] = useState('');
  const [person2BirthDate, setPerson2BirthDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [currentCredits, setCurrentCredits] = useState(0);

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

  const handleExecute = async () => {
    if (!person1BirthDate || !person2BirthDate) {
      alert('두 사람의 생년월일을 모두 입력해주세요.');
      return;
    }

    if (currentCredits < serviceCost) {
      alert('크레딧이 부족합니다.');
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
      {/* Intro Section */}
      {step === 'intro' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined text-3xl text-pink-400">favorite</span>
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
                  <span className="material-symbols-outlined text-pink-400">balance</span>
                  <span className="text-foreground font-medium">오행 궁합</span>
                </div>
                <p className="text-muted-foreground text-sm">사주 오행 분석</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-pink-400">psychology</span>
                  <span className="text-foreground font-medium">성격 궁합</span>
                </div>
                <p className="text-muted-foreground text-sm">성격 조화 분석</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-pink-400">chat</span>
                  <span className="text-foreground font-medium">소통 방식</span>
                </div>
                <p className="text-muted-foreground text-sm">감정 소통 분석</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-pink-400">lightbulb</span>
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
                  <p className="text-pink-400 font-bold text-xl">{serviceCost} 크레딧</p>
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
              className="w-full px-6 py-4 bg-pink-600 hover:bg-pink-700 text-foreground font-semibold rounded-lg transition-colors"
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
                  첫 번째 사람 생년월일
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
                  두 번째 사람 생년월일
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
      {step === 'result' && result?.analysis && (
        <div className="space-y-4 animate-fadeIn">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <h3 className="text-foreground font-semibold mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-pink-400">favorite</span>
              연애 궁합
            </h3>

            <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700 text-center">
              <div className="text-4xl font-bold text-pink-400 mb-2">
                {result.analysis.compatibilityScore}점
              </div>
              <div className="text-foreground text-lg">{result.analysis.grade}</div>
            </div>

            {result.analysis.elementAnalysis && (
              <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                <h4 className="text-pink-400 font-medium mb-2">사주 오행 궁합</h4>
                <p className="text-foreground text-sm mb-2">{result.analysis.elementAnalysis.relationship}</p>
                <p className="text-muted-foreground text-sm">{result.analysis.elementAnalysis.harmony}</p>
              </div>
            )}

            {result.analysis.personalityMatch && (
              <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                <h4 className="text-pink-400 font-medium mb-2">성격 궁합</h4>
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
                <h4 className="text-pink-400 font-medium mb-2">세부 궁합</h4>
                <div className="grid gap-2">
                  <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded">
                    <span className="text-muted-foreground text-xs">감정 소통:</span>
                    <p className="text-foreground text-sm">{result.analysis.detailedCompatibility.communication}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded">
                    <span className="text-muted-foreground text-xs">가치관:</span>
                    <p className="text-foreground text-sm">{result.analysis.detailedCompatibility.values}</p>
                  </div>
                </div>
              </div>
            )}

            {result.analysis.advice && (
              <div>
                <h4 className="text-pink-400 font-medium mb-2">조언</h4>
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
            className="w-full px-4 py-3 bg-gray-600 hover:bg-gray-500 text-foreground rounded-lg transition"
          >
            다시 분석하기
          </button>
        </div>
      )}
    </ServiceDetailLayout>
  );
}
