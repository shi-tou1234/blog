import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { notFound } from 'next/navigation';

export const revalidate = 10;

export default async function CategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const categoryId = parseInt(id);

  if (isNaN(categoryId)) notFound();

  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    include: {
      posts: {
        where: { published: true },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!category) notFound();

  return (
    <div className="space-y-10">
      <header className="space-y-3 border-b border-[var(--border)] pb-6">
        <p className="text-sm text-[var(--muted)]">分类</p>
        <div className="flex flex-wrap items-end gap-3">
          <h1 className="text-3xl md:text-4xl font-semibold text-[var(--heading)]">
            {category.name}
          </h1>
          <span className="text-sm text-[var(--muted)]">({category.posts.length})</span>
        </div>
      </header>

      <div className="divide-y divide-[var(--border)]">
        {category.posts.map((post) => (
          <article key={post.id} className="group py-7 hover-lift">
            <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--muted)]">
              {post.isTop && (
                <span className="rounded-full border border-[var(--border)] px-2 py-0.5 text-[var(--link)]">
                  置顶
                </span>
              )}
              <span>{format(new Date(post.createdAt), 'yyyy年MM月dd日', { locale: zhCN })}</span>
            </div>

            <h2 className="mt-4 text-2xl md:text-3xl font-semibold leading-snug text-[var(--heading)] transition-colors group-hover:text-[var(--link)]">
              <Link
                href={`/posts/${post.slug || post.id}`}
                className="underline decoration-transparent underline-offset-8 transition-all group-hover:decoration-[var(--link)]"
              >
                {post.title}
              </Link>
            </h2>
          </article>
        ))}
      </div>

      {category.posts.length === 0 && (
        <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--panel)] py-16 text-center text-[var(--muted)]">
          该分类下暂无文章。
        </div>
      )}
    </div>
  );
}
