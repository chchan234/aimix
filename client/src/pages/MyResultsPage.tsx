import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getResults, deleteResult } from '../services/ai';

interface Result {
  id: string;
  serviceType: string;
  serviceName: string;
  category: 'fortune' | 'image' | 'entertainment' | 'health';
  thumbnail?: string;
  createdAt: string;
  creditCost: number;
}

export default function MyResultsPage() {
  const { t } = useTranslation();

  // 필터 및 정렬 상태
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'credits'>('date');
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch results on mount
  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await getResults();
        if (response.success) {
          setResults(response.results.map((r: any) => ({
            id: r.id,
            serviceType: r.serviceType,
            serviceName: r.serviceName,
            category: r.category || 'fortune',
            thumbnail: getThumbnailForService(r.serviceType),
            createdAt: new Date(r.createdAt).toLocaleDateString('ko-KR'),
            creditCost: r.creditCost,
          })));
        }
      } catch (error) {
        console.error('Failed to fetch results:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, []);

  // Get thumbnail for service type
  const getThumbnailForService = (serviceType: string) => {
    const thumbnails: { [key: string]: string } = {
      'face-reading': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
      'saju': 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=400&h=400&fit=crop',
      'tarot': 'https://images.unsplash.com/photo-1551269901-5c5e14c25df7?w=400&h=400&fit=crop',
      'tojeong': 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop',
      'dream': 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=400&fit=crop',
    };
    return thumbnails[serviceType] || 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=400&h=400&fit=crop';
  };

  const getCategoryName = (category: string) => {
    const names: { [key: string]: string } = {
      all: '전체',
      fortune: '운세/점술',
      image: '이미지 편집',
      entertainment: '엔터테인먼트',
      health: '건강/웰빙',
    };
    return names[category] || category;
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      fortune: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      image: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      entertainment: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
      health: 'bg-green-500/20 text-green-400 border-green-500/30',
    };
    return colors[category as keyof typeof colors] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  // 필터링 및 정렬
  const filteredResults = results
    .filter((result) => selectedCategory === 'all' || result.category === selectedCategory)
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else {
        return b.creditCost - a.creditCost;
      }
    });

  const handleDownload = (result: Result) => {
    alert(`${result.serviceName} ${t('myResults.downloadMessage')}`);
  };

  const handleDelete = async (result: Result) => {
    const confirmed = window.confirm(`${result.serviceName} 결과물을 삭제하시겠습니까?`);
    if (confirmed) {
      try {
        await deleteResult(result.id);
        setResults(results.filter(r => r.id !== result.id));
        alert('결과물이 삭제되었습니다.');
      } catch (error) {
        console.error('Delete error:', error);
        alert('삭제 중 오류가 발생했습니다.');
      }
    }
  };

  const handleShare = (result: Result) => {
    alert(`${result.serviceName} 결과물을 공유합니다.`);
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* 페이지 헤더 */}
      <div className="mb-8">
        <h1 className="text-foreground text-3xl font-bold mb-2">{t('myResults.title')}</h1>
        <p className="text-muted-foreground text-sm">{t('myResults.subtitle')}</p>
      </div>

      {/* 필터 및 정렬 */}
      <div className="bg-white dark:bg-[#1a1625] rounded-2xl p-6 border border-gray-200 dark:border-white/10 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          {/* 카테고리 필터 */}
          <div className="flex flex-wrap gap-2">
            {['all', 'fortune', 'image', 'entertainment', 'health'].map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  selectedCategory === category
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 dark:bg-[#2a2436] text-muted-foreground hover:bg-gray-200 dark:hover:bg-[#3a3446]'
                }`}
              >
                {getCategoryName(category)}
              </button>
            ))}
          </div>

          {/* 정렬 */}
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-sm">{t('myResults.sortLabel')}:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'credits')}
              className="bg-gray-100 dark:bg-[#2a2436] text-foreground px-3 py-2 rounded-lg border border-gray-200 dark:border-white/10 focus:border-primary focus:outline-none text-sm"
            >
              <option value="date">{t('myResults.sort.date')}</option>
              <option value="credits">{t('myResults.sort.credits')}</option>
            </select>
          </div>
        </div>

        {/* 결과 통계 */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-white/10">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-muted-foreground text-xs mb-1">{t('myResults.stats.total')}</p>
              <p className="text-foreground text-2xl font-bold">{results.length}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs mb-1">{t('myResults.stats.thisWeek')}</p>
              <p className="text-foreground text-2xl font-bold">
                {results.filter(r => {
                  const weekAgo = new Date();
                  weekAgo.setDate(weekAgo.getDate() - 7);
                  return new Date(r.createdAt) > weekAgo;
                }).length}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs mb-1">{t('myResults.stats.thisMonth')}</p>
              <p className="text-foreground text-2xl font-bold">
                {results.filter(r => {
                  const monthAgo = new Date();
                  monthAgo.setMonth(monthAgo.getMonth() - 1);
                  return new Date(r.createdAt) > monthAgo;
                }).length}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs mb-1">{t('myResults.stats.totalCredits')}</p>
              <p className="text-foreground text-2xl font-bold">
                {results.reduce((sum, r) => sum + r.creditCost, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 결과물 그리드 */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <p className="text-muted-foreground mt-4">결과물을 불러오는 중...</p>
        </div>
      ) : filteredResults.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredResults.map((result) => (
            <div
              key={result.id}
              className="bg-white dark:bg-[#1a1625] rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 hover:border-primary/50 transition group"
            >
              {/* 썸네일 */}
              <div className="relative aspect-square overflow-hidden">
                <img
                  src={result.thumbnail}
                  alt={result.serviceName}
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition">
                  <div className="absolute bottom-0 left-0 right-0 p-4 flex gap-2 justify-center">
                    <button
                      onClick={() => handleDownload(result)}
                      className="p-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition"
                      title="다운로드"
                    >
                      <span className="material-symbols-outlined text-white text-xl">download</span>
                    </button>
                    <button
                      onClick={() => handleShare(result)}
                      className="p-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition"
                      title="공유"
                    >
                      <span className="material-symbols-outlined text-white text-xl">share</span>
                    </button>
                    <button
                      onClick={() => handleDelete(result)}
                      className="p-2 bg-red-500/20 backdrop-blur-sm rounded-lg hover:bg-red-500/30 transition"
                      title="삭제"
                    >
                      <span className="material-symbols-outlined text-white text-xl">delete</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* 정보 */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-foreground font-semibold text-sm">{result.serviceName}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded border ${getCategoryColor(result.category)}`}>
                    {getCategoryName(result.category)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{result.createdAt}</span>
                  <span className="text-primary font-semibold">-{result.creditCost}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* 빈 상태 */
        <div className="bg-white dark:bg-[#1a1625] rounded-2xl p-12 border border-gray-200 dark:border-white/10 text-center">
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-primary text-5xl">search_off</span>
            </div>
            <h3 className="text-foreground text-xl font-bold mb-2">{t('myResults.empty.title')}</h3>
            <p className="text-muted-foreground text-sm mb-6">
              {selectedCategory === 'all'
                ? t('myResults.empty.description')
                : t('myResults.empty.categoryDescription', { category: getCategoryName(selectedCategory) })}
            </p>
            <button
              onClick={() => setSelectedCategory('all')}
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
            >
              {t('myResults.empty.button')}
            </button>
          </div>
        </div>
      )}

      {/* 페이지네이션 (추후 구현) */}
      {filteredResults.length > 0 && (
        <div className="mt-8 flex justify-center">
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 bg-gray-100 dark:bg-[#2a2436] text-foreground rounded-lg hover:bg-gray-200 dark:hover:bg-[#3a3446] transition disabled:opacity-50 disabled:cursor-not-allowed">
              <span className="material-symbols-outlined text-xl">chevron_left</span>
            </button>
            <button className="px-4 py-2 bg-primary text-white rounded-lg">1</button>
            <button className="px-4 py-2 bg-gray-100 dark:bg-[#2a2436] text-foreground rounded-lg hover:bg-gray-200 dark:hover:bg-[#3a3446] transition">
              2
            </button>
            <button className="px-4 py-2 bg-gray-100 dark:bg-[#2a2436] text-foreground rounded-lg hover:bg-gray-200 dark:hover:bg-[#3a3446] transition">
              3
            </button>
            <button className="px-4 py-2 bg-gray-100 dark:bg-[#2a2436] text-foreground rounded-lg hover:bg-gray-200 dark:hover:bg-[#3a3446] transition">
              <span className="material-symbols-outlined text-xl">chevron_right</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
