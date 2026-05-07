'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// Wrapper functions for form actions
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

export async function evaluateKhs(khsId: number, keputusan: 'DITERIMA' | 'DITOLAK', catatan: string) {
  // Fetch KHS to get dosen ID for revalidation
  const khs = await prisma.monitoringKhs.findUnique({
    where: { id: khsId },
    include: {
      pengajuan_studi: {
        select: { user_id: true },
      },
    },
  });

  await prisma.monitoringKhs.update({
    where: { id: khsId },
    data: {
      status_evaluasi: keputusan,
      catatan_evaluasi: catatan,
      tanggal_evaluasi: new Date(),
    },
  });

  // Revalidate relevant paths
  revalidatePath('/admin/riwayat-dosen');
  if (khs?.pengajuan_studi?.user_id) {
    const idDosen = khs.pengajuan_studi.user_id;
    revalidatePath(`/admin/riwayat-dosen/${idDosen}/khs`);
    revalidatePath(`/admin/riwayat-dosen/${idDosen}/khs/${khsId}`);
  }
}

export async function evaluateKeuangan(keuanganId: number, keputusan: 'DICAIRKAN' | 'DITOLAK', catatan: string) {
  // Fetch reimbursement to get dosen ID for revalidation
  const reimbursement = await prisma.pengajuanReimbursement.findUnique({
    where: { id: keuanganId },
    include: {
      pengajuan_studi: {
        select: { user_id: true },
      },
    },
  });

  await prisma.pengajuanReimbursement.update({
    where: { id: keuanganId },
    data: {
      status_pencairan: keputusan,
      catatan_keuangan: catatan,
      tanggal_pencairan: keputusan === 'DICAIRKAN' ? new Date() : undefined,
    },
  });

  // Revalidate relevant paths
  revalidatePath('/admin/riwayat-dosen');
  if (reimbursement?.pengajuan_studi?.user_id) {
    const idDosen = reimbursement.pengajuan_studi.user_id;
    revalidatePath(`/admin/riwayat-dosen/${idDosen}/keuangan`);
    revalidatePath(`/admin/riwayat-dosen/${idDosen}/keuangan/${keuanganId}`);
  }
}

// Wrapper functions for keuangan form actions
export async function acceptKeuangan(formData: FormData) {
  const keuanganId = Number(formData.get('keuanganId'));
  const catatan = formData.get('catatan') as string;
  await evaluateKeuangan(keuanganId, 'DICAIRKAN', catatan);
}

export async function rejectKeuangan(formData: FormData) {
  const keuanganId = Number(formData.get('keuanganId'));
  const catatan = formData.get('catatan') as string;
  await evaluateKeuangan(keuanganId, 'DITOLAK', catatan);
}
