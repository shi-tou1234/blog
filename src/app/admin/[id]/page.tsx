import { prisma } from '@/lib/prisma';
import PostForm from '@/components/PostForm';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditPostPage({ params }: Props) {
  const { id } = await params;
  const post = await prisma.post.findUnique({
    where: { id: parseInt(id) },
  });

  if (!post) {
    notFound();
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">编辑文章</h1>
      <PostForm post={post} />
    </div>
  );
}
