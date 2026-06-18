'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { confirmBills } from '@/lib/api';
import { ArrowLeft, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

function ElectricBackground() {
  const [particles] = useState(() =>
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: Math.random() * 2 + 1,
      duration: Math.random() * 3 + 2,
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
            background: p.color, opacity: 0.2,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`
          }} />
      ))}
    </div>
  );
}

const MONTH_NAMES = {
  EN: { '01': 'January', '02': 'February', '03': 'March', '04': 'April', '05': 'May', '06': 'June', '07': 'July', '08': 'August', '09': 'September', '10': 'October', '11': 'November', '12': 'December' },
  BM: { '01': 'Januari', '02': 'Februari', '03': 'Mac', '04': 'April', '05': 'Mei', '06': 'Jun', '07': 'Julai', '08': 'Ogos', '09': 'September', '10': 'Oktober', '11': 'November', '12': 'Disember' }
};

const formatMonth = (yearMonth, lang) => {
  if (!yearMonth) return '';
  const [year, month] = yearMonth.split('-');
  return `${MONTH_NAMES[lang]?.[month] || month} ${year}`;
};

export default function ConfirmPage() {
  const { user, loading, lang } = useAuth();
  const router = useRouter();
  const [ocrResults, setOcrResults] = useState([]);
  const [pricing, setPricing] = useState(null);
  const [confirming, setConfirming] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (!loading && !user) { router.replace('/login'); return; }

    // Load OCR results from sessionStorage
    const stored = sessionStorage.getItem('jimat_ocr_results');
    const storedPricing = sessionStorage.getItem('jimat_pricing');

    if (!stored) {
      // No OCR data — go back to upload
      router.replace('/dashboard/upload');
      return;
    }

    try {
      setOcrResults(JSON.parse(stored));
      if (storedPricing) setPricing(JSON.parse(storedPricing));
    } catch (e) {
      router.replace('/dashboard/upload');
      return;
    }

    setTimeout(() => setMounted(true), 100);
  }, [user, loading]);

  const handleConfirm = async () => {
    setConfirming(true);
    try {
      const res = await confirmBills({ ocrResults });
      const { teaser, pricing: responsePricing } = res.data;

      // Clear sessionStorage
      sessionStorage.removeItem('jimat_ocr_results');
      sessionStorage.removeItem('jimat_pricing');

      toast.success(lang === 'EN' ? 'Analysis ready!' : 'Analisis bersedia!');
      router.push(`/dashboard/teaser?id=${teaser.recordId}`);

    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to process bills');
      setConfirming(false);
    }
  };

  const handleRetry = () => {
    // Clear OCR data and go back to upload
    sessionStorage.removeItem('jimat_ocr_results');
    sessionStorage.removeItem('jimat_pricing');
    router.replace('/dashboard/upload');
  };

  if (loading || ocrResults.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#000000' }}>
        <div className="w-10 h-10 rounded-full animate-pulse"
          style={{ background: 'rgba(250,204,21,0.1)', border: '1px solid rgba(250,204,21,0.3)' }} />
      </div>
    );
  }

  // Show only the latest bill for confirmation (last in sorted array)
  const latestOcr = ocrResults[ocrResults.length - 1];
  const cajSemasa = latestOcr.cajSemasa || latestOcr.rawOcr?.cajSemasa || 0;
  const totalKwh = latestOcr.totalKwh || latestOcr.rawOcr?.totalKwh || 0;
  const billingMonth = latestOcr.billingMonth || latestOcr.rawOcr?.billingMonth || '';
  const billingPeriodStart = latestOcr.billingPeriodStart || latestOcr.rawOcr?.billingPeriodStart || '';
  const billingPeriodEnd = latestOcr.billingPeriodEnd || latestOcr.rawOcr?.billingPeriodEnd || '';
  const billingPeriodDays = latestOcr.billingPeriodDays || latestOcr.rawOcr?.billingPeriodDays || 30;
  const tunggakan = latestOcr.tunggakan || latestOcr.rawOcr?.tunggakan || 0;
  const totalAmountMyr = latestOcr.totalAmountMyr || latestOcr.rawOcr?.totalAmountMyr || 0;

  const fields = [
    {
      label: lang === 'EN' ? 'Billing Month' : 'Bulan Bil',
      value: formatMonth(billingMonth, lang),
      hint: lang === 'EN' ? 'From end date of Tempoh Bil' : 'Dari tarikh akhir Tempoh Bil',
      critical: true
    },
    {
      label: lang === 'EN' ? 'Billing Period' : 'Tempoh Bil',
      value: billingPeriodStart && billingPeriodEnd
        ? `${billingPeriodStart} → ${billingPeriodEnd} (${billingPeriodDays} ${lang === 'EN' ? 'days' : 'hari'})`
        : `${billingPeriodDays} ${lang === 'EN' ? 'days' : 'hari'}`,
      hint: lang === 'EN' ? 'Tempoh Bil on your TNB bill' : 'Tempoh Bil pada bil TNB anda',
      critical: false
    },
    {
      label: lang === 'EN' ? 'Usage' : 'Penggunaan',
      value: `${totalKwh} kWh`,
      hint: lang === 'EN' ? 'Penggunaan Anda on your bill' : 'Penggunaan Anda pada bil anda',
      critical: true
    },
    {
      label: lang === 'EN' ? 'Current Month Bill (Caj Semasa)' : 'Bil Bulan Semasa (Caj Semasa)',
      value: `RM${cajSemasa?.toFixed(2)}`,
      hint: lang === 'EN' ? 'Caj Semasa only — NOT including arrears' : 'Caj Semasa sahaja — TIDAK termasuk tunggakan',
      critical: true
    },
    ...(tunggakan > 0 ? [{
      label: lang === 'EN' ? 'Arrears (Tunggakan)' : 'Tunggakan',
      value: `RM${tunggakan?.toFixed(2)}`,
      hint: lang === 'EN' ? 'Outstanding from previous months' : 'Tertunggak dari bulan sebelum',
      critical: false
    }] : []),
    ...(tunggakan > 0 ? [{
      label: lang === 'EN' ? 'Total Amount Due' : 'Jumlah Perlu Dibayar',
      value: `RM${totalAmountMyr?.toFixed(2)}`,
      hint: lang === 'EN' ? 'Grand total including arrears' : 'Jumlah besar termasuk tunggakan',
      critical: false
    }] : [])
  ];

  return (
    <div className="min-h-screen relative" style={{ background: '#000000' }}>
      <ElectricBackground />

      {/* Header */}
      <div className="relative z-10 px-4 py-3 flex items-center gap-3 sticky top-0"
        style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(250,204,21,0.1)' }}>
        <button onClick={handleRetry} style={{ color: 'rgba(250,204,21,0.6)' }}>
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

      <div
        className="relative z-10 max-w-lg mx-auto px-4 py-6 pb-40 space-y-5 transition-all duration-700"
        style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(20px)' }}
      >
        {/* Title */}
        <div>
          <h1 className="text-xl font-bold text-white mb-1">
            {lang === 'EN' ? '🔍 Verify Your Bill' : '🔍 Sahkan Bil Anda'}
          </h1>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {lang === 'EN'
              ? 'Our AI extracted these values from your TNB bill. Please verify they match before proceeding.'
              : 'AI kami mengekstrak nilai-nilai ini dari bil TNB anda. Sila sahkan ia sepadan sebelum meneruskan.'}
          </p>
        </div>

        {/* Multiple bills indicator */}
        {ocrResults.length > 1 && (
          <div className="rounded-xl p-3"
            style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
            <p className="text-xs font-semibold" style={{ color: '#22c55e' }}>
              ✅ {lang === 'EN'
                ? `${ocrResults.length} consecutive bills detected — showing latest bill`
                : `${ocrResults.length} bil berturut-turut dikesan — menunjukkan bil terkini`}
            </p>
            <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
              {ocrResults.map(r => formatMonth(r.billingMonth || r.rawOcr?.billingMonth, lang)).join(' + ')}
            </p>
          </div>
        )}

        {/* Extracted Values */}
        <div className="rounded-2xl overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(250,204,21,0.15)' }}>
          <div className="px-4 pt-4 pb-2">
            <p className="text-sm font-bold text-white">
              {lang === 'EN' ? '📋 What We Read From Your Bill' : '📋 Apa Yang Kami Baca Dari Bil Anda'}
            </p>
          </div>

          <div className="px-4 pb-4 space-y-1">
            {fields.map((field, i) => (
              <div key={i} className="py-3"
                style={{ borderBottom: i < fields.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
                      {field.label}
                    </p>
                    {field.critical && (
                      <span className="text-xs px-1.5 py-0.5 rounded-full"
                        style={{ background: 'rgba(250,204,21,0.1)', color: 'rgba(250,204,21,0.6)', fontSize: '10px' }}>
                        {lang === 'EN' ? 'verify' : 'sahkan'}
                      </span>
                    )}
                  </div>
                  <p className="font-bold text-white text-right">{field.value}</p>
                </div>
                <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.25)' }}>
                  {field.hint}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Instruction */}
        <div className="rounded-2xl p-4"
          style={{ background: 'rgba(250,204,21,0.05)', border: '1px solid rgba(250,204,21,0.15)' }}>
          <p className="text-sm font-bold mb-2" style={{ color: '#FACC15' }}>
            ⚡ {lang === 'EN' ? 'Check Against Your Physical Bill' : 'Semak Dengan Bil Fizikal Anda'}
          </p>
          <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
            {lang === 'EN'
              ? 'Compare the values above with your TNB bill. Pay attention to Caj Semasa (current month only, excluding arrears) and kWh usage. If they match — confirm and proceed to analysis.'
              : 'Bandingkan nilai di atas dengan bil TNB anda. Perhatikan Caj Semasa (bulan semasa sahaja, tidak termasuk tunggakan) dan penggunaan kWh. Jika sepadan — sahkan dan teruskan ke analisis.'}
          </p>
        </div>

        {/* PDF tip if image was uploaded */}
        <div className="rounded-xl p-3"
          style={{ background: 'rgba(96,165,250,0.05)', border: '1px solid rgba(96,165,250,0.15)' }}>
          <p className="text-xs" style={{ color: 'rgba(96,165,250,0.7)' }}>
            💡 {lang === 'EN'
              ? 'If values don\'t match — go back and upload PDF from TNB email or myTNB app for better accuracy.'
              : 'Jika nilai tidak sepadan — kembali dan muat naik PDF dari email TNB atau apl myTNB untuk ketepatan lebih baik.'}
          </p>
        </div>
      </div>

      {/* Fixed Bottom Buttons */}
      <div className="fixed bottom-0 left-0 right-0 p-4 z-20"
        style={{ background: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(10px)', borderTop: '1px solid rgba(250,204,21,0.1)' }}>
        <div className="max-w-lg mx-auto space-y-3">

          {/* Confirm */}
          <button
            onClick={handleConfirm}
            disabled={confirming}
            className="w-full py-4 rounded-xl font-bold text-base transition-all duration-300"
            style={{
              background: confirming
                ? 'rgba(250,204,21,0.3)'
                : 'linear-gradient(135deg, #FACC15 0%, #EAB308 100%)',
              color: '#000000',
              boxShadow: confirming ? 'none' : '0 0 25px rgba(250,204,21,0.4)'
            }}
          >
            {confirming ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                {lang === 'EN' ? 'Generating analysis...' : 'Menjana analisis...'}
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <CheckCircle className="w-5 h-5" />
                {lang === 'EN' ? '✅ Correct — Proceed to Analysis' : '✅ Betul — Teruskan ke Analisis'}
              </span>
            )}
          </button>

          {/* Retry */}
          <button
            onClick={handleRetry}
            disabled={confirming}
            className="w-full py-3.5 rounded-xl font-bold text-sm transition-all duration-300"
            style={{
              background: 'transparent',
              border: '1px solid rgba(239,68,68,0.3)',
              color: 'rgba(239,68,68,0.7)'
            }}
          >
            <span className="flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4" />
              {lang === 'EN'
                ? '❌ Values wrong — Upload again'
                : '❌ Nilai salah — Muat naik semula'}
            </span>
          </button>

          <p className="text-xs text-center" style={{ color: 'rgba(255,255,255,0.15)' }}>
            {lang === 'EN'
              ? 'Payment only happens after analysis is confirmed'
              : 'Pembayaran hanya berlaku selepas analisis disahkan'}
          </p>
        </div>
      </div>
    </div>
  );
}