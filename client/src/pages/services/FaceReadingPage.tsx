import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';
import ServiceDetailLayout from '../../components/ServiceDetailLayout';
import ExecuteButton from '../../components/ExecuteButton';
import { analyzeFaceReading } from '../../services/ai';
import { getCurrentUser, isLoggedIn } from '../../services/auth';

export default function FaceReadingPage() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [currentCredits, setCurrentCredits] = useState(0);

  const serviceCost = 25;

  useEffect(() => {
    // 로그인 체크
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

    setLoading(true);
    try {
      // Convert image to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(image);
      });

      // Send full data URL (data:image/...;base64,...)
      const response = await analyzeFaceReading(base64) as any;
      setResult(response);

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

  return (
    <ServiceDetailLayout
      title={t('services.fortune.faceReading.title')}
      description={t('services.fortune.faceReading.description')}
      icon="face"
      color="blue"
    >
      <div className="space-y-6">
        {/* Service Description */}
        <div className="bg-background-dark rounded-lg p-4 border border-blue-500/20">
          <h3 className="text-white font-semibold mb-2">서비스 안내</h3>
          <p className="text-[#ab9eb7] text-sm leading-relaxed">
            얼굴 사진을 분석하여 관상을 해석해드립니다.
            AI가 얼굴의 특징을 분석하고 전통 관상학의 원리를 바탕으로
            성격, 운세, 재물운 등을 풀이합니다.
          </p>
        </div>

        {/* Input Form */}
        {!result && (
          <div className="space-y-4">
            <div>
              <label className="block text-white font-medium mb-2">
                사진 업로드
              </label>

              {!previewUrl ? (
                <label className="block">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <div className="w-full h-64 border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition">
                    <span className="material-symbols-outlined text-6xl text-gray-500 mb-2">
                      add_photo_alternate
                    </span>
                    <p className="text-[#ab9eb7] text-sm">
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
                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full"
                  >
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                </div>
              )}

              <p className="text-[#ab9eb7] text-xs mt-1">
                정면 사진을 업로드하시면 더 정확한 분석이 가능합니다
              </p>
            </div>

            <ExecuteButton
              credits={serviceCost}
              currentCredits={currentCredits}
              onClick={handleExecute}
              loading={loading}
              disabled={!image}
            />
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="space-y-4">
            {/* Preview Image */}
            {previewUrl && (
              <div className="bg-background-dark rounded-lg p-4 border border-blue-500/20">
                <img
                  src={previewUrl}
                  alt="분석된 사진"
                  className="w-full max-w-md mx-auto rounded-lg"
                />
              </div>
            )}

            {/* Analysis Result */}
            <div className="bg-background-dark rounded-lg p-6 border border-blue-500/20">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined">auto_awesome</span>
                관상 분석 결과
              </h3>

              {result.analysis ? (
                <div className="space-y-4 text-[#ab9eb7]">
                  {/* Overall Impression */}
                  {result.analysis.overallImpression && (
                    <div>
                      <h4 className="text-white font-medium mb-2">전체적인 인상</h4>
                      <p className="text-sm">{result.analysis.overallImpression}</p>
                    </div>
                  )}

                  {/* Face Shape */}
                  {result.analysis.faceShape && (
                    <div>
                      <h4 className="text-white font-medium mb-2">얼굴형</h4>
                      <p className="text-sm">
                        <span className="text-blue-400">{result.analysis.faceShape.type}</span> - {result.analysis.faceShape.meaning}
                      </p>
                    </div>
                  )}

                  {/* Forehead */}
                  {result.analysis.forehead && (
                    <div>
                      <h4 className="text-white font-medium mb-2">이마 (재물운 & 지혜)</h4>
                      <p className="text-sm mb-1">{result.analysis.forehead.analysis}</p>
                      <p className="text-sm text-blue-400">{result.analysis.forehead.fortune}</p>
                    </div>
                  )}

                  {/* Eyes */}
                  {result.analysis.eyes && (
                    <div>
                      <h4 className="text-white font-medium mb-2">눈 (감정 & 인간관계)</h4>
                      <p className="text-sm mb-1">{result.analysis.eyes.analysis}</p>
                      <p className="text-sm text-blue-400">{result.analysis.eyes.fortune}</p>
                    </div>
                  )}

                  {/* Nose */}
                  {result.analysis.nose && (
                    <div>
                      <h4 className="text-white font-medium mb-2">코 (재물운 & 의지력)</h4>
                      <p className="text-sm mb-1">{result.analysis.nose.analysis}</p>
                      <p className="text-sm text-blue-400">{result.analysis.nose.fortune}</p>
                    </div>
                  )}

                  {/* Mouth */}
                  {result.analysis.mouth && (
                    <div>
                      <h4 className="text-white font-medium mb-2">입 (언변 & 복록)</h4>
                      <p className="text-sm mb-1">{result.analysis.mouth.analysis}</p>
                      <p className="text-sm text-blue-400">{result.analysis.mouth.fortune}</p>
                    </div>
                  )}

                  {/* Ears */}
                  {result.analysis.ears && (
                    <div>
                      <h4 className="text-white font-medium mb-2">귀 (건강 & 재물운)</h4>
                      <p className="text-sm mb-1">{result.analysis.ears.analysis}</p>
                      <p className="text-sm text-blue-400">{result.analysis.ears.fortune}</p>
                    </div>
                  )}

                  {/* Overall Fortune */}
                  {result.analysis.overallFortune && (
                    <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-500/30">
                      <h4 className="text-white font-medium mb-2">종합 운세</h4>
                      <p className="text-sm">{result.analysis.overallFortune}</p>
                    </div>
                  )}

                  {/* Strengths & Challenges */}
                  {(result.analysis.strengths || result.analysis.challenges) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {result.analysis.strengths && (
                        <div className="bg-green-900/20 rounded-lg p-4 border border-green-500/30">
                          <h4 className="text-white font-medium mb-2">강점</h4>
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
                          <h4 className="text-white font-medium mb-2">주의할 점</h4>
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

                  {/* Advice */}
                  {result.analysis.advice && Array.isArray(result.analysis.advice) && (
                    <div className="bg-purple-900/20 rounded-lg p-4 border border-purple-500/30">
                      <h4 className="text-white font-medium mb-2">조언</h4>
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

                  {/* Lucky Elements */}
                  {(result.analysis.luckyColors || result.analysis.luckyNumbers) && (
                    <div className="grid grid-cols-2 gap-4">
                      {result.analysis.luckyColors && (
                        <div className="bg-blue-900/20 rounded-lg p-3 border border-blue-500/30">
                          <h4 className="text-white font-medium mb-2 text-sm">행운의 색상</h4>
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
                          <h4 className="text-white font-medium mb-2 text-sm">행운의 숫자</h4>
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
                <p className="text-[#ab9eb7]">{JSON.stringify(result, null, 2)}</p>
              )}
            </div>

            <button
              onClick={() => {
                setResult(null);
                setImage(null);
                setPreviewUrl(null);
              }}
              className="w-full py-3 px-6 bg-background-dark hover:bg-gray-700 text-white rounded-lg transition"
            >
              다시 분석하기
            </button>
          </div>
        )}
      </div>
    </ServiceDetailLayout>
  );
}
