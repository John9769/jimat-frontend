'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { forgotPassword } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { t } from '@/lib/i18n';
import { ArrowLeft } from 'lucide-react';

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
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ background: 'linear-gradient(to bottom, #000000, #0a0a0a, #000000)' }}
    />
  );
}

export default function ForgotPasswordPage() {
  const { lang } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setTimeout(() => setMounted(true), 100); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await forgotPassword({ email });
      setSent(true);
    } catch (err) {
      toast.error('Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ background: '#000000' }}>
      <ElectricBackground />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(250,204,21,0.15)', border: '1px solid rgba(250,204,21,0.3)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M13 2L4.5 13.5H11L10 22L19.5 10.5H13L13 2Z" fill="#FACC15" />
            </svg>
          </div>
          <span className="font-bold text-white text-lg tracking-wide">JIMAT</span>
        </div>
      </div>

      <div className="relative z-10 flex-1 flex flex-col justify-center px-6 pb-10">
        <div
          className="max-w-sm mx-auto w-full transition-all duration-700"
          style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(20px)' }}
        >
          <Link
            href="/login"
            className="flex items-center gap-2 text-sm mb-8 transition-colors"
            style={{ color: 'rgba(250,204,21,0.6)' }}
          >
            <ArrowLeft className="w-4 h-4" />
            {t('common.back', lang)}
          </Link>

          {sent ? (
            <div className="text-center">
              {/* Success icon */}
              <div className="relative flex items-center justify-center mx-auto mb-6" style={{ width: 80, height: 80 }}>
                <div className="absolute inset-0 rounded-full animate-pulse"
                  style={{ background: 'radial-gradient(circle, rgba(250,204,21,0.15) 0%, transparent 70%)' }} />
                <div className="w-18 h-18 rounded-full flex items-center justify-center"
                  style={{
                    width: 72, height: 72,
                    background: 'rgba(250,204,21,0.08)',
                    border: '2px solid rgba(250,204,21,0.3)',
                    boxShadow: '0 0 20px rgba(250,204,21,0.2)'
                  }}>
                  <span className="text-3xl">📧</span>
                </div>
              </div>

              <h1 className="text-2xl font-bold text-white mb-2">
                {lang === 'EN' ? 'Check Your Email' : 'Semak Emel Anda'}
              </h1>
              <p className="text-sm mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>
                {lang === 'EN' ? 'Reset link sent to' : 'Pautan tetapan semula dihantar ke'}
              </p>
              <p className="font-semibold mb-8" style={{ color: '#FACC15' }}>{email}</p>

              <Link href="/login">
                <button
                  className="w-full py-3.5 rounded-xl font-bold text-sm transition-all duration-300"
                  style={{
                    background: 'linear-gradient(135deg, #FACC15 0%, #EAB308 100%)',
                    color: '#000000',
                    boxShadow: '0 0 20px rgba(250,204,21,0.4)'
                  }}
                >
                  {lang === 'EN' ? 'Back to Login' : 'Kembali ke Log Masuk'}
                </button>
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-white mb-1">
                {t('auth.forgot', lang)}
              </h1>
              <p className="text-sm mb-6" style={{ color: 'rgba(250,204,21,0.6)' }}>
                ⚡ {lang === 'EN' ? 'Enter your email and we will send you a reset link' : 'Masukkan emel anda dan kami akan hantar pautan tetapan semula'}
              </p>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.6)' }}>
                    {t('auth.email', lang)}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    required
                    className="px-4 py-3 rounded-xl text-white text-sm placeholder-gray-600 outline-none transition-all duration-300"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(250,204,21,0.15)' }}
                    onFocus={e => e.target.style.border = '1px solid rgba(250,204,21,0.6)'}
                    onBlur={e => e.target.style.border = '1px solid rgba(250,204,21,0.15)'}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl font-bold text-sm transition-all duration-300 mt-2"
                  style={{
                    background: loading ? 'rgba(250,204,21,0.3)' : 'linear-gradient(135deg, #FACC15 0%, #EAB308 100%)',
                    color: '#000000',
                    boxShadow: loading ? 'none' : '0 0 20px rgba(250,204,21,0.4)'
                  }}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                      {lang === 'EN' ? 'Sending...' : 'Menghantar...'}
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M13 2L4.5 13.5H11L10 22L19.5 10.5H13L13 2Z" fill="#000000" />
                      </svg>
                      {lang === 'EN' ? 'Send Reset Link' : 'Hantar Pautan Tetapan Semula'}
                    </span>
                  )}
                </button>
              </form>

              <p className="text-center text-sm mt-6" style={{ color: 'rgba(255,255,255,0.4)' }}>
                {lang === 'EN' ? 'Remember your password?' : 'Ingat kata laluan anda?'}{' '}
                <Link href="/login" className="font-semibold" style={{ color: '#FACC15' }}>
                  {t('auth.login', lang)}
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}