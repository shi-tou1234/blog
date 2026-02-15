import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import fs from 'fs';

export async function POST(request: Request) {
  const data = await request.formData();
  const file: File | null = data.get('file') as unknown as File;

  if (!file) {
    return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Generate unique filename to avoid collision
  const timestamp = Date.now();
  const filename = `${timestamp}-${file.name.replace(/\s/g, '_')}`;
  const uploadDir = path.join(process.cwd(), 'public/uploads');
  
  try {
      if (!fs.existsSync(uploadDir)){
          fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      const filepath = path.join(uploadDir, filename);
      await writeFile(filepath, buffer);
      
      return NextResponse.json({ success: true, url: `/uploads/${filename}` });
  } catch (e) {
      console.error(e);
      return NextResponse.json({ success: false, error: 'Upload failed' }, { status: 500 });
  }
}
