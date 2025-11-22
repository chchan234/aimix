import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';
import ServiceDetailLayout from '../../components/ServiceDetailLayout';
import ExecuteButton from '../../components/ExecuteButton';
import { swapGender } from '../../services/ai';
import { getCurrentUser, isLoggedIn } from '../../services/auth';
import { useSavedResult } from '../../hooks/useSavedResult';

export default function GenderSwapPage() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<'intro' | 'upload' | 'result'>('intro');
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [currentCredits, setCurrentCredits] = useState(0);

  // Load saved result if resultId is in URL
  useSavedResult<{ imageUrl?: string; generatedImage?: string; image?: string }>((resultData) => {
    const imageUrl = resultData.imageUrl || resultData.generatedImage || resultData.image || "";
    if (imageUrl) setResultImage(imageUrl);
    setStep("result");
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const serviceCost = 35;

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

  // Auth state monitoring - redirect if logged out
  useEffect(() => {
    const checkAuth = () => {
      if (!isLoggedIn()) {
        setLocation('/login');
      }
    };

    window.addEventListener('focus', checkAuth);
    window.addEventListener('storage', checkAuth);

    return () => {
      window.removeEventListener('focus', checkAuth);
      window.removeEventListener('storage', checkAuth);
    };
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
      const response = await swapGender(image) as any;

      if (response.success && response.imageData) {
        const imageBase64 = `data:${response.mimeType};base64,${response.imageData}`;
        setResultImage(imageBase64);
        setStep('result');

        if (response.credits?.remaining !== undefined) {
          setCurrentCredits(response.credits.remaining);
        }
      } else {
        throw new Error(response.error || '성별 변환 실패');
      }
    } catch (error) {
      console.error('Error:', error);
      alert(error instanceof Error ? error.message : '성별 변환 중 오류가 발생했습니다.');
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
      title={t('services.image.genderSwap.title')}
      description={t('services.image.genderSwap.description')}
      icon="wc"
      color="indigo"
    >
      {/* Intro Step */}
      {step === 'intro' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold text-foreground mb-4">
              AI 성별 변환
            </h3>
            <p className="text-muted-foreground mb-4">
              사진 속 사람의 성별을 변환합니다.
              반대 성별의 모습을 확인해보세요.
            </p>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="p-4 rounded-lg bg-indigo-500/10 border border-indigo-500/30">
                <span className="material-symbols-outlined text-indigo-600 dark:text-indigo-400 text-2xl block mb-2">swap_horiz</span>
                <p className="text-sm font-medium text-foreground">성별 전환</p>
                <p className="text-xs text-muted-foreground">자연스러운 변환</p>
              </div>
              <div className="p-4 rounded-lg bg-indigo-500/10 border border-indigo-500/30">
                <span className="material-symbols-outlined text-indigo-600 dark:text-indigo-400 text-2xl block mb-2">face</span>
                <p className="text-sm font-medium text-foreground">특징 유지</p>
                <p className="text-xs text-muted-foreground">기존 특징 반영</p>
              </div>
              <div className="p-4 rounded-lg bg-indigo-500/10 border border-indigo-500/30">
                <span className="material-symbols-outlined text-indigo-600 dark:text-indigo-400 text-2xl block mb-2">auto_awesome</span>
                <p className="text-sm font-medium text-foreground">AI 기반</p>
                <p className="text-xs text-muted-foreground">최신 AI 기술 적용</p>
              </div>
              <div className="p-4 rounded-lg bg-indigo-500/10 border border-indigo-500/30">
                <span className="material-symbols-outlined text-indigo-600 dark:text-indigo-400 text-2xl block mb-2">psychology</span>
                <p className="text-sm font-medium text-foreground">재미있는 체험</p>
                <p className="text-xs text-muted-foreground">다른 모습 탐색</p>
              </div>
            </div>
          </div>

          <div className="bg-indigo-900/20 border border-indigo-500 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-foreground font-semibold">AI 성별 변환</p>
                <p className="text-muted-foreground text-sm">반대 성별로 변환</p>
              </div>
              <div className="text-right">
                <p className="text-indigo-600 dark:text-indigo-400 font-bold text-xl">{serviceCost} 크레딧</p>
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
            className="w-full px-6 py-4 bg-indigo-600 hover:bg-indigo-700 text-foreground font-semibold rounded-lg transition-colors"
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
                className="w-full p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-indigo-500 transition-colors"
              >
                <span className="material-symbols-outlined text-4xl text-muted-foreground block mb-2">
                  add_photo_alternate
                </span>
                <span className="text-muted-foreground">클릭하여 사진 업로드</span>
                <p className="text-gray-500 text-sm mt-1">정면 얼굴 사진 권장</p>
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
            <h3 className="text-lg font-semibold text-foreground mb-4">성별 변환 결과</h3>
            <img
              src={resultImage}
              alt="Gender Swap Result"
              className="w-full rounded-lg"
            />
          </div>

          <button
            onClick={handleReset}
            className="w-full px-6 py-4 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-foreground font-semibold rounded-lg transition-colors"
          >
            다시 시도하기
          </button>
        </div>
      )}
    </ServiceDetailLayout>
  );
}
