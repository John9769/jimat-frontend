'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

function ElectricHero() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const particles = Array.from({ length: 80 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2.5 + 0.5,
      speedY: -(Math.random() * 0.6 + 0.2),
      speedX: (Math.random() - 0.5) * 0.3,
      opacity: Math.random() * 0.7 + 0.1,
      color: Math.random() > 0.5 ? '#FACC15' : '#86EFAC',
      pulse: Math.random() * Math.PI * 2
    }));
    let animId;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.pulse += 0.02;
        const pulseOpacity = p.opacity * (0.7 + 0.3 * Math.sin(p.pulse));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = pulseOpacity;
        ctx.fill();
        p.y += p.speedY;
        p.x += p.speedX;
        if (p.y < 0 || p.opacity <= 0) {
          p.x = Math.random() * canvas.width;
          p.y = canvas.height;
          p.opacity = Math.random() * 0.7 + 0.1;
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

// Animated lightning bolt
function LightningIcon() {
  return (
    <div className="relative flex items-center justify-center mx-auto" style={{ width: 120, height: 120 }}>
      {/* Outer ring pulse */}
      <div className="absolute inset-0 rounded-full animate-ping"
        style={{ background: 'rgba(250,204,21,0.08)', animationDuration: '2.5s' }} />
      <div className="absolute inset-0 rounded-full animate-pulse"
        style={{ background: 'rgba(250,204,21,0.05)', animationDuration: '2s' }} />
      {/* Middle ring */}
      <div className="absolute rounded-full"
        style={{
          inset: '10px',
          border: '1px solid rgba(250,204,21,0.15)',
          boxShadow: '0 0 20px rgba(250,204,21,0.1)'
        }} />
      {/* Main circle */}
      <div className="relative w-20 h-20 rounded-full flex items-center justify-center"
        style={{
          background: 'linear-gradient(135deg, rgba(250,204,21,0.12) 0%, rgba(0,0,0,0) 100%)',
          border: '2px solid rgba(250,204,21,0.4)',
          boxShadow: '0 0 40px rgba(250,204,21,0.3), 0 0 80px rgba(250,204,21,0.1), inset 0 0 20px rgba(250,204,21,0.05)'
        }}>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
          <path d="M13 2L4.5 13.5H11L10 22L19.5 10.5H13L13 2Z" fill="#FACC15"
            style={{ filter: 'drop-shadow(0 0 12px rgba(250,204,21,1)) drop-shadow(0 0 24px rgba(250,204,21,0.6))' }} />
        </svg>
      </div>
    </div>
  );
}

// Typewriter
function useTypewriter(text, speed = 50, delay = 500) {
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

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace('/dashboard');
    setTimeout(() => setMounted(true), 100);
  }, [user, loading]);

  const { displayed, done } = useTypewriter('Analyse Your TNB Bill. Free.', 60, 800);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#000000' }}>
      <div className="w-10 h-10 rounded-full animate-pulse"
        style={{ background: 'rgba(250,204,21,0.1)', border: '1px solid rgba(250,204,21,0.3)' }} />
    </div>
  );

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: '#000000' }}>
      <ElectricHero />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4"
        style={{ borderBottom: '1px solid rgba(250,204,21,0.08)' }}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(250,204,21,0.15)', border: '1px solid rgba(250,204,21,0.3)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M13 2L4.5 13.5H11L10 22L19.5 10.5H13L13 2Z" fill="#FACC15" />
            </svg>
          </div>
          <span className="font-bold text-white text-lg tracking-wide">JIMAT</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login"
            className="text-sm font-medium transition-colors"
            style={{ color: 'rgba(255,255,255,0.5)' }}>
            Login
          </Link>
          <Link href="/register"
            className="px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300"
            style={{
              background: 'linear-gradient(135deg, #FACC15 0%, #EAB308 100%)',
              color: '#000000',
              boxShadow: '0 0 15px rgba(250,204,21,0.3)'
            }}>
            Daftar Percuma
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 pt-16 pb-10">

        {/* Lightning Icon */}
        <div
          className="transition-all duration-1000 mb-8"
          style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.8)' }}
        >
          <LightningIcon />
        </div>

        {/* AI Badge */}
        <div
          className="flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 transition-all duration-700"
          style={{
            background: 'rgba(250,204,21,0.08)',
            border: '1px solid rgba(250,204,21,0.25)',
            color: '#FACC15',
            opacity: mounted ? 1 : 0,
            transitionDelay: '200ms'
          }}>
          <span className="text-xs">⚡</span>
          <span className="text-xs font-semibold tracking-wide">AI-Powered Bill Intelligence</span>
        </div>

        {/* Main Headline */}
        <div
          className="transition-all duration-700 mb-4"
          style={{ opacity: mounted ? 1 : 0, transitionDelay: '300ms' }}
        >
          <h1 className="font-black text-white mb-3"
            style={{ fontSize: 'clamp(2rem, 8vw, 3.5rem)', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
            Hentikan Bil Elektrik
            <br />
            <span style={{
              color: '#FACC15',
              textShadow: '0 0 30px rgba(250,204,21,0.6), 0 0 60px rgba(250,204,21,0.3)'
            }}>
              Dari Terus Naik.
            </span>
          </h1>
        </div>

        {/* Typewriter Subheadline */}
        <div
          className="transition-all duration-700 mb-8"
          style={{ opacity: mounted ? 1 : 0, transitionDelay: '400ms' }}
        >
          <p className="text-lg font-medium min-h-7"
            style={{ color: 'rgba(250,204,21,0.7)', textShadow: '0 0 20px rgba(250,204,21,0.3)' }}>
            {displayed}
            {!done && <span className="animate-pulse ml-0.5">|</span>}
          </p>
          <p className="text-sm mt-2" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Muat naik bil TNB anda. AI kami kenal pasti pembazir & tunjuk cara jimat dari bulan depan.
          </p>
        </div>

        {/* CTA Buttons */}
        <div
          className="flex flex-col sm:flex-row gap-3 w-full max-w-sm transition-all duration-700"
          style={{ opacity: mounted ? 1 : 0, transitionDelay: '500ms' }}
        >
          <Link href="/register" className="flex-1">
            <button className="w-full py-4 rounded-xl font-bold text-base transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg, #FACC15 0%, #EAB308 100%)',
                color: '#000000',
                boxShadow: '0 0 30px rgba(250,204,21,0.5), 0 4px 20px rgba(250,204,21,0.3)'
              }}>
              <span className="flex items-center justify-center gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M13 2L4.5 13.5H11L10 22L19.5 10.5H13L13 2Z" fill="#000000" />
                </svg>
                Daftar Percuma Sekarang
              </span>
            </button>
          </Link>
          <Link href="/login" className="flex-1">
            <button className="w-full py-4 rounded-xl font-bold text-sm transition-all duration-300"
              style={{
                background: 'transparent',
                border: '1px solid rgba(250,204,21,0.3)',
                color: '#FACC15'
              }}>
              Log Masuk
            </button>
          </Link>
        </div>

        {/* Trust Signals */}
        <div
          className="flex items-center gap-3 mt-6 flex-wrap justify-center transition-all duration-700"
          style={{ opacity: mounted ? 1 : 0, transitionDelay: '600ms' }}
        >
          {['✅ Percuma Daftar', '🔒 PDPA Compliant', '⚡ Analisis AI', '🇲🇾 Made in Malaysia'].map((item, i) => (
            <span key={i} className="text-xs px-3 py-1 rounded-full"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)' }}>
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* How It Works */}
      <div className="relative z-10 px-6 py-16 max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-xs font-semibold tracking-widest mb-2" style={{ color: 'rgba(250,204,21,0.6)' }}>
            ⚡ BAGAIMANA JIMAT BERFUNGSI
          </p>
          <h2 className="text-2xl font-bold text-white">3 Langkah Mudah</h2>
        </div>

        <div className="space-y-4">
          {[
            {
              step: '01',
              title: 'Daftar & Isi Profil',
              desc: 'Buat akaun percuma. Isikan peralatan elektrik di rumah anda — penghawa dingin, peti sejuk, mesin basuh.',
              icon: '📋'
            },
            {
              step: '02',
              title: 'Muat Naik Bil TNB',
              desc: 'Snap gambar atau upload PDF bil TNB anda. AI kami baca dan analisis dalam masa 20 saat. Bil anda dibuang serta-merta selepas dibaca.',
              icon: '📄'
            },
            {
              step: '03',
              title: 'Dapatkan Laporan & Jimat',
              desc: 'Tahu exactly peralatan mana yang paling boros. Dapat 3 misi jimat untuk bulan depan. Bayar RM11.99 sahaja untuk laporan penuh.',
              icon: '💡'
            }
          ].map((item, i) => (
            <div key={i} className="flex gap-4 rounded-2xl p-5 transition-all duration-300"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(250,204,21,0.1)' }}>
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                  style={{ background: 'rgba(250,204,21,0.08)', border: '1px solid rgba(250,204,21,0.2)' }}>
                  {item.icon}
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold" style={{ color: 'rgba(250,204,21,0.5)' }}>{item.step}</span>
                  <h3 className="text-white font-bold text-sm">{item.title}</h3>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing */}
      <div className="relative z-10 px-6 py-10 max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <p className="text-xs font-semibold tracking-widest mb-2" style={{ color: 'rgba(250,204,21,0.6)' }}>
            ⚡ HARGA
          </p>
          <h2 className="text-2xl font-bold text-white">Bayar Bila Guna Sahaja</h2>
          <p className="text-sm mt-2" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Tiada langganan bulanan. Tiada kontrak. Bayar per analisis sahaja.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[
            {
              type: 'Isi Rumah',
              icon: '🏠',
              onboard: 'RM11.99',
              monthly: 'RM6.99',
              desc: 'Per analisis'
            },
            {
              type: 'Institusi',
              icon: '🕌',
              onboard: 'RM29.99',
              monthly: 'RM14.99',
              desc: 'Masjid / Surau / Sekolah'
            }
          ].map((plan, i) => (
            <div key={i} className="rounded-2xl p-5"
              style={{
                background: i === 0 ? 'rgba(250,204,21,0.06)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${i === 0 ? 'rgba(250,204,21,0.25)' : 'rgba(255,255,255,0.08)'}`
              }}>
              <div className="text-2xl mb-2">{plan.icon}</div>
              <p className="text-white font-bold text-sm mb-3">{plan.type}</p>
              <div className="space-y-2">
                <div>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>Pertama kali</p>
                  <p className="font-black text-xl" style={{ color: '#FACC15' }}>{plan.onboard}</p>
                </div>
                <div>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>Bulan seterusnya</p>
                  <p className="font-black text-xl text-white">{plan.monthly}</p>
                </div>
              </div>
              <p className="text-xs mt-3" style={{ color: 'rgba(255,255,255,0.2)' }}>{plan.desc}</p>
            </div>
          ))}
        </div>

        <p className="text-center text-xs mt-4" style={{ color: 'rgba(255,255,255,0.2)' }}>
          + RM1.00 yuran gateway ToyyibPay per transaksi
        </p>
      </div>

      {/* Why JIMAT */}
      <div className="relative z-10 px-6 py-10 max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <p className="text-xs font-semibold tracking-widest mb-2" style={{ color: 'rgba(250,204,21,0.6)' }}>
            ⚡ KENAPA JIMAT
          </p>
          <h2 className="text-2xl font-bold text-white">Bukan Sekadar Tunjuk Nombor</h2>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: '🎯', title: 'Kenal Pasti Pembazir', desc: 'Tahu exact peralatan mana yang makan letrik paling banyak' },
            { icon: '📋', title: '3 Misi Jimat', desc: 'Tindakan konkrit untuk kurangkan bil bulan depan' },
            { icon: '📊', title: 'Bulan vs Bulan', desc: 'Jejak kemajuan penjimatan anda setiap bulan' },
            { icon: '📡', title: 'AFA Watch', desc: 'Pantau kadar AFA yang ditetapkan Suruhanjaya Tenaga' },
            { icon: '🔒', title: 'Privasi Terjaga', desc: 'Bil anda dibuang serta-merta selepas dianalisis oleh AI' },
            { icon: '🤖', title: 'Dikuasai AI', desc: 'Claude AI membaca dan menganalisis bil dengan tepat' },
          ].map((item, i) => (
            <div key={i} className="rounded-2xl p-4"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <span className="text-2xl">{item.icon}</span>
              <p className="text-white font-semibold text-xs mt-2 mb-1">{item.title}</p>
              <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.3)' }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Final CTA */}
      <div className="relative z-10 px-6 py-16 text-center max-w-lg mx-auto">
        <div className="rounded-3xl p-8"
          style={{
            background: 'rgba(250,204,21,0.05)',
            border: '1px solid rgba(250,204,21,0.2)',
            boxShadow: '0 0 60px rgba(250,204,21,0.05)'
          }}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'rgba(250,204,21,0.15)', border: '1px solid rgba(250,204,21,0.3)', boxShadow: '0 0 20px rgba(250,204,21,0.2)' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M13 2L4.5 13.5H11L10 22L19.5 10.5H13L13 2Z" fill="#FACC15"
                style={{ filter: 'drop-shadow(0 0 8px rgba(250,204,21,0.8))' }} />
            </svg>
          </div>
          <h2 className="text-2xl font-black text-white mb-2">
            Dah Bersedia Nak Jimat?
          </h2>
          <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Daftar percuma. Upload bil. Tengok berapa anda boleh jimat dari bulan depan.
          </p>
          <Link href="/register">
            <button className="w-full py-4 rounded-xl font-black text-base transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg, #FACC15 0%, #EAB308 100%)',
                color: '#000000',
                boxShadow: '0 0 30px rgba(250,204,21,0.4)'
              }}>
              <span className="flex items-center justify-center gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M13 2L4.5 13.5H11L10 22L19.5 10.5H13L13 2Z" fill="#000000" />
                </svg>
                Daftar Percuma Sekarang
              </span>
            </button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 px-6 py-8 text-center"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(250,204,21,0.15)', border: '1px solid rgba(250,204,21,0.3)' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M13 2L4.5 13.5H11L10 22L19.5 10.5H13L13 2Z" fill="#FACC15" />
            </svg>
          </div>
          <span className="font-bold text-white tracking-wide">JIMAT</span>
        </div>
        <p className="text-xs mb-3" style={{ color: 'rgba(255,255,255,0.2)' }}>
          by AWAS Premium Resources · SSM 202603141446
        </p>
        <div className="flex items-center justify-center gap-4">
          {[
            { label: 'Terma Perkhidmatan', href: '/terms' },
            { label: 'Dasar Privasi', href: '/privacy' },
            { label: 'Log Masuk', href: '/login' },
          ].map((link, i) => (
            <Link key={i} href={link.href}
              className="text-xs transition-colors"
              style={{ color: 'rgba(250,204,21,0.4)' }}>
              {link.label}
            </Link>
          ))}
        </div>
        <p className="text-xs mt-4" style={{ color: 'rgba(255,255,255,0.1)' }}>
          © 2026 AWAS Premium Resources. Hak Cipta Terpelihara.
        </p>
      </div>
    </div>
  );
}