'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { login } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { t } from '@/lib/i18n';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

// Electric particle canvas
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

// Typewriter hook
function useTypewriter(text, speed = 50, delay = 800) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    let i = 0;
    const timeout = setTimeout(() => {
      const interval = setInterval(() => {
        if (i < text.length) {
          setDisplayed(text.slice(0, i + 1));
          i++;
        } else {
          setDone(true);
          clearInterval(interval);
        }
      }, speed);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(timeout);
  }, [text]);

  return { displayed, done };
}

// Pulsing lightning bolt SVG
function LightningLogo() {
  return (
    <div className="relative flex items-center justify-center mx-auto mb-6" style={{ width: 90, height: 90 }}>
      {/* Outer glow rings */}
      <div className="absolute inset-0 rounded-full animate-ping"
        style={{ background: 'radial-gradient(circle, rgba(250,204,21,0.15) 0%, transparent 70%)', animationDuration: '2s' }} />
      <div className="absolute inset-0 rounded-full animate-pulse"
        style={{ background: 'radial-gradient(circle, rgba(250,204,21,0.08) 0%, transparent 70%)', animationDuration: '1.5s' }} />

      {/* Main circle */}
      <div className="relative w-20 h-20 rounded-full flex items-center justify-center"
        style={{
          background: 'linear-gradient(135deg, #1a1a00 0%, #0d0d00 100%)',
          border: '2px solid rgba(250,204,21,0.4)',
          boxShadow: '0 0 30px rgba(250,204,21,0.3), 0 0 60px rgba(250,204,21,0.1), inset 0 0 20px rgba(250,204,21,0.05)'
        }}>
        {/* Lightning bolt SVG */}
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
          <path
            d="M13 2L4.5 13.5H11L10 22L19.5 10.5H13L13 2Z"
            fill="#FACC15"
            style={{ filter: 'drop-shadow(0 0 8px rgba(250,204,21,0.8))' }}
          />
        </svg>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { loginUser, lang, toggleLang } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  const tagline = lang === 'EN' ? 'Stop Your Bill From Bleeding' : 'Hentikan Pembaziran Bil Anda';
  const { displayed, done } = useTypewriter(tagline, 45, 600);

  useEffect(() => {
    setTimeout(() => setMounted(true), 100);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await login(form);
      loginUser(res.data.token, res.data.user);
      toast.success('Welcome back!');
      router.replace('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
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
        <button
          onClick={toggleLang}
          className="text-xs text-yellow-400 rounded-lg px-3 py-1 transition-all"
          style={{ border: '1px solid rgba(250,204,21,0.3)', background: 'rgba(250,204,21,0.05)' }}
        >
          {lang === 'EN' ? 'BM' : 'EN'}
        </button>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex flex-col justify-center px-6 pb-10">
        <div
          className="max-w-sm mx-auto w-full transition-all duration-700"
          style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(20px)' }}
        >
          {/* Logo */}
          <LightningLogo />

          {/* AI Badge */}
          <div className="flex justify-center mb-4">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
              style={{
                background: 'rgba(250,204,21,0.08)',
                border: '1px solid rgba(250,204,21,0.2)',
                color: '#FACC15'
              }}>
              <span>⚡</span>
              <span>AI-Powered Bill Intelligence</span>
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-3 tracking-tight">
              {t('auth.login', lang)}
            </h1>
            <p className="text-sm font-medium min-h-5"
              style={{ color: '#FACC15', textShadow: '0 0 20px rgba(250,204,21,0.5)' }}>
              {displayed}
              {!done && <span className="animate-pulse">|</span>}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Email */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.6)' }}>
                {t('auth.email', lang)}
              </label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="email@example.com"
                required
                className="px-4 py-3 rounded-xl text-white text-sm placeholder-gray-600 outline-none transition-all duration-300"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(250,204,21,0.15)',
                }}
                onFocus={e => e.target.style.border = '1px solid rgba(250,204,21,0.6)'}
                onBlur={e => e.target.style.border = '1px solid rgba(250,204,21,0.15)'}
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.6)' }}>
                {t('auth.password', lang)}
              </label>
              <input
                type="password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                required
                className="px-4 py-3 rounded-xl text-white text-sm placeholder-gray-600 outline-none transition-all duration-300"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(250,204,21,0.15)',
                }}
                onFocus={e => e.target.style.border = '1px solid rgba(250,204,21,0.6)'}
                onBlur={e => e.target.style.border = '1px solid rgba(250,204,21,0.15)'}
              />
            </div>

            <div className="flex justify-end">
              <Link href="/forgot-password"
                className="text-xs transition-colors"
                style={{ color: 'rgba(250,204,21,0.7)' }}>
                {t('auth.forgot', lang)}
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-sm transition-all duration-300 relative overflow-hidden"
              style={{
                background: loading ? 'rgba(250,204,21,0.3)' : 'linear-gradient(135deg, #FACC15 0%, #EAB308 100%)',
                color: '#000000',
                boxShadow: loading ? 'none' : '0 0 20px rgba(250,204,21,0.4), 0 4px 15px rgba(250,204,21,0.2)'
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  {lang === 'EN' ? 'Logging in...' : 'Log masuk...'}
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M13 2L4.5 13.5H11L10 22L19.5 10.5H13L13 2Z" fill="#000000" />
                  </svg>
                  {t('auth.login', lang)}
                </span>
              )}
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {t('auth.noAccount', lang)}{' '}
            <Link href="/register"
              className="font-semibold transition-colors"
              style={{ color: '#FACC15' }}>
              {t('auth.register', lang)}
            </Link>
          </p>

          {/* Bottom trust signal */}
          <div className="flex items-center justify-center gap-4 mt-8">
            {['SSM Verified', 'PDPA Compliant', 'ToyyibPay'].map((item, i) => (
              <span key={i} className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
                {i > 0 && <span className="mr-4">·</span>}
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}