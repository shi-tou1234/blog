import Link from 'next/link';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import SocialLinks from './SocialLinks';
import HeaderActions from './HeaderActions';

export default async function Sidebar() {
  const cookieStore = await cookies();
  const lang = cookieStore.get('lang')?.value === 'en' ? 'en' : 'zh';
  const labels = {
    home: lang === 'en' ? 'Home' : '首页',
    about: lang === 'en' ? 'About' : '关于',
    search: lang === 'en' ? 'Search' : '搜索',
    theme: lang === 'en' ? 'Theme' : '主题',
    language: lang === 'en' ? 'Language' : '语言',
    searchPlaceholder: lang === 'en' ? 'Search posts' : '搜索文章',
  };
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

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--background)]/90 backdrop-blur">
      <div className="mx-auto w-full max-w-[var(--header-width)] px-6 py-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-3xl font-bold tracking-tight text-[var(--foreground)] hover:opacity-70">
              {config.title}
            </Link>
          </div>
          <nav className="flex flex-wrap items-center gap-3 text-sm font-semibold text-[var(--foreground)]">
            <Link
              href="/"
              className="rounded-lg px-3 py-1 transition-colors hover:bg-[var(--button-hover-color)]"
            >
              {labels.home}
            </Link>
            <Link
              href="/about"
              className="rounded-lg px-3 py-1 transition-colors hover:bg-[var(--button-hover-color)]"
            >
              {labels.about}
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <HeaderActions
              searchPlaceholder={labels.searchPlaceholder}
              searchLabel={labels.search}
              themeLabel={labels.theme}
              languageLabel={labels.language}
            />
            <SocialLinks github={config.github} email={config.email} />
          </div>
        </div>
        <p className="mt-3 text-sm text-[var(--cover-subtitle-color)]">{config.description}</p>
      </div>
    </header>
  );
}
