'use server';

import { prisma } from '@/src/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function deklarasiStudiSelesai(pengajuanId: number, basePath: string) {
  const status = await prisma.masterStatusPengajuan.findFirst({
    where: { nama_status: 'studi_selesai' },
  });

  if (!status) {
    throw new Error('Status studi_selesai tidak ditemukan di database');
  }

  await prisma.pengajuanStudi.update({
    where: { id: pengajuanId },
    data: { status_id: status.id },
  });

  revalidatePath(`${basePath}/riwayat-dosen`);
}
