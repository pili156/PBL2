'use server';

import { prisma } from '@/src/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { ipkSchema } from '@/src/lib/validation';
import { logger } from '@/src/lib/logger';
const MAX_FILE_SIZE = 2 * 1024 * 1024;
const ALLOWED_TYPES = ['application/pdf'];

function validateFile(file: File) {
  if (!file || file.size === 0) return 'File tidak boleh kosong';
  if (!ALLOWED_TYPES.includes(file.type)) return 'Hanya file PDF yang diperbolehkan';
  if (file.size > MAX_FILE_SIZE) return 'Ukuran file maksimal 2MB';
  return null;
}

export async function uploadKHS(prevState: { error?: string; id?: number } | null, formData: FormData): Promise<{ error?: string; id?: number } | null> {
  const semester = formData.get('semester') as string;
  const tahunAkademik = formData.get('tahun_akademik') as string;
  const ipk = formData.get('ipk') as string;
  const catatan = formData.get('catatan') as string;
  const file = formData.get('file') as File;

  if (!semester || !tahunAkademik || !ipk || !file || file.size === 0) {
    return { error: 'Semua field wajib diisi dengan benar' };
  }

  const semesterNum = parseInt(semester);
  const jenisSemester = semesterNum % 2 === 1 ? 'gasal' : 'genap';

  const ipkNum = parseFloat(ipk);
  const ipkResult = ipkSchema.safeParse(ipkNum);
  if (!ipkResult.success) {
    return { error: ipkResult.error.issues[0].message };
  }

  const fileError = validateFile(file);
  if (fileError) return { error: fileError };

  let pengajuanId: number;

  try {
    const headersList = await headers();
    const userId = parseInt(headersList.get('x-user-id') || '0');

    if (!userId) {
      return { error: 'User belum login' };
    }

    const pengajuan = await prisma.pengajuanStudi.findFirst({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
    });

    if (!pengajuan) {
      return { error: 'Anda belum memiliki pengajuan studi. Silakan buat pengajuan terlebih dahulu.' };
    }

    pengajuanId = pengajuan.id;

    const existingKHS = await prisma.monitoringKhs.findFirst({
      where: {
        pengajuan_id: pengajuanId,
        semester_ke: parseInt(semester),
      },
    });

    if (existingKHS) {
      return { error: 'KHS untuk semester ini sudah ada' };
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileExt = file.name.split('.').pop();
    const fileName = `khs-${pengajuanId}-semester-${semester}-${uuidv4()}.${fileExt}`;
    const filePath = join(process.cwd(), 'public', 'uploads', 'khs', fileName);
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'khs');

    await mkdir(uploadDir, { recursive: true });
    await writeFile(filePath, buffer);
    const fileUrl = `/uploads/khs/${fileName}`;

    const newKhs = await prisma.monitoringKhs.create({
      data: {
        pengajuan_id: pengajuanId,
        semester_ke: parseInt(semester),
        tahun_akademik: tahunAkademik,
        jenis_semester: jenisSemester as 'gasal' | 'genap',
        ipk: parseFloat(ipk),
        file_khs_path: fileUrl,
        catatan_evaluasi: catatan || null,
        tanggal_unggah: new Date(),
        status_evaluasi: 'pending',
      },
    });

    revalidatePath('/user/laporanKHS');
    return { id: newKhs.id };
  } catch (error) {
    logger.error('[uploadKHS] Unexpected error:', error);
    return { error: 'Terjadi kesalahan saat mengupload KHS. Silakan coba lagi.' };
  }
}

export async function updateKHS(id: number, formData: FormData) {
  const semester = formData.get('semester') as string;
  const tahunAkademik = formData.get('tahun_akademik') as string;
  const ipk = formData.get('ipk') as string;
  const catatan = formData.get('catatan') as string;
  const file = formData.get('file') as File;

  if (!semester || !tahunAkademik || !ipk) {
    throw new Error('Field semester, tahun akademik, dan IPS wajib diisi');
  }

  const semesterNum = parseInt(semester);
  const jenisSemester = semesterNum % 2 === 1 ? 'gasal' : 'genap';

  const ipkNum = parseFloat(ipk);
  const ipkResult = ipkSchema.safeParse(ipkNum);
  if (!ipkResult.success) {
    throw new Error(ipkResult.error.issues[0].message);
  }

  const updateData: any = {
    semester_ke: parseInt(semester),
    tahun_akademik: tahunAkademik,
    jenis_semester: jenisSemester as 'gasal' | 'genap',
    ipk: parseFloat(ipk),
    catatan_evaluasi: catatan || null,
    tanggal_unggah: new Date(),
    status_evaluasi: 'pending',
  };

  if (file && file.size > 0) {
    const fileError = validateFile(file);
    if (fileError) throw new Error(fileError);

    const existing = await prisma.monitoringKhs.findUnique({ where: { id } });
    if (existing?.file_khs_path) {
      const oldPath = join(process.cwd(), 'public', existing.file_khs_path);
      try { await unlink(oldPath); } catch {}
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileExt = file.name.split('.').pop();
    const fileName = `khs-${id}-update-${uuidv4()}.${fileExt}`;
    const filePath = join(process.cwd(), 'public', 'uploads', 'khs', fileName);

    await writeFile(filePath, buffer);
    updateData.file_khs_path = `/uploads/khs/${fileName}`;
  }

  await prisma.monitoringKhs.update({
    where: { id },
    data: updateData,
  });

  revalidatePath('/user/laporanKHS');
  revalidatePath(`/user/laporanKHS/${id}`);
  redirect('/user/laporanKHS');
}

export async function updateIPS(id: number, ipk: number) {
  const ipkResult = ipkSchema.safeParse(ipk);
  if (!ipkResult.success) {
    return { error: ipkResult.error.issues[0].message };
  }

  await prisma.monitoringKhs.update({
    where: { id },
    data: {
      ipk: ipk,
      status_evaluasi: 'pending',
    },
  });

  revalidatePath(`/user/laporanKHS/${id}`);
  return { success: true };
}

export async function submitRevisi(id: number, formData: FormData) {
  const ipk = formData.get('ipk') as string;
  const file = formData.get('file') as File;

  if (!ipk) {
    return { error: 'IPS wajib diisi' };
  }

  const ipkNum = parseFloat(ipk);
  const ipkResult = ipkSchema.safeParse(ipkNum);
  if (!ipkResult.success) {
    return { error: ipkResult.error.issues[0].message };
  }

  const updateData: any = {
    ipk: ipkNum,
    status_evaluasi: 'pending',
  };

  if (file && file.size > 0) {
    const fileError = validateFile(file);
    if (fileError) return { error: fileError };

    const existing = await prisma.monitoringKhs.findUnique({ where: { id } });
    if (existing?.file_khs_path) {
      const oldPath = join(process.cwd(), 'public', existing.file_khs_path);
      try { await unlink(oldPath); } catch {}
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileExt = file.name.split('.').pop();
    const fileName = `khs-${id}-revisi-${uuidv4()}.${fileExt}`;
    const filePath = join(process.cwd(), 'public', 'uploads', 'khs', fileName);

    await writeFile(filePath, buffer);
    updateData.file_khs_path = `/uploads/khs/${fileName}`;
  }

  await prisma.monitoringKhs.update({
    where: { id },
    data: updateData,
  });

  revalidatePath('/user/laporanKHS');
  revalidatePath(`/user/laporanKHS/${id}`);
  return { success: true };
}

export async function getKHSById(id: number) {
  return await prisma.monitoringKhs.findUnique({
    where: { id },
    include: {
      pengajuan_studi: {
        include: {
          user: {
            include: {
              master_dosen: true,
            },
          },
        },
      },
    },
  });
}

export async function getDashboardData(userId: number) {
  const dosen = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      master_dosen: true,
      pengajuan_studi: {
        include: {
          jalur_pendanaan: true,
          monitoring_khs: {
            orderBy: { semester_ke: 'asc' },
          },
          sk_kementerian: true,
          status: true,
        },
        orderBy: { created_at: 'desc' },
        take: 1,
      },
    },
  });

  return dosen;
}
