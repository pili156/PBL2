import { prisma } from '@/src/lib/prisma';
import { exportDosen, type DosenRow } from '@/src/lib/export-excel';
import { logActivity } from '@/src/lib/activity-log';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      where: { role_id: 3 },
      include: { master_dosen: true },
      orderBy: { username: 'asc' },
    }) as Record<string, unknown>[];

    const data: DosenRow[] = users.map((u: Record<string, unknown>, i: number) => {
      const md = u.master_dosen as Record<string, unknown> | null;
      return {
        No: i + 1,
        Nama: (md?.nama_lengkap as string) || (u.username as string) || '-',
        NIP: (md?.nip as string) || '-',
        Jurusan: (md?.jurusan as string) || '-',
        Status: u.status_akun === 'aktif' ? 'Aktif' : (u.status_akun as string) || '-',
        'Terakhir Update': u.updated_at
          ? new Date(u.updated_at as string).toLocaleDateString('id-ID')
          : '-',
      };
    });

    const buffer = exportDosen(data);

    for (const u of users) {
      await logActivity(u.id as number, null, 'Export data dosen ke Excel', 'export_data');
    }

    return new NextResponse(new Blob([Buffer.from(buffer)]), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="data-dosen-${Date.now()}.xlsx"`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Gagal mengexport data' },
      { status: 500 }
    );
  }
}
