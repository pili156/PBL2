// app/register/actions.ts
"use server";

import { prisma } from "@/src/lib/prisma";

export async function getJurusanData() {
  try {
    const data = await prisma.masterJurusan.findMany({
      include: {
        program_studi: true,
      },
    });
    return data;
  } catch (error) {
    console.error("Gagal mengambil data jurusan:", error);
    return [];
  }
}

export async function getPangkatData() {
  try {
    const data = await prisma.masterPangkat.findMany({
      orderBy: { golongan: "asc" },
    });
    return data;
  } catch (error) {
    console.error("Gagal mengambil data pangkat:", error);
    return [];
  }
}

export async function getJabatanData() {
  try {
    const data = await prisma.masterJabatan.findMany({
      orderBy: { urutan: "asc" },
    });
    return data;
  } catch (error) {
    console.error("Gagal mengambil data jabatan:", error);
    return [];
  }
}