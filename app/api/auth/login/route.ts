import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/src/lib/prisma';
import bcrypt from 'bcryptjs';
import { signToken } from '@/src/lib/jwt';

export async function POST(request: Request) {
  try {
    const { identifier, password } = await request.json();
    
    console.log("1. Mencoba login dengan identifier:", identifier);

    if (!identifier || !password) {
      return NextResponse.json({ error: "Email/NIP dan password wajib diisi" }, { status: 400 });
    }

    // Validasi domain email polines (jika input berupa email)
    if (identifier.includes('@') && !identifier.endsWith('@polines.ac.id')) {
      return NextResponse.json({ error: "Gagal: Gunakan email @polines.ac.id untuk login." }, { status: 400 });
    }

    // Cari user berdasarkan email atau NIP dosen
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { master_dosen: { nip: identifier } }
        ]
      },
      include: { 
        role: true, 
        master_dosen: true 
      }
    });

    console.log("2. User ditemukan di DB:", user ? "Ya" : "Tidak");

    if (!user || !user.password_hash) {
      return NextResponse.json({ error: "Kredensial tidak valid" }, { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    console.log("3. Password cocok:", isPasswordValid);

    if (!isPasswordValid) {
      return NextResponse.json({ error: "Kredensial tidak valid" }, { status: 401 });
    }

    // Ambil nama_role dari relasi tabel master_role
    const roleName = user.role?.nama_role;

    if (roleName === 'dosen' && user.status_akun === 'menunggu') {
      return NextResponse.json({ error: "Akun belum diaktifkan. Silakan hubungi Admin." }, { status: 403 });
    }

    // --- LOGIC REDIRECT DITENTUKAN DI BACKEND ---
    let targetUrl = "/user/dashboard"; // Default folder untuk dosen

    if (roleName === "master_admin") {
      targetUrl = "/master_admin/dashboard";
    } else if (roleName === "admin_fakultas") {
      targetUrl = "/admin/dashboard";
    } else if (roleName === "keuangan") {
      targetUrl = "/keuangan/dashboard";
    }

    console.log(`4. Login SUKSES! Role: ${roleName}, Redirect ke: ${targetUrl}`);

    const token = signToken({
      userId: user.id,
      email: user.email || '',
      role: roleName || 'dosen',
      nama: user.master_dosen?.nama_lengkap || user.username || 'User',
    });

    const cookieName = `token_${roleName}`;

    const cookieStore = await cookies();
    cookieStore.delete("token");
    cookieStore.delete("user_email");
    cookieStore.delete("token_dosen");
    cookieStore.delete("token_admin_fakultas");
    cookieStore.delete("token_master_admin");
    cookieStore.delete("token_keuangan");
    
    cookieStore.set(cookieName, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60,
      path: "/",
    });

    if (user.email) {
      cookieStore.set("user_email", user.email, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60,
        path: "/",
      });
    }

    // Kembalikan data sukses beserta redirectUrl
    return NextResponse.json({
      message: "Login berhasil",
      redirectUrl: targetUrl, 
      user: {
        id: user.id,
        email: user.email,
        role: roleName,
        nama: user.master_dosen?.nama_lengkap || user.username || "User"
      }
    }, { status: 200 });

  } catch (error) {
    console.error("Login Error Catch:", error);
    return NextResponse.json({ error: "Terjadi kesalahan pada server" }, { status: 500 });
  }
}