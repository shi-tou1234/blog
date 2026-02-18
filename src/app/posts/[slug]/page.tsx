import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { cookies } from 'next/headers';
import { format } from 'date-fns';
import { enUS, zhCN } from 'date-fns/locale';
import PostContent from '@/components/PostContent';

interface Props {
  params: Promise<{ slug: string }>;
}

export const revalidate = 10;

export default async function PostPage({ params }: Props) {
  const cookieStore = await cookies();
  const lang = cookieStore.get('lang')?.value === 'en' ? 'en' : 'zh';
  const labels = {
    article: lang === 'en' ? 'Article' : '文章',
    comments: lang === 'en' ? 'Comments' : '评论',
  };
  const dateFormat = lang === 'en' ? 'MMM dd, yyyy' : 'yyyy年MM月dd日';
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
      <header className="text-center space-y-4">
        <p className="text-sm text-[var(--muted)]">{labels.article}</p>
        <h1 className="text-3xl md:text-4xl font-bold text-[var(--foreground)]">{post.title}</h1>
        <time className="text-sm text-[var(--muted)]">
          {format(new Date(post.createdAt), dateFormat, {
            locale: lang === 'en' ? enUS : zhCN,
          })}
        </time>
      </header>
      {post.coverImage && (
        <div className="overflow-hidden rounded-xl border border-[var(--border)]">
          <Image
            src={post.coverImage}
            alt={post.title}
            width={1400}
            height={840}
            sizes="100vw"
            unoptimized
            className="h-[55vh] min-h-[260px] max-h-[620px] w-full object-cover"
          />
        </div>
      )}

      <PostContent
        content={post.content}
        postSlug={`/posts/${post.slug || post.id}`}
        postTitle={post.title}
        commentTitle={labels.comments}
      />
    </article>
  );
}
