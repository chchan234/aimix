import { useMemo } from 'react';

export default function HomePage() {
  // 모든 서비스 목록
  const allServices = [
    // 운세/점술
    {
      title: 'AI 사주팔자',
      description: '생년월일시 기반 운세 분석',
      icon: 'calendar_today',
      color: 'purple',
      category: '운세/점술',
    },
    {
      title: 'AI 관상',
      description: '얼굴 인식으로 관상 해석',
      icon: 'face',
      color: 'blue',
      category: '운세/점술',
    },
    {
      title: 'AI 손금',
      description: '손바닥 스캔으로 손금 분석',
      icon: 'back_hand',
      color: 'green',
      category: '운세/점술',
    },
    {
      title: 'AI 별자리 운세',
      description: '일/주/월/년 운세',
      icon: 'star',
      color: 'yellow',
      category: '운세/점술',
    },
    {
      title: 'AI 띠 운세',
      description: '12간지 기반 운세',
      icon: 'pets',
      color: 'orange',
      category: '운세/점술',
    },
    {
      title: '연인 궁합',
      description: '커플 호환성 분석',
      icon: 'favorite',
      color: 'pink',
      category: '운세/점술',
    },
    {
      title: '이름 궁합',
      description: '획수 기반 궁합',
      icon: 'edit',
      color: 'indigo',
      category: '운세/점술',
    },
    {
      title: '부부 궁합',
      description: '결혼 생활 예측',
      icon: 'family_restroom',
      color: 'red',
      category: '운세/점술',
    },
    // 이미지 편집
    {
      title: 'AI 프로필 생성',
      description: '다양한 스타일 프로필 사진',
      icon: 'account_circle',
      color: 'cyan',
      category: '이미지 편집',
    },
    {
      title: 'AI 캐리커처',
      description: '만화풍 캐리커처 생성',
      icon: 'draw',
      color: 'purple',
      category: '이미지 편집',
    },
    {
      title: 'AI 증명사진',
      description: '정장/배경 자동 합성',
      icon: 'badge',
      color: 'blue',
      category: '이미지 편집',
    },
    {
      title: 'AI 얼굴 교체',
      description: 'Face swap 기술',
      icon: 'swap_horiz',
      color: 'pink',
      category: '이미지 편집',
    },
    {
      title: 'AI 노화/회춘',
      description: '나이 변환 필터',
      icon: 'schedule',
      color: 'orange',
      category: '이미지 편집',
    },
    {
      title: 'AI 성별 변환',
      description: '성별 체인지 필터',
      icon: 'wc',
      color: 'indigo',
      category: '이미지 편집',
    },
    {
      title: '흑백사진 컬러화',
      description: '옛날 사진 복원',
      icon: 'palette',
      color: 'green',
      category: '이미지 편집',
    },
    {
      title: 'AI 배경 제거/변경',
      description: '원클릭 배경 편집',
      icon: 'layers',
      color: 'yellow',
      category: '이미지 편집',
    },
    {
      title: 'AI 헤어스타일 변경',
      description: '가상 헤어 시뮬레이션',
      icon: 'face_retouching_natural',
      color: 'red',
      category: '이미지 편집',
    },
    {
      title: 'AI 타투 시뮬레이션',
      description: '가상 타투 체험',
      icon: 'auto_awesome',
      color: 'purple',
      category: '이미지 편집',
    },
    // 엔터테인먼트
    {
      title: 'MBTI 정밀 분석',
      description: 'AI 기반 성격 유형 테스트',
      icon: 'psychology',
      color: 'purple',
      category: '엔터테인먼트',
    },
    {
      title: '에니어그램 테스트',
      description: '9가지 성격 유형 분석',
      icon: 'hub',
      color: 'blue',
      category: '엔터테인먼트',
    },
    {
      title: 'Big 5 성격 테스트',
      description: '5대 성격 특성 분석',
      icon: 'workspaces',
      color: 'green',
      category: '엔터테인먼트',
    },
    {
      title: '스트레스 지수 측정',
      description: '정신 건강 체크',
      icon: 'spa',
      color: 'cyan',
      category: '엔터테인먼트',
    },
    {
      title: 'AI 닮은꼴 찾기',
      description: '연예인/동물 닮은꼴',
      icon: 'compare',
      color: 'pink',
      category: '엔터테인먼트',
    },
    {
      title: 'AI 금쪽이 테스트',
      description: '나쁜 버릇 진단',
      icon: 'child_care',
      color: 'orange',
      category: '엔터테인먼트',
    },
    // 건강/웰빙
    {
      title: 'AI 체형 분석',
      description: '체형 타입 진단',
      icon: 'accessibility',
      color: 'blue',
      category: '건강/웰빙',
    },
    {
      title: 'AI BMI 계산기',
      description: '비만도 측정',
      icon: 'monitor_weight',
      color: 'green',
      category: '건강/웰빙',
    },
    {
      title: 'AI 피부 분석',
      description: '피부 타입/트러블 진단',
      icon: 'face_6',
      color: 'pink',
      category: '건강/웰빙',
    },
  ];

  const colorClasses: Record<string, string> = {
    purple: 'bg-purple-500/20 text-purple-400',
    blue: 'bg-blue-500/20 text-blue-400',
    green: 'bg-green-500/20 text-green-400',
    yellow: 'bg-yellow-500/20 text-yellow-400',
    orange: 'bg-orange-500/20 text-orange-400',
    pink: 'bg-pink-500/20 text-pink-400',
    indigo: 'bg-indigo-500/20 text-indigo-400',
    red: 'bg-red-500/20 text-red-400',
    cyan: 'bg-cyan-500/20 text-cyan-400',
  };

  // 랜덤으로 6개 선택
  const randomServices = useMemo(() => {
    const shuffled = [...allServices].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 6);
  }, []);

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      {/* Header Image */}
      <div className="w-full">
        <div
          className="bg-cover bg-center flex flex-col justify-end overflow-hidden rounded-xl min-h-[240px]"
          style={{
            backgroundImage:
              'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          }}
        >
          <div className="flex flex-col gap-4 p-6">
            <p className="text-white text-2xl md:text-3xl font-bold leading-tight max-w-xl">
              AI 통합 플랫폼에서 다양한 AI 기능을 즐겨보세요
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => window.scrollTo({ top: 400, behavior: 'smooth' })}
                className="px-6 py-3 bg-white text-primary font-semibold rounded-lg hover:bg-white/90 transition-all duration-300 hover:shadow-lg"
              >
                서비스 둘러보기
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Random Services */}
      <div>
        <h2 className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
          빠른 시작
        </h2>
        {/* Mobile: Horizontal Scroll */}
        <div className="md:hidden flex overflow-x-auto [-ms-scrollbar-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex items-stretch p-4 gap-3">
            {randomServices.map((service, index) => (
              <div
                key={index}
                className="flex flex-col gap-3 p-4 rounded-xl bg-sidebar-dark hover:bg-sidebar-dark/80 hover:scale-105 hover:shadow-xl transition-all duration-300 cursor-pointer min-w-[160px] max-w-[160px]"
              >
                <div
                  className={`flex items-center justify-center w-12 h-12 ${
                    colorClasses[service.color]
                  } rounded-lg`}
                >
                  <span className="material-symbols-outlined text-2xl">
                    {service.icon}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-white text-sm font-semibold leading-tight">
                    {service.title}
                  </p>
                  <p className="text-[#ab9eb7] text-xs font-normal leading-normal">
                    {service.description}
                  </p>
                  <p className="text-primary text-xs font-medium leading-normal mt-1">
                    {service.category}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Desktop: Grid Layout */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-4 px-4">
          {randomServices.map((service, index) => (
            <div
              key={index}
              className="flex flex-col gap-3 p-4 rounded-xl bg-sidebar-dark hover:bg-sidebar-dark/80 hover:scale-105 hover:shadow-xl transition-all duration-300 cursor-pointer"
            >
              <div
                className={`flex items-center justify-center w-12 h-12 ${
                  colorClasses[service.color]
                } rounded-lg`}
              >
                <span className="material-symbols-outlined text-2xl">
                  {service.icon}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-white text-sm font-semibold leading-tight">
                  {service.title}
                </p>
                <p className="text-[#ab9eb7] text-xs font-normal leading-normal">
                  {service.description}
                </p>
                <p className="text-primary text-xs font-medium leading-normal mt-1">
                  {service.category}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
