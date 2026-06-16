'use client';
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { checkPaymentStatus } from '@/lib/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Button from '@/components/ui/Button';
import { Zap, CheckCircle, XCircle } from 'lucide-react';

function PaymentSuccessContent() {
  const { user, loading, lang } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const billcode = searchParams.get('billcode');
  const [status, setStatus] = useState('checking');
  const [recordId, setRecordId] = useState(null);

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [user, loading]);

  useEffect(() => {
    if (!billcode) {
      setStatus('error');
      return;
    }

    // Poll payment status — webhook may take a few seconds
    let attempts = 0;
    const poll = setInterval(async () => {
      attempts++;
      try {
        const history = await import('@/lib/api').then(m => m.getBillingHistory());
        const records = history.data.records;
        const unlocked = records.find(r => r.isUnlocked);
        if (unlocked) {
          setRecordId(unlocked.id);
          setStatus('success');
          clearInterval(poll);
        } else if (attempts >= 10) {
          setStatus('pending');
          clearInterval(poll);
        }
      } catch {
        if (attempts >= 10) {
          setStatus('error');
          clearInterval(poll);
        }
      }
    }, 2000);

    return () => clearInterval(poll);
  }, [billcode]);

  if (loading || status === 'checking') {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-4">
        <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-white font-medium">Verifying payment...</p>
        <p className="text-gray-400 text-sm mt-1">Please wait a moment</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <div className="flex items-center p-4 gap-2">
        <div className="w-7 h-7 bg-green-500 rounded-lg flex items-center justify-center">
          <Zap className="w-4 h-4 text-gray-950" />
        </div>
        <span className="font-bold text-white">JIMAT</span>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        {status === 'success' ? (
          <>
            <div className="w-20 h-20 bg-green-500/10 border border-green-500/30 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              {lang === 'EN' ? 'Payment Successful!' : 'Pembayaran Berjaya!'}
            </h1>
            <p className="text-gray-400 text-sm mb-8">
              {lang === 'EN' ? 'Your report is now unlocked. Let\'s see where your money is going.' : 'Laporan anda sudah dibuka. Mari lihat ke mana wang anda pergi.'}
            </p>
            <Button onClick={() => router.push(`/dashboard/report?id=${recordId}`)} fullWidth>
              {lang === 'EN' ? 'View My Report' : 'Lihat Laporan Saya'}
            </Button>
          </>
        ) : status === 'pending' ? (
          <>
            <div className="w-20 h-20 bg-yellow-500/10 border border-yellow-500/30 rounded-full flex items-center justify-center mb-6">
              <Zap className="w-10 h-10 text-yellow-500" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              {lang === 'EN' ? 'Payment Processing' : 'Pembayaran Diproses'}
            </h1>
            <p className="text-gray-400 text-sm mb-8">
              {lang === 'EN' ? 'Your payment is being verified. Check your history in a moment.' : 'Pembayaran anda sedang disahkan. Semak sejarah anda sebentar lagi.'}
            </p>
            <Button onClick={() => router.push('/dashboard/history')} fullWidth>
              {lang === 'EN' ? 'View History' : 'Lihat Sejarah'}
            </Button>
          </>
        ) : (
          <>
            <div className="w-20 h-20 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center mb-6">
              <XCircle className="w-10 h-10 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              {lang === 'EN' ? 'Payment Failed' : 'Pembayaran Gagal'}
            </h1>
            <p className="text-gray-400 text-sm mb-8">
              {lang === 'EN' ? 'Something went wrong. Please try again.' : 'Sesuatu telah silap. Sila cuba lagi.'}
            </p>
            <Button onClick={() => router.push('/dashboard')} fullWidth variant="secondary">
              {lang === 'EN' ? 'Back to Dashboard' : 'Kembali ke Papan Pemuka'}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <PaymentSuccessContent />
    </Suspense>
  );
}