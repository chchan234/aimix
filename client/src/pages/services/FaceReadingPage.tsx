import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';
import ServiceDetailLayout from '../../components/ServiceDetailLayout';
import { analyzeFaceReading } from '../../services/ai';
import { getCurrentUser, isLoggedIn, getToken } from '../../services/auth';
import { useSavedResult } from '../../hooks/useSavedResult';

export default function FaceReadingPage() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<'intro' | 'input' | 'result'>('intro');
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [currentCredits, setCurrentCredits] = useState(0);
  const [saving, setSaving] = useState(false);
  const [aiModel, setAiModel] = useState<string | undefined>();


  // Load saved result if resultId is in URL
  useSavedResult<any>((resultData) => {
    setResult(resultData);
    setStep("result");
  });

  const serviceCost = 25;

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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleExecute = async () => {
    if (!image) {
      alert('사진을 업로드해주세요.');
      return;
    }

    if (currentCredits < serviceCost) {
      alert('크레딧이 부족합니다.');
      return;
    }

    setLoading(true);
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(image);
      });

      const response = await analyzeFaceReading(base64) as any;
      setResult(response);
      setAiModel(response.model);
      setStep('result');

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
    setResult(null);
    setImage(null);
    setPreviewUrl(null);
    setStep('input');
  };

  const handleSaveResult = async () => {
    if (!result) return;

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
          serviceType: 'face-reading',
          inputData: {},
          resultData: result,
          aiModel,
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
        const errorData = await response.json();
        console.error('Server error:', errorData);
        throw new Error(errorData.error || 'Failed to save result');
      }

      alert('결과가 저장되었습니다! "내 결과물"에서 확인할 수 있습니다.');
    } catch (error) {
      console.error('Error saving result:', error);
      alert(`결과 저장에 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ServiceDetailLayout
      title={t('services.fortune.faceReading.title')}
      description={t('services.fortune.faceReading.description')}
      icon="face"
      color="blue"
    >
      {/* Intro Section */}
      {step === 'intro' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined text-3xl text-blue-400">face</span>
              <h3 className="text-xl font-semibold text-foreground">
                AI 관상 분석
              </h3>
            </div>
            <p className="text-muted-foreground mb-6">
              얼굴 사진을 분석하여 관상을 해석해드립니다.
              AI가 얼굴의 특징을 분석하고 전통 관상학의 원리를 바탕으로
              성격, 운세, 재물운 등을 풀이합니다.
            </p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-blue-400">psychology</span>
                  <span className="text-foreground font-medium">전체 인상</span>
                </div>
                <p className="text-muted-foreground text-sm">종합적인 인상 분석</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-blue-400">visibility</span>
                  <span className="text-foreground font-medium">부위별 분석</span>
                </div>
                <p className="text-muted-foreground text-sm">이마, 눈, 코, 입 분석</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-blue-400">paid</span>
                  <span className="text-foreground font-medium">재물운</span>
                </div>
                <p className="text-muted-foreground text-sm">재물과 복록 예측</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-blue-400">lightbulb</span>
                  <span className="text-foreground font-medium">조언</span>
                </div>
                <p className="text-muted-foreground text-sm">강점과 주의점</p>
              </div>
            </div>

            <div className="bg-blue-900/20 border border-blue-500 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-foreground font-semibold">관상 분석</p>
                  <p className="text-muted-foreground text-sm">AI 얼굴 분석</p>
                </div>
                <div className="text-right">
                  <p className="text-blue-400 font-bold text-xl">{serviceCost} 크레딧</p>
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
              className="w-full px-6 py-4 bg-blue-600 hover:bg-blue-700 text-foreground font-semibold rounded-lg transition-colors"
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

            <h3 className="text-lg font-semibold text-foreground mb-4">사진 업로드</h3>

            <div className="space-y-4">
              {!previewUrl ? (
                <label className="block">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <div className="w-full h-64 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition">
                    <span className="material-symbols-outlined text-6xl text-gray-500 mb-2">
                      add_photo_alternate
                    </span>
                    <p className="text-muted-foreground text-sm">
                      클릭하여 사진을 선택하세요
                    </p>
                  </div>
                </label>
              ) : (
                <div className="relative">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => {
                      setImage(null);
                      setPreviewUrl(null);
                    }}
                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-foreground p-2 rounded-full"
                  >
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                </div>
              )}

              <p className="text-muted-foreground text-xs">
                정면 사진을 업로드하시면 더 정확한 분석이 가능합니다
              </p>
            </div>
          </div>

          <button
            onClick={handleExecute}
            disabled={!image || currentCredits < serviceCost}
            className={`w-full px-6 py-4 font-semibold rounded-lg transition-colors ${
              image && currentCredits >= serviceCost
                ? 'bg-blue-600 hover:bg-blue-700 text-foreground'
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
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground">AI가 관상을 분석하고 있습니다...</p>
        </div>
      )}

      {/* Result Section */}
      {step === 'result' && result && (
        <div className="space-y-4">
          {previewUrl && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <img
                src={previewUrl}
                alt="분석된 사진"
                className="w-full max-w-md mx-auto rounded-lg"
              />
            </div>
          )}

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-foreground font-semibold mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-400">auto_awesome</span>
              관상 분석 결과
            </h3>

            {result.analysis ? (
              <div className="space-y-4 text-muted-foreground">
                {/* 종합 운세 */}
                {result.analysis.overallFortune && (
                  <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-500/30">
                    <h4 className="text-foreground font-medium mb-2">종합 운세</h4>
                    {typeof result.analysis.overallFortune.summary === 'string' && (
                      <p className="text-sm mb-2">{result.analysis.overallFortune.summary}</p>
                    )}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {result.analysis.overallFortune.fortuneScore && (
                        <div>
                          <span className="text-blue-400">운세 점수:</span> {result.analysis.overallFortune.fortuneScore}점
                        </div>
                      )}
                      {result.analysis.overallFortune.lifePath && (
                        <div>
                          <span className="text-blue-400">인생 흐름:</span> {result.analysis.overallFortune.lifePath}
                        </div>
                      )}
                    </div>
                    {result.analysis.overallFortune.luckyAge && Array.isArray(result.analysis.overallFortune.luckyAge) && (
                      <div className="mt-2 text-xs">
                        <span className="text-blue-400">행운의 나이:</span> {result.analysis.overallFortune.luckyAge.join(', ')}
                      </div>
                    )}
                  </div>
                )}

                {/* 얼굴형 */}
                {result.analysis.faceShape && (
                  <div>
                    <h4 className="text-foreground font-medium mb-2">얼굴형</h4>
                    <p className="text-sm">
                      <span className="text-blue-400">{result.analysis.faceShape.type}</span> - {result.analysis.faceShape.meaning}
                    </p>
                    {result.analysis.faceShape.characteristics && Array.isArray(result.analysis.faceShape.characteristics) && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {result.analysis.faceShape.characteristics.map((char: string, idx: number) => (
                          <span key={idx} className="text-xs bg-blue-500/20 px-2 py-1 rounded">{char}</span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 이마 */}
                {result.analysis.forehead && (
                  <div>
                    <h4 className="text-foreground font-medium mb-2">이마 (천정)</h4>
                    <p className="text-sm mb-1">{result.analysis.forehead.analysis}</p>
                    <p className="text-sm text-muted-foreground">{result.analysis.forehead.meaning}</p>
                    <p className="text-sm text-blue-400 mt-1">{result.analysis.forehead.fortune}</p>
                  </div>
                )}

                {/* 눈썹 */}
                {result.analysis.eyebrows && (
                  <div>
                    <h4 className="text-foreground font-medium mb-2">눈썹</h4>
                    <p className="text-sm mb-1">{result.analysis.eyebrows.shape}</p>
                    <p className="text-sm text-muted-foreground">{result.analysis.eyebrows.meaning}</p>
                    <p className="text-sm text-blue-400 mt-1">{result.analysis.eyebrows.advice}</p>
                  </div>
                )}

                {/* 눈 */}
                {result.analysis.eyes && (
                  <div>
                    <h4 className="text-foreground font-medium mb-2">눈</h4>
                    <p className="text-sm mb-1">{result.analysis.eyes.shape}</p>
                    <p className="text-sm text-muted-foreground">{result.analysis.eyes.meaning}</p>
                    <p className="text-sm text-blue-400 mt-1">{result.analysis.eyes.fortune}</p>
                    {result.analysis.eyes.innerNature && (
                      <p className="text-sm text-purple-400 mt-1">내면: {result.analysis.eyes.innerNature}</p>
                    )}
                  </div>
                )}

                {/* 코 */}
                {result.analysis.nose && (
                  <div>
                    <h4 className="text-foreground font-medium mb-2">코 (준두)</h4>
                    <p className="text-sm mb-1">{result.analysis.nose.shape}</p>
                    <p className="text-sm text-muted-foreground">{result.analysis.nose.meaning}</p>
                    <p className="text-sm text-yellow-400 mt-1">재물운: {result.analysis.nose.wealthFortune}</p>
                  </div>
                )}

                {/* 입 */}
                {result.analysis.mouth && (
                  <div>
                    <h4 className="text-foreground font-medium mb-2">입</h4>
                    <p className="text-sm mb-1">{result.analysis.mouth.shape}</p>
                    <p className="text-sm text-muted-foreground">{result.analysis.mouth.meaning}</p>
                    <p className="text-sm text-blue-400 mt-1">{result.analysis.mouth.fortune}</p>
                  </div>
                )}

                {/* 귀 */}
                {result.analysis.ears && (
                  <div>
                    <h4 className="text-foreground font-medium mb-2">귀</h4>
                    <p className="text-sm mb-1">{result.analysis.ears.shape}</p>
                    <p className="text-sm text-muted-foreground">{result.analysis.ears.meaning}</p>
                    <p className="text-sm text-blue-400 mt-1">{result.analysis.ears.fortune}</p>
                  </div>
                )}

                {/* 턱 */}
                {result.analysis.jawChin && (
                  <div>
                    <h4 className="text-foreground font-medium mb-2">턱과 법령선</h4>
                    <p className="text-sm mb-1">{result.analysis.jawChin.shape}</p>
                    <p className="text-sm text-muted-foreground">{result.analysis.jawChin.meaning}</p>
                    <p className="text-sm text-blue-400 mt-1">{result.analysis.jawChin.fortune}</p>
                  </div>
                )}

                {/* 나이별 운세 */}
                {result.analysis.fortuneByAge && (
                  <div className="bg-indigo-900/20 rounded-lg p-4 border border-indigo-500/30">
                    <h4 className="text-foreground font-medium mb-2">나이별 운세</h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="text-indigo-400">초년운:</span> {result.analysis.fortuneByAge.youth}</p>
                      <p><span className="text-indigo-400">중년운:</span> {result.analysis.fortuneByAge.middle}</p>
                      <p><span className="text-indigo-400">말년운:</span> {result.analysis.fortuneByAge.later}</p>
                    </div>
                  </div>
                )}

                {/* 성격 */}
                {result.analysis.personality && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {result.analysis.personality.strengths && Array.isArray(result.analysis.personality.strengths) && (
                      <div className="bg-green-900/20 rounded-lg p-4 border border-green-500/30">
                        <h4 className="text-foreground font-medium mb-2">강점</h4>
                        <ul className="text-sm space-y-1">
                          {result.analysis.personality.strengths.map((item: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-green-400">✓</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {result.analysis.personality.weaknesses && Array.isArray(result.analysis.personality.weaknesses) && (
                      <div className="bg-yellow-900/20 rounded-lg p-4 border border-yellow-500/30">
                        <h4 className="text-foreground font-medium mb-2">주의할 점</h4>
                        <ul className="text-sm space-y-1">
                          {result.analysis.personality.weaknesses.map((item: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-yellow-400">!</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* 재물운 */}
                {result.analysis.wealth && (
                  <div className="bg-yellow-900/20 rounded-lg p-4 border border-yellow-500/30">
                    <h4 className="text-foreground font-medium mb-2">재물운</h4>
                    <p className="text-sm mb-1">{result.analysis.wealth.overall}</p>
                    <p className="text-sm text-muted-foreground">스타일: {result.analysis.wealth.earningStyle}</p>
                    <p className="text-sm text-yellow-400 mt-1">{result.analysis.wealth.advice}</p>
                  </div>
                )}

                {/* 연애운 */}
                {result.analysis.love && (
                  <div className="bg-pink-900/20 rounded-lg p-4 border border-pink-500/30">
                    <h4 className="text-foreground font-medium mb-2">연애운</h4>
                    <p className="text-sm mb-1">{result.analysis.love.style}</p>
                    <p className="text-sm text-muted-foreground">이상형: {result.analysis.love.idealPartner}</p>
                    <p className="text-sm text-pink-400 mt-1">{result.analysis.love.advice}</p>
                  </div>
                )}

                {/* 직업운 */}
                {result.analysis.career && (
                  <div className="bg-cyan-900/20 rounded-lg p-4 border border-cyan-500/30">
                    <h4 className="text-foreground font-medium mb-2">직업운</h4>
                    {result.analysis.career.suitableFields && Array.isArray(result.analysis.career.suitableFields) && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {result.analysis.career.suitableFields.map((field: string, idx: number) => (
                          <span key={idx} className="text-xs bg-cyan-500/20 px-2 py-1 rounded">{field}</span>
                        ))}
                      </div>
                    )}
                    <p className="text-sm text-muted-foreground">{result.analysis.career.workStyle}</p>
                    <p className="text-sm text-cyan-400 mt-1">{result.analysis.career.advice}</p>
                  </div>
                )}

                {/* 조언 */}
                {result.analysis.advice && (
                  <div className="bg-purple-900/20 rounded-lg p-4 border border-purple-500/30">
                    <h4 className="text-foreground font-medium mb-2">조언</h4>
                    {result.analysis.advice.dos && Array.isArray(result.analysis.advice.dos) && (
                      <div className="mb-2">
                        <p className="text-sm text-green-400 mb-1">이렇게 하세요:</p>
                        <ul className="text-sm space-y-1">
                          {result.analysis.advice.dos.map((item: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-green-400">✓</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {result.analysis.advice.donts && Array.isArray(result.analysis.advice.donts) && (
                      <div className="mb-2">
                        <p className="text-sm text-red-400 mb-1">피하세요:</p>
                        <ul className="text-sm space-y-1">
                          {result.analysis.advice.donts.map((item: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-red-400">✗</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {result.analysis.advice.luckyItems && Array.isArray(result.analysis.advice.luckyItems) && (
                      <div>
                        <p className="text-sm text-purple-400 mb-1">행운 아이템:</p>
                        <div className="flex flex-wrap gap-1">
                          {result.analysis.advice.luckyItems.map((item: string, idx: number) => (
                            <span key={idx} className="text-xs bg-purple-500/20 px-2 py-1 rounded">{item}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 유명인 매칭 & 재미있는 사실 */}
                {(result.analysis.celebrityMatch || result.analysis.funFact) && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-500/30">
                    {result.analysis.celebrityMatch && (
                      <p className="text-sm mb-2">
                        <span className="text-blue-600 dark:text-blue-400">비슷한 관상의 유명인:</span> {result.analysis.celebrityMatch}
                      </p>
                    )}
                    {result.analysis.funFact && (
                      <p className="text-sm">
                        <span className="text-purple-600 dark:text-purple-400">재미있는 사실:</span> {result.analysis.funFact}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">{JSON.stringify(result, null, 2)}</p>
            )}
          </div>

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
              className="w-full py-3 px-6 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-foreground rounded-lg transition"
            >
              다시 분석하기
            </button>
          </div>
        </div>
      )}
    </ServiceDetailLayout>
  );
}
