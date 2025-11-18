import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';
import ServiceDetailLayout from '../../components/ServiceDetailLayout';
import ExecuteButton from '../../components/ExecuteButton';
import { analyzeLoveCompatibility } from '../../services/ai';
import { getCurrentUser, isLoggedIn } from '../../services/auth';

export default function LoveCompatibilityPage() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const [person1BirthDate, setPerson1BirthDate] = useState('');
  const [person2BirthDate, setPerson2BirthDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [currentCredits, setCurrentCredits] = useState(0);

  const serviceCost = 20;

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
    if (!person1BirthDate || !person2BirthDate) {
      alert('두 사람의 생년월일을 모두 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      const response = await analyzeLoveCompatibility(person1BirthDate, person2BirthDate) as any;
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
      title={t('services.fortune.loveCompatibility.title')}
      description={t('services.fortune.loveCompatibility.description')}
      icon="favorite"
      color="pink"
    >
      <div className="space-y-6">
        <div className="bg-background-dark rounded-lg p-4 border border-pink-500/20">
          <h3 className="text-white font-semibold mb-2">서비스 안내</h3>
          <p className="text-[#ab9eb7] text-sm leading-relaxed">
            두 사람의 생년월일을 기반으로 연애 궁합을 분석합니다.
            사주 오행 궁합, 성격 조화, 연애 스타일을 종합적으로 평가합니다.
          </p>
        </div>

        {!result && (
          <div className="space-y-4">
            <div>
              <label className="block text-white font-medium mb-2">
                첫 번째 사람 생년월일
              </label>
              <input
                type="date"
                value={person1BirthDate}
                onChange={(e) => setPerson1BirthDate(e.target.value)}
                className="w-full px-4 py-3 bg-background-dark border border-gray-600 rounded-lg text-white focus:outline-none focus:border-pink-500"
              />
            </div>

            <div>
              <label className="block text-white font-medium mb-2">
                두 번째 사람 생년월일
              </label>
              <input
                type="date"
                value={person2BirthDate}
                onChange={(e) => setPerson2BirthDate(e.target.value)}
                className="w-full px-4 py-3 bg-background-dark border border-gray-600 rounded-lg text-white focus:outline-none focus:border-pink-500"
              />
            </div>

            <ExecuteButton
              credits={serviceCost}
              currentCredits={currentCredits}
              onClick={handleExecute}
              loading={loading}
              disabled={!person1BirthDate || !person2BirthDate}
            />
          </div>
        )}

        {result?.analysis && (
          <div className="space-y-4 animate-fadeIn">
            <div className="bg-pink-500/10 rounded-lg p-4 border border-pink-500/20">
              <h3 className="text-white font-semibold mb-3">💕 연애 궁합</h3>

              <div className="mb-4 pb-4 border-b border-pink-500/10 text-center">
                <div className="text-4xl font-bold text-pink-400 mb-2">
                  {result.analysis.compatibilityScore}점
                </div>
                <div className="text-white text-lg">{result.analysis.grade}</div>
              </div>

              {result.analysis.elementAnalysis && (
                <div className="mb-4 pb-4 border-b border-pink-500/10">
                  <h4 className="text-pink-400 font-medium mb-2">사주 오행 궁합</h4>
                  <p className="text-white text-sm mb-2">{result.analysis.elementAnalysis.relationship}</p>
                  <p className="text-[#ab9eb7] text-sm">{result.analysis.elementAnalysis.harmony}</p>
                </div>
              )}

              {result.analysis.personalityMatch && (
                <div className="mb-4 pb-4 border-b border-pink-500/10">
                  <h4 className="text-pink-400 font-medium mb-2">성격 궁합</h4>
                  <div className="space-y-2">
                    {result.analysis.personalityMatch.similarities && (
                      <div>
                        <h5 className="text-[#ab9eb7] text-xs mb-1">유사점</h5>
                        <ul className="space-y-1">
                          {result.analysis.personalityMatch.similarities.map((item: string, idx: number) => (
                            <li key={idx} className="text-white text-sm">• {item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {result.analysis.personalityMatch.strengths && (
                      <div>
                        <h5 className="text-[#ab9eb7] text-xs mb-1">강점</h5>
                        <ul className="space-y-1">
                          {result.analysis.personalityMatch.strengths.map((item: string, idx: number) => (
                            <li key={idx} className="text-white text-sm">• {item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {result.analysis.detailedCompatibility && (
                <div className="mb-4 pb-4 border-b border-pink-500/10">
                  <h4 className="text-pink-400 font-medium mb-2">세부 궁합</h4>
                  <div className="grid gap-2">
                    <div className="bg-background-dark p-2 rounded">
                      <span className="text-[#ab9eb7] text-xs">감정 소통:</span>
                      <p className="text-white text-sm">{result.analysis.detailedCompatibility.communication}</p>
                    </div>
                    <div className="bg-background-dark p-2 rounded">
                      <span className="text-[#ab9eb7] text-xs">가치관:</span>
                      <p className="text-white text-sm">{result.analysis.detailedCompatibility.values}</p>
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
                        <li key={idx} className="text-[#ab9eb7] text-sm">• {tip}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={() => setResult(null)}
              className="w-full px-4 py-3 bg-pink-600 hover:bg-pink-700 text-white rounded-lg transition"
            >
              다시 분석하기
            </button>
          </div>
        )}
      </div>
    </ServiceDetailLayout>
  );
}
