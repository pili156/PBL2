import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { prisma } from '@/src/lib/prisma';
import bcrypt from 'bcryptjs';
import { changePasswordSchema } from '@/src/lib/validation';
import { logger } from '@/src/lib/logger';

export async function PUT(request: Request) {
  try {
    const headersList = await headers();
    const userEmail = headersList.get('x-user-email');

    if (!userEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = changePasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { currentPassword, newPassword } = parsed.data;

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
    logger.error("Update Password Error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan pada server" }, { status: 500 });
  }
}