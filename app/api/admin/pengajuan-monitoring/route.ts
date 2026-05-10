import { NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';

const statusMapping: Record<string, string> = {
  'pending': 'Menunggu Verifikasi (Admin)',
  'revisi': 'Perlu Revisi (Dosen)',
  'terverifikasi': 'Terverifikasi',
  'disetujui': 'Disetujui',
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = 5;
    const offset = (page - 1) * limit;

    let whereClause: any = {
      dokumen_pengajuan: {
        some: {},
      },
    };
    if (status && status !== 'semua') {
      const dbStatus = statusMapping[status] || status;
      whereClause.status = {
        nama_status: dbStatus,
      };
    }

    const pengajuanList = await prisma.pengajuanStudi.findMany({
      where: whereClause,
      include: {
        user: {
          include: {
            master_dosen: true,
          },
        },
        jenis_studi: true,
        status: true,
        dokumen_pengajuan: {
          include: {
            master_dokumen: true,
          },
        },
      },
      skip: offset,
      take: limit,
      orderBy: {
        created_at: 'desc',
      },
    });

    const total = await prisma.pengajuanStudi.count({
      where: whereClause,
    });

    const monitoring = pengajuanList.map((p) => {
      const dosen = p.user?.master_dosen;
      const terverifikasi = p.dokumen_pengajuan?.filter(
        (d) => d.status_verifikasi === 'terverifikasi'
      ).length || 0;
      const total = p.dokumen_pengajuan?.length || 0;

      return {
        id: p.id,
        user_id: p.user_id,
        nama_lengkap: dosen?.nama_lengkap || p.user?.username || 'Unknown',
        nip: dosen?.nip || 'N/A',
        jenis_studi: p.jenis_studi?.nama_jenis || 'N/A',
        status: p.status?.nama_status || 'N/A',
        tanggal_pengajuan: p.tanggal_pengajuan?.toISOString().split('T')[0] || '',
        total_dokumen: total,
        dokumen_terverifikasi: terverifikasi,
        alamat_kampus: p.alamat_kampus || '',
      };
    });

    return NextResponse.json(
      {
        data: monitoring,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching pengajuan monitoring:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    );
  }
}