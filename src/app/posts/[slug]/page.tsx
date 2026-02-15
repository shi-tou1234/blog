import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import PostContent from '@/components/PostContent';

interface Props {
  params: Promise<{ slug: string }>;
}

export const revalidate = 10;

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  
  // Try to find by slug first, if number then try id
  let post = await prisma.post.findUnique({
    where: { slug },
  });

  if (!post && !isNaN(Number(slug))) {
      post = await prisma.post.findUnique({
          where: { id: Number(slug) },
      });
  }

  if (!post) {
    notFound();
  }

  return (
    <article className="space-y-10">
      <header className="space-y-4 border-b border-[var(--border)] pb-8">
        <p className="text-sm text-[var(--muted)]">文章</p>
        <h1 className="text-4xl md:text-5xl font-semibold text-[var(--heading)] leading-tight">{post.title}</h1>
        <time className="text-sm text-[var(--muted)]">
          {format(new Date(post.createdAt), 'yyyy年MM月dd日', { locale: zhCN })}
        </time>
      </header>

      <PostContent
        content={post.content}
        postSlug={`/posts/${post.slug || post.id}`}
        postTitle={post.title}
      />
    </article>
  );
}
