import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

function makeSalt() {
  return crypto.randomBytes(16).toString('base64');
}

function hashPassword(password: string, salt: string) {
  return crypto.scryptSync(password, salt, 64).toString('base64');
}

function safeEqualBase64(a: string, b: string) {
  const ab = Buffer.from(a, 'base64');
  const bb = Buffer.from(b, 'base64');
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

function toPublicConfig(config: {
  id: number;
  title: string;
  description: string;
  github: string | null;
  email: string | null;
  about: string | null;
  updatedAt: Date;
}) {
  return {
    id: config.id,
    title: config.title,
    description: config.description,
    github: config.github,
    email: config.email,
    about: config.about,
    updatedAt: config.updatedAt,
  };
}

export async function GET() {
  try {
    const fallbackPassword = process.env.ADMIN_PASSWORD || 'admin123';
    let config = await prisma.siteConfig.findFirst();
    if (!config) {
      const salt = makeSalt();
      config = await prisma.siteConfig.create({
        data: {
          title: '我的博客',
          description: '分享知识与生活',
          github: 'https://github.com/your-username',
          email: 'mailto:your-email@example.com',
          adminPasswordSalt: salt,
          adminPasswordHash: hashPassword(fallbackPassword, salt),
        },
      });
    } else if (!config.adminPasswordSalt || !config.adminPasswordHash) {
      const salt = makeSalt();
      config = await prisma.siteConfig.update({
        where: { id: config.id },
        data: {
          adminPasswordSalt: salt,
          adminPasswordHash: hashPassword(fallbackPassword, salt),
        },
      });
    }
    return NextResponse.json(toPublicConfig(config));
  } catch {
    return NextResponse.json({ error: 'Failed to fetch config' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const json = await request.json();
    const {
      title,
      description,
      github,
      email,
      about,
      currentPassword,
      newPassword,
    } = json as {
      title?: string;
      description?: string;
      github?: string;
      email?: string;
      about?: string;
      currentPassword?: string;
      newPassword?: string;
    };

    const config = await prisma.siteConfig.findFirst();
    const fallbackPassword = process.env.ADMIN_PASSWORD || 'admin123';

    let passwordPatch: { adminPasswordSalt?: string; adminPasswordHash?: string } = {};
    const wantsPasswordChange = typeof newPassword === 'string' && newPassword.trim().length > 0;

    if (wantsPasswordChange) {
      const curr = (currentPassword || '').trim();
      const next = newPassword.trim();

      if (next.length < 6) {
        return NextResponse.json({ error: '新密码至少 6 位' }, { status: 400 });
      }

      if (!config) {
        if (curr !== fallbackPassword) {
          return NextResponse.json({ error: '当前密码不正确' }, { status: 400 });
        }
      } else if (config.adminPasswordSalt && config.adminPasswordHash) {
        const ok = safeEqualBase64(
          hashPassword(curr, config.adminPasswordSalt),
          config.adminPasswordHash
        );
        if (!ok) {
          return NextResponse.json({ error: '当前密码不正确' }, { status: 400 });
        }
      } else {
        if (curr !== fallbackPassword) {
          return NextResponse.json({ error: '当前密码不正确' }, { status: 400 });
        }
      }

      const salt = makeSalt();
      passwordPatch = {
        adminPasswordSalt: salt,
        adminPasswordHash: hashPassword(next, salt),
      };
    }

    let updatedConfig;
    if (config) {
      updatedConfig = await prisma.siteConfig.update({
        where: { id: config.id },
        data: { title, description, github, email, about, ...passwordPatch },
      });
    } else {
      const salt = passwordPatch.adminPasswordSalt || makeSalt();
      const hash = passwordPatch.adminPasswordHash || hashPassword(fallbackPassword, salt);
      updatedConfig = await prisma.siteConfig.create({
        data: {
          title,
          description,
          github,
          email,
          about,
          adminPasswordSalt: salt,
          adminPasswordHash: hash,
        },
      });
    }

    return NextResponse.json(toPublicConfig(updatedConfig));
  } catch {
    return NextResponse.json({ error: 'Failed to update config' }, { status: 500 });
  }
}
