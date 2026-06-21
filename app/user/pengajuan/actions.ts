// app/user/pengajuan/actions.ts
"use server";

import { prisma } from "@/src/lib/prisma";

export async function getKampusDariDatabase() {
  try {
    const data = await prisma.masterPerguruanTinggi.findMany({ 
      orderBy: { nama_pt: "asc" } 
    });
    return JSON.parse(JSON.stringify(data));
  } catch (error) {
    console.error("Gagal mengambil data kampus:", error);
    return [];
  }
}