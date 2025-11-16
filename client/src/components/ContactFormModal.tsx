import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface ContactFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  contactType: 'email' | 'chat';
}

export default function ContactFormModal({ isOpen, onClose, contactType }: ContactFormModalProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 로그인 상태 확인 및 자동 채우기
  useEffect(() => {
    if (isOpen) {
      const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
      if (isLoggedIn) {
        const username = localStorage.getItem('username') || '';
        const userEmail = localStorage.getItem('userEmail') || '';
        setFormData((prev) => ({
          ...prev,
          name: username,
          email: userEmail,
        }));
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (contactType === 'email') {
      // 이메일 문의: mailto 링크 사용
      const subject = encodeURIComponent(formData.subject || '문의사항');
      const body = encodeURIComponent(
        `이름: ${formData.name}\n이메일: ${formData.email}\n\n${formData.message}`
      );
      window.location.href = `mailto:coldcow11@gmail.com?subject=${subject}&body=${body}`;

      setTimeout(() => {
        setIsSubmitting(false);
        onClose();
        setFormData({ name: '', email: '', subject: '', message: '' });
      }, 1000);
    } else {
      // 1:1 채팅: 폼 제출 (백엔드가 있다면 API 호출)
      setTimeout(() => {
        setIsSubmitting(false);
        alert(
          t('help.contact.chatSubmitted', {
            defaultValue: '문의가 접수되었습니다. 빠른 시일 내에 답변드리겠습니다.',
          })
        );
        onClose();
        setFormData({ name: '', email: '', subject: '', message: '' });
      }, 1500);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1625] rounded-2xl border border-white/10 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-[#1a1625] border-b border-white/10 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 ${
                contactType === 'email' ? 'bg-primary/20' : 'bg-blue-500/20'
              } rounded-xl flex items-center justify-center`}
            >
              <span
                className={`material-symbols-outlined ${
                  contactType === 'email' ? 'text-primary' : 'text-blue-400'
                } text-2xl`}
              >
                {contactType === 'email' ? 'email' : 'chat'}
              </span>
            </div>
            <div>
              <h2 className="text-white text-2xl font-bold">
                {contactType === 'email'
                  ? t('help.contact.buttons.email', { defaultValue: '이메일 문의' })
                  : t('help.contact.buttons.chat', { defaultValue: '1:1 채팅' })}
              </h2>
              <p className="text-[#ab9eb7] text-sm">
                {contactType === 'email'
                  ? 'coldcow11@gmail.com'
                  : t('help.contact.chatDesc', { defaultValue: '실시간 문의 접수' })}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-lg hover:bg-white/10 transition flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-white">close</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* 이름 */}
          <div>
            <label htmlFor="name" className="block text-white text-sm font-semibold mb-2">
              {t('help.contact.form.name', { defaultValue: '이름' })} *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full bg-[#2a2436] text-white px-4 py-3 rounded-lg border border-white/10 focus:border-primary focus:outline-none"
              placeholder={t('help.contact.form.namePlaceholder', { defaultValue: '이름을 입력하세요' })}
            />
          </div>

          {/* 이메일 */}
          <div>
            <label htmlFor="email" className="block text-white text-sm font-semibold mb-2">
              {t('help.contact.form.email', { defaultValue: '이메일' })} *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full bg-[#2a2436] text-white px-4 py-3 rounded-lg border border-white/10 focus:border-primary focus:outline-none"
              placeholder={t('help.contact.form.emailPlaceholder', { defaultValue: '이메일을 입력하세요' })}
            />
          </div>

          {/* 제목 */}
          <div>
            <label htmlFor="subject" className="block text-white text-sm font-semibold mb-2">
              {t('help.contact.form.subject', { defaultValue: '제목' })} *
            </label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
              className="w-full bg-[#2a2436] text-white px-4 py-3 rounded-lg border border-white/10 focus:border-primary focus:outline-none"
              placeholder={t('help.contact.form.subjectPlaceholder', { defaultValue: '문의 제목을 입력하세요' })}
            />
          </div>

          {/* 메시지 */}
          <div>
            <label htmlFor="message" className="block text-white text-sm font-semibold mb-2">
              {t('help.contact.form.message', { defaultValue: '내용' })} *
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              rows={6}
              className="w-full bg-[#2a2436] text-white px-4 py-3 rounded-lg border border-white/10 focus:border-primary focus:outline-none resize-none"
              placeholder={t('help.contact.form.messagePlaceholder', {
                defaultValue: '문의 내용을 상세히 입력해주세요',
              })}
            />
          </div>

          {/* 안내 메시지 */}
          <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20">
            <div className="flex items-start gap-2">
              <span className="material-symbols-outlined text-blue-400 text-sm mt-0.5">info</span>
              <div className="text-sm text-[#ab9eb7]">
                {contactType === 'email' ? (
                  <p>
                    {t('help.contact.emailInfo', {
                      defaultValue:
                        '제출 시 기본 이메일 클라이언트가 실행됩니다. 메일을 보내시면 coldcow11@gmail.com으로 전송됩니다.',
                    })}
                  </p>
                ) : (
                  <p>
                    {t('help.contact.chatInfo', {
                      defaultValue: '평일 09:00 - 18:00에 순차적으로 답변드리겠습니다. 긴급한 문의는 이메일을 이용해주세요.',
                    })}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* 제출 버튼 */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-[#2a2436] text-white py-3 rounded-xl font-semibold hover:bg-[#3a3446] transition"
            >
              {t('common.cancel', { defaultValue: '취소' })}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="material-symbols-outlined animate-spin">progress_activity</span>
                  {t('help.contact.form.submitting', { defaultValue: '전송 중...' })}
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">send</span>
                  {t('help.contact.form.submit', { defaultValue: '문의하기' })}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
