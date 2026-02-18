'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [lang] = useState<'zh' | 'en'>(() => {
    if (typeof document === 'undefined') return 'zh';
    const cookie = document.cookie
      .split(';')
      .map((item) => item.trim())
      .find((item) => item.startsWith('lang='));
    return cookie?.split('=')[1] === 'en' ? 'en' : 'zh';
  });
  const labels = {
    title: lang === 'en' ? 'Admin Login' : '管理员登录',
    password: lang === 'en' ? 'Password' : '密码',
    placeholder: lang === 'en' ? 'Enter admin password' : '请输入管理员密码',
    submit: lang === 'en' ? 'Log In' : '登录',
    submitting: lang === 'en' ? 'Logging in...' : '登录中...',
    success: lang === 'en' ? 'Login successful' : '登录成功',
    errorPassword: lang === 'en' ? 'Incorrect password' : '密码错误',
    errorLogin: lang === 'en' ? 'Login failed' : '登录失败',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        toast.success(labels.success);
        router.push('/admin');
        router.refresh();
      } else {
        toast.error(labels.errorPassword);
      }
    } catch {
      toast.error(labels.errorLogin);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {labels.title}
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="password" className="sr-only">{labels.password}</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-stone-500 focus:border-stone-500 focus:z-10 sm:text-sm"
                placeholder={labels.placeholder}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-stone-800 hover:bg-stone-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-stone-500 disabled:opacity-50 transition-colors"
            >
              {loading ? labels.submitting : labels.submit}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
