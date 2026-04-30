import { NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ message: "Email dan password wajib diisi" }, { status: 400 });
    }

    // Ambil user beserta relasi Role dan MasterDosen
    const user = await prisma.user.findFirst({
      where: { email: email },
      include: {
        role: true,
        master_dosen: true
      }
    });

    if (!user || !user.password_hash) {
      return NextResponse.json({ message: "Kredensial tidak valid" }, { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return NextResponse.json({ message: "Kredensial tidak valid" }, { status: 401 });
    }

    const roleName = user.role?.nama_role;

    if (roleName === 'dosen' && user.status_akun === 'menunggu') {
      return NextResponse.json({ 
        message: "Akun belum diaktifkan. Silakan hubungi Admin." 
      }, { status: 403 });
    }

    return NextResponse.json({
      message: "Login berhasil",
      user: {
        id: user.id,
        email: user.email,
        role: roleName,
        // Dosen ambil nama_lengkap, Admin/Master ambil username
        nama: user.master_dosen?.nama_lengkap || user.username 
      }
    }, { status: 200 });

  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json({ message: "Terjadi kesalahan pada server" }, { status: 500 });
  }
}