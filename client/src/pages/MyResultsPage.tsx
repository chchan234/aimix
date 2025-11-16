import { useState } from 'react';

interface Result {
  id: number;
  serviceId: string;
  serviceName: string;
  category: 'fortune' | 'image' | 'entertainment' | 'health';
  thumbnail: string;
  createdAt: string;
  credits: number;
}

export default function MyResultsPage() {

  // 필터 및 정렬 상태
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'credits'>('date');

  // Mock 데이터
  const [results] = useState<Result[]>([
    {
      id: 1,
      serviceId: 'face-reading',
      serviceName: 'AI 관상',
      category: 'fortune',
      thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
      createdAt: '2024.03.15',
      credits: 100,
    },
    {
      id: 2,
      serviceId: 'profile-generator',
      serviceName: 'AI 프로필 생성',
      category: 'image',
      thumbnail: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop',
      createdAt: '2024.03.14',
      credits: 200,
    },
    {
      id: 3,
      serviceId: 'mbti',
      serviceName: 'MBTI 정밀 분석',
      category: 'entertainment',
      thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=400&fit=crop',
      createdAt: '2024.03.13',
      credits: 150,
    },
    {
      id: 4,
      serviceId: 'body-type',
      serviceName: 'AI 체형 분석',
      category: 'health',
      thumbnail: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=400&fit=crop',
      createdAt: '2024.03.12',
      credits: 100,
    },
    {
      id: 5,
      serviceId: 'saju',
      serviceName: 'AI 사주팔자',
      category: 'fortune',
      thumbnail: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=400&h=400&fit=crop',
      createdAt: '2024.03.11',
      credits: 150,
    },
    {
      id: 6,
      serviceId: 'caricature',
      serviceName: 'AI 캐리커처',
      category: 'image',
      thumbnail: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
      createdAt: '2024.03.10',
      credits: 200,
    },
    {
      id: 7,
      serviceId: 'enneagram',
      serviceName: '에니어그램 테스트',
      category: 'entertainment',
      thumbnail: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop',
      createdAt: '2024.03.09',
      credits: 150,
    },
    {
      id: 8,
      serviceId: 'skin-analysis',
      serviceName: 'AI 피부 분석',
      category: 'health',
      thumbnail: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=400&fit=crop',
      createdAt: '2024.03.08',
      credits: 100,
    },
  ]);

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
        return b.credits - a.credits;
      }
    });

  const handleDownload = (result: Result) => {
    alert(`${result.serviceName} 결과물을 다운로드합니다.`);
  };

  const handleDelete = (result: Result) => {
    const confirmed = window.confirm(`${result.serviceName} 결과물을 삭제하시겠습니까?`);
    if (confirmed) {
      alert('결과물이 삭제되었습니다.');
    }
  };

  const handleShare = (result: Result) => {
    alert(`${result.serviceName} 결과물을 공유합니다.`);
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* 페이지 헤더 */}
      <div className="mb-8">
        <h1 className="text-white text-3xl font-bold mb-2">내 결과물</h1>
        <p className="text-[#ab9eb7] text-sm">AI 서비스를 이용한 결과물을 관리하세요</p>
      </div>

      {/* 필터 및 정렬 */}
      <div className="bg-[#1a1625] rounded-2xl p-6 border border-white/10 mb-6">
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
                    : 'bg-[#2a2436] text-[#ab9eb7] hover:bg-[#3a3446]'
                }`}
              >
                {getCategoryName(category)}
              </button>
            ))}
          </div>

          {/* 정렬 */}
          <div className="flex items-center gap-2">
            <span className="text-[#ab9eb7] text-sm">정렬:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'credits')}
              className="bg-[#2a2436] text-white px-3 py-2 rounded-lg border border-white/10 focus:border-primary focus:outline-none text-sm"
            >
              <option value="date">최신순</option>
              <option value="credits">크레딧순</option>
            </select>
          </div>
        </div>

        {/* 결과 통계 */}
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-[#ab9eb7] text-xs mb-1">전체 결과물</p>
              <p className="text-white text-2xl font-bold">{results.length}</p>
            </div>
            <div>
              <p className="text-[#ab9eb7] text-xs mb-1">이번 주</p>
              <p className="text-white text-2xl font-bold">3</p>
            </div>
            <div>
              <p className="text-[#ab9eb7] text-xs mb-1">이번 달</p>
              <p className="text-white text-2xl font-bold">8</p>
            </div>
            <div>
              <p className="text-[#ab9eb7] text-xs mb-1">총 사용 크레딧</p>
              <p className="text-white text-2xl font-bold">
                {results.reduce((sum, r) => sum + r.credits, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 결과물 그리드 */}
      {filteredResults.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredResults.map((result) => (
            <div
              key={result.id}
              className="bg-[#1a1625] rounded-2xl overflow-hidden border border-white/10 hover:border-primary/50 transition group"
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
                  <h3 className="text-white font-semibold text-sm">{result.serviceName}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded border ${getCategoryColor(result.category)}`}>
                    {getCategoryName(result.category)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#ab9eb7]">{result.createdAt}</span>
                  <span className="text-primary font-semibold">-{result.credits}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* 빈 상태 */
        <div className="bg-[#1a1625] rounded-2xl p-12 border border-white/10 text-center">
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-primary text-5xl">search_off</span>
            </div>
            <h3 className="text-white text-xl font-bold mb-2">결과물이 없습니다</h3>
            <p className="text-[#ab9eb7] text-sm mb-6">
              {selectedCategory === 'all'
                ? 'AI 서비스를 이용하여 결과물을 생성해보세요'
                : `${getCategoryName(selectedCategory)} 카테고리의 결과물이 없습니다`}
            </p>
            <button
              onClick={() => setSelectedCategory('all')}
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
            >
              전체 보기
            </button>
          </div>
        </div>
      )}

      {/* 페이지네이션 (추후 구현) */}
      {filteredResults.length > 0 && (
        <div className="mt-8 flex justify-center">
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 bg-[#2a2436] text-white rounded-lg hover:bg-[#3a3446] transition disabled:opacity-50 disabled:cursor-not-allowed">
              <span className="material-symbols-outlined text-xl">chevron_left</span>
            </button>
            <button className="px-4 py-2 bg-primary text-white rounded-lg">1</button>
            <button className="px-4 py-2 bg-[#2a2436] text-white rounded-lg hover:bg-[#3a3446] transition">
              2
            </button>
            <button className="px-4 py-2 bg-[#2a2436] text-white rounded-lg hover:bg-[#3a3446] transition">
              3
            </button>
            <button className="px-4 py-2 bg-[#2a2436] text-white rounded-lg hover:bg-[#3a3446] transition">
              <span className="material-symbols-outlined text-xl">chevron_right</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
