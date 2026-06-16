'use client';
import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { createPayment } from '@/lib/api';
import { t } from '@/lib/i18n';
import { ArrowLeft, Lock } from 'lucide-react';

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
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  return (
    <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0"
      style={{ background: 'linear-gradient(to bottom, #000000, #050500, #000000)' }} />
  );
}

// Animated counter for the saving amount
function AnimatedAmount({ amount }) {
  const [displayed, setDisplayed] = useState(0);
  useEffect(() => {
    let start = 0;
    const target = amount;
    const duration = 1500;
    const startTime = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out
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
  const estimatedSaving = parseFloat(searchParams.get('amount') || '0');
  const price = parseFloat(searchParams.get('price') || '11.99');
  const [paying, setPaying] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
    if (!recordId) router.replace('/dashboard');
    setTimeout(() => setMounted(true), 300);
  }, [user, loading]);

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

  if (loading) {
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

  const total = (price + 1).toFixed(2);

  const lockedItems = [
    { icon: '🎯', label: t('teaser.bleeder', lang) },
    { icon: '📋', label: t('teaser.missions', lang) },
    { icon: '📊', label: t('teaser.comparison', lang) },
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

        {/* Hero — The Big Number */}
        <div
          className="text-center py-6 transition-all duration-700"
          style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(20px)' }}
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="h-px flex-1" style={{ background: 'rgba(250,204,21,0.2)' }} />
            <span className="text-xs font-medium px-3" style={{ color: 'rgba(250,204,21,0.7)' }}>
              ⚡ {t('teaser.title', lang)}
            </span>
            <div className="h-px flex-1" style={{ background: 'rgba(250,204,21,0.2)' }} />
          </div>

          <h1 className="text-lg font-semibold text-white mb-4">
            {t('teaser.overspend', lang)}
          </h1>

          {/* Main amount card */}
          <div className="relative rounded-3xl p-8 overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(250,204,21,0.08) 0%, rgba(0,0,0,0) 100%)',
              border: '1px solid rgba(250,204,21,0.3)',
              boxShadow: '0 0 40px rgba(250,204,21,0.1), inset 0 0 40px rgba(250,204,21,0.03)'
            }}>
            {/* Glow behind number */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-48 h-48 rounded-full"
                style={{ background: 'radial-gradient(circle, rgba(250,204,21,0.08) 0%, transparent 70%)' }} />
            </div>

            <p className="text-sm mb-2 relative z-10" style={{ color: 'rgba(255,255,255,0.5)' }}>
              {lang === 'EN' ? 'Your estimated monthly overspend' : 'Anggaran pembaziran bulanan anda'}
            </p>

            <div className="relative z-10" style={{
              fontSize: '3.5rem',
              fontWeight: 900,
              color: '#FACC15',
              textShadow: '0 0 30px rgba(250,204,21,0.6), 0 0 60px rgba(250,204,21,0.3)',
              lineHeight: 1.1
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

        {/* Locked Cards */}
        <div>
          <p className="text-sm text-center mb-3 font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>
            🔒 {t('teaser.locked', lang)}
          </p>

          <div className="space-y-2">
            {lockedItems.map((item, i) => (
              <div key={i} className="relative rounded-2xl overflow-hidden"
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.06)'
                }}>
                {/* Blurred fake content */}
                <div className="flex items-center gap-3 p-4" style={{ filter: 'blur(4px)', userSelect: 'none' }}>
                  <span className="text-xl">{item.icon}</span>
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 rounded-full w-3/4"
                      style={{ background: 'rgba(255,255,255,0.15)' }} />
                    <div className="h-2.5 rounded-full w-1/2"
                      style={{ background: 'rgba(255,255,255,0.08)' }} />
                  </div>
                  <div className="h-6 w-16 rounded-lg"
                    style={{ background: 'rgba(250,204,21,0.15)' }} />
                </div>

                {/* Lock overlay */}
                <div className="absolute inset-0 flex items-center justify-center"
                  style={{ background: 'rgba(0,0,0,0.3)' }}>
                  <div className="flex items-center gap-2 px-4 py-1.5 rounded-full"
                    style={{ background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <Lock className="w-3 h-3" style={{ color: 'rgba(250,204,21,0.7)' }} />
                    <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.6)' }}>
                      {item.label}
                    </span>
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
            {lang === 'EN'
              ? `ROI in less than 1 week`
              : `Pulangan dalam masa kurang dari 1 minggu`}
          </p>
        </div>
      </div>

      {/* Fixed Bottom Pay Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 z-20"
        style={{ background: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(10px)', borderTop: '1px solid rgba(250,204,21,0.15)' }}>
        <div className="max-w-lg mx-auto space-y-3">
          <button
            onClick={handlePay}
            disabled={paying}
            className="w-full py-4 rounded-xl font-bold text-base transition-all duration-300 relative overflow-hidden"
            style={{
              background: paying ? 'rgba(250,204,21,0.3)' : 'linear-gradient(135deg, #FACC15 0%, #EAB308 100%)',
              color: '#000000',
              boxShadow: paying ? 'none' : '0 0 30px rgba(250,204,21,0.5), 0 4px 20px rgba(250,204,21,0.3)'
            }}
          >
            {paying ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                {lang === 'EN' ? 'Redirecting to payment...' : 'Mengalihkan ke pembayaran...'}
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
            {lang === 'EN'
              ? '🔒 Secure payment via ToyyibPay · DuitNow QR accepted'
              : '🔒 Pembayaran selamat melalui ToyyibPay · DuitNow QR diterima'}
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