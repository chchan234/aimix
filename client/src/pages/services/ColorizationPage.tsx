import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import ServiceDetailLayout from '../../components/ServiceDetailLayout';
import ExecuteButton from '../../components/ExecuteButton';
import { colorizePhoto } from '../../services/ai';
import { getCurrentUser, isLoggedIn } from '../../services/auth';

export default function ColorizationPage() {
  const { t } = useTranslation();
  const [step, setStep] = useState<'intro' | 'upload' | 'result'>('intro');
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [currentCredits, setCurrentCredits] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const serviceCost = 30;

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = await getCurrentUser();
        setCurrentCredits(user.credits);
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      }
    };
    fetchUserData();
  }, []);

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
      alert('흑백 사진을 업로드해주세요.');
      return;
    }

    setLoading(true);
    try {
      const response = await colorizePhoto(image) as any;

      if (response.success && response.imageData) {
        const imageBase64 = `data:${response.mimeType};base64,${response.imageData}`;
        setResultImage(imageBase64);
        setStep('result');

        if (response.credits?.remaining !== undefined) {
          setCurrentCredits(response.credits.remaining);
        }
      } else {
        throw new Error(response.error || '컬러화 실패');
      }
    } catch (error) {
      console.error('Error:', error);
      alert(error instanceof Error ? error.message : '컬러화 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep('upload');
    setResultImage(null);
    setImage(null);
  };

  return (
    <ServiceDetailLayout
      title={t('services.image.colorization.title')}
      description={t('services.image.colorization.description')}
      icon="palette"
      color="green"
    >
      {/* Intro Step */}
      {step === 'intro' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold text-foreground mb-4">
              AI 흑백 사진 컬러화
            </h3>
            <p className="text-muted-foreground mb-4">
              흑백 사진을 자연스럽고 생생한 컬러 사진으로 변환합니다.
              오래된 가족 사진이나 역사적인 사진을 복원해보세요.
            </p>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                <span className="material-symbols-outlined text-green-400 text-2xl block mb-2">photo_library</span>
                <p className="text-sm font-medium text-foreground">추억 복원</p>
                <p className="text-xs text-muted-foreground">오래된 사진 복원</p>
              </div>
              <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                <span className="material-symbols-outlined text-green-400 text-2xl block mb-2">auto_awesome</span>
                <p className="text-sm font-medium text-foreground">자연스러운 색감</p>
                <p className="text-xs text-muted-foreground">AI 기반 자동 컬러링</p>
              </div>
              <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                <span className="material-symbols-outlined text-green-400 text-2xl block mb-2">history</span>
                <p className="text-sm font-medium text-foreground">역사 복원</p>
                <p className="text-xs text-muted-foreground">역사적 사진 컬러화</p>
              </div>
              <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                <span className="material-symbols-outlined text-green-400 text-2xl block mb-2">high_quality</span>
                <p className="text-sm font-medium text-foreground">고품질</p>
                <p className="text-xs text-muted-foreground">선명한 결과물</p>
              </div>
            </div>
          </div>

          <div className="bg-green-900/20 border border-green-500 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-foreground font-semibold">AI 흑백 사진 컬러화</p>
                <p className="text-muted-foreground text-sm">흑백 → 컬러 변환</p>
              </div>
              <div className="text-right">
                <p className="text-green-400 font-bold text-xl">{serviceCost} 크레딧</p>
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
            className="w-full px-6 py-4 bg-green-600 hover:bg-green-700 text-foreground font-semibold rounded-lg transition-colors"
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
            <h3 className="text-lg font-semibold text-foreground mb-4">흑백 사진 업로드</h3>
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
                className="w-full p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-green-500 transition-colors"
              >
                <span className="material-symbols-outlined text-4xl text-muted-foreground block mb-2">
                  add_photo_alternate
                </span>
                <span className="text-muted-foreground">클릭하여 흑백 사진 업로드</span>
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
            <h3 className="text-lg font-semibold text-foreground mb-4">컬러화 결과</h3>
            <img
              src={resultImage}
              alt="Colorization Result"
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
