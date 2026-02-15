'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    github: '',
    email: '',
    about: '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        setFormData({
          title: data.title || '',
          description: data.description || '',
          github: data.github || '',
          email: data.email || '',
          about: data.about || '',
        });
        setLoading(false);
      })
      .catch(() => {
        toast.error('加载配置失败');
        setLoading(false);
      });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (passwordData.newPassword.trim()) {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
          toast.error('两次输入的新密码不一致');
          setSaving(false);
          return;
        }
        if (!passwordData.currentPassword.trim()) {
          toast.error('请输入当前密码');
          setSaving(false);
          return;
        }
      }

      const payload = passwordData.newPassword.trim()
        ? {
            ...formData,
            currentPassword: passwordData.currentPassword,
            newPassword: passwordData.newPassword,
          }
        : formData;

      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success('配置已保存');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        const json = await res.json().catch(() => null);
        toast.error(json?.error || '保存失败');
      }
    } catch {
      toast.error('保存错误');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8">加载中...</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin" className="text-gray-500 hover:text-gray-800">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-3xl font-bold text-gray-800">网站设置</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-6">
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b border-gray-100">基本信息</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">网站标题</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">网站描述</label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
              />
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b border-gray-100">社交链接</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">GitHub 链接</label>
              <input
                type="text"
                name="github"
                value={formData.github}
                onChange={handleChange}
                placeholder="https://github.com/username"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">邮箱地址</label>
              <input
                type="text"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="mailto:user@example.com"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
              />
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b border-gray-100">关于我 (支持 Markdown)</h2>
          <div>
            <textarea
              name="about"
              value={formData.about}
              onChange={handleChange}
              rows={10}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2 font-mono"
              placeholder="在这里输入关于你的介绍..."
            />
          </div>
        </div>

        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b border-gray-100">安全</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">当前密码</label>
              <input
                type="password"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                placeholder="输入当前管理员密码"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">新密码</label>
              <input
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                placeholder="至少 6 位"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">确认新密码</label>
              <input
                type="password"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                placeholder="再次输入新密码"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-stone-800 text-white px-6 py-2 rounded-lg hover:bg-stone-700 transition-colors disabled:opacity-50"
          >
            <Save size={18} />
            {saving ? '保存中...' : '保存设置'}
          </button>
        </div>
      </form>
    </div>
  );
}
