'use client';
import { useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { forgotPassword } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { t } from '@/lib/i18n';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Zap, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const { lang } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

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
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-gray-950" />
          </div>
          <span className="font-bold text-white text-lg">JIMAT</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center px-6 pb-10">
        <div className="max-w-sm mx-auto w-full">
          <Link href="/login" className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-8">
            <ArrowLeft className="w-4 h-4" />
            {t('common.back', lang)}
          </Link>

          {sent ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500/10 border border-green-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📧</span>
              </div>
              <h1 className="text-xl font-bold text-white mb-2">Check Your Email</h1>
              <p className="text-gray-400 text-sm mb-6">
                If <span className="text-white">{email}</span> is registered, a reset link has been sent.
              </p>
              <Link href="/login">
                <Button fullWidth variant="outline">
                  Back to Login
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-white mb-1">
                {t('auth.forgot', lang)}
              </h1>
              <p className="text-gray-400 text-sm mb-6">
                Enter your email and we will send you a reset link
              </p>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <Input
                  label={t('auth.email', lang)}
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  required
                />
                <Button type="submit" loading={loading} fullWidth>
                  Send Reset Link
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}