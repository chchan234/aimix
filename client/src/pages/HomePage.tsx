export default function HomePage() {
  const quickStartServices = [
    {
      title: 'AI 관상 분석',
      description: '얼굴로 운세 확인',
      image:
        'https://images.unsplash.com/photo-1612940960267-4549a58fb257?w=400&h=400&fit=crop',
    },
    {
      title: '이미지 생성',
      description: '놀라운 비주얼 제작',
      image:
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=400&fit=crop',
    },
    {
      title: '꿈 해몽',
      description: '숨겨진 의미 찾기',
      image:
        'https://images.unsplash.com/photo-1518005020951-eccb494ad742?w=400&h=400&fit=crop',
    },
    {
      title: '스토리 생성',
      description: '독특한 이야기 만들기',
      image:
        'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=400&fit=crop',
    },
  ];

  const forYouCards = [
    {
      type: 'image',
      title: '최근 생성한 작품',
      description: '프롬프트: "우주의 고양이"',
      image:
        'https://images.unsplash.com/photo-1573865526739-10c1d3a1f0cc?w=400&h=300&fit=crop',
    },
    {
      type: 'icon',
      title: '인기 프롬프트 시도',
      description: '스토리 생성: "모든 사람의 이야기가 담긴 도서관"',
      icon: 'auto_stories',
      iconColor: 'primary',
    },
    {
      type: 'icon',
      title: '새로운 기능: AI 음악 생성',
      description: '분위기를 설명하면 독특한 사운드트랙을 만들어드려요.',
      icon: 'music_note',
      iconColor: 'cyan-400',
    },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      {/* Header Image */}
      <div className="w-full">
        <div
          className="bg-cover bg-center flex flex-col justify-end overflow-hidden rounded-xl min-h-[240px]"
          style={{
            backgroundImage:
              'linear-gradient(0deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0) 45%), url("https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=1200&h=400&fit=crop")',
          }}
        >
          <div className="flex p-6">
            <p className="text-white text-2xl md:text-3xl font-bold leading-tight max-w-xl">
              AI로 창의력을 발휘하세요! 새로운 이미지 생성기를 만나보세요
            </p>
          </div>
        </div>
      </div>

      {/* Quick Start Section */}
      <div>
        <h2 className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
          빠른 시작
        </h2>
        <div className="flex overflow-x-auto [-ms-scrollbar-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex items-stretch p-4 gap-4">
            {quickStartServices.map((service, index) => (
              <div
                key={index}
                className="flex h-full flex-1 flex-col gap-4 rounded-xl min-w-52 sm:min-w-60 cursor-pointer hover:scale-105 transition-transform"
              >
                <div
                  className="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-xl flex flex-col justify-end p-4"
                  style={{
                    backgroundImage: `linear-gradient(180deg, rgba(25, 17, 33, 0) 0%, #191121 100%), url("${service.image}")`,
                  }}
                >
                  <p className="text-white text-base font-medium leading-normal">
                    {service.title}
                  </p>
                </div>
                <p className="text-[#ab9eb7] text-sm font-normal leading-normal px-2">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* For You Section */}
      <div>
        <h2 className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
          추천
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-4">
          {forYouCards.map((card, index) => (
            <div
              key={index}
              className="flex flex-col gap-3 p-4 rounded-xl bg-sidebar-dark hover:bg-sidebar-dark/80 transition cursor-pointer"
            >
              {card.type === 'image' ? (
                <img
                  alt={card.title}
                  className="w-full h-40 object-cover rounded-lg"
                  src={card.image}
                />
              ) : (
                <div
                  className={`flex items-center justify-center w-full h-40 ${
                    card.iconColor === 'cyan-400'
                      ? 'bg-cyan-500/20'
                      : 'bg-primary/20'
                  } rounded-lg`}
                >
                  <span
                    className={`material-symbols-outlined ${
                      card.iconColor === 'cyan-400' ? 'text-cyan-400' : 'text-primary'
                    } text-5xl`}
                  >
                    {card.icon}
                  </span>
                </div>
              )}
              <div className="flex flex-col gap-1">
                <p className="text-white text-base font-medium leading-normal">
                  {card.title}
                </p>
                <p className="text-[#ab9eb7] text-sm font-normal leading-normal">
                  {card.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
