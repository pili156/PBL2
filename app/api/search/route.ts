import { NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.trim();

  if (!q || q.length < 1) {
    return NextResponse.json({ results: [] });
  }

  const dosen = await prisma.masterDosen.findMany({
    where: {
      OR: [
        { nama_lengkap: { contains: q, mode: 'insensitive' } },
        { nip: { contains: q, mode: 'insensitive' } },
      ],
    },
    take: 10,
    select: { nip: true, nama_lengkap: true, jurusan: true },
  });

  return NextResponse.json({
    results: dosen.map((d) => ({
      type: 'dosen' as const,
      label: d.nama_lengkap || '',
      subtitle: `NIP: ${d.nip || '-'} | ${d.jurusan || '-'}`,
      href: d.nip ? `/admin/riwayat-dosen/${d.nip}` : undefined,
    })),
  });
}