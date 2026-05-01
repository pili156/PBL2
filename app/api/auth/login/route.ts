import { NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { identifier, password } = await request.json();
    
    console.log("1. Mencoba login dengan identifier:", identifier);

    if (!identifier || !password) {
      return NextResponse.json({ error: "Email/NIP dan password wajib diisi" }, { status: 400 });
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
    let targetUrl = "/user/dashboard"; // Default folder untuk user biasa / dosen

    if (roleName === "admin") {
      targetUrl = "/admin/dashboard";
    } else if (roleName === "master_admin") { // Pastikan string ini sama dengan yang di Prisma Studio
      targetUrl = "/master_admin/dashboard";
    }

    console.log(`4. Login SUKSES! Role: ${roleName}, Redirect ke: ${targetUrl}`);

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