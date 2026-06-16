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
    return dataJurusan;
  } catch (error) {
    console.error("Error fetching jurusan:", error);
    return [];
  }
}