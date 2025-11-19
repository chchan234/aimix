import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import ServiceDetailLayout from '../../components/ServiceDetailLayout';
import ExecuteButton from '../../components/ExecuteButton';
import { analyzeDeepSaju2025 } from '../../services/ai';
import { getCurrentUser, isLoggedIn } from '../../services/auth';

interface MonthlyFortune {
  overall: string;
  career: string;
  love: string;
  wealth: string;
  health: string;
  advice: string;
}

interface DeepSajuResult {
  summary: {
    overallFortune: string;
    yearlyTheme: string;
    luckyColor: string;
    luckyNumber: number;
    luckyDirection: string;
  };
  fourPillars: {
    year: string;
    month: string;
    day: string;
    time: string;
    interpretation: string;
  };
  monthlyFortune: {
    [key: string]: MonthlyFortune;
  };
  careerFortune: {
    overall: string;
    opportunities: string[];
    challenges: string[];
    advice: string;
  };
  wealthFortune: {
    overall: string;
    income: string;
    investment: string;
    advice: string;
  };
  loveFortune: {
    overall: string;
    single: string;
    coupled: string;
    advice: string;
  };
  healthFortune: {
    overall: string;
    vulnerableAreas: string[];
    preventiveMeasures: string[];
    advice: string;
  };
  relationshipFortune: {
    family: string;
    friends: string;
    colleagues: string;
    advice: string;
  };
  spiritualGuidance: {
    meditation: string;
    rituals: string;
    auspiciousDates: string[];
  };
  yearlyAdvice: string;
}

export default function DeepSaju2025Page() {
  const [, setLocation] = useLocation();
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DeepSajuResult | null>(null);
  const [currentCredits, setCurrentCredits] = useState(0);
  const [showIntro, setShowIntro] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'monthly' | 'detailed'>('overview');

  const serviceCost = 50;

  useEffect(() => {
    if (!isLoggedIn()) {
      alert('로그인 후 이용해주세요.');
      setLocation('/');
      return;
    }

    const fetchUserData = async () => {
      try {
        const user = await getCurrentUser();
        setCurrentCredits(user.credits);
      } catch (error) {
        console.error('Failed to fetch user data:', error);
        alert('로그인 후 이용해주세요.');
        setLocation('/');
      }
    };
    fetchUserData();
  }, [setLocation]);

  const handleExecute = async () => {
    if (!birthDate || !birthTime) {
      alert('생년월일과 태어난 시간을 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      const response = await analyzeDeepSaju2025(birthDate, birthTime, gender) as any;

      if (response.success && response.analysis) {
        setResult(response.analysis);

        if (response.credits?.remaining !== undefined) {
          setCurrentCredits(response.credits.remaining);
        }
      } else {
        throw new Error(response.error || '분석 실패');
      }
    } catch (error) {
      console.error('Error:', error);
      alert(error instanceof Error ? error.message : '분석 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setBirthDate('');
    setBirthTime('');
  };

  const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];

  if (showIntro) {
    return (
      <ServiceDetailLayout
        title="2025 심층 신년운세"
        description="10,000자 이상의 상세한 사주 분석"
        icon="auto_awesome"
        color="purple"
      >
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-purple-500/20 to-indigo-500/20 rounded-xl p-6 border border-purple-500/30">
            <h3 className="text-foreground text-xl font-bold mb-4">2025 심층 신년운세</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              사주명리학 전문가 수준의 심층 분석으로 2025년 한 해를
              완벽하게 준비하세요. 월별 운세부터 재물, 연애, 건강까지
              모든 영역을 상세히 분석합니다.
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-purple-400 text-lg">check_circle</span>
                10,000자 이상의 상세 분석
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-purple-400 text-lg">check_circle</span>
                12개월 월별 상세 운세
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-purple-400 text-lg">check_circle</span>
                재물/연애/건강/관계 심층 분석
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-purple-400 text-lg">check_circle</span>
                행운의 색상/숫자/방위 제공
              </li>
            </ul>
          </div>

          <div className="bg-gray-50 dark:bg-[#0d0d0d] rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <p className="text-muted-foreground text-sm">
              <span className="text-purple-400 font-semibold">{serviceCost} 크레딧</span>이 필요합니다
            </p>
          </div>

          <button
            onClick={() => setShowIntro(false)}
            className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-foreground font-semibold rounded-lg transition"
          >
            시작하기
          </button>
        </div>
      </ServiceDetailLayout>
    );
  }

  return (
    <ServiceDetailLayout
      title="2025 심층 신년운세"
      description="10,000자 이상의 상세한 사주 분석"
      icon="auto_awesome"
      color="purple"
    >
      <div className="space-y-6">
        {!result && (
          <>
            {/* Birth Date */}
            <div>
              <label className="block text-foreground font-medium mb-3">생년월일</label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full p-4 bg-gray-50 dark:bg-[#0d0d0d] border border-gray-300 dark:border-gray-600 rounded-lg text-foreground focus:border-purple-500 focus:outline-none"
              />
            </div>

            {/* Birth Time */}
            <div>
              <label className="block text-foreground font-medium mb-3">태어난 시간 (24시간 형식)</label>
              <input
                type="time"
                value={birthTime}
                onChange={(e) => setBirthTime(e.target.value)}
                className="w-full p-4 bg-gray-50 dark:bg-[#0d0d0d] border border-gray-300 dark:border-gray-600 rounded-lg text-foreground focus:border-purple-500 focus:outline-none"
              />
            </div>

            {/* Gender Selection */}
            <div>
              <label className="block text-foreground font-medium mb-3">성별</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setGender('male')}
                  className={`p-4 rounded-lg border text-center transition ${
                    gender === 'male'
                      ? 'border-purple-500 bg-purple-500/10 text-purple-400'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-500 text-foreground'
                  }`}
                >
                  남성
                </button>
                <button
                  onClick={() => setGender('female')}
                  className={`p-4 rounded-lg border text-center transition ${
                    gender === 'female'
                      ? 'border-purple-500 bg-purple-500/10 text-purple-400'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-500 text-foreground'
                  }`}
                >
                  여성
                </button>
              </div>
            </div>

            <ExecuteButton
              credits={serviceCost}
              currentCredits={currentCredits}
              onClick={handleExecute}
              loading={loading}
              disabled={!birthDate || !birthTime}
            />
          </>
        )}

        {result && (
          <div className="space-y-6 animate-fadeIn">
            {/* Tab Navigation */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition ${
                  activeTab === 'overview'
                    ? 'bg-purple-600 text-foreground'
                    : 'bg-white dark:bg-gray-700 text-muted-foreground hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
              >
                총운
              </button>
              <button
                onClick={() => setActiveTab('monthly')}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition ${
                  activeTab === 'monthly'
                    ? 'bg-purple-600 text-foreground'
                    : 'bg-white dark:bg-gray-700 text-muted-foreground hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
              >
                월별 운세
              </button>
              <button
                onClick={() => setActiveTab('detailed')}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition ${
                  activeTab === 'detailed'
                    ? 'bg-purple-600 text-foreground'
                    : 'bg-white dark:bg-gray-700 text-muted-foreground hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
              >
                상세 분석
              </button>
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-4">
                {/* Summary */}
                <div className="bg-purple-500/10 rounded-xl p-4 border border-purple-500/20">
                  <h3 className="text-foreground font-semibold mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-purple-400">stars</span>
                    2025년 총운
                  </h3>
                  <p className="text-muted-foreground leading-relaxed mb-4">{result.summary.overallFortune}</p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-gray-50 dark:bg-[#0d0d0d] rounded-lg p-3">
                      <p className="text-muted-foreground mb-1">올해의 테마</p>
                      <p className="text-foreground">{result.summary.yearlyTheme}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-[#0d0d0d] rounded-lg p-3">
                      <p className="text-muted-foreground mb-1">행운의 색</p>
                      <p className="text-foreground">{result.summary.luckyColor}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-[#0d0d0d] rounded-lg p-3">
                      <p className="text-muted-foreground mb-1">행운의 숫자</p>
                      <p className="text-foreground">{result.summary.luckyNumber}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-[#0d0d0d] rounded-lg p-3">
                      <p className="text-muted-foreground mb-1">행운의 방위</p>
                      <p className="text-foreground">{result.summary.luckyDirection}</p>
                    </div>
                  </div>
                </div>

                {/* Four Pillars */}
                <div className="bg-indigo-500/10 rounded-xl p-4 border border-indigo-500/20">
                  <h3 className="text-foreground font-semibold mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-indigo-400">view_column</span>
                    사주팔자
                  </h3>
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    <div className="text-center bg-gray-50 dark:bg-[#0d0d0d] rounded-lg p-2">
                      <p className="text-muted-foreground text-xs mb-1">년주</p>
                      <p className="text-foreground font-bold">{result.fourPillars.year}</p>
                    </div>
                    <div className="text-center bg-gray-50 dark:bg-[#0d0d0d] rounded-lg p-2">
                      <p className="text-muted-foreground text-xs mb-1">월주</p>
                      <p className="text-foreground font-bold">{result.fourPillars.month}</p>
                    </div>
                    <div className="text-center bg-gray-50 dark:bg-[#0d0d0d] rounded-lg p-2">
                      <p className="text-muted-foreground text-xs mb-1">일주</p>
                      <p className="text-foreground font-bold">{result.fourPillars.day}</p>
                    </div>
                    <div className="text-center bg-gray-50 dark:bg-[#0d0d0d] rounded-lg p-2">
                      <p className="text-muted-foreground text-xs mb-1">시주</p>
                      <p className="text-foreground font-bold">{result.fourPillars.time}</p>
                    </div>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed">{result.fourPillars.interpretation}</p>
                </div>

                {/* Yearly Advice */}
                <div className="bg-amber-500/10 rounded-xl p-4 border border-amber-500/20">
                  <h3 className="text-foreground font-semibold mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-amber-400">lightbulb</span>
                    2025년 종합 조언
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">{result.yearlyAdvice}</p>
                </div>
              </div>
            )}

            {/* Monthly Tab */}
            {activeTab === 'monthly' && (
              <div className="space-y-4">
                {monthNames.map((month, index) => {
                  const monthKey = `${index + 1}월`;
                  const monthData = result.monthlyFortune[monthKey];
                  if (!monthData) return null;

                  return (
                    <div key={month} className="bg-gray-50 dark:bg-[#0d0d0d] rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                      <h3 className="text-foreground font-semibold mb-3">{month}</h3>
                      <p className="text-muted-foreground text-sm mb-3">{monthData.overall}</p>
                      <div className="space-y-2 text-sm">
                        <div className="flex gap-2">
                          <span className="text-blue-400 min-w-[50px]">직업:</span>
                          <span className="text-muted-foreground">{monthData.career}</span>
                        </div>
                        <div className="flex gap-2">
                          <span className="text-pink-400 min-w-[50px]">연애:</span>
                          <span className="text-muted-foreground">{monthData.love}</span>
                        </div>
                        <div className="flex gap-2">
                          <span className="text-yellow-400 min-w-[50px]">재물:</span>
                          <span className="text-muted-foreground">{monthData.wealth}</span>
                        </div>
                        <div className="flex gap-2">
                          <span className="text-green-400 min-w-[50px]">건강:</span>
                          <span className="text-muted-foreground">{monthData.health}</span>
                        </div>
                        <div className="mt-2 pt-2 border-t border-gray-300 dark:border-gray-600">
                          <span className="text-purple-400">조언: </span>
                          <span className="text-muted-foreground">{monthData.advice}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Detailed Tab */}
            {activeTab === 'detailed' && (
              <div className="space-y-4">
                {/* Career Fortune */}
                <div className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/20">
                  <h3 className="text-foreground font-semibold mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-blue-400">work</span>
                    직업운
                  </h3>
                  <p className="text-muted-foreground mb-3">{result.careerFortune.overall}</p>
                  <div className="space-y-2 text-sm">
                    <div>
                      <p className="text-green-400 mb-1">기회</p>
                      <ul className="list-disc list-inside text-muted-foreground">
                        {result.careerFortune.opportunities.map((opp, i) => (
                          <li key={i}>{opp}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-red-400 mb-1">도전</p>
                      <ul className="list-disc list-inside text-muted-foreground">
                        {result.careerFortune.challenges.map((ch, i) => (
                          <li key={i}>{ch}</li>
                        ))}
                      </ul>
                    </div>
                    <p className="text-purple-300 mt-2">{result.careerFortune.advice}</p>
                  </div>
                </div>

                {/* Wealth Fortune */}
                <div className="bg-yellow-500/10 rounded-xl p-4 border border-yellow-500/20">
                  <h3 className="text-foreground font-semibold mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-yellow-400">paid</span>
                    재물운
                  </h3>
                  <p className="text-muted-foreground mb-3">{result.wealthFortune.overall}</p>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-yellow-400">수입:</span> <span className="text-muted-foreground">{result.wealthFortune.income}</span></p>
                    <p><span className="text-yellow-400">투자:</span> <span className="text-muted-foreground">{result.wealthFortune.investment}</span></p>
                    <p className="text-purple-300 mt-2">{result.wealthFortune.advice}</p>
                  </div>
                </div>

                {/* Love Fortune */}
                <div className="bg-pink-500/10 rounded-xl p-4 border border-pink-500/20">
                  <h3 className="text-foreground font-semibold mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-pink-400">favorite</span>
                    연애운
                  </h3>
                  <p className="text-muted-foreground mb-3">{result.loveFortune.overall}</p>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-pink-400">미혼:</span> <span className="text-muted-foreground">{result.loveFortune.single}</span></p>
                    <p><span className="text-pink-400">기혼/연인:</span> <span className="text-muted-foreground">{result.loveFortune.coupled}</span></p>
                    <p className="text-purple-300 mt-2">{result.loveFortune.advice}</p>
                  </div>
                </div>

                {/* Health Fortune */}
                <div className="bg-green-500/10 rounded-xl p-4 border border-green-500/20">
                  <h3 className="text-foreground font-semibold mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-green-400">health_and_safety</span>
                    건강운
                  </h3>
                  <p className="text-muted-foreground mb-3">{result.healthFortune.overall}</p>
                  <div className="space-y-2 text-sm">
                    <div>
                      <p className="text-red-400 mb-1">취약 부위</p>
                      <ul className="list-disc list-inside text-muted-foreground">
                        {result.healthFortune.vulnerableAreas.map((area, i) => (
                          <li key={i}>{area}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-green-400 mb-1">예방 수칙</p>
                      <ul className="list-disc list-inside text-muted-foreground">
                        {result.healthFortune.preventiveMeasures.map((m, i) => (
                          <li key={i}>{m}</li>
                        ))}
                      </ul>
                    </div>
                    <p className="text-purple-300 mt-2">{result.healthFortune.advice}</p>
                  </div>
                </div>

                {/* Relationship Fortune */}
                <div className="bg-cyan-500/10 rounded-xl p-4 border border-cyan-500/20">
                  <h3 className="text-foreground font-semibold mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-cyan-400">groups</span>
                    대인관계운
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-cyan-400">가족:</span> <span className="text-muted-foreground">{result.relationshipFortune.family}</span></p>
                    <p><span className="text-cyan-400">친구:</span> <span className="text-muted-foreground">{result.relationshipFortune.friends}</span></p>
                    <p><span className="text-cyan-400">직장:</span> <span className="text-muted-foreground">{result.relationshipFortune.colleagues}</span></p>
                    <p className="text-purple-300 mt-2">{result.relationshipFortune.advice}</p>
                  </div>
                </div>

                {/* Spiritual Guidance */}
                <div className="bg-violet-500/10 rounded-xl p-4 border border-violet-500/20">
                  <h3 className="text-foreground font-semibold mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-violet-400">self_improvement</span>
                    영적 지침
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-violet-400">명상:</span> <span className="text-muted-foreground">{result.spiritualGuidance.meditation}</span></p>
                    <p><span className="text-violet-400">의식:</span> <span className="text-muted-foreground">{result.spiritualGuidance.rituals}</span></p>
                    <div>
                      <p className="text-violet-400 mb-1">길일</p>
                      <div className="flex flex-wrap gap-2">
                        {result.spiritualGuidance.auspiciousDates.map((date, i) => (
                          <span key={i} className="bg-violet-500/20 px-2 py-1 rounded text-violet-300 text-xs">{date}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={handleReset}
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-foreground rounded-lg transition"
            >
              다시 분석하기
            </button>
          </div>
        )}
      </div>
    </ServiceDetailLayout>
  );
}
