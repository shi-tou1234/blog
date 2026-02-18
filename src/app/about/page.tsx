import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export const revalidate = 60;

export default async function AboutPage() {
  const cookieStore = await cookies();
  const lang = cookieStore.get('lang')?.value === 'en' ? 'en' : 'zh';
  const labels = {
    empty: lang === 'en' ? 'The author has not written an about yet.' : '博主很懒，还没有写关于介绍。',
    heading: lang === 'en' ? 'About' : '关于我',
    subtitle: lang === 'en' ? 'A note for you' : '写给来访的你',
  };
  const config = await prisma.siteConfig.findFirst();

  if (!config?.about) {
    return (
      <div className="space-y-10">
        <div className="text-center pt-5 pb-10">
          <p className="text-3xl font-bold text-[var(--foreground)]">{labels.heading}</p>
          <p className="mt-3 text-[var(--cover-subtitle-color)]">{labels.subtitle}</p>
        </div>
        <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--panel)] py-16 text-center text-[var(--muted)]">
          {labels.empty}
        </div>
      </div>
    );
  }

  return (
    <article className="space-y-8">
      <div className="text-center pt-5 pb-10">
        <p className="text-3xl font-bold text-[var(--foreground)]">{labels.heading}</p>
        <p className="mt-3 text-[var(--cover-subtitle-color)]">{labels.subtitle}</p>
      </div>
      <div className="prose prose-neutral max-w-none prose-lg">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {config.about}
        </ReactMarkdown>
      </div>
    </article>
  );
}
