import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const categoryId = parseInt(id);

  try {
    await prisma.category.delete({
      where: { id: categoryId },
    });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Error deleting category' }, { status: 500 });
  }
}
