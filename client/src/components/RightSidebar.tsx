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
    <aside className="w-80 flex-shrink-0 bg-sidebar-dark p-6 flex-col gap-6 hidden xl:flex">
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
    </aside>
  );
}
