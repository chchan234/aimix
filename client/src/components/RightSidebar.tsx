export default function RightSidebar() {
  const recentActivities = [
    {
      icon: 'image',
      title: 'AI 관상 분석 완료',
      time: '2분 전',
    },
    {
      icon: 'auto_awesome',
      title: '꿈 해몽 이용',
      time: '1시간 전',
    },
    {
      icon: 'image',
      title: '타로 카드 리딩',
      time: '5시간 전',
    },
    {
      icon: 'star',
      title: 'AI 사주팔자 확인',
      time: '어제',
    },
  ];

  return (
    <aside className="w-80 flex-shrink-0 bg-sidebar-dark p-6 flex-col gap-8 hidden xl:flex">
      {/* Notification button */}
      <div className="flex justify-end">
        <button className="p-2 rounded-full hover:bg-primary/20">
          <span className="material-symbols-outlined text-white text-2xl">
            notifications
          </span>
        </button>
      </div>

      <div className="flex flex-col gap-6">
        {/* Credit Balance Widget */}
        <div className="flex flex-col gap-4 p-5 rounded-xl bg-gradient-to-br from-primary to-purple-600">
          <div className="flex justify-between items-center">
            <p className="text-white text-sm font-medium">크레딧 잔액</p>
            <span className="material-symbols-outlined text-white text-2xl">toll</span>
          </div>
          <p className="text-white text-4xl font-bold">1,200</p>
          <button className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-white text-primary text-sm font-bold leading-normal tracking-[0.015em] hover:bg-white/90 transition">
            <span className="truncate">크레딧 충전</span>
          </button>
        </div>

        {/* Recent Activity */}
        <div className="flex flex-col gap-4">
          <h3 className="text-white text-lg font-bold">최근 활동</h3>
          <div className="flex flex-col gap-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="p-2 bg-primary/20 rounded-full">
                  <span className="material-symbols-outlined text-primary">
                    {activity.icon}
                  </span>
                </div>
                <div className="flex flex-col">
                  <p className="text-white text-sm font-medium">{activity.title}</p>
                  <p className="text-[#ab9eb7] text-xs">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
