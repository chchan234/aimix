import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';
import ServiceDetailLayout from '../../components/ServiceDetailLayout';
import ExecuteButton from '../../components/ExecuteButton';
import ImageUpload from '../../components/ImageUpload';
import { swapFaces } from '../../services/ai';
import { getCurrentUser, isLoggedIn } from '../../services/auth';

export default function FaceSwapPage() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [targetImage, setTargetImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [currentCredits, setCurrentCredits] = useState(0);

  const serviceCost = 40;

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
    if (!sourceImage || !targetImage) {
      alert('두 개의 사진을 모두 업로드해주세요.');
      return;
    }

    setLoading(true);
    try {
      const response = await swapFaces(sourceImage, targetImage) as any;

      if (response.success && response.imageData) {
        const imageBase64 = `data:${response.mimeType};base64,${response.imageData}`;
        setResultImage(imageBase64);

        if (response.credits?.remaining !== undefined) {
          setCurrentCredits(response.credits.remaining);
        }
      } else {
        throw new Error(response.error || '얼굴 바꾸기 실패');
      }
    } catch (error) {
      console.error('Error:', error);
      alert(error instanceof Error ? error.message : '얼굴 바꾸기 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ServiceDetailLayout
      title={t('services.image.faceSwap.title')}
      description={t('services.image.faceSwap.description')}
      icon="swap_horiz"
      color="pink"
    >
      <div className="space-y-6">
        <div className="bg-background-dark rounded-lg p-4 border border-pink-500/20">
          <h3 className="text-white font-semibold mb-2">서비스 안내</h3>
          <p className="text-[#ab9eb7] text-sm leading-relaxed">
            두 사진의 얼굴을 서로 바꿉니다.
          </p>
        </div>

        {!resultImage && (
          <div className="space-y-4">
            <ImageUpload
              onImageSelect={setSourceImage}
              label="첫 번째 사진 (얼굴)"
            />

            <ImageUpload
              onImageSelect={setTargetImage}
              label="두 번째 사진 (몸/포즈)"
            />

            <ExecuteButton
              credits={serviceCost}
              currentCredits={currentCredits}
              onClick={handleExecute}
              loading={loading}
              disabled={!sourceImage || !targetImage}
            />
          </div>
        )}

        {resultImage && (
          <div className="space-y-4 animate-fadeIn">
            <div className="bg-pink-500/10 rounded-lg p-4 border border-pink-500/20">
              <h3 className="text-white font-semibold mb-3">얼굴 바꾸기 결과</h3>
              <img
                src={resultImage}
                alt="Face Swap Result"
                className="w-full rounded-lg"
              />
            </div>

            <button
              onClick={() => setResultImage(null)}
              className="w-full px-4 py-3 bg-pink-600 hover:bg-pink-700 text-white rounded-lg transition"
            >
              다시 생성하기
            </button>
          </div>
        )}
      </div>
    </ServiceDetailLayout>
  );
}
