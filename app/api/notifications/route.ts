import { NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { STATUS_DISPLAY } from '@/src/lib/constants/status';

export async function GET(request: Request) {
  const userEmail = request.headers.get('x-user-email');
  const userId = parseInt(request.headers.get('x-user-id') || '0');
  const userRole = request.headers.get('x-user-role');

  if (!userId) {
    return NextResponse.json({ notifications: [] });
  }

  const recent = await prisma.activityLog.findMany({
    where: { user_id: userId },
    orderBy: { created_at: 'desc' },
    take: 5,
  });

  if (recent.length === 0) {
    const pengajuan = await prisma.pengajuanStudi.findFirst({
      where: { user_id: userId },
      orderBy: { updated_at: 'desc' },
      include: { status: true },
    });

    if (!pengajuan) {
      return NextResponse.json({ notifications: [] });
    }

    const statusLabel = STATUS_DISPLAY[pengajuan.status?.nama_status || ''] || pengajuan.status?.nama_status || 'Unknown';

    return NextResponse.json({
      notifications: [{
        id: `status-${pengajuan.id}`,
        message: `Status pengajuan: ${statusLabel}`,
        time: pengajuan.updated_at?.toISOString(),
        read: false,
      }],
    });
  }

  const notifications = recent.map((log) => ({
    id: String(log.id),
    message: log.aktivitas || 'Aktivitas terbaru',
    time: log.created_at?.toISOString(),
    read: false,
  }));

  return NextResponse.json({ notifications });
}
