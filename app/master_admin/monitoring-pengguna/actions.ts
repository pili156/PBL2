"use server";

import { prisma } from "@/src/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

function validatePassword(password: string): string | null {
  if (password.length < 8) return "Password minimal 8 karakter";
  if (!/[A-Z]/.test(password)) return "Password harus mengandung minimal 1 huruf kapital";
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return "Password harus mengandung minimal 1 karakter unik (!@#$%^&* dll)";
  return null;
}

export async function toggleStatus(userId: number) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User tidak ditemukan");

  const newStatus =
    user.status_akun === "aktif" ? "menunggu" : "aktif";

  await prisma.user.update({
    where: { id: userId },
    data: { status_akun: newStatus },
  });

  revalidatePath("/master_admin/monitoring-pengguna");
}

export async function createUser(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const roleId = Number(formData.get("role_id"));
  const namaLengkap = formData.get("nama_lengkap") as string;
  const nip = formData.get("nip") as string;

  if (!email || !password || !namaLengkap || !nip || !roleId) {
    throw new Error("Semua field wajib diisi");
  }

  const passwordError = validatePassword(password);
  if (passwordError) throw new Error(passwordError);

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) throw new Error("Email sudah terdaftar");

  const existingNip = await prisma.masterDosen.findUnique({ where: { nip } });
  if (existingNip) throw new Error("NIP sudah terdaftar");

  const password_hash = await bcrypt.hash(password, 10);
  const username = email.split("@")[0];

  await prisma.user.create({
    data: {
      email,
      username,
      password_hash,
      role_id: roleId,
      status_akun: "aktif",
      master_dosen: {
        create: { nip, nama_lengkap: namaLengkap },
      },
    },
  });

  revalidatePath("/master_admin/monitoring-pengguna");
}

// --- FUNGSI UPDATE DIPISAH MENJADI DUA ---

export async function updateUserProfile(formData: FormData) {
  const userId = Number(formData.get("id"));
  const nama = formData.get("nama_lengkap") as string;
  const email = formData.get("email") as string;
  const nip = formData.get("nip") as string;
  const nidn = formData.get("nidn") as string;
  const tanggal_lahir = formData.get("tanggal_lahir") as string;
  const jenis_kelamin = formData.get("jenis_kelamin") as string;
  const email_pribadi = formData.get("email_pribadi") as string;
  const alamat = formData.get("alamat") as string;
  const pangkat_golongan = formData.get("pangkat_golongan") as string;
  const jabatan = formData.get("jabatan") as string;
  const jurusan = formData.get("jurusan") as string;
  const program_studi = formData.get("program_studi") as string;
  const no_telp = formData.get("no_telp") as string;

  const dosenData = {
    nip: nip || null,
    nidn: nidn || null,
    nama_lengkap: nama,
    tanggal_lahir: tanggal_lahir ? new Date(tanggal_lahir) : null,
    jenis_kelamin: jenis_kelamin || null,
    email_pribadi: email_pribadi || null,
    alamat: alamat || null,
    pangkat_golongan: pangkat_golongan || null,
    jabatan: jabatan || null,
    jurusan: jurusan || null,
    program_studi: program_studi || null,
    no_telp: no_telp || null,
  };

  await prisma.user.update({
    where: { id: userId },
    data: {
      email,
      master_dosen: {
        upsert: {
          create: dosenData,
          update: dosenData,
        },
      },
    },
  });

  revalidatePath("/master_admin/monitoring-pengguna");
}

export async function updateUserRole(formData: FormData) {
  const userId = Number(formData.get("id"));
  const roleId = Number(formData.get("role_id"));

  await prisma.user.update({
    where: { id: userId },
    data: { role_id: roleId },
  });

  revalidatePath("/master_admin/monitoring-pengguna");
}

// ------------------------------------------

export async function deleteUserById(userId: number) {
  await prisma.masterDosen.deleteMany({ where: { user_id: userId } });
  await prisma.user.delete({ where: { id: userId } });
  revalidatePath("/master_admin/monitoring-pengguna");
}

export async function resetPassword(formData: FormData) {
  const userId = Number(formData.get("id"));
  const newPassword = formData.get("password") as string;

  const passwordError = validatePassword(newPassword);
  if (passwordError) throw new Error(passwordError);

  const password_hash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: userId },
    data: { password_hash },
  });

  revalidatePath("/master_admin/monitoring-pengguna");
}