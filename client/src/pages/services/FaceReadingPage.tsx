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
      const reader = new FileReader();
      reader.readAsDataURL(image);
      reader.onload = async () => {
        const base64 = reader.result as string;
        // Send full data URL (data:image/...;base64,...)
        const response = await analyzeFaceReading(base64) as any;
        setResult(response);

        if (response.credits?.remaining !== undefined) {
          setCurrentCredits(response.credits.remaining);
        }
      };
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
            <div className="bg-background-dark rounded-lg p-6 border border-blue-500/20">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined">auto_awesome</span>
                관상 분석 결과
              </h3>
              <div className="text-[#ab9eb7] whitespace-pre-wrap">
                {result}
              </div>
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
