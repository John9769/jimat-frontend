'use client';
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { getReport } from '@/lib/api';
import { t } from '@/lib/i18n';
import BillAutopsy from '@/components/report/BillAutopsy';
import Bleeder from '@/components/report/Bleeder';
import Missions from '@/components/report/Missions';
import Comparison from '@/components/report/Comparison';
import AfaWatch from '@/components/report/AfaWatch';
import { ArrowLeft, Share2, CheckCircle, Target } from 'lucide-react';

const TABS = [
  { key: 'autopsy', icon: '🔬' },
  { key: 'bleeder', icon: '🔥' },
  { key: 'missions', icon: '🎯' },
  { key: 'comparison', icon: '📊' },
  { key: 'afa', icon: '📡' },
];

const BAND_CONFIG = {
  EXCELLENT: { emoji: '🟢', color: '#22c55e' },
  GOOD:      { emoji: '🟡', color: '#eab308' },
  FAIR:      { emoji: '🟠', color: '#f97316' },
  ATTENTION: { emoji: '🔴', color: '#ef4444' },
  CRITICAL:  { emoji: '⚫', color: '#6b7280' }
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

function ReportContent() {
  const { user, loading, lang } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const recordId = searchParams.get('id');
  const [report, setReport] = useState(null);
  const [activeTab, setActiveTab] = useState('autopsy');
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
    if (!recordId) router.replace('/dashboard');
    if (user && recordId) {
      getReport(recordId)
        .then(res => setReport(res.data.report))
        .catch(err => {
          if (err.response?.status === 403) {
            router.replace(`/dashboard/teaser?id=${recordId}`);
          } else {
            toast.error('Failed to load report');
          }
        })
        .finally(() => setPageLoading(false));
    }
  }, [user, loading, recordId]);

  const handleShare = () => {
    const saving = report?.bleeder?.totalPotentialSavingMyr || 0;
    const score = report?.health?.score;
    const url = 'jimat-frontend.vercel.app';
    const text = lang === 'EN'
      ? `My electricity health score: ${score}/100. I could save RM${saving.toFixed(2)}/month on my TNB bill! Analysed with JIMAT — ${url}`
      : `Skor kesihatan elektrik saya: ${score}/100. Boleh jimat RM${saving.toFixed(2)}/bulan! Dianalisis dengan JIMAT — ${url}`;
    if (navigator.share) {
      navigator.share({ title: 'JIMAT Report', text });
    } else {
      navigator.clipboard.writeText(text);
      toast.success(lang === 'EN' ? 'Copied!' : 'Disalin!');
    }
  };

  if (loading || pageLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: '#000000' }}>
        <div className="relative mb-4">
          <div className="w-12 h-12 rounded-full animate-ping absolute inset-0" style={{ background: 'rgba(250,204,21,0.15)' }} />
          <div className="w-12 h-12 rounded-full flex items-center justify-center relative"
            style={{ background: 'rgba(250,204,21,0.08)', border: '1px solid rgba(250,204,21,0.3)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M13 2L4.5 13.5H11L10 22L19.5 10.5H13L13 2Z" fill="#FACC15" />
            </svg>
          </div>
        </div>
        <p className="text-sm animate-pulse" style={{ color: 'rgba(250,204,21,0.6)' }}>
          {lang === 'EN' ? 'Loading your report...' : 'Memuatkan laporan anda...'}
        </p>
      </div>
    );
  }

  if (!report) return null;

  const health = report.health;
  const band = health?.band ? BAND_CONFIG[health.band] : null;
  const ledger = report.savingsLedger;

  const tabLabels = {
    autopsy: t('report.autopsy', lang),
    bleeder: t('report.bleeder', lang),
    missions: t('report.missions', lang),
    comparison: t('report.comparison', lang),
    afa: t('report.afa', lang),
  };

  return (
    <div className="min-h-screen relative" style={{ background: '#000000' }}>
      <ElectricBackground />

      {/* Header */}
      <div className="relative z-10 px-4 py-3 flex items-center justify-between sticky top-0"
        style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(250,204,21,0.1)' }}>
        <div className="flex items-center gap-3">
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
        <button onClick={handleShare}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
          style={{ background: 'rgba(250,204,21,0.1)', border: '1px solid rgba(250,204,21,0.3)', color: '#FACC15' }}>
          <Share2 className="w-3.5 h-3.5" />
          {t('report.share', lang)}
        </button>
      </div>

      {/* Health Score Banner */}
      {health && band && (
        <div className="relative z-10 px-4 py-3"
          style={{ background: 'rgba(0,0,0,0.8)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="max-w-lg mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span style={{ fontSize: '1.5rem' }}>{band.emoji}</span>
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black" style={{ color: band.color }}>{health.score}</span>
                    <span className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>/100</span>
                  </div>
                  <p className="text-xs font-semibold" style={{ color: band.color }}>{health.bandLabel}</p>
                </div>
              </div>

              {health.missionCompletion && (
                <div className="text-right">
                  {health.missionCompletion.completed ? (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                      style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)' }}>
                      <CheckCircle className="w-3.5 h-3.5" style={{ color: '#22c55e' }} />
                      <span className="text-xs font-bold" style={{ color: '#22c55e' }}>
                        {lang === 'EN' ? 'Mission Done!' : 'Misi Siap!'}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                      style={{ background: 'rgba(250,204,21,0.08)', border: '1px solid rgba(250,204,21,0.2)' }}>
                      <Target className="w-3.5 h-3.5" style={{ color: '#FACC15' }} />
                      <span className="text-xs" style={{ color: '#FACC15' }}>
                        {lang === 'EN'
                          ? `Target was ${health.missionCompletion.targetKwh} kWh`
                          : `Sasaran ${health.missionCompletion.targetKwh} kWh`}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {!health.missionCompletion && health.missionKwhTarget && (
                <div className="text-right">
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    {lang === 'EN' ? 'Next target' : 'Sasaran seterusnya'}
                  </p>
                  <p className="text-sm font-bold" style={{ color: '#FACC15' }}>
                    {health.missionKwhTarget} kWh
                  </p>
                </div>
              )}
            </div>

            <p className="text-xs mt-2" style={{ color: 'rgba(255,255,255,0.35)' }}>
              {health.bandMessage}
            </p>

            <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <div className="h-full rounded-full transition-all duration-1000"
                style={{ width: `${health.score}%`, background: band.color, boxShadow: `0 0 8px ${band.color}` }} />
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="relative z-10 px-4 overflow-x-auto"
        style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex gap-1 py-2 min-w-max">
          {TABS.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-300"
              style={activeTab === tab.key
                ? { background: '#FACC15', color: '#000000', boxShadow: '0 0 10px rgba(250,204,21,0.4)' }
                : { color: 'rgba(255,255,255,0.4)' }
              }>
              <span>{tab.icon}</span>
              {tabLabels[tab.key]}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="relative z-10 max-w-lg mx-auto px-4 py-6 pb-28">
        {activeTab === 'autopsy' && report.billAutopsy && (
          <BillAutopsy data={report.billAutopsy} lang={lang} />
        )}
        {activeTab === 'bleeder' && (
          <Bleeder data={report.bleeder} lang={lang} />
        )}
        {activeTab === 'missions' && (
          <Missions missions={report.missions} lang={lang} />
        )}
        {activeTab === 'comparison' && (
          <Comparison data={report.comparison} lang={lang} />
        )}
        {activeTab === 'afa' && (
          <AfaWatch data={report.afaWatch} lang={lang} />
        )}

        {/* Health Factor Breakdown */}
        {health?.factors && (
          <div className="mt-6 rounded-2xl p-4"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-sm font-bold text-white mb-3">
              📊 {lang === 'EN' ? 'Health Score Breakdown' : 'Pecahan Skor Kesihatan'}
            </p>
            <div className="space-y-3">
              {Object.entries(health.factors).map(([key, factor]) => (
                <div key={key}>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{factor.label}</p>
                    <p className="text-xs font-bold" style={{ color: factor.score >= factor.maxScore * 0.7 ? '#22c55e' : factor.score >= factor.maxScore * 0.4 ? '#FACC15' : '#ef4444' }}>
                      {factor.score}/{factor.maxScore}
                    </p>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <div className="h-full rounded-full"
                      style={{
                        width: `${(factor.score / factor.maxScore) * 100}%`,
                        background: factor.score >= factor.maxScore * 0.7 ? '#22c55e' : factor.score >= factor.maxScore * 0.4 ? '#FACC15' : '#ef4444'
                      }} />
                  </div>
                  <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>{factor.detail}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Savings Ledger — Simplified */}
        {ledger && ledger.monthsAnalysed > 0 && (
          <div className="mt-4 rounded-2xl p-4"
            style={{ background: 'rgba(250,204,21,0.05)', border: '1px solid rgba(250,204,21,0.15)' }}>
            <p className="font-semibold mb-1 text-white">
              💰 {lang === 'EN' ? 'Your Savings Ledger' : 'Lejar Penjimatan Anda'}
            </p>
            <p className="text-xs mb-4" style={{ color: 'rgba(255,255,255,0.3)' }}>
              {lang === 'EN'
                ? `Based on ${ledger.monthsAnalysed} month(s) analysed with JIMAT`
                : `Berdasarkan ${ledger.monthsAnalysed} bulan dianalisis dengan JIMAT`}
            </p>

            {/* Potential saving — only metric shown */}
            <div className="rounded-xl p-3 mb-3"
              style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                {lang === 'EN' ? 'Potential saving identified' : 'Potensi penjimatan dikenal pasti'}
              </p>
              <p className="text-2xl font-black mt-1" style={{ color: '#22c55e' }}>
                RM{ledger.potentialSavingPerMonth?.toFixed(2)}/{lang === 'EN' ? 'month' : 'bulan'}
              </p>
            </div>

            {/* Months analysed */}
            <div className="rounded-xl p-3"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                {lang === 'EN' ? 'Months analysed with JIMAT' : 'Bulan dianalisis dengan JIMAT'}
              </p>
              <p className="text-xl font-bold mt-1" style={{ color: '#FACC15' }}>
                {ledger.monthsAnalysed} {lang === 'EN' ? 'months' : 'bulan'}
              </p>
            </div>

            {/* Health journey */}
            {ledger.healthJourney && ledger.healthJourney.length > 1 && (
              <div className="mt-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <p className="text-xs mb-2" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  {lang === 'EN' ? 'Health score journey' : 'Perjalanan skor kesihatan'}
                </p>
                <div className="flex gap-2 flex-wrap">
                  {ledger.healthJourney.map((h, i) => {
                    const b = h.healthBand ? BAND_CONFIG[h.healthBand] : null;
                    return (
                      <div key={i} className="flex items-center gap-1 text-xs rounded-lg px-2 py-1"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <span>{b?.emoji || '⚪'}</span>
                        <span style={{ color: 'rgba(255,255,255,0.4)' }}>{h.billingMonth}:</span>
                        <span style={{ color: b?.color || '#fff' }}>{h.healthScore}</span>
                        {h.missionCompleted && <CheckCircle className="w-3 h-3" style={{ color: '#22c55e' }} />}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Disclaimer */}
        <div className="mt-4 rounded-xl p-3"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.25)' }}>
            ⚠️ {report.disclaimer?.[lang] || report.disclaimer?.EN}
          </p>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: 'rgba(255,255,255,0.1)' }}>
          JIMAT by AWAS Premium Resources · SSM 202603141446
        </p>
      </div>

      {/* Fixed Bottom Share */}
      <div className="fixed bottom-0 left-0 right-0 p-4 z-20"
        style={{ background: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(10px)', borderTop: '1px solid rgba(250,204,21,0.1)' }}>
        <div className="max-w-lg mx-auto">
          <button onClick={handleShare}
            className="w-full py-3.5 rounded-xl font-bold text-sm transition-all duration-300"
            style={{ background: 'transparent', border: '1px solid rgba(250,204,21,0.4)', color: '#FACC15', boxShadow: '0 0 15px rgba(250,204,21,0.1)' }}>
            <span className="flex items-center justify-center gap-2">
              <Share2 className="w-4 h-4" />
              {t('report.share', lang)}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ReportPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#000000' }}>
        <div className="w-10 h-10 rounded-full animate-pulse"
          style={{ background: 'rgba(250,204,21,0.1)', border: '1px solid rgba(250,204,21,0.3)' }} />
      </div>
    }>
      <ReportContent />
    </Suspense>
  );
}