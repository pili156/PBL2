'use server';

import { prisma } from '@/src/lib/prisma';
import { revalidatePath } from 'next/cache';
import { uploadFile, UploadError } from '@/src/lib/file-upload';
import { logActivity } from '@/src/lib/activity-log';

// ── KHS Evaluation ──

export async function acceptKhs(formData: FormData) {
  const khsId = Number(formData.get('khsId'));
  const catatan = formData.get('catatan') as string;
  await evaluateKhs(khsId, 'diterima', catatan);
}

export async function rejectKhs(formData: FormData) {
  const khsId = Number(formData.get('khsId'));
  const catatan = formData.get('catatan') as string;
  await evaluateKhs(khsId, 'ditolak', catatan);
}

export async function submitRevisionKhs(formData: FormData) {
  const khsId = Number(formData.get('khsId'));
  const catatan = formData.get('catatan') as string;
  await evaluateKhs(khsId, 'diterima', catatan);
}

async function evaluateKhs(khsId: number, keputusan: 'diterima' | 'ditolak', catatan: string) {
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

  const reimbursement = await prisma.pengajuanReimbursement.findUnique({
    where: { id },
    select: { file_bukti_bayar: true },
  });

  if (!reimbursement?.file_bukti_bayar) {
    throw new Error('Upload bukti transfer terlebih dahulu sebelum menyetujui pencairan');
  }

  await evaluateKeuangan(id, 'dicairkan', catatan);
}

export async function rejectKeuangan(formData: FormData) {
  const id = Number(formData.get('keuanganId'));
  const catatan = formData.get('catatan') as string;
  await evaluateKeuangan(id, 'ditolak', catatan);
}

export async function uploadBuktiTransfer(formData: FormData) {
  const keuanganId = Number(formData.get('keuanganId'));
  const idDosen = Number(formData.get('idDosen'));
  const file = formData.get('fileBukti') as File | null;

  if (!file || file.size === 0) {
    throw new Error('File bukti transfer harus dipilih');
  }

  let fileBukti: string;
  try {
    const result = await uploadFile(file, idDosen, 'keuangan');
    fileBukti = result.filePath;
  } catch (e) {
    if (e instanceof UploadError) throw e;
    throw new Error('Gagal mengupload file bukti transfer');
  }

  await prisma.pengajuanReimbursement.update({
    where: { id: keuanganId },
    data: { file_bukti_bayar: fileBukti },
  });

  revalidatePath('/admin/riwayat-dosen');
  revalidatePath(`/admin/riwayat-dosen/${idDosen}/keuangan`);
  revalidatePath(`/admin/riwayat-dosen/${idDosen}/keuangan/${keuanganId}`);
}

async function evaluateKeuangan(keuanganId: number, keputusan: 'dicairkan' | 'ditolak', catatan: string) {
  const reimbursement = await prisma.pengajuanReimbursement.findUnique({
    where: { id: keuanganId },
    include: { pengajuan_studi: { select: { user_id: true } } },
  });

  await prisma.pengajuanReimbursement.update({
    where: { id: keuanganId },
    data: {
      status_pencairan: keputusan,
      catatan_keuangan: catatan,
      tanggal_pencairan: keputusan === 'dicairkan' ? new Date() : undefined,
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

export async function addManualKhs(prevState: { error?: string } | null, formData: FormData): Promise<{ error?: string } | null> {
  const pengajuanId = Number(formData.get('pengajuanId'));
  const idDosen = Number(formData.get('idDosen'));
  const semesterKe = Number(formData.get('semesterKe'));
  const tahunAkademik = formData.get('tahunAkademik') as string;
  const ips = Number(formData.get('ips'));
  const file = formData.get('file') as File | null;

  if (!semesterKe || !tahunAkademik) {
    return { error: 'Semester dan tahun akademik wajib diisi' };
  }

  let filePath: string | undefined;
  if (file && file.size > 0) {
    try {
      const result = await uploadFile(file, idDosen, 'khs');
      filePath = result.filePath;
    } catch (e) {
      if (e instanceof UploadError) return { error: e.message };
      return { error: 'Gagal mengupload file KHS' };
    }
  }

  const khs = await prisma.monitoringKhs.create({
    data: {
      pengajuan_id: pengajuanId,
      semester_ke: semesterKe,
      tahun_akademik: tahunAkademik,
      ips: ips || undefined,
      file_khs_path: filePath,
      tanggal_unggah: new Date(),
      status_evaluasi: 'diterima',
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
  return null;
}

export async function addManualKeuangan(formData: FormData) {
  const pengajuanId = Number(formData.get('pengajuanId'));
  const idDosen = Number(formData.get('idDosen'));
  const semesterKe = Number(formData.get('semesterKe'));
  const nominal = Number(formData.get('nominal'));
  const bank = formData.get('bank') as string;
  const norek = formData.get('norek') as string;
  const file = formData.get('fileBukti') as File | null;
  const fileFormulir = formData.get('fileFormulir') as File | null;
  const fileBuktiPembayaran = formData.get('fileBuktiPembayaran') as File | null;

  if (!fileFormulir || fileFormulir.size === 0) {
    throw new Error('File Formulir Bantuan Studi harus dipilih');
  }
  if (!fileBuktiPembayaran || fileBuktiPembayaran.size === 0) {
    throw new Error('File Bukti Pembayaran harus dipilih');
  }

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

  let filePathFormulir: string;
  try {
    const result = await uploadFile(fileFormulir, idDosen, 'dokumen');
    filePathFormulir = result.filePath;
  } catch (e) {
    if (e instanceof UploadError) throw e;
    throw new Error('Gagal mengupload file Formulir Bantuan Studi');
  }

  let filePathBuktiPembayaran: string;
  try {
    const result = await uploadFile(fileBuktiPembayaran, idDosen, 'dokumen');
    filePathBuktiPembayaran = result.filePath;
  } catch (e) {
    if (e instanceof UploadError) throw e;
    throw new Error('Gagal mengupload file Bukti Pembayaran');
  }

  const reimbursement = await prisma.pengajuanReimbursement.create({
    data: {
      pengajuan_id: pengajuanId,
      semester_ke: semesterKe,
      nominal: nominal || undefined,
      file_bukti_bayar: fileBukti,
      nama_bank: bank || undefined,
      nomor_rekening: norek || undefined,
      status_pencairan: 'dicairkan',
      tanggal_pencairan: new Date(),
    },
    include: { pengajuan_studi: { select: { user_id: true } } },
  });

  await prisma.dokumenPengajuan.create({
    data: {
      pengajuan_id: pengajuanId,
      pengajuan_reimbursement_id: reimbursement.id,
      master_dokumen_id: 21,
      file_path: filePathFormulir,
      status_verifikasi: 'pending',
    },
  });

  await prisma.dokumenPengajuan.create({
    data: {
      pengajuan_id: pengajuanId,
      pengajuan_reimbursement_id: reimbursement.id,
      master_dokumen_id: 22,
      file_path: filePathBuktiPembayaran,
      status_verifikasi: 'pending',
    },
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
      status_verifikasi: 'pending',
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
