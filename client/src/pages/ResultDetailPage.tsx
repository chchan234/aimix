import { useState, useEffect } from 'react';
import { useRoute, useLocation } from 'wouter';
import { Loader2, ArrowLeft, Share2, Check } from 'lucide-react';
import { getToken } from '../services/auth';

interface ServiceResult {
  id: string;
  serviceType: string;
  resultData: any;
  createdAt: string;
}

const SERVICE_LABELS: { [key: string]: string } = {
  'face-reading': '관상 분석',
  'saju': '사주팔자',
  'tarot': '타로',
  'name-analysis': '이름 분석',
  'dream': '꿈해몽',
  '2025-fortune': '2025 신년운세',
  'baby-face': '아기 얼굴 예측',
  'professional-headshot': '프로필 사진',
  'profile': 'AI 프로필',
  'caricature': '캐리커쳐',
  'id-photo': '증명사진',
  'age-transform': '나이 변환',
  'gender-swap': '성별 전환',
  'colorize': '흑백사진 컬러화',
  'background-remove': '배경 제거',
  'hairstyle-change': '헤어스타일 변경',
  'tattoo-simulation': '타투 시뮬레이션',
  'celebrity-doppelganger': '연예인 닮은꼴',
  'pet-soulmate': '반려동물 찰떡궁합',
  'lookalike': '닮은꼴 찾기',
  'personal-color': '퍼스널 컬러',
  'body-analysis': '체형 분석',
  'skin-analysis': '피부 분석',
  'bmi': 'BMI 계산'
};

export default function ResultDetailPage() {
  const [, params] = useRoute('/result/:id');
  const [, setLocation] = useLocation();
  const [result, setResult] = useState<ServiceResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (params?.id) {
      fetchResult(params.id);
    }
  }, [params?.id]);

  const fetchResult = async (id: string) => {
    try {
      setLoading(true);
      const token = getToken();

      const response = await fetch(`/api/results/${id}`, {
        headers: token ? {
          'Authorization': `Bearer ${token}`,
        } : {},
      });

      if (!response.ok) {
        throw new Error('결과를 불러오는데 실패했습니다.');
      }

      const data = await response.json();
      // API returns result directly, not wrapped in { success, result }
      setResult(data);
    } catch (err: any) {
      console.error('Error fetching result:', err);
      setError(err.message || '결과를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const renderValue = (value: any, depth: number = 0): JSX.Element => {
    if (value === null || value === undefined) {
      return <span className="text-gray-500 dark:text-gray-400 italic">없음</span>;
    }

    if (Array.isArray(value)) {
      return (
        <div className="space-y-2">
          {value.map((item, index) => (
            <div key={index} className="flex gap-2">
              <span className="text-blue-500 dark:text-blue-400">•</span>
              <div className="flex-1">{renderValue(item, depth + 1)}</div>
            </div>
          ))}
        </div>
      );
    }

    if (typeof value === 'object') {
      return (
        <div className="space-y-4">
          {Object.entries(value).map(([key, val]) => (
            <div key={key} className={depth === 0 ? 'bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4' : 'space-y-2'}>
              <div className="font-semibold text-gray-900 dark:text-white mb-2 capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim().replace(/_/g, ' ')}
              </div>
              <div className="text-gray-700 dark:text-gray-300">
                {renderValue(val, depth + 1)}
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (typeof value === 'string') {
      // Check if it's an image URL
      if (value.startsWith('http') && (value.includes('image') || value.match(/\.(jpg|jpeg|png|gif|webp)$/i))) {
        return (
          <div className="my-4">
            <img src={value} alt="Result" className="max-w-full rounded-lg" />
          </div>
        );
      }

      if (value.length > 100) {
        return <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{value}</p>;
      }
      return <span className="text-gray-700 dark:text-gray-300">{value}</span>;
    }

    if (typeof value === 'number') {
      return <span className="text-blue-600 dark:text-blue-400 font-semibold">{value}</span>;
    }

    if (typeof value === 'boolean') {
      return (
        <span className={value ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
          {value ? '예' : '아니오'}
        </span>
      );
    }

    return <span className="text-gray-700 dark:text-gray-300">{String(value)}</span>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gradient-to-br dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500 dark:text-blue-400" />
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen bg-white dark:bg-gradient-to-br dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">결과를 찾을 수 없습니다</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error || '올바른 결과 ID가 아닙니다.'}</p>
          <button
            onClick={() => setLocation('/')}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-shadow"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gradient-to-br dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => setLocation('/my-results')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            내 결과물로 돌아가기
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-white/20 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                복사됨!
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4" />
                공유하기
              </>
            )}
          </button>
        </div>

        {/* Service Type Badge */}
        <div className="mb-6">
          <span className="inline-block px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-lg font-semibold rounded-full">
            {SERVICE_LABELS[result.serviceType] || result.serviceType}
          </span>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            {formatDate(result.createdAt)}
          </p>
        </div>

        {/* Result Content */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
          {renderValue(result.resultData)}
        </div>
      </div>
    </div>
  );
}
