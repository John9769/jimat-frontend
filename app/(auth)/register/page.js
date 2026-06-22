'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { register } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { t, STATES, HOUSING_TYPES } from '@/lib/i18n';
import { ChevronDown, ArrowLeft, Check } from 'lucide-react';

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
    const handleResize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    window.addEventListener('resize', handleResize);
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', handleResize); };
  }, []);
  return (
    <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0"
      style={{ background: 'linear-gradient(to bottom, #000000, #0a0a0a, #000000)' }} />
  );
}

const ElectricInput = ({ label, type = 'text', value, onChange, placeholder, required }) => (
  <div className="flex flex-col gap-1">
    <label className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.6)' }}>{label}</label>
    <input
      type={type} value={value} onChange={onChange}
      placeholder={placeholder} required={required}
      className="px-4 py-3 rounded-xl text-white text-sm placeholder-gray-600 outline-none transition-all duration-300"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(250,204,21,0.15)' }}
      onFocus={e => e.target.style.border = '1px solid rgba(250,204,21,0.6)'}
      onBlur={e => e.target.style.border = '1px solid rgba(250,204,21,0.15)'}
    />
  </div>
);

const ElectricSelect = ({ label, value, onChange, children }) => (
  <div className="flex flex-col gap-1">
    <label className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.6)' }}>{label}</label>
    <div className="relative">
      <select value={value} onChange={onChange}
        className="w-full px-4 py-3 rounded-xl text-white text-sm outline-none appearance-none transition-all duration-300"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(250,204,21,0.15)' }}
        onFocus={e => e.target.style.border = '1px solid rgba(250,204,21,0.6)'}
        onBlur={e => e.target.style.border = '1px solid rgba(250,204,21,0.15)'}>
        {children}
      </select>
      <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 pointer-events-none"
        style={{ color: 'rgba(250,204,21,0.5)' }} />
    </div>
  </div>
);

// Option button — for institutional radio selections
const OptionButton = ({ selected, onClick, children }) => (
  <button type="button" onClick={onClick}
    className="w-full text-left px-4 py-3 rounded-xl text-sm transition-all duration-200"
    style={{
      background: selected ? 'rgba(250,204,21,0.1)' : 'rgba(255,255,255,0.03)',
      border: `1px solid ${selected ? 'rgba(250,204,21,0.5)' : 'rgba(255,255,255,0.08)'}`,
      color: selected ? '#FACC15' : 'rgba(255,255,255,0.5)'
    }}>
    <span className="flex items-center gap-2">
      <span className="w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center"
        style={{ border: `2px solid ${selected ? '#FACC15' : 'rgba(255,255,255,0.2)'}` }}>
        {selected && <span className="w-2 h-2 rounded-full" style={{ background: '#FACC15' }} />}
      </span>
      {children}
    </span>
  </button>
);

export default function RegisterPage() {
  const router = useRouter();
  const { loginUser, lang, toggleLang } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [form, setForm] = useState({
    // Step 1 — common
    email: '', password: '', confirmPassword: '', name: '', phone: '',
    userType: 'HOUSEHOLD', orgName: '', language: lang,
    // Step 2 — household
    postcode: '', township: '', state: '', housingType: '',
    // Step 2 — institutional
    institutionType: '',
    aircondSystemType: '',
    centralAircondSize: '',
    buildingAge: '',
    floorAreaCategory: '',
    lightType: ''
  });

  useEffect(() => { setTimeout(() => setMounted(true), 100); }, []);

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const handleNext = () => {
    if (!form.email || !form.password || !form.name) {
      toast.error(lang === 'EN' ? 'Please fill in all required fields' : 'Sila isi semua medan yang diperlukan');
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error(lang === 'EN' ? 'Passwords do not match' : 'Kata laluan tidak sepadan');
      return;
    }
    if (form.password.length < 8) {
      toast.error(lang === 'EN' ? 'Password must be at least 8 characters' : 'Kata laluan mestilah sekurang-kurangnya 8 aksara');
      return;
    }
    if (!agreed) {
      toast.error(lang === 'EN' ? 'Please agree to Terms & Privacy Policy' : 'Sila bersetuju dengan Terma & Dasar Privasi');
      return;
    }
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate institutional required fields
    if (form.userType === 'INSTITUTIONAL') {
      if (!form.institutionType) {
        toast.error(lang === 'EN' ? 'Please select institution type' : 'Sila pilih jenis institusi');
        return;
      }
      if (!form.aircondSystemType) {
        toast.error(lang === 'EN' ? 'Please select aircond system type' : 'Sila pilih jenis sistem penyejukan');
        return;
      }
      if (form.aircondSystemType === 'CENTRAL' && !form.centralAircondSize) {
        toast.error(lang === 'EN' ? 'Please select central aircond size' : 'Sila pilih saiz sistem berpusat');
        return;
      }
    }

    setLoading(true);
    try {
      const payload = {
        email: form.email,
        password: form.password,
        name: form.name,
        phone: form.phone,
        userType: form.userType,
        orgName: form.orgName,
        postcode: form.postcode,
        township: form.township,
        state: form.state,
        language: lang,
        // Household
        housingType: form.userType === 'HOUSEHOLD' ? form.housingType : null,
        // Institutional
        institutionType: form.userType === 'INSTITUTIONAL' ? form.institutionType : null,
        aircondSystemType: form.userType === 'INSTITUTIONAL' ? form.aircondSystemType : null,
        centralAircondSize: form.userType === 'INSTITUTIONAL' && form.aircondSystemType === 'CENTRAL' ? form.centralAircondSize : null,
        buildingAge: form.userType === 'INSTITUTIONAL' && form.buildingAge ? parseInt(form.buildingAge) : null,
        floorAreaCategory: form.userType === 'INSTITUTIONAL' && form.floorAreaCategory ? parseInt(form.floorAreaCategory) : null,
        lightType: form.userType === 'INSTITUTIONAL' && form.lightType ? parseInt(form.lightType) : null
      };

      const res = await register(payload);
      loginUser(res.data.token, res.data.user);
      toast.success(lang === 'EN' ? 'Account created!' : 'Akaun berjaya dibuat!');
      router.replace('/dashboard/onboarding');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const isInstitutional = form.userType === 'INSTITUTIONAL';

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ background: '#000000' }}>
      <ElectricBackground />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          {step === 2 && (
            <button onClick={() => setStep(1)} style={{ color: 'rgba(250,204,21,0.7)' }}>
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
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
        <button onClick={toggleLang}
          className="text-xs rounded-lg px-3 py-1 transition-all"
          style={{ border: '1px solid rgba(250,204,21,0.3)', background: 'rgba(250,204,21,0.05)', color: '#FACC15' }}>
          {lang === 'EN' ? 'BM' : 'EN'}
        </button>
      </div>

      {/* Progress */}
      <div className="relative z-10 px-6 mb-4">
        <div className="flex gap-2">
          <div className="h-1 flex-1 rounded-full"
            style={{ background: '#FACC15', boxShadow: '0 0 8px rgba(250,204,21,0.5)' }} />
          <div className="h-1 flex-1 rounded-full transition-all duration-500"
            style={{ background: step === 2 ? '#FACC15' : 'rgba(255,255,255,0.1)', boxShadow: step === 2 ? '0 0 8px rgba(250,204,21,0.5)' : 'none' }} />
        </div>
        <p className="text-xs mt-1" style={{ color: 'rgba(250,204,21,0.5)' }}>
          {lang === 'EN' ? `Step ${step} of 2` : `Langkah ${step} daripada 2`}
        </p>
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 px-6 pb-10 overflow-y-auto">
        <div className="max-w-sm mx-auto w-full transition-all duration-700"
          style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(20px)' }}>

          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white mb-1">
              {step === 1
                ? (lang === 'EN' ? 'Create Account' : 'Buka Akaun')
                : isInstitutional
                  ? (lang === 'EN' ? 'Institution Profile' : 'Profil Institusi')
                  : (lang === 'EN' ? 'Your Home Profile' : 'Profil Rumah Anda')}
            </h1>
            <p className="text-sm" style={{ color: 'rgba(250,204,21,0.6)' }}>
              {step === 1
                ? (lang === 'EN' ? '⚡ AI-Powered Bill Intelligence' : '⚡ Kecerdasan Bil Dikuasai AI')
                : isInstitutional
                  ? (lang === 'EN' ? '🕌 Help us calculate your electricity profile' : '🕌 Bantu kami kira profil elektrik anda')
                  : (lang === 'EN' ? 'Help us find your bleeders' : 'Bantu kami cari pembazir anda')}
            </p>
          </div>

          {/* ── STEP 1 ── */}
          {step === 1 && (
            <div className="flex flex-col gap-4">
              {/* Account Type */}
              <div className="flex gap-2 p-1 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(250,204,21,0.1)' }}>
                {['HOUSEHOLD', 'INSTITUTIONAL'].map(type => (
                  <button key={type} type="button"
                    onClick={() => set('userType', type)}
                    className="flex-1 py-2.5 rounded-lg text-xs font-semibold transition-all duration-300"
                    style={form.userType === type
                      ? { background: '#FACC15', color: '#000000', boxShadow: '0 0 15px rgba(250,204,21,0.3)' }
                      : { color: 'rgba(255,255,255,0.4)' }}>
                    {type === 'HOUSEHOLD'
                      ? (lang === 'EN' ? '🏠 Household' : '🏠 Isi Rumah')
                      : (lang === 'EN' ? '🕌 Institution' : '🕌 Institusi')}
                  </button>
                ))}
              </div>

              <ElectricInput
                label={isInstitutional
                  ? (lang === 'EN' ? 'Institution Name' : 'Nama Institusi')
                  : t('auth.name', lang)}
                value={form.name}
                onChange={e => set('name', e.target.value)}
                placeholder={isInstitutional ? 'Masjid Al-Falah' : 'Ahmad bin Ali'}
                required
              />

              {isInstitutional && (
                <ElectricInput
                  label={lang === 'EN' ? 'Person In Charge' : 'Nama Penanggungjawab'}
                  value={form.orgName}
                  onChange={e => set('orgName', e.target.value)}
                  placeholder="Nama AJK / Pengetua"
                />
              )}

              <ElectricInput label={t('auth.email', lang)} type="email"
                value={form.email} onChange={e => set('email', e.target.value)}
                placeholder="email@example.com" required />

              <ElectricInput label={t('auth.phone', lang)} type="tel"
                value={form.phone} onChange={e => set('phone', e.target.value)}
                placeholder="0123456789" />

              <ElectricInput label={t('auth.password', lang)} type="password"
                value={form.password} onChange={e => set('password', e.target.value)}
                placeholder={lang === 'EN' ? 'Min 8 characters' : 'Min 8 aksara'} required />

              <ElectricInput
                label={lang === 'EN' ? 'Confirm Password' : 'Sahkan Kata Laluan'}
                type="password" value={form.confirmPassword}
                onChange={e => set('confirmPassword', e.target.value)}
                placeholder={lang === 'EN' ? 'Repeat password' : 'Ulang kata laluan'} required />

              {/* T&C */}
              <button type="button" onClick={() => setAgreed(!agreed)}
                className="flex items-start gap-3 text-left w-full mt-1">
                <div className="w-5 h-5 rounded-md flex-shrink-0 mt-0.5 flex items-center justify-center transition-all duration-300"
                  style={{
                    background: agreed ? '#FACC15' : 'rgba(255,255,255,0.04)',
                    border: agreed ? '1px solid #FACC15' : '1px solid rgba(250,204,21,0.3)',
                    boxShadow: agreed ? '0 0 10px rgba(250,204,21,0.4)' : 'none'
                  }}>
                  {agreed && <Check className="w-3 h-3" style={{ color: '#000000' }} />}
                </div>
                <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  {lang === 'EN' ? 'I agree to the ' : 'Saya bersetuju dengan '}
                  <Link href="/terms" onClick={e => e.stopPropagation()}
                    className="font-semibold underline" style={{ color: '#FACC15' }}>
                    {lang === 'EN' ? 'Terms of Service' : 'Terma Perkhidmatan'}
                  </Link>
                  {lang === 'EN' ? ' and ' : ' dan '}
                  <Link href="/privacy" onClick={e => e.stopPropagation()}
                    className="font-semibold underline" style={{ color: '#FACC15' }}>
                    {lang === 'EN' ? 'Privacy Policy' : 'Dasar Privasi'}
                  </Link>
                </p>
              </button>

              <button type="button" onClick={handleNext}
                className="w-full py-3.5 rounded-xl font-bold text-sm transition-all duration-300 mt-2"
                style={{
                  background: agreed ? 'linear-gradient(135deg, #FACC15 0%, #EAB308 100%)' : 'rgba(250,204,21,0.2)',
                  color: agreed ? '#000000' : 'rgba(0,0,0,0.4)',
                  boxShadow: agreed ? '0 0 20px rgba(250,204,21,0.4)' : 'none',
                  cursor: agreed ? 'pointer' : 'not-allowed'
                }}>
                <span className="flex items-center justify-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M13 2L4.5 13.5H11L10 22L19.5 10.5H13L13 2Z"
                      fill={agreed ? '#000000' : 'rgba(0,0,0,0.3)'} />
                  </svg>
                  {lang === 'EN' ? 'Continue' : 'Teruskan'}
                </span>
              </button>
            </div>
          )}

          {/* ── STEP 2 HOUSEHOLD ── */}
          {step === 2 && !isInstitutional && (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <ElectricInput label={t('auth.postcode', lang)}
                value={form.postcode} onChange={e => set('postcode', e.target.value)}
                placeholder="70000" />
              <ElectricInput label={t('auth.township', lang)}
                value={form.township} onChange={e => set('township', e.target.value)}
                placeholder="Seremban" />
              <ElectricSelect label={t('auth.state', lang)}
                value={form.state} onChange={e => set('state', e.target.value)}>
                <option value="" style={{ background: '#111' }}>
                  {lang === 'EN' ? 'Select state' : 'Pilih negeri'}
                </option>
                {STATES.map(s => (
                  <option key={s} value={s} style={{ background: '#111' }}>{s}</option>
                ))}
              </ElectricSelect>
              <ElectricSelect label={t('auth.housingType', lang)}
                value={form.housingType} onChange={e => set('housingType', e.target.value)}>
                <option value="" style={{ background: '#111' }}>
                  {lang === 'EN' ? 'Select type' : 'Pilih jenis'}
                </option>
                {HOUSING_TYPES.map(h => (
                  <option key={h} value={h} style={{ background: '#111' }}>{h}</option>
                ))}
              </ElectricSelect>
              <button type="submit" disabled={loading}
                className="w-full py-3.5 rounded-xl font-bold text-sm transition-all duration-300 mt-2"
                style={{
                  background: loading ? 'rgba(250,204,21,0.3)' : 'linear-gradient(135deg, #FACC15 0%, #EAB308 100%)',
                  color: '#000000',
                  boxShadow: loading ? 'none' : '0 0 20px rgba(250,204,21,0.4)'
                }}>
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    {lang === 'EN' ? 'Creating account...' : 'Mencipta akaun...'}
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M13 2L4.5 13.5H11L10 22L19.5 10.5H13L13 2Z" fill="#000000" />
                    </svg>
                    {t('auth.register', lang)}
                  </span>
                )}
              </button>
            </form>
          )}

          {/* ── STEP 2 INSTITUTIONAL ── */}
          {step === 2 && isInstitutional && (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">

              {/* Q1 — Institution Type */}
              <div>
                <p className="text-sm font-medium mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  {lang === 'EN' ? 'Q1: Institution type?' : 'S1: Jenis institusi?'}
                </p>
                <div className="flex flex-col gap-2">
                  {[
                    { value: 'MASJID', label: lang === 'EN' ? '🕌 Masjid' : '🕌 Masjid' },
                    { value: 'SURAU', label: lang === 'EN' ? '🕌 Surau' : '🕌 Surau' },
                    { value: 'SEKOLAH', label: lang === 'EN' ? '🏫 Sekolah' : '🏫 Sekolah' },
                    { value: 'OTHERS', label: lang === 'EN' ? '🏢 Others' : '🏢 Lain-lain' }
                  ].map(opt => (
                    <OptionButton key={opt.value}
                      selected={form.institutionType === opt.value}
                      onClick={() => set('institutionType', opt.value)}>
                      {opt.label}
                    </OptionButton>
                  ))}
                </div>
              </div>

              {/* Q2 — Aircond System */}
              <div>
                <p className="text-sm font-medium mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  {lang === 'EN' ? 'Q2: Aircond system type?' : 'S2: Jenis sistem penyejukan?'}
                </p>
                <div className="flex flex-col gap-2">
                  {[
                    { value: 'SPLIT', label: lang === 'EN' ? '❄️ Split units (biasa)' : '❄️ Unit split (biasa)' },
                    { value: 'CENTRAL', label: lang === 'EN' ? '🏭 Central chiller system' : '🏭 Sistem berpusat (central)' }
                  ].map(opt => (
                    <OptionButton key={opt.value}
                      selected={form.aircondSystemType === opt.value}
                      onClick={() => set('aircondSystemType', opt.value)}>
                      {opt.label}
                    </OptionButton>
                  ))}
                </div>
              </div>

              {/* Q2b — Central Size (only if central) */}
              {form.aircondSystemType === 'CENTRAL' && (
                <div>
                  <p className="text-sm font-medium mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>
                    {lang === 'EN' ? 'Q2b: Central system size?' : 'S2b: Saiz sistem berpusat?'}
                  </p>
                  <div className="flex flex-col gap-2">
                    {[
                      { value: 'SMALL', label: lang === 'EN' ? 'Kecil (10-20 RT) — surau kecil' : 'Kecil (10-20 RT) — surau kecil' },
                      { value: 'MEDIUM', label: lang === 'EN' ? 'Sederhana (20-50 RT) — masjid biasa' : 'Sederhana (20-50 RT) — masjid biasa' },
                      { value: 'LARGE', label: lang === 'EN' ? 'Besar (50-100 RT) — masjid negeri' : 'Besar (50-100 RT) — masjid negeri' },
                      { value: 'VERY_LARGE', label: lang === 'EN' ? 'Sangat besar (>100 RT) — kompleks' : 'Sangat besar (>100 RT) — kompleks' }
                    ].map(opt => (
                      <OptionButton key={opt.value}
                        selected={form.centralAircondSize === opt.value}
                        onClick={() => set('centralAircondSize', opt.value)}>
                        {opt.label}
                      </OptionButton>
                    ))}
                  </div>
                </div>
              )}

              {/* Q3 — Building Age */}
              <div>
                <p className="text-sm font-medium mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  {lang === 'EN' ? 'Q3: Building / aircond age?' : 'S3: Umur bangunan / sistem aircond?'}
                </p>
                <div className="flex flex-col gap-2">
                  {[
                    { value: '1', label: lang === 'EN' ? '🆕 New (less than 5 years)' : '🆕 Baru (kurang 5 tahun)' },
                    { value: '2', label: lang === 'EN' ? '📅 Medium (5-15 years)' : '📅 Sederhana (5-15 tahun)' },
                    { value: '3', label: lang === 'EN' ? '🏚️ Old (more than 15 years)' : '🏚️ Lama (lebih 15 tahun)' }
                  ].map(opt => (
                    <OptionButton key={opt.value}
                      selected={form.buildingAge === opt.value}
                      onClick={() => set('buildingAge', opt.value)}>
                      {opt.label}
                    </OptionButton>
                  ))}
                </div>
              </div>

              {/* Q4 — Floor Area */}
              <div>
                <p className="text-sm font-medium mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  {lang === 'EN' ? 'Q4: Main hall floor area?' : 'S4: Keluasan dewan utama?'}
                </p>
                <div className="flex flex-col gap-2">
                  {[
                    { value: '1', label: lang === 'EN' ? 'Small (< 200 sq ft)' : 'Kecil (< 200 kaki persegi)' },
                    { value: '2', label: lang === 'EN' ? 'Medium (200-500 sq ft)' : 'Sederhana (200-500 kaki persegi)' },
                    { value: '3', label: lang === 'EN' ? 'Large (500-1000 sq ft)' : 'Besar (500-1000 kaki persegi)' },
                    { value: '4', label: lang === 'EN' ? 'Very large (> 1000 sq ft)' : 'Sangat besar (> 1000 kaki persegi)' }
                  ].map(opt => (
                    <OptionButton key={opt.value}
                      selected={form.floorAreaCategory === opt.value}
                      onClick={() => set('floorAreaCategory', opt.value)}>
                      {opt.label}
                    </OptionButton>
                  ))}
                </div>
              </div>

              {/* Q5 — Light Type */}
              <div>
                <p className="text-sm font-medium mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  {lang === 'EN' ? 'Q5: Main hall light type?' : 'S5: Jenis lampu dewan utama?'}
                </p>
                <div className="flex flex-col gap-2">
                  {[
                    { value: '1', label: lang === 'EN' ? '💡 LED (modern/new)' : '💡 LED (moden/baru)' },
                    { value: '2', label: lang === 'EN' ? '🔦 Fluorescent / kalimantang (old)' : '🔦 Kalimantang/fluorescent (lama)' },
                    { value: '3', label: lang === 'EN' ? '🔆 Mixed' : '🔆 Campuran' }
                  ].map(opt => (
                    <OptionButton key={opt.value}
                      selected={form.lightType === opt.value}
                      onClick={() => set('lightType', opt.value)}>
                      {opt.label}
                    </OptionButton>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div className="pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <p className="text-xs mb-3" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  {lang === 'EN' ? 'Optional: Location info' : 'Pilihan: Maklumat lokasi'}
                </p>
                <div className="flex flex-col gap-3">
                  <ElectricInput label={lang === 'EN' ? 'Postcode' : 'Poskod'}
                    value={form.postcode} onChange={e => set('postcode', e.target.value)}
                    placeholder="70000" />
                  <ElectricSelect label={lang === 'EN' ? 'State' : 'Negeri'}
                    value={form.state} onChange={e => set('state', e.target.value)}>
                    <option value="" style={{ background: '#111' }}>
                      {lang === 'EN' ? 'Select state' : 'Pilih negeri'}
                    </option>
                    {STATES.map(s => (
                      <option key={s} value={s} style={{ background: '#111' }}>{s}</option>
                    ))}
                  </ElectricSelect>
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-3.5 rounded-xl font-bold text-sm transition-all duration-300"
                style={{
                  background: loading ? 'rgba(250,204,21,0.3)' : 'linear-gradient(135deg, #FACC15 0%, #EAB308 100%)',
                  color: '#000000',
                  boxShadow: loading ? 'none' : '0 0 20px rgba(250,204,21,0.4)'
                }}>
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    {lang === 'EN' ? 'Creating account...' : 'Mencipta akaun...'}
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M13 2L4.5 13.5H11L10 22L19.5 10.5H13L13 2Z" fill="#000000" />
                    </svg>
                    {lang === 'EN' ? 'Create Account' : 'Buat Akaun'}
                  </span>
                )}
              </button>
            </form>
          )}

          <p className="text-center text-sm mt-6" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {t('auth.hasAccount', lang)}{' '}
            <Link href="/login" className="font-semibold" style={{ color: '#FACC15' }}>
              {t('auth.login', lang)}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}