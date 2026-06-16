'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { createPayment } from '@/lib/api';
import { t } from '@/lib/i18n';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Zap, Lock, ArrowLeft } from 'lucide-react';

function TeaserContent() {
  const { user, loading, lang } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const recordId = searchParams.get('id');
  const estimatedSaving = parseFloat(searchParams.get('amount') || '0');
  const price = parseFloat(searchParams.get('price') || '11.99');
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
    if (!recordId) router.replace('/dashboard');
  }, [user, loading]);

  const handlePay = async () => {
    setPaying(true);
    try {
      const res = await createPayment({ recordId });
      const { paymentUrl } = res.data;
      window.location.href = paymentUrl;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create payment');
      setPaying(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  const total = (price + 1).toFixed(2);

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-white">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-green-500" />
          <span className="font-bold text-white">JIMAT</span>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
        {/* Title */}
        <div className="text-center py-4">
          <p className="text-gray-400 text-sm mb-2">⚡ {t('teaser.title', lang)}</p>
          <h1 className="text-3xl font-bold text-white mb-1">
            {t('teaser.overspend', lang)}
          </h1>
          <div className="mt-4 bg-green-500/10 border border-green-500/30 rounded-2xl p-6">
            <p className="text-gray-400 text-sm mb-1">
              {lang === 'EN' ? 'You could be overspending' : 'Anda mungkin membazir'}
            </p>
            <p className="text-5xl font-bold text-green-500">
              RM{estimatedSaving.toFixed(2)}
            </p>
            <p className="text-gray-400 text-sm mt-1">{t('common.perMonth', lang)}</p>
          </div>
        </div>

        {/* Locked Cards */}
        <p className="text-gray-400 text-sm text-center">{t('teaser.locked', lang)}</p>

        {[
          { icon: '🎯', label: t('teaser.bleeder', lang) },
          { icon: '📋', label: t('teaser.missions', lang) },
          { icon: '📊', label: t('teaser.comparison', lang) },
          { icon: '📡', label: t('teaser.afa', lang) },
        ].map((item, i) => (
          <div key={i} className="relative">
            <Card className="flex items-center gap-3 py-4">
              <span className="text-xl">{item.icon}</span>
              <div className="flex-1">
                <div className="h-4 bg-gray-700 rounded blur-report w-3/4" />
                <div className="h-3 bg-gray-800 rounded blur-report w-1/2 mt-2" />
              </div>
              <Lock className="w-4 h-4 text-gray-600" />
            </Card>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-gray-400 text-xs font-medium bg-gray-900 px-3 py-1 rounded-full border border-gray-700">
                🔒 {item.label}
              </span>
            </div>
          </div>
        ))}

        {/* Disclaimer */}
        <p className="text-gray-600 text-xs text-center">{t('teaser.disclaimer', lang)}</p>

        {/* Pay Button */}
        <div className="pt-2 space-y-3">
          <Button onClick={handlePay} loading={paying} fullWidth className="py-4 text-base">
            {t('teaser.pay', lang).replace('{amount}', total)}
          </Button>
          <p className="text-gray-600 text-xs text-center">
            {lang === 'EN'
              ? 'Secure payment via ToyyibPay. DuitNow QR accepted.'
              : 'Pembayaran selamat melalui ToyyibPay. DuitNow QR diterima.'}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function TeaserPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <TeaserContent />
    </Suspense>
  );
}