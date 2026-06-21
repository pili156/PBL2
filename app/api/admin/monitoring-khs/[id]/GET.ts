import { NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';

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
    console.error('Error fetching KHS:', error);
    return NextResponse.json(
      { error: 'Failed to fetch KHS' },
      { status: 500 }
    );
  }
}
