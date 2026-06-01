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

    console.log('=== DEBUG UPLOAD ===');
    console.log('pengajuan_id:', id);
    console.log('master_dokumen_id:', master_dokumen_id);
    console.log('pengajuan_reimbursement_id:', pengajuan_reimbursement_id);
    console.log('file:', file?.name, file?.size);

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
      console.error('Pengajuan not found:', parsedPengajuanId);
      return NextResponse.json({ error: 'Pengajuan not found' }, { status: 404 });
    }

    // Check if master_dokumen exists
    const masterDokumen = await prisma.masterDokumen.findUnique({
      where: { id: parsedMasterDokumenId },
    });

    if (!masterDokumen) {
      console.error('Master dokumen not found:', parsedMasterDokumenId);
      return NextResponse.json({ error: 'Master dokumen not found. Please run seed first.' }, { status: 404 });
    }

    console.log('Creating dokumenPengajuan...');
    const parsedReimbursementId = pengajuan_reimbursement_id ? parseInt(pengajuan_reimbursement_id) : null;

    const dokumen = await prisma.dokumenPengajuan.create({
      data: {
        pengajuan_id: parsedPengajuanId,
        master_dokumen_id: parsedMasterDokumenId,
        file_path: relativePath,
        status_verifikasi: 'menunggu',
        pengajuan_reimbursement_id: parsedReimbursementId,
      },
    });

    console.log('Dokumen created:', dokumen);
    return NextResponse.json({ dokumen, filePath: relativePath }, { status: 201 });
  } catch (error) {
    console.error('=== ERROR UPLOAD ===');
    console.error(error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}