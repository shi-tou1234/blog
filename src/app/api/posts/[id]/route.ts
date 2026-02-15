import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const postId = parseInt(id);
  
  if (isNaN(postId)) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  }

  const post = await prisma.post.findUnique({
    where: { id: postId },
  });
  
  if (!post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }
  
  return NextResponse.json(post);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const postId = parseInt(id);
  const json = await request.json();
  
  try {
    const post = await prisma.post.update({
      where: { id: postId },
      data: json,
    });
    return NextResponse.json(post);
  } catch {
    return NextResponse.json({ error: 'Error updating post' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const postId = parseInt(id);
  
  try {
    await prisma.post.delete({
      where: { id: postId },
    });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Error deleting post' }, { status: 500 });
  }
}
