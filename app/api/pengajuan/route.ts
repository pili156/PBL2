import { NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { headers } from 'next/headers';

export async function POST(request: Request) {
  try {
    const headersList = await headers();
    const userId = parseInt(headersList.get('x-user-id') || '0');

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { jenis_studi_id, jalur_pendanaan_id, wilayah_studi, perguruan_tinggi } = body;

    console.log('[API] Input received:', { jenis_studi_id, jalur_pendanaan_id, wilayah_studi, perguruan_tinggi });
    console.log('[API] jalur_pendanaan_id type:', typeof jalur_pendanaan_id, 'value:', jalur_pendanaan_id);

    let statusMenunggu = await prisma.masterStatusPengajuan.findFirst({
      where: { nama_status: 'Menunggu Verifikasi (Admin)' },
    });

    console.log('Status menunggu:', statusMenunggu);

    if (!statusMenunggu) {
      statusMenunggu = await prisma.masterStatusPengajuan.findFirst({
        where: { nama_status: { contains: 'Menunggu' } },
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
      });
      return NextResponse.json({ 
        pengajuan: existingPengajuan, 
        message: 'Menggunakan pengajuan yang sudah ada' 
      }, { status: 200 });
    }

    const pengajuan = await prisma.pengajuanStudi.create({
      data: {
        user_id: userId,
        jenis_studi_id: jenis_studi_id || null,
        jalur_pendanaan_id: jalur_pendanaan_id || null,
        wilayah_studi: wilayah_studi || null,
        perguruan_tinggi: perguruan_tinggi || null,
        status_id: statusMenunggu.id,
        tanggal_pengajuan: new Date(),
      },
    });

    console.log('Pengajuan created:', pengajuan.id);
    return NextResponse.json({ pengajuan }, { status: 201 });
  } catch (error: any) {
    console.error('=== ERROR CREATE PENGajuan ===');
    console.error(error);
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Data sudah ada. ID mungkin bermasalah.' },
        { status: 409 }
      );
    }
    
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}