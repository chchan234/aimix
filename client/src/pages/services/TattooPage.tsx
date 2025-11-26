import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';
import { Loader2 } from 'lucide-react';
import ServiceDetailLayout from '../../components/ServiceDetailLayout';
import ExecuteButton from '../../components/ExecuteButton';
import { addTattoo } from '../../services/ai';
import { getCurrentUser, isLoggedIn, getToken, useCredits } from '../../services/auth';
import { useSavedResult } from '../../hooks/useSavedResult';

export default function TattooPage() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();

  // Check for saved result in URL
  const params = new URLSearchParams(window.location.search);
  const resultId = params.get('resultId');

  const [step, setStep] = useState<'intro' | 'upload' | 'result'>(resultId ? 'result' : 'intro');
  const [image, setImage] = useState<string | null>(null);
  const [tattooDescription, setTattooDescription] = useState('');
  const [placement, setPlacement] = useState('');
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
      const remaining = await useCredits('tattoo', serviceCost);
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

    if (!tattooDescription.trim()) {
      alert('타투 디자인을 입력해주세요.');
      return;
    }

    if (!placement.trim()) {
      alert('타투 위치를 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      const response = await addTattoo(image, tattooDescription, placement) as any;

      if (response.success && response.imageData) {
        const imageBase64 = `data:${response.mimeType};base64,${response.imageData}`;
        setResultImage(imageBase64);
        setStep('result');

        if (response.credits?.remaining !== undefined) {
          setCurrentCredits(response.credits.remaining);
        }
      } else {
        throw new Error(response.error || '타투 시뮬레이션 실패');
      }
    } catch (error) {
      console.error('Error:', error);
      alert(error instanceof Error ? error.message : '타투 시뮬레이션 중 오류가 발생했습니다.');
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
          serviceType: 'tattoo-simulation',
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
    setTattooDescription('');
    setPlacement('');
  };

  return (
    <ServiceDetailLayout
      title={t('services.image.tattoo.title')}
      description={t('services.image.tattoo.description')}
      icon="brush"
      color="teal"
    >
      {loadingSavedResult && (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
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
              AI 타투 시뮬레이션
            </h3>
            <p className="text-muted-foreground mb-4">
              사진에 원하는 타투 디자인을 미리 시뮬레이션합니다.
              실제 타투를 하기 전에 다양한 디자인과 위치를 테스트해보세요.
            </p>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="p-4 rounded-lg bg-teal-500/10 border border-teal-500/30">
                <span className="material-symbols-outlined text-teal-600 dark:text-teal-400 text-2xl block mb-2">design_services</span>
                <p className="text-sm font-medium text-foreground">다양한 디자인</p>
                <p className="text-xs text-muted-foreground">용, 꽃, 문양 등</p>
              </div>
              <div className="p-4 rounded-lg bg-teal-500/10 border border-teal-500/30">
                <span className="material-symbols-outlined text-teal-600 dark:text-teal-400 text-2xl block mb-2">location_on</span>
                <p className="text-sm font-medium text-foreground">위치 선택</p>
                <p className="text-xs text-muted-foreground">팔, 등, 어깨 등</p>
              </div>
              <div className="p-4 rounded-lg bg-teal-500/10 border border-teal-500/30">
                <span className="material-symbols-outlined text-teal-600 dark:text-teal-400 text-2xl block mb-2">preview</span>
                <p className="text-sm font-medium text-foreground">미리보기</p>
                <p className="text-xs text-muted-foreground">시술 전 확인</p>
              </div>
              <div className="p-4 rounded-lg bg-teal-500/10 border border-teal-500/30">
                <span className="material-symbols-outlined text-teal-600 dark:text-teal-400 text-2xl block mb-2">verified</span>
                <p className="text-sm font-medium text-foreground">안전한 테스트</p>
                <p className="text-xs text-muted-foreground">부담 없이 테스트</p>
              </div>
            </div>
          </div>

          <div className="bg-teal-900/20 border border-teal-500 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-foreground font-semibold">AI 타투 시뮬레이션</p>
                <p className="text-muted-foreground text-sm">원하는 타투 미리보기</p>
              </div>
              <div className="text-right">
                <p className="text-teal-600 dark:text-teal-400 font-bold text-xl">{serviceCost} 크레딧</p>
              </div>
            </div>
          </div>

          <button
            onClick={handleStartService}
            disabled={startingService || (!isLoggedIn() ? false : currentCredits < serviceCost)}
            className={`w-full px-6 py-4 font-semibold rounded-lg transition-colors ${
              !isLoggedIn() || currentCredits >= serviceCost
                ? 'bg-teal-600 hover:bg-teal-700 text-foreground'
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
                className="w-full p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-teal-500 transition-colors"
              >
                <span className="material-symbols-outlined text-4xl text-muted-foreground block mb-2">
                  add_photo_alternate
                </span>
                <span className="text-muted-foreground">클릭하여 사진 업로드</span>
                <p className="text-gray-500 text-sm mt-1">타투를 적용할 부위가 보이는 사진</p>
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

          {/* Tattoo Design */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-foreground mb-4">타투 디자인</h3>
            <input
              type="text"
              value={tattooDescription}
              onChange={(e) => setTattooDescription(e.target.value)}
              placeholder="예: 용 타투, 꽃 타투, 부족 문양 등"
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-foreground placeholder-gray-400 focus:outline-none focus:border-teal-500"
            />
          </div>

          {/* Tattoo Placement */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-foreground mb-4">타투 위치</h3>
            <input
              type="text"
              value={placement}
              onChange={(e) => setPlacement(e.target.value)}
              placeholder="예: 팔, 등, 어깨, 손목 등"
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-foreground placeholder-gray-400 focus:outline-none focus:border-teal-500"
            />
          </div>

          <ExecuteButton
            credits={serviceCost}
            currentCredits={currentCredits}
            onClick={handleExecute}
            loading={loading}
            disabled={!image || !tattooDescription.trim() || !placement.trim()}
          />
        </div>
      )}

      {/* Result Step */}
      {!loadingSavedResult && !savedResultError && step === 'result' && resultImage && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-foreground mb-4">타투 시뮬레이션 결과</h3>
            <img
              src={resultImage}
              alt="Tattoo Simulation Result"
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
