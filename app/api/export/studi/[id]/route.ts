import { prisma } from '@/src/lib/prisma';
import { exportRiwayatStudi, type RiwayatStudiRow } from '@/src/lib/export-excel';
import { logActivity } from '@/src/lib/activity-log';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const idDosen = Number(id);

    const dosen = await prisma.user.findUnique({
      where: { id: idDosen },
      include: {
        master_dosen: true,
        pengajuan_studi: {
          include: { monitoring_khs: true },
        },
      },
    }) as Record<string, unknown> | null;

    if (!dosen) {
      return NextResponse.json({ error: 'Dosen tidak ditemukan' }, { status: 404 });
    }

    const pengajuanStudi = (dosen.pengajuan_studi || []) as Record<string, unknown>[];
    const khsList = pengajuanStudi.flatMap((p: Record<string, unknown>) =>
      (p.monitoring_khs || []) as Record<string, unknown>[]
    );

    const data: RiwayatStudiRow[] = khsList.map((k: Record<string, unknown>, i: number) => ({
      No: i + 1,
      Semester: `Semester ${k.semester_ke || '-'}`,
      'Tahun Akademik': (k.tahun_akademik as string) || '-',
      IPK: k.ipk ? Number(k.ipk as string).toFixed(2) : '-',
      SKS: 20,
      'Tanggal Upload': k.tanggal_unggah
        ? new Date(k.tanggal_unggah as string).toLocaleDateString('id-ID')
        : '-',
    }));

    const buffer = exportRiwayatStudi(data);

    await logActivity(idDosen, null, 'Export riwayat studi ke Excel', 'export_data');

    return new NextResponse(new Blob([Buffer.from(buffer)]), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="riwayat-studi-${idDosen}-${Date.now()}.xlsx"`,
      },
    });
  } catch {
    return NextResponse.json(
      { error: 'Gagal mengexport data' },
      { status: 500 }
    );
  }
}
