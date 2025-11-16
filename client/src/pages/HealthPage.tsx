export default function HealthPage() {
  const services = {
    health: [
      {
        title: 'AI 체형 분석',
        description: '체형 타입 진단',
        icon: 'accessibility',
        color: 'blue',
      },
      {
        title: 'AI BMI 계산기',
        description: '비만도 측정',
        icon: 'monitor_weight',
        color: 'green',
      },
      {
        title: 'AI 피부 분석',
        description: '피부 타입/트러블 진단',
        icon: 'face_6',
        color: 'pink',
      },
    ],
  };

  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-500/20 text-blue-400',
    green: 'bg-green-500/20 text-green-400',
    pink: 'bg-pink-500/20 text-pink-400',
  };

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto">
      <div className="px-4">
        <h1 className="text-white text-3xl font-bold mb-2">
          🏥 건강/웰빙 서비스
        </h1>
        <p className="text-[#ab9eb7] text-base">
          AI가 분석하는 당신의 건강 상태
        </p>
      </div>

      {/* Health Analysis */}
      <div>
        <h2 className="text-white text-xl font-bold px-4 pb-4">건강 분석</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-4">
          {services.health.map((service, index) => (
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
