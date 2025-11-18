import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';
import ServiceDetailLayout from '../../components/ServiceDetailLayout';
import ExecuteButton from '../../components/ExecuteButton';
import ImageUpload from '../../components/ImageUpload';
import { generateIdPhoto } from '../../services/ai';
import { getCurrentUser, isLoggedIn } from '../../services/auth';

export default function IdPhotoPage() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const [image, setImage] = useState<string | null>(null);
  const [backgroundColor, setBackgroundColor] = useState<'white' | 'blue' | 'gray'>('white');
  const [loading, setLoading] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
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

  const handleExecute = async () => {
    if (!image) {
      alert('사진을 업로드해주세요.');
      return;
    }

    setLoading(true);
    try {
      const response = await generateIdPhoto(image, backgroundColor) as any;

      if (response.success && response.imageData) {
        const imageBase64 = `data:${response.mimeType};base64,${response.imageData}`;
        setResultImage(imageBase64);

        if (response.credits?.remaining !== undefined) {
          setCurrentCredits(response.credits.remaining);
        }
      } else {
        throw new Error(response.error || '증명사진 생성 실패');
      }
    } catch (error) {
      console.error('Error:', error);
      alert(error instanceof Error ? error.message : '증명사진 생성 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ServiceDetailLayout
      title={t('services.image.idPhoto.title')}
      description={t('services.image.idPhoto.description')}
      icon="badge"
      color="blue"
    >
      <div className="space-y-6">
        <div className="bg-background-dark rounded-lg p-4 border border-blue-500/20">
          <h3 className="text-white font-semibold mb-2">서비스 안내</h3>
          <p className="text-[#ab9eb7] text-sm leading-relaxed">
            사진을 전문적인 증명사진 형식으로 변환합니다.
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
                <label className="block text-white font-medium mb-2">
                  배경색
                </label>
                <select
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value as any)}
                  className="w-full px-4 py-3 bg-background-dark border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="white">흰색</option>
                  <option value="blue">파란색</option>
                  <option value="gray">회색</option>
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
            <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20">
              <h3 className="text-white font-semibold mb-3">증명사진 결과</h3>
              <img
                src={resultImage}
                alt="ID Photo Result"
                className="w-full rounded-lg"
              />
            </div>

            <button
              onClick={() => setResultImage(null)}
              className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
            >
              다시 생성하기
            </button>
          </div>
        )}
      </div>
    </ServiceDetailLayout>
  );
}
