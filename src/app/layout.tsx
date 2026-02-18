import type { Metadata } from "next";
import Link from 'next/link';
import { cookies } from 'next/headers';
import { Noto_Serif_SC } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { Toaster } from 'react-hot-toast';
import { prisma } from '@/lib/prisma';

const notoSerif = Noto_Serif_SC({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "记录生活",
  description: "一些文字与时光的回声",
};

export const revalidate = 10;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const lang = cookieStore.get('lang')?.value === 'en' ? 'en' : 'zh';
  const theme = cookieStore.get('theme')?.value === 'dark' ? 'dark' : 'light';
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
  const currentYear = new Date().getFullYear();
  const footerLabel = lang === 'en' ? 'All rights reserved' : '保留所有权利';
  return (
    <html lang={lang === 'en' ? 'en' : 'zh-CN'} data-theme={theme}>
      <body className={notoSerif.className}>
        <div className="min-h-screen bg-[var(--background)]">
          <Sidebar />
          <main className="mx-auto w-full max-w-[var(--page-width)] px-6 pb-16 pt-10 flow-in">
            {children}
          </main>
          <footer className="mx-auto w-full max-w-[var(--header-width)] px-6 pb-12 pt-6 text-sm text-[var(--footer-text-color)]">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                © 2024 - {currentYear}{' '}
                <Link href="/" className="link-line">
                  {config.title}
                </Link>
                . {footerLabel}
              </div>
            </div>
          </footer>
        </div>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
