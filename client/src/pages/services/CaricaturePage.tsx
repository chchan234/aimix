import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import ServiceDetailLayout from '../../components/ServiceDetailLayout';
import ExecuteButton from '../../components/ExecuteButton';
import { generateCaricature } from '../../services/ai';
import { getCurrentUser, isLoggedIn } from '../../services/auth';

export default function CaricaturePage() {
  const { t } = useTranslation();
  const [step, setStep] = useState<'intro' | 'upload' | 'result'>('intro');
  const [image, setImage] = useState<string | null>(null);
  const [exaggerationLevel, setExaggerationLevel] = useState<'low' | 'medium' | 'high'>('medium');
  const [loading, setLoading] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [currentCredits, setCurrentCredits] = useState(0);
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
      const response = await generateCaricature(image, exaggerationLevel) as any;

      if (response.success && response.imageData) {
        const imageBase64 = `data:${response.mimeType};base64,${response.imageData}`;
        setResultImage(imageBase64);
        setStep('result');

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

  const handleReset = () => {
    setStep('upload');
    setResultImage(null);
    setImage(null);
  };

  return (
    <ServiceDetailLayout
      title={t('services.image.caricature.title')}
      description={t('services.image.caricature.description')}
      icon="draw"
      color="purple"
    >
      {/* Intro Step */}
      {step === 'intro' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold text-foreground mb-4">
              AI 캐리커쳐 생성
            </h3>
            <p className="text-muted-foreground mb-4">
              사진을 재미있고 개성있는 캐리커쳐 스타일로 변환합니다.
              과장 정도를 조절하여 원하는 스타일을 선택할 수 있습니다.
            </p>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/30">
                <span className="material-symbols-outlined text-purple-400 text-2xl block mb-2">brush</span>
                <p className="text-sm font-medium text-foreground">예술적 변환</p>
                <p className="text-xs text-muted-foreground">독특한 캐리커쳐 스타일</p>
              </div>
              <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/30">
                <span className="material-symbols-outlined text-purple-400 text-2xl block mb-2">tune</span>
                <p className="text-sm font-medium text-foreground">과장 조절</p>
                <p className="text-xs text-muted-foreground">3단계 과장 정도 선택</p>
              </div>
              <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/30">
                <span className="material-symbols-outlined text-purple-400 text-2xl block mb-2">sentiment_very_satisfied</span>
                <p className="text-sm font-medium text-foreground">재미있는 결과</p>
                <p className="text-xs text-muted-foreground">개성있는 캐릭터 변환</p>
              </div>
              <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/30">
                <span className="material-symbols-outlined text-purple-400 text-2xl block mb-2">card_giftcard</span>
                <p className="text-sm font-medium text-foreground">선물용</p>
                <p className="text-xs text-muted-foreground">특별한 선물 제작</p>
              </div>
            </div>
          </div>

          <div className="bg-purple-900/20 border border-purple-500 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-foreground font-semibold">AI 캐리커쳐 생성</p>
                <p className="text-muted-foreground text-sm">사진 → 캐리커쳐 변환</p>
              </div>
              <div className="text-right">
                <p className="text-purple-400 font-bold text-xl">{serviceCost} 크레딧</p>
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
            className="w-full px-6 py-4 bg-purple-600 hover:bg-purple-700 text-foreground font-semibold rounded-lg transition-colors"
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
                className="w-full p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-purple-500 transition-colors"
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

          {/* Exaggeration Level */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-foreground mb-4">과장 정도</h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'low', label: '낮음' },
                { value: 'medium', label: '중간' },
                { value: 'high', label: '높음' }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setExaggerationLevel(option.value as any)}
                  className={`p-3 rounded-lg border text-center transition ${
                    exaggerationLevel === option.value
                      ? 'border-purple-500 bg-purple-500/10 text-purple-400'
                      : 'border-gray-300 dark:border-gray-600 text-foreground hover:border-gray-500'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
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
            <h3 className="text-lg font-semibold text-foreground mb-4">캐리커쳐 결과</h3>
            <img
              src={resultImage}
              alt="Caricature Result"
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
