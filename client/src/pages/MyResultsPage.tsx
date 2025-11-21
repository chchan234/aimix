import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { isLoggedIn, getToken } from '../services/auth';
import { Loader2, Trash2, Calendar, Clock } from 'lucide-react';

interface ServiceResult {
  id: string;
  userId: string;
  serviceType: string;
  inputData: any;
  resultData: any;
  aiModel: string;
  tokensUsed: number;
  processingTime: number;
  createdAt: string;
  expiresAt: string;
}

const SERVICE_TYPES = [
  { id: 'all', label: '전체' },
  { id: 'face-reading', label: '관상 분석' },
  { id: 'personality', label: '성격 테스트' },
  { id: 'baby-face', label: '아기 얼굴' },
  { id: 'personal-color', label: '퍼스널 컬러' },
  { id: 'pet-soulmate', label: '반려동물 찰떡궁합' },
];

export default function MyResultsPage() {
  const [, setLocation] = useLocation();
  const [results, setResults] = useState<ServiceResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('all');
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
  }, [selectedType, page]);

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

      if (selectedType !== 'all') {
        params.append('serviceType', selectedType);
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
      setResults(data.results || []);
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
    const service = SERVICE_TYPES.find(s => s.id === type);
    return service?.label || type;
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">내 결과물</h1>
          <p className="text-gray-300">저장된 AI 분석 결과를 확인하고 관리할 수 있습니다.</p>
        </div>

        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {SERVICE_TYPES.map((type) => (
            <button
              key={type.id}
              onClick={() => {
                setSelectedType(type.id);
                setPage(1);
              }}
              className={`px-4 py-2 rounded-lg transition-all ${
                selectedType === type.id
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
          </div>
        )}

        {/* Empty state */}
        {!loading && results.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-semibold text-white mb-2">저장된 결과가 없습니다</h3>
            <p className="text-gray-400 mb-6">AI 분석 결과를 저장하면 여기에 표시됩니다.</p>
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
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:border-blue-400/50 transition-all"
                >
                  {/* Service type badge */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm rounded-full">
                      {getServiceLabel(result.serviceType)}
                    </span>
                    <button
                      onClick={() => handleDelete(result.id)}
                      disabled={deleting === result.id}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors disabled:opacity-50"
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
                    <div className="flex items-center text-sm text-gray-300">
                      <Calendar className="w-4 h-4 mr-2" />
                      {formatDate(result.createdAt)}
                    </div>
                    <div className="flex items-center text-sm text-gray-300">
                      <Clock className="w-4 h-4 mr-2" />
                      처리시간: {result.processingTime}ms
                    </div>
                  </div>

                  {/* AI Model info */}
                  <div className="text-xs text-gray-400 mb-4">
                    모델: {result.aiModel}
                  </div>

                  {/* View button */}
                  <button
                    onClick={() => {
                      // Navigate to appropriate service page with result data
                      setLocation(`/services/${result.serviceType}`);
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
                className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                이전
              </button>
              <span className="text-white">페이지 {page}</span>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={!hasMore}
                className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
