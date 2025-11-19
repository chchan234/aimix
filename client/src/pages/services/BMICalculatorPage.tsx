import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import ServiceDetailLayout from '../../components/ServiceDetailLayout';
import { calculateBMI } from '../../services/ai';
import { isLoggedIn } from '../../services/auth';

interface BMIResult {
  bmi: number;
  category: string;
  idealWeight: {
    min: number;
    max: number;
    description?: string;
  };
  healthRisks: string[];
  recommendations: {
    diet: string[];
    exercise: string[];
    lifestyle: string[];
  };
  dailyCalories?: {
    maintain: number;
    lose: number;
    gain: number;
  };
  metabolicAge?: string;
  overallComment?: string;
}

export default function BMICalculatorPage() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<'intro' | 'input' | 'result'>('intro');
  const [height, setHeight] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const [age, setAge] = useState<string>('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BMIResult | null>(null);
  const [error, setError] = useState<string>('');

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

  const handleStartTest = () => {
    if (!isLoggedIn()) {
      alert('로그인이 필요한 서비스입니다. 로그인 후 이용해주세요.');
      return;
    }
    setStep('input');
  };

  const handleCalculate = async () => {
    if (!height || !weight || !age) {
      setError('모든 정보를 입력해주세요.');
      return;
    }

    const heightNum = parseFloat(height);
    const weightNum = parseFloat(weight);
    const ageNum = parseInt(age);

    if (heightNum < 100 || heightNum > 250) {
      setError('키는 100cm~250cm 사이로 입력해주세요.');
      return;
    }

    if (weightNum < 20 || weightNum > 300) {
      setError('체중은 20kg~300kg 사이로 입력해주세요.');
      return;
    }

    if (ageNum < 10 || ageNum > 120) {
      setError('나이는 10~120세 사이로 입력해주세요.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await calculateBMI(heightNum, weightNum, ageNum, gender) as any;

      if (response.success) {
        setResult(response.analysis);
        setStep('result');
      } else {
        setError(response.error || '계산에 실패했습니다.');
      }
    } catch (err: any) {
      console.error('BMI calculation error:', err);
      setError(err.message || '계산 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep('input');
    setResult(null);
    setError('');
  };

  const getBMIColor = (bmi: number) => {
    if (bmi < 18.5) return 'text-blue-400';
    if (bmi < 23) return 'text-green-400';
    if (bmi < 25) return 'text-yellow-400';
    if (bmi < 30) return 'text-orange-400';
    return 'text-red-400';
  };

  const getBMICategoryColor = (category: string) => {
    if (category.includes('저체중')) return 'bg-blue-500/20 text-blue-400';
    if (category.includes('정상')) return 'bg-green-500/20 text-green-400';
    if (category.includes('과체중')) return 'bg-yellow-500/20 text-yellow-400';
    if (category.includes('비만')) return 'bg-orange-500/20 text-orange-400';
    if (category.includes('고도')) return 'bg-red-500/20 text-red-400';
    return 'bg-gray-500/20 text-muted-foreground';
  };

  return (
    <ServiceDetailLayout
      title="AI BMI 계산기"
      description="체질량 지수를 계산하고 건강 조언을 받아보세요"
      icon="monitor_weight"
      color="green"
    >
      {/* Introduction */}
      {step === 'intro' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined text-3xl text-green-400">monitor_weight</span>
              <h3 className="text-xl font-semibold text-foreground">
                AI BMI 계산기
              </h3>
            </div>
            <p className="text-muted-foreground mb-6">
              키, 체중, 나이를 입력하면 AI가 BMI를 계산하고 맞춤 건강 조언을 제공합니다.
              정확한 체질량 지수와 함께 식단, 운동, 생활습관 가이드를 받아보세요.
            </p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-green-400">calculate</span>
                  <span className="text-foreground font-medium">BMI 계산</span>
                </div>
                <p className="text-muted-foreground text-sm">정확한 체질량 지수 계산</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-green-400">health_and_safety</span>
                  <span className="text-foreground font-medium">건강 분석</span>
                </div>
                <p className="text-muted-foreground text-sm">건강 위험도 평가</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-green-400">restaurant</span>
                  <span className="text-foreground font-medium">식단 조언</span>
                </div>
                <p className="text-muted-foreground text-sm">맞춤 식단 가이드</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-green-400">directions_run</span>
                  <span className="text-foreground font-medium">운동 추천</span>
                </div>
                <p className="text-muted-foreground text-sm">효과적인 운동 방법</p>
              </div>
            </div>

            <div className="bg-green-900/20 border border-green-500 rounded-lg p-4 mt-6 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-foreground font-semibold">AI BMI 계산기</p>
                  <p className="text-muted-foreground text-sm">BMI 계산 + 건강 조언</p>
                </div>
                <div className="text-right">
                  <p className="text-green-400 font-bold text-xl">15 크레딧</p>
                </div>
              </div>
            </div>

            <button
              onClick={handleStartTest}
              className="w-full px-6 py-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
            >
              시작하기 (15 크레딧)
            </button>
          </div>
        </div>
      )}

      {/* Input */}
      {step === 'input' && !loading && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">신체 정보 입력</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-muted-foreground text-sm mb-2">키 (cm)</label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="170"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-foreground focus:outline-none focus:border-green-500"
                />
              </div>

              <div>
                <label className="block text-muted-foreground text-sm mb-2">체중 (kg)</label>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="70"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-foreground focus:outline-none focus:border-green-500"
                />
              </div>

              <div>
                <label className="block text-muted-foreground text-sm mb-2">나이</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="30"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-foreground focus:outline-none focus:border-green-500"
                />
              </div>

              <div>
                <label className="block text-muted-foreground text-sm mb-2">성별</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setGender('male')}
                    className={`p-3 rounded-lg border transition-all ${
                      gender === 'male'
                        ? 'bg-green-500/20 text-green-400 border-green-500'
                        : 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-muted-foreground hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    <span className="material-symbols-outlined text-xl block mb-1">male</span>
                    <span className="text-sm font-medium">남성</span>
                  </button>
                  <button
                    onClick={() => setGender('female')}
                    className={`p-3 rounded-lg border transition-all ${
                      gender === 'female'
                        ? 'bg-green-500/20 text-green-400 border-green-500'
                        : 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-muted-foreground hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    <span className="material-symbols-outlined text-xl block mb-1">female</span>
                    <span className="text-sm font-medium">여성</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleCalculate}
            disabled={!height || !weight || !age}
            className={`w-full px-6 py-4 font-semibold rounded-lg transition-colors ${
              height && weight && age
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-muted-foreground cursor-not-allowed'
            }`}
          >
            계산하기
          </button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground">AI가 분석하고 있습니다...</p>
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
          {/* BMI Score */}
          <div className="bg-gradient-to-r from-green-900 to-teal-900 rounded-lg p-6 text-center">
            <p className="text-white/70 text-sm mb-2">당신의 BMI</p>
            <h3 className={`text-5xl font-bold mb-2 ${getBMIColor(result.bmi)}`}>
              {result.bmi.toFixed(1)}
            </h3>
            <span className={`px-4 py-1 rounded-full text-sm ${getBMICategoryColor(result.category)}`}>
              {result.category}
            </span>
          </div>

          {/* BMI Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-foreground mb-4">
              <span className="material-symbols-outlined align-middle mr-2">bar_chart</span>
              BMI 분류표
            </h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-24 text-sm text-muted-foreground">저체중</div>
                <div className="flex-1 h-4 bg-blue-500/50 rounded"></div>
                <div className="w-16 text-sm text-muted-foreground text-right">&lt; 18.5</div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-24 text-sm text-muted-foreground">정상</div>
                <div className="flex-1 h-4 bg-green-500/50 rounded"></div>
                <div className="w-16 text-sm text-muted-foreground text-right">18.5-22.9</div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-24 text-sm text-muted-foreground">과체중</div>
                <div className="flex-1 h-4 bg-yellow-500/50 rounded"></div>
                <div className="w-16 text-sm text-muted-foreground text-right">23-24.9</div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-24 text-sm text-muted-foreground">비만</div>
                <div className="flex-1 h-4 bg-orange-500/50 rounded"></div>
                <div className="w-16 text-sm text-muted-foreground text-right">25-29.9</div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-24 text-sm text-muted-foreground">고도비만</div>
                <div className="flex-1 h-4 bg-red-500/50 rounded"></div>
                <div className="w-16 text-sm text-muted-foreground text-right">&ge; 30</div>
              </div>
            </div>
          </div>

          {/* Ideal Weight */}
          {result.idealWeight && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-foreground mb-4">
                <span className="material-symbols-outlined align-middle mr-2">target</span>
                이상 체중
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-green-500/20 rounded-lg">
                  <p className="text-muted-foreground text-sm">최소</p>
                  <p className="text-green-400 text-2xl font-bold">{result.idealWeight.min}kg</p>
                </div>
                <div className="text-center p-4 bg-green-500/20 rounded-lg">
                  <p className="text-muted-foreground text-sm">최대</p>
                  <p className="text-green-400 text-2xl font-bold">{result.idealWeight.max}kg</p>
                </div>
              </div>
              {result.idealWeight.description && (
                <p className="text-center text-muted-foreground mt-4">
                  {result.idealWeight.description}
                </p>
              )}
            </div>
          )}

          {/* Health Risks */}
          {result.healthRisks && result.healthRisks.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-foreground mb-4">
                <span className="material-symbols-outlined align-middle mr-2">warning</span>
                건강 위험 요소
              </h3>
              <ul className="space-y-2">
                {result.healthRisks.map((risk, index) => (
                  <li key={index} className="flex items-start gap-2 text-muted-foreground">
                    <span className="material-symbols-outlined text-orange-400 text-sm mt-1">error</span>
                    {risk}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Diet Recommendations */}
          {result.recommendations?.diet && result.recommendations.diet.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-foreground mb-4">
                <span className="material-symbols-outlined align-middle mr-2">restaurant</span>
                식단 추천
              </h3>
              <ul className="space-y-2">
                {result.recommendations.diet.map((tip, index) => (
                  <li key={index} className="flex items-start gap-2 text-muted-foreground">
                    <span className="material-symbols-outlined text-green-400 text-sm mt-1">check_circle</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Exercise Recommendations */}
          {result.recommendations?.exercise && result.recommendations.exercise.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-foreground mb-4">
                <span className="material-symbols-outlined align-middle mr-2">directions_run</span>
                운동 추천
              </h3>
              <div className="flex flex-wrap gap-2">
                {result.recommendations.exercise.map((exercise, index) => (
                  <span key={index} className="px-3 py-2 bg-green-500/20 text-green-400 rounded-lg text-sm">
                    {exercise}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Lifestyle Recommendations */}
          {result.recommendations?.lifestyle && result.recommendations.lifestyle.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-foreground mb-4">
                <span className="material-symbols-outlined align-middle mr-2">self_improvement</span>
                생활 습관 조언
              </h3>
              <ul className="space-y-2">
                {result.recommendations.lifestyle.map((tip, index) => (
                  <li key={index} className="flex items-start gap-2 text-muted-foreground">
                    <span className="material-symbols-outlined text-green-400 text-sm mt-1">eco</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Daily Calories */}
          {result.dailyCalories && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-foreground mb-4">
                <span className="material-symbols-outlined align-middle mr-2">local_fire_department</span>
                일일 칼로리
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-blue-500/20 rounded-lg">
                  <p className="text-muted-foreground text-xs">감량</p>
                  <p className="text-blue-400 text-lg font-bold">{result.dailyCalories.lose}kcal</p>
                </div>
                <div className="text-center p-3 bg-green-500/20 rounded-lg">
                  <p className="text-muted-foreground text-xs">유지</p>
                  <p className="text-green-400 text-lg font-bold">{result.dailyCalories.maintain}kcal</p>
                </div>
                <div className="text-center p-3 bg-orange-500/20 rounded-lg">
                  <p className="text-muted-foreground text-xs">증량</p>
                  <p className="text-orange-400 text-lg font-bold">{result.dailyCalories.gain}kcal</p>
                </div>
              </div>
            </div>
          )}

          {/* Overall Comment */}
          {result.overallComment && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-foreground mb-4">
                <span className="material-symbols-outlined align-middle mr-2">summarize</span>
                종합 평가
              </h3>
              <p className="text-muted-foreground">{result.overallComment}</p>
            </div>
          )}

          {/* Try Again */}
          <button
            onClick={handleReset}
            className="w-full px-6 py-4 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-foreground font-semibold rounded-lg transition-colors"
          >
            다시 계산하기
          </button>
        </div>
      )}
    </ServiceDetailLayout>
  );
}
