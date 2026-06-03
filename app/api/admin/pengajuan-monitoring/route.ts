import { NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { headers } from 'next/headers';

const statusMapping: Record<string, string> = {
  'pending': 'Pending',
  'revisi': 'Revisi',
  'terverifikasi': 'Terverifikasi',
};

const determinePengajuanStatus = (dokumen: any[]): string => {
  if (!dokumen || dokumen.length === 0) return 'Pending';
  
  const allTerverifikasi = dokumen.every((d) => d.status_verifikasi === 'terverifikasi');
  const hasRevisi = dokumen.some((d) => d.status_verifikasi === 'revisi');
  const allPending = dokumen.every((d) => d.status_verifikasi === 'pending');
  
  if (allTerverifikasi) return 'Terverifikasi';
  if (hasRevisi) return 'Revisi';
  if (allPending) return 'Pending';
  return 'Pending';
};

export async function GET(request: Request) {
  try {
    const headersList = await headers();
    const role = headersList.get('x-user-role');
    if (!role || (role !== 'admin_fakultas' && role !== 'master_admin' && role !== 'admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

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
      const dokumen = p.dokumen_pengajuan || [];
      const terverifikasi = dokumen.filter(
        (d) => d.status_verifikasi === 'terverifikasi'
      ).length || 0;
      const total = dokumen.length || 0;
      
      const calculatedStatus = determinePengajuanStatus(dokumen);

      return {
        id: p.id,
        user_id: p.user_id,
        nama_lengkap: dosen?.nama_lengkap || p.user?.username || 'Unknown',
        nip: dosen?.nip || 'N/A',
        jenis_studi: p.jenis_studi?.nama_jenis || 'N/A',
        status: calculatedStatus,
        tanggal_pengajuan: p.tanggal_pengajuan?.toISOString().split('T')[0] || '',
        total_dokumen: total,
        dokumen_terverifikasi: terverifikasi,
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