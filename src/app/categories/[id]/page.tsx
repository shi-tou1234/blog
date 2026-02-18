import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import Image from 'next/image';
import { cookies } from 'next/headers';
import { format } from 'date-fns';
import { enUS, zhCN } from 'date-fns/locale';
import { notFound } from 'next/navigation';

export const revalidate = 10;

export default async function CategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const cookieStore = await cookies();
  const lang = cookieStore.get('lang')?.value === 'en' ? 'en' : 'zh';
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
  const labels = {
    category: lang === 'en' ? 'Category' : '分类',
    empty: lang === 'en' ? 'No posts in this category.' : '该分类下暂无文章。',
    pinned: lang === 'en' ? 'Pinned' : '置顶',
    coverSub: lang === 'en'
      ? `Posts in ${category.name}`
      : `共 ${category.posts.length} 篇文章`,
  };

  return (
    <div className="space-y-10">
      <div className="text-center pt-5 pb-10">
        <p className="text-3xl font-bold text-[var(--foreground)]">{category.name}</p>
        <p className="mt-3 text-[var(--cover-subtitle-color)]">{labels.coverSub}</p>
      </div>

      <div className="space-y-6">
        {category.posts.map((post) => (
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

      {category.posts.length === 0 && (
        <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--panel)] py-16 text-center text-[var(--muted)]">
          {labels.empty}
        </div>
      )}
    </div>
  );
}
