import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import ServiceDetailLayout from '../../components/ServiceDetailLayout';
import ExecuteButton from '../../components/ExecuteButton';
import { generateProfessionalHeadshot } from '../../services/ai';
import { getCurrentUser, isLoggedIn } from '../../services/auth';
import { useSavedResult } from '../../hooks/useSavedResult';

export default function ProfileGeneratorPage() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<'intro' | 'upload' | 'result'>('intro');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [style, setStyle] = useState<'professional' | 'business' | 'casual'>('professional');
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
        setUploadedImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleExecute = async () => {
    if (!uploadedImage) {
      alert('사진을 업로드해주세요.');
      return;
    }

    setLoading(true);
    try {
      const response = await generateProfessionalHeadshot(uploadedImage, style) as any;

      if (response.success && response.imageData) {
        const imageBase64 = `data:${response.mimeType};base64,${response.imageData}`;
        setResultImage(imageBase64);
        setStep('result');

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

  const handleReset = () => {
    setStep('upload');
    setResultImage(null);
    setUploadedImage(null);
  };

  const styleOptions = [
    { value: 'professional', label: '링크드인', desc: '비즈니스 캐주얼, 밝은 배경' },
    { value: 'business', label: '비즈니스', desc: '정장, 어두운 배경' },
    { value: 'casual', label: '캐주얼', desc: '자연스러운 조명, 친근한 느낌' },
  ];

  return (
    <ServiceDetailLayout
      title="AI 프로페셔널 헤드샷"
      description="셀카를 고품질 스튜디오 사진으로 변환"
      icon="camera_alt"
      color="cyan"
    >
      {/* Intro Step */}
      {step === 'intro' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold text-foreground mb-4">
              AI 프로페셔널 헤드샷
            </h3>
            <p className="text-muted-foreground mb-4">
              평범한 셀카를 링크드인, 이력서, 사원증에 사용할 수 있는
              고품질 스튜디오 사진으로 변환합니다.
            </p>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
                <span className="material-symbols-outlined text-cyan-600 dark:text-cyan-400 text-2xl block mb-2">savings</span>
                <p className="text-sm font-medium text-foreground">비용 절감</p>
                <p className="text-xs text-muted-foreground">스튜디오 촬영 비용 절감</p>
              </div>
              <div className="p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
                <span className="material-symbols-outlined text-cyan-600 dark:text-cyan-400 text-2xl block mb-2">light_mode</span>
                <p className="text-sm font-medium text-foreground">전문 조명</p>
                <p className="text-xs text-muted-foreground">전문적인 조명과 배경</p>
              </div>
              <div className="p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
                <span className="material-symbols-outlined text-cyan-600 dark:text-cyan-400 text-2xl block mb-2">style</span>
                <p className="text-sm font-medium text-foreground">다양한 스타일</p>
                <p className="text-xs text-muted-foreground">3가지 스타일 선택</p>
              </div>
              <div className="p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
                <span className="material-symbols-outlined text-cyan-600 dark:text-cyan-400 text-2xl block mb-2">timer</span>
                <p className="text-sm font-medium text-foreground">빠른 생성</p>
                <p className="text-xs text-muted-foreground">즉시 결과 확인</p>
              </div>
            </div>
          </div>

          <div className="bg-cyan-900/20 border border-cyan-500 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-foreground font-semibold">AI 프로페셔널 헤드샷</p>
                <p className="text-muted-foreground text-sm">셀카 → 스튜디오 품질</p>
              </div>
              <div className="text-right">
                <p className="text-cyan-600 dark:text-cyan-400 font-bold text-xl">{serviceCost} 크레딧</p>
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
            className="w-full px-6 py-4 bg-cyan-600 hover:bg-cyan-700 text-foreground font-semibold rounded-lg transition-colors"
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
            {!uploadedImage ? (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-cyan-500 transition-colors"
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
                  src={uploadedImage}
                  alt="Uploaded"
                  className="w-full h-full object-cover rounded-lg"
                />
                <button
                  onClick={() => {
                    setUploadedImage(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="absolute top-2 right-2 p-2 bg-black/50 rounded-full hover:bg-black/70 transition"
                >
                  <span className="material-symbols-outlined text-foreground">close</span>
                </button>
              </div>
            )}
          </div>

          {/* Style Selection */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-foreground mb-4">스타일 선택</h3>
            <div className="grid grid-cols-1 gap-3">
              {styleOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setStyle(option.value as any)}
                  className={`p-4 rounded-lg border text-left transition ${
                    style === option.value
                      ? 'border-cyan-500 bg-cyan-500/10'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-500'
                  }`}
                >
                  <p className={`font-semibold ${style === option.value ? 'text-cyan-600 dark:text-cyan-400' : 'text-foreground'}`}>
                    {option.label}
                  </p>
                  <p className="text-sm text-muted-foreground">{option.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <ExecuteButton
            credits={serviceCost}
            currentCredits={currentCredits}
            onClick={handleExecute}
            loading={loading}
            disabled={!uploadedImage}
          />
        </div>
      )}

      {/* Result Step */}
      {step === 'result' && resultImage && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-foreground mb-4">생성된 프로필 사진</h3>
            <img
              src={resultImage}
              alt="Professional Headshot"
              className="w-full rounded-lg"
            />
          </div>

          <div className="flex gap-3">
            <a
              href={resultImage}
              download="professional-headshot.png"
              className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-foreground text-center rounded-lg transition font-semibold"
            >
              다운로드
            </a>
            <button
              onClick={handleReset}
              className="flex-1 py-3 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-foreground rounded-lg transition font-semibold"
            >
              다시 시도하기
            </button>
          </div>
        </div>
      )}
    </ServiceDetailLayout>
  );
}
