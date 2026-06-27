import { NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { headers } from 'next/headers';
import { logger } from '@/src/lib/logger';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const khsId = parseInt(id, 10);

    if (isNaN(khsId)) {
      return NextResponse.json(
        { error: 'Invalid KHS ID' },
        { status: 400 }
      );
    }

    const khs = await prisma.monitoringKhs.findUnique({
      where: { id: khsId },
      include: {
        pengajuan_studi: {
          include: {
            user: { include: { master_dosen: true } },
          },
        },
      },
    });

    if (!khs) {
      return NextResponse.json(
        { error: 'KHS not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(khs, { status: 200 });
  } catch (error) {
    logger.error('Error fetching KHS:', error);
    return NextResponse.json(
      { error: 'Failed to fetch KHS' },
      { status: 500 }
    );
  }
}

export async function PUT(
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
    const khsId = parseInt(id, 10);

    if (isNaN(khsId)) {
      return NextResponse.json(
        { error: 'Invalid KHS ID' },
        { status: 400 }
      );
    }

    const existingKhs = await prisma.monitoringKhs.findUnique({
      where: { id: khsId },
    });

    if (!existingKhs) {
      return NextResponse.json(
        { error: 'KHS not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { status_evaluasi, catatan_evaluasi } = body;

    const updated = await prisma.monitoringKhs.update({
      where: { id: khsId },
      data: {
        status_evaluasi,
        catatan_evaluasi,
        tanggal_evaluasi: new Date(),
        updated_at: new Date(),
      },
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    logger.error('Error updating KHS:', error);
    return NextResponse.json(
      { error: 'Failed to update KHS' },
      { status: 500 }
    );
  }
}
