export default function Sidebar() {
  return (
    <aside className="w-64 flex-shrink-0 bg-sidebar-dark p-4 flex-col justify-between hidden lg:flex">
      <div className="flex flex-col gap-8">
        {/* Logo */}
        <div className="flex items-center gap-2 px-3">
          <span className="material-symbols-outlined text-primary text-3xl">hub</span>
          <h1 className="text-white text-xl font-bold">AIMix</h1>
        </div>

        {/* Navigation */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary">
              <span className="material-symbols-outlined fill text-white text-2xl">home</span>
              <p className="text-white text-sm font-medium leading-normal">홈</p>
            </div>
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-primary/20 cursor-pointer">
              <span className="material-symbols-outlined text-white text-2xl">explore</span>
              <p className="text-white text-sm font-medium leading-normal">탐색</p>
            </div>
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-primary/20 cursor-pointer">
              <span className="material-symbols-outlined text-white text-2xl">palette</span>
              <p className="text-white text-sm font-medium leading-normal">내 결과물</p>
            </div>
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-primary/20 cursor-pointer">
              <span className="material-symbols-outlined text-white text-2xl">storefront</span>
              <p className="text-white text-sm font-medium leading-normal">크레딧 구매</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom section */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-primary/20 cursor-pointer">
            <span className="material-symbols-outlined text-white text-2xl">settings</span>
            <p className="text-white text-sm font-medium leading-normal">설정</p>
          </div>
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-primary/20 cursor-pointer">
            <span className="material-symbols-outlined text-white text-2xl">help</span>
            <p className="text-white text-sm font-medium leading-normal">도움말</p>
          </div>
        </div>

        {/* User Profile */}
        <div className="flex gap-3 items-center border-t border-white/10 pt-4">
          <div
            className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
            style={{
              backgroundImage:
                'url("https://api.dicebear.com/7.x/avataaars/svg?seed=AIMix")',
            }}
          ></div>
          <div className="flex flex-col">
            <h1 className="text-white text-base font-medium leading-normal">사용자</h1>
            <p className="text-[#ab9eb7] text-sm font-normal leading-normal cursor-pointer hover:text-white">
              프로필 보기
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
