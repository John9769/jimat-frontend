'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { getBillingHistory } from '@/lib/api';
import { t } from '@/lib/i18n';
import { ArrowLeft, Lock, TrendingDown, ChevronRight, CheckCircle } from 'lucide-react';

const BAND_CONFIG = {
  EXCELLENT: { emoji: '🟢', color: '#22c55e', label: { EN: 'Excellent', BM: 'Cemerlang' } },
  GOOD:      { emoji: '🟡', color: '#eab308', label: { EN: 'Good', BM: 'Baik' } },
  FAIR:      { emoji: '🟠', color: '#f97316', label: { EN: 'Fair', BM: 'Sederhana' } },
  ATTENTION: { emoji: '🔴', color: '#ef4444', label: { EN: 'Attention', BM: 'Perhatian' } },
  CRITICAL:  { emoji: '⚫', color: '#6b7280', label: { EN: 'Critical', BM: 'Kritikal' } }
};

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
          style={{ left: p.left, top: p.top, width: p.size, height: p.size, background: p.color, opacity: 0.15, animationDuration: `${p.duration}s`, animationDelay: `${p.delay}s` }} />
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
        <div className="w-10 h-10 rounded-full animate-pulse flex items-center justify-center"
          style={{ background: 'rgba(250,204,21,0.1)', border: '1px solid rgba(250,204,21,0.3)' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M13 2L4.5 13.5H11L10 22L19.5 10.5H13L13 2Z" fill="#FACC15" />
          </svg>
        </div>
      </div>
    );
  }

  const unlockedCount = records.filter(r => r.isUnlocked).length;

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
            {records.map((record) => {
              const band = record.healthBand ? BAND_CONFIG[record.healthBand] : null;
              const cajSemasa = record.cajSemasa || record.totalAmountMyr;
              const teaserLow = record.teaserLow || 0;
              const teaserHigh = record.teaserHigh || 0;
              const hasTeaserRange = teaserLow > 0 || teaserHigh > 0;

              return (
                <div
                  key={record.id}
                  onClick={() => record.isUnlocked
                    ? router.push(`/dashboard/report?id=${record.id}`)
                    : router.push(`/dashboard/teaser?id=${record.id}`)
                  }
                  className="rounded-2xl p-4 cursor-pointer transition-all duration-300"
                  style={{
                    background: record.isUnlocked ? 'rgba(34,197,94,0.04)' : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${record.isUnlocked ? 'rgba(34,197,94,0.2)' : 'rgba(250,204,21,0.1)'}`
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {/* Icon */}
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{
                          background: record.isUnlocked ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.04)',
                          border: `1px solid ${record.isUnlocked ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.08)'}`
                        }}>
                        {record.isUnlocked
                          ? <TrendingDown className="w-5 h-5" style={{ color: '#22c55e' }} />
                          : <Lock className="w-5 h-5" style={{ color: 'rgba(250,204,21,0.4)' }} />
                        }
                      </div>

                      {/* Info */}
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-white font-bold">{record.billingMonth}</p>
                          {record.missionCompleted && (
                            <span className="flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full"
                              style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', color: '#22c55e' }}>
                              <CheckCircle className="w-3 h-3" />
                              {lang === 'EN' ? 'Mission ✓' : 'Misi ✓'}
                            </span>
                          )}
                        </div>
                        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
                          {record.totalKwh} kWh — RM{cajSemasa?.toFixed(2)}
                        </p>

                        {/* Health score or teaser range */}
                        {record.isUnlocked && band && record.healthScore !== null ? (
                          <p className="text-xs mt-0.5" style={{ color: band.color }}>
                            {band.emoji} {record.healthScore}/100 — {band.label[lang] || band.label.EN}
                          </p>
                        ) : !record.isUnlocked && hasTeaserRange ? (
                          <p className="text-xs mt-0.5" style={{ color: '#FACC15' }}>
                            ⚡ {lang === 'EN'
                              ? `Est. save RM${teaserLow.toFixed(0)} – RM${teaserHigh.toFixed(0)}/month`
                              : `Jimat anggaran RM${teaserLow.toFixed(0)} – RM${teaserHigh.toFixed(0)}/bulan`}
                          </p>
                        ) : null}

                        {record.referenceMonth && (
                          <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.25)' }}>
                            {lang === 'EN'
                              ? `Compared with ${record.referenceMonth}`
                              : `Dibanding dengan ${record.referenceMonth}`}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Status + Arrow */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2.5 py-1 rounded-full font-medium"
                        style={{
                          background: record.isUnlocked ? 'rgba(34,197,94,0.1)' : 'rgba(250,204,21,0.08)',
                          border: `1px solid ${record.isUnlocked ? 'rgba(34,197,94,0.3)' : 'rgba(250,204,21,0.2)'}`,
                          color: record.isUnlocked ? '#22c55e' : '#FACC15'
                        }}>
                        {record.isUnlocked
                          ? (lang === 'EN' ? 'Unlocked' : 'Dibuka')
                          : (lang === 'EN' ? 'Locked' : 'Dikunci')}
                      </span>
                      <ChevronRight className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.2)' }} />
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Summary */}
            <div className="rounded-2xl p-4 mt-2"
              style={{ background: 'rgba(250,204,21,0.04)', border: '1px solid rgba(250,204,21,0.1)' }}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  {lang === 'EN' ? 'Total bills analysed' : 'Jumlah bil dianalisis'}
                </p>
                <p className="text-sm font-bold" style={{ color: '#FACC15' }}>
                  {records.length} {lang === 'EN' ? 'months' : 'bulan'}
                </p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  {lang === 'EN' ? 'Reports unlocked' : 'Laporan dibuka'}
                </p>
                <p className="text-sm font-bold" style={{ color: '#22c55e' }}>
                  {unlockedCount}/{records.length}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}