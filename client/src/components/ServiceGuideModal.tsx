import { useTranslation } from 'react-i18next';

interface ServiceGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ServiceGuideModal({ isOpen, onClose }: ServiceGuideModalProps) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  const services = [
    {
      category: 'fortune',
      icon: 'auto_awesome',
      color: 'purple',
      services: [
        { name: 'AI 사주팔자', credits: 150, icon: 'stars' },
        { name: 'AI 관상', credits: 100, icon: 'face' },
        { name: 'AI 손금', credits: 100, icon: 'back_hand' },
        { name: '타로 카드', credits: 150, icon: 'style' },
      ],
    },
    {
      category: 'image',
      icon: 'image',
      color: 'blue',
      services: [
        { name: 'AI 프로필 생성', credits: 200, icon: 'portrait' },
        { name: 'AI 캐리커처', credits: 200, icon: 'sentiment_satisfied' },
        { name: 'AI 증명사진', credits: 150, icon: 'badge' },
        { name: 'AI 배경 제거', credits: 100, icon: 'layers' },
      ],
    },
    {
      category: 'entertainment',
      icon: 'sports_esports',
      color: 'pink',
      services: [
        { name: 'MBTI 정밀 분석', credits: 150, icon: 'psychology' },
        { name: '에니어그램', credits: 150, icon: 'person_search' },
        { name: 'AI 닮은꼴', credits: 100, icon: 'groups' },
        { name: '스트레스 측정', credits: 100, icon: 'mood' },
      ],
    },
    {
      category: 'health',
      icon: 'favorite',
      color: 'green',
      services: [
        { name: 'AI 체형 분석', credits: 100, icon: 'fitness_center' },
        { name: 'AI BMI 계산', credits: 50, icon: 'monitor_weight' },
        { name: 'AI 피부 분석', credits: 100, icon: 'face_retouching_natural' },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1625] rounded-2xl border border-white/10 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-[#1a1625] border-b border-white/10 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-blue-400 text-2xl">menu_book</span>
            </div>
            <h2 className="text-white text-2xl font-bold">{t('help.guides.serviceGuide.title')}</h2>
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
          {/* 서비스 이용 방법 */}
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl p-5 border border-blue-500/20">
            <h3 className="text-white text-lg font-bold mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-400">info</span>
              {t('help.serviceGuide.howToUse.title', { defaultValue: '서비스 이용 방법' })}
            </h3>
            <ol className="space-y-2 text-sm text-[#ab9eb7]">
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">1.</span>
                <span>{t('help.serviceGuide.howToUse.step1', { defaultValue: '원하는 카테고리에서 서비스를 선택하세요' })}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">2.</span>
                <span>{t('help.serviceGuide.howToUse.step2', { defaultValue: '필요한 정보를 입력하거나 이미지를 업로드하세요' })}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">3.</span>
                <span>{t('help.serviceGuide.howToUse.step3', { defaultValue: '크레딧을 확인하고 서비스를 시작하세요' })}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">4.</span>
                <span>{t('help.serviceGuide.howToUse.step4', { defaultValue: 'AI가 분석한 결과를 확인하고 다운로드하세요' })}</span>
              </li>
            </ol>
          </div>

          {/* 서비스 카테고리별 안내 */}
          <div className="space-y-4">
            {services.map((category) => (
              <div key={category.category} className="bg-[#2a2436] rounded-xl p-5 border border-white/10">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 bg-${category.color}-500/20 rounded-lg flex items-center justify-center`}>
                    <span className={`material-symbols-outlined text-${category.color}-400`}>{category.icon}</span>
                  </div>
                  <h3 className="text-white text-lg font-bold">
                    {t(`pages.${category.category}.title`, { defaultValue: category.category })}
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {category.services.map((service) => (
                    <div key={service.name} className="bg-[#1a1625] rounded-lg p-4 hover:bg-[#201a2a] transition">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-primary text-sm">{service.icon}</span>
                          <p className="text-white text-sm font-semibold">{service.name}</p>
                        </div>
                        <span className="text-primary text-xs font-semibold">{service.credits} 크레딧</span>
                      </div>
                      <p className="text-xs text-[#ab9eb7]">
                        {t(`help.serviceGuide.${category.category}.${service.name}`, {
                          defaultValue: 'AI 기반 정확한 분석 제공',
                        })}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* 크레딧 안내 */}
          <div className="bg-[#2a2436] rounded-xl p-5 border border-white/10">
            <h3 className="text-white text-lg font-bold mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">toll</span>
              {t('help.serviceGuide.credits.title', { defaultValue: '크레딧 안내' })}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#1a1625] rounded-lg p-4">
                <p className="text-[#ab9eb7] text-xs mb-1">{t('help.serviceGuide.credits.simple', { defaultValue: '간단한 서비스' })}</p>
                <p className="text-white text-2xl font-bold">50-100</p>
                <p className="text-[#ab9eb7] text-xs mt-1">크레딧</p>
              </div>
              <div className="bg-[#1a1625] rounded-lg p-4">
                <p className="text-[#ab9eb7] text-xs mb-1">{t('help.serviceGuide.credits.standard', { defaultValue: '일반 서비스' })}</p>
                <p className="text-white text-2xl font-bold">100-150</p>
                <p className="text-[#ab9eb7] text-xs mt-1">크레딧</p>
              </div>
              <div className="bg-[#1a1625] rounded-lg p-4">
                <p className="text-[#ab9eb7] text-xs mb-1">{t('help.serviceGuide.credits.complex', { defaultValue: '고급 서비스' })}</p>
                <p className="text-white text-2xl font-bold">150-300</p>
                <p className="text-[#ab9eb7] text-xs mt-1">크레딧</p>
              </div>
            </div>
          </div>

          {/* 주의사항 */}
          <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-xl p-5 border border-orange-500/20">
            <h3 className="text-white font-bold mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-orange-400">warning</span>
              {t('help.serviceGuide.notice.title', { defaultValue: '⚠️ 주의사항' })}
            </h3>
            <ul className="space-y-2 text-sm text-[#ab9eb7]">
              <li>• {t('help.serviceGuide.notice.item1', { defaultValue: '서비스 이용 시 크레딧이 차감되며, 취소 또는 환불되지 않습니다' })}</li>
              <li>• {t('help.serviceGuide.notice.item2', { defaultValue: 'AI 결과는 참고용이며, 실제와 다를 수 있습니다' })}</li>
              <li>• {t('help.serviceGuide.notice.item3', { defaultValue: '이미지 업로드 시 개인정보가 포함되지 않도록 주의하세요' })}</li>
              <li>• {t('help.serviceGuide.notice.item4', { defaultValue: '결과물은 "내 결과물" 페이지에서 확인 가능합니다' })}</li>
            </ul>
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
