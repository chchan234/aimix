export default function FortunePage() {
  const services = {
    traditional: [
      {
        title: 'AI 사주팔자',
        description: '생년월일시 기반 운세 분석',
        icon: 'calendar_today',
        color: 'purple',
      },
      {
        title: 'AI 관상',
        description: '얼굴 인식으로 관상 해석',
        icon: 'face',
        color: 'blue',
      },
      {
        title: 'AI 손금',
        description: '손바닥 스캔으로 손금 분석',
        icon: 'back_hand',
        color: 'green',
      },
    ],
    western: [
      {
        title: 'AI 별자리 운세',
        description: '일/주/월/년 운세',
        icon: 'star',
        color: 'yellow',
      },
      {
        title: 'AI 띠 운세',
        description: '12간지 기반 운세',
        icon: 'pets',
        color: 'orange',
      },
    ],
    compatibility: [
      {
        title: '연인 궁합',
        description: '커플 호환성 분석',
        icon: 'favorite',
        color: 'pink',
      },
      {
        title: '이름 궁합',
        description: '획수 기반 궁합',
        icon: 'edit',
        color: 'indigo',
      },
      {
        title: '부부 궁합',
        description: '결혼 생활 예측',
        icon: 'family_restroom',
        color: 'red',
      },
    ],
  };

  const colorClasses: Record<string, string> = {
    purple: 'bg-purple-500/20 text-purple-400',
    blue: 'bg-blue-500/20 text-blue-400',
    green: 'bg-green-500/20 text-green-400',
    yellow: 'bg-yellow-500/20 text-yellow-400',
    orange: 'bg-orange-500/20 text-orange-400',
    pink: 'bg-pink-500/20 text-pink-400',
    indigo: 'bg-indigo-500/20 text-indigo-400',
    red: 'bg-red-500/20 text-red-400',
  };

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto">
      <div className="px-4">
        <h1 className="text-white text-3xl font-bold mb-2">🔮 운세/점술 서비스</h1>
        <p className="text-[#ab9eb7] text-base">
          AI가 분석하는 당신의 운명과 미래
        </p>
      </div>

      {/* Traditional Fortune */}
      <div>
        <h2 className="text-white text-xl font-bold px-4 pb-4">전통 운세</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-4">
          {services.traditional.map((service, index) => (
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

      {/* Western Fortune */}
      <div>
        <h2 className="text-white text-xl font-bold px-4 pb-4">서양 운세</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-4">
          {services.western.map((service, index) => (
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

      {/* Compatibility */}
      <div>
        <h2 className="text-white text-xl font-bold px-4 pb-4">궁합/관계</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-4">
          {services.compatibility.map((service, index) => (
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
