import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const categories = await prisma.category.findMany();
  return NextResponse.json(categories);
}

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const category = await prisma.category.create({
      data: { name: json.name },
    });
    return NextResponse.json(category);
  } catch {
    return NextResponse.json({ error: 'Error creating category' }, { status: 500 });
  }
}
