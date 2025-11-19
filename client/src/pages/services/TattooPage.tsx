import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';
import ServiceDetailLayout from '../../components/ServiceDetailLayout';
import ExecuteButton from '../../components/ExecuteButton';
import ImageUpload from '../../components/ImageUpload';
import { addTattoo } from '../../services/ai';
import { getCurrentUser, isLoggedIn } from '../../services/auth';

export default function TattooPage() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const [image, setImage] = useState<string | null>(null);
  const [tattooDescription, setTattooDescription] = useState('');
  const [placement, setPlacement] = useState('');
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

    if (!tattooDescription.trim()) {
      alert('타투 디자인을 입력해주세요.');
      return;
    }

    if (!placement.trim()) {
      alert('타투 위치를 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      const response = await addTattoo(image, tattooDescription, placement) as any;

      if (response.success && response.imageData) {
        const imageBase64 = `data:${response.mimeType};base64,${response.imageData}`;
        setResultImage(imageBase64);

        if (response.credits?.remaining !== undefined) {
          setCurrentCredits(response.credits.remaining);
        }
      } else {
        throw new Error(response.error || '타투 시뮬레이션 실패');
      }
    } catch (error) {
      console.error('Error:', error);
      alert(error instanceof Error ? error.message : '타투 시뮬레이션 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ServiceDetailLayout
      title={t('services.image.tattoo.title')}
      description={t('services.image.tattoo.description')}
      icon="brush"
      color="teal"
    >
      <div className="space-y-6">
        <div className="bg-gray-50 dark:bg-[#0d0d0d] rounded-lg p-4 border border-teal-500/20">
          <h3 className="text-foreground font-semibold mb-2">서비스 안내</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            사진에 원하는 타투 디자인을 시뮬레이션합니다.
          </p>
        </div>

        {!resultImage && (
          <div className="space-y-4">
            <ImageUpload
              onImageSelect={setImage}
              label="사진 업로드"
            />

            {image && (
              <>
                <div>
                  <label className="block text-foreground font-medium mb-2">
                    타투 디자인
                  </label>
                  <input
                    type="text"
                    value={tattooDescription}
                    onChange={(e) => setTattooDescription(e.target.value)}
                    placeholder="예: 용 타투, 꽃 타투, 부족 문양 등"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0d0d0d] border border-gray-300 dark:border-gray-600 rounded-lg text-foreground placeholder-gray-400 focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-foreground font-medium mb-2">
                    타투 위치
                  </label>
                  <input
                    type="text"
                    value={placement}
                    onChange={(e) => setPlacement(e.target.value)}
                    placeholder="예: 팔, 등, 어깨, 손목 등"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0d0d0d] border border-gray-300 dark:border-gray-600 rounded-lg text-foreground placeholder-gray-400 focus:outline-none focus:border-teal-500"
                  />
                </div>
              </>
            )}

            <ExecuteButton
              credits={serviceCost}
              currentCredits={currentCredits}
              onClick={handleExecute}
              loading={loading}
              disabled={!image || !tattooDescription.trim() || !placement.trim()}
            />
          </div>
        )}

        {resultImage && (
          <div className="space-y-4 animate-fadeIn">
            <div className="bg-teal-500/10 rounded-lg p-4 border border-teal-500/20">
              <h3 className="text-foreground font-semibold mb-3">타투 시뮬레이션 결과</h3>
              <img
                src={resultImage}
                alt="Tattoo Simulation Result"
                className="w-full rounded-lg"
              />
            </div>

            <button
              onClick={() => setResultImage(null)}
              className="w-full px-4 py-3 bg-teal-600 hover:bg-teal-700 text-foreground rounded-lg transition"
            >
              다시 생성하기
            </button>
          </div>
        )}
      </div>
    </ServiceDetailLayout>
  );
}
