import { useState, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || '';

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: string;
  isPinned: boolean;
  createdAt: string;
}

export default function AnnouncementSection() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/announcements`);
      if (response.ok) {
        const data = await response.json();
        // Filter only general announcements
        const general = data.announcements.filter(
          (a: Announcement) => a.type === 'general'
        );
        setAnnouncements(general);
      }
    } catch (error) {
      console.error('Failed to fetch announcements:', error);
    }
  };

  if (announcements.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="material-symbols-outlined text-blue-600">campaign</span>
        <h2 className="text-lg font-semibold text-gray-900">공지사항</h2>
      </div>

      <div className="space-y-3">
        {announcements.slice(0, 5).map((announcement) => (
          <div
            key={announcement.id}
            className="border-b border-gray-100 last:border-0 pb-3 last:pb-0"
          >
            <button
              onClick={() => setExpanded(expanded === announcement.id ? null : announcement.id)}
              className="w-full text-left flex items-start justify-between gap-2"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">{announcement.title}</span>
                  <span className="text-xs text-gray-400">
                    {new Date(announcement.createdAt).toLocaleDateString('ko-KR')}
                  </span>
                </div>
                {expanded === announcement.id && (
                  <p className="text-sm text-gray-600 mt-2 whitespace-pre-wrap">
                    {announcement.content}
                  </p>
                )}
              </div>
              <span className="material-symbols-outlined text-gray-400 flex-shrink-0">
                {expanded === announcement.id ? 'expand_less' : 'expand_more'}
              </span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
