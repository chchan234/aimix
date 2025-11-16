import { useTranslation } from 'react-i18next';

interface GettingStartedGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GettingStartedGuideModal({ isOpen, onClose }: GettingStartedGuideModalProps) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1625] rounded-2xl border border-white/10 max-w-3xl w-full max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-[#1a1625] border-b border-white/10 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-purple-400 text-2xl">rocket_launch</span>
            </div>
            <h2 className="text-white text-2xl font-bold">{t('help.guides.gettingStarted.title')}</h2>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-lg hover:bg-white/10 transition flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-white">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Step 1: 회원가입 */}
          <div className="bg-[#2a2436] rounded-xl p-5 border border-white/10">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-primary font-bold">1</span>
              </div>
              <div className="flex-1">
                <h3 className="text-white text-lg font-bold mb-2">
                  {t('help.guide.step1.title', { defaultValue: '계정 만들기' })}
                </h3>
                <p className="text-[#ab9eb7] text-sm mb-3">
                  {t('help.guide.step1.description', {
                    defaultValue:
                      '우측 상단의 "회원가입" 버튼을 클릭하여 이메일로 가입하거나, Google, Kakao 계정으로 간편 가입이 가능합니다.',
                  })}
                </p>
                <ul className="space-y-2 text-sm text-[#ab9eb7]">
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-sm">check_circle</span>
                    {t('help.guide.step1.item1', { defaultValue: '이메일 가입: 이메일 인증 필요' })}
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-sm">check_circle</span>
                    {t('help.guide.step1.item2', { defaultValue: '소셜 가입: Google, Kakao 간편 인증' })}
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Step 2: 크레딧 충전 */}
          <div className="bg-[#2a2436] rounded-xl p-5 border border-white/10">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-primary font-bold">2</span>
              </div>
              <div className="flex-1">
                <h3 className="text-white text-lg font-bold mb-2">
                  {t('help.guide.step2.title', { defaultValue: '크레딧 충전하기' })}
                </h3>
                <p className="text-[#ab9eb7] text-sm mb-3">
                  {t('help.guide.step2.description', {
                    defaultValue:
                      'AI 서비스를 이용하려면 크레딧이 필요합니다. "크레딧 구매" 메뉴에서 원하는 패키지를 선택하세요.',
                  })}
                </p>
                <ul className="space-y-2 text-sm text-[#ab9eb7]">
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-sm">check_circle</span>
                    {t('help.guide.step2.item1', { defaultValue: '다양한 패키지: 1,000 ~ 30,000 크레딧' })}
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-sm">check_circle</span>
                    {t('help.guide.step2.item2', { defaultValue: '보너스 제공: 대용량 패키지 구매 시' })}
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-sm">check_circle</span>
                    {t('help.guide.step2.item3', { defaultValue: '유효기간 없음: 영구 사용 가능' })}
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Step 3: 서비스 이용 */}
          <div className="bg-[#2a2436] rounded-xl p-5 border border-white/10">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-primary font-bold">3</span>
              </div>
              <div className="flex-1">
                <h3 className="text-white text-lg font-bold mb-2">
                  {t('help.guide.step3.title', { defaultValue: 'AI 서비스 이용하기' })}
                </h3>
                <p className="text-[#ab9eb7] text-sm mb-3">
                  {t('help.guide.step3.description', {
                    defaultValue: '4가지 카테고리에서 원하는 AI 서비스를 선택하고 이용하세요.',
                  })}
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#1a1625] rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="material-symbols-outlined text-purple-400 text-sm">auto_awesome</span>
                      <p className="text-white text-sm font-semibold">운세/점술</p>
                    </div>
                    <p className="text-xs text-[#ab9eb7]">사주, 관상, 타로 등</p>
                  </div>
                  <div className="bg-[#1a1625] rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="material-symbols-outlined text-blue-400 text-sm">image</span>
                      <p className="text-white text-sm font-semibold">이미지 편집</p>
                    </div>
                    <p className="text-xs text-[#ab9eb7]">프로필, 캐리커처 등</p>
                  </div>
                  <div className="bg-[#1a1625] rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="material-symbols-outlined text-pink-400 text-sm">sports_esports</span>
                      <p className="text-white text-sm font-semibold">엔터테인먼트</p>
                    </div>
                    <p className="text-xs text-[#ab9eb7]">MBTI, 닮은꼴 등</p>
                  </div>
                  <div className="bg-[#1a1625] rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="material-symbols-outlined text-green-400 text-sm">favorite</span>
                      <p className="text-white text-sm font-semibold">건강/웰빙</p>
                    </div>
                    <p className="text-xs text-[#ab9eb7]">체형분석, BMI 등</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 4: 결과 확인 */}
          <div className="bg-[#2a2436] rounded-xl p-5 border border-white/10">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-primary font-bold">4</span>
              </div>
              <div className="flex-1">
                <h3 className="text-white text-lg font-bold mb-2">
                  {t('help.guide.step4.title', { defaultValue: '결과 확인 및 관리' })}
                </h3>
                <p className="text-[#ab9eb7] text-sm mb-3">
                  {t('help.guide.step4.description', {
                    defaultValue: '"내 결과물" 페이지에서 이용한 서비스의 결과를 확인하고 관리할 수 있습니다.',
                  })}
                </p>
                <ul className="space-y-2 text-sm text-[#ab9eb7]">
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-sm">check_circle</span>
                    {t('help.guide.step4.item1', { defaultValue: '다운로드: 결과물 저장' })}
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-sm">check_circle</span>
                    {t('help.guide.step4.item2', { defaultValue: '공유: SNS 공유 기능' })}
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-sm">check_circle</span>
                    {t('help.guide.step4.item3', { defaultValue: '관리: 카테고리별 필터링' })}
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-xl p-5 border border-purple-500/20">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-purple-400 text-2xl">lightbulb</span>
              <div>
                <h3 className="text-white font-bold mb-2">
                  {t('help.guide.tips.title', { defaultValue: '💡 유용한 팁' })}
                </h3>
                <ul className="space-y-2 text-sm text-[#ab9eb7]">
                  <li>• {t('help.guide.tips.item1', { defaultValue: '대용량 패키지 구매 시 보너스 크레딧을 받을 수 있습니다' })}</li>
                  <li>• {t('help.guide.tips.item2', { defaultValue: '설정에서 언어를 변경할 수 있습니다 (한국어/English)' })}</li>
                  <li>• {t('help.guide.tips.item3', { defaultValue: '문의사항은 고객센터를 통해 빠르게 해결하세요' })}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-white/10 p-6">
          <button
            onClick={onClose}
            className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary/90 transition"
          >
            {t('common.close', { defaultValue: '닫기' })}
          </button>
        </div>
      </div>
    </div>
  );
}
