import { SignJWT } from 'jose';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

function hashPassword(password: string, salt: string) {
  return crypto.scryptSync(password, salt, 64).toString('base64');
}

function safeEqualBase64(a: string, b: string) {
  const ab = Buffer.from(a, 'base64');
  const bb = Buffer.from(b, 'base64');
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

export async function POST(request: Request) {
  const { password } = await request.json();
  const fallbackPassword = process.env.ADMIN_PASSWORD || 'admin123';

  const config = await prisma.siteConfig.findFirst({
    select: { adminPasswordSalt: true, adminPasswordHash: true },
  });

  const hasStored =
    !!config?.adminPasswordSalt && !!config?.adminPasswordHash;

  const ok = hasStored
    ? safeEqualBase64(hashPassword(password, config!.adminPasswordSalt!), config!.adminPasswordHash!)
    : password === fallbackPassword;

  if (ok) {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'default-secret-key');
    const token = await new SignJWT({ role: 'admin' })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('24h')
      .sign(secret);

    const response = NextResponse.json({ success: true });
    
    response.cookies.set({
      name: 'admin_token',
      value: token,
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 1 day
    });

    return response;
  }

  return NextResponse.json({ success: false }, { status: 401 });
}
