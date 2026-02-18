'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Globe, Moon, Search, Sun } from 'lucide-react';

interface HeaderActionsProps {
  searchPlaceholder: string;
  searchLabel: string;
  themeLabel: string;
  languageLabel: string;
}

export default function HeaderActions({
  searchPlaceholder,
  searchLabel,
  themeLabel,
  languageLabel,
}: HeaderActionsProps) {
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [langOpen, setLangOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof document === 'undefined') return 'light';
    const cookie = document.cookie
      .split(';')
      .map((item) => item.trim())
      .find((item) => item.startsWith('theme='));
    const cookieTheme = cookie?.split('=')[1];
    const storedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (cookieTheme === 'dark' || cookieTheme === 'light') return cookieTheme;
    if (storedTheme === 'dark' || storedTheme === 'light') return storedTheme;
    return prefersDark ? 'dark' : 'light';
  });
  const [lang, setLang] = useState<'zh' | 'en'>(() => {
    if (typeof window === 'undefined') return 'zh';
    const cookie = document.cookie
      .split(';')
      .map((item) => item.trim())
      .find((item) => item.startsWith('lang='));
    return cookie?.split('=')[1] === 'en' ? 'en' : 'zh';
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const submitSearch = () => {
    const value = query.trim();
    if (!value) return;
    const params = new URLSearchParams({ q: value });
    router.push(`/?${params.toString()}`);
    setSearchOpen(false);
  };

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('theme', next);
    document.cookie = `theme=${next};path=/;max-age=31536000`;
  };

  const applyLanguage = (next: 'zh' | 'en') => {
    setLang(next);
    document.cookie = `lang=${next};path=/;max-age=31536000`;
    document.documentElement.lang = next === 'en' ? 'en' : 'zh-CN';
    window.location.reload();
  };

  useEffect(() => {
    if (!langOpen && !searchOpen) return;
    const handler = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      if (target.closest('[data-header-actions]')) return;
      setLangOpen(false);
      setSearchOpen(false);
    };
    window.addEventListener('pointerdown', handler);
    return () => window.removeEventListener('pointerdown', handler);
  }, [langOpen, searchOpen]);

  const searchButtonIcon = useMemo(() => {
    return <Search size={18} />;
  }, []);

  return (
    <div className="relative flex items-center gap-3" data-header-actions>
      <button
        type="button"
        onClick={() => setSearchOpen((prev) => !prev)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--muted)] hover:border-[var(--link)] hover:text-[var(--heading)]"
        title={searchLabel}
      >
        {searchButtonIcon}
      </button>
      <button
        type="button"
        onClick={toggleTheme}
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--muted)] hover:border-[var(--link)] hover:text-[var(--heading)]"
        title={themeLabel}
      >
        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
      </button>
      <button
        type="button"
        onClick={() => setLangOpen((prev) => !prev)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--muted)] hover:border-[var(--link)] hover:text-[var(--heading)]"
        title={languageLabel}
      >
        <Globe size={18} />
      </button>
      {searchOpen && (
        <div className="absolute right-0 top-12 z-20 w-64 rounded-xl border border-[var(--border)] bg-[var(--panel)] p-3 shadow-lg">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') submitSearch();
              if (e.key === 'Escape') setSearchOpen(false);
            }}
            placeholder={searchPlaceholder}
            className="h-9 w-full rounded-lg border border-[var(--border)] bg-transparent px-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--link)]"
          />
          <div className="mt-2 flex justify-end">
            <button
              type="button"
              onClick={submitSearch}
              className="rounded-lg bg-[var(--link)] px-3 py-1 text-xs font-medium text-white hover:opacity-90"
            >
              {searchLabel}
            </button>
          </div>
        </div>
      )}
      {langOpen && (
        <div className="absolute right-0 top-12 z-20 w-36 rounded-xl border border-[var(--border)] bg-[var(--panel)] p-2 shadow-lg">
          <button
            type="button"
            onClick={() => applyLanguage('zh')}
            className={`w-full rounded-lg px-3 py-2 text-left text-sm ${
              lang === 'zh' ? 'bg-[var(--border)] text-[var(--heading)]' : 'text-[var(--foreground)]'
            }`}
          >
            中文
          </button>
          <button
            type="button"
            onClick={() => applyLanguage('en')}
            className={`mt-1 w-full rounded-lg px-3 py-2 text-left text-sm ${
              lang === 'en' ? 'bg-[var(--border)] text-[var(--heading)]' : 'text-[var(--foreground)]'
            }`}
          >
            English
          </button>
        </div>
      )}
    </div>
  );
}
