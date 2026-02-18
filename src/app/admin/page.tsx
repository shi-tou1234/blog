'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Edit, Trash2, Settings, Pin } from 'lucide-react';
import toast from 'react-hot-toast';

interface Post {
  id: number;
  title: string;
  createdAt: string;
  published: boolean;
  isTop: boolean;
}

export default function AdminPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [lang] = useState<'zh' | 'en'>(() => {
    if (typeof document === 'undefined') return 'zh';
    const cookie = document.cookie
      .split(';')
      .map((item) => item.trim())
      .find((item) => item.startsWith('lang='));
    return cookie?.split('=')[1] === 'en' ? 'en' : 'zh';
  });
  const labels = {
    title: lang === 'en' ? 'Posts' : '文章管理',
    categories: lang === 'en' ? 'Categories' : '分类管理',
    settings: lang === 'en' ? 'Settings' : '设置',
    newPost: lang === 'en' ? 'New Post' : '新建文章',
    loading: lang === 'en' ? 'Loading...' : '加载中...',
    confirmDelete: lang === 'en' ? 'Delete this post?' : '确定要删除吗？',
    deleteSuccess: lang === 'en' ? 'Post deleted' : '文章已删除',
    deleteFail: lang === 'en' ? 'Delete failed' : '删除失败',
    pinSuccess: lang === 'en' ? 'Pinned' : '已置顶',
    unpinSuccess: lang === 'en' ? 'Unpinned' : '已取消置顶',
    actionFail: lang === 'en' ? 'Operation failed' : '操作失败',
    headerTitle: lang === 'en' ? 'Title' : '标题',
    headerStatus: lang === 'en' ? 'Status' : '状态',
    headerDate: lang === 'en' ? 'Date' : '发布日期',
    headerAction: lang === 'en' ? 'Actions' : '操作',
    statusPublished: lang === 'en' ? 'Published' : '已发布',
    statusDraft: lang === 'en' ? 'Draft' : '草稿',
    pinOn: lang === 'en' ? 'Pin post' : '置顶文章',
    pinOff: lang === 'en' ? 'Unpin' : '取消置顶',
  };

  useEffect(() => {
    fetch('/api/posts')
      .then((res) => res.json())
      .then((data) => {
        setPosts(data);
        setLoading(false);
      });
  }, []);

  const togglePin = async (id: number, currentIsTop: boolean) => {
    try {
      const res = await fetch(`/api/posts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isTop: !currentIsTop }),
      });
      
      if (res.ok) {
        setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, isTop: !currentIsTop } : p)));
        toast.success(currentIsTop ? labels.unpinSuccess : labels.pinSuccess);
      } else {
        toast.error(labels.actionFail);
      }
    } catch {
      toast.error(labels.actionFail);
    }
  };

  const deletePost = async (id: number) => {
    if (!confirm(labels.confirmDelete)) return;
    
    try {
      await fetch(`/api/posts/${id}`, { method: 'DELETE' });
      setPosts((prev) => prev.filter((p) => p.id !== id));
      toast.success(labels.deleteSuccess);
    } catch {
      toast.error(labels.deleteFail);
    }
  };

  if (loading) return <div>{labels.loading}</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">{labels.title}</h1>
        <div className="flex gap-4">
          <Link 
            href="/admin/categories" 
            className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {labels.categories}
          </Link>
          <Link 
            href="/admin/settings" 
            className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Settings size={20} />
            {labels.settings}
          </Link>
          <Link 
            href="/admin/new" 
            className="flex items-center gap-2 bg-[#b07a3f] text-white px-4 py-2 rounded-lg font-semibold shadow-sm hover:bg-[#9c6a34] hover:-translate-y-0.5 transition-all"
          >
            <Plus size={20} />
            {labels.newPost}
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{labels.headerTitle}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{labels.headerStatus}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{labels.headerDate}</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{labels.headerAction}</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {posts.map((post) => (
              <tr key={post.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{post.title}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${post.published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {post.published ? labels.statusPublished : labels.statusDraft}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(post.createdAt).toLocaleDateString(lang === 'en' ? 'en-US' : 'zh-CN')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button 
                    onClick={() => togglePin(post.id, post.isTop)} 
                    className={`${post.isTop ? 'text-amber-600 hover:text-amber-800' : 'text-gray-400 hover:text-gray-600'} mr-4 inline-block`}
                    title={post.isTop ? labels.pinOff : labels.pinOn}
                  >
                    {post.isTop ? <Pin size={18} fill="currentColor" /> : <Pin size={18} />}
                  </button>
                  <Link href={`/admin/${post.id}`} className="text-indigo-600 hover:text-indigo-900 mr-4 inline-block">
                    <Edit size={18} />
                  </Link>
                  <button onClick={() => deletePost(post.id)} className="text-red-600 hover:text-red-900 inline-block">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
