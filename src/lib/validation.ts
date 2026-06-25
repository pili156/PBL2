import { z } from "zod";

export const passwordSchema = z.string()
  .min(8, "Password minimal 8 karakter")
  .regex(/[A-Z]/, "Password harus mengandung minimal 1 huruf kapital")
  .regex(/[!@#$%^&*(),.?":{}|<>]/, "Password harus mengandung minimal 1 karakter unik (!@#$%^&* dll)");

export const loginSchema = z.object({
  identifier: z.string().min(1, "Email/NIP wajib diisi"),
  password: z.string().min(1, "Password wajib diisi"),
});

export const registerSchema = z.object({
  email: z.string().email("Email tidak valid").refine(
    (email) => email.endsWith("@polines.ac.id"),
    "Gunakan email institusi @polines.ac.id"
  ),
  password: passwordSchema,
  nip: z.string().min(1, "NIP wajib diisi"),
  nama_lengkap: z.string().min(1, "Nama lengkap wajib diisi"),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Password saat ini wajib diisi"),
  newPassword: passwordSchema,
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
  nama_beasiswa: z.string().nullable().optional(),
});

export const profileSchema = z.object({
  username: z.string().optional(),
  nip: z.string().optional(),
  nidn: z.string().min(1, "NIDN wajib diisi"),
  nama_lengkap: z.string().min(1, "Nama lengkap wajib diisi").optional(),
  tanggal_lahir: z.string().min(1, "Tanggal lahir wajib diisi"),
  jenis_kelamin: z.string().min(1, "Jenis kelamin wajib diisi"),
  email_pribadi: z.string().min(1, "Email pribadi wajib diisi"),
  alamat: z.string().min(1, "Alamat wajib diisi"),
  pangkat_golongan: z.string().optional(),
  jabatan: z.string().optional(),
  jurusan: z.string().optional(),
  program_studi: z.string().optional(),
  no_telp: z.string().optional(),
  provinsi_lahir: z.string().optional(),
  kota_lahir: z.string().optional(),
});

export const masterJabatanSchema = z.object({
  nama: z.string().min(1, "Nama jabatan wajib diisi"),
  singkatan: z.string().min(1, "Singkatan jabatan wajib diisi"),
  urutan: z.number().int().min(0, "Urutan harus angka positif"),
});

export const masterPangkatSchema = z.object({
  pangkat: z.string().min(1, "Pangkat wajib diisi"),
  golongan: z.string().min(1, "Golongan wajib diisi"),
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
  jurusan: z.string().optional(),
  program_studi: z.string().optional(),
  no_telp: z.string().optional(),
});

export const reimbursementSchema = z.object({
  jenis_pengajuan: z.string().optional(),
  semester_ke: z.string().min(1, "Semester wajib diisi"),
  tahun_akademik: z.string().optional(),
  nominal: z.string().min(1, "Nominal wajib diisi"),
  catatan_keuangan: z.string().optional(),
  nomor_rekening: z.string().min(1, "Nomor rekening wajib diisi"),
  nama_bank: z.string().min(1, "Bank wajib dipilih"),
});

export const ipkSchema = z.number().min(0).max(4.00, "IPS tidak boleh lebih dari 4.00");
