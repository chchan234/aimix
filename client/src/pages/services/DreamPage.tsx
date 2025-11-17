import { useState, useEffect } from 'react';
import ServiceDetailLayout from '../../components/ServiceDetailLayout';
import ExecuteButton from '../../components/ExecuteButton';
import { interpretDream } from '../../services/ai';
import { getCurrentUser } from '../../services/auth';

export default function DreamPage() {
  const [dream, setDream] = useState('');
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
    if (!dream.trim()) {
      alert('꿈 내용을 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      const response = await interpretDream(dream) as any;
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
      title="AI 꿈 해몽"
      description="꿈의 의미를 해석"
      icon="nightlight"
      color="indigo"
    >
      <div className="space-y-6">
        {/* Service Description */}
        <div className="bg-background-dark rounded-lg p-4 border border-indigo-500/20">
          <h3 className="text-white font-semibold mb-2">서비스 안내</h3>
          <p className="text-[#ab9eb7] text-sm leading-relaxed">
            꿈의 내용을 분석하여 의미를 해석해드립니다.
            AI가 꿈에 나타난 상징과 맥락을 분석하고 전통 해몽의 원리를
            바탕으로 꿈이 전하는 메시지를 풀이합니다.
          </p>
        </div>

        {/* Input Form */}
        {!result && (
          <div className="space-y-4">
            <div>
              <label className="block text-white font-medium mb-2">
                꿈 내용
              </label>
              <textarea
                value={dream}
                onChange={(e) => setDream(e.target.value)}
                placeholder="꿈의 내용을 자세히 적어주세요&#10;예: 하늘을 날아다니는 용을 봤어요. 용이 저를 태우고 구름 위로 올라갔습니다..."
                rows={8}
                className="w-full px-4 py-3 bg-background-dark border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 resize-none"
              />
              <p className="text-[#ab9eb7] text-xs mt-1">
                꿈의 세부 사항을 자세히 적을수록 정확한 해몽이 가능합니다
              </p>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <p className="text-blue-400 text-sm font-medium mb-2">
                해몽 팁
              </p>
              <ul className="text-blue-400 text-xs space-y-1 list-disc list-inside">
                <li>꿈에서 본 주요 인물이나 사물을 기억해주세요</li>
                <li>꿈의 분위기와 감정을 함께 적어주세요</li>
                <li>여러 장면이 있다면 순서대로 적어주세요</li>
              </ul>
            </div>

            <ExecuteButton
              credits={serviceCost}
              currentCredits={currentCredits}
              onClick={handleExecute}
              loading={loading}
              disabled={!dream.trim()}
              label="해몽하기"
            />
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="space-y-4">
            <div className="bg-background-dark rounded-lg p-6 border border-indigo-500/20">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined">auto_awesome</span>
                꿈 해몽 결과
              </h3>
              <div className="text-[#ab9eb7] whitespace-pre-wrap">
                {result}
              </div>
            </div>

            <button
              onClick={() => setResult(null)}
              className="w-full py-3 px-6 bg-background-dark hover:bg-gray-700 text-white rounded-lg transition"
            >
              다른 꿈 해몽하기
            </button>
          </div>
        )}
      </div>
    </ServiceDetailLayout>
  );
}
