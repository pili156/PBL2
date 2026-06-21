// app/register/actions.ts
"use server";

import { prisma } from "@/src/lib/prisma";

export async function getJurusanData() {
  try {
    const dataJurusan = await prisma.masterJurusan.findMany({
      include: {
        program_studi: true,
      },
      orderBy: {
        nama_jurusan: 'asc' // Urutkan berdasarkan abjad
      }
    });
    
    // PENTING: Konversi hasil Prisma menjadi JSON murni
    // Server Action tidak bisa mengirim objek Date bawaan Prisma ke Client Component
    return JSON.parse(JSON.stringify(dataJurusan));
  } catch (error) {
    console.error("Error fetching jurusan:", error);
    return [];
  }
}