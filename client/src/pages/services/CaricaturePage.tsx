import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';
import ServiceDetailLayout from '../../components/ServiceDetailLayout';
import ExecuteButton from '../../components/ExecuteButton';
import ImageUpload from '../../components/ImageUpload';
import { generateCaricature } from '../../services/ai';
import { getCurrentUser, isLoggedIn } from '../../services/auth';

export default function CaricaturePage() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const [image, setImage] = useState<string | null>(null);
  const [exaggerationLevel, setExaggerationLevel] = useState<'low' | 'medium' | 'high'>('medium');
  const [loading, setLoading] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [currentCredits, setCurrentCredits] = useState(0);

  const serviceCost = 35;

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

    setLoading(true);
    try {
      const response = await generateCaricature(image, exaggerationLevel) as any;

      if (response.success && response.imageData) {
        const imageBase64 = `data:${response.mimeType};base64,${response.imageData}`;
        setResultImage(imageBase64);

        if (response.credits?.remaining !== undefined) {
          setCurrentCredits(response.credits.remaining);
        }
      } else {
        throw new Error(response.error || '캐리커쳐 생성 실패');
      }
    } catch (error) {
      console.error('Error:', error);
      alert(error instanceof Error ? error.message : '캐리커쳐 생성 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ServiceDetailLayout
      title={t('services.image.caricature.title')}
      description={t('services.image.caricature.description')}
      icon="draw"
      color="purple"
    >
      <div className="space-y-6">
        <div className="bg-gray-50 dark:bg-[#0d0d0d] rounded-lg p-4 border border-purple-500/20">
          <h3 className="text-foreground font-semibold mb-2">서비스 안내</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            사진을 캐리커쳐 스타일로 변환합니다. 과장 정도를 선택할 수 있습니다.
          </p>
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
                  과장 정도
                </label>
                <select
                  value={exaggerationLevel}
                  onChange={(e) => setExaggerationLevel(e.target.value as any)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0d0d0d] border border-gray-300 dark:border-gray-600 rounded-lg text-foreground focus:outline-none focus:border-purple-500"
                >
                  <option value="low">낮음</option>
                  <option value="medium">중간</option>
                  <option value="high">높음</option>
                </select>
              </div>
            )}

            <ExecuteButton
              credits={serviceCost}
              currentCredits={currentCredits}
              onClick={handleExecute}
              loading={loading}
              disabled={!image}
            />
          </div>
        )}

        {resultImage && (
          <div className="space-y-4 animate-fadeIn">
            <div className="bg-purple-500/10 rounded-lg p-4 border border-purple-500/20">
              <h3 className="text-foreground font-semibold mb-3">캐리커쳐 결과</h3>
              <img
                src={resultImage}
                alt="Caricature Result"
                className="w-full rounded-lg"
              />
            </div>

            <button
              onClick={() => setResultImage(null)}
              className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 text-foreground rounded-lg transition"
            >
              다시 생성하기
            </button>
          </div>
        )}
      </div>
    </ServiceDetailLayout>
  );
}
