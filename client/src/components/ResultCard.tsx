import { useRef } from 'react';
import html2canvas from 'html2canvas';

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
  onDownload?: () => void;
  creditsRequired?: number;
}

const colorThemes = {
  pink: {
    gradient: 'from-pink-500 via-rose-500 to-red-500',
    accent: 'bg-pink-100 text-pink-700',
    border: 'border-pink-200',
  },
  blue: {
    gradient: 'from-blue-500 via-cyan-500 to-teal-500',
    accent: 'bg-blue-100 text-blue-700',
    border: 'border-blue-200',
  },
  purple: {
    gradient: 'from-purple-500 via-violet-500 to-indigo-500',
    accent: 'bg-purple-100 text-purple-700',
    border: 'border-purple-200',
  },
  green: {
    gradient: 'from-green-500 via-emerald-500 to-teal-500',
    accent: 'bg-green-100 text-green-700',
    border: 'border-green-200',
  },
  orange: {
    gradient: 'from-orange-500 via-amber-500 to-yellow-500',
    accent: 'bg-orange-100 text-orange-700',
    border: 'border-orange-200',
  },
  teal: {
    gradient: 'from-teal-500 via-cyan-500 to-blue-500',
    accent: 'bg-teal-100 text-teal-700',
    border: 'border-teal-200',
  },
};

export default function ResultCard({
  serviceType,
  serviceName,
  mainResult,
  subResult,
  highlights,
  colorTheme = 'pink',
  onDownload,
  creditsRequired = 1,
}: ResultCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const theme = colorThemes[colorTheme];

  const handleDownload = async () => {
    if (!cardRef.current) return;

    try {
      // Call onDownload callback for credit deduction
      if (onDownload) {
        onDownload();
      }

      const canvas = await html2canvas(cardRef.current, {
        scale: 2, // Higher quality
        useCORS: true,
        backgroundColor: '#ffffff',
        width: 540,
        height: 540,
      });

      const link = document.createElement('a');
      link.download = `aiport-${serviceType}-result.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Failed to generate image:', error);
      alert('이미지 생성에 실패했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <div className="space-y-4">
      {/* Card Preview */}
      <div
        ref={cardRef}
        className="w-[540px] h-[540px] mx-auto bg-white rounded-2xl overflow-hidden shadow-2xl"
        style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
      >
        {/* Header with gradient */}
        <div className={`h-24 bg-gradient-to-r ${theme.gradient} flex items-center justify-center`}>
          <div className="text-center">
            <p className="text-white/80 text-sm font-medium">{serviceName}</p>
            <h2 className="text-white text-2xl font-bold">AI PORT</h2>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6 flex flex-col items-center justify-center" style={{ height: 'calc(540px - 96px - 48px)' }}>
          {/* Main Result */}
          <div className="text-center mb-6">
            <h3 className="text-4xl font-bold text-gray-800 mb-2">{mainResult}</h3>
            {subResult && (
              <p className="text-lg text-gray-600">{subResult}</p>
            )}
          </div>

          {/* Highlights */}
          {highlights.length > 0 && (
            <div className="w-full space-y-3">
              {highlights.slice(0, 4).map((item, index) => (
                <div
                  key={index}
                  className={`flex justify-between items-center px-4 py-2 rounded-lg ${theme.accent}`}
                >
                  <span className="font-medium text-sm">{item.label}</span>
                  <span className="font-bold text-sm">{item.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="h-12 bg-gray-50 flex items-center justify-center border-t border-gray-100">
          <p className="text-xs text-gray-400">aiport.com • AI 기반 자기분석 서비스</p>
        </div>
      </div>

      {/* Download Button */}
      <div className="text-center">
        <button
          onClick={handleDownload}
          className={`inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r ${theme.gradient} text-white rounded-xl font-semibold hover:opacity-90 transition-opacity shadow-lg`}
        >
          <span className="material-symbols-outlined">download</span>
          이미지 저장하기
          {creditsRequired > 0 && (
            <span className="text-sm opacity-80">({creditsRequired} 크레딧)</span>
          )}
        </button>
      </div>
    </div>
  );
}
