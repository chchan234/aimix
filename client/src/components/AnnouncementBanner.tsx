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

export default function AnnouncementBanner() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Load dismissed announcements from localStorage
    const dismissed = localStorage.getItem('dismissedAnnouncements');
    if (dismissed) {
      setDismissedIds(JSON.parse(dismissed));
    }

    // Fetch announcements
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/announcements`);
      if (response.ok) {
        const data = await response.json();
        // Filter only important announcements
        const important = data.announcements.filter(
          (a: Announcement) => a.type === 'important'
        );
        setAnnouncements(important);
      }
    } catch (error) {
      console.error('Failed to fetch announcements:', error);
    }
  };

  const handleDismiss = (id: string) => {
    const newDismissed = [...dismissedIds, id];
    setDismissedIds(newDismissed);
    localStorage.setItem('dismissedAnnouncements', JSON.stringify(newDismissed));
  };

  // Filter out dismissed announcements
  const visibleAnnouncements = announcements.filter(
    a => !dismissedIds.includes(a.id)
  );

  if (visibleAnnouncements.length === 0) {
    return null;
  }

  const currentAnnouncement = visibleAnnouncements[currentIndex % visibleAnnouncements.length];

  return (
    <div className="bg-red-600 text-white px-4 py-2">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className="material-symbols-outlined text-xl flex-shrink-0">campaign</span>
          <div className="flex-1 min-w-0">
            <span className="font-medium mr-2">{currentAnnouncement.title}</span>
            <span className="text-red-100 text-sm truncate">{currentAnnouncement.content}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {visibleAnnouncements.length > 1 && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentIndex((currentIndex - 1 + visibleAnnouncements.length) % visibleAnnouncements.length)}
                className="p-1 hover:bg-red-700 rounded"
              >
                <span className="material-symbols-outlined text-sm">chevron_left</span>
              </button>
              <span className="text-xs text-red-200">
                {currentIndex + 1}/{visibleAnnouncements.length}
              </span>
              <button
                onClick={() => setCurrentIndex((currentIndex + 1) % visibleAnnouncements.length)}
                className="p-1 hover:bg-red-700 rounded"
              >
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </button>
            </div>
          )}
          <button
            onClick={() => handleDismiss(currentAnnouncement.id)}
            className="p-1 hover:bg-red-700 rounded"
            title="닫기"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>
      </div>
    </div>
  );
}
