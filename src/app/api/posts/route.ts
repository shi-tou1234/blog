import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(posts);
}

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const { title, content, slug, coverImage, published, categoryId } = json;

    const post = await prisma.post.create({
      data: {
        title,
        content,
        slug,
        coverImage,
        published: published || false,
        categoryId: categoryId || null,
      },
    });

    return NextResponse.json(post);
  } catch {
    return NextResponse.json({ error: 'Error creating post' }, { status: 500 });
  }
}
