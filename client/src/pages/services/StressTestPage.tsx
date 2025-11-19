import { useState, useEffect } from 'react';
import ServiceDetailLayout from '../../components/ServiceDetailLayout';
import { getStressQuestions, analyzeStress } from '../../services/ai';

interface Question {
  id: number;
  question: string;
}

const CATEGORY_NAMES: { [key: string]: string } = {
  work: '업무/커리어',
  relationships: '대인관계',
  health: '건강',
  life: '일상생활'
};

export default function StressTestPage() {
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
      const response = await getStressQuestions() as any;
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
      const response = await analyzeStress(finalAnswers) as any;

      if (response.success) {
        setResult(response);
        setStep('result');
      } else {
        setError(response.error || '분석에 실패했습니다.');
      }
    } catch (err: any) {
      console.error('Stress analysis error:', err);
      setError(err.message || '분석 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;

  const getStressLevelColor = (level: number) => {
    if (level >= 80) return 'text-red-400';
    if (level >= 60) return 'text-orange-400';
    if (level >= 40) return 'text-yellow-400';
    return 'text-green-400';
  };

  const getStressLevelBg = (level: number) => {
    if (level >= 80) return 'bg-red-500';
    if (level >= 60) return 'bg-orange-500';
    if (level >= 40) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <ServiceDetailLayout
      title="스트레스 지수 측정"
      description="현재 스트레스 수준을 측정하고 관리 방법을 제공합니다"
      icon="spa"
      color="cyan"
    >
      {/* Introduction */}
      {step === 'intro' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-foreground mb-4">
              스트레스 지수 측정이란?
            </h3>
            <div className="space-y-4 text-muted-foreground">
              <p>
                현재 경험하고 있는 스트레스 수준을 4가지 영역에서 측정하고, AI가 개인 맞춤형 관리 방법을 제공합니다.
              </p>
              <div className="bg-cyan-900/20 border border-cyan-500 rounded-lg p-4 mt-4">
                <h4 className="font-semibold text-cyan-400 mb-2">측정 영역</h4>
                <ul className="space-y-2">
                  <li>• <strong>업무/커리어</strong>: 직장이나 학업 관련 스트레스</li>
                  <li>• <strong>대인관계</strong>: 가족, 친구, 동료와의 관계</li>
                  <li>• <strong>건강</strong>: 수면, 피로, 신체 증상</li>
                  <li>• <strong>일상생활</strong>: 재정, 미래, 일상 관리</li>
                </ul>
              </div>
              <p className="text-sm text-muted-foreground bg-cyan-900/10 p-3 rounded">
                ⚠️ 이 테스트는 전문적인 의학적 진단을 대체할 수 없습니다. 심각한 스트레스나 정신 건강 문제가 있다면 전문가의 도움을 받으세요.
              </p>
            </div>

            <div className="bg-cyan-900/20 border border-cyan-500 rounded-lg p-4 mt-6 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-foreground font-semibold">스트레스 지수 측정</p>
                  <p className="text-muted-foreground text-sm">20개의 질문 + AI 분석</p>
                </div>
                <div className="text-right">
                  <p className="text-cyan-400 font-bold text-xl">25 크레딧</p>
                </div>
              </div>
            </div>

            <button
              onClick={handleStartTest}
              className="w-full px-6 py-4 bg-cyan-600 hover:bg-cyan-700 text-foreground font-semibold rounded-lg transition-colors"
            >
              측정 시작 (25 크레딧)
            </button>
          </div>
        </div>
      )}

      {/* Test Questions */}
      {step === 'test' && !loading && questions.length > 0 && (
        <div className="space-y-6">
          <div className="mb-6">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>진행률</span>
              <span>{currentQuestionIndex + 1} / {questions.length}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-cyan-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <p className="text-lg text-foreground mb-6">
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
                      ? 'bg-cyan-600 text-foreground'
                      : 'bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-foreground'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {currentQuestionIndex > 0 && (
              <button
                onClick={handlePrevious}
                className="mt-6 px-6 py-2 bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 text-foreground rounded-lg"
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
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground">AI가 분석 중입니다...</p>
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
          {/* Overall Stress Level */}
          <div className="bg-gradient-to-r from-cyan-900 to-blue-900 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-foreground mb-4">전체 스트레스 지수</h3>
            <div className="flex items-center justify-center mb-4">
              <span className={`text-6xl font-bold ${getStressLevelColor(result.overallStressLevel)}`}>
                {result.overallStressLevel}%
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-4 mb-4">
              <div
                className={`h-4 rounded-full ${getStressLevelBg(result.overallStressLevel)}`}
                style={{ width: `${result.overallStressLevel}%` }}
              />
            </div>
            <p className="text-muted-foreground text-center">{result.analysis.overallAssessment.description}</p>
            {result.analysis.overallAssessment.riskFactors.length > 0 && (
              <div className="mt-4 bg-red-900/20 border border-red-500 rounded-lg p-4">
                <h4 className="font-semibold text-red-400 mb-2">주요 위험 요인</h4>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  {result.analysis.overallAssessment.riskFactors.map((factor: string, i: number) => (
                    <li key={i}>{factor}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Category Scores */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-foreground mb-4">영역별 스트레스</h3>
            <div className="space-y-4">
              {Object.entries(result.categoryScores).map(([category, score]: [string, any]) => (
                <div key={category}>
                  <div className="flex justify-between text-sm text-muted-foreground mb-1">
                    <span>{CATEGORY_NAMES[category]}</span>
                    <span>{score}/25점</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className={getStressLevelBg(Math.round((score / 25) * 100))}
                      style={{ width: `${(score / 25) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Category Details */}
          {Object.entries(result.analysis.categories).map(([category, data]: [string, any]) => (
            <div key={category} className="bg-white dark:bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {CATEGORY_NAMES[category]} - {data.level}
              </h3>
              <p className="text-muted-foreground mb-4">{data.analysis}</p>
              {data.concerns.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold text-orange-400 mb-2">우려사항</h4>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    {data.concerns.map((c: string, i: number) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}
              <div>
                <h4 className="font-semibold text-cyan-400 mb-2">대처 방법</h4>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  {data.tips.map((tip: string, i: number) => (
                    <li key={i}>{tip}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}

          {/* Management */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-foreground mb-4">스트레스 관리</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-red-400 mb-2">즉시 대처 사항</h4>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  {result.analysis.management.immediatePriorities.map((priority: string, i: number) => (
                    <li key={i}>{priority}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-cyan-400 mb-2">대처 전략</h4>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  {result.analysis.management.copingStrategies.map((strategy: string, i: number) => (
                    <li key={i}>{strategy}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-green-400 mb-2">이완 기법</h4>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  {result.analysis.management.relaxationTechniques.map((technique: string, i: number) => (
                    <li key={i}>{technique}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-blue-400 mb-2">생활습관 개선</h4>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  {result.analysis.management.lifestyleChanges.map((change: string, i: number) => (
                    <li key={i}>{change}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Resources */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-foreground mb-4">지원 및 자원</h3>
            <div className="space-y-4 text-muted-foreground">
              <div className="bg-cyan-900/20 border border-cyan-500 rounded-lg p-4">
                <h4 className="font-semibold text-cyan-400 mb-2">전문가 도움</h4>
                <p>{result.analysis.resources.professionalHelp}</p>
              </div>
              <div>
                <h4 className="font-semibold text-cyan-400 mb-2">지원 체계</h4>
                <ul className="list-disc list-inside space-y-1">
                  {result.analysis.resources.supportSystems.map((system: string, i: number) => (
                    <li key={i}>{system}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-cyan-400 mb-2">자기관리 활동</h4>
                <ul className="list-disc list-inside space-y-1">
                  {result.analysis.resources.selfCareActivities.map((activity: string, i: number) => (
                    <li key={i}>{activity}</li>
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
