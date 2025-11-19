import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';
import ServiceDetailLayout from '../../components/ServiceDetailLayout';
import ExecuteButton from '../../components/ExecuteButton';
import { analyzeMarriageCompatibility } from '../../services/ai';
import { getCurrentUser, isLoggedIn } from '../../services/auth';

export default function MarriageCompatibilityPage() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const [person1Name, setPerson1Name] = useState('');
  const [person1BirthDate, setPerson1BirthDate] = useState('');
  const [person2Name, setPerson2Name] = useState('');
  const [person2BirthDate, setPerson2BirthDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [currentCredits, setCurrentCredits] = useState(0);

  const serviceCost = 25;

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
    if (!person1Name || !person1BirthDate || !person2Name || !person2BirthDate) {
      alert('모든 정보를 입력해주세요.');
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
      title={t('services.fortune.marriageCompatibility.title')}
      description={t('services.fortune.marriageCompatibility.description')}
      icon="family_restroom"
      color="red"
    >
      <div className="space-y-6">
        <div className="bg-gray-50 dark:bg-[#0d0d0d] rounded-lg p-4 border border-red-500/20">
          <h3 className="text-foreground font-semibold mb-2">서비스 안내</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            두 사람의 이름과 생년월일을 기반으로 결혼 궁합을 종합적으로 분석합니다.
            사주 궁합, 이름 궁합, 세부 결혼 궁합 항목을 포함한 100점 만점 평가를 제공합니다.
          </p>
        </div>

        {!result && (
          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-[#0d0d0d]/50 rounded-lg p-4 border border-red-500/10">
              <h4 className="text-foreground font-medium mb-3">첫 번째 사람</h4>
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
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0d0d0d] border border-gray-300 dark:border-gray-600 rounded-lg text-foreground focus:outline-none focus:border-red-500"
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
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0d0d0d] border border-gray-300 dark:border-gray-600 rounded-lg text-foreground focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-[#0d0d0d]/50 rounded-lg p-4 border border-red-500/10">
              <h4 className="text-foreground font-medium mb-3">두 번째 사람</h4>
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
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0d0d0d] border border-gray-300 dark:border-gray-600 rounded-lg text-foreground focus:outline-none focus:border-red-500"
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
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0d0d0d] border border-gray-300 dark:border-gray-600 rounded-lg text-foreground focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>
            </div>

            <ExecuteButton
              credits={serviceCost}
              currentCredits={currentCredits}
              onClick={handleExecute}
              loading={loading}
              disabled={!person1Name || !person1BirthDate || !person2Name || !person2BirthDate}
            />
          </div>
        )}

        {result?.analysis && (
          <div className="space-y-4 animate-fadeIn">
            <div className="bg-red-500/10 rounded-lg p-4 border border-red-500/20">
              <h3 className="text-foreground font-semibold mb-3">💑 결혼 궁합</h3>

              <div className="mb-4 pb-4 border-b border-red-500/10 text-center">
                <div className="text-4xl font-bold text-red-400 mb-2">
                  {result.analysis.overallScore}점
                </div>
                <div className="text-foreground text-lg mb-2">{result.analysis.grade}</div>
                <p className="text-muted-foreground text-sm">{result.analysis.suitability}</p>
              </div>

              {result.analysis.sajuCompatibility && (
                <div className="mb-4 pb-4 border-b border-red-500/10">
                  <h4 className="text-red-400 font-medium mb-2">
                    사주 궁합 ({result.analysis.sajuCompatibility.score}/{result.analysis.sajuCompatibility.maxScore}점)
                  </h4>
                  <div className="space-y-2">
                    <div className="bg-gray-50 dark:bg-[#0d0d0d] p-2 rounded">
                      <span className="text-muted-foreground text-xs">오행 상생상극:</span>
                      <p className="text-foreground text-sm">{result.analysis.sajuCompatibility.elementHarmony.analysis}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-[#0d0d0d] p-2 rounded">
                      <span className="text-muted-foreground text-xs">음양 조화:</span>
                      <p className="text-foreground text-sm">{result.analysis.sajuCompatibility.yinYangBalance.analysis}</p>
                    </div>
                  </div>
                </div>
              )}

              {result.analysis.nameCompatibility && (
                <div className="mb-4 pb-4 border-b border-red-500/10">
                  <h4 className="text-red-400 font-medium mb-2">
                    이름 궁합 ({result.analysis.nameCompatibility.score}/{result.analysis.nameCompatibility.maxScore}점)
                  </h4>
                  <div className="space-y-2">
                    <div className="bg-gray-50 dark:bg-[#0d0d0d] p-2 rounded">
                      <span className="text-muted-foreground text-xs">획수 조화:</span>
                      <p className="text-foreground text-sm">{result.analysis.nameCompatibility.strokeHarmony.analysis}</p>
                    </div>
                  </div>
                </div>
              )}

              {result.analysis.detailedAnalysis && (
                <div className="mb-4 pb-4 border-b border-red-500/10">
                  <h4 className="text-red-400 font-medium mb-2">세부 결혼 궁합</h4>
                  <div className="grid gap-2">
                    {Object.entries(result.analysis.detailedAnalysis).map(([key, value]: [string, any]) => (
                      <div key={key} className="bg-gray-50 dark:bg-[#0d0d0d] p-2 rounded">
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
                <div className="mb-4 pb-4 border-b border-red-500/10">
                  <h4 className="text-red-400 font-medium mb-2">결혼 적기</h4>
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
                  <h4 className="text-red-400 font-medium mb-2">조언</h4>
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
              onClick={() => setResult(null)}
              className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 text-foreground rounded-lg transition"
            >
              다시 분석하기
            </button>
          </div>
        )}
      </div>
    </ServiceDetailLayout>
  );
}
