import { NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    // 1. Tangkap 'identifier', bukan 'email'
    const { identifier, password } = await request.json();
    
    // Log ini akan muncul di terminal untuk memastikan data masuk
    console.log("1. Mencoba login dengan identifier:", identifier);

    if (!identifier || !password) {
      return NextResponse.json({ error: "Email/NIP dan password wajib diisi" }, { status: 400 });
    }

    // 2. Cari user menggunakan OR (bisa email di tabel user, atau NIP di tabel master_dosen)
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

    // 3. Cek Password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    console.log("3. Password cocok:", isPasswordValid);

    if (!isPasswordValid) {
      return NextResponse.json({ error: "Kredensial tidak valid" }, { status: 401 });
    }

    const roleName = user.role?.nama_role;

    // 4. Cek Status Approval (Khusus Dosen)
    if (roleName === 'dosen' && user.status_akun === 'menunggu') {
      return NextResponse.json({ error: "Akun belum diaktifkan. Silakan hubungi Admin." }, { status: 403 });
    }

    console.log("4. Login SUKSES! Arahkan role ke:", roleName);

    // 5. Kembalikan data sukses ke frontend
    return NextResponse.json({
      message: "Login berhasil",
      user: {
        id: user.id,
        email: user.email,
        role: roleName,
        nama: user.master_dosen?.nama_lengkap || user.username
      }
    }, { status: 200 });

  } catch (error) {
    console.error("Login Error Catch:", error);
    return NextResponse.json({ error: "Terjadi kesalahan pada server" }, { status: 500 });
  }
}