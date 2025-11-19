import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';
import ServiceDetailLayout from '../../components/ServiceDetailLayout';
import ExecuteButton from '../../components/ExecuteButton';
import ImageUpload from '../../components/ImageUpload';
import { changeHairstyle } from '../../services/ai';
import { getCurrentUser, isLoggedIn } from '../../services/auth';

export default function HairstylePage() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const [image, setImage] = useState<string | null>(null);
  const [hairstyleDescription, setHairstyleDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [currentCredits, setCurrentCredits] = useState(0);

  const serviceCost = 30;

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
    if (!image) {
      alert('사진을 업로드해주세요.');
      return;
    }

    if (!hairstyleDescription.trim()) {
      alert('원하는 헤어스타일을 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      const response = await changeHairstyle(image, hairstyleDescription) as any;

      if (response.success && response.imageData) {
        const imageBase64 = `data:${response.mimeType};base64,${response.imageData}`;
        setResultImage(imageBase64);

        if (response.credits?.remaining !== undefined) {
          setCurrentCredits(response.credits.remaining);
        }
      } else {
        throw new Error(response.error || '헤어스타일 변환 실패');
      }
    } catch (error) {
      console.error('Error:', error);
      alert(error instanceof Error ? error.message : '헤어스타일 변환 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ServiceDetailLayout
      title={t('services.image.hairstyle.title')}
      description={t('services.image.hairstyle.description')}
      icon="face_retouching_natural"
      color="red"
    >
      <div className="space-y-6">
        <div className="bg-gray-50 dark:bg-[#0d0d0d] rounded-lg p-4 border border-red-500/20">
          <h3 className="text-foreground font-semibold mb-2">서비스 안내</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            사진 속 헤어스타일을 원하는 스타일로 변환합니다.
          </p>
          <ul className="text-muted-foreground text-sm mt-2 space-y-1">
            <li>• 예: 파마, 단발머리, 긴 웨이브 머리, 짧은 파마, 투블럭 등</li>
          </ul>
        </div>

        {!resultImage && (
          <div className="space-y-4">
            <ImageUpload
              onImageSelect={setImage}
              label="사진 업로드"
            />

            {image && (
              <div>
                <label className="block text-foreground font-medium mb-2">
                  원하는 헤어스타일
                </label>
                <input
                  type="text"
                  value={hairstyleDescription}
                  onChange={(e) => setHairstyleDescription(e.target.value)}
                  placeholder="예: 긴 웨이브 머리, 짧은 단발머리, 펌 머리 등"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0d0d0d] border border-gray-300 dark:border-gray-600 rounded-lg text-foreground placeholder-gray-400 focus:outline-none focus:border-red-500"
                />
              </div>
            )}

            <ExecuteButton
              credits={serviceCost}
              currentCredits={currentCredits}
              onClick={handleExecute}
              loading={loading}
              disabled={!image || !hairstyleDescription.trim()}
            />
          </div>
        )}

        {resultImage && (
          <div className="space-y-4 animate-fadeIn">
            <div className="bg-red-500/10 rounded-lg p-4 border border-red-500/20">
              <h3 className="text-foreground font-semibold mb-3">헤어스타일 변환 결과</h3>
              <img
                src={resultImage}
                alt="Hairstyle Transform Result"
                className="w-full rounded-lg"
              />
            </div>

            <button
              onClick={() => setResultImage(null)}
              className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 text-foreground rounded-lg transition"
            >
              다시 생성하기
            </button>
          </div>
        )}
      </div>
    </ServiceDetailLayout>
  );
}
