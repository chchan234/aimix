import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';
import ServiceDetailLayout from '../../components/ServiceDetailLayout';
import ExecuteButton from '../../components/ExecuteButton';
import { analyzePalmistry } from '../../services/ai';
import { getCurrentUser, isLoggedIn } from '../../services/auth';

export default function PalmistryPage() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const [hand, setHand] = useState<'left' | 'right'>('right');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
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
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleExecute = async () => {
    if (!imagePreview) {
      alert('손바닥 이미지를 업로드해주세요.');
      return;
    }

    setLoading(true);
    try {
      const response = await analyzePalmistry(imagePreview, hand) as any;
      setResult(response);

      if (response.credits?.remaining !== undefined) {
        setCurrentCredits(response.credits.remaining);
      }
    } catch (error) {
      console.error('Error:', error);
      alert(error instanceof Error ? error.message : '분석 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ServiceDetailLayout
      title={t('services.fortune.palmistry.title')}
      description={t('services.fortune.palmistry.description')}
      icon="back_hand"
      color="green"
    >
      <div className="space-y-6">
        <div className="bg-gray-50 dark:bg-[#0d0d0d] rounded-lg p-4 border border-green-500/20">
          <h3 className="text-foreground font-semibold mb-2">서비스 안내</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            손바닥 사진을 업로드하면 AI가 손금을 분석하여 운세와 성격을 알려드립니다.
            생명선, 운명선, 감정선, 지능선, 재물선, 결혼선, 태양선을 포함한 종합 분석을 제공합니다.
          </p>
        </div>

        {!result && (
          <div className="space-y-4">
            <div>
              <label className="block text-foreground font-medium mb-2">
                손 선택
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="hand"
                    value="right"
                    checked={hand === 'right'}
                    onChange={(e) => setHand(e.target.value as 'right')}
                    className="w-4 h-4 text-green-600"
                  />
                  <span className="text-foreground">오른손</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="hand"
                    value="left"
                    checked={hand === 'left'}
                    onChange={(e) => setHand(e.target.value as 'left')}
                    className="w-4 h-4 text-green-600"
                  />
                  <span className="text-foreground">왼손</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-foreground font-medium mb-2">
                손바닥 이미지 업로드
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0d0d0d] border border-gray-300 dark:border-gray-600 rounded-lg text-foreground hover:border-green-500 transition"
              >
                {imagePreview ? '이미지 변경하기' : '이미지 선택하기'}
              </button>
              <p className="text-muted-foreground text-xs mt-1">
                손바닥이 선명하게 보이는 사진을 업로드해주세요
              </p>
            </div>

            {imagePreview && (
              <div className="rounded-lg overflow-hidden border border-green-500/20">
                <img
                  src={imagePreview}
                  alt="Hand preview"
                  className="w-full h-auto"
                />
              </div>
            )}

            <ExecuteButton
              credits={serviceCost}
              currentCredits={currentCredits}
              onClick={handleExecute}
              loading={loading}
              disabled={!imagePreview}
            />
          </div>
        )}

        {/* Result Display */}
        {result?.analysis && (
          <div className="space-y-4 animate-fadeIn">
            <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/20">
              <h3 className="text-foreground font-semibold mb-3">🖐 수상 분석 결과</h3>

              {result.analysis.handShape && (
                <div className="mb-4 pb-4 border-b border-green-500/10">
                  <h4 className="text-green-400 font-medium mb-2">손 모양</h4>
                  <p className="text-foreground text-sm mb-1">{result.analysis.handShape.type}</p>
                  <p className="text-muted-foreground text-sm">{result.analysis.handShape.description}</p>
                </div>
              )}

              {result.analysis.majorLines && (
                <div className="space-y-3">
                  <h4 className="text-green-400 font-medium">주요 손금 분석</h4>
                  {Object.entries(result.analysis.majorLines).map(([key, value]: [string, any]) => (
                    <div key={key} className="bg-gray-50 dark:bg-[#0d0d0d] p-3 rounded">
                      <p className="text-foreground font-medium text-sm mb-1">{value.description}</p>
                      <p className="text-muted-foreground text-xs">{value.fortune}</p>
                    </div>
                  ))}
                </div>
              )}

              {result.analysis.advice && result.analysis.advice.length > 0 && (
                <div className="mt-4 pt-4 border-t border-green-500/10">
                  <h4 className="text-green-400 font-medium mb-2">조언</h4>
                  <ul className="space-y-1">
                    {result.analysis.advice.map((item: string, idx: number) => (
                      <li key={idx} className="text-muted-foreground text-sm">• {item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                setResult(null);
                setImagePreview(null);
              }}
              className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-foreground rounded-lg transition"
            >
              다시 분석하기
            </button>
          </div>
        )}
      </div>
    </ServiceDetailLayout>
  );
}
