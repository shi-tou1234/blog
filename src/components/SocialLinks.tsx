'use client';

import { Github, Mail } from 'lucide-react';
import toast from 'react-hot-toast';

interface SocialLinksProps {
  github?: string | null;
  email?: string | null;
}

export default function SocialLinks({ github, email }: SocialLinksProps) {
  const handleCopyEmail = (e: React.MouseEvent) => {
    e.preventDefault();
    if (email) {
      const emailAddress = email.replace(/^mailto:/, '');
      navigator.clipboard.writeText(emailAddress)
        .then(() => toast.success('邮箱已复制到剪贴板'))
        .catch(() => toast.error('复制失败'));
    }
  };

  return (
    <div className="flex items-center gap-4 text-[var(--muted)]">
      {github && (
        <a 
          href={github} 
          target="_blank" 
          rel="noopener noreferrer"
          className="transition-all hover:text-[var(--link)] hover:-translate-y-0.5"
          title="GitHub"
        >
          <Github size={20} />
        </a>
      )}

      {email && (
        <button
          onClick={handleCopyEmail}
          className="transition-all hover:text-[var(--link)] hover:-translate-y-0.5"
          title="点击复制邮箱"
        >
          <Mail size={20} />
        </button>
      )}
    </div>
  );
}
