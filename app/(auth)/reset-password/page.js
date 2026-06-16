'use client';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { resetPassword } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Zap } from 'lucide-react';

function ResetForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const { lang } = useAuth();
  const [form, setForm] = useState({ newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      toast.error('Passwords do not match');
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
    <div className="max-w-sm mx-auto w-full">
      <h1 className="text-2xl font-bold text-white mb-1">Reset Password</h1>
      <p className="text-gray-400 text-sm mb-6">Enter your new password below</p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="New Password"
          type="password"
          value={form.newPassword}
          onChange={e => setForm({ ...form, newPassword: e.target.value })}
          placeholder="Min 8 characters"
          required
        />
        <Input
          label="Confirm New Password"
          type="password"
          value={form.confirmPassword}
          onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
          placeholder="Repeat password"
          required
        />
        <Button type="submit" loading={loading} fullWidth>
          Reset Password
        </Button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <div className="flex items-center p-4 gap-2">
        <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
          <Zap className="w-5 h-5 text-gray-950" />
        </div>
        <span className="font-bold text-white text-lg">JIMAT</span>
      </div>
      <div className="flex-1 flex flex-col justify-center px-6 pb-10">
        <Suspense fallback={<div className="text-gray-400">Loading...</div>}>
          <ResetForm />
        </Suspense>
      </div>
    </div>
  );
}