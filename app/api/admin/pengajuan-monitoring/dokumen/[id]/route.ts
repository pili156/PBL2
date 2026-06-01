import { NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const dokumentId = parseInt(id, 10);

    if (isNaN(dokumentId)) {
      return NextResponse.json(
        { error: 'Invalid document ID' },
        { status: 400 }
      );
    }

    const existingDoc = await prisma.dokumenPengajuan.findUnique({
      where: { id: dokumentId },
    });

    if (!existingDoc) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { status_verifikasi, catatan_revisi } = body;

    const updated = await prisma.dokumenPengajuan.update({
      where: { id: dokumentId },
      data: {
        status_verifikasi,
        catatan_revisi,
        updated_at: new Date(),
      },
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error('Error updating dokumen:', error);
    return NextResponse.json(
      { error: 'Failed to update' },
      { status: 500 }
    );
  }
}
