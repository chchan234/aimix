import { useState, useRef } from 'react';
import ServiceDetailLayout from '../../components/ServiceDetailLayout';
import { findLookalike } from '../../services/ai';

type Category = 'celebrity' | 'anime' | 'animal';

interface Match {
  name: string;
  similarity: number;
  reason: string;
  characteristics: string[];
}

interface Analysis {
  matches: Match[];
  faceAnalysis: {
    faceShape: string;
    eyeType: string;
    noseType: string;
    lipType: string;
    overallImpression: string;
  };
  funComment: string;
}

const CATEGORY_INFO = {
  celebrity: {
    name: '연예인',
    icon: 'star',
    color: 'purple',
    description: 'K-pop 아이돌, 배우, 가수'
  },
  anime: {
    name: '애니 캐릭터',
    icon: 'smart_toy',
    color: 'blue',
    description: '디즈니, 지브리, 일본 애니메이션'
  },
  animal: {
    name: '동물',
    icon: 'pets',
    color: 'green',
    description: '강아지, 고양이, 야생동물'
  }
};

export default function LookalikePage() {
  const [step, setStep] = useState<'intro' | 'upload' | 'result'>('intro');
  const [selectedCategory, setSelectedCategory] = useState<Category>('celebrity');
  const [imagePreview, setImagePreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Analysis | null>(null);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleStartTest = () => {
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
      const response = await findLookalike(imagePreview, selectedCategory) as any;

      if (response.success) {
        setResult(response.analysis);
        setStep('result');
      } else {
        setError(response.error || '분석에 실패했습니다.');
      }
    } catch (err: any) {
      console.error('Lookalike analysis error:', err);
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

  const getSimilarityColor = (similarity: number) => {
    if (similarity >= 80) return 'text-green-400';
    if (similarity >= 60) return 'text-yellow-400';
    return 'text-orange-400';
  };

  const getCategoryColorClass = (category: Category) => {
    const colors = {
      celebrity: 'bg-purple-500/20 text-purple-400 border-purple-500',
      anime: 'bg-blue-500/20 text-blue-400 border-blue-500',
      animal: 'bg-green-500/20 text-green-400 border-green-500'
    };
    return colors[category];
  };

  return (
    <ServiceDetailLayout
      title="AI 닮은꼴 찾기"
      description="나와 닮은 연예인, 캐릭터, 동물 찾기"
      icon="compare"
      color="pink"
    >
      {/* Introduction */}
      {step === 'intro' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined text-3xl text-pink-400">compare</span>
              <h3 className="text-xl font-semibold text-foreground">
                AI 닮은꼴 찾기
              </h3>
            </div>
            <p className="text-muted-foreground mb-6">
              AI가 당신의 얼굴을 분석하여 닮은꼴을 찾아드립니다.
              연예인, 애니 캐릭터, 동물 중 원하는 카테고리를 선택하세요!
            </p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-pink-400">star</span>
                  <span className="text-foreground font-medium">연예인</span>
                </div>
                <p className="text-muted-foreground text-sm">K-pop 아이돌, 배우</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-pink-400">smart_toy</span>
                  <span className="text-foreground font-medium">애니 캐릭터</span>
                </div>
                <p className="text-muted-foreground text-sm">디즈니, 지브리, 애니</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-pink-400">pets</span>
                  <span className="text-foreground font-medium">동물</span>
                </div>
                <p className="text-muted-foreground text-sm">강아지, 고양이, 야생</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-pink-400">face</span>
                  <span className="text-foreground font-medium">얼굴 분석</span>
                </div>
                <p className="text-muted-foreground text-sm">눈, 코, 입, 얼굴형</p>
              </div>
            </div>

            <div className="bg-pink-900/20 border border-pink-500 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-foreground font-semibold">AI 닮은꼴 찾기</p>
                  <p className="text-muted-foreground text-sm">얼굴 분석 + AI 매칭</p>
                </div>
                <div className="text-right">
                  <p className="text-pink-400 font-bold text-xl">20 크레딧</p>
                </div>
              </div>
            </div>

            <button
              onClick={handleStartTest}
              className="w-full px-6 py-4 bg-pink-600 hover:bg-pink-700 text-foreground font-semibold rounded-lg transition-colors"
            >
              시작하기 (20 크레딧)
            </button>
          </div>
        </div>
      )}

      {/* Upload */}
      {step === 'upload' && !loading && (
        <div className="space-y-6">
          {/* Category Selection */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">카테고리 선택</h3>
            <div className="grid grid-cols-3 gap-3">
              {(Object.entries(CATEGORY_INFO) as [Category, typeof CATEGORY_INFO.celebrity][]).map(([key, info]) => (
                <button
                  key={key}
                  onClick={() => setSelectedCategory(key)}
                  className={`p-3 rounded-lg border transition-all ${
                    selectedCategory === key
                      ? getCategoryColorClass(key)
                      : 'bg-gray-700 border-gray-300 dark:border-gray-600 text-muted-foreground hover:bg-gray-100 dark:hover:bg-gray-600'
                  }`}
                >
                  <span className="material-symbols-outlined text-2xl block mb-1">{info.icon}</span>
                  <span className="text-sm font-medium">{info.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Image Upload */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">사진 업로드</h3>

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
                className="w-full p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-pink-500 transition-colors"
              >
                <span className="material-symbols-outlined text-4xl text-muted-foreground block mb-2">add_photo_alternate</span>
                <span className="text-muted-foreground">클릭하여 사진 업로드</span>
              </button>
            )}

            <p className="text-gray-500 text-sm mt-3 text-center">
              정면 얼굴 사진을 업로드하면 더 정확한 결과를 얻을 수 있습니다.
            </p>
          </div>

          {/* Analyze Button */}
          <button
            onClick={handleAnalyze}
            disabled={!imagePreview}
            className={`w-full px-6 py-4 font-semibold rounded-lg transition-colors ${
              imagePreview
                ? 'bg-pink-600 hover:bg-pink-700 text-foreground'
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
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground">AI가 닮은꼴을 찾고 있습니다...</p>
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
          <div className="bg-gradient-to-r from-pink-900 to-purple-900 rounded-lg p-6">
            <p className="text-xl text-foreground font-semibold text-center">
              "{result.funComment}"
            </p>
          </div>

          {/* Matches */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-foreground mb-4">
              닮은꼴 TOP 3
            </h3>
            <div className="space-y-4">
              {result.matches.map((match, index) => (
                <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold text-pink-400">#{index + 1}</span>
                      <span className="text-lg font-semibold text-foreground">{match.name}</span>
                    </div>
                    <span className={`text-xl font-bold ${getSimilarityColor(match.similarity)}`}>
                      {match.similarity}%
                    </span>
                  </div>
                  <p className="text-muted-foreground mb-3">{match.reason}</p>
                  <div className="flex flex-wrap gap-2">
                    {match.characteristics.map((char, i) => (
                      <span key={i} className="px-2 py-1 bg-gray-700 rounded text-sm text-muted-foreground">
                        {char}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Face Analysis */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-foreground mb-4">얼굴 분석</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-muted-foreground text-sm">얼굴형</p>
                <p className="text-foreground">{result.faceAnalysis.faceShape}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">눈</p>
                <p className="text-foreground">{result.faceAnalysis.eyeType}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">코</p>
                <p className="text-foreground">{result.faceAnalysis.noseType}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">입술</p>
                <p className="text-foreground">{result.faceAnalysis.lipType}</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-muted-foreground text-sm">전체적인 인상</p>
              <p className="text-foreground">{result.faceAnalysis.overallImpression}</p>
            </div>
          </div>

          {/* Try Again */}
          <button
            onClick={handleReset}
            className="w-full px-6 py-4 bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 text-foreground font-semibold rounded-lg transition-colors"
          >
            다른 카테고리로 다시 분석하기
          </button>
        </div>
      )}
    </ServiceDetailLayout>
  );
}
