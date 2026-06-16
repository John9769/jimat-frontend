'use client';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';
import { adminLogin, getDashboardStats, getAllUsers, toggleUserStatus, updateAfaRate, getAfaRates } from '@/lib/api';
import { LogOut, Users, DollarSign, FileText, TrendingUp } from 'lucide-react';

const ElectricInput = ({ label, type = 'text', value, onChange, placeholder, required, step }) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>{label}</label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      step={step}
      className="px-4 py-3 rounded-xl text-white text-sm placeholder-gray-600 outline-none transition-all duration-300"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(250,204,21,0.15)' }}
      onFocus={e => e.target.style.border = '1px solid rgba(250,204,21,0.6)'}
      onBlur={e => e.target.style.border = '1px solid rgba(250,204,21,0.15)'}
    />
  </div>
);

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
    if (token) { setAuthed(true); loadData(); }
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, afaRes] = await Promise.all([
        getDashboardStats(), getAllUsers(), getAfaRates()
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

  // Login Screen
  if (!authed) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: '#000000' }}>
        {/* Particles */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 20 }, (_, i) => (
            <div key={i} className="absolute rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: Math.random() * 2 + 1,
                height: Math.random() * 2 + 1,
                background: Math.random() > 0.5 ? '#FACC15' : '#86EFAC',
                opacity: 0.2,
                animationDuration: `${Math.random() * 3 + 2}s`
              }} />
          ))}
        </div>

        <div className="relative z-10 w-full max-w-sm">
          {/* Logo */}
          <div className="flex items-center gap-2 justify-center mb-8">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(250,204,21,0.15)', border: '1px solid rgba(250,204,21,0.3)', boxShadow: '0 0 20px rgba(250,204,21,0.2)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M13 2L4.5 13.5H11L10 22L19.5 10.5H13L13 2Z" fill="#FACC15"
                  style={{ filter: 'drop-shadow(0 0 6px rgba(250,204,21,0.8))' }} />
              </svg>
            </div>
            <div>
              <span className="font-bold text-white text-xl tracking-wide">JIMAT</span>
              <span className="text-xs ml-2 px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(250,204,21,0.1)', border: '1px solid rgba(250,204,21,0.3)', color: '#FACC15' }}>
                Admin
              </span>
            </div>
          </div>

          <div className="rounded-2xl p-6 space-y-4"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(250,204,21,0.15)' }}>
            <p className="text-center text-sm mb-2" style={{ color: 'rgba(250,204,21,0.6)' }}>
              ⚡ Admin Portal
            </p>

            <form onSubmit={handleLogin} className="space-y-4">
              <ElectricInput
                label="Email"
                type="email"
                value={loginForm.email}
                onChange={e => setLoginForm({ ...loginForm, email: e.target.value })}
                placeholder="admin@jimat.my"
                required
              />
              <ElectricInput
                label="Password"
                type="password"
                value={loginForm.password}
                onChange={e => setLoginForm({ ...loginForm, password: e.target.value })}
                placeholder="••••••••"
                required
              />
              <button
                type="submit"
                disabled={logging}
                className="w-full py-3.5 rounded-xl font-bold text-sm transition-all duration-300"
                style={{
                  background: logging ? 'rgba(250,204,21,0.3)' : 'linear-gradient(135deg, #FACC15 0%, #EAB308 100%)',
                  color: '#000000',
                  boxShadow: logging ? 'none' : '0 0 20px rgba(250,204,21,0.4)'
                }}
              >
                {logging ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    Logging in...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M13 2L4.5 13.5H11L10 22L19.5 10.5H13L13 2Z" fill="#000000" />
                    </svg>
                    Login
                  </span>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  const TABS = [
    { key: 'dashboard', label: '📊 Dashboard' },
    { key: 'users', label: '👥 Users' },
    { key: 'afa', label: '📡 AFA Rates' }
  ];

  return (
    <div className="min-h-screen" style={{ background: '#000000' }}>
      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between sticky top-0 z-10"
        style={{ background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(250,204,21,0.1)' }}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(250,204,21,0.15)', border: '1px solid rgba(250,204,21,0.3)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M13 2L4.5 13.5H11L10 22L19.5 10.5H13L13 2Z" fill="#FACC15" />
            </svg>
          </div>
          <span className="font-bold text-white tracking-wide">JIMAT</span>
          <span className="text-xs px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(250,204,21,0.1)', border: '1px solid rgba(250,204,21,0.2)', color: '#FACC15' }}>
            Admin
          </span>
        </div>
        <button
          onClick={() => { Cookies.remove('jimat_admin_token'); setAuthed(false); }}
          className="p-2 rounded-lg transition-colors"
          style={{ color: 'rgba(255,255,255,0.4)' }}
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="px-4 overflow-x-auto"
        style={{ background: 'rgba(0,0,0,0.7)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex gap-1 py-2 min-w-max">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300"
              style={tab === t.key
                ? { background: '#FACC15', color: '#000000', boxShadow: '0 0 10px rgba(250,204,21,0.4)' }
                : { color: 'rgba(255,255,255,0.4)' }
              }
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">

        {/* Dashboard Tab */}
        {tab === 'dashboard' && (
          <>
            {loading ? (
              <div className="text-center py-12">
                <p className="animate-pulse" style={{ color: 'rgba(250,204,21,0.6)' }}>⚡ Loading stats...</p>
              </div>
            ) : stats ? (
              <>
                {/* Main Stats */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Total Users', value: stats.totalUsers, icon: '👥', color: '#60a5fa' },
                    { label: 'Revenue (RM)', value: stats.totalRevenueMyr?.toFixed(2), icon: '💰', color: '#FACC15' },
                    { label: 'Household', value: stats.householdUsers, icon: '🏠', color: '#22c55e' },
                    { label: 'Institutional', value: stats.institutionalUsers, icon: '🕌', color: '#a78bfa' },
                  ].map((item, i) => (
                    <div key={i} className="rounded-2xl p-4"
                      style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${item.color}25` }}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-base">{item.icon}</span>
                        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{item.label}</p>
                      </div>
                      <p className="text-2xl font-bold" style={{ color: item.color }}>{item.value}</p>
                    </div>
                  ))}
                </div>

                {/* Bill Stats */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Total Bills', value: stats.totalBills, color: 'rgba(255,255,255,0.6)' },
                    { label: 'Unlocked', value: stats.unlockedBills, color: '#22c55e' },
                    { label: 'Payments', value: stats.successPayments, color: '#60a5fa' },
                  ].map((item, i) => (
                    <div key={i} className="rounded-2xl p-4 text-center"
                      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <p className="text-xl font-bold" style={{ color: item.color }}>{item.value}</p>
                      <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>{item.label}</p>
                    </div>
                  ))}
                </div>

                {/* Conversion Rate */}
                <div className="rounded-2xl p-4"
                  style={{ background: 'rgba(250,204,21,0.04)', border: '1px solid rgba(250,204,21,0.15)' }}>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-white font-semibold">Conversion Rate</p>
                    <p className="text-lg font-bold" style={{ color: '#FACC15' }}>
                      {stats.totalBills > 0
                        ? `${Math.round((stats.unlockedBills / stats.totalBills) * 100)}%`
                        : '0%'}
                    </p>
                  </div>
                  <div className="mt-2 h-2 rounded-full overflow-hidden"
                    style={{ background: 'rgba(255,255,255,0.08)' }}>
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: stats.totalBills > 0
                          ? `${Math.round((stats.unlockedBills / stats.totalBills) * 100)}%`
                          : '0%',
                        background: 'linear-gradient(90deg, #FACC15, #EAB308)',
                        boxShadow: '0 0 8px rgba(250,204,21,0.4)'
                      }} />
                  </div>
                  <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    {stats.unlockedBills} of {stats.totalBills} bills converted to paid reports
                  </p>
                </div>
              </>
            ) : null}
          </>
        )}

        {/* Users Tab */}
        {tab === 'users' && (
          <div className="space-y-3">
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
              {users.length} total users
            </p>
            {users.map(user => (
              <div key={user.id} className="rounded-2xl p-4 flex items-center justify-between"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div>
                  <p className="text-white font-semibold text-sm">{user.name}</p>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>{user.email}</p>
                  <div className="flex gap-2 mt-1.5">
                    <span className="text-xs px-2 py-0.5 rounded-full"
                      style={user.userType === 'INSTITUTIONAL'
                        ? { background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.3)', color: '#a78bfa' }
                        : { background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.3)', color: '#60a5fa' }
                      }>
                      {user.userType}
                    </span>
                    <span className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
                      {user._count?.billingRecords || 0} bills
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleToggleUser(user.id)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                  style={user.isActive
                    ? { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444' }
                    : { background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', color: '#22c55e' }
                  }
                >
                  {user.isActive ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* AFA Tab */}
        {tab === 'afa' && (
          <div className="space-y-5">
            {/* Update Form */}
            <div className="rounded-2xl p-5"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(250,204,21,0.15)' }}>
              <p className="text-white font-semibold mb-4">
                ⚡ {' '}Update AFA Rate
              </p>
              <form onSubmit={handleAfaUpdate} className="space-y-4">
                <ElectricInput
                  label="Month (YYYY-MM)"
                  value={afaForm.month}
                  onChange={e => setAfaForm({ ...afaForm, month: e.target.value })}
                  placeholder="2026-07"
                  required
                />
                <ElectricInput
                  label="Rate (sen/kWh) — negative = rebate, positive = surcharge"
                  type="number"
                  step="0.01"
                  value={afaForm.rateSen}
                  onChange={e => setAfaForm({ ...afaForm, rateSen: e.target.value })}
                  placeholder="1.10 or -1.10"
                  required
                />
                <ElectricInput
                  label="Note (optional)"
                  value={afaForm.note}
                  onChange={e => setAfaForm({ ...afaForm, note: e.target.value })}
                  placeholder="Energy Commission declared June 2026"
                />
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl font-bold text-sm transition-all"
                  style={{
                    background: 'linear-gradient(135deg, #FACC15 0%, #EAB308 100%)',
                    color: '#000000',
                    boxShadow: '0 0 15px rgba(250,204,21,0.3)'
                  }}
                >
                  Update AFA Rate
                </button>
              </form>
            </div>

            {/* Existing Rates */}
            <div className="space-y-3">
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Declared Rates History
              </p>
              {afaRates.map(rate => (
                <div key={rate.id} className="rounded-2xl p-4 flex items-center justify-between"
                  style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: `1px solid ${rate.rateSen > 0
                      ? 'rgba(239,68,68,0.2)'
                      : rate.rateSen < 0
                      ? 'rgba(34,197,94,0.2)'
                      : 'rgba(255,255,255,0.06)'}`
                  }}>
                  <div>
                    <p className="text-white font-semibold">{rate.month}</p>
                    {rate.note && (
                      <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>{rate.note}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg"
                      style={{ color: rate.rateSen > 0 ? '#ef4444' : rate.rateSen < 0 ? '#22c55e' : 'rgba(255,255,255,0.4)' }}>
                      {rate.rateSen > 0 ? '+' : ''}{rate.rateSen} sen
                    </p>
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
                      {rate.rateSen > 0 ? 'Surcharge' : rate.rateSen < 0 ? 'Rebate' : 'Neutral'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}