// app/user/pengajuan/actions.ts
"use server";

import { prisma } from "@/src/lib/prisma";
import { logger } from "@/src/lib/logger";

export async function getKampusDariDatabase() {
  try {
    const data = await prisma.masterPerguruanTinggi.findMany({ 
      orderBy: { nama_pt: "asc" } 
    });
    return data;
  } catch (error) {
    logger.error("Gagal mengambil data kampus:", error);
    return [];
  }
}
export async function getBeasiswaDariDatabase() {
  try {
    const data = await prisma.masterBeasiswa.findMany({ 
      orderBy: { nama_beasiswa: "asc" } 
    });
    return data;
  } catch (error) {
    logger.error("Gagal mengambil data beasiswa:", error);
    return [];
  }
}