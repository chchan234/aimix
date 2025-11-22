import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { isLoggedIn, getToken } from '../services/auth';
import { Loader2, Trash2, Calendar } from 'lucide-react';

interface ServiceResult {
  id: string;
  serviceType: string;
  resultData: any;
  createdAt: string;
}

// 4개 대분류 카테고리
const CATEGORIES = [
  {
    id: 'all',
    label: '전체',
    services: []
  },
  {
    id: 'fortune',
    label: '운세/점술',
    services: ['face-reading', 'saju', 'tarot', 'name-analysis', 'dream', '2025-fortune']
  },
  {
    id: 'imageEdit',
    label: '이미지 편집',
    services: ['baby-face', 'professional-headshot', 'profile', 'caricature', 'id-photo',
               'age-transform', 'gender-swap', 'colorize', 'background-remove',
               'hairstyle-change', 'tattoo-simulation']
  },
  {
    id: 'entertainment',
    label: '엔터테인먼트',
    services: ['celebrity-doppelganger', 'pet-soulmate', 'lookalike']
  },
  {
    id: 'health',
    label: '건강/웰빙',
    services: ['personal-color', 'body-analysis', 'skin-analysis', 'bmi']
  }
];

// 서비스 타입 한글 라벨
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

// 서비스 타입 → 서비스 페이지 URL 매핑
const SERVICE_URLS: { [key: string]: string } = {
  'face-reading': '/services/face-reading',
  'saju': '/services/saju',
  'tarot': '/services/tarot',
  'name-analysis': '/services/name-analysis',
  'dream': '/services/dream',
  '2025-fortune': '/services/deep-saju-2026',
  'baby-face': '/services/baby-face',
  'professional-headshot': '/services/professional-headshot',
  'profile': '/services/profile-generator',
  'caricature': '/services/caricature',
  'id-photo': '/services/id-photo',
  'age-transform': '/services/age-transform',
  'gender-swap': '/services/gender-swap',
  'colorize': '/services/colorization',
  'background-remove': '/services/background-removal',
  'hairstyle-change': '/services/hairstyle',
  'tattoo-simulation': '/services/tattoo',
  'celebrity-doppelganger': '/services/celebrity-doppelganger',
  'pet-soulmate': '/services/pet-soulmate',
  'lookalike': '/services/lookalike',
  'personal-color': '/services/personal-color',
  'body-analysis': '/services/body-analysis',
  'skin-analysis': '/services/skin-analysis',
  'bmi': '/services/bmi-calculator'
};

export default function MyResultsPage() {
  const [, setLocation] = useLocation();
  const [results, setResults] = useState<ServiceResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Auth state monitoring
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

  // Fetch results
  useEffect(() => {
    if (!isLoggedIn()) {
      setLocation('/login');
      return;
    }

    fetchResults();
  }, [selectedCategory, page]);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const token = getToken();
      if (!token) {
        setLocation('/login');
        return;
      }

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
      });

      // 카테고리별 필터링
      if (selectedCategory !== 'all') {
        const category = CATEGORIES.find(c => c.id === selectedCategory);
        if (category && category.services.length > 0) {
          // 여러 서비스 타입을 필터링해야 하므로, 클라이언트에서 필터링
          // 또는 API를 수정해야 함. 일단은 전체를 가져와서 클라이언트에서 필터링
        }
      }

      const response = await fetch(`/api/results?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          setLocation('/login');
          return;
        }
        throw new Error('Failed to fetch results');
      }

      const data = await response.json();
      let filteredResults = data.results || [];

      // 클라이언트 사이드 카테고리 필터링
      if (selectedCategory !== 'all') {
        const category = CATEGORIES.find(c => c.id === selectedCategory);
        if (category) {
          filteredResults = filteredResults.filter((r: ServiceResult) =>
            category.services.includes(r.serviceType)
          );
        }
      }

      setResults(filteredResults);
      setHasMore(data.pagination?.hasMore || false);
    } catch (error) {
      console.error('Error fetching results:', error);
      alert('결과를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('이 결과를 삭제하시겠습니까?')) {
      return;
    }

    try {
      setDeleting(id);
      const token = getToken();
      if (!token) {
        setLocation('/login');
        return;
      }

      const response = await fetch(`/api/results/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          setLocation('/login');
          return;
        }
        throw new Error('Failed to delete result');
      }

      // Refresh results
      fetchResults();
    } catch (error) {
      console.error('Error deleting result:', error);
      alert('삭제에 실패했습니다.');
    } finally {
      setDeleting(null);
    }
  };

  const getServiceLabel = (type: string) => {
    return SERVICE_LABELS[type] || type;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gradient-to-br dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">내 결과물</h1>
          <p className="text-gray-600 dark:text-gray-300">저장된 AI 분석 결과를 확인하고 관리할 수 있습니다.</p>
        </div>

        {/* Category tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {CATEGORIES.map((category) => (
            <button
              key={category.id}
              onClick={() => {
                setSelectedCategory(category.id);
                setPage(1);
              }}
              className={`px-4 py-2 rounded-lg transition-all ${
                selectedCategory === category.id
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/20'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500 dark:text-blue-400" />
          </div>
        )}

        {/* Empty state */}
        {!loading && results.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">저장된 결과가 없습니다</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">AI 분석 결과를 저장하면 여기에 표시됩니다.</p>
            <button
              onClick={() => setLocation('/')}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-shadow"
            >
              서비스 둘러보기
            </button>
          </div>
        )}

        {/* Results grid */}
        {!loading && results.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((result) => (
                <div
                  key={result.id}
                  className="bg-white dark:bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-gray-200 dark:border-white/20 hover:border-blue-400 dark:hover:border-blue-400/50 transition-all shadow-sm hover:shadow-md"
                >
                  {/* Service type badge */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm rounded-full">
                      {getServiceLabel(result.serviceType)}
                    </span>
                    <button
                      onClick={() => handleDelete(result.id)}
                      disabled={deleting === result.id}
                      className="p-2 text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-400/10 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {deleting === result.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Date info */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                      <Calendar className="w-4 h-4 mr-2" />
                      {formatDate(result.createdAt)}
                    </div>
                  </div>

                  {/* View button */}
                  <button
                    onClick={() => {
                      const serviceUrl = SERVICE_URLS[result.serviceType];
                      if (serviceUrl) {
                        setLocation(`${serviceUrl}?resultId=${result.id}`);
                      } else {
                        alert('해당 서비스 페이지를 찾을 수 없습니다.');
                      }
                    }}
                    className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-shadow"
                  >
                    결과 보기
                  </button>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center items-center gap-4 mt-8">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                이전
              </button>
              <span className="text-gray-900 dark:text-white">페이지 {page}</span>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={!hasMore}
                className="px-4 py-2 bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                다음
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
