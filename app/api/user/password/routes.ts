import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/src/lib/prisma';
import bcrypt from 'bcryptjs';

export async function PUT(request: Request) {
  try {
    const cookieStore = await cookies();
    const userEmail = cookieStore.get("user_email")?.value;

    if (!userEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { currentPassword, newPassword, confirmPassword } = body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json({ error: "Semua field wajib diisi" }, { status: 400 });
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json({ error: "Password baru dan konfirmasi tidak cocok" }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: "Password baru minimal 6 karakter" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: userEmail }
    });

    if (!user || !user.password_hash) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Password saat ini salah" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { password_hash: hashedPassword }
    });

    return NextResponse.json({ message: "Password berhasil diperbarui" }, { status: 200 });

  } catch (error) {
    console.error("Update Password Error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan pada server" }, { status: 500 });
  }
}