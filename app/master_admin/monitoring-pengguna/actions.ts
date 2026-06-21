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
  const username = formData.get("username") as string;
  const roleId = Number(formData.get("role_id"));
  const namaLengkap = formData.get("nama_lengkap") as string;
  const nip = formData.get("nip") as string;
  const jurusan = formData.get("jurusan") as string;

  const passwordError = validatePassword(password);
  if (passwordError) throw new Error(passwordError);

  const password_hash = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      email,
      username,
      password_hash,
      role_id: roleId,
      status_akun: "aktif",
      master_dosen: {
        create: { nip, nama_lengkap: namaLengkap, jurusan },
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
  const jurusan = formData.get("jurusan") as string;

  await prisma.user.update({
    where: { id: userId },
    data: {
      email,
      master_dosen: {
        upsert: {
          create: { nip, nama_lengkap: nama, jurusan },
          update: { nip, nama_lengkap: nama, jurusan },
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