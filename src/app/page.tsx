import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import Image from 'next/image';
import { cookies } from 'next/headers';
import { format } from 'date-fns';
import { enUS, zhCN } from 'date-fns/locale';

export const revalidate = 10;

export default async function Home({
  searchParams,
}: {
  searchParams?: { q?: string };
}) {
  const cookieStore = await cookies();
  const lang = cookieStore.get('lang')?.value === 'en' ? 'en' : 'zh';
  const config = (await prisma.siteConfig.findFirst()) ?? {
    id: 0,
    title: '我的博客',
    description: '分享知识与生活',
    github: 'https://github.com/your-username',
    email: 'mailto:your-email@example.com',
    updatedAt: new Date(),
    about: '关于我...',
    adminPasswordSalt: null,
    adminPasswordHash: null,
  };
  const labels = {
    latest: lang === 'en' ? 'Latest' : '最新记录',
    empty: lang === 'en' ? 'No posts yet' : '暂无文章',
    adminTip: lang === 'en' ? 'Go to' : '请前往',
    adminLink: lang === 'en' ? 'Admin' : '后台',
    createTip: lang === 'en' ? 'to create your first post.' : '创建第一篇文章。',
    searchResult: lang === 'en' ? 'Search results' : '搜索结果',
    noResult: lang === 'en' ? 'No matching posts' : '没有匹配的文章',
    pinned: lang === 'en' ? 'Pinned' : '置顶',
    coverTitle: lang === 'en' ? 'Home' : '首页',
  };
  const dateFormat = lang === 'en' ? 'MMM dd, yyyy' : 'yyyy年MM月dd日';
  const excerpt = (content: string) => {
    const text = content
      .replace(/!\[[^\]]*]\([^)]*\)/g, '')
      .replace(/\[[^\]]*]\([^)]*\)/g, '')
      .replace(/[`>*#_~\-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    return text.length > 120 ? `${text.slice(0, 120)}...` : text;
  };
  const query = (searchParams?.q || '').trim();
  const posts = await prisma.post.findMany({
    where: {
      published: true,
      ...(query
        ? {
            OR: [
              { title: { contains: query } },
              { content: { contains: query } },
            ],
          }
        : {}),
    },
    include: { category: true },
    orderBy: [
      { isTop: 'desc' },
      { createdAt: 'desc' }
    ],
  });

  return (
    <div className="space-y-10">
      <div className="text-center pt-5 pb-10">
        <p className="text-3xl font-bold text-[var(--foreground)]">{labels.coverTitle}</p>
        <p className="mt-3 text-[var(--cover-subtitle-color)]">{config.description}</p>
      </div>

      <div className="text-sm text-[var(--muted)]">
        {query ? `${labels.searchResult} · ${query}` : labels.latest}
      </div>

      <div className="space-y-6">
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/posts/${post.slug || post.id}`}
            className="group block w-full rounded-xl border border-[var(--button-border-color)] bg-[var(--postcard-bg-color)] shadow-sm transition-all duration-300 hover:bg-[var(--button-hover-color)]"
          >
            {post.coverImage && (
              <div className="h-56 overflow-hidden">
                <Image
                  src={post.coverImage}
                  alt={post.title}
                  width={1200}
                  height={720}
                  sizes="100vw"
                  unoptimized
                  className="h-56 w-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.02]"
                />
              </div>
            )}
            <div className="p-6">
              <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--muted)]">
                {post.isTop && (
                  <span className="rounded-full border border-[var(--border)] px-2 py-0.5 text-[var(--link)]">
                    {labels.pinned}
                  </span>
                )}
                {post.category && (
                  <span className="rounded-full border border-[var(--border)] px-2 py-0.5">
                    {post.category.name}
                  </span>
                )}
                <span>
                  {format(new Date(post.createdAt), dateFormat, {
                    locale: lang === 'en' ? enUS : zhCN,
                  })}
                </span>
              </div>
              <h2 className="mt-3 text-xl font-semibold text-[var(--foreground)] group-hover:text-[var(--link)]">
                {post.title}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
                {excerpt(post.content)}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {posts.length === 0 && (
        <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--panel)] py-16 text-center">
          <h2 className="text-2xl font-semibold text-[var(--heading)]">
            {query ? labels.noResult : labels.empty}
          </h2>
          {!query && (
            <p className="mt-3 text-[var(--muted)]">
              {labels.adminTip}{' '}
              <Link href="/admin" className="text-[var(--link)] underline underline-offset-4">
                {labels.adminLink}
              </Link>{' '}
              {labels.createTip}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
