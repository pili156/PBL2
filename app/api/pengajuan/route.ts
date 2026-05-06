import { NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const userEmail = cookieStore.get('user_email')?.value;

    console.log('=== DEBUG CREATE PENGajuan ===');
    console.log('userEmail:', userEmail);

    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized - No cookie' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      console.log('User not found for email:', userEmail);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.log('User found:', user.id, user.username);

    const body = await request.json();
    const { jenis_studi_id, jalur_pendanaan_id, wilayah_studi, alamat_kampus } = body;

    console.log('Input:', { jenis_studi_id, jalur_pendanaan_id, wilayah_studi, alamat_kampus });

    let statusMenunggu = await prisma.masterStatusPengajuan.findFirst({
      where: { nama_status: 'menunggu' },
    });

    console.log('Status menunggu:', statusMenunggu);

    if (!statusMenunggu) {
      console.warn('Status menunggu not found in master_status_pengajuan, creating default entry');
      statusMenunggu = await prisma.masterStatusPengajuan.create({
        data: { nama_status: 'menunggu' },
      });
      console.log('Created default status menunggu:', statusMenunggu);
    }

    const pengajuan = await prisma.pengajuanStudi.create({
      data: {
        user_id: user.id,
        jenis_studi_id: jenis_studi_id || null,
        jalur_pendanaan_id: jalur_pendanaan_id || null,
        wilayah_studi: wilayah_studi || null,
        alamat_kampus: alamat_kampus || null,
        status_id: statusMenunggu.id,
        tanggal_pengajuan: new Date(),
      },
    });

    console.log('Pengajuan created:', pengajuan.id);
    return NextResponse.json({ pengajuan }, { status: 201 });
  } catch (error) {
    console.error('=== ERROR CREATE PENGajuan ===');
    console.error(error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}