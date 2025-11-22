import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';
import ServiceDetailLayout from '../../components/ServiceDetailLayout';
import { analyzeSaju } from '../../services/ai';
import { getCurrentUser, isLoggedIn } from '../../services/auth';
import { useSavedResult } from '../../hooks/useSavedResult';

export default function SajuPage() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<'intro' | 'input' | 'result'>('intro');
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [currentCredits, setCurrentCredits] = useState(0);


  // Load saved result if resultId is in URL
  useSavedResult<any>((resultData) => {
    setResult(resultData);
    setStep("result");
  });

  const serviceCost = 25;

  // Fetch user credits on mount
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

  const handleExecute = async () => {
    if (!birthDate || !birthTime) {
      alert('생년월일과 태어난 시간을 모두 입력해주세요.');
      return;
    }

    if (currentCredits < serviceCost) {
      alert('크레딧이 부족합니다.');
      return;
    }

    setLoading(true);
    try {
      const response = await analyzeSaju(birthDate, birthTime, gender) as any;
      setResult(response);
      setStep('result');

      // Update credits from response
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

  const handleReset = () => {
    setStep('input');
    setResult(null);
  };

  return (
    <ServiceDetailLayout
      title={t('services.fortune.saju.title')}
      description={t('services.fortune.saju.description')}
      icon="calendar_today"
      color="purple"
    >
      {/* Intro Section */}
      {step === 'intro' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined text-3xl text-purple-600 dark:text-purple-400">calendar_today</span>
              <h3 className="text-xl font-semibold text-foreground">
                AI 사주팔자 분석
              </h3>
            </div>
            <p className="text-muted-foreground mb-6">
              생년월일과 태어난 시간을 기반으로 사주팔자를 분석하고,
              오행의 균형과 운세를 예측해드립니다. AI가 전통 명리학을
              바탕으로 당신의 사주를 해석합니다.
            </p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-purple-600 dark:text-purple-400">auto_awesome</span>
                  <span className="text-foreground font-medium">사주팔자 해석</span>
                </div>
                <p className="text-muted-foreground text-sm">년월일시 네 기둥 분석</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-purple-600 dark:text-purple-400">balance</span>
                  <span className="text-foreground font-medium">오행 분석</span>
                </div>
                <p className="text-muted-foreground text-sm">목화토금수 균형 확인</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-purple-600 dark:text-purple-400">psychology</span>
                  <span className="text-foreground font-medium">성격 & 재능</span>
                </div>
                <p className="text-muted-foreground text-sm">타고난 기질과 적성</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-purple-600 dark:text-purple-400">trending_up</span>
                  <span className="text-foreground font-medium">운세 예측</span>
                </div>
                <p className="text-muted-foreground text-sm">재물, 건강, 연애운</p>
              </div>
            </div>

            <div className="bg-purple-900/20 border border-purple-500 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-foreground font-semibold">사주팔자 분석</p>
                  <p className="text-muted-foreground text-sm">AI 명리학 분석</p>
                </div>
                <div className="text-right">
                  <p className="text-purple-600 dark:text-purple-400 font-bold text-xl">{serviceCost} 크레딧</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                if (!isLoggedIn()) {
                  alert('로그인이 필요한 서비스입니다. 로그인 후 이용해주세요.');
                  return;
                }
                setStep('input');
              }}
              className="w-full px-6 py-4 bg-purple-600 hover:bg-purple-700 text-foreground font-semibold rounded-lg transition-colors"
            >
              시작하기 ({serviceCost} 크레딧)
            </button>
          </div>
        </div>
      )}

      {/* Input Section */}
      {step === 'input' && !loading && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setStep('intro')}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
            >
              <span className="material-symbols-outlined">arrow_back</span>
              뒤로가기
            </button>

            <h3 className="text-lg font-semibold text-foreground mb-4">생년월일 정보 입력</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-foreground font-medium mb-2">
                  생년월일
                </label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-foreground focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-foreground font-medium mb-2">
                  태어난 시간
                </label>
                <input
                  type="time"
                  value={birthTime}
                  onChange={(e) => setBirthTime(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-foreground focus:outline-none focus:border-purple-500"
                />
                <p className="text-muted-foreground text-xs mt-1">
                  모르는 경우 대략적인 시간을 입력해주세요
                </p>
              </div>

              <div>
                <label className="block text-foreground font-medium mb-2">
                  성별
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setGender('male')}
                    className={`p-3 rounded-lg border text-center transition ${
                      gender === 'male'
                        ? 'border-purple-500 bg-purple-500/10 text-purple-600 dark:text-purple-400'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-500 text-foreground'
                    }`}
                  >
                    남성
                  </button>
                  <button
                    onClick={() => setGender('female')}
                    className={`p-3 rounded-lg border text-center transition ${
                      gender === 'female'
                        ? 'border-purple-500 bg-purple-500/10 text-purple-600 dark:text-purple-400'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-500 text-foreground'
                    }`}
                  >
                    여성
                  </button>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleExecute}
            disabled={!birthDate || !birthTime || currentCredits < serviceCost}
            className={`w-full px-6 py-4 font-semibold rounded-lg transition-colors ${
              birthDate && birthTime && currentCredits >= serviceCost
                ? 'bg-purple-600 hover:bg-purple-700 text-foreground'
                : 'bg-gray-600 text-muted-foreground cursor-not-allowed'
            }`}
          >
            {currentCredits < serviceCost ? '크레딧 부족' : '분석하기'}
          </button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground">AI가 사주를 분석하고 있습니다...</p>
        </div>
      )}

      {/* Result Section */}
      {step === 'result' && result && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-foreground font-semibold mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-purple-600 dark:text-purple-400">auto_awesome</span>
              분석 결과
            </h3>
            <div className="text-muted-foreground space-y-4">
              {result.analysis ? (
                <div className="space-y-4">
                  {result.analysis.saju && (
                    <div>
                      <h4 className="text-foreground font-medium mb-2">사주팔자</h4>
                      <p className="text-sm">{result.analysis.saju}</p>
                    </div>
                  )}
                  {result.analysis.elements && typeof result.analysis.elements === 'object' && (
                    <div>
                      <h4 className="text-foreground font-medium mb-2">오행 분석</h4>
                      <div className="grid grid-cols-5 gap-2 text-sm">
                        <div className="bg-green-900/20 p-2 rounded text-center">
                          <div className="text-green-600 dark:text-green-400">목(木)</div>
                          <div className="text-foreground mt-1">{result.analysis.elements.wood || 0}</div>
                        </div>
                        <div className="bg-red-900/20 p-2 rounded text-center">
                          <div className="text-red-600 dark:text-red-400">화(火)</div>
                          <div className="text-foreground mt-1">{result.analysis.elements.fire || 0}</div>
                        </div>
                        <div className="bg-yellow-900/20 p-2 rounded text-center">
                          <div className="text-yellow-600 dark:text-yellow-400">토(土)</div>
                          <div className="text-foreground mt-1">{result.analysis.elements.earth || 0}</div>
                        </div>
                        <div className="bg-gray-400/20 p-2 rounded text-center">
                          <div className="text-muted-foreground">금(金)</div>
                          <div className="text-foreground mt-1">{result.analysis.elements.metal || 0}</div>
                        </div>
                        <div className="bg-blue-900/20 p-2 rounded text-center">
                          <div className="text-blue-600 dark:text-blue-400">수(水)</div>
                          <div className="text-foreground mt-1">{result.analysis.elements.water || 0}</div>
                        </div>
                      </div>
                    </div>
                  )}
                  {result.analysis.personality && (
                    <div>
                      <h4 className="text-foreground font-medium mb-2">성격과 재능</h4>
                      <div className="text-sm space-y-2">
                        {result.analysis.personality.core && (
                          <p><strong className="text-purple-600 dark:text-purple-400">핵심 성격:</strong> {result.analysis.personality.core}</p>
                        )}
                        {result.analysis.personality.strengths && Array.isArray(result.analysis.personality.strengths) && (
                          <div>
                            <strong className="text-green-600 dark:text-green-400">강점:</strong>
                            <ul className="list-disc list-inside ml-2">
                              {result.analysis.personality.strengths.map((s: string, i: number) => (
                                <li key={i}>{s}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {result.analysis.personality.weaknesses && Array.isArray(result.analysis.personality.weaknesses) && (
                          <div>
                            <strong className="text-yellow-600 dark:text-yellow-400">약점:</strong>
                            <ul className="list-disc list-inside ml-2">
                              {result.analysis.personality.weaknesses.map((w: string, i: number) => (
                                <li key={i}>{w}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {result.analysis.personality.hiddenTraits && (
                          <p><strong className="text-blue-600 dark:text-blue-400">숨겨진 성격:</strong> {result.analysis.personality.hiddenTraits}</p>
                        )}
                      </div>
                    </div>
                  )}
                  {result.analysis.wealth && (
                    <div>
                      <h4 className="text-foreground font-medium mb-2">재물운</h4>
                      <div className="text-sm space-y-1">
                        {result.analysis.wealth.potential && <p><strong className="text-purple-600 dark:text-purple-400">잠재력:</strong> {result.analysis.wealth.potential}</p>}
                        {result.analysis.wealth.earningStyle && <p><strong className="text-purple-600 dark:text-purple-400">수입 스타일:</strong> {result.analysis.wealth.earningStyle}</p>}
                        {result.analysis.wealth.savingStyle && <p><strong className="text-purple-600 dark:text-purple-400">저축 스타일:</strong> {result.analysis.wealth.savingStyle}</p>}
                        {result.analysis.wealth.advice && <p><strong className="text-green-600 dark:text-green-400">조언:</strong> {result.analysis.wealth.advice}</p>}
                      </div>
                    </div>
                  )}
                  {result.analysis.health && (
                    <div>
                      <h4 className="text-foreground font-medium mb-2">건강운</h4>
                      <div className="text-sm space-y-1">
                        {result.analysis.health.weakOrgans && Array.isArray(result.analysis.health.weakOrgans) && (
                          <p><strong className="text-yellow-600 dark:text-yellow-400">주의할 부위:</strong> {result.analysis.health.weakOrgans.join(', ')}</p>
                        )}
                        {result.analysis.health.advice && <p><strong className="text-green-600 dark:text-green-400">조언:</strong> {result.analysis.health.advice}</p>}
                      </div>
                    </div>
                  )}
                  {result.analysis.love && (
                    <div>
                      <h4 className="text-foreground font-medium mb-2">연애운</h4>
                      <div className="text-sm space-y-1">
                        {result.analysis.love.style && <p><strong className="text-purple-600 dark:text-purple-400">연애 스타일:</strong> {result.analysis.love.style}</p>}
                        {result.analysis.love.idealPartner && <p><strong className="text-purple-600 dark:text-purple-400">이상적인 배우자:</strong> {result.analysis.love.idealPartner}</p>}
                        {result.analysis.love.marriageTiming && <p><strong className="text-purple-600 dark:text-purple-400">결혼 시기:</strong> {result.analysis.love.marriageTiming}</p>}
                        {result.analysis.love.advice && <p><strong className="text-green-600 dark:text-green-400">조언:</strong> {result.analysis.love.advice}</p>}
                      </div>
                    </div>
                  )}
                  {result.analysis.career && (
                    <div>
                      <h4 className="text-foreground font-medium mb-2">직업운</h4>
                      <div className="text-sm space-y-1">
                        {result.analysis.career.suitableFields && Array.isArray(result.analysis.career.suitableFields) && (
                          <p><strong className="text-purple-600 dark:text-purple-400">적합한 분야:</strong> {result.analysis.career.suitableFields.join(', ')}</p>
                        )}
                        {result.analysis.career.workStyle && <p><strong className="text-purple-600 dark:text-purple-400">업무 스타일:</strong> {result.analysis.career.workStyle}</p>}
                        {result.analysis.career.successTiming && <p><strong className="text-purple-600 dark:text-purple-400">성공 시기:</strong> {result.analysis.career.successTiming}</p>}
                        {result.analysis.career.advice && <p><strong className="text-green-600 dark:text-green-400">조언:</strong> {result.analysis.career.advice}</p>}
                      </div>
                    </div>
                  )}
                  {result.analysis.fortune && (
                    <div>
                      <h4 className="text-foreground font-medium mb-2">운세</h4>
                      <div className="text-sm space-y-1">
                        {result.analysis.fortune.overall && <p><strong className="text-purple-600 dark:text-purple-400">전체 운:</strong> {result.analysis.fortune.overall}</p>}
                        {result.analysis.fortune.currentLuck && <p><strong className="text-purple-600 dark:text-purple-400">현재 운:</strong> {result.analysis.fortune.currentLuck}</p>}
                        {result.analysis.fortune.luckyYears && Array.isArray(result.analysis.fortune.luckyYears) && (
                          <p><strong className="text-green-600 dark:text-green-400">좋은 해:</strong> {result.analysis.fortune.luckyYears.join(', ')}</p>
                        )}
                        {result.analysis.fortune.cautionYears && Array.isArray(result.analysis.fortune.cautionYears) && (
                          <p><strong className="text-yellow-600 dark:text-yellow-400">조심할 해:</strong> {result.analysis.fortune.cautionYears.join(', ')}</p>
                        )}
                      </div>
                    </div>
                  )}
                  {result.analysis.advice && (
                    <div>
                      <h4 className="text-foreground font-medium mb-2">조언</h4>
                      <div className="text-sm space-y-2">
                        {result.analysis.advice.dos && Array.isArray(result.analysis.advice.dos) && (
                          <div>
                            <strong className="text-green-600 dark:text-green-400">이렇게 하세요:</strong>
                            <ul className="list-disc list-inside ml-2">
                              {result.analysis.advice.dos.map((item: string, i: number) => (
                                <li key={i}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {result.analysis.advice.donts && Array.isArray(result.analysis.advice.donts) && (
                          <div>
                            <strong className="text-yellow-600 dark:text-yellow-400">피하세요:</strong>
                            <ul className="list-disc list-inside ml-2">
                              {result.analysis.advice.donts.map((item: string, i: number) => (
                                <li key={i}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {result.analysis.advice.yearlyFocus && (
                          <p><strong className="text-purple-600 dark:text-purple-400">올해 집중할 것:</strong> {result.analysis.advice.yearlyFocus}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : result.rawText ? (
                <p className="whitespace-pre-wrap text-sm">{result.rawText}</p>
              ) : (
                <p>결과를 표시할 수 없습니다.</p>
              )}
            </div>
          </div>

          <button
            onClick={handleReset}
            className="w-full py-3 px-6 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-foreground rounded-lg transition"
          >
            다시 분석하기
          </button>
        </div>
      )}
    </ServiceDetailLayout>
  );
}
