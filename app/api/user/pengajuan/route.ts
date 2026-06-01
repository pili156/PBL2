import { NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { headers } from 'next/headers';

export async function GET() {
  try {
    const headersList = await headers();
    const userId = parseInt(headersList.get('x-user-id') || '0');

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized', redirect: '/login' }, { status: 401 });
    }

    const pengajuan = await prisma.pengajuanStudi.findFirst({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
      include: {
        jenis_studi: true,
        jalur_pendanaan: true,
        wilayah: true,
        status: true,
        dokumen_pengajuan: {
          include: {
            master_dokumen: true,
          },
        },
        sk_kementerian: true,
      },
    });

    console.log('[API] Pengajuan found:', pengajuan ? pengajuan.id : 'null');

    if (!pengajuan) {
      return NextResponse.json({ message: 'Belum ada pengajuan', exists: false }, { status: 404 });
    }

    const result = {
      id: pengajuan.id,
      jenis_studi: pengajuan.jenis_studi?.nama_jenis || null,
      jalur_pendanaan: pengajuan.jalur_pendanaan?.nama_pendanaan || null,
      wilayah_studi: pengajuan.wilayah?.nama_wilayah || null,
      status: pengajuan.status?.nama_status || 'Unknown',
      status_id: pengajuan.status_id,
      tanggal_pengajuan: pengajuan.tanggal_pengajuan?.toISOString().split('T')[0] || '',
      created_at: pengajuan.created_at?.toISOString() || '',
      dokumen: pengajuan.dokumen_pengajuan.map((d) => ({
        id: d.id,
        nama_dokumen: d.master_dokumen?.nama_dokumen || 'Unknown',
        file_path: d.file_path || null,
        status_verifikasi: d.status_verifikasi || 'pending',
        catatan_revisi: d.catatan_revisi || null,
      })),
      sk: pengajuan.sk_kementerian && pengajuan.sk_kementerian.length > 0 ? {
        id: pengajuan.sk_kementerian[0].id,
        nomor_sk: pengajuan.sk_kementerian[0].nomor_sk || null,
        file_sk_path: pengajuan.sk_kementerian[0].file_sk_path || null,
        tanggal_terbit: pengajuan.sk_kementerian[0].tanggal_terbit?.toISOString().split('T')[0] || null,
        status_studi: pengajuan.sk_kementerian[0].status_studi || null,
      } : null,
    };

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('[API] Error fetching user pengajuan:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const headersList = await headers();
    const userId = parseInt(headersList.get('x-user-id') || '0');

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const pengajuan = await prisma.pengajuanStudi.findFirst({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
    });

    if (!pengajuan) {
      return NextResponse.json({ message: 'Tidak ada pengajuan untuk dihapus' }, { status: 200 });
    }

    await prisma.dokumenPengajuan.deleteMany({
      where: { pengajuan_id: pengajuan.id },
    });

    await prisma.skKementerian.deleteMany({
      where: { pengajuan_id: pengajuan.id },
    });

    await prisma.pengajuanStudi.delete({
      where: { id: pengajuan.id },
    });

    return NextResponse.json({ message: 'Pengajuan berhasil dihapus' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting pengajuan:', error);
    return NextResponse.json({ error: 'Failed to delete pengajuan' }, { status: 500 });
  }
}