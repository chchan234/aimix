import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'wouter';
import ServiceDetailLayout from '../../components/ServiceDetailLayout';
import { generateBabyFace } from '../../services/ai';
import { isLoggedIn, getToken } from '../../services/auth';

export default function BabyFacePage() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<'intro' | 'upload' | 'result'>('intro');
  const [parent1Image, setParent1Image] = useState<string>('');
  const [parent2Image, setParent2Image] = useState<string>('');
  const [style, setStyle] = useState<'normal' | 'idol'>('normal');
  const [loading, setLoading] = useState(false);
  const [resultImage, setResultImage] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [aiModel, setAiModel] = useState<string | undefined>();
  const parent1InputRef = useRef<HTMLInputElement>(null);
  const parent2InputRef = useRef<HTMLInputElement>(null);

  // Image compression function to reduce payload size
  const compressImage = (base64: string, maxWidth: number = 800, quality: number = 0.7): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Scale down if larger than maxWidth
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        // Also limit height to maintain reasonable aspect ratio
        if (height > maxWidth) {
          width = (width * maxWidth) / height;
          height = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = base64;
    });
  };

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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, parent: 1 | 2) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('이미지 파일만 업로드 가능합니다.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const originalBase64 = event.target?.result as string;

      // Compress image to reduce payload size (max 800x800, quality 0.7)
      const compressedBase64 = await compressImage(originalBase64, 800, 0.7);

      if (parent === 1) {
        setParent1Image(compressedBase64);
      } else {
        setParent2Image(compressedBase64);
      }
      setError('');
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!parent1Image || !parent2Image) {
      setError('두 부모의 사진을 모두 업로드해주세요.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await generateBabyFace(parent1Image, parent2Image, style) as any;

      if (response.success && response.imageData) {
        const imageBase64 = `data:${response.mimeType};base64,${response.imageData}`;
        setResultImage(imageBase64);
        setAiModel(response.model);
        setStep('result');
      } else {
        setError(response.error || '아이 얼굴 예측에 실패했습니다.');
      }
    } catch (err: any) {
      console.error('Baby face prediction error:', err);
      setError(err.message || '예측 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep('upload');
    setParent1Image('');
    setParent2Image('');
    setResultImage('');
    setStyle('normal');
    setError('');
  };

  const handleSaveResult = async () => {
    if (!resultImage) return;

    try {
      setSaving(true);
      const token = getToken();
      if (!token) {
        alert('로그인이 필요합니다.');
        setLocation('/login');
        return;
      }

      const response = await fetch('/api/results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          serviceType: 'baby-face',
          inputData: { style },
          resultData: { image: resultImage },
          aiModel,
          tokensUsed: 0,
          processingTime: 0,
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          alert('로그인이 필요합니다.');
          setLocation('/login');
          return;
        }
        throw new Error('Failed to save result');
      }

      alert('결과가 저장되었습니다! "내 결과물"에서 확인할 수 있습니다.');
    } catch (error) {
      console.error('Error saving result:', error);
      alert('결과 저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ServiceDetailLayout
      title="2세 얼굴 예측"
      description="미래 아이의 얼굴을 예측해보세요"
      icon="child_care"
      color="pink"
    >
      {/* Introduction */}
      {step === 'intro' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-foreground mb-4">
              미래 아이의 얼굴을 만나보세요
            </h3>
            <div className="space-y-4 text-muted-foreground">
              <p>
                두 부모의 얼굴 사진을 업로드하면 AI가 미래 아이의 얼굴을 예측합니다.
              </p>

              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="p-4 rounded-lg bg-pink-500/20 border border-pink-500">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-pink-400">face</span>
                    <span className="font-semibold text-pink-400">얼굴 분석</span>
                  </div>
                  <p className="text-sm opacity-80">두 부모의 얼굴 특징을 AI가 분석</p>
                </div>
                <div className="p-4 rounded-lg bg-pink-500/20 border border-pink-500">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-pink-400">psychology</span>
                    <span className="font-semibold text-pink-400">유전 예측</span>
                  </div>
                  <p className="text-sm opacity-80">유전적 특성을 반영한 예측</p>
                </div>
                <div className="p-4 rounded-lg bg-pink-500/20 border border-pink-500">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-pink-400">auto_awesome</span>
                    <span className="font-semibold text-pink-400">스타일 선택</span>
                  </div>
                  <p className="text-sm opacity-80">일반 또는 아이돌 버전 선택</p>
                </div>
                <div className="p-4 rounded-lg bg-pink-500/20 border border-pink-500">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-pink-400">image</span>
                    <span className="font-semibold text-pink-400">고품질 결과</span>
                  </div>
                  <p className="text-sm opacity-80">자연스럽고 귀여운 아이 얼굴</p>
                </div>
              </div>
            </div>

            <div className="bg-pink-50 dark:bg-pink-900/20 border border-pink-500 rounded-lg p-4 mt-6 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-foreground font-semibold">2세 얼굴 예측</p>
                  <p className="text-muted-foreground text-sm">AI 유전 분석 + 얼굴 합성</p>
                </div>
                <div className="text-right">
                  <p className="text-pink-400 font-bold text-xl">50 크레딧</p>
                </div>
              </div>
            </div>

            <button
              onClick={handleStartTest}
              className="w-full px-6 py-4 bg-pink-600 hover:bg-pink-700 text-white font-semibold rounded-lg transition-colors"
            >
              시작하기 (50 크레딧)
            </button>
          </div>
        </div>
      )}

      {/* Upload */}
      {step === 'upload' && !loading && (
        <div className="space-y-6">
          {/* Parent Images Upload */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">부모 사진 업로드</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Parent 1 */}
              <div>
                <p className="text-muted-foreground text-sm mb-2">부모 1</p>
                <input
                  type="file"
                  ref={parent1InputRef}
                  onChange={(e) => handleImageUpload(e, 1)}
                  accept="image/*"
                  className="hidden"
                />

                {parent1Image ? (
                  <div className="relative aspect-square">
                    <img
                      src={parent1Image}
                      alt="Parent 1"
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <button
                      onClick={() => parent1InputRef.current?.click()}
                      className="absolute bottom-2 right-2 p-2 bg-white dark:bg-gray-800/80 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <span className="material-symbols-outlined text-foreground">refresh</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => parent1InputRef.current?.click()}
                    className="w-full aspect-square border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-pink-500 transition-colors flex flex-col items-center justify-center"
                  >
                    <span className="material-symbols-outlined text-3xl text-muted-foreground mb-2">add_photo_alternate</span>
                    <span className="text-muted-foreground text-sm">클릭하여 업로드</span>
                  </button>
                )}
              </div>

              {/* Parent 2 */}
              <div>
                <p className="text-muted-foreground text-sm mb-2">부모 2</p>
                <input
                  type="file"
                  ref={parent2InputRef}
                  onChange={(e) => handleImageUpload(e, 2)}
                  accept="image/*"
                  className="hidden"
                />

                {parent2Image ? (
                  <div className="relative aspect-square">
                    <img
                      src={parent2Image}
                      alt="Parent 2"
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <button
                      onClick={() => parent2InputRef.current?.click()}
                      className="absolute bottom-2 right-2 p-2 bg-white dark:bg-gray-800/80 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <span className="material-symbols-outlined text-foreground">refresh</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => parent2InputRef.current?.click()}
                    className="w-full aspect-square border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-pink-500 transition-colors flex flex-col items-center justify-center"
                  >
                    <span className="material-symbols-outlined text-3xl text-muted-foreground mb-2">add_photo_alternate</span>
                    <span className="text-muted-foreground text-sm">클릭하여 업로드</span>
                  </button>
                )}
              </div>
            </div>

            <p className="text-gray-500 text-sm mt-3 text-center">
              정면 얼굴이 잘 보이는 사진을 업로드해주세요
            </p>
          </div>

          {/* Style Selection */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">스타일 선택</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setStyle('normal')}
                className={`p-4 rounded-lg border transition-all ${
                  style === 'normal'
                    ? 'bg-pink-500/20 text-pink-400 border-pink-500'
                    : 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-muted-foreground hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <span className="material-symbols-outlined text-2xl block mb-1">child_care</span>
                <span className="text-sm font-medium">일반</span>
              </button>
              <button
                onClick={() => setStyle('idol')}
                className={`p-4 rounded-lg border transition-all ${
                  style === 'idol'
                    ? 'bg-pink-500/20 text-pink-400 border-pink-500'
                    : 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-muted-foreground hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <span className="material-symbols-outlined text-2xl block mb-1">star</span>
                <span className="text-sm font-medium">아이돌 버전</span>
              </button>
            </div>
          </div>

          {/* Analyze Button */}
          <button
            onClick={handleAnalyze}
            disabled={!parent1Image || !parent2Image}
            className={`w-full px-6 py-4 font-semibold rounded-lg transition-colors ${
              parent1Image && parent2Image
                ? 'bg-pink-600 hover:bg-pink-700 text-white'
                : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-muted-foreground cursor-not-allowed'
            }`}
          >
            예측하기
          </button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground">AI가 미래 아이의 얼굴을 예측하고 있습니다...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 text-red-400">
          {error}
        </div>
      )}

      {/* Results */}
      {step === 'result' && resultImage && (
        <div className="space-y-6">
          {/* Result Image */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-foreground mb-4 text-center">
              예측된 아이 얼굴 {style === 'idol' ? '(아이돌 버전)' : ''}
            </h3>
            <div className="max-w-sm mx-auto">
              <img
                src={resultImage}
                alt="Predicted Baby Face"
                className="w-full rounded-lg"
              />
            </div>
          </div>

          {/* Info */}
          <div className="bg-pink-900/20 border border-pink-500 rounded-lg p-4">
            <p className="text-muted-foreground text-sm text-center">
              이 결과는 AI가 예측한 것으로, 실제와 다를 수 있습니다.
              재미로만 참고해주세요!
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleSaveResult}
              disabled={saving}
              className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <span className="material-symbols-outlined animate-spin">progress_activity</span>
                  저장 중...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">save</span>
                  결과 저장하기
                </>
              )}
            </button>

            <button
              onClick={handleReset}
              className="w-full px-6 py-4 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-foreground font-semibold rounded-lg transition-colors"
            >
              다시 예측하기
            </button>
          </div>
        </div>
      )}
    </ServiceDetailLayout>
  );
}
