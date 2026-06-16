'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { getBillingHistory } from '@/lib/api';
import { t } from '@/lib/i18n';
import Card from '@/components/ui/Card';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Zap, ArrowLeft, Lock, TrendingDown, ChevronRight } from 'lucide-react';

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

  if (loading || pageLoading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-white">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-green-500" />
          <span className="font-bold text-white">JIMAT</span>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6">
        <h1 className="text-xl font-bold text-white mb-6">{t('dash.history', lang)}</h1>

        {records.length === 0 ? (
          <Card className="text-center py-12">
            <Zap className="w-10 h-10 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">{t('dash.noHistory', lang)}</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {records.map(record => (
              <Card
                key={record.id}
                onClick={() => record.isUnlocked
                  ? router.push(`/dashboard/report?id=${record.id}`)
                  : router.push(`/dashboard/teaser?id=${record.id}`)
                }
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    record.isUnlocked ? 'bg-green-500/10' : 'bg-gray-800'
                  }`}>
                    {record.isUnlocked
                      ? <TrendingDown className="w-5 h-5 text-green-500" />
                      : <Lock className="w-5 h-5 text-gray-500" />
                    }
                  </div>
                  <div>
                    <p className="text-white font-semibold">{record.billingMonth}</p>
                    <p className="text-gray-400 text-sm">
                      {record.totalKwh} kWh — RM{record.totalAmountMyr?.toFixed(2)}
                    </p>
                    {!record.isUnlocked && record.teaserAmount && (
                      <p className="text-orange-400 text-xs mt-0.5">
                        {lang === 'EN' ? `Est. save RM${record.teaserAmount?.toFixed(2)}/month` : `Jimat anggaran RM${record.teaserAmount?.toFixed(2)}/bulan`}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    record.isUnlocked
                      ? 'bg-green-500/10 text-green-500'
                      : 'bg-gray-800 text-gray-500'
                  }`}>
                    {record.isUnlocked
                      ? (lang === 'EN' ? 'Unlocked' : 'Dibuka')
                      : (lang === 'EN' ? 'Locked' : 'Dikunci')}
                  </span>
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}