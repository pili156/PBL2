import { NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';

export async function GET() {
  try {
    const [jenisStudi, jalurPendanaan, wilayah, masterDokumen, masterJabatan, masterPangkat] = await Promise.all([
      prisma.masterJenisStudi.findMany(),
      prisma.masterJalurPendanaan.findMany(),
      prisma.masterWilayah.findMany(),
      prisma.masterDokumen.findMany(),
      prisma.masterJabatan.findMany({ orderBy: { urutan: 'asc' } }),
      prisma.masterPangkat.findMany({ orderBy: { golongan: 'asc' } }),
    ]);

    return NextResponse.json({
      jenisStudi,
      jalurPendanaan,
      wilayah,
      masterDokumen,
      masterJabatan,
      masterPangkat,
    });
  } catch (error) {
    console.error('Error fetching master data:', error);
    return NextResponse.json({ error: 'Failed to fetch master data' }, { status: 500 });
  }
}