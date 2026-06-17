'use client';
import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { getTeaser, createPayment } from '@/lib/api';
import { t } from '@/lib/i18n';
import { ArrowLeft, Lock } from 'lucide-react';

const BAND_CONFIG = {
  EXCELLENT: { emoji: '🟢', color: '#22c55e', label: { EN: 'Excellent', BM: 'Cemerlang' } },
  GOOD:      { emoji: '🟡', color: '#eab308', label: { EN: 'Good', BM: 'Baik' } },
  FAIR:      { emoji: '🟠', color: '#f97316', label: { EN: 'Fair', BM: 'Sederhana' } },
  ATTENTION: { emoji: '🔴', color: '#ef4444', label: { EN: 'Needs Attention', BM: 'Perlu Perhatian' } },
  CRITICAL:  { emoji: '⚫', color: '#6b7280', label: { EN: 'Critical', BM: 'Kritikal' } }
};

function ElectricBackground() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const particles = Array.from({ length: 50 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2 + 0.5,
      speedY: -(Math.random() * 0.8 + 0.2),
      speedX: (Math.random() - 0.5) * 0.3,
      opacity: Math.random() * 0.5 + 0.1,
      color: Math.random() > 0.5 ? '#FACC15' : '#86EFAC'
    }));
    let animId;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.fill();
        p.y += p.speedY;
        p.x += p.speedX;
        p.opacity -= 0.001;
        if (p.y < 0 || p.opacity <= 0) {
          p.x = Math.random() * canvas.width;
          p.y = canvas.height;
          p.opacity = Math.random() * 0.5 + 0.1;
        }
      });
      animId = requestAnimationFrame(animate);
    };
    animate();
    const handleResize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    window.addEventListener('resize', handleResize);
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', handleResize); };
  }, []);
  return (
    <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0"
      style={{ background: 'linear-gradient(to bottom, #000000, #050500, #000000)' }} />
  );
}

function AnimatedAmount({ amount }) {
  const [displayed, setDisplayed] = useState(0);
  useEffect(() => {
    let start = 0;
    const target = amount;
    const startTime = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / 1500, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(eased * target);
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [amount]);
  return <span>RM{displayed.toFixed(2)}</span>;
}

function TeaserContent() {
  const { user, loading, lang } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const recordId = searchParams.get('id');
  const [teaserData, setTeaserData] = useState(null);
  const [paying, setPaying] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
    if (!recordId) router.replace('/dashboard');
    if (user && recordId) {
      getTeaser(recordId)
        .then(res => {
          if (res.data.isUnlocked) {
            router.replace(`/dashboard/report?id=${recordId}`);
          } else {
            setTeaserData(res.data.teaser);
          }
        })
        .catch(() => toast.error('Failed to load'))
        .finally(() => setPageLoading(false));
    }
    setTimeout(() => setMounted(true), 300);
  }, [user, loading, recordId]);

  const handlePay = async () => {
    setPaying(true);
    try {
      const res = await createPayment({ recordId });
      window.location.href = res.data.paymentUrl;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create payment');
      setPaying(false);
    }
  };

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

  if (!teaserData) return null;

  const estimatedSaving = teaserData.estimatedOverspendMyr || 0;
  const healthScore = teaserData.healthScore;
  const healthBand = teaserData.healthBand;
  const band = healthBand ? BAND_CONFIG[healthBand] : null;
  const missionKwhTarget = teaserData.missionKwhTarget;

  // Price based on referenceMonth presence (onboard vs loyal)
  // Teaser doesn't know price — fetch from chain or use default
  const price = teaserData.referenceMonth ? 6.99 : 11.99;
  const total = (price + 1).toFixed(2);

  const lockedItems = [
    { icon: '🔬', label: lang === 'EN' ? 'Full Bill Autopsy' : 'Bedah Siasat Bil Penuh' },
    { icon: '🔥', label: t('teaser.bleeder', lang) },
    { icon: '🎯', label: t('teaser.missions', lang) },
    { icon: '📊', label: lang === 'EN' ? `vs ${teaserData.referenceMonth || 'last month'}` : `vs ${teaserData.referenceMonth || 'bulan lepas'}` },
    { icon: '📡', label: t('teaser.afa', lang) },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: '#000000' }}>
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

      <div className="relative z-10 max-w-lg mx-auto px-4 py-6 pb-36 space-y-5">

        {/* Health Score Preview — NEW */}
        {band && healthScore !== null && (
          <div className="rounded-2xl p-4 text-center transition-all duration-700"
            style={{
              opacity: mounted ? 1 : 0,
              background: `rgba(${band.color === '#22c55e' ? '34,197,94' : band.color === '#eab308' ? '234,179,8' : band.color === '#f97316' ? '249,115,22' : '239,68,68'},0.06)`,
              border: `1px solid ${band.color}30`
            }}>
            <p className="text-xs mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>
              {lang === 'EN' ? 'Your Electricity Health Score' : 'Skor Kesihatan Elektrik Anda'}
            </p>
            <div className="flex items-center justify-center gap-3">
              <span style={{ fontSize: '2rem' }}>{band.emoji}</span>
              <div>
                <p className="text-4xl font-black" style={{ color: band.color }}>{healthScore}</p>
                <p className="text-xs font-bold" style={{ color: band.color }}>/100 — {band.label[lang] || band.label.EN}</p>
              </div>
            </div>
            {missionKwhTarget && (
              <p className="text-xs mt-2" style={{ color: 'rgba(255,255,255,0.3)' }}>
                {lang === 'EN'
                  ? `Target next month: ${missionKwhTarget} kWh`
                  : `Sasaran bulan depan: ${missionKwhTarget} kWh`}
              </p>
            )}
            <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.25)' }}>
              {lang === 'EN' ? 'Unlock full report to see how to improve' : 'Buka laporan penuh untuk tahu cara bertambah baik'}
            </p>
          </div>
        )}

        {/* Hero — Saving Amount */}
        <div className="text-center py-4 transition-all duration-700"
          style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(20px)' }}>
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="h-px flex-1" style={{ background: 'rgba(250,204,21,0.2)' }} />
            <span className="text-xs font-medium px-3" style={{ color: 'rgba(250,204,21,0.7)' }}>
              ⚡ {t('teaser.title', lang)}
            </span>
            <div className="h-px flex-1" style={{ background: 'rgba(250,204,21,0.2)' }} />
          </div>

          {/* Reference month context */}
          {teaserData.referenceMonth && (
            <p className="text-xs mb-3" style={{ color: 'rgba(255,255,255,0.3)' }}>
              {lang === 'EN'
                ? `Analysis: ${teaserData.referenceMonth} + ${teaserData.billingMonth}`
                : `Analisis: ${teaserData.referenceMonth} + ${teaserData.billingMonth}`}
            </p>
          )}

          <div className="relative rounded-3xl p-8 overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(250,204,21,0.08) 0%, rgba(0,0,0,0) 100%)',
              border: '1px solid rgba(250,204,21,0.3)',
              boxShadow: '0 0 40px rgba(250,204,21,0.1), inset 0 0 40px rgba(250,204,21,0.03)'
            }}>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-48 h-48 rounded-full"
                style={{ background: 'radial-gradient(circle, rgba(250,204,21,0.08) 0%, transparent 70%)' }} />
            </div>
            <p className="text-sm mb-2 relative z-10" style={{ color: 'rgba(255,255,255,0.5)' }}>
              {lang === 'EN' ? 'Potential monthly saving identified' : 'Potensi penjimatan bulanan dikenal pasti'}
            </p>
            <div className="relative z-10" style={{
              fontSize: '3.5rem', fontWeight: 900, color: '#FACC15',
              textShadow: '0 0 30px rgba(250,204,21,0.6), 0 0 60px rgba(250,204,21,0.3)', lineHeight: 1.1
            }}>
              {mounted ? <AnimatedAmount amount={estimatedSaving} /> : `RM${estimatedSaving.toFixed(2)}`}
            </div>
            <p className="text-sm relative z-10 mt-2" style={{ color: 'rgba(250,204,21,0.6)' }}>
              {t('common.perMonth', lang)}
            </p>
          </div>
          <p className="text-xs mt-3" style={{ color: 'rgba(255,255,255,0.3)' }}>
            {t('teaser.disclaimer', lang)}
          </p>
        </div>

        {/* Locked Items */}
        <div>
          <p className="text-sm text-center mb-3 font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>
            🔒 {t('teaser.locked', lang)}
          </p>
          <div className="space-y-2">
            {lockedItems.map((item, i) => (
              <div key={i} className="relative rounded-2xl overflow-hidden"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex items-center gap-3 p-4" style={{ filter: 'blur(4px)', userSelect: 'none' }}>
                  <span className="text-xl">{item.icon}</span>
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 rounded-full w-3/4" style={{ background: 'rgba(255,255,255,0.15)' }} />
                    <div className="h-2.5 rounded-full w-1/2" style={{ background: 'rgba(255,255,255,0.08)' }} />
                  </div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.3)' }}>
                  <div className="flex items-center gap-2 px-4 py-1.5 rounded-full"
                    style={{ background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <Lock className="w-3 h-3" style={{ color: 'rgba(250,204,21,0.7)' }} />
                    <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.6)' }}>{item.label}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ROI Nudge */}
        <div className="rounded-2xl p-4 text-center"
          style={{ background: 'rgba(250,204,21,0.05)', border: '1px solid rgba(250,204,21,0.15)' }}>
          <p className="text-sm text-white font-semibold">
            {lang === 'EN'
              ? `Pay RM${total} → Potentially save RM${estimatedSaving.toFixed(2)}/month`
              : `Bayar RM${total} → Jimat anggaran RM${estimatedSaving.toFixed(2)}/bulan`}
          </p>
          <p className="text-xs mt-1" style={{ color: 'rgba(250,204,21,0.6)' }}>
            {lang === 'EN' ? 'ROI in less than 1 week' : 'Pulangan dalam masa kurang dari 1 minggu'}
          </p>
        </div>
      </div>

      {/* Fixed Bottom Pay */}
      <div className="fixed bottom-0 left-0 right-0 p-4 z-20"
        style={{ background: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(10px)', borderTop: '1px solid rgba(250,204,21,0.15)' }}>
        <div className="max-w-lg mx-auto space-y-3">
          <button onClick={handlePay} disabled={paying}
            className="w-full py-4 rounded-xl font-bold text-base transition-all duration-300"
            style={{
              background: paying ? 'rgba(250,204,21,0.3)' : 'linear-gradient(135deg, #FACC15 0%, #EAB308 100%)',
              color: '#000000',
              boxShadow: paying ? 'none' : '0 0 30px rgba(250,204,21,0.5), 0 4px 20px rgba(250,204,21,0.3)'
            }}>
            {paying ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                {lang === 'EN' ? 'Redirecting...' : 'Mengalihkan...'}
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M13 2L4.5 13.5H11L10 22L19.5 10.5H13L13 2Z" fill="#000000" />
                </svg>
                {t('teaser.pay', lang).replace('{amount}', total)}
              </span>
            )}
          </button>
          <p className="text-xs text-center" style={{ color: 'rgba(255,255,255,0.2)' }}>
            {lang === 'EN' ? '🔒 Secure payment via ToyyibPay · DuitNow QR accepted' : '🔒 Pembayaran selamat melalui ToyyibPay · DuitNow QR diterima'}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function TeaserPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#000000' }}>
        <div className="w-10 h-10 rounded-full animate-pulse"
          style={{ background: 'rgba(250,204,21,0.1)', border: '1px solid rgba(250,204,21,0.3)' }} />
      </div>
    }>
      <TeaserContent />
    </Suspense>
  );
}