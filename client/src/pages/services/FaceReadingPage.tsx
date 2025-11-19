import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';
import ServiceDetailLayout from '../../components/ServiceDetailLayout';
import { analyzeFaceReading } from '../../services/ai';
import { getCurrentUser, isLoggedIn } from '../../services/auth';

export default function FaceReadingPage() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<'intro' | 'input' | 'result'>('intro');
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [currentCredits, setCurrentCredits] = useState(0);

  const serviceCost = 25;

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
              onClick={() => setStep('input')}
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
                {result.analysis.overallImpression && (
                  <div>
                    <h4 className="text-foreground font-medium mb-2">전체적인 인상</h4>
                    <p className="text-sm">{result.analysis.overallImpression}</p>
                  </div>
                )}

                {result.analysis.faceShape && (
                  <div>
                    <h4 className="text-foreground font-medium mb-2">얼굴형</h4>
                    <p className="text-sm">
                      <span className="text-blue-400">{result.analysis.faceShape.type}</span> - {result.analysis.faceShape.meaning}
                    </p>
                  </div>
                )}

                {result.analysis.forehead && (
                  <div>
                    <h4 className="text-foreground font-medium mb-2">이마 (재물운 & 지혜)</h4>
                    <p className="text-sm mb-1">{result.analysis.forehead.analysis}</p>
                    <p className="text-sm text-blue-400">{result.analysis.forehead.fortune}</p>
                  </div>
                )}

                {result.analysis.eyes && (
                  <div>
                    <h4 className="text-foreground font-medium mb-2">눈 (감정 & 인간관계)</h4>
                    <p className="text-sm mb-1">{result.analysis.eyes.analysis}</p>
                    <p className="text-sm text-blue-400">{result.analysis.eyes.fortune}</p>
                  </div>
                )}

                {result.analysis.nose && (
                  <div>
                    <h4 className="text-foreground font-medium mb-2">코 (재물운 & 의지력)</h4>
                    <p className="text-sm mb-1">{result.analysis.nose.analysis}</p>
                    <p className="text-sm text-blue-400">{result.analysis.nose.fortune}</p>
                  </div>
                )}

                {result.analysis.mouth && (
                  <div>
                    <h4 className="text-foreground font-medium mb-2">입 (언변 & 복록)</h4>
                    <p className="text-sm mb-1">{result.analysis.mouth.analysis}</p>
                    <p className="text-sm text-blue-400">{result.analysis.mouth.fortune}</p>
                  </div>
                )}

                {result.analysis.ears && (
                  <div>
                    <h4 className="text-foreground font-medium mb-2">귀 (건강 & 재물운)</h4>
                    <p className="text-sm mb-1">{result.analysis.ears.analysis}</p>
                    <p className="text-sm text-blue-400">{result.analysis.ears.fortune}</p>
                  </div>
                )}

                {result.analysis.overallFortune && (
                  <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-500/30">
                    <h4 className="text-foreground font-medium mb-2">종합 운세</h4>
                    <p className="text-sm">{result.analysis.overallFortune}</p>
                  </div>
                )}

                {(result.analysis.strengths || result.analysis.challenges) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {result.analysis.strengths && (
                      <div className="bg-green-900/20 rounded-lg p-4 border border-green-500/30">
                        <h4 className="text-foreground font-medium mb-2">강점</h4>
                        <ul className="text-sm space-y-1">
                          {result.analysis.strengths.map((item: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-green-400">✓</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {result.analysis.challenges && (
                      <div className="bg-yellow-900/20 rounded-lg p-4 border border-yellow-500/30">
                        <h4 className="text-foreground font-medium mb-2">주의할 점</h4>
                        <ul className="text-sm space-y-1">
                          {result.analysis.challenges.map((item: string, idx: number) => (
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

                {result.analysis.advice && Array.isArray(result.analysis.advice) && (
                  <div className="bg-purple-900/20 rounded-lg p-4 border border-purple-500/30">
                    <h4 className="text-foreground font-medium mb-2">조언</h4>
                    <ul className="text-sm space-y-1">
                      {result.analysis.advice.map((item: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-purple-400">→</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {(result.analysis.luckyColors || result.analysis.luckyNumbers) && (
                  <div className="grid grid-cols-2 gap-4">
                    {result.analysis.luckyColors && (
                      <div className="bg-blue-900/20 rounded-lg p-3 border border-blue-500/30">
                        <h4 className="text-foreground font-medium mb-2 text-sm">행운의 색상</h4>
                        <div className="flex gap-2 flex-wrap">
                          {result.analysis.luckyColors.map((color: string, idx: number) => (
                            <span key={idx} className="text-xs bg-blue-500/20 px-2 py-1 rounded">
                              {color}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {result.analysis.luckyNumbers && (
                      <div className="bg-blue-900/20 rounded-lg p-3 border border-blue-500/30">
                        <h4 className="text-foreground font-medium mb-2 text-sm">행운의 숫자</h4>
                        <div className="flex gap-2 flex-wrap">
                          {result.analysis.luckyNumbers.map((num: number, idx: number) => (
                            <span key={idx} className="text-xs bg-blue-500/20 px-2 py-1 rounded">
                              {num}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">{JSON.stringify(result, null, 2)}</p>
            )}
          </div>

          <button
            onClick={handleReset}
            className="w-full py-3 px-6 bg-gray-600 hover:bg-gray-500 text-foreground rounded-lg transition"
          >
            다시 분석하기
          </button>
        </div>
      )}
    </ServiceDetailLayout>
  );
}
