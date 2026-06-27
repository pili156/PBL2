'use server';

import { prisma } from '@/src/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function deklarasiStudiSelesai(pengajuanId: number, basePath: string) {
  const status = await prisma.masterStatusPengajuan.findFirst({
    where: { nama_status: 'lulus' },
  });

  if (!status) {
    throw new Error('Status lulus tidak ditemukan di database');
  }

  await prisma.pengajuanStudi.update({
    where: { id: pengajuanId },
    data: { status_id: status.id },
  });

  const pengajuan = await prisma.pengajuanStudi.findUnique({
    where: { id: pengajuanId },
    select: { user_id: true },
  });

  if (pengajuan?.user_id) {
    const user = await prisma.user.findUnique({
      where: { id: pengajuan.user_id },
      select: { master_dosen: true },
    });

    if (user?.master_dosen) {
      const dosen = user.master_dosen;
      const namaSekarang = dosen.nama_lengkap || '';
      const gelarSekarang = dosen.gelar || '';
      
      const sudahPunyaDr = namaSekarang.startsWith('Dr.') || gelarSekarang.startsWith('Dr.');
      const namaBaru = sudahPunyaDr ? namaSekarang : `Dr. ${namaSekarang}`;
      const gelarBaru = sudahPunyaDr ? gelarSekarang : (gelarSekarang ? `Dr. ${gelarSekarang}` : 'Dr.');

      await prisma.masterDosen.update({
        where: { id: dosen.id },
        data: {
          pendidikan_terakhir: 'S3',
          nama_lengkap: namaBaru,
          gelar: gelarBaru,
          tanggal_lulus: new Date(),
        },
      });
    }
  }

  revalidatePath(`${basePath}/riwayat-dosen`);
}
