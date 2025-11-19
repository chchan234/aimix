import { useState, useEffect } from 'react';
import ServiceDetailLayout from '../../components/ServiceDetailLayout';
import { getEnneagramQuestions, analyzeEnneagram } from '../../services/ai';

interface Question {
  id: number;
  question: string;
}

const ENNEAGRAM_TYPE_NAMES: { [key: number]: string } = {
  1: '개혁가 (완벽주의자)',
  2: '조력가 (돕는 사람)',
  3: '성취자 (성공 지향)',
  4: '예술가 (개인주의자)',
  5: '사색가 (관찰자)',
  6: '충성가 (의심하는 사람)',
  7: '열정가 (낙천주의자)',
  8: '도전자 (지도자)',
  9: '평화주의자 (중재자)',
};

export default function EnneagramTestPage() {
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

  const handleStartTest = () => {
    setStep('test');
  };

  const loadQuestions = async () => {
    try {
      const response = await getEnneagramQuestions() as any;
      if (response.success) {
        setQuestions(response.questions);
        setAnswers(new Array(response.questions.length).fill(0));
      }
    } catch (err) {
      console.error('Failed to load questions:', err);
      setError('질문을 불러오는데 실패했습니다.');
    }
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
      const response = await analyzeEnneagram(finalAnswers) as any;

      if (response.success) {
        setResult(response);
        setStep('result');
      } else {
        setError(response.error || '분석에 실패했습니다.');
      }
    } catch (err: any) {
      console.error('Enneagram analysis error:', err);
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
      title="에니어그램 테스트"
      description="9가지 성격 유형을 분석하여 당신의 핵심 동기와 성장 방향을 알려드립니다"
      icon="hub"
      color="green"
    >
      {/* Introduction */}
      {step === 'intro' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-foreground mb-4">
              에니어그램이란?
            </h3>
            <div className="space-y-4 text-muted-foreground">
              <p>
                에니어그램은 9가지 성격 유형을 통해 사람들의 핵심 동기와
                두려움을 이해하는 성격 분류 체계입니다.
              </p>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="p-4 rounded-lg bg-green-500/20 border border-green-500">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-green-400">psychology</span>
                    <span className="font-semibold text-green-400">핵심 동기</span>
                  </div>
                  <p className="text-sm opacity-80">왜 그렇게 행동하는지 이해</p>
                </div>
                <div className="p-4 rounded-lg bg-green-500/20 border border-green-500">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-green-400">dashboard</span>
                    <span className="font-semibold text-green-400">날개 유형</span>
                  </div>
                  <p className="text-sm opacity-80">인접 유형의 영향 분석</p>
                </div>
                <div className="p-4 rounded-lg bg-green-500/20 border border-green-500">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-green-400">trending_up</span>
                    <span className="font-semibold text-green-400">성장 방향</span>
                  </div>
                  <p className="text-sm opacity-80">통합과 분열 방향 파악</p>
                </div>
                <div className="p-4 rounded-lg bg-green-500/20 border border-green-500">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-green-400">favorite</span>
                    <span className="font-semibold text-green-400">건강 수준</span>
                  </div>
                  <p className="text-sm opacity-80">현재 상태와 개선점 분석</p>
                </div>
              </div>
            </div>

            <div className="bg-green-900/20 border border-green-500 rounded-lg p-4 mt-6 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-foreground font-semibold">에니어그램 테스트</p>
                  <p className="text-muted-foreground text-sm">약 20개의 질문 + AI 분석</p>
                </div>
                <div className="text-right">
                  <p className="text-green-400 font-bold text-xl">30 크레딧</p>
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
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>진행률</span>
              <span>{currentQuestionIndex + 1} / {questions.length}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Question */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <p className="text-lg text-foreground mb-6">
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
                      ? 'bg-green-600 text-foreground'
                      : 'bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-foreground'
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
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-500 mx-auto mb-4"></div>
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
          {/* Main Type */}
          <div className="bg-gradient-to-r from-green-900 to-teal-900 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-foreground mb-2">당신의 유형</h3>
            <p className="text-4xl font-bold text-foreground mb-2">
              {result.mainType}번 유형
            </p>
            <p className="text-2xl text-green-300 mb-2">
              {result.analysis.mainType.name}
            </p>
            <p className="text-xl text-muted-foreground">
              {result.analysis.mainType.nickname}
            </p>
            {result.wingType && (
              <p className="mt-4 text-muted-foreground">
                날개: {result.wingType}번 ({ENNEAGRAM_TYPE_NAMES[result.wingType]})
              </p>
            )}
          </div>

          {/* Type Scores */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-foreground mb-4">유형별 점수</h3>
            <div className="space-y-3">
              {Object.entries(result.typeScores)
                .sort(([, a]: [any, any], [, b]: [any, any]) => b - a)
                .map(([type, score]: [string, any]) => (
                  <div key={type}>
                    <div className="flex justify-between text-sm text-muted-foreground mb-1">
                      <span>{type}번 - {ENNEAGRAM_TYPE_NAMES[parseInt(type)]}</span>
                      <span>{score}점</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${parseInt(type) === result.mainType ? 'bg-green-500' : 'bg-gray-500'}`}
                        style={{ width: `${(score / 20) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Core Motivation & Fear */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-foreground mb-4">핵심 특성</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-green-400 mb-2">핵심 동기</h4>
                <p className="text-muted-foreground">{result.analysis.mainType.coreMotivation}</p>
              </div>
              <div>
                <h4 className="font-semibold text-red-400 mb-2">근본적 두려움</h4>
                <p className="text-muted-foreground">{result.analysis.mainType.coreFear}</p>
              </div>
              <div>
                <h4 className="font-semibold text-purple-400 mb-2">기본 성격 특성</h4>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  {result.analysis.mainType.traits.map((trait: string, i: number) => (
                    <li key={i}>{trait}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Wing Influence */}
          {result.wingType && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-foreground mb-4">날개의 영향</h3>
              <div className="space-y-3 text-muted-foreground">
                <p><strong className="text-green-400">영향:</strong> {result.analysis.wing.influence}</p>
                <p><strong className="text-green-400">조합:</strong> {result.analysis.wing.combination}</p>
                <div>
                  <h4 className="font-semibold text-green-400 mb-2">독특한 특징</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {result.analysis.wing.uniqueTraits.map((trait: string, i: number) => (
                      <li key={i}>{trait}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Health Levels */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-foreground mb-4">건강 수준</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-green-400 mb-2">건강한 상태</h4>
                <p className="text-muted-foreground">{result.analysis.healthLevels.healthy}</p>
              </div>
              <div>
                <h4 className="font-semibold text-yellow-400 mb-2">보통 상태</h4>
                <p className="text-muted-foreground">{result.analysis.healthLevels.average}</p>
              </div>
              <div>
                <h4 className="font-semibold text-red-400 mb-2">불건강한 상태</h4>
                <p className="text-muted-foreground">{result.analysis.healthLevels.unhealthy}</p>
              </div>
              <div className="bg-blue-900/30 border border-blue-500 rounded-lg p-4 mt-4">
                <h4 className="font-semibold text-blue-400 mb-2">현재 상태 평가</h4>
                <p className="text-muted-foreground">{result.analysis.healthLevels.currentAssessment}</p>
              </div>
            </div>
          </div>

          {/* Growth Directions */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-foreground mb-4">성장 방향</h3>
            <div className="space-y-4">
              <div className="bg-green-900/30 border border-green-500 rounded-lg p-4">
                <h4 className="font-semibold text-green-400 mb-2">
                  통합 방향 (성장 시 → {result.analysis.growth.integrationDirection.toType}번)
                </h4>
                <p className="text-muted-foreground">{result.analysis.growth.integrationDirection.description}</p>
              </div>
              <div className="bg-orange-900/30 border border-orange-500 rounded-lg p-4">
                <h4 className="font-semibold text-orange-400 mb-2">
                  분열 방향 (스트레스 시 → {result.analysis.growth.disintegrationDirection.toType}번)
                </h4>
                <p className="text-muted-foreground">{result.analysis.growth.disintegrationDirection.description}</p>
              </div>
              <div>
                <h4 className="font-semibold text-purple-400 mb-2">성장 실천 방법</h4>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  {result.analysis.growth.practices.map((practice: string, i: number) => (
                    <li key={i}>{practice}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Relationships */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-foreground mb-4">대인관계</h3>
            <div className="space-y-3 text-muted-foreground">
              <p><strong className="text-green-400">관계 스타일:</strong> {result.analysis.relationships.style}</p>
              <p><strong className="text-green-400">갈등 대응:</strong> {result.analysis.relationships.conflictStyle}</p>
              <div>
                <h4 className="font-semibold text-green-400 mb-2">궁합 좋은 유형</h4>
                <div className="flex flex-wrap gap-2">
                  {result.analysis.relationships.compatibleTypes.map((type: number, i: number) => (
                    <span key={i} className="px-3 py-1 bg-green-900/50 text-green-300 rounded-full text-sm">
                      {type}번 - {ENNEAGRAM_TYPE_NAMES[type]}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Career */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-foreground mb-4">직업 및 커리어</h3>
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-green-400 mb-2">적합한 직업</h4>
                <div className="flex flex-wrap gap-2">
                  {result.analysis.career.suitableJobs.map((job: string, i: number) => (
                    <span key={i} className="px-3 py-1 bg-green-900/50 text-green-300 rounded-full text-sm">
                      {job}
                    </span>
                  ))}
                </div>
              </div>
              <p className="text-muted-foreground"><strong className="text-green-400">선호 환경:</strong> {result.analysis.career.workEnvironment}</p>
              <p className="text-muted-foreground"><strong className="text-green-400">리더십:</strong> {result.analysis.career.leadershipStyle}</p>
            </div>
          </div>

          {/* Development */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-foreground mb-4">자기개발</h3>
            <div className="space-y-4 text-muted-foreground">
              <div>
                <h4 className="font-semibold text-blue-400 mb-2">핵심 개발 과제</h4>
                <ul className="list-disc list-inside space-y-1">
                  {result.analysis.development.keyTasks.map((task: string, i: number) => (
                    <li key={i}>{task}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-yellow-400 mb-2">극복할 패턴</h4>
                <ul className="list-disc list-inside space-y-1">
                  {result.analysis.development.patternsToBreak.map((pattern: string, i: number) => (
                    <li key={i}>{pattern}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-green-400 mb-2">균형 조언</h4>
                <ul className="list-disc list-inside space-y-1">
                  {result.analysis.development.balanceTips.map((tip: string, i: number) => (
                    <li key={i}>{tip}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Try Again */}
          <button
            onClick={handleReset}
            className="w-full px-6 py-4 bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 text-foreground font-semibold rounded-lg transition-colors"
          >
            다시 테스트하기
          </button>
        </div>
      )}
    </ServiceDetailLayout>
  );
}
