'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function uploadKHS(formData: FormData) {
  const semester = formData.get('semester') as string;
  const tahunAkademik = formData.get('tahun_akademik') as string;
  const ipk = formData.get('ipk') as string;
  const catatan = formData.get('catatan') as string;
  const file = formData.get('file') as File;

  if (!semester || !tahunAkademik || !ipk || !file || file.size === 0) {
    throw new Error('Semua field wajib diisi dengan benar');
  }

  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();
  const userEmail = cookieStore.get('user_email')?.value;

  if (!userEmail) {
    throw new Error('User belum login');
  }

  const user = await prisma.user.findUnique({
    where: { email: userEmail },
    include: {
      pengajuan_studi: {
        orderBy: { created_at: 'desc' },
        take: 1,
      },
    },
  });

  if (!user || !user.pengajuan_studi[0]) {
    throw new Error('Pengajuan studi tidak ditemukan');
  }

  const userId = user.id;

  const pengajuanId = user.pengajuan_studi[0].id;

  const existingKHS = await prisma.monitoringKhs.findFirst({
    where: {
      pengajuan_id: pengajuanId,
      semester_ke: parseInt(semester),
    },
  });

  if (existingKHS) {
    throw new Error('KHS untuk semester ini sudah ada');
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

  await prisma.monitoringKhs.create({
    data: {
      pengajuan_id: pengajuanId,
      semester_ke: parseInt(semester),
      tahun_akademik: tahunAkademik,
      ipk: parseFloat(ipk),
      file_khs_path: fileUrl,
      catatan_evaluasi: catatan || null,
      tanggal_unggah: new Date(),
      status_evaluasi: 'Pending',
    },
  });

  revalidatePath('/user/laporanKHS');
  redirect('/user/laporanKHS');
}

export async function updateKHS(id: number, formData: FormData) {
  const semester = formData.get('semester') as string;
  const tahunAkademik = formData.get('tahun_akademik') as string;
  const ipk = formData.get('ipk') as string;
  const catatan = formData.get('catatan') as string;
  const file = formData.get('file') as File;

  if (!semester || !tahunAkademik || !ipk) {
    throw new Error('Field semester, tahun akademik, dan IPK wajib diisi');
  }

  const updateData: any = {
    semester_ke: parseInt(semester),
    tahun_akademik: tahunAkademik,
    ipk: parseFloat(ipk),
    catatan_evaluasi: catatan || null,
    tanggal_unggah: new Date(),
    status_evaluasi: 'Pending',
  };

  if (file && file.size > 0) {
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
        },
        orderBy: { created_at: 'desc' },
        take: 1,
      },
    },
  });

  return dosen;
}
