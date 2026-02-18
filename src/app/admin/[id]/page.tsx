import { prisma } from '@/lib/prisma';
import PostForm from '@/components/PostForm';
import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditPostPage({ params }: Props) {
  const { id } = await params;
  const cookieStore = await cookies();
  const lang = cookieStore.get('lang')?.value === 'en' ? 'en' : 'zh';
  const post = await prisma.post.findUnique({
    where: { id: parseInt(id) },
  });

  if (!post) {
    notFound();
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">
        {lang === 'en' ? 'Edit Post' : '编辑文章'}
      </h1>
      <PostForm post={post} />
    </div>
  );
}
