'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { confirmBills } from '@/lib/api';
import { ArrowLeft, CheckCircle, RefreshCw } from 'lucide-react';

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
    const stored = sessionStorage.getItem('jimat_ocr_results');
    const storedPricing = sessionStorage.getItem('jimat_pricing');
    if (!stored) { router.replace('/dashboard/upload'); return; }
    try {
      setOcrResults(JSON.parse(stored));
      if (storedPricing) setPricing(JSON.parse(storedPricing));
    } catch (e) {
      router.replace('/dashboard/upload'); return;
    }
    setTimeout(() => setMounted(true), 100);
  }, [user, loading]);

  const handleConfirm = async () => {
    setConfirming(true);
    try {
      const res = await confirmBills({ ocrResults });
      const { teaser } = res.data;

      sessionStorage.removeItem('jimat_ocr_results');
      sessionStorage.removeItem('jimat_pricing');

      toast.success(lang === 'EN' ? 'Analysis ready!' : 'Analisis bersedia!');

      const coveragePercent = teaser.coveragePercent || 100;
      const coverageGapKwh = teaser.coverageGapKwh || 0;

      if (coveragePercent < 80 && coverageGapKwh > 0) {
        sessionStorage.setItem('jimat_gap_record_id', teaser.recordId);
        toast(
          lang === 'EN'
            ? `⚡ ${coverageGapKwh.toFixed(0)} kWh unaccounted — add missing appliances for a more accurate report`
            : `⚡ ${coverageGapKwh.toFixed(0)} kWh tidak dapat dijelaskan — tambah peralatan yang tiada untuk laporan lebih tepat`,
          { duration: 5000 }
        );
        router.push('/dashboard/onboarding');
        return;
      }

      router.push(`/dashboard/teaser?id=${teaser.recordId}`);

    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to process bills');
      setConfirming(false);
    }
  };

  const handleRetry = () => {
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

  // Sort ascending — Bill 1 first, Bill 2 second
  const sortedResults = [...ocrResults].sort((a, b) => {
    const aMonth = a.billingMonth || a.rawOcr?.billingMonth || '';
    const bMonth = b.billingMonth || b.rawOcr?.billingMonth || '';
    return aMonth.localeCompare(bMonth);
  });

  const getBillData = (ocr) => ({
    billingMonth: ocr.billingMonth || ocr.rawOcr?.billingMonth || '',
    cajSemasa: ocr.cajSemasa || ocr.rawOcr?.cajSemasa || 0,
    totalKwh: ocr.totalKwh || ocr.rawOcr?.totalKwh || 0,
    billingPeriodStart: ocr.billingPeriodStart || ocr.rawOcr?.billingPeriodStart || '',
    billingPeriodEnd: ocr.billingPeriodEnd || ocr.rawOcr?.billingPeriodEnd || '',
    billingPeriodDays: ocr.billingPeriodDays || ocr.rawOcr?.billingPeriodDays || 30,
    tunggakan: ocr.tunggakan || ocr.rawOcr?.tunggakan || 0,
    totalAmountMyr: ocr.totalAmountMyr || ocr.rawOcr?.totalAmountMyr || 0,
    isReference: ocr.isReference
  });

  return (
    <div className="min-h-screen relative" style={{ background: '#000000' }}>
      <ElectricBackground />

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

      <div className="relative z-10 max-w-lg mx-auto px-4 py-6 pb-40 space-y-5 transition-all duration-700"
        style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(20px)' }}>

        <div>
          <h1 className="text-xl font-bold text-white mb-1">
            {lang === 'EN' ? '🔍 Verify Your Bills' : '🔍 Sahkan Bil Anda'}
          </h1>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {lang === 'EN'
              ? 'Our AI extracted these values. Please verify ALL bills match before proceeding.'
              : 'AI kami mengekstrak nilai-nilai ini. Sila sahkan SEMUA bil sepadan sebelum meneruskan.'}
          </p>
        </div>

        {/* Show ALL bills */}
        {sortedResults.map((ocr, idx) => {
          const bill = getBillData(ocr);
          const isRef = bill.isReference;

          return (
            <div key={idx} className="rounded-2xl overflow-hidden"
              style={{
                background: isRef ? 'rgba(255,255,255,0.02)' : 'rgba(250,204,21,0.03)',
                border: `1px solid ${isRef ? 'rgba(255,255,255,0.08)' : 'rgba(250,204,21,0.2)'}`
              }}>
              <div className="px-4 pt-4 pb-2 flex items-center justify-between">
                <p className="text-sm font-bold text-white">
                  {isRef
                    ? (lang === 'EN' ? `📋 Bill 1 — Reference` : `📋 Bil 1 — Rujukan`)
                    : (lang === 'EN' ? `📋 Bill 2 — Your Report` : `📋 Bil 2 — Laporan Anda`)}
                </p>
                {!isRef && (
                  <span className="text-xs px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(250,204,21,0.1)', color: '#FACC15' }}>
                    {lang === 'EN' ? 'Main Bill' : 'Bil Utama'}
                  </span>
                )}
              </div>

              <div className="px-4 pb-4 space-y-1">
                {[
                  {
                    label: lang === 'EN' ? 'Billing Month' : 'Bulan Bil',
                    value: formatMonth(bill.billingMonth, lang),
                    critical: true
                  },
                  {
                    label: lang === 'EN' ? 'Billing Period' : 'Tempoh Bil',
                    value: bill.billingPeriodStart && bill.billingPeriodEnd
                      ? `${bill.billingPeriodStart} → ${bill.billingPeriodEnd} (${bill.billingPeriodDays} ${lang === 'EN' ? 'days' : 'hari'})`
                      : `${bill.billingPeriodDays} ${lang === 'EN' ? 'days' : 'hari'}`,
                    critical: false
                  },
                  {
                    label: lang === 'EN' ? 'Usage' : 'Penggunaan',
                    value: `${bill.totalKwh} kWh`,
                    critical: true
                  },
                  {
                    label: lang === 'EN' ? 'Caj Semasa' : 'Caj Semasa',
                    value: `RM${bill.cajSemasa?.toFixed(2)}`,
                    critical: true
                  },
                  ...(bill.tunggakan > 0 ? [{
                    label: lang === 'EN' ? 'Arrears (Tunggakan)' : 'Tunggakan',
                    value: `RM${bill.tunggakan?.toFixed(2)}`,
                    critical: false
                  }] : []),
                  ...(bill.tunggakan > 0 ? [{
                    label: lang === 'EN' ? 'Total Amount Due' : 'Jumlah Perlu Dibayar',
                    value: `RM${bill.totalAmountMyr?.toFixed(2)}`,
                    critical: false
                  }] : [])
                ].map((field, i, arr) => (
                  <div key={i} className="py-2.5"
                    style={{ borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>{field.label}</p>
                        {field.critical && (
                          <span className="text-xs px-1.5 py-0.5 rounded-full"
                            style={{ background: 'rgba(250,204,21,0.1)', color: 'rgba(250,204,21,0.6)', fontSize: '10px' }}>
                            {lang === 'EN' ? 'verify' : 'sahkan'}
                          </span>
                        )}
                      </div>
                      <p className="font-bold text-white text-right">{field.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        <div className="rounded-2xl p-4"
          style={{ background: 'rgba(250,204,21,0.05)', border: '1px solid rgba(250,204,21,0.15)' }}>
          <p className="text-sm font-bold mb-2" style={{ color: '#FACC15' }}>
            ⚡ {lang === 'EN' ? 'Check Against Your Physical Bills' : 'Semak Dengan Bil Fizikal Anda'}
          </p>
          <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
            {lang === 'EN'
              ? 'Compare BOTH bills above with your actual TNB bills. Check kWh usage and Caj Semasa for each. If both match — confirm and proceed.'
              : 'Bandingkan KEDUA-DUA bil di atas dengan bil TNB sebenar anda. Semak penggunaan kWh dan Caj Semasa setiap satu. Jika kedua-dua sepadan — sahkan dan teruskan.'}
          </p>
        </div>

        <div className="rounded-xl p-3"
          style={{ background: 'rgba(96,165,250,0.05)', border: '1px solid rgba(96,165,250,0.15)' }}>
          <p className="text-xs" style={{ color: 'rgba(96,165,250,0.7)' }}>
            💡 {lang === 'EN'
              ? "If values don't match — go back and upload PDF from TNB email or myTNB app for better accuracy."
              : 'Jika nilai tidak sepadan — kembali dan muat naik PDF dari email TNB atau apl myTNB untuk ketepatan lebih baik.'}
          </p>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 z-20"
        style={{ background: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(10px)', borderTop: '1px solid rgba(250,204,21,0.1)' }}>
        <div className="max-w-lg mx-auto space-y-3">
          <button onClick={handleConfirm} disabled={confirming}
            className="w-full py-4 rounded-xl font-bold text-base transition-all duration-300"
            style={{
              background: confirming ? 'rgba(250,204,21,0.3)' : 'linear-gradient(135deg, #FACC15 0%, #EAB308 100%)',
              color: '#000000',
              boxShadow: confirming ? 'none' : '0 0 25px rgba(250,204,21,0.4)'
            }}>
            {confirming ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                {lang === 'EN' ? 'Generating analysis...' : 'Menjana analisis...'}
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <CheckCircle className="w-5 h-5" />
                {lang === 'EN' ? '✅ Both Correct — Proceed' : '✅ Kedua-dua Betul — Teruskan'}
              </span>
            )}
          </button>

          <button onClick={handleRetry} disabled={confirming}
            className="w-full py-3.5 rounded-xl font-bold text-sm transition-all duration-300"
            style={{ background: 'transparent', border: '1px solid rgba(239,68,68,0.3)', color: 'rgba(239,68,68,0.7)' }}>
            <span className="flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4" />
              {lang === 'EN' ? '❌ Values wrong — Upload again' : '❌ Nilai salah — Muat naik semula'}
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