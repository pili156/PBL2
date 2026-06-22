import { NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { headers } from 'next/headers';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const headersList = await headers();
    const role = headersList.get('x-user-role');
    if (!role || (role !== 'master_admin' && role !== 'admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const pengajuanId = parseInt(id, 10);

    if (isNaN(pengajuanId)) {
      return NextResponse.json({ error: 'Invalid pengajuan ID' }, { status: 400 });
    }

    const pengajuan = await prisma.pengajuanStudi.findUnique({
      where: { id: pengajuanId },
    });

    if (!pengajuan) {
      return NextResponse.json({ error: 'Pengajuan not found' }, { status: 404 });
    }

    const statusDitolak = await prisma.masterStatusPengajuan.findFirst({
      where: { nama_status: 'ditolak' },
    });

    if (!statusDitolak) {
      return NextResponse.json({ error: 'Status ditolak tidak ditemukan di database' }, { status: 500 });
    }

    await prisma.pengajuanStudi.update({
      where: { id: pengajuanId },
      data: { status_id: statusDitolak.id },
    });

    return NextResponse.json({ success: true, message: 'Pengajuan berhasil ditolak' }, { status: 200 });
  } catch (error) {
    console.error('Error rejecting pengajuan:', error);
    return NextResponse.json({ error: 'Failed to reject pengajuan' }, { status: 500 });
  }
}
