import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';
import { Loader2 } from 'lucide-react';
import ServiceDetailLayout from '../../components/ServiceDetailLayout';
import ExecuteButton from '../../components/ExecuteButton';
import { generateIdPhoto } from '../../services/ai';
import { getCurrentUser, isLoggedIn, getToken, useCredits } from '../../services/auth';
import { useSavedResult } from '../../hooks/useSavedResult';

export default function IdPhotoPage() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();

  // Check for saved result in URL
  const params = new URLSearchParams(window.location.search);
  const resultId = params.get('resultId');

  const [step, setStep] = useState<'intro' | 'upload' | 'result'>(resultId ? 'result' : 'intro');
  const [image, setImage] = useState<string | null>(null);
  const [backgroundColor, setBackgroundColor] = useState<'white' | 'blue' | 'gray'>('white');
  const [loading, setLoading] = useState(false);
  const [startingService, setStartingService] = useState(false);
  const [saving, setSaving] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [currentCredits, setCurrentCredits] = useState(0);

  // Load saved result if resultId is in URL
  const { loading: loadingSavedResult, error: savedResultError } = useSavedResult<{ imageUrl?: string; generatedImage?: string; image?: string }>((resultData) => {
    const imageUrl = resultData.imageUrl || resultData.generatedImage || resultData.image || "";
    if (imageUrl) setResultImage(imageUrl);
    setStep("result");
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const serviceCost = 25;

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

  const handleStartService = async () => {
    if (!isLoggedIn()) {
      alert('로그인이 필요한 서비스입니다. 로그인 후 이용해주세요.');
      return;
    }
    if (currentCredits < serviceCost) {
      alert(`크레딧이 부족합니다. 필요: ${serviceCost} 크레딧, 보유: ${currentCredits} 크레딧`);
      return;
    }

    setStartingService(true);
    try {
      const remaining = await useCredits('id-photo', serviceCost);
      setCurrentCredits(remaining);
      setStep('upload');
    } catch (error) {
      alert(error instanceof Error ? error.message : '서비스 시작에 실패했습니다.');
    } finally {
      setStartingService(false);
    }
  };

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
      const response = await generateIdPhoto(image, backgroundColor) as any;

      if (response.success && response.imageData) {
        const imageBase64 = `data:${response.mimeType};base64,${response.imageData}`;
        setResultImage(imageBase64);
        setStep('result');

        if (response.credits?.remaining !== undefined) {
          setCurrentCredits(response.credits.remaining);
        }
      } else {
        throw new Error(response.error || '증명사진 생성 실패');
      }
    } catch (error) {
      console.error('Error:', error);
      alert(error instanceof Error ? error.message : '증명사진 생성 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveResult = async () => {
    if (!resultImage) {
      alert('저장할 결과가 없습니다.');
      return;
    }

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
          serviceType: 'id-photo',
          inputData: {},
          resultData: { image: resultImage },
          aiModel: 'gemini',
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

  const handleReset = () => {
    setStep('upload');
    setResultImage(null);
    setImage(null);
  };

  return (
    <ServiceDetailLayout
      title={t('services.image.idPhoto.title')}
      description={t('services.image.idPhoto.description')}
      icon="badge"
      color="blue"
    >
      {loadingSavedResult && (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <span className="ml-3 text-muted-foreground">저장된 결과를 불러오는 중...</span>
        </div>
      )}

      {savedResultError && (
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 text-red-400">
          {savedResultError}
        </div>
      )}

      {/* Intro Step */}
      {!loadingSavedResult && !savedResultError && step === 'intro' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold text-foreground mb-4">
              AI 증명사진 생성
            </h3>
            <p className="text-muted-foreground mb-4">
              일반 사진을 전문적인 증명사진 형식으로 변환합니다.
              여권, 이력서, 신분증 등에 사용할 수 있습니다.
            </p>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-2xl block mb-2">crop_portrait</span>
                <p className="text-sm font-medium text-foreground">규격 맞춤</p>
                <p className="text-xs text-muted-foreground">증명사진 규격에 맞게 조정</p>
              </div>
              <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-2xl block mb-2">format_color_fill</span>
                <p className="text-sm font-medium text-foreground">배경색 선택</p>
                <p className="text-xs text-muted-foreground">흰색, 파란색, 회색</p>
              </div>
              <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-2xl block mb-2">auto_fix_high</span>
                <p className="text-sm font-medium text-foreground">자동 보정</p>
                <p className="text-xs text-muted-foreground">밝기, 대비 자동 조정</p>
              </div>
              <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-2xl block mb-2">savings</span>
                <p className="text-sm font-medium text-foreground">비용 절감</p>
                <p className="text-xs text-muted-foreground">사진관 방문 불필요</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-900/20 border border-blue-500 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-foreground font-semibold">AI 증명사진 생성</p>
                <p className="text-muted-foreground text-sm">전문 증명사진 품질</p>
              </div>
              <div className="text-right">
                <p className="text-blue-600 dark:text-blue-400 font-bold text-xl">{serviceCost} 크레딧</p>
              </div>
            </div>
          </div>

          <button
            onClick={handleStartService}
            disabled={startingService || (!isLoggedIn() ? false : currentCredits < serviceCost)}
            className={`w-full px-6 py-4 font-semibold rounded-lg transition-colors ${
              !isLoggedIn() || currentCredits >= serviceCost
                ? 'bg-blue-600 hover:bg-blue-700 text-foreground'
                : 'bg-gray-400 cursor-not-allowed text-gray-600'
            }`}
          >
            {startingService ? '처리 중...' :
              (!isLoggedIn() ? `시작하기 (${serviceCost} 크레딧)` :
                currentCredits < serviceCost
                  ? `크레딧 부족 (${currentCredits}/${serviceCost})`
                  : `시작하기 (${serviceCost} 크레딧)`)}
          </button>
        </div>
      )}

      {/* Upload Step */}
      {!loadingSavedResult && !savedResultError && step === 'upload' && (
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
                className="w-full p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 transition-colors"
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

          {/* Background Color */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-foreground mb-4">배경색 선택</h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'white', label: '흰색', color: 'bg-white' },
                { value: 'blue', label: '파란색', color: 'bg-blue-500' },
                { value: 'gray', label: '회색', color: 'bg-gray-400' }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setBackgroundColor(option.value as any)}
                  className={`p-3 rounded-lg border text-center transition ${
                    backgroundColor === option.value
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-500'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full ${option.color} mx-auto mb-2 border border-gray-300`}></div>
                  <span className={`text-sm ${backgroundColor === option.value ? 'text-blue-600 dark:text-blue-400' : 'text-foreground'}`}>
                    {option.label}
                  </span>
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
      {!loadingSavedResult && !savedResultError && step === 'result' && resultImage && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-foreground mb-4">증명사진 결과</h3>
            <img
              src={resultImage}
              alt="ID Photo Result"
              className="w-full rounded-lg"
            />
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
              다시 시도하기
            </button>
          </div>
        </div>
      )}
    </ServiceDetailLayout>
  );
}
