import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { logger } from "@/src/lib/logger";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dari = searchParams.get('dari');
    const sampai = searchParams.get('sampai');

    const dateCondition: any = {};
    if (dari || sampai) {
      dateCondition.created_at = {};
      if (dari) dateCondition.created_at.gte = new Date(dari);
      if (sampai) {
        const endDate = new Date(sampai);
        endDate.setHours(23, 59, 59, 999);
        dateCondition.created_at.lte = endDate;
      }
    }

    const rawData = await prisma.pengajuanStudi.findMany({
      where: Object.keys(dateCondition).length > 0 ? dateCondition : {},
      include: {
        user: { include: { master_dosen: true } },
        dokumen_pengajuan: { include: { master_dokumen: true } },
        status: true,
      },
      orderBy: { created_at: "desc" },
    });

    const exportData = rawData.map((p) => ({
      Dosen: p.user?.master_dosen?.nama_lengkap || "Dosen",
      Jenis: p.dokumen_pengajuan?.[0]?.master_dokumen?.nama_dokumen || "Pengajuan",
      Tanggal: p.created_at ? p.created_at.toLocaleDateString("id-ID") : "-",
      Status: p.status?.nama_status || "pending",
    }));

    return NextResponse.json(exportData);
  } catch (error) {
    logger.error("Error fetching export data:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
