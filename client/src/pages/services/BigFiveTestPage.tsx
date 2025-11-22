import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import ServiceDetailLayout from '../../components/ServiceDetailLayout';
import { getBigFiveQuestions, analyzeBigFive } from '../../services/ai';
import { isLoggedIn } from '../../services/auth';
import { useSavedResult } from '../../hooks/useSavedResult';

interface Question {
  id: number;
  question: string;
}

const TRAIT_NAMES: { [key: string]: string } = {
  O: '개방성',
  C: '성실성',
  E: '외향성',
  A: '친화성',
  N: '신경성'
};

export default function BigFiveTestPage() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<'intro' | 'test' | 'result'>('intro');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<number[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>('');


  // Load saved result if resultId is in URL
  useSavedResult<any>((resultData) => {
    setResult(resultData);
    setStep("result");
  });

  useEffect(() => {
    loadQuestions();
  }, []);

  // Auth state monitoring - redirect if logged out
  useEffect(() => {
    const checkAuth = () => {
      if (!isLoggedIn()) {
        setLocation('/login');
      }
    };

    window.addEventListener('focus', checkAuth);
    window.addEventListener('storage', checkAuth);

    return () => {
      window.removeEventListener('focus', checkAuth);
      window.removeEventListener('storage', checkAuth);
    };
  }, [setLocation]);

  const loadQuestions = async () => {
    try {
      const response = await getBigFiveQuestions() as any;
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
    if (!isLoggedIn()) {
      alert('로그인이 필요한 서비스입니다. 로그인 후 이용해주세요.');
      return;
    }
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
      const response = await analyzeBigFive(finalAnswers) as any;

      if (response.success) {
        setResult(response);
        setStep('result');
      } else {
        setError(response.error || '분석에 실패했습니다.');
      }
    } catch (err: any) {
      console.error('Big Five analysis error:', err);
      setError(err.message || '분석 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep('intro');
    setCurrentQuestionIndex(0);
    setAnswers(new Array(questions.length).fill(0));
    setResult(null);
    setError('');
  };

  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;

  return (
    <ServiceDetailLayout
      title="Big 5 성격 테스트"
      description="5가지 핵심 성격 특성을 분석하여 당신의 성격을 과학적으로 이해합니다"
      icon="workspaces"
      color="green"
    >
      {/* Introduction */}
      {step === 'intro' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-foreground mb-4">
              Big Five 성격 테스트란?
            </h3>
            <div className="space-y-4 text-muted-foreground">
              <p>
                Big Five는 가장 과학적으로 검증된 성격 분류 모델로,
                5가지 핵심 특성을 통해 개인의 성격을 이해합니다.
              </p>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="p-4 rounded-lg bg-green-500/20 border border-green-500">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-green-600 dark:text-green-400">lightbulb</span>
                    <span className="font-semibold text-green-600 dark:text-green-400">개방성</span>
                  </div>
                  <p className="text-sm opacity-80">새로운 경험과 아이디어 수용</p>
                </div>
                <div className="p-4 rounded-lg bg-green-500/20 border border-green-500">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-green-600 dark:text-green-400">task_alt</span>
                    <span className="font-semibold text-green-600 dark:text-green-400">성실성</span>
                  </div>
                  <p className="text-sm opacity-80">목표 지향성과 자기 통제력</p>
                </div>
                <div className="p-4 rounded-lg bg-green-500/20 border border-green-500">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-green-600 dark:text-green-400">groups</span>
                    <span className="font-semibold text-green-600 dark:text-green-400">외향성</span>
                  </div>
                  <p className="text-sm opacity-80">사회적 상호작용 에너지</p>
                </div>
                <div className="p-4 rounded-lg bg-green-500/20 border border-green-500">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-green-600 dark:text-green-400">handshake</span>
                    <span className="font-semibold text-green-600 dark:text-green-400">친화성</span>
                  </div>
                  <p className="text-sm opacity-80">타인에 대한 배려와 협조</p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 border border-green-500 rounded-lg p-4 mt-6 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-foreground font-semibold">Big Five 성격 테스트</p>
                  <p className="text-muted-foreground text-sm">25개의 질문 + AI 분석</p>
                </div>
                <div className="text-right">
                  <p className="text-green-600 dark:text-green-400 font-bold text-xl">30 크레딧</p>
                </div>
              </div>
            </div>

            <button
              onClick={handleStartTest}
              className="w-full px-6 py-4 bg-green-600 hover:bg-green-700 text-foreground font-semibold rounded-lg transition-colors"
            >
              시작하기 (30 크레딧)
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
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
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
                      ? 'bg-green-600 text-foreground'
                      : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-foreground'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {currentQuestionIndex > 0 && (
              <button
                onClick={handlePrevious}
                className="mt-6 px-6 py-2 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-foreground rounded-lg"
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
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground">AI가 분석 중입니다...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Results */}
      {step === 'result' && result && (
        <div className="space-y-6">
          {/* Summary */}
          <div className="bg-gradient-to-r from-green-500 to-teal-500 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-4">종합 분석</h3>
            <p className="text-white/80 leading-relaxed">{result.analysis.summary.overview}</p>
            <div className="mt-4">
              <h4 className="font-semibold text-green-100 mb-2">두드러진 특성</h4>
              <div className="flex flex-wrap gap-2">
                {result.analysis.summary.dominantTraits.map((trait: string, i: number) => (
                  <span key={i} className="px-3 py-1 bg-green-700 text-white rounded-full text-sm">
                    {trait}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Trait Scores */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-foreground mb-4">특성별 점수</h3>
            <div className="space-y-4">
              {Object.entries(result.traitScores).map(([trait, score]: [string, any]) => (
                <div key={trait}>
                  <div className="flex justify-between text-sm text-muted-foreground mb-1">
                    <span>{TRAIT_NAMES[trait]}</span>
                    <span>{score}/25점</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${(score / 25) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trait Details */}
          {Object.entries(result.analysis.traits).map(([trait, data]: [string, any]) => (
            <div key={trait} className="bg-white dark:bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {TRAIT_NAMES[trait]} - {data.level}
              </h3>
              <p className="text-muted-foreground mb-4">{data.description}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-green-600 dark:text-green-400 mb-2">강점</h4>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    {data.strengths.map((s: string, i: number) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-yellow-600 dark:text-yellow-400 mb-2">어려움</h4>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    {data.challenges.map((c: string, i: number) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}

          {/* Career */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-foreground mb-4">커리어</h3>
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-green-600 dark:text-green-400 mb-2">적합한 분야</h4>
                <div className="flex flex-wrap gap-2">
                  {result.analysis.career.suitableFields.map((field: string, i: number) => (
                    <span key={i} className="px-3 py-1 bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-300 rounded-full text-sm">
                      {field}
                    </span>
                  ))}
                </div>
              </div>
              <p className="text-muted-foreground"><strong className="text-green-600 dark:text-green-400">업무 스타일:</strong> {result.analysis.career.workStyle}</p>
              <p className="text-muted-foreground"><strong className="text-green-600 dark:text-green-400">팀 역할:</strong> {result.analysis.career.teamRole}</p>
            </div>
          </div>

          {/* Relationships */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-foreground mb-4">대인관계</h3>
            <div className="space-y-3 text-muted-foreground">
              <p><strong className="text-green-600 dark:text-green-400">스타일:</strong> {result.analysis.relationships.interpersonalStyle}</p>
              <div>
                <h4 className="font-semibold text-green-600 dark:text-green-400 mb-2">의사소통 팁</h4>
                <ul className="list-disc list-inside space-y-1">
                  {result.analysis.relationships.communicationTips.map((tip: string, i: number) => (
                    <li key={i}>{tip}</li>
                  ))}
                </ul>
              </div>
              <p>{result.analysis.relationships.compatibilityNotes}</p>
            </div>
          </div>

          {/* Growth */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-foreground mb-4">성장 조언</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-green-600 dark:text-green-400 mb-2">추천사항</h4>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  {result.analysis.growth.recommendations.map((rec: string, i: number) => (
                    <li key={i}>{rec}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-yellow-600 dark:text-yellow-400 mb-2">균형 조언</h4>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  {result.analysis.growth.balanceTips.map((tip: string, i: number) => (
                    <li key={i}>{tip}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          {/* Try Again */}
          <button
            onClick={handleReset}
            className="w-full px-6 py-4 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-foreground font-semibold rounded-lg transition-colors"
          >
            다시 테스트하기
          </button>
        </div>
      )}
    </ServiceDetailLayout>
  );
}
