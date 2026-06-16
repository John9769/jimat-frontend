'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { register } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { t, STATES, HOUSING_TYPES } from '@/lib/i18n';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Zap, ChevronDown } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { loginUser, lang, toggleLang } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
    userType: 'HOUSEHOLD',
    orgName: '',
    postcode: '',
    township: '',
    state: '',
    housingType: '',
    language: lang
  });

  const handleNext = () => {
    if (step === 1) {
      if (!form.email || !form.password || !form.name) {
        toast.error('Please fill in all required fields');
        return;
      }
      if (form.password !== form.confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }
      if (form.password.length < 8) {
        toast.error('Password must be at least 8 characters');
        return;
      }
    }
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await register({ ...form, language: lang });
      loginUser(res.data.token, res.data.user);
      toast.success('Account created!');
      router.replace('/dashboard/onboarding');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const selectClass = "bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-green-500 transition-colors w-full appearance-none";

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-gray-950" />
          </div>
          <span className="font-bold text-white text-lg">JIMAT</span>
        </div>
        <button
          onClick={toggleLang}
          className="text-xs text-gray-400 border border-gray-700 rounded-lg px-3 py-1 hover:border-green-500 transition-colors"
        >
          {lang === 'EN' ? 'BM' : 'EN'}
        </button>
      </div>

      {/* Progress */}
      <div className="px-6 mb-6">
        <div className="flex gap-2">
          <div className="h-1 flex-1 rounded-full bg-green-500" />
          <div className={`h-1 flex-1 rounded-full ${step === 2 ? 'bg-green-500' : 'bg-gray-800'}`} />
        </div>
        <p className="text-xs text-gray-500 mt-1">{t('common.next', lang)} {step}/2</p>
      </div>

      <div className="flex-1 px-6 pb-10">
        <div className="max-w-sm mx-auto w-full">
          <h1 className="text-2xl font-bold text-white mb-1">
            {t('auth.register', lang)}
          </h1>
          <p className="text-gray-400 text-sm mb-6">
            {step === 1 ? 'Create your account' : 'Tell us about your home'}
          </p>

          {step === 1 ? (
            <div className="flex flex-col gap-4">
              {/* Account Type */}
              <div className="flex gap-3">
                {['HOUSEHOLD', 'INSTITUTIONAL'].map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setForm({ ...form, userType: type })}
                    className={`flex-1 py-3 rounded-xl text-xs font-semibold border transition-all ${
                      form.userType === type
                        ? 'border-green-500 bg-green-500/10 text-green-500'
                        : 'border-gray-700 text-gray-400'
                    }`}
                  >
                    {type === 'HOUSEHOLD' ? '🏠 ' + t('auth.household', lang) : '🕌 ' + t('auth.institutional', lang).split('(')[0]}
                  </button>
                ))}
              </div>

              <Input
                label={t('auth.name', lang)}
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder={form.userType === 'INSTITUTIONAL' ? 'Masjid Al-Falah' : 'Ahmad bin Ali'}
                required
              />

              {form.userType === 'INSTITUTIONAL' && (
                <Input
                  label={t('auth.orgName', lang)}
                  value={form.orgName}
                  onChange={e => setForm({ ...form, orgName: e.target.value })}
                  placeholder="Full organisation name"
                />
              )}

              <Input
                label={t('auth.email', lang)}
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="email@example.com"
                required
              />

              <Input
                label={t('auth.phone', lang)}
                type="tel"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                placeholder="0123456789"
              />

              <Input
                label={t('auth.password', lang)}
                type="password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                placeholder="Min 8 characters"
                required
              />

              <Input
                label="Confirm Password"
                type="password"
                value={form.confirmPassword}
                onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                placeholder="Repeat password"
                required
              />

              <Button onClick={handleNext} fullWidth>
                {t('common.next', lang)}
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Input
                label={t('auth.postcode', lang)}
                value={form.postcode}
                onChange={e => setForm({ ...form, postcode: e.target.value })}
                placeholder="70000"
              />

              <Input
                label={t('auth.township', lang)}
                value={form.township}
                onChange={e => setForm({ ...form, township: e.target.value })}
                placeholder="Seremban"
              />

              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-400 font-medium">{t('auth.state', lang)}</label>
                <div className="relative">
                  <select
                    value={form.state}
                    onChange={e => setForm({ ...form, state: e.target.value })}
                    className={selectClass}
                  >
                    <option value="">Select state</option>
                    {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-400 font-medium">{t('auth.housingType', lang)}</label>
                <div className="relative">
                  <select
                    value={form.housingType}
                    onChange={e => setForm({ ...form, housingType: e.target.value })}
                    className={selectClass}
                  >
                    <option value="">Select type</option>
                    {HOUSING_TYPES.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="secondary" onClick={() => setStep(1)} fullWidth>
                  {t('common.back', lang)}
                </Button>
                <Button type="submit" loading={loading} fullWidth>
                  {t('auth.register', lang)}
                </Button>
              </div>
            </form>
          )}

          <p className="text-center text-gray-400 text-sm mt-6">
            {t('auth.hasAccount', lang)}{' '}
            <Link href="/login" className="text-green-500 hover:text-green-400 font-medium">
              {t('auth.login', lang)}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}