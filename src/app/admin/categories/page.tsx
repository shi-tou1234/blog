'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Trash2, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

interface Category {
  id: number;
  name: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState('');
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
    title: lang === 'en' ? 'Categories' : '分类管理',
    loading: lang === 'en' ? 'Loading...' : '加载中...',
    placeholder: lang === 'en' ? 'Enter category name...' : '输入新分类名称...',
    add: lang === 'en' ? 'Add' : '添加',
    addSuccess: lang === 'en' ? 'Category added' : '分类已添加',
    addFail: lang === 'en' ? 'Add failed' : '添加失败',
    deleteConfirm: lang === 'en'
      ? 'Delete this category? Posts will become uncategorized.'
      : '确定要删除吗？该分类下的文章将变为未分类。',
    deleteSuccess: lang === 'en' ? 'Category deleted' : '分类已删除',
    deleteFail: lang === 'en' ? 'Delete failed' : '删除失败',
    empty: lang === 'en' ? 'No categories' : '暂无分类',
  };

  const fetchCategories = () => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        setCategories(data);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim()) return;

    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategory }),
      });

      if (res.ok) {
        setNewCategory('');
        fetchCategories();
        toast.success(labels.addSuccess);
      } else {
        toast.error(labels.addFail);
      }
    } catch {
      toast.error(labels.addFail);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(labels.deleteConfirm)) return;

    try {
      await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      setCategories((prev) => prev.filter((c) => c.id !== id));
      toast.success(labels.deleteSuccess);
    } catch {
      toast.error(labels.deleteFail);
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

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
        <form onSubmit={handleAdd} className="flex gap-4">
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder={labels.placeholder}
            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
          />
          <button
            type="submit"
            className="bg-stone-800 text-white px-6 py-2 rounded-lg hover:bg-stone-700 transition-colors flex items-center gap-2"
          >
            <Plus size={18} />
            {labels.add}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
        <ul className="divide-y divide-gray-200">
          {categories.map((category) => (
            <li key={category.id} className="px-6 py-4 flex justify-between items-center hover:bg-gray-50">
              <span className="text-gray-800 font-medium">{category.name}</span>
              <button
                onClick={() => handleDelete(category.id)}
                className="text-red-500 hover:text-red-700 p-2"
              >
                <Trash2 size={18} />
              </button>
            </li>
          ))}
          {categories.length === 0 && (
            <li className="px-6 py-8 text-center text-gray-500">{labels.empty}</li>
          )}
        </ul>
      </div>
    </div>
  );
}
