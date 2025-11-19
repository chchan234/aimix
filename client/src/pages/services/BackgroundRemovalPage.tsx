import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';
import ServiceDetailLayout from '../../components/ServiceDetailLayout';
import ExecuteButton from '../../components/ExecuteButton';
import { removeBackground } from '../../services/ai';
import { getCurrentUser, isLoggedIn } from '../../services/auth';

export default function BackgroundRemovalPage() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<'intro' | 'upload' | 'result'>('intro');
  const [image, setImage] = useState<string | null>(null);
  const [newBackground, setNewBackground] = useState('');
  const [loading, setLoading] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [currentCredits, setCurrentCredits] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleExecute = async () => {
    if (!image) {
      alert('사진을 업로드해주세요.');
      return;
    }

    setLoading(true);
    try {
      const response = await removeBackground(image, newBackground) as any;

      if (response.success && response.imageData) {
        const imageBase64 = `data:${response.mimeType};base64,${response.imageData}`;
        setResultImage(imageBase64);
        setStep('result');

        if (response.credits?.remaining !== undefined) {
          setCurrentCredits(response.credits.remaining);
        }
      } else {
        throw new Error(response.error || '배경 제거 실패');
      }
    } catch (error) {
      console.error('Error:', error);
      alert(error instanceof Error ? error.message : '배경 제거 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep('upload');
    setResultImage(null);
    setImage(null);
    setNewBackground('');
  };

  return (
    <ServiceDetailLayout
      title={t('services.image.backgroundRemoval.title')}
      description={t('services.image.backgroundRemoval.description')}
      icon="layers_clear"
      color="yellow"
    >
      {/* Intro Step */}
      {step === 'intro' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold text-foreground mb-4">
              AI 배경 제거/변경
            </h3>
            <p className="text-muted-foreground mb-4">
              사진의 배경을 제거하거나 원하는 새로운 배경으로 교체합니다.
              상품 사진, 프로필 사진 등에 활용할 수 있습니다.
            </p>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                <span className="material-symbols-outlined text-yellow-400 text-2xl block mb-2">content_cut</span>
                <p className="text-sm font-medium text-foreground">배경 제거</p>
                <p className="text-xs text-muted-foreground">투명 배경 생성</p>
              </div>
              <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                <span className="material-symbols-outlined text-yellow-400 text-2xl block mb-2">wallpaper</span>
                <p className="text-sm font-medium text-foreground">배경 교체</p>
                <p className="text-xs text-muted-foreground">원하는 배경으로 변경</p>
              </div>
              <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                <span className="material-symbols-outlined text-yellow-400 text-2xl block mb-2">shopping_bag</span>
                <p className="text-sm font-medium text-foreground">상품 사진</p>
                <p className="text-xs text-muted-foreground">깔끔한 상품 이미지</p>
              </div>
              <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                <span className="material-symbols-outlined text-yellow-400 text-2xl block mb-2">auto_awesome</span>
                <p className="text-sm font-medium text-foreground">AI 정밀</p>
                <p className="text-xs text-muted-foreground">정밀한 배경 분리</p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-900/20 border border-yellow-500 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-foreground font-semibold">AI 배경 제거/변경</p>
                <p className="text-muted-foreground text-sm">배경 제거 또는 교체</p>
              </div>
              <div className="text-right">
                <p className="text-yellow-400 font-bold text-xl">{serviceCost} 크레딧</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              if (!isLoggedIn()) {
                alert('로그인이 필요한 서비스입니다. 로그인 후 이용해주세요.');
                return;
              }
              setStep('upload');
            }}
            className="w-full px-6 py-4 bg-yellow-600 hover:bg-yellow-700 text-foreground font-semibold rounded-lg transition-colors"
          >
            시작하기
          </button>
        </div>
      )}

      {/* Upload Step */}
      {step === 'upload' && (
        <div className="space-y-6">
          {/* Image Upload */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-foreground mb-4">사진 업로드</h3>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              ref={fileInputRef}
              className="hidden"
            />
            {!image ? (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-yellow-500 transition-colors"
              >
                <span className="material-symbols-outlined text-4xl text-muted-foreground block mb-2">
                  add_photo_alternate
                </span>
                <span className="text-muted-foreground">클릭하여 사진 업로드</span>
              </button>
            ) : (
              <div className="relative aspect-square max-w-sm mx-auto">
                <img
                  src={image}
                  alt="Uploaded"
                  className="w-full h-full object-cover rounded-lg"
                />
                <button
                  onClick={() => {
                    setImage(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="absolute top-2 right-2 p-2 bg-black/50 rounded-full hover:bg-black/70 transition"
                >
                  <span className="material-symbols-outlined text-foreground">close</span>
                </button>
              </div>
            )}
          </div>

          {/* New Background (Optional) */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-foreground mb-4">새 배경 (선택사항)</h3>
            <input
              type="text"
              value={newBackground}
              onChange={(e) => setNewBackground(e.target.value)}
              placeholder="예: 흰색 배경, 자연 풍경, 도시 야경 등 (비워두면 배경만 제거)"
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-foreground placeholder-gray-400 focus:outline-none focus:border-yellow-500"
            />
            <p className="text-xs text-muted-foreground mt-2">
              비워두면 투명 배경으로 생성됩니다.
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

      {/* Result Step */}
      {step === 'result' && resultImage && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-foreground mb-4">배경 제거 결과</h3>
            <img
              src={resultImage}
              alt="Background Removal Result"
              className="w-full rounded-lg"
            />
          </div>

          <button
            onClick={handleReset}
            className="w-full px-6 py-4 bg-gray-600 hover:bg-gray-500 text-foreground font-semibold rounded-lg transition-colors"
          >
            다시 시도하기
          </button>
        </div>
      )}
    </ServiceDetailLayout>
  );
}
