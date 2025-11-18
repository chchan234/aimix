import { useState, useEffect } from 'react';
import ServiceDetailLayout from '../../components/ServiceDetailLayout';
import { getMBTIQuestions, analyzeMBTI } from '../../services/ai';

interface Question {
  id: number;
  question: string;
}

const MBTI_TYPES = [
  'INTJ', 'INTP', 'ENTJ', 'ENTP',
  'INFJ', 'INFP', 'ENFJ', 'ENFP',
  'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
  'ISTP', 'ISFP', 'ESTP', 'ESFP'
];

export default function MBTIAnalysisPage() {
  const [step, setStep] = useState<'input' | 'test' | 'result'>('input');
  const [userInputMBTI, setUserInputMBTI] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<number[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      const response = await getMBTIQuestions() as any;
      if (response.success) {
        setQuestions(response.questions);
        setAnswers(new Array(response.questions.length).fill(0));
      }
    } catch (err) {
      console.error('Failed to load questions:', err);
      setError('질문을 불러오는데 실패했습니다.');
    }
  };

  const handleMBTIInput = (mbti: string | null) => {
    setUserInputMBTI(mbti);
    setStep('test');
  };

  const handleAnswer = (value: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = value;
    setAnswers(newAnswers);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // All questions answered, submit
      submitTest(newAnswers);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const submitTest = async (finalAnswers: number[]) => {
    setLoading(true);
    setError('');

    try {
      const response = await analyzeMBTI(userInputMBTI, finalAnswers) as any;

      if (response.success) {
        setResult(response);
        setStep('result');
      } else {
        setError(response.error || '분석에 실패했습니다.');
      }
    } catch (err: any) {
      console.error('MBTI analysis error:', err);
      setError(err.message || '분석 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;

  return (
    <ServiceDetailLayout
      title="MBTI 심층분석"
      description="자가 진단과 테스트 결과를 비교하여 정확한 MBTI를 분석합니다"
      icon="🧠"
      color="purple"
    >
      {/* Step 1: MBTI Input */}
      {step === 'input' && (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h3 className="text-xl font-semibold text-white mb-4">
              자신의 MBTI를 알고 계신가요?
            </h3>
            <p className="text-gray-400">
              알고 있다면 선택해주세요. 테스트 결과와 비교 분석해드립니다.
            </p>
          </div>

          <div className="grid grid-cols-4 gap-3 mb-6">
            {MBTI_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => handleMBTIInput(type)}
                className="px-4 py-3 bg-gray-700 hover:bg-purple-600 text-white rounded-lg transition-colors"
              >
                {type}
              </button>
            ))}
          </div>

          <button
            onClick={() => handleMBTIInput(null)}
            className="w-full px-6 py-3 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
          >
            잘 모르겠어요 (테스트만 진행)
          </button>
        </div>
      )}

      {/* Step 2: Test Questions */}
      {step === 'test' && !loading && questions.length > 0 && (
        <div className="space-y-6">
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>진행률</span>
              <span>{currentQuestionIndex + 1} / {questions.length}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Question */}
          <div className="bg-gray-800 rounded-lg p-6">
            <p className="text-lg text-white mb-6">
              {questions[currentQuestionIndex]?.question}
            </p>

            {/* Answer Options */}
            <div className="space-y-3">
              {[
                { value: 1, label: '전혀 아니다' },
                { value: 2, label: '아니다' },
                { value: 3, label: '보통이다' },
                { value: 4, label: '그렇다' },
                { value: 5, label: '매우 그렇다' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleAnswer(option.value)}
                  className={`w-full px-6 py-3 rounded-lg transition-colors ${
                    answers[currentQuestionIndex] === option.value
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-700 hover:bg-gray-600 text-white'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {/* Navigation */}
            {currentQuestionIndex > 0 && (
              <button
                onClick={handlePrevious}
                className="mt-6 px-6 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg"
              >
                이전 질문
              </button>
            )}
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">AI가 분석 중입니다...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 text-red-400">
          {error}
        </div>
      )}

      {/* Step 3: Results */}
      {step === 'result' && result && (
        <div className="space-y-6">
          {/* Comparison */}
          {result.analysis.comparison && (
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-4">결과 비교</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-gray-400 text-sm">입력한 MBTI</p>
                  <p className="text-2xl font-bold text-purple-400">
                    {result.analysis.comparison.userInput || '없음'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">테스트 결과</p>
                  <p className="text-2xl font-bold text-blue-400">
                    {result.testResultMBTI}
                  </p>
                </div>
              </div>
              <p className="text-gray-300">{result.analysis.comparison.match}</p>
            </div>
          )}

          {/* Final MBTI */}
          <div className="bg-gradient-to-r from-purple-900 to-blue-900 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-2">최종 결과</h3>
            <p className="text-4xl font-bold text-white mb-2">
              {result.analysis.finalMBTI.type}
            </p>
            <p className="text-gray-300">
              확신도: {result.analysis.finalMBTI.confidence}
            </p>
          </div>

          {/* Axis Scores */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-4">축별 점수</h3>
            <div className="space-y-4">
              {Object.entries(result.axisScores).map(([axis, scores]: [string, any]) => {
                const [first, second] = axis.split('');
                return (
                  <div key={axis}>
                    <div className="flex justify-between text-sm text-gray-400 mb-1">
                      <span>{first}: {scores[first]}%</span>
                      <span>{second}: {scores[second]}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-purple-500 h-2 rounded-full"
                        style={{ width: `${scores[first]}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Personality */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-4">성격 특성</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-purple-400 mb-2">주요 특성</h4>
                <ul className="list-disc list-inside text-gray-300 space-y-1">
                  {result.analysis.personality.traits.map((trait: string, i: number) => (
                    <li key={i}>{trait}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-green-400 mb-2">강점</h4>
                <ul className="list-disc list-inside text-gray-300 space-y-1">
                  {result.analysis.personality.strengths.map((strength: string, i: number) => (
                    <li key={i}>{strength}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-yellow-400 mb-2">약점</h4>
                <ul className="list-disc list-inside text-gray-300 space-y-1">
                  {result.analysis.personality.weaknesses.map((weakness: string, i: number) => (
                    <li key={i}>{weakness}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Relationships */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-4">대인관계</h3>
            <div className="space-y-3 text-gray-300">
              <p><strong className="text-purple-400">소통:</strong> {result.analysis.relationships.communicationStyle}</p>
              <p><strong className="text-purple-400">우정:</strong> {result.analysis.relationships.friendshipStyle}</p>
              <p><strong className="text-purple-400">연애:</strong> {result.analysis.relationships.loveStyle}</p>
              <p><strong className="text-purple-400">궁합:</strong> {result.analysis.relationships.compatibleTypes.join(', ')}</p>
            </div>
          </div>

          {/* Career */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-4">직업 및 진로</h3>
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-purple-400 mb-2">적합한 직업</h4>
                <div className="flex flex-wrap gap-2">
                  {result.analysis.career.suitableJobs.map((job: string, i: number) => (
                    <span key={i} className="px-3 py-1 bg-purple-900/50 text-purple-300 rounded-full text-sm">
                      {job}
                    </span>
                  ))}
                </div>
              </div>
              <p className="text-gray-300"><strong className="text-purple-400">업무 스타일:</strong> {result.analysis.career.workStyle}</p>
              <p className="text-gray-300"><strong className="text-purple-400">리더십:</strong> {result.analysis.career.leadershipStyle}</p>
            </div>
          </div>

          {/* Growth */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-4">성장 조언</h3>
            <div className="space-y-4 text-gray-300">
              <div>
                <h4 className="font-semibold text-green-400 mb-2">개발 영역</h4>
                <ul className="list-disc list-inside space-y-1">
                  {result.analysis.growth.developmentAreas.map((area: string, i: number) => (
                    <li key={i}>{area}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-yellow-400 mb-2">주의사항</h4>
                <ul className="list-disc list-inside space-y-1">
                  {result.analysis.growth.pitfalls.map((pitfall: string, i: number) => (
                    <li key={i}>{pitfall}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </ServiceDetailLayout>
  );
}
