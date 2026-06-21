import { prisma } from "@/src/lib/prisma";

export async function getMasterPangkatList() {
  return prisma.masterPangkat.findMany({ orderBy: { golongan: "asc" } });
}

export async function getMasterPangkatById(id: number) {
  return prisma.masterPangkat.findUnique({ where: { id } });
}

export async function createMasterPangkat(data: { pangkat: string; golongan: string }) {
  return prisma.masterPangkat.create({ data });
}

export async function updateMasterPangkat(id: number, data: { pangkat: string; golongan: string }) {
  return prisma.masterPangkat.update({ where: { id }, data });
}

export async function deleteMasterPangkat(id: number) {
  return prisma.masterPangkat.delete({ where: { id } });
}
