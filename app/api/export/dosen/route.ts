import { prisma } from '@/src/lib/prisma';
import { getStatusLabel } from '@/src/lib/status-utils';
import { exportDosen, type DosenRow } from '@/src/lib/export-excel';
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
        Status: getStatusLabel(u.status_akun as string, 'akun'),
        'Terakhir Update': u.updated_at
          ? new Date(u.updated_at as string).toLocaleDateString('id-ID')
          : '-',
      };
    });

    const buffer = exportDosen(data);

    // Batch insert activity logs instead of individual inserts
    const userIds = users.map(u => u.id as number).filter(Boolean);
    if (userIds.length > 0) {
      await prisma.activityLog.createMany({
        data: userIds.map(userId => ({
          user_id: userId,
          aktivitas: 'Export data dosen ke Excel',
          tipe: 'export_data',
          created_at: new Date(),
          created_by: 'Admin Sistem',
        })),
      });
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
