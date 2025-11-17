import { useState, useEffect } from 'react';
import ServiceDetailLayout from '../../components/ServiceDetailLayout';
import ExecuteButton from '../../components/ExecuteButton';
import { predictTojeong } from '../../services/ai';
import { getCurrentUser } from '../../services/auth';

export default function TojeongPage() {
  const [birthDate, setBirthDate] = useState('');
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
    if (!birthDate) {
      alert('생년월일을 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      const response = await predictTojeong(birthDate) as any;
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
      title="AI 토정비결"
      description="한 해의 운세를 예측"
      icon="book"
      color="orange"
    >
      <div className="space-y-6">
        {/* Service Description */}
        <div className="bg-background-dark rounded-lg p-4 border border-orange-500/20">
          <h3 className="text-white font-semibold mb-2">서비스 안내</h3>
          <p className="text-[#ab9eb7] text-sm leading-relaxed">
            토정비결은 조선시대부터 전해내려오는 전통 운세입니다.
            생년월일을 바탕으로 한 해의 운세를 월별로 상세히 풀이해드립니다.
            AI가 토정비결의 방식을 바탕으로 당신의 운세를 해석합니다.
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
                className="w-full px-4 py-3 bg-background-dark border border-gray-600 rounded-lg text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <p className="text-blue-400 text-sm">
                토정비결은 음력을 기준으로 합니다. 양력 날짜를 입력하시면
                자동으로 음력으로 변환하여 분석합니다.
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

        {/* Result */}
        {result && (
          <div className="space-y-4">
            <div className="bg-background-dark rounded-lg p-6 border border-orange-500/20">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined">auto_awesome</span>
                토정비결 운세
              </h3>
              <div className="text-[#ab9eb7] whitespace-pre-wrap">
                {result}
              </div>
            </div>

            <button
              onClick={() => setResult(null)}
              className="w-full py-3 px-6 bg-background-dark hover:bg-gray-700 text-white rounded-lg transition"
            >
              다시 보기
            </button>
          </div>
        )}
      </div>
    </ServiceDetailLayout>
  );
}
