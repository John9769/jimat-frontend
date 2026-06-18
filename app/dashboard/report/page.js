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
import { ArrowLeft, Share2 } from 'lucide-react';

const TABS = [
  { key: 'autopsy', icon: '🔬' },
  { key: 'bleeder', icon: '🔥' },
  { key: 'missions', icon: '🎯' },
  { key: 'comparison', icon: '📊' },
];

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
    const url = 'jimat-frontend.vercel.app';
    const text = lang === 'EN'
      ? `JIMAT found RM${saving.toFixed(2)} in savings on my TNB bill! Check yours — ${url}`
      : `JIMAT jumpa RM${saving.toFixed(2)} penjimatan pada bil TNB saya! Semak bil anda — ${url}`;
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

  const ledger = report.savingsLedger;
  const potentialSaving = ledger?.potentialSavingPerMonth || 0;
  const afaStory = report.comparison?.afaStory;

  const tabLabels = {
    autopsy: lang === 'EN' ? 'Bill Autopsy' : 'Bedah Siasat Bil',
    bleeder: lang === 'EN' ? 'Your Bleeders' : 'Pembazir Anda',
    missions: lang === 'EN' ? 'Your Missions' : 'Misi Anda',
    comparison: lang === 'EN' ? 'Month vs Month' : 'Bulan vs Bulan',
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
          {lang === 'EN' ? 'Share' : 'Kongsi'}
        </button>
      </div>

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
          <>
            {/* AFA Story — THE WOW — first thing user sees */}
            {afaStory?.explanation && (
              <div className="rounded-2xl p-4 mb-4"
                style={{
                  background: afaStory.billUpButBehaviourOk
                    ? 'rgba(34,197,94,0.08)'
                    : report.comparison?.improved
                      ? 'rgba(34,197,94,0.08)'
                      : 'rgba(250,204,21,0.06)',
                  border: `1px solid ${afaStory.billUpButBehaviourOk || report.comparison?.improved
                    ? 'rgba(34,197,94,0.3)'
                    : 'rgba(250,204,21,0.2)'}`
                }}>
                <p className="text-base font-black text-white mb-2">
                  {afaStory.billUpButBehaviourOk
                    ? (lang === 'EN' ? '✅ Bukan Salah Anda' : '✅ Bukan Salah Anda')
                    : report.comparison?.improved
                      ? (lang === 'EN' ? '✅ Great Progress!' : '✅ Tahniah!')
                      : (lang === 'EN' ? '⚠️ Action Needed' : '⚠️ Perlu Tindakan')}
                </p>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.85)' }}>
                  {afaStory.explanation}
                </p>
              </div>
            )}

            <BillAutopsy data={report.billAutopsy} lang={lang} />

            {/* One line savings CTA */}
            {potentialSaving > 0 && (
              <div className="mt-4 rounded-2xl p-4"
                style={{ background: 'rgba(250,204,21,0.05)', border: '1px solid rgba(250,204,21,0.15)' }}>
                <p className="text-sm font-bold" style={{ color: '#FACC15' }}>
                  {lang === 'EN'
                    ? `⚡ Click Your Missions tab to reduce your next bill by RM${potentialSaving.toFixed(2)}`
                    : `⚡ Klik tab Misi Anda untuk kurangkan bil bulan depan sebanyak RM${potentialSaving.toFixed(2)}`}
                </p>
              </div>
            )}

            {/* Disclaimer */}
            <div className="mt-4 rounded-xl p-3"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.25)' }}>
                ⚠️ {report.disclaimer?.[lang] || report.disclaimer?.EN}
              </p>
            </div>
          </>
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
            style={{ background: 'transparent', border: '1px solid rgba(250,204,21,0.4)', color: '#FACC15' }}>
            <span className="flex items-center justify-center gap-2">
              <Share2 className="w-4 h-4" />
              {lang === 'EN' ? 'Share My Savings' : 'Kongsi Penjimatan Saya'}
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