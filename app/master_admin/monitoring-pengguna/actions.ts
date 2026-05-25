"use server";

import { prisma } from "@/src/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

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

export async function updateUserById(formData: FormData) {
  const userId = Number(formData.get("id"));
  const nama = formData.get("nama_lengkap") as string;
  const email = formData.get("email") as string;
  const roleId = Number(formData.get("role_id"));
  const nip = formData.get("nip") as string;
  const jurusan = formData.get("jurusan") as string;

  await prisma.user.update({
    where: { id: userId },
    data: {
      email,
      role_id: roleId,
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

export async function deleteUserById(userId: number) {
  await prisma.masterDosen.deleteMany({ where: { user_id: userId } });
  await prisma.user.delete({ where: { id: userId } });
  revalidatePath("/master_admin/monitoring-pengguna");
}

export async function resetPassword(formData: FormData) {
  const userId = Number(formData.get("id"));
  const newPassword = formData.get("password") as string;

  const password_hash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: userId },
    data: { password_hash },
  });

  revalidatePath("/master_admin/monitoring-pengguna");
}
