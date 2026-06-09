import { NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const formData = await request.formData();
    
    const master_dokumen_id = formData.get('master_dokumen_id') as string;
    const file = formData.get('file') as File;
    const pengajuan_reimbursement_id = formData.get('pengajuan_reimbursement_id') as string;

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

    const fileName = `${master_dokumen_id}_${Date.now()}.pdf`;
    const filePath = join(uploadDir, fileName);
    await writeFile(filePath, buffer);

    const relativePath = `/uploads/dokumen/${id}/${fileName}`;

    const parsedPengajuanId = parseInt(id);
    const parsedMasterDokumenId = parseInt(master_dokumen_id);

    // Check if pengajuan exists
    const pengajuan = await prisma.pengajuanStudi.findUnique({
      where: { id: parsedPengajuanId },
    });

    if (!pengajuan) {
      return NextResponse.json({ error: 'Pengajuan not found' }, { status: 404 });
    }

    const masterDokumen = await prisma.masterDokumen.findUnique({
      where: { id: parsedMasterDokumenId },
    });

    if (!masterDokumen) {
      return NextResponse.json({ error: 'Master dokumen not found. Please run seed first.' }, { status: 404 });
    }
    const parsedReimbursementId = pengajuan_reimbursement_id ? parseInt(pengajuan_reimbursement_id) : null;

    const dokumen = await prisma.dokumenPengajuan.create({
      data: {
        pengajuan_id: parsedPengajuanId,
        master_dokumen_id: parsedMasterDokumenId,
        file_path: relativePath,
        status_verifikasi: 'pending',
        pengajuan_reimbursement_id: parsedReimbursementId,
      },
    });

    return NextResponse.json({ dokumen, filePath: relativePath }, { status: 201 });
  } catch (error) {
    console.error('=== ERROR UPLOAD ===', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}