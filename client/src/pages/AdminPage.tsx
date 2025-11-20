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

interface UserDetail extends User {
  transactions: Transaction[];
}

interface Transaction {
  id: string;
  type: string;
  creditAmount: number;
  creditBalanceAfter: number;
  paymentMethod: string | null;
  actualAmount: number | null;
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

interface ServiceStat {
  service_type: string;
  usage_count: number;
  total_credits: number;
}

interface DailyTrend {
  date: string;
  usage_count: number;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

type TabType = 'dashboard' | 'users' | 'credits' | 'analytics' | 'announcements' | 'logs';

const API_BASE = import.meta.env.VITE_API_URL || '';

const TAB_DESCRIPTIONS: Record<TabType, { title: string; description: string }> = {
  dashboard: {
    title: '대시보드',
    description: '전체 서비스 현황을 한눈에 파악할 수 있습니다. 사용자 수, 크레딧 현황, 수익 등 주요 지표를 확인하세요.'
  },
  users: {
    title: '사용자 관리',
    description: '등록된 사용자를 검색하고 관리합니다. 역할 변경, 상세 정보 확인, 사용자 삭제 등을 수행할 수 있습니다.'
  },
  credits: {
    title: '크레딧 관리',
    description: '사용자에게 크레딧을 충전하거나 차감합니다. 프로모션, 환불, 보상 등 다양한 목적으로 사용하세요.'
  },
  analytics: {
    title: '서비스 통계',
    description: '서비스별 이용 현황과 일별 트렌드를 분석합니다. 인기 서비스와 사용 패턴을 파악할 수 있습니다.'
  },
  announcements: {
    title: '공지사항',
    description: '사용자에게 전달할 공지사항을 작성하고 관리합니다. 정보, 경고, 업데이트, 이벤트 유형으로 분류됩니다.'
  },
  logs: {
    title: '활동 로그',
    description: '관리자의 모든 활동 기록을 확인합니다. 날짜와 액션 유형으로 필터링하여 감사 추적이 가능합니다.'
  }
};

export default function AdminPage() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Dashboard state
  const [stats, setStats] = useState<DashboardStats | null>(null);

  // Users state
  const [users, setUsers] = useState<User[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [userPage, setUserPage] = useState(1);
  const [userPagination, setUserPagination] = useState<Pagination | null>(null);
  const [selectedUserDetail, setSelectedUserDetail] = useState<UserDetail | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);

  // Credit state
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [chargeAmount, setChargeAmount] = useState('');
  const [chargeReason, setChargeReason] = useState('');
  const [isDeduct, setIsDeduct] = useState(false);

  // Analytics state
  const [serviceStats, setServiceStats] = useState<ServiceStat[]>([]);
  const [dailyTrend, setDailyTrend] = useState<DailyTrend[]>([]);
  const [analyticsDays, setAnalyticsDays] = useState(30);

  // Announcements state
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    content: '',
    type: 'info',
    isPinned: false
  });
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);

  // Logs state
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [logPage, setLogPage] = useState(1);
  const [logPagination, setLogPagination] = useState<Pagination | null>(null);
  const [logFilter, setLogFilter] = useState({ action: '', startDate: '', endDate: '' });

  // Auth check
  useEffect(() => {
    if (!isLoggedIn()) {
      setLocation('/login');
      return;
    }
    checkAdminAccess();
  }, [setLocation]);

  // Auto-clear messages
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

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
        setUserPagination(data.pagination);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    }
  };

  const loadUserDetail = async (userId: string) => {
    try {
      const response = await fetch(`${API_BASE}/api/admin/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedUserDetail({ ...data.user, transactions: data.transactions });
        setShowUserModal(true);
      }
    } catch (err) {
      console.error('Failed to load user detail:', err);
    }
  };

  const loadAnalytics = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/admin/analytics/services?days=${analyticsDays}`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setServiceStats(data.serviceStats || []);
        setDailyTrend(data.dailyTrend || []);
      }
    } catch (err) {
      console.error('Failed to load analytics:', err);
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

  const loadLogs = async (page = 1) => {
    try {
      const params = new URLSearchParams({ page: String(page), limit: '50' });
      if (logFilter.action) params.append('action', logFilter.action);
      if (logFilter.startDate) params.append('startDate', logFilter.startDate);
      if (logFilter.endDate) params.append('endDate', logFilter.endDate);

      const response = await fetch(`${API_BASE}/api/admin/logs?${params}`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs);
        setLogPagination(data.pagination);
      }
    } catch (err) {
      console.error('Failed to load logs:', err);
    }
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setError(null);
    setSuccess(null);

    switch (tab) {
      case 'dashboard':
        loadDashboard();
        break;
      case 'users':
        loadUsers(userSearch, 1);
        setUserPage(1);
        break;
      case 'credits':
        loadUsers(userSearch, 1);
        setSelectedUser(null);
        break;
      case 'analytics':
        loadAnalytics();
        break;
      case 'announcements':
        loadAnnouncements();
        break;
      case 'logs':
        loadLogs(1);
        setLogPage(1);
        break;
    }
  };

  const handleUserRoleChange = async (userId: string, newRole: string) => {
    if (!confirm(`정말 이 사용자의 역할을 ${newRole}로 변경하시겠습니까?`)) return;

    try {
      const response = await fetch(`${API_BASE}/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role: newRole })
      });

      if (response.ok) {
        setSuccess('역할이 변경되었습니다.');
        loadUsers(userSearch, userPage);
      } else {
        const data = await response.json();
        setError(data.error || '역할 변경에 실패했습니다.');
      }
    } catch {
      setError('역할 변경 중 오류가 발생했습니다.');
    }
  };

  const handleDeleteUser = async (userId: string, email: string) => {
    if (!confirm(`정말 ${email} 사용자를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) return;

    try {
      const response = await fetch(`${API_BASE}/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      });

      if (response.ok) {
        setSuccess('사용자가 삭제되었습니다.');
        loadUsers(userSearch, userPage);
      } else {
        const data = await response.json();
        setError(data.error || '사용자 삭제에 실패했습니다.');
      }
    } catch {
      setError('사용자 삭제 중 오류가 발생했습니다.');
    }
  };

  const handleCreditAction = async () => {
    if (!selectedUser || !chargeAmount) return;

    const endpoint = isDeduct ? '/api/admin/credits/deduct' : '/api/admin/credits/charge';
    const actionText = isDeduct ? '차감' : '충전';

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
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
        setSuccess(`크레딧 ${chargeAmount}개가 ${actionText}되었습니다. 새 잔액: ${data.newCredits}`);
        setSelectedUser(null);
        setChargeAmount('');
        setChargeReason('');
        loadUsers(userSearch, 1);
      } else {
        const data = await response.json();
        setError(data.error || `크레딧 ${actionText}에 실패했습니다.`);
      }
    } catch {
      setError(`크레딧 ${actionText} 중 오류가 발생했습니다.`);
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
        setSuccess('공지사항이 등록되었습니다.');
        setNewAnnouncement({ title: '', content: '', type: 'info', isPinned: false });
        loadAnnouncements();
      } else {
        const data = await response.json();
        setError(data.error || '공지사항 등록에 실패했습니다.');
      }
    } catch {
      setError('공지사항 등록 중 오류가 발생했습니다.');
    }
  };

  const handleUpdateAnnouncement = async () => {
    if (!editingAnnouncement) return;

    try {
      const response = await fetch(`${API_BASE}/api/admin/announcements/${editingAnnouncement.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editingAnnouncement)
      });

      if (response.ok) {
        setSuccess('공지사항이 수정되었습니다.');
        setEditingAnnouncement(null);
        loadAnnouncements();
      } else {
        const data = await response.json();
        setError(data.error || '공지사항 수정에 실패했습니다.');
      }
    } catch {
      setError('공지사항 수정 중 오류가 발생했습니다.');
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
        setSuccess('공지사항이 삭제되었습니다.');
        loadAnnouncements();
      }
    } catch {
      setError('공지사항 삭제에 실패했습니다.');
    }
  };

  const handleToggleAnnouncement = async (announcement: Announcement, field: 'isActive' | 'isPinned') => {
    try {
      const response = await fetch(`${API_BASE}/api/admin/announcements/${announcement.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...announcement,
          [field]: !announcement[field]
        })
      });

      if (response.ok) {
        loadAnnouncements();
      }
    } catch {
      setError('상태 변경에 실패했습니다.');
    }
  };

  const handleExport = async (type: 'users' | 'logs') => {
    try {
      const response = await fetch(`${API_BASE}/api/admin/export/${type}`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${type}_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        setSuccess('파일이 다운로드되었습니다.');
      }
    } catch {
      setError('내보내기에 실패했습니다.');
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">운영 페이지</h1>
        <p className="text-gray-600 mb-8">AI PORT 서비스를 관리하고 모니터링합니다.</p>

        {/* Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg flex items-center gap-2">
            <span className="material-symbols-outlined">error</span>
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-lg flex items-center gap-2">
            <span className="material-symbols-outlined">check_circle</span>
            {success}
          </div>
        )}

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 pb-4">
          {[
            { id: 'dashboard', label: '대시보드', icon: 'dashboard' },
            { id: 'users', label: '사용자 관리', icon: 'people' },
            { id: 'credits', label: '크레딧 관리', icon: 'payments' },
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

        {/* Tab Description */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
          <h2 className="font-semibold text-blue-900">{TAB_DESCRIPTIONS[activeTab].title}</h2>
          <p className="text-sm text-blue-700 mt-1">{TAB_DESCRIPTIONS[activeTab].description}</p>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="전체 사용자" value={stats.totalUsers} icon="people" color="blue" />
            <StatCard title="이번 달 신규" value={stats.newUsers} icon="person_add" color="green" />
            <StatCard title="이번 달 크레딧" value={stats.monthlyCreditsCharged} icon="toll" color="purple" />
            <StatCard title="이번 달 서비스 이용" value={stats.serviceUsageCount} icon="auto_awesome" color="orange" />
            <StatCard title="전체 크레딧" value={stats.totalCreditsCharged} icon="savings" color="indigo" />
            <StatCard title="이번 달 수익" value={`${stats.monthlyRevenue.toLocaleString()}원`} icon="paid" color="emerald" />
            <StatCard title="전체 수익" value={`${stats.totalRevenue.toLocaleString()}원`} icon="account_balance" color="amber" />
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex flex-wrap gap-4 mb-4 items-center">
              <input
                type="text"
                placeholder="이메일, 사용자명, providerId로 검색"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    loadUsers(userSearch, 1);
                    setUserPage(1);
                  }
                }}
                className="flex-1 min-w-[200px] px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => {
                  loadUsers(userSearch, 1);
                  setUserPage(1);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-xl">search</span>
                검색
              </button>
              {userPagination && (
                <div className="text-sm text-gray-600 ml-auto">
                  총 <span className="font-semibold text-blue-600">{userPagination.total}</span>명
                </div>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left py-3 px-2">이메일</th>
                    <th className="text-left py-3 px-2">Provider</th>
                    <th className="text-right py-3 px-2">크레딧</th>
                    <th className="text-right py-3 px-2">누적</th>
                    <th className="text-left py-3 px-2">역할</th>
                    <th className="text-left py-3 px-2">가입일</th>
                    <th className="text-center py-3 px-2">관리</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-2">{user.email}</td>
                      <td className="py-3 px-2">{user.provider}</td>
                      <td className="py-3 px-2 text-right">{user.credits}</td>
                      <td className="py-3 px-2 text-right">{user.lifetimeCredits}</td>
                      <td className="py-3 px-2">
                        <select
                          value={user.role}
                          onChange={(e) => handleUserRoleChange(user.id, e.target.value)}
                          className={`px-2 py-1 rounded text-xs border-0 cursor-pointer ${
                            user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          <option value="user">user</option>
                          <option value="admin">admin</option>
                        </select>
                      </td>
                      <td className="py-3 px-2">{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td className="py-3 px-2 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => loadUserDetail(user.id)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                            title="상세 보기"
                          >
                            <span className="material-symbols-outlined text-xl">visibility</span>
                          </button>
                          {user.role !== 'admin' && (
                            <button
                              onClick={() => handleDeleteUser(user.id, user.email)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                              title="삭제"
                            >
                              <span className="material-symbols-outlined text-xl">delete</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {userPagination && userPagination.pages > 1 && (
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  총 {userPagination.total}명 중 {(userPage - 1) * 20 + 1}-{Math.min(userPage * 20, userPagination.total)}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setUserPage(userPage - 1);
                      loadUsers(userSearch, userPage - 1);
                    }}
                    disabled={userPage === 1}
                    className="px-3 py-1 border rounded disabled:opacity-50"
                  >
                    이전
                  </button>
                  <span className="px-3 py-1">
                    {userPage} / {userPagination.pages}
                  </span>
                  <button
                    onClick={() => {
                      setUserPage(userPage + 1);
                      loadUsers(userSearch, userPage + 1);
                    }}
                    disabled={userPage === userPagination.pages}
                    className="px-3 py-1 border rounded disabled:opacity-50"
                  >
                    다음
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Credits Tab */}
        {activeTab === 'credits' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">사용자 선택</h3>
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  placeholder="이메일로 검색"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && loadUsers(userSearch, 1)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => loadUsers(userSearch, 1)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  <span className="material-symbols-outlined text-xl">search</span>
                </button>
              </div>

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
              <h3 className="text-lg font-semibold mb-4">크레딧 관리</h3>

              {selectedUser ? (
                <div>
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="font-medium">{selectedUser.email}</div>
                    <div className="text-sm text-gray-600">
                      현재 크레딧: {selectedUser.credits}
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex gap-2 mb-3">
                      <button
                        onClick={() => setIsDeduct(false)}
                        className={`flex-1 py-2 rounded-lg transition ${
                          !isDeduct ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        충전
                      </button>
                      <button
                        onClick={() => setIsDeduct(true)}
                        className={`flex-1 py-2 rounded-lg transition ${
                          isDeduct ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        차감
                      </button>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {isDeduct ? '차감량' : '충전량'}
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
                      placeholder={isDeduct ? '차감 사유' : '충전 사유'}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <button
                    onClick={handleCreditAction}
                    disabled={!chargeAmount}
                    className={`w-full px-4 py-2 text-white rounded-lg transition disabled:bg-gray-300 ${
                      isDeduct ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    크레딧 {isDeduct ? '차감' : '충전'}
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
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">서비스별 이용 현황</h3>
                <select
                  value={analyticsDays}
                  onChange={(e) => {
                    setAnalyticsDays(Number(e.target.value));
                    setTimeout(loadAnalytics, 0);
                  }}
                  className="px-3 py-1 border border-gray-300 rounded-lg"
                >
                  <option value={7}>최근 7일</option>
                  <option value={30}>최근 30일</option>
                  <option value={90}>최근 90일</option>
                </select>
              </div>

              {serviceStats.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="text-left py-3 px-2">서비스</th>
                        <th className="text-right py-3 px-2">이용 횟수</th>
                        <th className="text-right py-3 px-2">소비 크레딧</th>
                        <th className="text-left py-3 px-2">비율</th>
                      </tr>
                    </thead>
                    <tbody>
                      {serviceStats.map((stat, index) => {
                        const maxUsage = Math.max(...serviceStats.map(s => s.usage_count));
                        const percentage = (stat.usage_count / maxUsage) * 100;
                        return (
                          <tr key={index} className="border-b">
                            <td className="py-3 px-2 font-medium">{stat.service_type || '기타'}</td>
                            <td className="py-3 px-2 text-right">{stat.usage_count}</td>
                            <td className="py-3 px-2 text-right">{stat.total_credits}</td>
                            <td className="py-3 px-2">
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">데이터가 없습니다.</p>
              )}
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">일별 이용 추이</h3>

              {dailyTrend.length > 0 ? (
                <div className="h-48 flex items-end gap-1">
                  {dailyTrend.slice(-30).map((day, index) => {
                    const maxCount = Math.max(...dailyTrend.map(d => d.usage_count));
                    const height = maxCount > 0 ? (day.usage_count / maxCount) * 100 : 0;
                    return (
                      <div
                        key={index}
                        className="flex-1 bg-blue-500 hover:bg-blue-600 transition-colors rounded-t"
                        style={{ height: `${Math.max(height, 2)}%` }}
                        title={`${day.date}: ${day.usage_count}회`}
                      />
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">데이터가 없습니다.</p>
              )}
            </div>
          </div>
        )}

        {/* Announcements Tab */}
        {activeTab === 'announcements' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">
                {editingAnnouncement ? '공지사항 수정' : '새 공지사항'}
              </h3>

              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="제목"
                  value={editingAnnouncement ? editingAnnouncement.title : newAnnouncement.title}
                  onChange={(e) => editingAnnouncement
                    ? setEditingAnnouncement({ ...editingAnnouncement, title: e.target.value })
                    : setNewAnnouncement({ ...newAnnouncement, title: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <textarea
                  placeholder="내용"
                  value={editingAnnouncement ? editingAnnouncement.content : newAnnouncement.content}
                  onChange={(e) => editingAnnouncement
                    ? setEditingAnnouncement({ ...editingAnnouncement, content: e.target.value })
                    : setNewAnnouncement({ ...newAnnouncement, content: e.target.value })
                  }
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <div className="flex flex-wrap gap-4">
                  <select
                    value={editingAnnouncement ? editingAnnouncement.type : newAnnouncement.type}
                    onChange={(e) => editingAnnouncement
                      ? setEditingAnnouncement({ ...editingAnnouncement, type: e.target.value })
                      : setNewAnnouncement({ ...newAnnouncement, type: e.target.value })
                    }
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="info">정보</option>
                    <option value="warning">경고</option>
                    <option value="update">업데이트</option>
                    <option value="event">이벤트</option>
                  </select>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editingAnnouncement ? editingAnnouncement.isPinned : newAnnouncement.isPinned}
                      onChange={(e) => editingAnnouncement
                        ? setEditingAnnouncement({ ...editingAnnouncement, isPinned: e.target.checked })
                        : setNewAnnouncement({ ...newAnnouncement, isPinned: e.target.checked })
                      }
                      className="w-4 h-4"
                    />
                    <span>상단 고정</span>
                  </label>
                </div>

                <div className="flex gap-2">
                  {editingAnnouncement ? (
                    <>
                      <button
                        onClick={handleUpdateAnnouncement}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => setEditingAnnouncement(null)}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
                      >
                        취소
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={handleCreateAnnouncement}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      등록
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">공지사항 목록</h3>

              <div className="space-y-3">
                {announcements.map((announcement) => (
                  <div key={announcement.id} className={`p-4 border rounded-lg ${
                    !announcement.isActive ? 'opacity-50 bg-gray-50' : ''
                  }`}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          {announcement.isPinned && (
                            <span className="material-symbols-outlined text-yellow-500 text-sm">push_pin</span>
                          )}
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
                      <div className="flex items-center gap-1 ml-4">
                        <button
                          onClick={() => handleToggleAnnouncement(announcement, 'isActive')}
                          className={`p-1 rounded ${announcement.isActive ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'}`}
                          title={announcement.isActive ? '비활성화' : '활성화'}
                        >
                          <span className="material-symbols-outlined text-xl">
                            {announcement.isActive ? 'visibility' : 'visibility_off'}
                          </span>
                        </button>
                        <button
                          onClick={() => handleToggleAnnouncement(announcement, 'isPinned')}
                          className={`p-1 rounded ${announcement.isPinned ? 'text-yellow-600 hover:bg-yellow-50' : 'text-gray-400 hover:bg-gray-100'}`}
                          title={announcement.isPinned ? '고정 해제' : '상단 고정'}
                        >
                          <span className="material-symbols-outlined text-xl">push_pin</span>
                        </button>
                        <button
                          onClick={() => setEditingAnnouncement(announcement)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          title="수정"
                        >
                          <span className="material-symbols-outlined text-xl">edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteAnnouncement(announcement.id)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded"
                          title="삭제"
                        >
                          <span className="material-symbols-outlined text-xl">delete</span>
                        </button>
                      </div>
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
            <div className="flex flex-wrap gap-4 mb-4">
              <select
                value={logFilter.action}
                onChange={(e) => setLogFilter({ ...logFilter, action: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">모든 액션</option>
                <option value="credit_charge">크레딧 충전</option>
                <option value="credit_deduct">크레딧 차감</option>
                <option value="user_role_change">역할 변경</option>
                <option value="user_delete">사용자 삭제</option>
                <option value="announcement_create">공지 생성</option>
                <option value="announcement_update">공지 수정</option>
                <option value="announcement_delete">공지 삭제</option>
              </select>
              <input
                type="date"
                value={logFilter.startDate}
                onChange={(e) => setLogFilter({ ...logFilter, startDate: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg"
              />
              <input
                type="date"
                value={logFilter.endDate}
                onChange={(e) => setLogFilter({ ...logFilter, endDate: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg"
              />
              <button
                onClick={() => {
                  setLogPage(1);
                  loadLogs(1);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                필터 적용
              </button>
              <button
                onClick={() => {
                  setLogFilter({ action: '', startDate: '', endDate: '' });
                  setLogPage(1);
                  loadLogs(1);
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
              >
                초기화
              </button>
              <button
                onClick={() => handleExport('logs')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-xl">download</span>
                CSV 내보내기
              </button>
            </div>

            <div className="space-y-3">
              {logs.map((log) => (
                <div key={log.id} className="p-3 border border-gray-200 rounded-lg">
                  <div className="flex justify-between">
                    <span className={`font-medium px-2 py-0.5 rounded text-xs ${
                      log.action.includes('delete') ? 'bg-red-100 text-red-700' :
                      log.action.includes('charge') ? 'bg-green-100 text-green-700' :
                      log.action.includes('deduct') ? 'bg-orange-100 text-orange-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {log.action}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(log.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {log.targetType && `대상: ${log.targetType}`}
                    {log.details && (
                      <span className="ml-2">
                        {typeof log.details === 'object'
                          ? Object.entries(log.details).map(([k, v]) => `${k}: ${v}`).join(', ')
                          : log.details
                        }
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

            {/* Pagination */}
            {logPagination && logPagination.pages > 1 && (
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  총 {logPagination.total}개
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setLogPage(logPage - 1);
                      loadLogs(logPage - 1);
                    }}
                    disabled={logPage === 1}
                    className="px-3 py-1 border rounded disabled:opacity-50"
                  >
                    이전
                  </button>
                  <span className="px-3 py-1">
                    {logPage} / {logPagination.pages}
                  </span>
                  <button
                    onClick={() => {
                      setLogPage(logPage + 1);
                      loadLogs(logPage + 1);
                    }}
                    disabled={logPage === logPagination.pages}
                    className="px-3 py-1 border rounded disabled:opacity-50"
                  >
                    다음
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* User Detail Modal */}
      {showUserModal && selectedUserDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold">사용자 상세 정보</h3>
              <button
                onClick={() => setShowUserModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <div className="text-sm text-gray-500">이메일</div>
                  <div className="font-medium">{selectedUserDetail.email}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">사용자명</div>
                  <div className="font-medium">{selectedUserDetail.username || '-'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Provider</div>
                  <div className="font-medium">{selectedUserDetail.provider}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">역할</div>
                  <div className="font-medium">{selectedUserDetail.role}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">현재 크레딧</div>
                  <div className="font-medium">{selectedUserDetail.credits}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">누적 크레딧</div>
                  <div className="font-medium">{selectedUserDetail.lifetimeCredits}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">가입일</div>
                  <div className="font-medium">{new Date(selectedUserDetail.createdAt).toLocaleString()}</div>
                </div>
              </div>

              <h4 className="font-semibold mb-3">최근 거래 내역</h4>
              <div className="space-y-2">
                {selectedUserDetail.transactions.slice(0, 20).map((tx) => (
                  <div key={tx.id} className="p-2 bg-gray-50 rounded text-sm flex justify-between">
                    <div>
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        tx.type === 'charge' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                      }`}>
                        {tx.type}
                      </span>
                      <span className="ml-2">{tx.creditAmount > 0 ? '+' : ''}{tx.creditAmount}</span>
                      {tx.paymentMethod && <span className="ml-2 text-gray-500">({tx.paymentMethod})</span>}
                    </div>
                    <div className="text-gray-500">
                      {new Date(tx.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))}
                {selectedUserDetail.transactions.length === 0 && (
                  <p className="text-gray-500 text-center py-2">거래 내역이 없습니다.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, icon, color = 'blue' }: {
  title: string;
  value: string | number;
  icon: string;
  color?: string;
}) {
  const colorClasses: Record<string, string> = {
    blue: 'text-blue-600 bg-blue-50',
    green: 'text-green-600 bg-green-50',
    purple: 'text-purple-600 bg-purple-50',
    orange: 'text-orange-600 bg-orange-50',
    indigo: 'text-indigo-600 bg-indigo-50',
    emerald: 'text-emerald-600 bg-emerald-50',
    amber: 'text-amber-600 bg-amber-50',
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center gap-3">
        <div className={`p-3 rounded-lg ${colorClasses[color] || colorClasses.blue}`}>
          <span className="material-symbols-outlined text-2xl">{icon}</span>
        </div>
        <div>
          <div className="text-sm text-gray-600">{title}</div>
          <div className="text-2xl font-bold">{value}</div>
        </div>
      </div>
    </div>
  );
}
