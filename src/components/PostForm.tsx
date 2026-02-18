'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
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
  const [lang] = useState<'zh' | 'en'>(() => {
    if (typeof document === 'undefined') return 'zh';
    const cookie = document.cookie
      .split(';')
      .map((item) => item.trim())
      .find((item) => item.startsWith('lang='));
    return cookie?.split('=')[1] === 'en' ? 'en' : 'zh';
  });
  const labels = {
    title: lang === 'en' ? 'Title' : '标题',
    slug: lang === 'en' ? 'Slug (URL alias)' : 'Slug (URL别名)',
    slugPlaceholder: lang === 'en' ? 'Auto-generate if empty' : '留空自动生成',
    category: lang === 'en' ? 'Category' : '分类',
    categoryNone: lang === 'en' ? 'No category' : '无分类',
    cover: lang === 'en' ? 'Cover image' : '封面图片',
    coverUrlPlaceholder: lang === 'en' ? 'Cover image URL' : '封面图片 URL',
    content: lang === 'en' ? 'Content (Markdown)' : '内容 (Markdown)',
    preview: lang === 'en' ? 'Preview' : '预览',
    edit: lang === 'en' ? 'Edit' : '编辑',
    embedTitle: lang === 'en' ? 'Insert image/video' : '插入图片/视频',
    embedHint: lang === 'en' ? 'File will be appended to the end.' : '文件上传后会自动插入到内容末尾。',
    bilibiliTitle: lang === 'en' ? 'Bilibili link converter' : 'B 站链接一键转换',
    bilibiliPlaceholder: lang === 'en' ? 'Paste Bilibili link or BV id' : '粘贴 B 站链接或 BV 号',
    bilibiliButton: lang === 'en' ? 'Convert and insert' : '转换并插入',
    publishNow: lang === 'en' ? 'Publish now' : '立即发布',
    cancel: lang === 'en' ? 'Cancel' : '取消',
    save: lang === 'en' ? 'Save post' : '保存文章',
    saving: lang === 'en' ? 'Saving...' : '保存中...',
    uploadLoading: lang === 'en' ? 'Uploading...' : '上传中...',
    uploadSuccess: lang === 'en' ? 'Upload successful!' : '上传成功!',
    uploadFail: lang === 'en' ? 'Upload failed' : '上传失败',
    uploadError: lang === 'en' ? 'Upload error' : '上传错误',
    coverUploadSuccess: lang === 'en' ? 'Cover uploaded' : '封面上传成功',
    createSuccess: lang === 'en' ? 'Created' : '创建成功',
    updateSuccess: lang === 'en' ? 'Updated' : '更新成功',
    submitError: lang === 'en' ? 'Something went wrong' : '出错了',
    submitFail: lang === 'en' ? 'Submit failed' : '提交失败',
    bilibiliError: lang === 'en' ? 'No Bilibili link found' : '未识别到 B 站视频链接',
    bilibiliInserted: lang === 'en' ? 'Converted and inserted' : '已转换并插入正文',
  };

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

    const uploadToast = toast.loading(labels.uploadLoading);
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: data,
      });
      const json = (await res.json()) as { success?: boolean; url?: string };
      if (json.success && json.url) {
        setFormData((prev) => ({
          ...prev,
          content: prev.content + `\n![${file.name}](${json.url})\n`,
        }));
        toast.success(labels.uploadSuccess, { id: uploadToast });
      } else {
        toast.error(labels.uploadFail, { id: uploadToast });
      }
    } catch {
      toast.error(labels.uploadError, { id: uploadToast });
    }
  };

  const handleCoverFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    const data = new FormData();
    data.append('file', file);

    const uploadToast = toast.loading(labels.uploadLoading);
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: data,
      });
      const json = (await res.json()) as { success?: boolean; url?: string };
      if (json.success && json.url) {
        setFormData((prev) => ({
          ...prev,
          coverImage: json.url || '',
        }));
        toast.success(labels.coverUploadSuccess, { id: uploadToast });
      } else {
        toast.error(labels.uploadFail, { id: uploadToast });
      }
    } catch {
      toast.error(labels.uploadError, { id: uploadToast });
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
        toast.success(post ? labels.updateSuccess : labels.createSuccess);
        router.push('/admin');
        router.refresh();
      } else {
        toast.error(labels.submitError);
      }
    } catch {
      toast.error(labels.submitFail);
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
      toast.error(labels.bilibiliError);
      return;
    }
    setBilibiliIframe(iframe);
    setFormData((prev) => ({
      ...prev,
      content: `${prev.content}\n\n${iframe}\n`,
    }));
    toast.success(labels.bilibiliInserted);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
            <label className="block text-sm font-medium text-gray-700">{labels.title}</label>
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
            <label className="block text-sm font-medium text-gray-700">{labels.slug}</label>
            <input
              type="text"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              placeholder={labels.slugPlaceholder}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
            />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">{labels.category}</label>
        <select
          name="categoryId"
          value={formData.categoryId}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
        >
          <option value="">{labels.categoryNone}</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">{labels.cover}</label>
        <div className="mt-2 space-y-3">
          <input
            type="text"
            name="coverImage"
            value={formData.coverImage}
            onChange={handleChange}
            placeholder={labels.coverUrlPlaceholder}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
          />
          <input
            type="file"
            accept="image/*"
            onChange={handleCoverFileChange}
            className="block w-full text-sm text-slate-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
          {formData.coverImage && (
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
              <Image
                src={formData.coverImage}
                alt="cover"
                width={1200}
                height={720}
                sizes="100vw"
                unoptimized
                className="h-48 w-full object-cover"
              />
            </div>
          )}
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">{labels.content}</label>
            <button 
                type="button" 
                onClick={() => setPreview(!preview)}
                className="text-sm text-blue-600 hover:text-blue-800"
            >
                {preview ? labels.edit : labels.preview}
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
         <label className="block text-sm font-medium text-gray-700 mb-2">{labels.embedTitle}</label>
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
         <p className="text-xs text-gray-500 mt-1">{labels.embedHint}</p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
        <div className="text-sm font-medium text-gray-700">{labels.bilibiliTitle}</div>
        <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-center">
          <input
            type="text"
            value={bilibiliUrl}
            onChange={(e) => setBilibiliUrl(e.target.value)}
            placeholder={labels.bilibiliPlaceholder}
            className="w-full rounded-md border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={handleBilibiliConvert}
            className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            {labels.bilibiliButton}
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
          {labels.publishNow}
        </label>
      </div>

      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          {labels.cancel}
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-white bg-stone-800 rounded-md hover:bg-stone-700 disabled:opacity-50 transition-colors"
        >
          {loading ? labels.saving : labels.save}
        </button>
      </div>
    </form>
  );
}
