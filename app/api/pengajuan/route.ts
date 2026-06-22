import { NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { headers } from 'next/headers';
import { pengajuanSchema } from '@/src/lib/validation';

export async function POST(request: Request) {
  try {
    const headersList = await headers();
    const userId = parseInt(headersList.get('x-user-id') || '0');

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = pengajuanSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { jenis_studi_id, jalur_pendanaan_id, wilayah_studi, perguruan_tinggi, nama_beasiswa } = parsed.data;

    // Try to locate a suitable "waiting" status in master data.
    // Seed uses snake_case ('menunggu_verifikasi'), so search for common variants
    // and fall back to a case-insensitive contains match for 'menunggu'.
    let statusMenunggu = await prisma.masterStatusPengajuan.findFirst({
      where: { nama_status: 'menunggu_verifikasi' },
    });

    if (!statusMenunggu) {
      statusMenunggu = await prisma.masterStatusPengajuan.findFirst({
        where: {
          OR: [
            { nama_status: { equals: 'menunggu_verifikasi', mode: 'insensitive' } },
            { nama_status: { contains: 'menunggu', mode: 'insensitive' } },
            { nama_status: { contains: 'menunggu_verifikasi', mode: 'insensitive' } },
          ],
        },
      });
    }

    if (!statusMenunggu) {
      return NextResponse.json(
        { error: 'Status pengajuan tidak ditemukan. Silakan run seed database.' }, 
        { status: 500 }
      );
    }

    const pengajuanCount = await prisma.pengajuanStudi.count({
      where: { user_id: userId },
    });

    if (pengajuanCount > 0) {
      const existingPengajuan = await prisma.pengajuanStudi.findFirst({
        where: { user_id: userId },
        orderBy: { created_at: 'desc' },
        include: { status: true },
      });

      // Jika pengajuan lama ditolak, buat pengajuan baru
      if (existingPengajuan?.status?.nama_status === 'ditolak') {
        const pengajuan = await prisma.pengajuanStudi.create({
          data: {
            user_id: userId,
            jenis_studi_id: jenis_studi_id ?? null,
            jalur_pendanaan_id: jalur_pendanaan_id ?? null,
            wilayah_studi: wilayah_studi ?? null,
            perguruan_tinggi: perguruan_tinggi ?? null,
            nama_beasiswa: nama_beasiswa ?? null,
            status_id: statusMenunggu.id,
            tanggal_pengajuan: new Date(),
          },
        });
        return NextResponse.json({ pengajuan }, { status: 201 });
      }

      return NextResponse.json({ 
        pengajuan: existingPengajuan, 
        message: 'Menggunakan pengajuan yang sudah ada' 
      }, { status: 200 });
    }

    const pengajuan = await prisma.pengajuanStudi.create({
      data: {
        user_id: userId,
        jenis_studi_id: jenis_studi_id ?? null,
        jalur_pendanaan_id: jalur_pendanaan_id ?? null,
        wilayah_studi: wilayah_studi ?? null,
        perguruan_tinggi: perguruan_tinggi ?? null,
        nama_beasiswa: nama_beasiswa ?? null,
        status_id: statusMenunggu.id,
        tanggal_pengajuan: new Date(),
      },
    });

    return NextResponse.json({ pengajuan }, { status: 201 });
  } catch (error: any) {
    console.error('=== ERROR CREATE PENGAJUAN ===', error);
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Data sudah ada. ID mungkin bermasalah.' },
        { status: 409 }
      );
    }
    
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}