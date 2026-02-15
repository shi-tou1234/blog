import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export const revalidate = 10;

export default async function Home() {
  const posts = await prisma.post.findMany({
    where: { published: true },
    include: { category: true },
    orderBy: [
      { isTop: 'desc' },
      { createdAt: 'desc' }
    ],
  });

  return (
    <div className="space-y-10">
      <div className="text-sm text-[var(--muted)]">最新记录</div>

      <div className="divide-y divide-[var(--border)]">
        {posts.map((post) => (
          <article key={post.id} className="group py-7 hover-lift">
            <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--muted)]">
              {post.isTop && (
                <span className="rounded-full border border-[var(--border)] px-2 py-0.5 text-[var(--link)]">
                  置顶
                </span>
              )}
              {post.category && (
                <Link
                  href={`/categories/${post.category.id}`}
                  className="rounded-full border border-[var(--border)] px-2 py-0.5 transition-colors hover:border-[var(--link)] hover:text-[var(--heading)]"
                >
                  {post.category.name}
                </Link>
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

      {posts.length === 0 && (
        <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--panel)] py-16 text-center">
          <h2 className="text-2xl font-semibold text-[var(--heading)]">暂无文章</h2>
          <p className="mt-3 text-[var(--muted)]">
            请前往 <Link href="/admin" className="text-[var(--link)] underline underline-offset-4">后台</Link> 创建第一篇文章。
          </p>
        </div>
      )}
    </div>
  );
}
