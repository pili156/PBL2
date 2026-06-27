import { prisma } from './prisma';
import { logger } from './logger';

export type LogTipe =
  | 'upload_khs'
  | 'upload_keuangan'
  | 'upload_dokumen'
  | 'edit_data'
  | 'verifikasi'
  | 'pencairan'
  | 'generate_surat'
  | 'export_data'
  | 'manual';

export async function logActivity(
  userId: number | null | undefined,
  pengajuanId: number | null | undefined,
  aktivitas: string,
  tipe: LogTipe,
  createdBy: string = 'Admin Sistem'
): Promise<void> {
  try {
    await prisma.activityLog.create({
      data: {
        user_id: userId ?? undefined,
        pengajuan_id: pengajuanId ?? undefined,
        aktivitas,
        tipe,
        created_at: new Date(),
        created_by: createdBy,
      },
    });
  } catch {
    // Fallback ke pesan_komunikasi jika tabel activity_logs belum tersedia
    try {
      if (pengajuanId) {
        await prisma.pesanKomunikasi.create({
          data: {
            pengajuan_id: pengajuanId,
            isi_pesan: `[${tipe.toUpperCase()}] ${aktivitas}`,
            waktu_kirim: new Date(),
          },
        });
      }
    } catch {
      logger.error('Gagal mencatat aktivitas');
    }
  }
}
