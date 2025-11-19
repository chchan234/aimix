import { useState, useRef } from 'react';
import ServiceDetailLayout from '../../components/ServiceDetailLayout';
import { analyzePersonalColor } from '../../services/ai';
import { isLoggedIn } from '../../services/auth';

interface SkinAnalysis {
  undertone: string;
  brightness: string;
  saturation: string;
  description: string;
}

interface RecommendedColors {
  best: string[];
  avoid: string[];
}

interface MakeupRecommendations {
  lipstick: string[];
  eyeshadow: string[];
  blush: string[];
}

interface ClothingRecommendations {
  colors: string[];
  metals: string;
  description: string;
}

interface PersonalColorResult {
  personalColor: string;
  confidence: number;
  skinAnalysis: SkinAnalysis;
  recommendedColors: RecommendedColors;
  makeupRecommendations: MakeupRecommendations;
  clothingRecommendations: ClothingRecommendations;
  explanation: string;
}

// Color name to hex mapping for common Korean color names
const colorNameToHex: { [key: string]: string } = {
  // Spring Warm
  '코랄': '#FF7F50',
  '피치': '#FFCBA4',
  '아이보리': '#FFFFF0',
  '베이지': '#F5F5DC',
  '카멜': '#C19A6B',
  '살몬핑크': '#FF8C69',
  '오렌지': '#FFA500',
  '옐로우': '#FFFF00',
  '연두': '#9ACD32',
  '민트': '#98FF98',
  '아쿠아': '#00FFFF',
  '터콰이즈': '#40E0D0',
  '골드': '#FFD700',

  // Summer Cool
  '라벤더': '#E6E6FA',
  '로즈핑크': '#FF66B2',
  '파스텔핑크': '#FFD1DC',
  '베이비핑크': '#F4C2C2',
  '파스텔블루': '#AEC6CF',
  '스카이블루': '#87CEEB',
  '라일락': '#C8A2C8',
  '그레이': '#808080',
  '실버': '#C0C0C0',
  '화이트': '#FFFFFF',
  '소프트화이트': '#F5F5F5',
  '로즈브라운': '#BC8F8F',

  // Autumn Warm
  '버건디': '#800020',
  '브릭': '#CB4154',
  '테라코타': '#E2725B',
  '머스타드': '#FFDB58',
  '올리브': '#808000',
  '카키': '#C3B091',
  '브라운': '#A52A2A',
  '초콜릿': '#7B3F00',
  '앰버': '#FFBF00',
  '다크오렌지': '#FF8C00',
  '모스그린': '#8A9A5B',
  '레드브라운': '#A52A2A',

  // Winter Cool
  '블랙': '#000000',
  '네이비': '#000080',
  '와인': '#722F37',
  '로열블루': '#4169E1',
  '퍼플': '#800080',
  '마젠타': '#FF00FF',
  '핫핑크': '#FF69B4',
  '레드': '#FF0000',
  '에메랄드': '#50C878',
  '트루화이트': '#FFFFFF',
  '차콜': '#36454F',
  '퓨시아': '#FF00FF',

  // Common makeup colors
  '누드': '#E3BC9A',
  'MLBB': '#C48793',
  '체리': '#DE3163',
  '브론즈': '#CD7F32',
  '테라코타브라운': '#C04000',
  '로지브라운': '#9E5E6F',
  '소프트코랄': '#F88379',
  '피치베이지': '#FFE5B4',
  '쉬폰핑크': '#F8C8DC',
  '로즈우드': '#65000B',
  '딥로즈': '#C21E56',
  '플럼': '#DDA0DD',

  // Generic fallbacks
  '핑크': '#FFC0CB',
  '블루': '#0000FF',
  '그린': '#008000',
  '옐로': '#FFFF00',
};

const getColorHex = (colorName: string): string => {
  // Try exact match first
  if (colorNameToHex[colorName]) {
    return colorNameToHex[colorName];
  }

  // Try partial match
  for (const [name, hex] of Object.entries(colorNameToHex)) {
    if (colorName.includes(name) || name.includes(colorName)) {
      return hex;
    }
  }

  // Default color based on common patterns
  if (colorName.includes('핑크') || colorName.includes('로즈')) return '#FFC0CB';
  if (colorName.includes('블루') || colorName.includes('파랑')) return '#4169E1';
  if (colorName.includes('그린') || colorName.includes('초록')) return '#228B22';
  if (colorName.includes('브라운') || colorName.includes('갈색')) return '#8B4513';
  if (colorName.includes('오렌지') || colorName.includes('주황')) return '#FFA500';
  if (colorName.includes('레드') || colorName.includes('빨강')) return '#DC143C';
  if (colorName.includes('옐로') || colorName.includes('노랑')) return '#FFD700';
  if (colorName.includes('퍼플') || colorName.includes('보라')) return '#9370DB';

  // Final fallback
  return '#888888';
};

export default function PersonalColorPage() {
  const [step, setStep] = useState<'intro' | 'upload' | 'result'>('intro');
  const [imagePreview, setImagePreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PersonalColorResult | null>(null);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      const response = await analyzePersonalColor(imagePreview) as any;

      if (response.success) {
        setResult(response.analysis);
        setStep('result');
      } else {
        setError(response.error || '분석에 실패했습니다.');
      }
    } catch (err: any) {
      console.error('Personal color analysis error:', err);
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

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-400';
    if (confidence >= 60) return 'text-yellow-400';
    return 'text-orange-400';
  };

  const getPersonalColorEmoji = (colorType: string) => {
    if (colorType.includes('Spring') || colorType.includes('봄')) return '🌸';
    if (colorType.includes('Summer') || colorType.includes('여름')) return '🌊';
    if (colorType.includes('Autumn') || colorType.includes('가을')) return '🍂';
    if (colorType.includes('Winter') || colorType.includes('겨울')) return '❄️';
    return '🎨';
  };

  return (
    <ServiceDetailLayout
      title="퍼스널 컬러 진단"
      description="나에게 어울리는 색을 찾아보세요"
      icon="palette"
      color="purple"
    >
      {/* Introduction */}
      {step === 'intro' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined text-3xl text-purple-400">palette</span>
              <h3 className="text-xl font-semibold text-foreground">
                퍼스널 컬러 진단
              </h3>
            </div>
            <p className="text-muted-foreground mb-6">
              AI가 당신의 피부톤을 분석하여 어울리는 퍼스널 컬러를 진단해드립니다.
              봄/여름/가을/겨울 시즌 컬러와 함께 메이크업, 의류 색상을 추천받으세요.
            </p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-purple-400">face</span>
                  <span className="text-foreground font-medium">피부톤 분석</span>
                </div>
                <p className="text-muted-foreground text-sm">언더톤, 명도, 채도 분석</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-purple-400">colorize</span>
                  <span className="text-foreground font-medium">컬러 추천</span>
                </div>
                <p className="text-muted-foreground text-sm">Best & Avoid 컬러</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-purple-400">brush</span>
                  <span className="text-foreground font-medium">메이크업 추천</span>
                </div>
                <p className="text-muted-foreground text-sm">립, 아이섀도우, 블러셔</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-purple-400">checkroom</span>
                  <span className="text-foreground font-medium">의류 추천</span>
                </div>
                <p className="text-muted-foreground text-sm">색상 & 액세서리</p>
              </div>
            </div>

            <div className="bg-purple-900/20 border border-purple-500 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-foreground font-semibold">퍼스널 컬러 진단</p>
                  <p className="text-muted-foreground text-sm">피부톤 분석 + 컬러 추천</p>
                </div>
                <div className="text-right">
                  <p className="text-purple-400 font-bold text-xl">20 크레딧</p>
                </div>
              </div>
            </div>

            <button
              onClick={handleStartTest}
              className="w-full px-6 py-4 bg-purple-600 hover:bg-purple-700 text-foreground font-semibold rounded-lg transition-colors"
            >
              시작하기 (20 크레딧)
            </button>
          </div>
        </div>
      )}

      {/* Upload */}
      {step === 'upload' && !loading && (
        <div className="space-y-6">
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
                className="w-full p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-purple-500 transition-colors"
              >
                <span className="material-symbols-outlined text-4xl text-muted-foreground block mb-2">add_photo_alternate</span>
                <span className="text-muted-foreground">클릭하여 사진 업로드</span>
              </button>
            )}

            <p className="text-gray-500 text-sm mt-3 text-center">
              자연광에서 촬영한 정면 셀카를 업로드하면 더 정확한 결과를 얻을 수 있습니다.
            </p>
          </div>

          {/* Analyze Button */}
          <button
            onClick={handleAnalyze}
            disabled={!imagePreview}
            className={`w-full px-6 py-4 font-semibold rounded-lg transition-colors ${
              imagePreview
                ? 'bg-purple-600 hover:bg-purple-700 text-foreground'
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
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground">AI가 퍼스널 컬러를 분석하고 있습니다...</p>
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
          {/* Personal Color Type */}
          <div className="bg-gradient-to-r from-purple-900 to-pink-900 rounded-lg p-6 text-center">
            <p className="text-4xl mb-2">{getPersonalColorEmoji(result.personalColor)}</p>
            <h3 className="text-2xl font-bold text-foreground mb-2">
              {result.personalColor}
            </h3>
            <p className={`text-lg font-semibold ${getConfidenceColor(result.confidence)}`}>
              신뢰도 {result.confidence}%
            </p>
          </div>

          {/* Skin Analysis */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-foreground mb-4">
              <span className="material-symbols-outlined align-middle mr-2">face</span>
              피부톤 분석
            </h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-muted-foreground text-sm">언더톤</p>
                <p className="text-foreground font-medium">{result.skinAnalysis.undertone}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">명도</p>
                <p className="text-foreground font-medium">{result.skinAnalysis.brightness}</p>
              </div>
              <div className="col-span-2">
                <p className="text-muted-foreground text-sm">채도</p>
                <p className="text-foreground font-medium">{result.skinAnalysis.saturation}</p>
              </div>
            </div>
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-muted-foreground">{result.skinAnalysis.description}</p>
            </div>
          </div>

          {/* Recommended Colors */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-foreground mb-4">
              <span className="material-symbols-outlined align-middle mr-2">palette</span>
              추천 컬러
            </h3>

            <div className="mb-4">
              <p className="text-purple-400 font-semibold mb-2">Best Colors</p>
              <div className="flex flex-wrap gap-2">
                {result.recommendedColors.best.map((color, index) => (
                  <div key={index} className="flex items-center gap-2 px-3 py-2 bg-purple-500/20 rounded-lg">
                    <div
                      className="w-4 h-4 rounded-full border border-gray-500"
                      style={{ backgroundColor: getColorHex(color) }}
                    />
                    <span className="text-foreground text-sm">{color}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-red-400 font-semibold mb-2">Avoid Colors</p>
              <div className="flex flex-wrap gap-2">
                {result.recommendedColors.avoid.map((color, index) => (
                  <div key={index} className="flex items-center gap-2 px-3 py-2 bg-red-500/20 rounded-lg">
                    <div
                      className="w-4 h-4 rounded-full border border-gray-500"
                      style={{ backgroundColor: getColorHex(color) }}
                    />
                    <span className="text-foreground text-sm">{color}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Makeup Recommendations */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-foreground mb-4">
              <span className="material-symbols-outlined align-middle mr-2">brush</span>
              메이크업 추천
            </h3>

            <div className="space-y-4">
              <div>
                <p className="text-muted-foreground text-sm mb-2">립스틱</p>
                <div className="flex flex-wrap gap-2">
                  {result.makeupRecommendations.lipstick.map((color, index) => (
                    <span key={index} className="px-3 py-1 bg-pink-500/20 text-pink-300 rounded-full text-sm">
                      {color}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-muted-foreground text-sm mb-2">아이섀도우</p>
                <div className="flex flex-wrap gap-2">
                  {result.makeupRecommendations.eyeshadow.map((color, index) => (
                    <span key={index} className="px-3 py-1 bg-amber-500/20 text-amber-300 rounded-full text-sm">
                      {color}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-muted-foreground text-sm mb-2">블러셔</p>
                <div className="flex flex-wrap gap-2">
                  {result.makeupRecommendations.blush.map((color, index) => (
                    <span key={index} className="px-3 py-1 bg-rose-500/20 text-rose-300 rounded-full text-sm">
                      {color}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Clothing Recommendations */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-foreground mb-4">
              <span className="material-symbols-outlined align-middle mr-2">checkroom</span>
              의류 추천
            </h3>

            <div className="space-y-4">
              <div>
                <p className="text-muted-foreground text-sm mb-2">추천 의류 색상</p>
                <div className="flex flex-wrap gap-2">
                  {result.clothingRecommendations.colors.map((color, index) => (
                    <div key={index} className="flex items-center gap-2 px-3 py-2 bg-gray-700 rounded-lg">
                      <div
                        className="w-4 h-4 rounded-full border border-gray-500"
                        style={{ backgroundColor: getColorHex(color) }}
                      />
                      <span className="text-foreground text-sm">{color}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-muted-foreground text-sm mb-2">추천 메탈</p>
                <span className={`px-4 py-2 rounded-lg inline-block ${
                  result.clothingRecommendations.metals.includes('골드')
                    ? 'bg-yellow-500/20 text-yellow-300'
                    : 'bg-gray-500/20 text-muted-foreground'
                }`}>
                  {result.clothingRecommendations.metals}
                </span>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-muted-foreground">{result.clothingRecommendations.description}</p>
              </div>
            </div>
          </div>

          {/* Explanation */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-foreground mb-4">
              <span className="material-symbols-outlined align-middle mr-2">info</span>
              상세 설명
            </h3>
            <p className="text-muted-foreground leading-relaxed">{result.explanation}</p>
          </div>

          {/* Try Again */}
          <button
            onClick={handleReset}
            className="w-full px-6 py-4 bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 text-foreground font-semibold rounded-lg transition-colors"
          >
            다시 분석하기
          </button>
        </div>
      )}
    </ServiceDetailLayout>
  );
}
