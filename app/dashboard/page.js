'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { getBillingHistory, getChainInfo } from '@/lib/api';
import { t } from '@/lib/i18n';
import { Upload, History, User, LogOut, ChevronRight, TrendingDown, Lock, Zap } from 'lucide-react';

function ElectricBackground() {
  const [particles] = useState(() =>
    Array.from({ length: 40 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 3 + 2,
      delay: Math.random() * 3,
      color: Math.random() > 0.5 ? '#FACC15' : '#86EFAC'
    }))
  );

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" style={{ background: '#000000' }}>
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute rounded-full animate-pulse"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            background: p.color,
            opacity: 0.3,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`
          }}
        />
      ))}
      {/* Subtle radial glow at top */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(250,204,21,0.04) 0%, transparent 70%)' }} />
    </div>
  );
}

export default function DashboardPage() {
  const { user, loading, lang, toggleLang, logoutUser } = useAuth();
  const router = useRouter();
  const [history, setHistory] = useState([]);
  const [chain, setChain] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [user, loading]);

  useEffect(() => {
    if (user) {
      Promise.all([getBillingHistory(), getChainInfo()])
        .then(([histRes, chainRes]) => {
          setHistory(histRes.data.records);
          setChain(chainRes.data);
        })
        .catch(() => toast.error('Failed to load data'))
        .finally(() => setDataLoading(false));
    }
  }, [user]);

  if (loading || dataLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: '#000000' }}>
        <div className="relative mb-4">
          <div className="w-12 h-12 rounded-full animate-ping absolute inset-0"
            style={{ background: 'rgba(250,204,21,0.2)' }} />
          <div className="w-12 h-12 rounded-full flex items-center justify-center relative"
            style={{ background: 'rgba(250,204,21,0.1)', border: '1px solid rgba(250,204,21,0.3)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M13 2L4.5 13.5H11L10 22L19.5 10.5H13L13 2Z" fill="#FACC15" />
            </svg>
          </div>
        </div>
        <p className="text-sm animate-pulse" style={{ color: 'rgba(250,204,21,0.6)' }}>
          {lang === 'EN' ? 'Loading dashboard...' : 'Memuatkan papan pemuka...'}
        </p>
      </div>
    );
  }

  const chainStatus = chain?.chain?.status || 'ONBOARD';
  const chainPrice = chain?.pricing?.price || 11.99;

  const chainConfig = {
    MONTHLY: {
      label: lang === 'EN' ? '✅ Chain Active' : '✅ Rantaian Aktif',
      desc: lang === 'EN' ? `Upload 1 bill — RM${chainPrice}` : `Muat naik 1 bil — RM${chainPrice}`,
      border: 'rgba(34,197,94,0.3)',
      bg: 'rgba(34,197,94,0.05)'
    },
    RESET: {
      label: lang === 'EN' ? '⚠️ Chain Broken' : '⚠️ Rantaian Terputus',
      desc: lang === 'EN' ? `Upload 2 bills to reset — RM${chainPrice}` : `Muat naik 2 bil untuk tetapkan semula — RM${chainPrice}`,
      border: 'rgba(239,68,68,0.3)',
      bg: 'rgba(239,68,68,0.05)'
    },
    ONBOARD: {
      label: lang === 'EN' ? '🆕 Welcome to JIMAT' : '🆕 Selamat Datang ke JIMAT',
      desc: lang === 'EN' ? `Upload 2 bills to start — RM${chainPrice}` : `Muat naik 2 bil untuk bermula — RM${chainPrice}`,
      border: 'rgba(250,204,21,0.3)',
      bg: 'rgba(250,204,21,0.05)'
    }
  };

  const cc = chainConfig[chainStatus];

  return (
    <div className="min-h-screen relative" style={{ background: '#000000' }}>
      <ElectricBackground />

      {/* Header */}
      <div className="relative z-10 px-4 py-3 flex items-center justify-between sticky top-0"
        style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(250,204,21,0.1)' }}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(250,204,21,0.15)', border: '1px solid rgba(250,204,21,0.3)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M13 2L4.5 13.5H11L10 22L19.5 10.5H13L13 2Z" fill="#FACC15" />
            </svg>
          </div>
          <span className="font-bold text-white tracking-wide">JIMAT</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleLang}
            className="text-xs rounded-lg px-2 py-1 transition-all"
            style={{ border: '1px solid rgba(250,204,21,0.3)', color: '#FACC15', background: 'rgba(250,204,21,0.05)' }}
          >
            {lang === 'EN' ? 'BM' : 'EN'}
          </button>
          <button onClick={logoutUser} style={{ color: 'rgba(255,255,255,0.4)' }}
            className="hover:text-white transition-colors p-1">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="relative z-10 max-w-lg mx-auto px-4 py-6 space-y-5">

        {/* Welcome */}
        <div>
          <p className="text-sm mb-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {t('dash.welcome', lang)},
          </p>
          <h1 className="text-xl font-bold text-white">{user?.name}</h1>
          {user?.userType === 'INSTITUTIONAL' && (
            <span className="text-xs rounded-full px-2 py-0.5 mt-1 inline-block"
              style={{ background: 'rgba(250,204,21,0.1)', border: '1px solid rgba(250,204,21,0.3)', color: '#FACC15' }}>
              🕌 {lang === 'EN' ? 'Institutional' : 'Institusi'}
            </span>
          )}
        </div>

        {/* AI Badge */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
            style={{ background: 'rgba(250,204,21,0.08)', border: '1px solid rgba(250,204,21,0.2)', color: '#FACC15' }}>
            ⚡ {lang === 'EN' ? 'AI-Powered Bill Intelligence' : 'Kecerdasan Bil Dikuasai AI'}
          </div>
        </div>

        {/* Chain Status Banner */}
        {chain && (
          <div className="rounded-2xl p-4 flex items-center justify-between"
            style={{ background: cc.bg, border: `1px solid ${cc.border}` }}>
            <div>
              <p className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>{cc.label}</p>
              <p className="text-white font-semibold text-sm">{cc.desc}</p>
            </div>
            <Link href="/dashboard/upload">
              <button
                className="px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                style={{
                  background: 'linear-gradient(135deg, #FACC15 0%, #EAB308 100%)',
                  color: '#000000',
                  boxShadow: '0 0 15px rgba(250,204,21,0.3)'
                }}
              >
                <Upload className="w-3 h-3" />
                {lang === 'EN' ? 'Upload' : 'Muat Naik'}
              </button>
            </Link>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          {[
            {
              href: '/dashboard/upload',
              icon: <Upload className="w-5 h-5" />,
              label: t('dash.uploadBill', lang),
              color: '#FACC15',
              bg: 'rgba(250,204,21,0.08)',
              border: 'rgba(250,204,21,0.2)'
            },
            {
              href: '/dashboard/history',
              icon: <History className="w-5 h-5" />,
              label: t('dash.history', lang),
              color: '#60A5FA',
              bg: 'rgba(96,165,250,0.08)',
              border: 'rgba(96,165,250,0.2)'
            }
          ].map((action, i) => (
            <Link key={i} href={action.href}>
              <div
                className="rounded-2xl p-4 flex flex-col items-center gap-2 py-5 transition-all duration-300 cursor-pointer"
                style={{ background: action.bg, border: `1px solid ${action.border}` }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `${action.color}15`, color: action.color }}>
                  {action.icon}
                </div>
                <span className="text-white text-sm font-medium">{action.label}</span>
              </div>
            </Link>
          ))}
        </div>

        {/* Recent Bills */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-white font-semibold">{t('dash.history', lang)}</h2>
            <Link href="/dashboard/history"
              className="text-xs transition-colors"
              style={{ color: '#FACC15' }}>
              {lang === 'EN' ? 'View all' : 'Lihat semua'}
            </Link>
          </div>

          {history.length === 0 ? (
            <div className="rounded-2xl p-8 text-center"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(250,204,21,0.1)' }}>
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
                style={{ background: 'rgba(250,204,21,0.08)', border: '1px solid rgba(250,204,21,0.2)' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M13 2L4.5 13.5H11L10 22L19.5 10.5H13L13 2Z" fill="rgba(250,204,21,0.4)" />
                </svg>
              </div>
              <p className="text-sm mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
                {t('dash.noHistory', lang)}
              </p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
                {lang === 'EN' ? 'Upload your first TNB bill to get started' : 'Muat naik bil TNB pertama anda untuk bermula'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.slice(0, 3).map(record => (
                <div
                  key={record.id}
                  onClick={() => record.isUnlocked
                    ? router.push(`/dashboard/report?id=${record.id}`)
                    : router.push(`/dashboard/teaser?id=${record.id}`)
                  }
                  className="rounded-2xl p-4 flex items-center justify-between cursor-pointer transition-all duration-300"
                  style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: `1px solid ${record.isUnlocked ? 'rgba(34,197,94,0.2)' : 'rgba(250,204,21,0.1)'}`
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                      style={{
                        background: record.isUnlocked ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${record.isUnlocked ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.08)'}`
                      }}>
                      {record.isUnlocked
                        ? <TrendingDown className="w-4 h-4" style={{ color: '#22c55e' }} />
                        : <Lock className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.3)' }} />
                      }
                    </div>
                    <div>
                      <p className="text-white text-sm font-semibold">{record.billingMonth}</p>
                      <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                        {record.totalKwh} kWh — RM{record.totalAmountMyr}
                      </p>
                      {!record.isUnlocked && record.teaserAmount && (
                        <p className="text-xs mt-0.5" style={{ color: '#FACC15' }}>
                          ⚡ {lang === 'EN' ? `Est. save RM${record.teaserAmount}/month` : `Jimat anggaran RM${record.teaserAmount}/bulan`}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 rounded-full"
                      style={{
                        background: record.isUnlocked ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${record.isUnlocked ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.1)'}`,
                        color: record.isUnlocked ? '#22c55e' : 'rgba(255,255,255,0.3)'
                      }}>
                      {record.isUnlocked
                        ? (lang === 'EN' ? 'Unlocked' : 'Dibuka')
                        : (lang === 'EN' ? 'Locked' : 'Dikunci')}
                    </span>
                    <ChevronRight className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.2)' }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Appliance Profile */}
        <div
          onClick={() => router.push('/dashboard/onboarding')}
          className="rounded-2xl p-4 flex items-center justify-between cursor-pointer transition-all duration-300"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(139,92,246,0.2)' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.3)' }}>
              <User className="w-4 h-4" style={{ color: '#a78bfa' }} />
            </div>
            <div>
              <p className="text-white text-sm font-medium">
                {lang === 'EN' ? 'Appliance Profile' : 'Profil Peralatan'}
              </p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                {lang === 'EN' ? 'Update your home appliances' : 'Kemaskini peralatan rumah anda'}
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.2)' }} />
        </div>

        {/* Footer */}
        <p className="text-center text-xs pb-4" style={{ color: 'rgba(255,255,255,0.15)' }}>
          JIMAT by AWAS Premium Resources · SSM 202603141446
        </p>
      </div>
    </div>
  );
}