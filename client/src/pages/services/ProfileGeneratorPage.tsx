import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import ServiceDetailLayout from '../../components/ServiceDetailLayout';
import ExecuteButton from '../../components/ExecuteButton';
import { generateProfessionalHeadshot } from '../../services/ai';
import { getCurrentUser, isLoggedIn } from '../../services/auth';

export default function ProfileGeneratorPage() {
  const [, setLocation] = useLocation();
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [style, setStyle] = useState<'professional' | 'business' | 'casual'>('professional');
  const [loading, setLoading] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [currentCredits, setCurrentCredits] = useState(0);
  const [showIntro, setShowIntro] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const serviceCost = 35;

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
    setResultImage(null);
    setUploadedImage(null);
  };

  const styleOptions = [
    { value: 'professional', label: '링크드인', desc: '비즈니스 캐주얼, 밝은 배경' },
    { value: 'business', label: '비즈니스', desc: '정장, 어두운 배경' },
    { value: 'casual', label: '캐주얼', desc: '자연스러운 조명, 친근한 느낌' },
  ];

  if (showIntro) {
    return (
      <ServiceDetailLayout
        title="AI 프로페셔널 헤드샷"
        description="셀카를 고품질 스튜디오 사진으로 변환"
        icon="camera_alt"
        color="cyan"
      >
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-xl p-6 border border-cyan-500/30">
            <h3 className="text-white text-xl font-bold mb-4">AI 프로페셔널 헤드샷</h3>
            <p className="text-[#ab9eb7] leading-relaxed mb-4">
              평범한 셀카를 링크드인, 이력서, 사원증에 사용할 수 있는
              고품질 스튜디오 사진으로 변환합니다.
            </p>
            <ul className="space-y-2 text-sm text-[#ab9eb7]">
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-cyan-400 text-lg">check_circle</span>
                스튜디오 촬영 비용 절감
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-cyan-400 text-lg">check_circle</span>
                전문적인 조명과 배경 적용
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-cyan-400 text-lg">check_circle</span>
                3가지 스타일 선택 가능
              </li>
            </ul>
          </div>

          <div className="bg-background-dark rounded-lg p-4 border border-gray-700">
            <p className="text-[#ab9eb7] text-sm">
              <span className="text-cyan-400 font-semibold">{serviceCost} 크레딧</span>이 필요합니다
            </p>
          </div>

          <button
            onClick={() => setShowIntro(false)}
            className="w-full py-4 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-lg transition"
          >
            시작하기
          </button>
        </div>
      </ServiceDetailLayout>
    );
  }

  return (
    <ServiceDetailLayout
      title="AI 프로페셔널 헤드샷"
      description="셀카를 고품질 스튜디오 사진으로 변환"
      icon="camera_alt"
      color="cyan"
    >
      <div className="space-y-6">
        {!resultImage && (
          <>
            {/* Image Upload */}
            <div>
              <label className="block text-white font-medium mb-3">사진 업로드</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                ref={fileInputRef}
                className="hidden"
              />
              {!uploadedImage ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-600 rounded-xl p-8 text-center cursor-pointer hover:border-cyan-500 transition"
                >
                  <span className="material-symbols-outlined text-5xl text-gray-500 mb-3">
                    add_photo_alternate
                  </span>
                  <p className="text-[#ab9eb7]">클릭하여 사진 업로드</p>
                  <p className="text-gray-500 text-sm mt-1">정면 얼굴 사진 권장</p>
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={uploadedImage}
                    alt="Uploaded"
                    className="w-full rounded-xl"
                  />
                  <button
                    onClick={() => {
                      setUploadedImage(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="absolute top-2 right-2 p-2 bg-black/50 rounded-full hover:bg-black/70 transition"
                  >
                    <span className="material-symbols-outlined text-white">close</span>
                  </button>
                </div>
              )}
            </div>

            {/* Style Selection */}
            <div>
              <label className="block text-white font-medium mb-3">스타일 선택</label>
              <div className="grid grid-cols-1 gap-3">
                {styleOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setStyle(option.value as any)}
                    className={`p-4 rounded-lg border text-left transition ${
                      style === option.value
                        ? 'border-cyan-500 bg-cyan-500/10'
                        : 'border-gray-600 hover:border-gray-500'
                    }`}
                  >
                    <p className={`font-semibold ${style === option.value ? 'text-cyan-400' : 'text-white'}`}>
                      {option.label}
                    </p>
                    <p className="text-sm text-[#ab9eb7]">{option.desc}</p>
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
          </>
        )}

        {resultImage && (
          <div className="space-y-4 animate-fadeIn">
            <div className="bg-cyan-500/10 rounded-xl p-4 border border-cyan-500/20">
              <h3 className="text-white font-semibold mb-3">생성된 프로필 사진</h3>
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
                className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white text-center rounded-lg transition"
              >
                다운로드
              </a>
              <button
                onClick={handleReset}
                className="flex-1 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition"
              >
                다시 생성
              </button>
            </div>
          </div>
        )}
      </div>
    </ServiceDetailLayout>
  );
}
