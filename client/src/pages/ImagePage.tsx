export default function ImagePage() {
  const services = {
    avatar: [
      {
        title: 'AI 프로필 생성',
        description: '다양한 스타일 프로필 사진',
        icon: 'account_circle',
        color: 'cyan',
      },
      {
        title: 'AI 캐리커처',
        description: '만화풍 캐리커처 생성',
        icon: 'draw',
        color: 'purple',
      },
      {
        title: 'AI 증명사진',
        description: '정장/배경 자동 합성',
        icon: 'badge',
        color: 'blue',
      },
    ],
    editing: [
      {
        title: 'AI 얼굴 교체',
        description: 'Face swap 기술',
        icon: 'swap_horiz',
        color: 'pink',
      },
      {
        title: 'AI 노화/회춘',
        description: '나이 변환 필터',
        icon: 'schedule',
        color: 'orange',
      },
      {
        title: 'AI 성별 변환',
        description: '성별 체인지 필터',
        icon: 'wc',
        color: 'indigo',
      },
      {
        title: '흑백사진 컬러화',
        description: '옛날 사진 복원',
        icon: 'palette',
        color: 'green',
      },
    ],
    creative: [
      {
        title: 'AI 배경 제거/변경',
        description: '원클릭 배경 편집',
        icon: 'layers',
        color: 'yellow',
      },
      {
        title: 'AI 헤어스타일 변경',
        description: '가상 헤어 시뮬레이션',
        icon: 'face_retouching_natural',
        color: 'red',
      },
      {
        title: 'AI 타투 시뮬레이션',
        description: '가상 타투 체험',
        icon: 'auto_awesome',
        color: 'purple',
      },
    ],
  };

  const colorClasses: Record<string, string> = {
    cyan: 'bg-cyan-500/20 text-cyan-400',
    purple: 'bg-purple-500/20 text-purple-400',
    blue: 'bg-blue-500/20 text-blue-400',
    pink: 'bg-pink-500/20 text-pink-400',
    orange: 'bg-orange-500/20 text-orange-400',
    indigo: 'bg-indigo-500/20 text-indigo-400',
    green: 'bg-green-500/20 text-green-400',
    yellow: 'bg-yellow-500/20 text-yellow-400',
    red: 'bg-red-500/20 text-red-400',
  };

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto">
      <div className="px-4">
        <h1 className="text-white text-3xl font-bold mb-2">
          🎨 이미지 생성/편집 서비스
        </h1>
        <p className="text-[#ab9eb7] text-base">
          AI로 당신의 사진을 마법처럼 변환하세요
        </p>
      </div>

      {/* AI Avatar/Profile */}
      <div>
        <h2 className="text-white text-xl font-bold px-4 pb-4">
          AI 아바타/프로필
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-4">
          {services.avatar.map((service, index) => (
            <div
              key={index}
              className="flex flex-col gap-4 p-6 rounded-xl bg-sidebar-dark hover:bg-sidebar-dark/80 transition cursor-pointer"
            >
              <div
                className={`flex items-center justify-center w-16 h-16 ${
                  colorClasses[service.color]
                } rounded-lg`}
              >
                <span className="material-symbols-outlined text-4xl">
                  {service.icon}
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-white text-lg font-semibold">
                  {service.title}
                </p>
                <p className="text-[#ab9eb7] text-sm">{service.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Photo Editing/Restoration */}
      <div>
        <h2 className="text-white text-xl font-bold px-4 pb-4">
          사진 편집/복원
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-4">
          {services.editing.map((service, index) => (
            <div
              key={index}
              className="flex flex-col gap-4 p-6 rounded-xl bg-sidebar-dark hover:bg-sidebar-dark/80 transition cursor-pointer"
            >
              <div
                className={`flex items-center justify-center w-16 h-16 ${
                  colorClasses[service.color]
                } rounded-lg`}
              >
                <span className="material-symbols-outlined text-4xl">
                  {service.icon}
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-white text-lg font-semibold">
                  {service.title}
                </p>
                <p className="text-[#ab9eb7] text-sm">{service.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Creative Generation */}
      <div>
        <h2 className="text-white text-xl font-bold px-4 pb-4">창의적 생성</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-4">
          {services.creative.map((service, index) => (
            <div
              key={index}
              className="flex flex-col gap-4 p-6 rounded-xl bg-sidebar-dark hover:bg-sidebar-dark/80 transition cursor-pointer"
            >
              <div
                className={`flex items-center justify-center w-16 h-16 ${
                  colorClasses[service.color]
                } rounded-lg`}
              >
                <span className="material-symbols-outlined text-4xl">
                  {service.icon}
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-white text-lg font-semibold">
                  {service.title}
                </p>
                <p className="text-[#ab9eb7] text-sm">{service.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
