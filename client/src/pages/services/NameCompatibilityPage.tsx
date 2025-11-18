import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';
import ServiceDetailLayout from '../../components/ServiceDetailLayout';
import ExecuteButton from '../../components/ExecuteButton';
import { analyzeNameCompatibility } from '../../services/ai';
import { getCurrentUser, isLoggedIn } from '../../services/auth';

export default function NameCompatibilityPage() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const [name1, setName1] = useState('');
  const [name2, setName2] = useState('');
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
    if (!name1 || !name2) {
      alert('두 사람의 이름을 모두 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      const response = await analyzeNameCompatibility(name1, name2) as any;
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
      title={t('services.fortune.nameCompatibility.title')}
      description={t('services.fortune.nameCompatibility.description')}
      icon="edit"
      color="indigo"
    >
      <div className="space-y-6">
        <div className="bg-background-dark rounded-lg p-4 border border-indigo-500/20">
          <h3 className="text-white font-semibold mb-2">서비스 안내</h3>
          <p className="text-[#ab9eb7] text-sm leading-relaxed">
            두 사람의 이름을 기반으로 궁합을 분석합니다.
            획수 분석, 음양오행 배치를 통해 이름이 주는 기운의 조화를 평가합니다.
          </p>
        </div>

        {!result && (
          <div className="space-y-4">
            <div>
              <label className="block text-white font-medium mb-2">
                첫 번째 사람 이름
              </label>
              <input
                type="text"
                value={name1}
                onChange={(e) => setName1(e.target.value)}
                placeholder="홍길동"
                className="w-full px-4 py-3 bg-background-dark border border-gray-600 rounded-lg text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-white font-medium mb-2">
                두 번째 사람 이름
              </label>
              <input
                type="text"
                value={name2}
                onChange={(e) => setName2(e.target.value)}
                placeholder="김영희"
                className="w-full px-4 py-3 bg-background-dark border border-gray-600 rounded-lg text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <ExecuteButton
              credits={serviceCost}
              currentCredits={currentCredits}
              onClick={handleExecute}
              loading={loading}
              disabled={!name1 || !name2}
            />
          </div>
        )}

        {result?.analysis && (
          <div className="space-y-4 animate-fadeIn">
            <div className="bg-indigo-500/10 rounded-lg p-4 border border-indigo-500/20">
              <h3 className="text-white font-semibold mb-3">✏️ 이름 궁합</h3>

              <div className="mb-4 pb-4 border-b border-indigo-500/10 text-center">
                <div className="text-4xl font-bold text-indigo-400 mb-2">
                  {result.analysis.compatibilityScore}점
                </div>
                <div className="text-white text-lg">{result.analysis.grade}</div>
                <p className="text-[#ab9eb7] text-sm mt-2">{result.analysis.scoreReason}</p>
              </div>

              {result.analysis.strokeAnalysis && (
                <div className="mb-4 pb-4 border-b border-indigo-500/10">
                  <h4 className="text-indigo-400 font-medium mb-2">획수 분석</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-background-dark p-3 rounded">
                      <h5 className="text-white text-sm font-medium mb-1">
                        {result.analysis.strokeAnalysis.name1.name}
                      </h5>
                      <p className="text-[#ab9eb7] text-xs">
                        총 {result.analysis.strokeAnalysis.name1.totalStrokes}획
                      </p>
                    </div>
                    <div className="bg-background-dark p-3 rounded">
                      <h5 className="text-white text-sm font-medium mb-1">
                        {result.analysis.strokeAnalysis.name2.name}
                      </h5>
                      <p className="text-[#ab9eb7] text-xs">
                        총 {result.analysis.strokeAnalysis.name2.totalStrokes}획
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {result.analysis.elementAnalysis && (
                <div className="mb-4 pb-4 border-b border-indigo-500/10">
                  <h4 className="text-indigo-400 font-medium mb-2">음양오행 분석</h4>
                  <p className="text-white text-sm">{result.analysis.elementAnalysis.combined}</p>
                </div>
              )}

              {result.analysis.nameCharacteristics && (
                <div className="mb-4 pb-4 border-b border-indigo-500/10">
                  <h4 className="text-indigo-400 font-medium mb-2">이름의 기운</h4>
                  <div className="space-y-2">
                    <div>
                      <h5 className="text-[#ab9eb7] text-xs mb-1">첫 번째 이름</h5>
                      <p className="text-white text-sm">{result.analysis.nameCharacteristics.name1Energy}</p>
                    </div>
                    <div>
                      <h5 className="text-[#ab9eb7] text-xs mb-1">두 번째 이름</h5>
                      <p className="text-white text-sm">{result.analysis.nameCharacteristics.name2Energy}</p>
                    </div>
                    <div>
                      <h5 className="text-[#ab9eb7] text-xs mb-1">시너지</h5>
                      <p className="text-white text-sm">{result.analysis.nameCharacteristics.synergy}</p>
                    </div>
                  </div>
                </div>
              )}

              {result.analysis.detailedCompatibility && (
                <div className="mb-4 pb-4 border-b border-indigo-500/10">
                  <h4 className="text-indigo-400 font-medium mb-2">세부 분석</h4>
                  <div className="grid gap-2">
                    <div className="bg-background-dark p-2 rounded">
                      <span className="text-[#ab9eb7] text-xs">연애 궁합:</span>
                      <p className="text-white text-sm">{result.analysis.detailedCompatibility.love}</p>
                    </div>
                    <div className="bg-background-dark p-2 rounded">
                      <span className="text-[#ab9eb7] text-xs">우정 궁합:</span>
                      <p className="text-white text-sm">{result.analysis.detailedCompatibility.friendship}</p>
                    </div>
                  </div>
                </div>
              )}

              {result.analysis.advice && (
                <div>
                  <h4 className="text-indigo-400 font-medium mb-2">조언</h4>
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
              className="w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition"
            >
              다시 분석하기
            </button>
          </div>
        )}
      </div>
    </ServiceDetailLayout>
  );
}
