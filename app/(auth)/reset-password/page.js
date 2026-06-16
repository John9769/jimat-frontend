'use client';
import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { resetPassword } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

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

function ResetForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const { lang } = useAuth();
  const [form, setForm] = useState({ newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setTimeout(() => setMounted(true), 100); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (form.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    setLoading(true);
    try {
      await resetPassword({ token, newPassword: form.newPassword });
      toast.success('Password reset successful');
      router.replace('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid or expired token');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="max-w-sm mx-auto w-full transition-all duration-700"
      style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(20px)' }}
    >
      <h1 className="text-2xl font-bold text-white mb-1">
        {lang === 'EN' ? 'Reset Password' : 'Tetapkan Semula Kata Laluan'}
      </h1>
      <p className="text-sm mb-6" style={{ color: 'rgba(250,204,21,0.6)' }}>
        ⚡ {lang === 'EN' ? 'Enter your new password below' : 'Masukkan kata laluan baharu anda di bawah'}
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {[
          { label: lang === 'EN' ? 'New Password' : 'Kata Laluan Baharu', key: 'newPassword', placeholder: lang === 'EN' ? 'Min 8 characters' : 'Min 8 aksara' },
          { label: lang === 'EN' ? 'Confirm New Password' : 'Sahkan Kata Laluan Baharu', key: 'confirmPassword', placeholder: lang === 'EN' ? 'Repeat password' : 'Ulang kata laluan' }
        ].map(field => (
          <div key={field.key} className="flex flex-col gap-1">
            <label className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.6)' }}>
              {field.label}
            </label>
            <input
              type="password"
              value={form[field.key]}
              onChange={e => setForm({ ...form, [field.key]: e.target.value })}
              placeholder={field.placeholder}
              required
              className="px-4 py-3 rounded-xl text-white text-sm placeholder-gray-600 outline-none transition-all duration-300"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(250,204,21,0.15)' }}
              onFocus={e => e.target.style.border = '1px solid rgba(250,204,21,0.6)'}
              onBlur={e => e.target.style.border = '1px solid rgba(250,204,21,0.15)'}
            />
          </div>
        ))}

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
              {lang === 'EN' ? 'Resetting...' : 'Menetapkan semula...'}
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M13 2L4.5 13.5H11L10 22L19.5 10.5H13L13 2Z" fill="#000000" />
              </svg>
              {lang === 'EN' ? 'Reset Password' : 'Tetapkan Semula Kata Laluan'}
            </span>
          )}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
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

      <div className="relative z-10 flex-1 flex flex-col justify-center px-6 pb-10">
        <Suspense fallback={
          <div className="text-center" style={{ color: 'rgba(250,204,21,0.6)' }}>
            <span className="animate-pulse">⚡ Loading...</span>
          </div>
        }>
          <ResetForm />
        </Suspense>
      </div>
    </div>
  );
}