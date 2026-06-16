'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';
import { login } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { t } from '@/lib/i18n';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Zap } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { loginUser, lang, toggleLang } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

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

      {/* Form */}
      <div className="flex-1 flex flex-col justify-center px-6 pb-10">
        <div className="max-w-sm mx-auto w-full">
          {/* Hero */}
          <div className="mb-8 text-center">
            <div className="w-16 h-16 bg-green-500/10 border border-green-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">
              {t('auth.login', lang)}
            </h1>
            <p className="text-gray-400 text-sm">
              {t('app.tagline', lang)}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label={t('auth.email', lang)}
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              placeholder="email@example.com"
              required
            />
            <Input
              label={t('auth.password', lang)}
              type="password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
              required
            />

            <div className="flex justify-end">
              <Link href="/forgot-password" className="text-xs text-green-500 hover:text-green-400">
                {t('auth.forgot', lang)}
              </Link>
            </div>

            <Button type="submit" loading={loading} fullWidth>
              {t('auth.login', lang)}
            </Button>
          </form>

          <p className="text-center text-gray-400 text-sm mt-6">
            {t('auth.noAccount', lang)}{' '}
            <Link href="/register" className="text-green-500 hover:text-green-400 font-medium">
              {t('auth.register', lang)}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}