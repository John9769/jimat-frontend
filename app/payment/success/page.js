'use client';
import { useEffect, useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getBillingHistory } from '@/lib/api';
import { CheckCircle, XCircle } from 'lucide-react';

function ElectricBackground() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2 + 0.5,
      speedY: -(Math.random() * 0.8 + 0.2),
      speedX: (Math.random() - 0.5) * 0.3,
      opacity: Math.random() * 0.6 + 0.1,
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
          p.opacity = Math.random() * 0.6 + 0.1;
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

function PaymentSuccessContent() {
  const { user, loading, lang } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const billcode = searchParams.get('billcode');
  const [status, setStatus] = useState('checking');
  const [recordId, setRecordId] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [user, loading]);

  useEffect(() => {
    if (!billcode) { setStatus('error'); return; }

    let attempts = 0;
    const poll = setInterval(async () => {
      attempts++;
      try {
        const history = await getBillingHistory();
        const records = history.data.records;
        const unlocked = records.find(r => r.isUnlocked);
        if (unlocked) {
          setRecordId(unlocked.id);
          setStatus('success');
          setTimeout(() => setMounted(true), 100);
          clearInterval(poll);
        } else if (attempts >= 10) {
          setStatus('pending');
          setTimeout(() => setMounted(true), 100);
          clearInterval(poll);
        }
      } catch {
        if (attempts >= 10) {
          setStatus('error');
          setTimeout(() => setMounted(true), 100);
          clearInterval(poll);
        }
      }
    }, 2000);

    return () => clearInterval(poll);
  }, [billcode]);

  // Checking / Loading state
  if (loading || status === 'checking') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden"
        style={{ background: '#000000' }}>
        <ElectricBackground />
        <div className="relative z-10 text-center">
          {/* Animated lightning */}
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full animate-ping"
              style={{ background: 'rgba(250,204,21,0.15)', animationDuration: '1.5s' }} />
            <div className="absolute inset-0 rounded-full animate-pulse"
              style={{ background: 'rgba(250,204,21,0.08)', animationDuration: '2s' }} />
            <div className="w-20 h-20 rounded-full flex items-center justify-center relative"
              style={{ background: 'rgba(250,204,21,0.08)', border: '2px solid rgba(250,204,21,0.3)', boxShadow: '0 0 30px rgba(250,204,21,0.2)' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M13 2L4.5 13.5H11L10 22L19.5 10.5H13L13 2Z" fill="#FACC15"
                  style={{ filter: 'drop-shadow(0 0 8px rgba(250,204,21,0.8))' }} />
              </svg>
            </div>
          </div>
          <p className="text-white font-bold text-lg mb-2">
            {lang === 'EN' ? 'Verifying Payment...' : 'Mengesahkan Pembayaran...'}
          </p>
          <p className="text-sm" style={{ color: 'rgba(250,204,21,0.6)' }}>
            {lang === 'EN' ? 'Please wait a moment' : 'Sila tunggu sebentar'}
          </p>
          {/* Progress dots */}
          <div className="flex items-center justify-center gap-2 mt-4">
            {[0, 1, 2].map(i => (
              <div key={i} className="w-2 h-2 rounded-full animate-bounce"
                style={{ background: '#FACC15', opacity: 0.6, animationDelay: `${i * 0.2}s` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ background: '#000000' }}>
      <ElectricBackground />

      {/* Header */}
      <div className="relative z-10 flex items-center p-4 gap-2">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: 'rgba(250,204,21,0.15)', border: '1px solid rgba(250,204,21,0.3)' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M13 2L4.5 13.5H11L10 22L19.5 10.5H13L13 2Z" fill="#FACC15" />
          </svg>
        </div>
        <span className="font-bold text-white text-lg tracking-wide">JIMAT</span>
      </div>

      <div
        className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center transition-all duration-700"
        style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(20px)' }}
      >
        {status === 'success' ? (
          <>
            {/* Success Icon */}
            <div className="relative w-24 h-24 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full animate-ping"
                style={{ background: 'rgba(34,197,94,0.15)', animationDuration: '2s' }} />
              <div className="w-24 h-24 rounded-full flex items-center justify-center relative"
                style={{ background: 'rgba(34,197,94,0.1)', border: '2px solid rgba(34,197,94,0.4)', boxShadow: '0 0 30px rgba(34,197,94,0.2)' }}>
                <CheckCircle className="w-12 h-12" style={{ color: '#22c55e' }} />
              </div>
            </div>

            <h1 className="text-2xl font-bold text-white mb-2">
              {lang === 'EN' ? 'Payment Successful!' : 'Pembayaran Berjaya!'}
            </h1>
            <p className="text-sm mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>
              {lang === 'EN' ? 'Your full report is now unlocked.' : 'Laporan penuh anda kini dibuka.'}
            </p>
            <p className="text-sm mb-10" style={{ color: 'rgba(250,204,21,0.7)' }}>
              ⚡ {lang === 'EN' ? "Let's find your bleeders!" : 'Jom cari pembazir anda!'}
            </p>

            <button
              onClick={() => router.push(`/dashboard/report?id=${recordId}`)}
              className="w-full max-w-sm py-4 rounded-xl font-bold text-base transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg, #FACC15 0%, #EAB308 100%)',
                color: '#000000',
                boxShadow: '0 0 25px rgba(250,204,21,0.4)'
              }}
            >
              <span className="flex items-center justify-center gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M13 2L4.5 13.5H11L10 22L19.5 10.5H13L13 2Z" fill="#000000" />
                </svg>
                {lang === 'EN' ? 'View My Full Report' : 'Lihat Laporan Penuh Saya'}
              </span>
            </button>
          </>
        ) : status === 'pending' ? (
          <>
            {/* Pending Icon */}
            <div className="relative w-24 h-24 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full animate-pulse"
                style={{ background: 'rgba(250,204,21,0.15)' }} />
              <div className="w-24 h-24 rounded-full flex items-center justify-center relative"
                style={{ background: 'rgba(250,204,21,0.08)', border: '2px solid rgba(250,204,21,0.3)', boxShadow: '0 0 30px rgba(250,204,21,0.15)' }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                  <path d="M13 2L4.5 13.5H11L10 22L19.5 10.5H13L13 2Z" fill="#FACC15"
                    style={{ filter: 'drop-shadow(0 0 8px rgba(250,204,21,0.6))' }} />
                </svg>
              </div>
            </div>

            <h1 className="text-2xl font-bold text-white mb-2">
              {lang === 'EN' ? 'Payment Processing' : 'Pembayaran Diproses'}
            </h1>
            <p className="text-sm mb-10" style={{ color: 'rgba(255,255,255,0.5)' }}>
              {lang === 'EN'
                ? 'Your payment is being verified. Check your history in a moment.'
                : 'Pembayaran anda sedang disahkan. Semak sejarah anda sebentar lagi.'}
            </p>

            <button
              onClick={() => router.push('/dashboard/history')}
              className="w-full max-w-sm py-4 rounded-xl font-bold text-sm transition-all duration-300"
              style={{
                background: 'rgba(250,204,21,0.1)',
                border: '1px solid rgba(250,204,21,0.3)',
                color: '#FACC15'
              }}
            >
              {lang === 'EN' ? 'View History' : 'Lihat Sejarah'}
            </button>
          </>
        ) : (
          <>
            {/* Failed Icon */}
            <div className="relative w-24 h-24 mx-auto mb-6">
              <div className="w-24 h-24 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(239,68,68,0.1)', border: '2px solid rgba(239,68,68,0.3)', boxShadow: '0 0 30px rgba(239,68,68,0.15)' }}>
                <XCircle className="w-12 h-12" style={{ color: '#ef4444' }} />
              </div>
            </div>

            <h1 className="text-2xl font-bold text-white mb-2">
              {lang === 'EN' ? 'Payment Failed' : 'Pembayaran Gagal'}
            </h1>
            <p className="text-sm mb-10" style={{ color: 'rgba(255,255,255,0.5)' }}>
              {lang === 'EN' ? 'Something went wrong. Please try again.' : 'Sesuatu telah silap. Sila cuba lagi.'}
            </p>

            <button
              onClick={() => router.push('/dashboard')}
              className="w-full max-w-sm py-4 rounded-xl font-bold text-sm transition-all duration-300"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}
            >
              {lang === 'EN' ? 'Back to Dashboard' : 'Kembali ke Papan Pemuka'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#000000' }}>
        <div className="w-10 h-10 rounded-full animate-pulse"
          style={{ background: 'rgba(250,204,21,0.1)', border: '1px solid rgba(250,204,21,0.3)' }} />
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}