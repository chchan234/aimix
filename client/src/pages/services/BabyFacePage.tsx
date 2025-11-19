import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';
import ServiceDetailLayout from '../../components/ServiceDetailLayout';
import ExecuteButton from '../../components/ExecuteButton';
import ImageUpload from '../../components/ImageUpload';
import { generateBabyFace } from '../../services/ai';
import { getCurrentUser, isLoggedIn } from '../../services/auth';

export default function BabyFacePage() {
  useTranslation();
  const [, setLocation] = useLocation();
  const [parent1Image, setParent1Image] = useState<string | null>(null);
  const [parent2Image, setParent2Image] = useState<string | null>(null);
  const [style, setStyle] = useState<'normal' | 'idol'>('normal');
  const [loading, setLoading] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [currentCredits, setCurrentCredits] = useState(0);
  const [showIntro, setShowIntro] = useState(true);

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
    if (!parent1Image || !parent2Image) {
      alert('두 부모의 사진을 모두 업로드해주세요.');
      return;
    }

    setLoading(true);
    try {
      const response = await generateBabyFace(parent1Image, parent2Image, style) as any;

      if (response.success && response.imageData) {
        const imageBase64 = `data:${response.mimeType};base64,${response.imageData}`;
        setResultImage(imageBase64);

        if (response.credits?.remaining !== undefined) {
          setCurrentCredits(response.credits.remaining);
        }
      } else {
        throw new Error(response.error || '아이 얼굴 예측 실패');
      }
    } catch (error) {
      console.error('Error:', error);
      alert(error instanceof Error ? error.message : '아이 얼굴 예측 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResultImage(null);
    setParent1Image(null);
    setParent2Image(null);
    setStyle('normal');
  };

  return (
    <ServiceDetailLayout
      title="2세 얼굴 예측"
      description="미래 아이의 얼굴을 예측해보세요"
      icon="child_care"
      color="pink"
    >
      <div className="space-y-6">
        {showIntro && !resultImage && (
          <div className="bg-background-dark rounded-lg p-4 border border-pink-500/20">
            <h3 className="text-white font-semibold mb-2">서비스 안내</h3>
            <p className="text-[#ab9eb7] text-sm leading-relaxed mb-3">
              두 부모의 얼굴 사진을 업로드하면 AI가 미래 아이의 얼굴을 예측합니다.
              일반 스타일과 아이돌 버전 중 선택할 수 있습니다.
            </p>
            <ul className="text-[#ab9eb7] text-sm space-y-1">
              <li>• 정면 얼굴이 잘 보이는 사진을 사용하세요</li>
              <li>• 두 사람의 얼굴이 선명하게 나온 사진이 좋습니다</li>
              <li>• 결과는 재미용이며 실제와 다를 수 있습니다</li>
            </ul>
            <button
              onClick={() => setShowIntro(false)}
              className="mt-4 w-full px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg transition"
            >
              시작하기
            </button>
          </div>
        )}

        {!showIntro && !resultImage && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <ImageUpload
                  onImageSelect={setParent1Image}
                  label="부모 1 사진"
                />
              </div>
              <div>
                <ImageUpload
                  onImageSelect={setParent2Image}
                  label="부모 2 사진"
                />
              </div>
            </div>

            <div className="bg-background-dark rounded-lg p-4 border border-pink-500/20">
              <h3 className="text-white font-semibold mb-3">스타일 선택</h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setStyle('normal')}
                  className={`px-4 py-3 rounded-lg transition text-sm font-medium ${
                    style === 'normal'
                      ? 'bg-pink-600 text-white'
                      : 'bg-pink-500/20 text-pink-400 hover:bg-pink-500/30'
                  }`}
                >
                  일반
                </button>
                <button
                  onClick={() => setStyle('idol')}
                  className={`px-4 py-3 rounded-lg transition text-sm font-medium ${
                    style === 'idol'
                      ? 'bg-pink-600 text-white'
                      : 'bg-pink-500/20 text-pink-400 hover:bg-pink-500/30'
                  }`}
                >
                  아이돌 버전
                </button>
              </div>
            </div>

            <ExecuteButton
              credits={serviceCost}
              currentCredits={currentCredits}
              onClick={handleExecute}
              loading={loading}
              disabled={!parent1Image || !parent2Image}
            />
          </div>
        )}

        {resultImage && (
          <div className="space-y-4 animate-fadeIn">
            <div className="bg-pink-500/10 rounded-lg p-4 border border-pink-500/20">
              <h3 className="text-white font-semibold mb-3">
                예측된 아이 얼굴 {style === 'idol' ? '(아이돌 버전)' : ''}
              </h3>
              <img
                src={resultImage}
                alt="Baby Face Prediction Result"
                className="w-full rounded-lg"
              />
            </div>

            <button
              onClick={handleReset}
              className="w-full px-4 py-3 bg-pink-600 hover:bg-pink-700 text-white rounded-lg transition"
            >
              다시 예측하기
            </button>
          </div>
        )}
      </div>
    </ServiceDetailLayout>
  );
}
