import { useState } from 'react';
import { generateResultImage } from '../services/ai';

interface ResultCardProps {
  serviceType: string;
  serviceName: string;
  mainResult: string;
  subResult?: string;
  highlights: Array<{
    label: string;
    value: string;
  }>;
  colorTheme?: 'pink' | 'blue' | 'purple' | 'green' | 'orange' | 'teal';
  creditsRequired?: number;
}

const colorThemes = {
  pink: {
    gradient: 'from-pink-500 via-rose-500 to-red-500',
    gradientText: '#ec4899 to #8b5cf6',
  },
  blue: {
    gradient: 'from-blue-500 via-cyan-500 to-teal-500',
    gradientText: '#3b82f6 to #14b8a6',
  },
  purple: {
    gradient: 'from-purple-500 via-violet-500 to-indigo-500',
    gradientText: '#9333ea to #6366f1',
  },
  green: {
    gradient: 'from-green-500 via-emerald-500 to-teal-500',
    gradientText: '#10b981 to #14b8a6',
  },
  orange: {
    gradient: 'from-orange-500 via-amber-500 to-yellow-500',
    gradientText: '#f97316 to #fb923c',
  },
  teal: {
    gradient: 'from-teal-500 via-cyan-500 to-blue-500',
    gradientText: '#14b8a6 to #3b82f6',
  },
};

export default function ResultCard({
  serviceType,
  serviceName,
  mainResult,
  subResult,
  highlights,
  colorTheme = 'pink',
  creditsRequired = 1,
}: ResultCardProps) {
  const [loading, setLoading] = useState(false);
  const theme = colorThemes[colorTheme];

  const handleGenerate = async () => {
    setLoading(true);
    try {
      await generateResultImage({
        serviceType,
        serviceName,
        mainResult,
        subResult: subResult || '',
        highlights: highlights.slice(0, 4),
        colorTheme,
        colorGradient: theme.gradientText,
        creditsRequired,
      });
    } catch (error: any) {
      console.error('Failed to generate image:', error);
      alert(error.message || '이미지 생성에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-center">
      <button
        onClick={handleGenerate}
        disabled={loading}
        className={`inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r ${theme.gradient} text-white rounded-xl font-semibold hover:opacity-90 transition-opacity shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {loading ? (
          <>
            <span className="material-symbols-outlined animate-spin">progress_activity</span>
            이미지 생성 중...
          </>
        ) : (
          <>
            <span className="material-symbols-outlined">download</span>
            이미지 저장하기
            {creditsRequired > 0 && (
              <span className="text-sm opacity-80">({creditsRequired} 크레딧)</span>
            )}
          </>
        )}
      </button>
    </div>
  );
}
