import { NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { headers } from 'next/headers';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const headersList = await headers();
    const role = headersList.get('x-user-role');
    if (!role || (role !== 'admin_fakultas' && role !== 'master_admin' && role !== 'admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const pengajuanId = parseInt(id);

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const nomorSk = formData.get('nomor_sk') as string | null;
    const statusStudiRaw = formData.get('status_studi') as string | null;
    const statusStudi = statusStudiRaw?.toLowerCase() as 'aktif' | 'belum_ada_sk' | null;
    const statusPengajuan = formData.get('status_pengajuan') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'File tidak ditemukan' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'sk');
    
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const fileName = `sk-${pengajuanId}-${uniqueSuffix}.pdf`;
    const filePath = path.join(uploadDir, fileName);
    
    await writeFile(filePath, buffer);
    
    const publicPath = `/uploads/sk/${fileName}`;

    const existingSk = await prisma.skKementerian.findFirst({
      where: { pengajuan_id: pengajuanId },
    });

    let skData;
    if (existingSk) {
      skData = await prisma.skKementerian.update({
        where: { id: existingSk.id },
        data: {
          file_sk_path: publicPath,
          nomor_sk: nomorSk,
          status_studi: statusStudi,
          tanggal_terbit: new Date(),
        },
      });
    } else {
      skData = await prisma.skKementerian.create({
        data: {
          pengajuan_id: pengajuanId,
          file_sk_path: publicPath,
          nomor_sk: nomorSk,
          status_studi: statusStudi,
          tanggal_terbit: new Date(),
        },
      });
    }

    if (statusPengajuan) {
      const statusMaster = await prisma.masterStatusPengajuan.findFirst({
        where: { nama_status: statusPengajuan },
      });

      if (statusMaster) {
        await prisma.pengajuanStudi.update({
          where: { id: pengajuanId },
          data: { status_id: statusMaster.id },
        });
      }
    }

    return NextResponse.json({ 
      success: true, 
      sk: skData,
      filePath: publicPath 
    }, { status: 200 });

  } catch (error) {
    console.error('Error uploading SK:', error);
    return NextResponse.json({ error: 'Gagal mengupload SK' }, { status: 500 });
  }
}