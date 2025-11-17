import { useState, useEffect } from 'react';
import ServiceDetailLayout from '../../components/ServiceDetailLayout';
import ExecuteButton from '../../components/ExecuteButton';
import { readTarot } from '../../services/ai';
import { getCurrentUser } from '../../services/auth';

export default function TarotPage() {
  const [question, setQuestion] = useState('');
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
    if (!question.trim()) {
      alert('질문을 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      const response = await readTarot(question) as any;
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
      title="AI 타로 카드"
      description="타로 카드로 운세와 미래를 예측"
      icon="auto_awesome"
      color="pink"
    >
      <div className="space-y-6">
        {/* Service Description */}
        <div className="bg-background-dark rounded-lg p-4 border border-pink-500/20">
          <h3 className="text-white font-semibold mb-2">서비스 안내</h3>
          <p className="text-[#ab9eb7] text-sm leading-relaxed">
            타로 카드를 통해 당신의 질문에 대한 답을 찾아드립니다.
            AI가 타로의 상징과 의미를 해석하여 현재 상황과 미래에 대한
            통찰을 제공합니다.
          </p>
        </div>

        {/* Input Form */}
        {!result && (
          <div className="space-y-4">
            <div>
              <label className="block text-white font-medium mb-2">
                질문
              </label>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="타로에게 물어보고 싶은 질문을 입력하세요&#10;예: 새로운 직장으로 이직하는 것이 좋을까요?"
                rows={5}
                className="w-full px-4 py-3 bg-background-dark border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-pink-500 resize-none"
              />
              <p className="text-[#ab9eb7] text-xs mt-1">
                구체적인 질문일수록 정확한 답변을 받을 수 있습니다
              </p>
            </div>

            <ExecuteButton
              credits={serviceCost}
              currentCredits={currentCredits}
              onClick={handleExecute}
              loading={loading}
              disabled={!question.trim()}
              label="카드 뽑기"
            />
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="space-y-4">
            <div className="bg-background-dark rounded-lg p-6 border border-pink-500/20">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined">auto_awesome</span>
                타로 리딩 결과
              </h3>
              <div className="text-[#ab9eb7] whitespace-pre-wrap">
                {result}
              </div>
            </div>

            <button
              onClick={() => setResult(null)}
              className="w-full py-3 px-6 bg-background-dark hover:bg-gray-700 text-white rounded-lg transition"
            >
              다시 뽑기
            </button>
          </div>
        )}
      </div>
    </ServiceDetailLayout>
  );
}
