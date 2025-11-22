import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'wouter';
import ServiceDetailLayout from '../../components/ServiceDetailLayout';
import { analyzePetSoulmate } from '../../services/ai';
import { isLoggedIn } from '../../services/auth';
import { useSavedResult } from '../../hooks/useSavedResult';

interface PetSoulmateResult {
  animalType: string;
  breed: string;
  pastLife: {
    job: string;
    era: string;
    description: string;
  };
  mbti: string;
  mbtiDescription: string;
  ownerCompatibility: {
    score: number;
    description: string;
  };
  personalityTraits: string[];
  funComment: string;
}

export default function PetSoulmatePage() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<'intro' | 'upload' | 'result'>('intro');
  const [imagePreview, setImagePreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PetSoulmateResult | null>(null);
  const [error, setError] = useState<string>('');

  // Load saved result if resultId is in URL
  useSavedResult<any>((resultData) => {
    setResult(resultData);
    setStep("result");
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleStartTest = () => {
    if (!isLoggedIn()) {
      alert('로그인이 필요한 서비스입니다. 로그인 후 이용해주세요.');
      return;
    }
    setStep('upload');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('이미지 파일만 업로드 가능합니다.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target?.result as string);
      setError('');
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!imagePreview) {
      setError('이미지를 먼저 업로드해주세요.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await analyzePetSoulmate(imagePreview) as any;

      if (response.success) {
        setResult(response.analysis);
        setStep('result');
      } else {
        setError(response.error || '분석에 실패했습니다.');
      }
    } catch (err: any) {
      console.error('Pet soulmate analysis error:', err);
      setError(err.message || '분석 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep('upload');
    setImagePreview('');
    setResult(null);
    setError('');
  };

  const getCompatibilityColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-orange-400';
  };

  return (
    <ServiceDetailLayout
      title="AI 반려동물 소울메이트"
      description="우리 아이의 전생과 MBTI를 알아보세요"
      icon="pets"
      color="orange"
    >
      {/* Introduction */}
      {step === 'intro' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-foreground mb-4">
              우리 아이의 소울메이트 분석
            </h3>
            <div className="space-y-4 text-muted-foreground">
              <p>
                AI가 반려동물의 사진을 분석하여 전생, MBTI, 성격 특성을 알아냅니다.
                당신과 반려동물의 궁합도 확인해보세요!
              </p>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="p-4 rounded-lg bg-orange-500/20 border border-orange-500">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-orange-400">history</span>
                    <span className="font-semibold text-orange-400">전생 분석</span>
                  </div>
                  <p className="text-sm opacity-80">어떤 시대의 어떤 직업이었을까요?</p>
                </div>
                <div className="p-4 rounded-lg bg-orange-500/20 border border-orange-500">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-orange-400">psychology</span>
                    <span className="font-semibold text-orange-400">MBTI 분석</span>
                  </div>
                  <p className="text-sm opacity-80">반려동물의 성격 유형은?</p>
                </div>
                <div className="p-4 rounded-lg bg-orange-500/20 border border-orange-500">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-orange-400">favorite</span>
                    <span className="font-semibold text-orange-400">궁합 점수</span>
                  </div>
                  <p className="text-sm opacity-80">주인과의 궁합은 몇 점?</p>
                </div>
                <div className="p-4 rounded-lg bg-orange-500/20 border border-orange-500">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-orange-400">star</span>
                    <span className="font-semibold text-orange-400">성격 특성</span>
                  </div>
                  <p className="text-sm opacity-80">숨겨진 성격을 알아보세요</p>
                </div>
              </div>
            </div>

            <div className="bg-orange-900/20 border border-orange-500 rounded-lg p-4 mt-6 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-foreground font-semibold">AI 반려동물 소울메이트</p>
                  <p className="text-muted-foreground text-sm">전생 + MBTI + 궁합 분석</p>
                </div>
                <div className="text-right">
                  <p className="text-orange-400 font-bold text-xl">15 크레딧</p>
                </div>
              </div>
            </div>

            <button
              onClick={handleStartTest}
              className="w-full px-6 py-4 bg-orange-600 hover:bg-orange-700 text-foreground font-semibold rounded-lg transition-colors"
            >
              시작하기 (15 크레딧)
            </button>
          </div>
        </div>
      )}

      {/* Upload */}
      {step === 'upload' && !loading && (
        <div className="space-y-6">
          {/* Image Upload */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">반려동물 사진 업로드</h3>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />

            {imagePreview ? (
              <div className="space-y-4">
                <div className="relative aspect-square max-w-sm mx-auto">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-2 right-2 p-2 bg-white dark:bg-gray-800/80 rounded-lg hover:bg-gray-700"
                  >
                    <span className="material-symbols-outlined text-foreground">refresh</span>
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-orange-500 transition-colors"
              >
                <span className="material-symbols-outlined text-4xl text-muted-foreground block mb-2">add_photo_alternate</span>
                <span className="text-muted-foreground">클릭하여 사진 업로드</span>
              </button>
            )}

            <p className="text-gray-500 text-sm mt-3 text-center">
              반려동물의 얼굴이 잘 보이는 사진을 업로드하면 더 정확한 결과를 얻을 수 있습니다.
            </p>
          </div>

          {/* Analyze Button */}
          <button
            onClick={handleAnalyze}
            disabled={!imagePreview}
            className={`w-full px-6 py-4 font-semibold rounded-lg transition-colors ${
              imagePreview
                ? 'bg-orange-600 hover:bg-orange-700 text-foreground'
                : 'bg-gray-600 text-muted-foreground cursor-not-allowed'
            }`}
          >
            분석하기
          </button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground">AI가 반려동물을 분석하고 있습니다...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 text-red-400">
          {error}
        </div>
      )}

      {/* Results */}
      {step === 'result' && result && (
        <div className="space-y-6">
          {/* Fun Comment */}
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg p-6">
            <p className="text-xl text-white font-semibold text-center">
              "{result.funComment}"
            </p>
          </div>

          {/* Animal Info */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-foreground mb-4">기본 정보</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-muted-foreground text-sm">동물 종류</p>
                <p className="text-foreground text-lg font-semibold">{result.animalType}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">품종</p>
                <p className="text-foreground text-lg font-semibold">{result.breed}</p>
              </div>
            </div>
          </div>

          {/* Past Life */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-foreground mb-4">
              <span className="material-symbols-outlined align-middle mr-2 text-orange-400">history</span>
              전생 분석
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-muted-foreground text-sm">시대</p>
                  <p className="text-foreground font-semibold">{result.pastLife.era}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">직업</p>
                  <p className="text-orange-400 font-semibold">{result.pastLife.job}</p>
                </div>
              </div>
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-muted-foreground">{result.pastLife.description}</p>
              </div>
            </div>
          </div>

          {/* MBTI */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-foreground mb-4">
              <span className="material-symbols-outlined align-middle mr-2 text-orange-400">psychology</span>
              MBTI 분석
            </h3>
            <div className="text-center mb-4">
              <span className="text-4xl font-bold text-orange-400">{result.mbti}</span>
            </div>
            <p className="text-muted-foreground">{result.mbtiDescription}</p>
          </div>

          {/* Owner Compatibility */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-foreground mb-4">
              <span className="material-symbols-outlined align-middle mr-2 text-orange-400">favorite</span>
              주인과의 궁합
            </h3>
            <div className="text-center mb-4">
              <span className={`text-5xl font-bold ${getCompatibilityColor(result.ownerCompatibility.score)}`}>
                {result.ownerCompatibility.score}%
              </span>
            </div>
            <p className="text-muted-foreground text-center">{result.ownerCompatibility.description}</p>
          </div>

          {/* Personality Traits */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-foreground mb-4">
              <span className="material-symbols-outlined align-middle mr-2 text-orange-400">star</span>
              성격 특성
            </h3>
            <div className="flex flex-wrap gap-2">
              {result.personalityTraits.map((trait, index) => (
                <span
                  key={index}
                  className="px-3 py-2 bg-orange-500/20 text-orange-400 rounded-lg text-sm font-medium"
                >
                  {trait}
                </span>
              ))}
            </div>
          </div>

          {/* Try Again */}
          <button
            onClick={handleReset}
            className="w-full px-6 py-4 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-foreground font-semibold rounded-lg transition-colors"
          >
            다른 사진으로 다시 분석하기
          </button>
        </div>
      )}
    </ServiceDetailLayout>
  );
}
