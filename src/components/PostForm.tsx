'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface PostFormProps {
  post?: {
    id: number;
    title: string;
    slug: string;
    content: string;
    published: boolean;
    coverImage?: string | null;
    categoryId?: number | null;
  };
}

interface Category {
  id: number;
  name: string;
}

interface PostPayload {
  title: string;
  slug: string;
  content: string;
  published: boolean;
  coverImage: string;
  categoryId: number | null;
}

export default function PostForm({ post }: PostFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: post?.title || '',
    slug: post?.slug || '',
    content: post?.content || '',
    published: post?.published || false,
    coverImage: post?.coverImage || '',
    categoryId: post?.categoryId || '',
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [preview, setPreview] = useState(false);
  const [bilibiliUrl, setBilibiliUrl] = useState('');
  const [bilibiliIframe, setBilibiliIframe] = useState('');

  useEffect(() => {
    const loadCategories = async () => {
      const res = await fetch('/api/categories');
      const data = (await res.json()) as Category[];
      setCategories(data);
    };
    loadCategories();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    const data = new FormData();
    data.append('file', file);

    const uploadToast = toast.loading('上传中...');
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: data,
      });
      const json = (await res.json()) as { success?: boolean; url?: string };
      if (json.success && json.url) {
        // Append image markdown to content
        setFormData(prev => ({
            ...prev,
            content: prev.content + `\n![${file.name}](${json.url})\n`
        }));
        toast.success('上传成功!', { id: uploadToast });
      } else {
        toast.error('上传失败', { id: uploadToast });
      }
    } catch {
      toast.error('上传错误', { id: uploadToast });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const url = post ? `/api/posts/${post.id}` : '/api/posts';
    const method = post ? 'PUT' : 'POST';
    
    const payload: PostPayload = {
      title: formData.title,
      slug: formData.slug,
      content: formData.content,
      published: formData.published,
      coverImage: formData.coverImage,
      categoryId: null,
    };
    const normalizedSlug = (payload.slug || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const titleSlug = (payload.title || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const fallbackSlug = `post-${Date.now()}`;
    payload.slug = normalizedSlug || titleSlug || fallbackSlug;
    
    if (formData.categoryId) {
      payload.categoryId = Number(formData.categoryId);
    } else {
      payload.categoryId = null;
    }

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(post ? '更新成功' : '创建成功');
        router.push('/admin');
        router.refresh();
      } else {
        toast.error('出错了');
      }
    } catch {
      toast.error('提交失败');
    } finally {
      setLoading(false);
    }
  };

  const buildBilibiliIframe = (input: string) => {
    const text = input.trim();
    if (!text) return null;
    const directMatch = text.match(/BV[0-9A-Za-z]+/);
    const bvid = directMatch?.[0] || '';
    if (!bvid) return null;
    return `<iframe src="https://player.bilibili.com/player.html?bvid=${bvid}" scrolling="no" frameborder="no" framespacing="0" allowfullscreen="true" width="100%" height="468"></iframe>`;
  };

  const handleBilibiliConvert = () => {
    const iframe = buildBilibiliIframe(bilibiliUrl);
    if (!iframe) {
      toast.error('未识别到 B 站视频链接');
      return;
    }
    setBilibiliIframe(iframe);
    setFormData(prev => ({
      ...prev,
      content: `${prev.content}\n\n${iframe}\n`,
    }));
    toast.success('已转换并插入正文');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
            <label className="block text-sm font-medium text-gray-700">标题</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
            />
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-700">Slug (URL别名)</label>
            <input
              type="text"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              placeholder="留空自动生成"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
            />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">分类</label>
        <select
          name="categoryId"
          value={formData.categoryId}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
        >
          <option value="">无分类</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">内容 (Markdown)</label>
            <button 
                type="button" 
                onClick={() => setPreview(!preview)}
                className="text-sm text-blue-600 hover:text-blue-800"
            >
                {preview ? '编辑' : '预览'}
            </button>
        </div>
        
        {preview ? (
            <div className="prose prose-slate max-w-none border rounded-md p-4 bg-gray-50 min-h-[400px]">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{formData.content}</ReactMarkdown>
            </div>
        ) : (
            <textarea
              name="content"
              rows={20}
              value={formData.content}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2 font-mono"
            />
        )}
      </div>
      
      <div>
         <label className="block text-sm font-medium text-gray-700 mb-2">插入图片/视频</label>
         <input 
            type="file" 
            onChange={handleFileChange}
            className="block w-full text-sm text-slate-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
         />
         <p className="text-xs text-gray-500 mt-1">文件上传后会自动插入到内容末尾。</p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
        <div className="text-sm font-medium text-gray-700">B 站链接一键转换</div>
        <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-center">
          <input
            type="text"
            value={bilibiliUrl}
            onChange={(e) => setBilibiliUrl(e.target.value)}
            placeholder="粘贴 B 站链接或 BV 号"
            className="w-full rounded-md border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={handleBilibiliConvert}
            className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            转换并插入
          </button>
        </div>
        {bilibiliIframe ? (
          <textarea
            readOnly
            value={bilibiliIframe}
            rows={3}
            className="mt-3 w-full rounded-md border-gray-200 bg-white p-2 text-xs text-gray-600"
          />
        ) : null}
      </div>

      <div className="flex items-center">
        <input
          id="published"
          name="published"
          type="checkbox"
          checked={formData.published}
          onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="published" className="ml-2 block text-sm text-gray-900">
          立即发布
        </label>
      </div>

      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          取消
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-white bg-stone-800 rounded-md hover:bg-stone-700 disabled:opacity-50 transition-colors"
        >
          {loading ? '保存中...' : '保存文章'}
        </button>
      </div>
    </form>
  );
}
