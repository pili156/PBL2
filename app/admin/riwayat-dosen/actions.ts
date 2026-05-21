'use server';

import { prisma } from '@/src/lib/prisma';
import { revalidatePath } from 'next/cache';
import { uploadFile, UploadError } from '@/src/lib/file-upload';
import { logActivity } from '@/src/lib/activity-log';

// ── KHS Evaluation ──

export async function acceptKhs(formData: FormData) {
  const khsId = Number(formData.get('khsId'));
  const catatan = formData.get('catatan') as string;
  await evaluateKhs(khsId, 'DITERIMA', catatan);
}

export async function rejectKhs(formData: FormData) {
  const khsId = Number(formData.get('khsId'));
  const catatan = formData.get('catatan') as string;
  await evaluateKhs(khsId, 'DITOLAK', catatan);
}

export async function submitRevisionKhs(formData: FormData) {
  const khsId = Number(formData.get('khsId'));
  const catatan = formData.get('catatan') as string;
  await evaluateKhs(khsId, 'DITERIMA', catatan);
}

async function evaluateKhs(khsId: number, keputusan: 'DITERIMA' | 'DITOLAK', catatan: string) {
  const khs = await prisma.monitoringKhs.findUnique({
    where: { id: khsId },
    include: { pengajuan_studi: { select: { user_id: true } } },
  });

  await prisma.monitoringKhs.update({
    where: { id: khsId },
    data: {
      status_evaluasi: keputusan,
      catatan_evaluasi: catatan,
      tanggal_evaluasi: new Date(),
    },
  });

  revalidatePath('/admin/riwayat-dosen');
  if (khs?.pengajuan_studi?.user_id) {
    const uid = khs.pengajuan_studi.user_id;
    revalidatePath(`/admin/riwayat-dosen/${uid}/khs`);
    revalidatePath(`/admin/riwayat-dosen/${uid}/khs/${khsId}`);
  }
}

// ── Keuangan Evaluation ──

export async function acceptKeuangan(formData: FormData) {
  const id = Number(formData.get('keuanganId'));
  const catatan = formData.get('catatan') as string;
  await evaluateKeuangan(id, 'DICAIRKAN', catatan);
}

export async function rejectKeuangan(formData: FormData) {
  const id = Number(formData.get('keuanganId'));
  const catatan = formData.get('catatan') as string;
  await evaluateKeuangan(id, 'DITOLAK', catatan);
}

async function evaluateKeuangan(keuanganId: number, keputusan: 'DICAIRKAN' | 'DITOLAK', catatan: string) {
  const reimbursement = await prisma.pengajuanReimbursement.findUnique({
    where: { id: keuanganId },
    include: { pengajuan_studi: { select: { user_id: true } } },
  });

  await prisma.pengajuanReimbursement.update({
    where: { id: keuanganId },
    data: {
      status_pencairan: keputusan,
      catatan_keuangan: catatan,
      tanggal_pencairan: keputusan === 'DICAIRKAN' ? new Date() : undefined,
    },
  });

  revalidatePath('/admin/riwayat-dosen');
  if (reimbursement?.pengajuan_studi?.user_id) {
    const uid = reimbursement.pengajuan_studi.user_id;
    revalidatePath(`/admin/riwayat-dosen/${uid}/keuangan`);
    revalidatePath(`/admin/riwayat-dosen/${uid}/keuangan/${keuanganId}`);
  }
}

// ── Manual Input Actions ──

export async function addManualKhs(formData: FormData) {
  const pengajuanId = Number(formData.get('pengajuanId'));
  const idDosen = Number(formData.get('idDosen'));
  const semesterKe = Number(formData.get('semesterKe'));
  const tahunAkademik = formData.get('tahunAkademik') as string;
  const ipk = Number(formData.get('ipk'));
  const sks = Number(formData.get('sks')) || 20;
  const file = formData.get('file') as File | null;

  let filePath: string | undefined;
  if (file && file.size > 0) {
    try {
      const result = await uploadFile(file, idDosen, 'khs');
      filePath = result.filePath;
    } catch (e) {
      if (e instanceof UploadError) throw e;
      throw new Error('Gagal mengupload file KHS');
    }
  }

  const khs = await prisma.monitoringKhs.create({
    data: {
      pengajuan_id: pengajuanId,
      semester_ke: semesterKe,
      tahun_akademik: tahunAkademik,
      ipk: ipk || undefined,
      file_khs_path: filePath,
      tanggal_unggah: new Date(),
      status_evaluasi: 'DITERIMA',
    },
    include: { pengajuan_studi: { select: { user_id: true } } },
  });

  await logActivity(idDosen, pengajuanId, `Upload KHS manual Semester ${semesterKe}`, 'upload_khs');
  await addLog(pengajuanId, `Upload KHS manual Semester ${semesterKe}`, 'manual');

  revalidatePath('/admin/riwayat-dosen');
  if (khs.pengajuan_studi?.user_id) {
    const uid = khs.pengajuan_studi.user_id;
    revalidatePath(`/admin/riwayat-dosen/${uid}/khs`);
  }
}

export async function addManualKeuangan(formData: FormData) {
  const pengajuanId = Number(formData.get('pengajuanId'));
  const idDosen = Number(formData.get('idDosen'));
  const semesterKe = Number(formData.get('semesterKe'));
  const nominal = Number(formData.get('nominal'));
  const bank = formData.get('bank') as string;
  const norek = formData.get('norek') as string;
  const file = formData.get('fileBukti') as File | null;

  let fileBukti: string | undefined;
  if (file && file.size > 0) {
    try {
      const result = await uploadFile(file, idDosen, 'keuangan');
      fileBukti = result.filePath;
    } catch (e) {
      if (e instanceof UploadError) throw e;
      throw new Error('Gagal mengupload file bukti');
    }
  }

  const reimbursement = await prisma.pengajuanReimbursement.create({
    data: {
      pengajuan_id: pengajuanId,
      semester_ke: semesterKe,
      nominal: nominal || undefined,
      file_bukti_bayar: fileBukti,
      nama_bank: bank || undefined,
      nomor_rekening: norek || undefined,
      status_pencairan: 'DICAIRKAN',
      tanggal_pencairan: new Date(),
    },
    include: { pengajuan_studi: { select: { user_id: true } } },
  });

  await logActivity(idDosen, pengajuanId, `Pencairan manual Semester ${semesterKe}: Rp ${nominal.toLocaleString('id-ID')}`, 'pencairan');
  await addLog(pengajuanId, `Pencairan manual Semester ${semesterKe}: Rp ${nominal.toLocaleString('id-ID')}`, 'manual');

  revalidatePath('/admin/riwayat-dosen');
  if (reimbursement.pengajuan_studi?.user_id) {
    const uid = reimbursement.pengajuan_studi.user_id;
    revalidatePath(`/admin/riwayat-dosen/${uid}/keuangan`);
  }
}

export async function addManualLog(formData: FormData) {
  const pengajuanId = Number(formData.get('pengajuanId'));
  const aktivitas = formData.get('aktivitas') as string;
  const keterangan = formData.get('keterangan') as string;

  await addLog(pengajuanId, `${aktivitas}${keterangan ? `: ${keterangan}` : ''}`, 'manual');

  revalidatePath('/admin/riwayat-dosen');
}

export async function addManualDokumen(formData: FormData) {
  const pengajuanId = Number(formData.get('pengajuanId'));
  const idDosen = Number(formData.get('idDosen'));
  const masterDokumenId = Number(formData.get('masterDokumenId'));
  const file = formData.get('file') as File | null;

  if (!file || file.size === 0) {
    throw new Error('File harus dipilih');
  }

  let filePath: string;
  try {
    const result = await uploadFile(file, idDosen, 'dokumen');
    filePath = result.filePath;
  } catch (e) {
    if (e instanceof UploadError) throw e;
    throw new Error('Gagal mengupload file');
  }

  const dokumen = await prisma.dokumenPengajuan.create({
    data: {
      pengajuan_id: pengajuanId,
      master_dokumen_id: masterDokumenId || undefined,
      file_path: filePath,
      status_verifikasi: 'Pending',
    },
    include: { pengajuan_studi: { select: { user_id: true } } },
  });

  await logActivity(idDosen, pengajuanId, 'Upload dokumen baru', 'upload_dokumen');
  await addLog(pengajuanId, 'Upload dokumen baru', 'upload');

  revalidatePath('/admin/riwayat-dosen');
  if (dokumen.pengajuan_studi?.user_id) {
    const uid = dokumen.pengajuan_studi.user_id;
    revalidatePath(`/admin/riwayat-dosen/${uid}/dokumen`);
  }
}

async function addLog(pengajuanId: number, isi: string, tipe: string) {
  await prisma.pesanKomunikasi.create({
    data: {
      pengajuan_id: pengajuanId,
      isi_pesan: `[${tipe.toUpperCase()}] ${isi}`,
      waktu_kirim: new Date(),
    },
  });
}
