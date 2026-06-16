'use client';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';
import { adminLogin, getDashboardStats, getAllUsers, toggleUserStatus, updateAfaRate, getAfaRates } from '@/lib/api';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { Zap, Users, DollarSign, FileText, LogOut } from 'lucide-react';

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [logging, setLogging] = useState(false);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [afaRates, setAfaRates] = useState([]);
  const [afaForm, setAfaForm] = useState({ month: '', rateSen: '', note: '' });
  const [tab, setTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = Cookies.get('jimat_admin_token');
    if (token) {
      setAuthed(true);
      loadData();
    }
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, afaRes] = await Promise.all([
        getDashboardStats(),
        getAllUsers(),
        getAfaRates()
      ]);
      setStats(statsRes.data.stats);
      setUsers(usersRes.data.users);
      setAfaRates(afaRes.data.rates);
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLogging(true);
    try {
      const res = await adminLogin(loginForm);
      Cookies.set('jimat_admin_token', res.data.token, { expires: 1 });
      // Override API header for admin
      setAuthed(true);
      loadData();
    } catch {
      toast.error('Invalid credentials');
    } finally {
      setLogging(false);
    }
  };

  const handleAfaUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateAfaRate(afaForm);
      toast.success('AFA rate updated');
      setAfaForm({ month: '', rateSen: '', note: '' });
      const res = await getAfaRates();
      setAfaRates(res.data.rates);
    } catch {
      toast.error('Failed to update AFA');
    }
  };

  const handleToggleUser = async (userId) => {
    try {
      await toggleUserStatus(userId);
      toast.success('User status updated');
      const res = await getAllUsers();
      setUsers(res.data.users);
    } catch {
      toast.error('Failed to update user');
    }
  };

  if (!authed) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-2 justify-center mb-8">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-gray-950" />
            </div>
            <span className="font-bold text-white text-xl">JIMAT Admin</span>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={loginForm.email}
              onChange={e => setLoginForm({ ...loginForm, email: e.target.value })}
              placeholder="admin@jimat.my"
              required
            />
            <Input
              label="Password"
              type="password"
              value={loginForm.password}
              onChange={e => setLoginForm({ ...loginForm, password: e.target.value })}
              placeholder="••••••••"
              required
            />
            <Button type="submit" loading={logging} fullWidth>Login</Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-green-500 rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4 text-gray-950" />
          </div>
          <span className="font-bold text-white">JIMAT Admin</span>
        </div>
        <button
          onClick={() => { Cookies.remove('jimat_admin_token'); setAuthed(false); }}
          className="text-gray-400 hover:text-white"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-gray-900 border-b border-gray-800 px-4">
        <div className="flex gap-1 py-2">
          {['dashboard', 'users', 'afa'].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                tab === t ? 'bg-green-500 text-gray-950' : 'text-gray-400 hover:text-white'
              }`}
            >
              {t === 'dashboard' ? '📊 Dashboard' : t === 'users' ? '👥 Users' : '📡 AFA Rates'}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Dashboard Tab */}
        {tab === 'dashboard' && stats && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'blue' },
                { label: 'Household', value: stats.householdUsers, icon: Users, color: 'green' },
                { label: 'Institutional', value: stats.institutionalUsers, icon: Users, color: 'purple' },
                { label: 'Revenue (RM)', value: stats.totalRevenueMyr?.toFixed(2), icon: DollarSign, color: 'yellow' },
              ].map((item, i) => (
                <Card key={i}>
                  <p className="text-gray-400 text-xs mb-1">{item.label}</p>
                  <p className="text-white font-bold text-2xl">{item.value}</p>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Card className="text-center">
                <p className="text-gray-400 text-xs mb-1">Total Bills</p>
                <p className="text-white font-bold text-xl">{stats.totalBills}</p>
              </Card>
              <Card className="text-center">
                <p className="text-gray-400 text-xs mb-1">Unlocked</p>
                <p className="text-green-500 font-bold text-xl">{stats.unlockedBills}</p>
              </Card>
              <Card className="text-center">
                <p className="text-gray-400 text-xs mb-1">Payments</p>
                <p className="text-blue-400 font-bold text-xl">{stats.successPayments}</p>
              </Card>
            </div>
          </>
        )}

        {/* Users Tab */}
        {tab === 'users' && (
          <div className="space-y-3">
            <p className="text-gray-400 text-sm">{users.length} total users</p>
            {users.map(user => (
              <Card key={user.id} className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium text-sm">{user.name}</p>
                  <p className="text-gray-400 text-xs">{user.email}</p>
                  <div className="flex gap-2 mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      user.userType === 'INSTITUTIONAL'
                        ? 'bg-purple-500/10 text-purple-400'
                        : 'bg-blue-500/10 text-blue-400'
                    }`}>
                      {user.userType}
                    </span>
                    <span className="text-xs text-gray-500">
                      {user._count?.billingRecords || 0} bills
                    </span>
                  </div>
                </div>
                <Button
                  onClick={() => handleToggleUser(user.id)}
                  variant={user.isActive ? 'danger' : 'secondary'}
                  className="text-xs px-3 py-1.5"
                >
                  {user.isActive ? 'Deactivate' : 'Activate'}
                </Button>
              </Card>
            ))}
          </div>
        )}

        {/* AFA Tab */}
        {tab === 'afa' && (
          <div className="space-y-6">
            {/* Update Form */}
            <Card>
              <p className="text-white font-semibold mb-4">Update AFA Rate</p>
              <form onSubmit={handleAfaUpdate} className="space-y-4">
                <Input
                  label="Month (YYYY-MM)"
                  value={afaForm.month}
                  onChange={e => setAfaForm({ ...afaForm, month: e.target.value })}
                  placeholder="2026-07"
                  required
                />
                <Input
                  label="Rate (sen/kWh) — negative = rebate"
                  type="number"
                  step="0.01"
                  value={afaForm.rateSen}
                  onChange={e => setAfaForm({ ...afaForm, rateSen: e.target.value })}
                  placeholder="-1.10"
                  required
                />
                <Input
                  label="Note (optional)"
                  value={afaForm.note}
                  onChange={e => setAfaForm({ ...afaForm, note: e.target.value })}
                  placeholder="Energy Commission declared June 2026"
                />
                <Button type="submit" fullWidth>Update AFA Rate</Button>
              </form>
            </Card>

            {/* Existing Rates */}
            <div className="space-y-3">
              <p className="text-gray-400 text-sm">Existing Rates</p>
              {afaRates.map(rate => (
                <Card key={rate.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">{rate.month}</p>
                    {rate.note && <p className="text-gray-500 text-xs">{rate.note}</p>}
                  </div>
                  <p className={`font-bold ${rate.rateSen > 0 ? 'text-red-400' : rate.rateSen < 0 ? 'text-green-500' : 'text-gray-400'}`}>
                    {rate.rateSen > 0 ? '+' : ''}{rate.rateSen} sen
                  </p>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}