import { NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; dokumenId: string }> }
) {
  try {
    const { id, dokumenId } = await params;
    const parsedDokumenId = parseInt(dokumenId, 10);
    const parsedPengajuanId = parseInt(id, 10);

    if (isNaN(parsedDokumenId) || isNaN(parsedPengajuanId)) {
      return NextResponse.json({ error: 'ID tidak valid' }, { status: 400 });
    }

    const existingDoc = await prisma.dokumenPengajuan.findUnique({
      where: { id: parsedDokumenId },
    });

    if (!existingDoc) {
      return NextResponse.json({ error: 'Dokumen tidak ditemukan' }, { status: 404 });
    }

    if (existingDoc.pengajuan_id !== parsedPengajuanId) {
      return NextResponse.json({ error: 'Dokumen bukan milik pengajuan ini' }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 });
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Only PDF files are allowed' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = join(process.cwd(), 'public', 'uploads', 'dokumen', id);
    await mkdir(uploadDir, { recursive: true });

    const fileName = `${existingDoc.master_dokumen_id}_${Date.now()}.pdf`;
    const filePath = join(uploadDir, fileName);
    await writeFile(filePath, buffer);

    const relativePath = `/uploads/dokumen/${id}/${fileName}`;

    // Delete old file if exists
    if (existingDoc.file_path) {
      const oldFilePath = join(process.cwd(), 'public', existingDoc.file_path);
      if (existsSync(oldFilePath)) {
        await unlink(oldFilePath).catch(() => {});
      }
    }

    const updated = await prisma.dokumenPengajuan.update({
      where: { id: parsedDokumenId },
      data: {
        file_path: relativePath,
        status_verifikasi: 'menunggu',
        catatan_revisi: null,
        updated_at: new Date(),
      },
    });

    return NextResponse.json({ dokumen: updated, filePath: relativePath }, { status: 200 });
  } catch (error) {
    console.error('Error updating dokumen file:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
