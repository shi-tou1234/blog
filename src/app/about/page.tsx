import { prisma } from '@/lib/prisma';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export const revalidate = 60;

export default async function AboutPage() {
  const config = await prisma.siteConfig.findFirst();

  if (!config?.about) {
    return (
      <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--panel)] py-16 text-center text-[var(--muted)]">
        博主很懒，还没有写关于介绍。
      </div>
    );
  }

  return (
    <article className="space-y-8">
      <header className="space-y-3 border-b border-[var(--border)] pb-6">
        <p className="text-sm text-[var(--muted)]">写给来访的你</p>
        <h1 className="text-3xl md:text-4xl font-semibold text-[var(--heading)]">关于我</h1>
      </header>
      <div className="prose prose-neutral max-w-none prose-lg">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {config.about}
        </ReactMarkdown>
      </div>
    </article>
  );
}
