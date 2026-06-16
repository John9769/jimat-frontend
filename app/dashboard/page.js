'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { getBillingHistory, getChainInfo } from '@/lib/api';
import { t } from '@/lib/i18n';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Zap, Upload, History, User, LogOut, ChevronRight, TrendingDown, TrendingUp, Lock } from 'lucide-react';

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

  if (loading || dataLoading) return <LoadingSpinner text="Loading dashboard..." />;

  const hasAppliances = user?.appliances?.length > 0;

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-green-500 rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4 text-gray-950" />
          </div>
          <span className="font-bold text-white">JIMAT</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleLang}
            className="text-xs text-gray-400 border border-gray-700 rounded-lg px-2 py-1 hover:border-green-500 transition-colors"
          >
            {lang === 'EN' ? 'BM' : 'EN'}
          </button>
          <button onClick={logoutUser} className="text-gray-400 hover:text-white transition-colors">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Welcome */}
        <div>
          <p className="text-gray-400 text-sm">{t('dash.welcome', lang)},</p>
          <h1 className="text-xl font-bold text-white">{user?.name}</h1>
          {user?.userType === 'INSTITUTIONAL' && (
            <span className="text-xs bg-green-500/10 text-green-500 border border-green-500/30 rounded-full px-2 py-0.5 mt-1 inline-block">
              🕌 Institutional
            </span>
          )}
        </div>

        {/* Chain Status Banner */}
        {chain && (
          <div className={`rounded-2xl p-4 border ${
            chain.chain.status === 'MONTHLY'
              ? 'bg-green-500/10 border-green-500/30'
              : chain.chain.status === 'RESET'
              ? 'bg-red-500/10 border-red-500/30'
              : 'bg-blue-500/10 border-blue-500/30'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400 mb-1">
                  {chain.chain.status === 'MONTHLY' ? '✅ Chain Active' :
                   chain.chain.status === 'RESET' ? '⚠️ Chain Broken' : '🆕 New User'}
                </p>
                <p className="text-white font-semibold text-sm">
                  {chain.chain.status === 'MONTHLY'
                    ? `Upload 1 bill — RM${chain.pricing.price}`
                    : chain.chain.status === 'RESET'
                    ? `Upload 2 bills to reset — RM${chain.pricing.price}`
                    : `Upload 2 bills to start — RM${chain.pricing.price}`}
                </p>
              </div>
              <Link href="/dashboard/upload">
                <Button variant="primary" className="text-xs px-3 py-2">
                  <Upload className="w-3 h-3" />
                  Upload
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Link href="/dashboard/upload">
            <Card className="flex flex-col items-center gap-2 py-5 hover:border-green-500 transition-colors">
              <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center">
                <Upload className="w-5 h-5 text-green-500" />
              </div>
              <span className="text-white text-sm font-medium">{t('dash.uploadBill', lang)}</span>
            </Card>
          </Link>
          <Link href="/dashboard/history">
            <Card className="flex flex-col items-center gap-2 py-5 hover:border-green-500 transition-colors">
              <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
                <History className="w-5 h-5 text-blue-500" />
              </div>
              <span className="text-white text-sm font-medium">{t('dash.history', lang)}</span>
            </Card>
          </Link>
        </div>

        {/* Recent Bills */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-white font-semibold">{t('dash.history', lang)}</h2>
            <Link href="/dashboard/history" className="text-xs text-green-500">
              {lang === 'EN' ? 'View all' : 'Lihat semua'}
            </Link>
          </div>

          {history.length === 0 ? (
            <Card className="text-center py-8">
              <Zap className="w-8 h-8 text-gray-600 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">{t('dash.noHistory', lang)}</p>
              <p className="text-gray-600 text-xs mt-1">
                {lang === 'EN' ? 'Upload your first TNB bill to get started' : 'Muat naik bil TNB pertama anda untuk bermula'}
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {history.slice(0, 3).map(record => (
                <Card
                  key={record.id}
                  onClick={() => record.isUnlocked
                    ? router.push(`/dashboard/report?id=${record.id}`)
                    : router.push(`/dashboard/teaser?id=${record.id}`)
                  }
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      record.isUnlocked ? 'bg-green-500/10' : 'bg-gray-800'
                    }`}>
                      {record.isUnlocked
                        ? <TrendingDown className="w-4 h-4 text-green-500" />
                        : <Lock className="w-4 h-4 text-gray-500" />
                      }
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">{record.billingMonth}</p>
                      <p className="text-gray-400 text-xs">
                        {record.totalKwh} kWh — RM{record.totalAmountMyr}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!record.isUnlocked && record.teaserAmount && (
                      <span className="text-xs text-orange-400">
                        Save RM{record.teaserAmount}
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-gray-600" />
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Profile Quick Link */}
        <Card onClick={() => router.push('/dashboard/onboarding')} className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center">
              <User className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <p className="text-white text-sm font-medium">
                {lang === 'EN' ? 'Appliance Profile' : 'Profil Peralatan'}
              </p>
              <p className="text-gray-400 text-xs">
                {lang === 'EN' ? 'Update your home appliances' : 'Kemaskini peralatan rumah anda'}
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-600" />
        </Card>
      </div>
    </div>
  );
}