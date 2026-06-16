'use client';
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { getReport } from '@/lib/api';
import { t } from '@/lib/i18n';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Button from '@/components/ui/Button';
import BillAutopsy from '@/components/report/BillAutopsy';
import Bleeder from '@/components/report/Bleeder';
import Missions from '@/components/report/Missions';
import Comparison from '@/components/report/Comparison';
import AfaWatch from '@/components/report/AfaWatch';
import { Zap, ArrowLeft, Share2 } from 'lucide-react';

const TABS = [
  { key: 'autopsy', icon: '🔬' },
  { key: 'bleeder', icon: '🔥' },
  { key: 'missions', icon: '🎯' },
  { key: 'comparison', icon: '📊' },
  { key: 'afa', icon: '📡' },
];

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
    const text = lang === 'EN'
      ? `I could save RM${saving.toFixed(2)}/month on my TNB bill! Analysed with JIMAT — jimat.my`
      : `Saya boleh jimat RM${saving.toFixed(2)}/bulan pada bil TNB saya! Dianalisis dengan JIMAT — jimat.my`;

    if (navigator.share) {
      navigator.share({ title: 'JIMAT Report', text });
    } else {
      navigator.clipboard.writeText(text);
      toast.success(lang === 'EN' ? 'Copied to clipboard!' : 'Disalin ke papan klip!');
    }
  };

  if (loading || pageLoading) return <LoadingSpinner text="Loading report..." />;
  if (!report) return null;

  const tabLabels = {
    autopsy: t('report.autopsy', lang),
    bleeder: t('report.bleeder', lang),
    missions: t('report.missions', lang),
    comparison: t('report.comparison', lang),
    afa: t('report.afa', lang),
  };

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="text-gray-400 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-green-500" />
            <span className="font-bold text-white">JIMAT</span>
          </div>
        </div>
        <button
          onClick={handleShare}
          className="flex items-center gap-1 text-green-500 text-xs hover:text-green-400"
        >
          <Share2 className="w-4 h-4" />
          {t('report.share', lang)}
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-gray-900 border-b border-gray-800 px-4 overflow-x-auto">
        <div className="flex gap-1 py-2 min-w-max">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                activeTab === tab.key
                  ? 'bg-green-500 text-gray-950'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <span>{tab.icon}</span>
              {tabLabels[tab.key]}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto px-4 py-6 pb-24">
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

        {/* Savings Ledger */}
        {report.savingsLedger && report.savingsLedger.monthsOnJimat > 0 && (
          <div className="mt-6 bg-gray-900 border border-gray-800 rounded-2xl p-4">
            <p className="text-white font-semibold mb-3">
              {lang === 'EN' ? '💰 Your Savings Ledger' : '💰 Lejar Penjimatan Anda'}
            </p>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <p className="text-green-500 font-bold text-lg">{report.savingsLedger.monthsOnJimat}</p>
                <p className="text-gray-500 text-xs">{lang === 'EN' ? 'Months' : 'Bulan'}</p>
              </div>
              <div className="text-center">
                <p className="text-green-500 font-bold text-lg">RM{report.savingsLedger.totalPotentialSavedMyr?.toFixed(0)}</p>
                <p className="text-gray-500 text-xs">{lang === 'EN' ? 'Potential Saved' : 'Jimat Berpotensi'}</p>
              </div>
              <div className="text-center">
                <p className="text-blue-400 font-bold text-lg">RM{report.savingsLedger.netGainMyr?.toFixed(0)}</p>
                <p className="text-gray-500 text-xs">{lang === 'EN' ? 'Net Gain' : 'Keuntungan Bersih'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <div className="mt-4 bg-gray-900 border border-gray-800 rounded-xl p-3">
          <p className="text-gray-600 text-xs leading-relaxed">
            ⚠️ {report.disclaimer?.[lang] || report.disclaimer?.EN}
          </p>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-950 border-t border-gray-800 p-4">
        <div className="max-w-lg mx-auto">
          <Button onClick={handleShare} variant="outline" fullWidth>
            <Share2 className="w-4 h-4" />
            {t('report.share', lang)}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function ReportPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ReportContent />
    </Suspense>
  );
}