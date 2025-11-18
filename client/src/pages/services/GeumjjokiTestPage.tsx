import { useState, useEffect } from 'react';
import ServiceDetailLayout from '../../components/ServiceDetailLayout';
import { getGeumjjokiQuestions, analyzeGeumjjoki } from '../../services/ai';

interface Question {
  id: number;
  question: string;
}

const CATEGORY_NAMES: { [key: string]: string } = {
  impulse: '충동성/자기조절',
  focus: '집중력/계획성',
  emotion: '감정조절/대인관계',
  lifestyle: '생활습관/책임감',
  digital: '디지털/SNS 습관'
};

export default function GeumjjokiTestPage() {
  const [step, setStep] = useState<'intro' | 'test' | 'result'>('intro');
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
      const response = await getGeumjjokiQuestions() as any;
      if (response.success) {
        setQuestions(response.questions);
        setAnswers(new Array(response.questions.length).fill(0));
      }
    } catch (err) {
      console.error('Failed to load questions:', err);
      setError('질문을 불러오는데 실패했습니다.');
    }
  };

  const handleStartTest = () => {
    setStep('test');
  };

  const handleAnswer = (value: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = value;
    setAnswers(newAnswers);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
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
      const response = await analyzeGeumjjoki(finalAnswers) as any;

      if (response.success) {
        setResult(response);
        setStep('result');
      } else {
        setError(response.error || '분석에 실패했습니다.');
      }
    } catch (err: any) {
      console.error('Geumjjoki analysis error:', err);
      setError(err.message || '분석 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 20) return 'text-red-400';
    if (score >= 15) return 'text-orange-400';
    if (score >= 10) return 'text-yellow-400';
    return 'text-green-400';
  };

  const getGradeColor = (score: number) => {
    if (score >= 81) return 'from-red-900 to-red-700';
    if (score >= 61) return 'from-orange-900 to-orange-700';
    if (score >= 41) return 'from-yellow-900 to-yellow-700';
    if (score >= 21) return 'from-green-900 to-green-700';
    return 'from-blue-900 to-blue-700';
  };

  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;

  return (
    <ServiceDetailLayout
      title="금쪽이 테스트"
      description="10-30대를 위한 재미있는 자가진단 테스트"
      icon="celebration"
      color="orange"
    >
      {/* Introduction */}
      {step === 'intro' && (
        <div className="space-y-6">
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-4">
              나는 금쪽이일까? 😅
            </h3>
            <div className="space-y-4 text-gray-300">
              <p>
                "금쪽같은 내새끼"에서 영감을 받은 재미있는 자가진단 테스트입니다.
                일상 속 나의 행동 패턴과 습관을 진단해보세요!
              </p>
              <div className="bg-orange-900/20 border border-orange-500 rounded-lg p-4 mt-4">
                <h4 className="font-semibold text-orange-400 mb-2">5가지 카테고리</h4>
                <ul className="space-y-2">
                  <li>• <strong>충동성/자기조절</strong>: 참을성과 자제력</li>
                  <li>• <strong>집중력/계획성</strong>: 주의력과 실행력</li>
                  <li>• <strong>감정조절/대인관계</strong>: 감정 표현과 소통</li>
                  <li>• <strong>생활습관/책임감</strong>: 일상 관리와 약속</li>
                  <li>• <strong>디지털/SNS 습관</strong>: 스마트폰과 SNS 사용</li>
                </ul>
              </div>
              <div className="bg-orange-900/20 border border-orange-500 rounded-lg p-4 mt-4">
                <h4 className="font-semibold text-orange-400 mb-2">등급 시스템</h4>
                <ul className="space-y-1 text-sm">
                  <li>😇 <strong>천사</strong>: 자기관리가 완벽한 모범생</li>
                  <li>😊 <strong>순한 아이</strong>: 가끔 실수하지만 전반적으로 괜찮음</li>
                  <li>😅 <strong>보통 금쪽이</strong>: 현대인의 평균, MZ세대의 일반적 모습</li>
                  <li>🤪 <strong>진성 금쪽이</strong>: 주변 사람들이 좀 힘들어함</li>
                  <li>🔥 <strong>전설의 금쪽이</strong>: 오은영 박사님이 필요한 레벨</li>
                </ul>
              </div>
            </div>

            <div className="bg-orange-900/20 border border-orange-500 rounded-lg p-4 mt-6 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-semibold">금쪽이 테스트</p>
                  <p className="text-gray-400 text-sm">30개의 질문 + AI 분석</p>
                </div>
                <div className="text-right">
                  <p className="text-orange-400 font-bold text-xl">30 크레딧</p>
                </div>
              </div>
            </div>

            <button
              onClick={handleStartTest}
              className="w-full px-6 py-4 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg transition-colors"
            >
              테스트 시작 (30 크레딧)
            </button>
          </div>
        </div>
      )}

      {/* Test Questions */}
      {step === 'test' && !loading && questions.length > 0 && (
        <div className="space-y-6">
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>진행률</span>
              <span>{currentQuestionIndex + 1} / {questions.length}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <div className="text-sm text-orange-400 mb-2">
              질문 {currentQuestionIndex + 1}
            </div>
            <p className="text-lg text-white mb-6">
              {questions[currentQuestionIndex]?.question}
            </p>

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
                      ? 'bg-orange-600 text-white'
                      : 'bg-gray-700 hover:bg-gray-600 text-white'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

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
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-400">AI가 당신의 금쪽이 지수를 분석 중입니다...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 text-red-400">
          {error}
        </div>
      )}

      {/* Results */}
      {step === 'result' && result && (
        <div className="space-y-6">
          {/* Grade */}
          <div className={`bg-gradient-to-r ${getGradeColor(result.geumjjokiScore)} rounded-lg p-6`}>
            <h3 className="text-xl font-semibold text-white mb-2">당신의 금쪽이 지수</h3>
            <div className="flex items-baseline gap-3 mb-2">
              <span className="text-5xl font-bold text-white">{result.geumjjokiScore}</span>
              <span className="text-2xl text-gray-200">/ 100</span>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-3xl">{result.grade.emoji}</span>
              <span className="text-2xl font-bold text-white">{result.grade.name}</span>
            </div>
            <p className="text-gray-200">{result.grade.description}</p>
          </div>

          {/* Summary */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-4">종합 분석</h3>
            <div className="space-y-3 text-gray-300">
              <p><strong className="text-orange-400">유형:</strong> {result.analysis.summary.mainType}</p>
              <p className="text-lg italic">"{result.analysis.summary.oneLineComment}"</p>
            </div>
          </div>

          {/* Category Scores */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-4">카테고리별 점수</h3>
            <div className="space-y-4">
              {Object.entries(result.categoryScores).map(([category, score]: [string, any]) => (
                <div key={category}>
                  <div className="flex justify-between text-sm text-gray-400 mb-1">
                    <span>{CATEGORY_NAMES[category]}</span>
                    <span className={getScoreColor(score)}>{score} / 30</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-orange-500 h-2 rounded-full"
                      style={{ width: `${(score / 30) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Category Analysis */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-4">상세 분석</h3>
            <div className="space-y-4">
              {Object.entries(result.analysis.categoryAnalysis || {}).map(([category, data]: [string, any]) => (
                <div key={category} className="border-l-4 border-orange-500 pl-4">
                  <h4 className="font-semibold text-orange-400 mb-2">
                    {CATEGORY_NAMES[category]} - {data.level}
                  </h4>
                  <ul className="list-disc list-inside text-gray-300 space-y-1 text-sm">
                    {data.characteristics?.map((char: string, i: number) => (
                      <li key={i}>{char}</li>
                    ))}
                  </ul>
                  {data.impact && (
                    <p className="mt-2 text-gray-400 text-sm">💡 {data.impact}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Strengths & Challenges */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-4">강점과 개선점</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-green-400 mb-2">✨ 강점</h4>
                <ul className="list-disc list-inside text-gray-300 space-y-1 text-sm">
                  {result.analysis.strengths?.map((strength: string, i: number) => (
                    <li key={i}>{strength}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-yellow-400 mb-2">💪 개선이 필요한 습관</h4>
                <ul className="list-disc list-inside text-gray-300 space-y-1 text-sm">
                  {result.analysis.challenges?.map((challenge: string, i: number) => (
                    <li key={i}>{challenge}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Improvement */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-4">개선 가이드</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-orange-400 mb-2">🎯 최우선 개선사항</h4>
                <ul className="list-decimal list-inside text-gray-300 space-y-1">
                  {result.analysis.improvement?.priority?.map((item: string, i: number) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-blue-400 mb-2">💡 실천 가능한 팁</h4>
                <ul className="list-disc list-inside text-gray-300 space-y-1">
                  {result.analysis.improvement?.tips?.map((tip: string, i: number) => (
                    <li key={i}>{tip}</li>
                  ))}
                </ul>
              </div>
              <div className="bg-orange-900/20 border border-orange-500 rounded-lg p-4">
                <p className="text-gray-300 italic">
                  {result.analysis.improvement?.encouragement}
                </p>
              </div>
            </div>
          </div>

          {/* For Others */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-4">주변 사람들을 위한</h3>
            <div className="space-y-3 text-gray-300">
              <p><strong className="text-orange-400">그들이 느끼는 점:</strong> {result.analysis.forOthers?.howTheyFeel}</p>
              <p><strong className="text-orange-400">조언:</strong> {result.analysis.forOthers?.advice}</p>
            </div>
          </div>
        </div>
      )}
    </ServiceDetailLayout>
  );
}
