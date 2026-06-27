// app/register/actions.ts
"use server";

import { prisma } from "@/src/lib/prisma";
import { logger } from '@/src/lib/logger';

export async function getJurusanData() {
  try {
    const data = await prisma.masterJurusan.findMany({
      include: {
        program_studi: true,
      },
    });
    return data;
  } catch (error) {
    logger.error("Gagal mengambil data jurusan:", error);
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
    logger.error("Gagal mengambil data pangkat:", error);
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
    logger.error("Gagal mengambil data jabatan:", error);
    return [];
  }
}

export async function getProvinsiData() {
  try {
    const data = await prisma.masterProvinsi.findMany({
      orderBy: { nama: "asc" },
    });
    return data;
  } catch (error) {
    logger.error("Gagal mengambil data provinsi:", error);
    return [];
  }
}

export async function getKotaData(provinsiId?: number) {
  try {
    if (!provinsiId) return [];
    const data = await prisma.masterKabupatenKota.findMany({
      where: { provinsi_id: provinsiId },
      orderBy: { nama: "asc" },
    });
    return data;
  } catch (error) {
    logger.error("Gagal mengambil data kota/kabupaten:", error);
    return [];
  }
}