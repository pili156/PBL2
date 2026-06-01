import { prisma } from '@/src/lib/prisma';
import { exportRiwayatKeuangan, type RiwayatKeuanganRow } from '@/src/lib/export-excel';
import { logActivity } from '@/src/lib/activity-log';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const formatDate = (d: string | null | undefined) =>
  d ? new Date(d).toLocaleDateString('id-ID') : '-';

const formatRupiah = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const idDosen = Number(id);

    const keuanganList = await prisma.pengajuanReimbursement.findMany({
      where: { pengajuan_studi: { user_id: idDosen } },
      orderBy: { created_at: 'asc' },
    }) as Record<string, unknown>[];

    const statusLabel = (s: string | null | undefined) => {
      const up = s?.toUpperCase() || 'PENDING';
      if (up === 'DICAIRKAN' || up === 'SELESAI') return 'Dicairkan';
      if (up === 'DITOLAK') return 'Ditolak';
      if (up === 'DIPROSES') return 'Diproses';
      return 'Menunggu';
    };

    const data: RiwayatKeuanganRow[] = keuanganList.map((k: Record<string, unknown>, i: number) => ({
      No: i + 1,
      Semester: `Semester ${k.semester_ke || '-'}`,
      Nominal: k.nominal ? formatRupiah(Number(k.nominal)) : 'Rp 0',
      'Tanggal Pengajuan': formatDate(k.created_at as string | null),
      'Tanggal Cair': formatDate(k.tanggal_pencairan as string | null),
      Status: statusLabel(k.status_pencairan as string | null),
    }));

    const buffer = exportRiwayatKeuangan(data);

    await logActivity(idDosen, null, 'Export riwayat keuangan ke Excel', 'export_data');

    return new NextResponse(new Blob([Buffer.from(buffer)]), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="riwayat-keuangan-${idDosen}-${Date.now()}.xlsx"`,
      },
    });
  } catch {
    return NextResponse.json(
      { error: 'Gagal mengexport data' },
      { status: 500 }
    );
  }
}
