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
  nama_lengkap: z.string().min(1, "Nama lengkap wajib diisi").optional(),
  nip: z.string().optional(),
  pangkat_golongan: z.string().optional(),
  jabatan: z.string().optional(),
  unit_kerja: z.string().optional(),
  jurusan: z.string().optional(),
  program_studi: z.string().optional(),
  no_telp: z.string().optional(),
});
