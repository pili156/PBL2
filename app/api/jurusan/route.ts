// app/api/jurusan/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { logger } from '@/src/lib/logger';

export async function GET() {
  try {
    // Mengambil semua data jurusan beserta relasi program studinya
    const dataJurusan = await prisma.masterJurusan.findMany({
      include: {
        program_studi: true,
      },
      orderBy: {
        nama_jurusan: 'asc' // Urutkan berdasarkan abjad
      }
    });
    
    return NextResponse.json(dataJurusan, { status: 200 });
  } catch (error) {
    logger.error("Error fetching jurusan:", error);
    return NextResponse.json({ error: "Terjadi kesalahan saat mengambil data jurusan" }, { status: 500 });
  }
}