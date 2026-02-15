import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import SocialLinks from './SocialLinks';

export default async function Sidebar() {
  let config = await prisma.siteConfig.findFirst();
  const categories = await prisma.category.findMany({
    include: { _count: { select: { posts: true } } }
  });
  
  if (!config) {
    config = {
      id: 0,
      title: '我的博客',
      description: '分享知识与生活',
      github: 'https://github.com/your-username',
      email: 'mailto:your-email@example.com',
      updatedAt: new Date(),
      about: '关于我...',
    };
  }

  return (
    <header className="border-b border-[var(--border)] bg-[var(--panel)]">
      <div className="mx-auto max-w-3xl px-6 py-10">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <Link
                href="/"
                className="text-3xl md:text-4xl font-semibold tracking-tight text-[var(--heading)] transition-colors hover:text-[var(--link)]"
              >
                {config.title}
              </Link>
              <p className="mt-3 text-sm text-[var(--muted)] leading-relaxed">
                {config.description}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-5">
              <nav className="flex items-center gap-5 text-sm text-[var(--muted)]">
                <Link
                  href="/"
                  className="transition-all hover:text-[var(--heading)] hover:-translate-y-0.5"
                >
                  首页
                </Link>
                <Link
                  href="/about"
                  className="transition-all hover:text-[var(--heading)] hover:-translate-y-0.5"
                >
                  关于
                </Link>
              </nav>
              <div className="h-4 w-px bg-[var(--border)]" />
              <SocialLinks github={config.github} email={config.email} />
            </div>
          </div>

          {categories.length > 0 && (
            <div className="flex flex-wrap items-center gap-3 text-sm">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/categories/${category.id}`}
                  className="group inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-3 py-1 text-[var(--muted)] transition-all hover:border-[var(--link)] hover:text-[var(--heading)] hover:-translate-y-0.5"
                >
                  <span>{category.name}</span>
                  <span className="text-xs text-[var(--muted)] group-hover:text-[var(--link)]">
                    {category._count.posts}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
