import { z } from "zod";

export const loginSchema = z.object({
  identifier: z.string().min(1, "Email/NIP wajib diisi"),
  password: z.string().min(1, "Password wajib diisi"),
});

export const registerSchema = z.object({
  email: z.string().email("Email tidak valid").refine(
    (email) => email.endsWith("@polines.ac.id"),
    "Gunakan email institusi @polines.ac.id"
  ),
  password: z.string().min(8, "Password minimal 8 karakter"),
  nip: z.string().min(1, "NIP wajib diisi"),
  nama_lengkap: z.string().min(1, "Nama lengkap wajib diisi"),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Password saat ini wajib diisi"),
  newPassword: z.string().min(6, "Password baru minimal 6 karakter"),
  confirmPassword: z.string().min(1, "Konfirmasi password wajib diisi"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Password baru dan konfirmasi tidak cocok",
  path: ["confirmPassword"],
});

export const pengajuanSchema = z.object({
  jenis_studi_id: z.number().int().positive().optional(),
  jalur_pendanaan_id: z.number().int().positive().optional(),
  wilayah_studi: z.number().int().positive().optional(),
  perguruan_tinggi: z.string().min(1, "Perguruan tinggi wajib diisi").optional(),
});

export const profileSchema = z.object({
  username: z.string().optional(),
  nip: z.string().optional(),
  nama_lengkap: z.string().min(1, "Nama lengkap wajib diisi").optional(),
  pangkat_golongan: z.string().optional(),
  jabatan: z.string().optional(),
  unit_kerja: z.string().optional(),
  jurusan: z.string().optional(),
  program_studi: z.string().optional(),
  no_telp: z.string().optional(),
});

export const bukuIndukSchema = z.object({
  nip: z.string().min(1, "NIP wajib diisi"),
  nama_lengkap: z.string().min(1, "Nama lengkap wajib diisi"),
  email: z.string().email("Email tidak valid").refine(
    (email) => email.endsWith("@polines.ac.id"),
    "Gunakan email institusi @polines.ac.id"
  ),
  pangkat_golongan: z.string().optional(),
  jabatan: z.string().optional(),
  unit_kerja: z.string().optional(),
  jurusan: z.string().optional(),
  program_studi: z.string().optional(),
  no_telp: z.string().optional(),
});

export const reimbursementSchema = z.object({
  jenis_pengajuan: z.string().optional(),
  semester_ke: z.string().min(1, "Semester wajib diisi"),
  tahun_akademik: z.string().optional(),
  tahun_ke: z.string().optional(),
  nominal: z.string().min(1, "Nominal wajib diisi"),
  catatan_keuangan: z.string().optional(),
});

export const ipkSchema = z.number().min(0).max(4.00, "IPK tidak boleh lebih dari 4.00");
