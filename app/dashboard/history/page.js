'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { getBillingHistory } from '@/lib/api';
import { t } from '@/lib/i18n';
import { ArrowLeft, Lock, TrendingDown, ChevronRight } from 'lucide-react';

function ElectricBackground() {
  const [particles] = useState(() =>
    Array.from({ length: 25 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: Math.random() * 2 + 0.5,
      duration: Math.random() * 4 + 2,
      delay: Math.random() * 3,
      color: Math.random() > 0.5 ? '#FACC15' : '#86EFAC'
    }))
  );
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" style={{ background: '#000000' }}>
      {particles.map(p => (
        <div key={p.id} className="absolute rounded-full animate-pulse"
          style={{
            left: p.left, top: p.top,
            width: p.size, height: p.size,
            background: p.color, opacity: 0.15,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`
          }} />
      ))}
    </div>
  );
}

export default function HistoryPage() {
  const { user, loading, lang } = useAuth();
  const router = useRouter();
  const [records, setRecords] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
    if (user) {
      getBillingHistory()
        .then(res => setRecords(res.data.records))
        .catch(() => toast.error('Failed to load history'))
        .finally(() => setPageLoading(false));
    }
  }, [user, loading]);

  if (loading || pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#000000' }}>
        <div className="text-center">
          <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3 animate-pulse"
            style={{ background: 'rgba(250,204,21,0.1)', border: '1px solid rgba(250,204,21,0.3)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M13 2L4.5 13.5H11L10 22L19.5 10.5H13L13 2Z" fill="#FACC15" />
            </svg>
          </div>
          <p className="text-sm animate-pulse" style={{ color: 'rgba(250,204,21,0.6)' }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative" style={{ background: '#000000' }}>
      <ElectricBackground />

      {/* Header */}
      <div className="relative z-10 px-4 py-3 flex items-center gap-3 sticky top-0"
        style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(250,204,21,0.1)' }}>
        <button onClick={() => router.back()} style={{ color: 'rgba(250,204,21,0.6)' }}>
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(250,204,21,0.15)', border: '1px solid rgba(250,204,21,0.3)' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M13 2L4.5 13.5H11L10 22L19.5 10.5H13L13 2Z" fill="#FACC15" />
            </svg>
          </div>
          <span className="font-bold text-white tracking-wide">JIMAT</span>
        </div>
      </div>

      <div className="relative z-10 max-w-lg mx-auto px-4 py-6">

        {/* Title */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-white mb-1">{t('dash.history', lang)}</h1>
          <p className="text-sm" style={{ color: 'rgba(250,204,21,0.6)' }}>
            ⚡ {lang === 'EN' ? 'Your TNB bill analysis history' : 'Sejarah analisis bil TNB anda'}
          </p>
        </div>

        {records.length === 0 ? (
          <div className="rounded-2xl p-12 text-center"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(250,204,21,0.1)' }}>
            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: 'rgba(250,204,21,0.06)', border: '1px solid rgba(250,204,21,0.2)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M13 2L4.5 13.5H11L10 22L19.5 10.5H13L13 2Z" fill="rgba(250,204,21,0.3)" />
              </svg>
            </div>
            <p className="text-white font-medium mb-1">{t('dash.noHistory', lang)}</p>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
              {lang === 'EN' ? 'Upload your first TNB bill to get started' : 'Muat naik bil TNB pertama anda untuk bermula'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {records.map((record, index) => (
              <div
                key={record.id}
                onClick={() => record.isUnlocked
                  ? router.push(`/dashboard/report?id=${record.id}`)
                  : router.push(`/dashboard/teaser?id=${record.id}&amount=${record.teaserAmount || 0}&price=6.99`)
                }
                className="rounded-2xl p-4 flex items-center justify-between cursor-pointer transition-all duration-300"
                style={{
                  background: record.isUnlocked
                    ? 'rgba(34,197,94,0.04)'
                    : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${record.isUnlocked
                    ? 'rgba(34,197,94,0.2)'
                    : 'rgba(250,204,21,0.1)'}`
                }}
              >
                <div className="flex items-center gap-3">
                  {/* Icon */}
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                      background: record.isUnlocked
                        ? 'rgba(34,197,94,0.1)'
                        : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${record.isUnlocked
                        ? 'rgba(34,197,94,0.3)'
                        : 'rgba(255,255,255,0.08)'}`
                    }}>
                    {record.isUnlocked
                      ? <TrendingDown className="w-5 h-5" style={{ color: '#22c55e' }} />
                      : <Lock className="w-5 h-5" style={{ color: 'rgba(250,204,21,0.4)' }} />
                    }
                  </div>

                  {/* Info */}
                  <div>
                    <p className="text-white font-bold">{record.billingMonth}</p>
                    <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      {record.totalKwh} kWh — RM{record.totalAmountMyr?.toFixed(2)}
                    </p>
                    {!record.isUnlocked && record.teaserAmount && (
                      <p className="text-xs mt-0.5" style={{ color: '#FACC15' }}>
                        ⚡ {lang === 'EN'
                          ? `Est. save RM${record.teaserAmount?.toFixed(2)}/month`
                          : `Jimat anggaran RM${record.teaserAmount?.toFixed(2)}/bulan`}
                      </p>
                    )}
                  </div>
                </div>

                {/* Status + Arrow */}
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2.5 py-1 rounded-full font-medium"
                    style={{
                      background: record.isUnlocked
                        ? 'rgba(34,197,94,0.1)'
                        : 'rgba(250,204,21,0.08)',
                      border: `1px solid ${record.isUnlocked
                        ? 'rgba(34,197,94,0.3)'
                        : 'rgba(250,204,21,0.2)'}`,
                      color: record.isUnlocked ? '#22c55e' : '#FACC15'
                    }}>
                    {record.isUnlocked
                      ? (lang === 'EN' ? 'Unlocked' : 'Dibuka')
                      : (lang === 'EN' ? 'Locked' : 'Dikunci')}
                  </span>
                  <ChevronRight className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.2)' }} />
                </div>
              </div>
            ))}

            {/* Summary if has records */}
            <div className="rounded-2xl p-4 mt-2"
              style={{ background: 'rgba(250,204,21,0.04)', border: '1px solid rgba(250,204,21,0.1)' }}>
              <div className="flex items-center justify-between">
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  {lang === 'EN' ? 'Total bills analysed' : 'Jumlah bil dianalisis'}
                </p>
                <p className="text-sm font-bold" style={{ color: '#FACC15' }}>
                  {records.length} {lang === 'EN' ? 'months' : 'bulan'}
                </p>
              </div>
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  {lang === 'EN' ? 'Reports unlocked' : 'Laporan dibuka'}
                </p>
                <p className="text-sm font-bold" style={{ color: '#22c55e' }}>
                  {records.filter(r => r.isUnlocked).length}/{records.length}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}