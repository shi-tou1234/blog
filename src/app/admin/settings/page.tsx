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
  const [lang] = useState<'zh' | 'en'>(() => {
    if (typeof document === 'undefined') return 'zh';
    const cookie = document.cookie
      .split(';')
      .map((item) => item.trim())
      .find((item) => item.startsWith('lang='));
    return cookie?.split('=')[1] === 'en' ? 'en' : 'zh';
  });
  const labels = {
    loading: lang === 'en' ? 'Loading...' : '加载中...',
    title: lang === 'en' ? 'Site Settings' : '网站设置',
    sectionBasic: lang === 'en' ? 'Basic' : '基本信息',
    sectionSocial: lang === 'en' ? 'Social Links' : '社交链接',
    sectionAbout: lang === 'en' ? 'About (Markdown supported)' : '关于我 (支持 Markdown)',
    sectionSecurity: lang === 'en' ? 'Security' : '安全',
    siteTitle: lang === 'en' ? 'Site Title' : '网站标题',
    siteDesc: lang === 'en' ? 'Site Description' : '网站描述',
    github: lang === 'en' ? 'GitHub URL' : 'GitHub 链接',
    email: lang === 'en' ? 'Email' : '邮箱地址',
    aboutPlaceholder: lang === 'en' ? 'Write your bio here...' : '在这里输入关于你的介绍...',
    passwordCurrent: lang === 'en' ? 'Current Password' : '当前密码',
    passwordNew: lang === 'en' ? 'New Password' : '新密码',
    passwordConfirm: lang === 'en' ? 'Confirm Password' : '确认新密码',
    passwordCurrentPlaceholder: lang === 'en' ? 'Enter current password' : '输入当前管理员密码',
    passwordNewPlaceholder: lang === 'en' ? 'At least 6 characters' : '至少 6 位',
    passwordConfirmPlaceholder: lang === 'en' ? 'Repeat new password' : '再次输入新密码',
    save: lang === 'en' ? 'Save Settings' : '保存设置',
    saving: lang === 'en' ? 'Saving...' : '保存中...',
    loadFail: lang === 'en' ? 'Failed to load settings' : '加载配置失败',
    passwordMismatch: lang === 'en' ? 'Passwords do not match' : '两次输入的新密码不一致',
    passwordMissing: lang === 'en' ? 'Please enter current password' : '请输入当前密码',
    saveSuccess: lang === 'en' ? 'Settings saved' : '配置已保存',
    saveFail: lang === 'en' ? 'Save failed' : '保存失败',
    saveError: lang === 'en' ? 'Save error' : '保存错误',
  };
  const loadFail = labels.loadFail;

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
        toast.error(loadFail);
        setLoading(false);
      });
  }, [loadFail]);

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
          toast.error(labels.passwordMismatch);
          setSaving(false);
          return;
        }
        if (!passwordData.currentPassword.trim()) {
          toast.error(labels.passwordMissing);
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
        toast.success(labels.saveSuccess);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        const json = await res.json().catch(() => null);
        toast.error(json?.error || labels.saveFail);
      }
    } catch {
      toast.error(labels.saveError);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8">{labels.loading}</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin" className="text-gray-500 hover:text-gray-800">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-3xl font-bold text-gray-800">{labels.title}</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-6">
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b border-gray-100">{labels.sectionBasic}</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">{labels.siteTitle}</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">{labels.siteDesc}</label>
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
          <h2 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b border-gray-100">{labels.sectionSocial}</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">{labels.github}</label>
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
              <label className="block text-sm font-medium text-gray-700">{labels.email}</label>
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
          <h2 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b border-gray-100">{labels.sectionAbout}</h2>
          <div>
            <textarea
              name="about"
              value={formData.about}
              onChange={handleChange}
              rows={10}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2 font-mono"
              placeholder={labels.aboutPlaceholder}
            />
          </div>
        </div>

        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b border-gray-100">{labels.sectionSecurity}</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">{labels.passwordCurrent}</label>
              <input
                type="password"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                placeholder={labels.passwordCurrentPlaceholder}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">{labels.passwordNew}</label>
              <input
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                placeholder={labels.passwordNewPlaceholder}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">{labels.passwordConfirm}</label>
              <input
                type="password"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                placeholder={labels.passwordConfirmPlaceholder}
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
            {saving ? labels.saving : labels.save}
          </button>
        </div>
      </form>
    </div>
  );
}
