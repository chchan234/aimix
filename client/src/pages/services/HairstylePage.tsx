import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';
import ServiceDetailLayout from '../../components/ServiceDetailLayout';
import ExecuteButton from '../../components/ExecuteButton';
import { changeHairstyle } from '../../services/ai';
import { getCurrentUser, isLoggedIn } from '../../services/auth';

export default function HairstylePage() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<'intro' | 'upload' | 'result'>('intro');
  const [image, setImage] = useState<string | null>(null);
  const [hairstyleDescription, setHairstyleDescription] = useState('');
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
        setStep('result');

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

  const handleReset = () => {
    setStep('upload');
    setResultImage(null);
    setImage(null);
    setHairstyleDescription('');
  };

  return (
    <ServiceDetailLayout
      title={t('services.image.hairstyle.title')}
      description={t('services.image.hairstyle.description')}
      icon="face_retouching_natural"
      color="red"
    >
      {/* Intro Step */}
      {step === 'intro' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold text-foreground mb-4">
              AI 헤어스타일 변환
            </h3>
            <p className="text-muted-foreground mb-4">
              사진 속 헤어스타일을 원하는 스타일로 변환합니다.
              미용실 방문 전 다양한 헤어스타일을 미리 체험해보세요.
            </p>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                <span className="material-symbols-outlined text-red-600 dark:text-red-400 text-2xl block mb-2">content_cut</span>
                <p className="text-sm font-medium text-foreground">다양한 스타일</p>
                <p className="text-xs text-muted-foreground">파마, 단발, 웨이브 등</p>
              </div>
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                <span className="material-symbols-outlined text-red-600 dark:text-red-400 text-2xl block mb-2">preview</span>
                <p className="text-sm font-medium text-foreground">미리보기</p>
                <p className="text-xs text-muted-foreground">변경 전 미리 확인</p>
              </div>
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                <span className="material-symbols-outlined text-red-600 dark:text-red-400 text-2xl block mb-2">colorize</span>
                <p className="text-sm font-medium text-foreground">염색 시뮬</p>
                <p className="text-xs text-muted-foreground">머리 색상 변경</p>
              </div>
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                <span className="material-symbols-outlined text-red-600 dark:text-red-400 text-2xl block mb-2">auto_awesome</span>
                <p className="text-sm font-medium text-foreground">자연스러운 결과</p>
                <p className="text-xs text-muted-foreground">AI 기반 자연스러운 변환</p>
              </div>
            </div>
          </div>

          <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-foreground font-semibold">AI 헤어스타일 변환</p>
                <p className="text-muted-foreground text-sm">원하는 스타일로 변환</p>
              </div>
              <div className="text-right">
                <p className="text-red-600 dark:text-red-400 font-bold text-xl">{serviceCost} 크레딧</p>
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
            className="w-full px-6 py-4 bg-red-600 hover:bg-red-700 text-foreground font-semibold rounded-lg transition-colors"
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
                className="w-full p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-red-500 transition-colors"
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

          {/* Hairstyle Description */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-foreground mb-4">원하는 헤어스타일</h3>
            <input
              type="text"
              value={hairstyleDescription}
              onChange={(e) => setHairstyleDescription(e.target.value)}
              placeholder="예: 긴 웨이브 머리, 짧은 단발머리, 펌 머리 등"
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-foreground placeholder-gray-400 focus:outline-none focus:border-red-500"
            />
            <p className="text-xs text-muted-foreground mt-2">
              원하는 헤어스타일을 자세히 입력할수록 더 정확한 결과를 얻을 수 있습니다.
            </p>
          </div>

          <ExecuteButton
            credits={serviceCost}
            currentCredits={currentCredits}
            onClick={handleExecute}
            loading={loading}
            disabled={!image || !hairstyleDescription.trim()}
          />
        </div>
      )}

      {/* Result Step */}
      {step === 'result' && resultImage && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-foreground mb-4">헤어스타일 변환 결과</h3>
            <img
              src={resultImage}
              alt="Hairstyle Transform Result"
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
