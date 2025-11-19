import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { isLoggedIn, getToken } from '../services/auth';

interface DashboardStats {
  totalUsers: number;
  newUsers: number;
  totalCreditsCharged: number;
  monthlyCreditsCharged: number;
  totalRevenue: number;
  monthlyRevenue: number;
  serviceUsageCount: number;
}

interface User {
  id: string;
  email: string;
  username: string | null;
  provider: string;
  providerId: string | null;
  credits: number;
  lifetimeCredits: number;
  role: string;
  createdAt: string;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: string;
  isActive: boolean;
  isPinned: boolean;
  createdAt: string;
}

interface ActivityLog {
  id: string;
  adminId: string;
  action: string;
  targetType: string | null;
  targetId: string | null;
  details: any;
  ipAddress: string;
  createdAt: string;
}

type TabType = 'dashboard' | 'users' | 'credits' | 'analytics' | 'announcements' | 'logs';

const API_BASE = import.meta.env.VITE_API_URL || '';

export default function AdminPage() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dashboard state
  const [stats, setStats] = useState<DashboardStats | null>(null);

  // Users state
  const [users, setUsers] = useState<User[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [userPage, _setUserPage] = useState(1);
  const [userTotal, setUserTotal] = useState(0);

  // Credit charge state
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [chargeAmount, setChargeAmount] = useState('');
  const [chargeReason, setChargeReason] = useState('');

  // Announcements state
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', content: '', type: 'info' });

  // Logs state
  const [logs, setLogs] = useState<ActivityLog[]>([]);

  // Auth check
  useEffect(() => {
    if (!isLoggedIn()) {
      setLocation('/login');
      return;
    }
    checkAdminAccess();
  }, [setLocation]);

  const checkAdminAccess = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/admin/status`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      });

      if (!response.ok) {
        setLocation('/');
        return;
      }

      setLoading(false);
      loadDashboard();
    } catch {
      setLocation('/');
    }
  };

  const loadDashboard = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/admin/dashboard`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    }
  };

  const loadUsers = async (search = '', page = 1) => {
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (search) params.append('search', search);

      const response = await fetch(`${API_BASE}/api/admin/users?${params}`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
        setUserTotal(data.pagination.total);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    }
  };

  const loadAnnouncements = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/admin/announcements`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAnnouncements(data.announcements);
      }
    } catch (err) {
      console.error('Failed to load announcements:', err);
    }
  };

  const loadLogs = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/admin/logs`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs);
      }
    } catch (err) {
      console.error('Failed to load logs:', err);
    }
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setError(null);

    switch (tab) {
      case 'dashboard':
        loadDashboard();
        break;
      case 'users':
      case 'credits':
        loadUsers(userSearch, userPage);
        break;
      case 'announcements':
        loadAnnouncements();
        break;
      case 'logs':
        loadLogs();
        break;
    }
  };

  const handleChargeCredits = async () => {
    if (!selectedUser || !chargeAmount) return;

    try {
      const response = await fetch(`${API_BASE}/api/admin/credits/charge`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: selectedUser.id,
          amount: parseInt(chargeAmount),
          reason: chargeReason
        })
      });

      if (response.ok) {
        const data = await response.json();
        alert(`크레딧 ${chargeAmount}개가 충전되었습니다. 새 잔액: ${data.newCredits}`);
        setSelectedUser(null);
        setChargeAmount('');
        setChargeReason('');
        loadUsers(userSearch, userPage);
      } else {
        const data = await response.json();
        setError(data.error || '크레딧 충전에 실패했습니다.');
      }
    } catch {
      setError('크레딧 충전 중 오류가 발생했습니다.');
    }
  };

  const handleCreateAnnouncement = async () => {
    if (!newAnnouncement.title || !newAnnouncement.content) return;

    try {
      const response = await fetch(`${API_BASE}/api/admin/announcements`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newAnnouncement)
      });

      if (response.ok) {
        setNewAnnouncement({ title: '', content: '', type: 'info' });
        loadAnnouncements();
      } else {
        const data = await response.json();
        setError(data.error || '공지사항 등록에 실패했습니다.');
      }
    } catch {
      setError('공지사항 등록 중 오류가 발생했습니다.');
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(`${API_BASE}/api/admin/announcements/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      });

      if (response.ok) {
        loadAnnouncements();
      }
    } catch {
      setError('공지사항 삭제에 실패했습니다.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">운영 페이지</h1>

        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 pb-4">
          {[
            { id: 'dashboard', label: '대시보드', icon: 'dashboard' },
            { id: 'users', label: '사용자 관리', icon: 'people' },
            { id: 'credits', label: '크레딧 충전', icon: 'payments' },
            { id: 'analytics', label: '서비스 통계', icon: 'analytics' },
            { id: 'announcements', label: '공지사항', icon: 'campaign' },
            { id: 'logs', label: '활동 로그', icon: 'history' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id as TabType)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="material-symbols-outlined text-xl">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="전체 사용자" value={stats.totalUsers} icon="people" />
            <StatCard title="이번 달 신규" value={stats.newUsers} icon="person_add" />
            <StatCard title="이번 달 크레딧" value={stats.monthlyCreditsCharged} icon="toll" />
            <StatCard title="이번 달 서비스 이용" value={stats.serviceUsageCount} icon="auto_awesome" />
            <StatCard title="전체 크레딧" value={stats.totalCreditsCharged} icon="savings" />
            <StatCard title="이번 달 수익" value={`${stats.monthlyRevenue.toLocaleString()}원`} icon="paid" />
            <StatCard title="전체 수익" value={`${stats.totalRevenue.toLocaleString()}원`} icon="account_balance" />
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="mb-4">
              <input
                type="text"
                placeholder="이메일, 사용자명, providerId로 검색"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && loadUsers(userSearch, 1)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">이메일</th>
                    <th className="text-left py-2">Provider</th>
                    <th className="text-right py-2">크레딧</th>
                    <th className="text-right py-2">누적</th>
                    <th className="text-left py-2">역할</th>
                    <th className="text-left py-2">가입일</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-gray-50">
                      <td className="py-2">{user.email}</td>
                      <td className="py-2">{user.provider}</td>
                      <td className="py-2 text-right">{user.credits}</td>
                      <td className="py-2 text-right">{user.lifetimeCredits}</td>
                      <td className="py-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="py-2">{new Date(user.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 text-sm text-gray-600">
              총 {userTotal}명
            </div>
          </div>
        )}

        {/* Credits Tab */}
        {activeTab === 'credits' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">사용자 선택</h3>
              <input
                type="text"
                placeholder="이메일로 검색"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && loadUsers(userSearch, 1)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <div className="max-h-80 overflow-y-auto">
                {users.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => setSelectedUser(user)}
                    className={`p-3 border rounded-lg mb-2 cursor-pointer transition ${
                      selectedUser?.id === user.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium">{user.email}</div>
                    <div className="text-sm text-gray-600">
                      크레딧: {user.credits} | 누적: {user.lifetimeCredits}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">크레딧 충전</h3>

              {selectedUser ? (
                <div>
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="font-medium">{selectedUser.email}</div>
                    <div className="text-sm text-gray-600">
                      현재 크레딧: {selectedUser.credits}
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      충전량
                    </label>
                    <input
                      type="number"
                      value={chargeAmount}
                      onChange={(e) => setChargeAmount(e.target.value)}
                      placeholder="크레딧 수"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      사유 (선택)
                    </label>
                    <input
                      type="text"
                      value={chargeReason}
                      onChange={(e) => setChargeReason(e.target.value)}
                      placeholder="충전 사유"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <button
                    onClick={handleChargeCredits}
                    disabled={!chargeAmount}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-300"
                  >
                    크레딧 충전
                  </button>
                </div>
              ) : (
                <div className="text-gray-500 text-center py-8">
                  왼쪽에서 사용자를 선택하세요
                </div>
              )}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">서비스 통계</h3>
            <p className="text-gray-500">서비스 이용 통계가 여기에 표시됩니다.</p>
          </div>
        )}

        {/* Announcements Tab */}
        {activeTab === 'announcements' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">새 공지사항</h3>

              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="제목"
                  value={newAnnouncement.title}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <textarea
                  placeholder="내용"
                  value={newAnnouncement.content}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <select
                  value={newAnnouncement.type}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, type: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="info">정보</option>
                  <option value="warning">경고</option>
                  <option value="update">업데이트</option>
                  <option value="event">이벤트</option>
                </select>

                <button
                  onClick={handleCreateAnnouncement}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  등록
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">공지사항 목록</h3>

              <div className="space-y-3">
                {announcements.map((announcement) => (
                  <div key={announcement.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-xs ${
                            announcement.type === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                            announcement.type === 'update' ? 'bg-blue-100 text-blue-700' :
                            announcement.type === 'event' ? 'bg-purple-100 text-purple-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {announcement.type}
                          </span>
                          <span className="font-medium">{announcement.title}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{announcement.content}</p>
                        <div className="text-xs text-gray-400 mt-2">
                          {new Date(announcement.createdAt).toLocaleString()}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteAnnouncement(announcement.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                    </div>
                  </div>
                ))}

                {announcements.length === 0 && (
                  <p className="text-gray-500 text-center py-4">공지사항이 없습니다.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Logs Tab */}
        {activeTab === 'logs' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">활동 로그</h3>

            <div className="space-y-3">
              {logs.map((log) => (
                <div key={log.id} className="p-3 border border-gray-200 rounded-lg">
                  <div className="flex justify-between">
                    <span className="font-medium">{log.action}</span>
                    <span className="text-sm text-gray-500">
                      {new Date(log.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {log.targetType && `대상: ${log.targetType}`}
                    {log.details && (
                      <span className="ml-2">
                        {typeof log.details === 'object' ? JSON.stringify(log.details) : log.details}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">IP: {log.ipAddress}</div>
                </div>
              ))}

              {logs.length === 0 && (
                <p className="text-gray-500 text-center py-4">활동 로그가 없습니다.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string; value: string | number; icon: string }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center gap-3">
        <span className="material-symbols-outlined text-3xl text-blue-600">{icon}</span>
        <div>
          <div className="text-sm text-gray-600">{title}</div>
          <div className="text-2xl font-bold">{value}</div>
        </div>
      </div>
    </div>
  );
}
