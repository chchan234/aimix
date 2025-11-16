export default function EntertainmentPage() {
  const services = {
    psychology: [
      {
        title: 'MBTI 정밀 분석',
        description: 'AI 기반 성격 유형 테스트',
        icon: 'psychology',
        color: 'purple',
      },
      {
        title: '에니어그램 테스트',
        description: '9가지 성격 유형 분석',
        icon: 'hub',
        color: 'blue',
      },
      {
        title: 'Big 5 성격 테스트',
        description: '5대 성격 특성 분석',
        icon: 'workspaces',
        color: 'green',
      },
      {
        title: '스트레스 지수 측정',
        description: '정신 건강 체크',
        icon: 'spa',
        color: 'cyan',
      },
    ],
    fun: [
      {
        title: 'AI 닮은꼴 찾기',
        description: '연예인/동물 닮은꼴',
        icon: 'compare',
        color: 'pink',
      },
      {
        title: 'AI 금쪽이 테스트',
        description: '나쁜 버릇 진단',
        icon: 'child_care',
        color: 'orange',
      },
    ],
  };

  const colorClasses: Record<string, string> = {
    purple: 'bg-purple-500/20 text-purple-400',
    blue: 'bg-blue-500/20 text-blue-400',
    green: 'bg-green-500/20 text-green-400',
    cyan: 'bg-cyan-500/20 text-cyan-400',
    pink: 'bg-pink-500/20 text-pink-400',
    orange: 'bg-orange-500/20 text-orange-400',
  };

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto">
      <div className="px-4">
        <h1 className="text-white text-3xl font-bold mb-2">
          🎮 엔터테인먼트/게임
        </h1>
        <p className="text-[#ab9eb7] text-base">
          재미있는 심리 테스트와 게임으로 자신을 알아보세요
        </p>
      </div>

      {/* Psychology Tests */}
      <div>
        <h2 className="text-white text-xl font-bold px-4 pb-4">심리 분석</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-4">
          {services.psychology.map((service, index) => (
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

      {/* Fun/Challenge */}
      <div>
        <h2 className="text-white text-xl font-bold px-4 pb-4">재미/도전</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-4">
          {services.fun.map((service, index) => (
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
