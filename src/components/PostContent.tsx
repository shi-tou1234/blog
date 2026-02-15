'use client';

import { useEffect, useMemo, useRef } from 'react';
import type { ComponentPropsWithoutRef } from 'react';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import { defaultSchema } from 'hast-util-sanitize';

export default function PostContent({
  content,
  postSlug,
  postTitle,
  commentApiUrl,
}: {
  content: string;
  postSlug: string;
  postTitle: string;
  commentApiUrl?: string;
}) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const commentId = `momo-comment-${postSlug.replace(/[^a-zA-Z0-9_-]/g, '-')}`;
  const momoApiUrl = commentApiUrl ?? '';
  const sanitizeSchema = useMemo(() => {
    const baseTags = Array.isArray(defaultSchema.tagNames) ? defaultSchema.tagNames : [];
    return {
      ...defaultSchema,
      tagNames: [...baseTags, 'iframe'],
      attributes: {
        ...defaultSchema.attributes,
        iframe: [
          'src',
          'width',
          'height',
          'allow',
          'allowfullscreen',
          'frameborder',
          'scrolling',
          'framespacing',
          'referrerpolicy',
          'sandbox',
        ],
      },
      protocols: {
        ...defaultSchema.protocols,
        src: ['http', 'https'],
      },
    };
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const items = Array.from(root.querySelectorAll('.reveal-text, .reveal-media'));
    if (items.length === 0) return;

    let revealIndex = 0;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          if (el.dataset.revealed === '1') {
            observer.unobserve(el);
            continue;
          }
          el.dataset.revealed = '1';
          const delay = Math.min(revealIndex * 90, 540);
          el.style.transitionDelay = `${delay}ms`;
          if (el.classList.contains('reveal-media')) {
            el.classList.add('reveal-media--in');
          } else {
            el.classList.add('reveal-text--in');
          }
          revealIndex += 1;
          observer.unobserve(el);
        }
      },
      { root: null, threshold: 0.2, rootMargin: '0px 0px -15% 0px' }
    );

    for (const el of items) observer.observe(el);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const initComments = () => {
      const momo = (window as typeof window & { momo?: { init?: (options: {
        el: string;
        apiUrl: string;
        slugId: string;
        lang?: string;
        title?: string;
      }) => void } }).momo;
      const container = document.getElementById(commentId);
      if (!container || container.dataset.momoMounted === '1') return;
      if (!momo?.init) return;
      momo.init({
        el: `#${commentId}`,
        title: postTitle,
        slugId: postSlug,
        lang: 'zh-cn',
        apiUrl: momoApiUrl,
      });
      container.dataset.momoMounted = '1';
    };

    const existing = document.getElementById('momo-comment-script') as HTMLScriptElement | null;
    if (existing) {
      if (existing.dataset.loaded === '1') {
        initComments();
      } else {
        existing.addEventListener('load', initComments, { once: true });
      }
      return;
    }

    const script = document.createElement('script');
    script.id = 'momo-comment-script';
    script.src = '/momo-comment.min.js';
    script.async = true;
    script.onload = () => {
      script.dataset.loaded = '1';
      initComments();
    };
    script.onerror = () => {
      const fallback = document.createElement('script');
      fallback.src = 'https://cdn.jsdelivr.net/npm/@motues/momo-comment/dist/momo-comment.min.js';
      fallback.async = true;
      fallback.onload = () => {
        script.dataset.loaded = '1';
        initComments();
      };
      document.body.appendChild(fallback);
    };
    document.body.appendChild(script);
  }, [commentId, momoApiUrl, postSlug, postTitle]);

  const RevealP = (props: ComponentPropsWithoutRef<'p'>) => (
    <p {...props} className={['reveal-text', props.className].filter(Boolean).join(' ')} />
  );
  const RevealH1 = (props: ComponentPropsWithoutRef<'h1'>) => (
    <h1 {...props} className={['reveal-text', props.className].filter(Boolean).join(' ')} />
  );
  const RevealH2 = (props: ComponentPropsWithoutRef<'h2'>) => (
    <h2 {...props} className={['reveal-text', props.className].filter(Boolean).join(' ')} />
  );
  const RevealH3 = (props: ComponentPropsWithoutRef<'h3'>) => (
    <h3 {...props} className={['reveal-text', props.className].filter(Boolean).join(' ')} />
  );
  const RevealH4 = (props: ComponentPropsWithoutRef<'h4'>) => (
    <h4 {...props} className={['reveal-text', props.className].filter(Boolean).join(' ')} />
  );
  const RevealH5 = (props: ComponentPropsWithoutRef<'h5'>) => (
    <h5 {...props} className={['reveal-text', props.className].filter(Boolean).join(' ')} />
  );
  const RevealH6 = (props: ComponentPropsWithoutRef<'h6'>) => (
    <h6 {...props} className={['reveal-text', props.className].filter(Boolean).join(' ')} />
  );
  const RevealBlockquote = (props: ComponentPropsWithoutRef<'blockquote'>) => (
    <blockquote {...props} className={['reveal-text', props.className].filter(Boolean).join(' ')} />
  );
  const RevealPre = (props: ComponentPropsWithoutRef<'pre'>) => (
    <pre {...props} className={['reveal-text', props.className].filter(Boolean).join(' ')} />
  );
  const RevealTable = (props: ComponentPropsWithoutRef<'table'>) => (
    <table {...props} className={['reveal-text', props.className].filter(Boolean).join(' ')} />
  );
  const RevealUl = (props: ComponentPropsWithoutRef<'ul'>) => (
    <ul {...props} className={['reveal-text', props.className].filter(Boolean).join(' ')} />
  );
  const RevealOl = (props: ComponentPropsWithoutRef<'ol'>) => (
    <ol {...props} className={['reveal-text', props.className].filter(Boolean).join(' ')} />
  );
  const RevealHr = (props: ComponentPropsWithoutRef<'hr'>) => (
    <hr {...props} className={['reveal-text', props.className].filter(Boolean).join(' ')} />
  );
  const RevealIframe = (props: ComponentPropsWithoutRef<'iframe'>) => {
    const src = props.src ? (props.src.startsWith('//') ? `https:${props.src}` : props.src) : '';
    return (
      <iframe
        {...props}
        src={src}
        className={['reveal-media', 'rounded-2xl', 'shadow-sm', 'my-8', 'w-full', props.className]
          .filter(Boolean)
          .join(' ')}
        allowFullScreen
      />
    );
  };

  return (
    <div ref={rootRef} className="prose prose-neutral max-w-none prose-lg">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[
          rehypeRaw,
          [rehypeSanitize, sanitizeSchema],
        ]}
        components={{
          p: RevealP,
          h1: RevealH1,
          h2: RevealH2,
          h3: RevealH3,
          h4: RevealH4,
          h5: RevealH5,
          h6: RevealH6,
          blockquote: RevealBlockquote,
          pre: RevealPre,
          table: RevealTable,
          ul: RevealUl,
          ol: RevealOl,
          hr: RevealHr,
          iframe: RevealIframe,
          img: ({ ...props }) => {
            const src = typeof props.src === 'string' ? props.src : '';
            if (!src) return null;
            if (/\.(mp4|webm|mov)$/i.test(src)) {
              return (
                <video controls className="reveal-media rounded-2xl shadow-sm my-8 w-full">
                  <source src={src} />
                  您的浏览器不支持视频标签。
                </video>
              );
            }
            return (
              <Image
                src={src}
                alt={props.alt || ''}
                width={1200}
                height={800}
                sizes="100vw"
                unoptimized
                className="reveal-media rounded-2xl shadow-sm my-8 w-full h-auto"
              />
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
      <section className="mt-12 space-y-4">
        <h2 className="text-2xl font-semibold text-[var(--heading)]">评论</h2>
        <div id={commentId} />
      </section>
    </div>
  );
}
