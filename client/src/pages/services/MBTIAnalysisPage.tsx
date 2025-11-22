import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Loader2 } from 'lucide-react';
import ServiceDetailLayout from '../../components/ServiceDetailLayout';
import { getMBTIQuestions, analyzeMBTI } from '../../services/ai';
import { isLoggedIn, getToken } from '../../services/auth';
import { useSavedResult } from '../../hooks/useSavedResult';

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
  const [, setLocation] = useLocation();

  // Check for saved result in URL
  const params = new URLSearchParams(window.location.search);
  const resultId = params.get('resultId');

  const [step, setStep] = useState<'intro' | 'mbti-select' | 'test' | 'result'>(resultId ? 'result' : 'intro');
  const [userInputMBTI, setUserInputMBTI] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<number[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>('');


  // Load saved result if resultId is in URL
  const { loading: loadingSavedResult, error: savedResultError } = useSavedResult<any>((resultData) => {
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

  const handleStartFromIntro = () => {
    if (!isLoggedIn()) {
      alert('로그인이 필요한 서비스입니다. 로그인 후 이용해주세요.');
      return;
    }
    setStep('mbti-select');
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

  const handleSaveResult = async () => {
    if (!result) {
      alert('저장할 결과가 없습니다.');
      return;
    }

    try {
      setSaving(true);
      const token = getToken();
      if (!token) {
        alert('로그인이 필요합니다.');
        setLocation('/login');
        return;
      }

      const response = await fetch('/api/results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          serviceType: 'mbti',
          inputData: {},
          resultData: result,
          aiModel: 'gemini',
          tokensUsed: 0,
          processingTime: 0,
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          alert('로그인이 필요합니다.');
          setLocation('/login');
          return;
        }
        throw new Error('Failed to save result');
      }

      alert('결과가 저장되었습니다! "내 결과물"에서 확인할 수 있습니다.');
    } catch (error) {
      console.error('Error saving result:', error);
      alert('결과 저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setStep('mbti-select');
    setUserInputMBTI(null);
    setCurrentQuestionIndex(0);
    setAnswers(new Array(questions.length).fill(0));
    setResult(null);
    setError('');
  };

  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;

  return (
    <ServiceDetailLayout
      title="MBTI 심층분석"
      description="자가 진단과 테스트 결과를 비교하여 정확한 MBTI를 분석합니다"
      icon="psychology"
      color="purple"
    >
      {loadingSavedResult && (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
          <span className="ml-3 text-muted-foreground">저장된 결과를 불러오는 중...</span>
        </div>
      )}

      {savedResultError && (
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 text-red-400">
          {savedResultError}
        </div>
      )}

      {/* Introduction */}
      {!loadingSavedResult && !savedResultError && step === 'intro' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-foreground mb-4">
              MBTI 심층분석이란?
            </h3>
            <div className="space-y-4 text-muted-foreground">
              <p>
                AI가 자가 진단한 MBTI와 테스트 결과를 비교 분석하여
                더욱 정확한 성격 유형을 찾아드립니다.
              </p>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="p-4 rounded-lg bg-purple-500/20 border border-purple-500">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-purple-600 dark:text-purple-400">compare</span>
                    <span className="font-semibold text-purple-600 dark:text-purple-400">자가진단 비교</span>
                  </div>
                  <p className="text-sm opacity-80">입력한 MBTI와 테스트 결과 비교</p>
                </div>
                <div className="p-4 rounded-lg bg-purple-500/20 border border-purple-500">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-purple-600 dark:text-purple-400">person</span>
                    <span className="font-semibold text-purple-600 dark:text-purple-400">성격 특성</span>
                  </div>
                  <p className="text-sm opacity-80">주요 특성, 강점, 약점 분석</p>
                </div>
                <div className="p-4 rounded-lg bg-purple-500/20 border border-purple-500">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-purple-600 dark:text-purple-400">group</span>
                    <span className="font-semibold text-purple-600 dark:text-purple-400">대인관계</span>
                  </div>
                  <p className="text-sm opacity-80">소통 스타일, 궁합 유형</p>
                </div>
                <div className="p-4 rounded-lg bg-purple-500/20 border border-purple-500">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-purple-600 dark:text-purple-400">work</span>
                    <span className="font-semibold text-purple-600 dark:text-purple-400">진로 적성</span>
                  </div>
                  <p className="text-sm opacity-80">적합한 직업, 업무 스타일</p>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-500 rounded-lg p-4 mt-6 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-foreground font-semibold">MBTI 심층분석</p>
                  <p className="text-muted-foreground text-sm">40개의 질문 + AI 분석</p>
                </div>
                <div className="text-right">
                  <p className="text-purple-600 dark:text-purple-400 font-bold text-xl">35 크레딧</p>
                </div>
              </div>
            </div>

            <button
              onClick={handleStartFromIntro}
              className="w-full px-6 py-4 bg-purple-600 hover:bg-purple-700 text-foreground font-semibold rounded-lg transition-colors"
            >
              시작하기 (35 크레딧)
            </button>
          </div>
        </div>
      )}

      {/* MBTI Selection */}
      {step === 'mbti-select' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <div className="text-center mb-8">
              <h3 className="text-xl font-semibold text-foreground mb-4">
                자신의 MBTI를 알고 계신가요?
              </h3>
              <p className="text-muted-foreground">
                알고 있다면 선택해주세요. 테스트 결과와 비교 분석해드립니다.
              </p>
            </div>

            <div className="grid grid-cols-4 gap-3 mb-6">
              {MBTI_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => handleMBTIInput(type)}
                  className="px-4 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-purple-600 text-foreground rounded-lg transition-colors"
                >
                  {type}
                </button>
              ))}
            </div>

            <button
              onClick={() => handleMBTIInput(null)}
              className="w-full px-6 py-3 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-foreground rounded-lg transition-colors"
            >
              잘 모르겠어요 (테스트만 진행)
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Test Questions */}
      {!loadingSavedResult && !savedResultError && step === 'test' && !loading && questions.length > 0 && (
        <div className="space-y-6">
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>진행률</span>
              <span>{currentQuestionIndex + 1} / {questions.length}</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-purple-500 h-2 rounded-full transition-all duration-300"
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
                      ? 'bg-purple-600 text-foreground'
                      : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-foreground'
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
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground">AI가 분석 중입니다...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 text-red-400">
          {error}
        </div>
      )}

      {/* Step 3: Results */}
      {!loadingSavedResult && !savedResultError && step === 'result' && result && (
        <div className="space-y-6">
          {/* Comparison */}
          {result.analysis.comparison && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-foreground mb-4">결과 비교</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-muted-foreground text-sm">입력한 MBTI</p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {result.analysis.comparison.userInput || '없음'}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">테스트 결과</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {result.testResultMBTI}
                  </p>
                </div>
              </div>
              <p className="text-muted-foreground">{result.analysis.comparison.match}</p>
            </div>
          )}

          {/* Final MBTI */}
          <div className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-2">최종 결과</h3>
            <p className="text-4xl font-bold text-white mb-2">
              {result.analysis.finalMBTI.type}
            </p>
            <p className="text-white/80">
              확신도: {result.analysis.finalMBTI.confidence}
            </p>
          </div>

          {/* Axis Scores */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-foreground mb-4">축별 점수</h3>
            <div className="space-y-4">
              {Object.entries(result.axisScores).map(([axis, scores]: [string, any]) => {
                const [first, second] = axis.split('');
                return (
                  <div key={axis}>
                    <div className="flex justify-between text-sm text-muted-foreground mb-1">
                      <span>{first}: {scores[first]}%</span>
                      <span>{second}: {scores[second]}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
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
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-foreground mb-4">성격 특성</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-purple-600 dark:text-purple-400 mb-2">주요 특성</h4>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  {result.analysis.personality.traits.map((trait: string, i: number) => (
                    <li key={i}>{trait}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-green-600 dark:text-green-400 mb-2">강점</h4>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  {result.analysis.personality.strengths.map((strength: string, i: number) => (
                    <li key={i}>{strength}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-yellow-600 dark:text-yellow-400 mb-2">약점</h4>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  {result.analysis.personality.weaknesses.map((weakness: string, i: number) => (
                    <li key={i}>{weakness}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Relationships */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-foreground mb-4">대인관계</h3>
            <div className="space-y-3 text-muted-foreground">
              <p><strong className="text-purple-600 dark:text-purple-400">소통:</strong> {result.analysis.relationships.communicationStyle}</p>
              <p><strong className="text-purple-600 dark:text-purple-400">우정:</strong> {result.analysis.relationships.friendshipStyle}</p>
              <p><strong className="text-purple-600 dark:text-purple-400">연애:</strong> {result.analysis.relationships.loveStyle}</p>
              <p><strong className="text-purple-600 dark:text-purple-400">궁합:</strong> {result.analysis.relationships.compatibleTypes.join(', ')}</p>
            </div>
          </div>

          {/* Career */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-foreground mb-4">직업 및 진로</h3>
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-purple-600 dark:text-purple-400 mb-2">적합한 직업</h4>
                <div className="flex flex-wrap gap-2">
                  {result.analysis.career.suitableJobs.map((job: string, i: number) => (
                    <span key={i} className="px-3 py-1 bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300 rounded-full text-sm">
                      {job}
                    </span>
                  ))}
                </div>
              </div>
              <p className="text-muted-foreground"><strong className="text-purple-600 dark:text-purple-400">업무 스타일:</strong> {result.analysis.career.workStyle}</p>
              <p className="text-muted-foreground"><strong className="text-purple-600 dark:text-purple-400">리더십:</strong> {result.analysis.career.leadershipStyle}</p>
            </div>
          </div>

          {/* Growth */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-foreground mb-4">성장 조언</h3>
            <div className="space-y-4 text-muted-foreground">
              <div>
                <h4 className="font-semibold text-green-600 dark:text-green-400 mb-2">개발 영역</h4>
                <ul className="list-disc list-inside space-y-1">
                  {result.analysis.growth.developmentAreas.map((area: string, i: number) => (
                    <li key={i}>{area}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-yellow-600 dark:text-yellow-400 mb-2">주의사항</h4>
                <ul className="list-disc list-inside space-y-1">
                  {result.analysis.growth.pitfalls.map((pitfall: string, i: number) => (
                    <li key={i}>{pitfall}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          {/* Try Again */}
          <div className="space-y-3">
            <button
              onClick={handleSaveResult}
              disabled={saving}
              className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <span className="material-symbols-outlined animate-spin">progress_activity</span>
                  저장 중...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">save</span>
                  결과 저장하기
                </>
              )}
            </button>

            <button
              onClick={handleReset}
              className="w-full px-6 py-4 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-foreground font-semibold rounded-lg transition-colors"
            >
              다시 테스트하기
            </button>
          </div>
        </div>
      )}
    </ServiceDetailLayout>
  );
}
