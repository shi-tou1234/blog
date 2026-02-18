import PostForm from '@/components/PostForm';
import { cookies } from 'next/headers';

export default async function NewPostPage() {
  const cookieStore = await cookies();
  const lang = cookieStore.get('lang')?.value === 'en' ? 'en' : 'zh';
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">
        {lang === 'en' ? 'New Post' : '新建文章'}
      </h1>
      <PostForm />
    </div>
  );
}
