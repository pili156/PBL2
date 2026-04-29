import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { identifier, password } = await req.json();

    // 1. Cari user berdasarkan Email atau Username (NIP)
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { username: identifier }
        ]
      },
      include: {
        role: true 
      }
    });

    if (!user) {
      return NextResponse.json({ error: "Pengguna tidak ditemukan!" }, { status: 404 });
    }

    // 2. Cek apakah akun sudah Aktif (disetujui Admin)
    if (user.status_akun === "Pending") {
      return NextResponse.json({ error: "Akun Anda belum disetujui oleh Admin." }, { status: 403 });
    }

    // 3. Verifikasi Password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash || "");
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Password salah!" }, { status: 401 });
    }

    // 4. Kirim respon sukses
    return NextResponse.json({
      message: "Login Berhasil!",
      user: {
        id: user.id,
        username: user.username,
        role: user.role?.nama_role
      }
    }, { status: 200 });

  } catch (error: any) {
    console.error("LOGIN_ERROR:", error);
    return NextResponse.json({ error: "Terjadi kesalahan pada server" }, { status: 500 });
  }
}