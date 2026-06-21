import { prisma } from "@/src/lib/prisma";

export async function getMasterJabatanList() {
  return prisma.masterJabatan.findMany({ orderBy: { urutan: "asc" } });
}

export async function getMasterJabatanById(id: number) {
  return prisma.masterJabatan.findUnique({ where: { id } });
}

export async function createMasterJabatan(data: { nama: string; singkatan: string; urutan: number }) {
  return prisma.masterJabatan.create({ data });
}

export async function updateMasterJabatan(id: number, data: { nama: string; singkatan: string; urutan: number }) {
  return prisma.masterJabatan.update({ where: { id }, data });
}

export async function deleteMasterJabatan(id: number) {
  return prisma.masterJabatan.delete({ where: { id } });
}
