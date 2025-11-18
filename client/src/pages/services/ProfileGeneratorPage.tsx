import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';
import ServiceDetailLayout from '../../components/ServiceDetailLayout';
import ExecuteButton from '../../components/ExecuteButton';
import { generateProfile } from '../../services/ai';
import { getCurrentUser, isLoggedIn } from '../../services/auth';

export default function ProfileGeneratorPage() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const [description, setDescription] = useState('');
  const [style, setStyle] = useState<'professional' | 'casual' | 'artistic'>('professional');
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
    if (!description.trim()) {
      alert('프로필 설명을 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      const response = await generateProfile(description, style) as any;

      if (response.success && response.imageData) {
        const imageBase64 = `data:${response.mimeType};base64,${response.imageData}`;
        setResultImage(imageBase64);

        if (response.credits?.remaining !== undefined) {
          setCurrentCredits(response.credits.remaining);
        }
      } else {
        throw new Error(response.error || '이미지 생성 실패');
      }
    } catch (error) {
      console.error('Error:', error);
      alert(error instanceof Error ? error.message : '이미지 생성 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ServiceDetailLayout
      title={t('services.image.profileGenerator.title')}
      description={t('services.image.profileGenerator.description')}
      icon="account_circle"
      color="cyan"
    >
      <div className="space-y-6">
        <div className="bg-background-dark rounded-lg p-4 border border-cyan-500/20">
          <h3 className="text-white font-semibold mb-2">서비스 안내</h3>
          <p className="text-[#ab9eb7] text-sm leading-relaxed">
            AI가 당신만의 프로필 사진을 생성합니다. 원하는 스타일과 특징을 설명해주세요.
          </p>
        </div>

        {!resultImage && (
          <div className="space-y-4">
            <div>
              <label className="block text-white font-medium mb-2">
                프로필 설명
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="예: 30대 남성, 검은 머리, 안경, 밝은 미소"
                className="w-full px-4 py-3 bg-background-dark border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-500 min-h-[100px]"
              />
            </div>

            <div>
              <label className="block text-white font-medium mb-2">
                스타일
              </label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value as any)}
                className="w-full px-4 py-3 bg-background-dark border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="professional">프로페셔널</option>
                <option value="casual">캐주얼</option>
                <option value="artistic">아티스틱</option>
              </select>
            </div>

            <ExecuteButton
              credits={serviceCost}
              currentCredits={currentCredits}
              onClick={handleExecute}
              loading={loading}
              disabled={!description.trim()}
            />
          </div>
        )}

        {resultImage && (
          <div className="space-y-4 animate-fadeIn">
            <div className="bg-cyan-500/10 rounded-lg p-4 border border-cyan-500/20">
              <h3 className="text-white font-semibold mb-3">생성된 프로필</h3>
              <img
                src={resultImage}
                alt="Generated Profile"
                className="w-full rounded-lg"
              />
            </div>

            <button
              onClick={() => setResultImage(null)}
              className="w-full px-4 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition"
            >
              다시 생성하기
            </button>
          </div>
        )}
      </div>
    </ServiceDetailLayout>
  );
}
