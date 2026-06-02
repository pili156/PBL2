// app/api/auth/register/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { username, email, password, nip, nama_lengkap } = await request.json();

    // 1. Validasi Input Kosong (Username sekarang Wajib!)
    if (!username || !email || !password || !nip || !nama_lengkap) {
      return NextResponse.json({ error: "Semua kolom (termasuk username) wajib diisi." }, { status: 400 });
    }

    // 2. Validasi Panjang Password Backend
    if (password.length < 8) {
      return NextResponse.json({ error: "Keamanan lemah: Password minimal harus 8 karakter." }, { status: 400 });
    }

    // 3. Validasi Domain Email
    if (!email.endsWith('@polines.ac.id')) {
      return NextResponse.json({ error: "Gagal: Gunakan email institusi @polines.ac.id" }, { status: 400 });
    }

    // 4. Cek Duplikasi Data
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email },
          { username: username },
          { master_dosen: { nip: nip } }
        ]
      }
    });

    if (existingUser) {
      return NextResponse.json({ error: "Email, Username, atau NIP tersebut sudah terdaftar." }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Cari ID Role Dosen
    const roleDosen = await prisma.masterRole.findFirst({ where: { nama_role: "dosen" } });

    // 5. Buat Akun & Profil dengan Status Konsisten ("Pending")
    const newUser = await prisma.user.create({
      data: {
        username: username,
        email: email,
        password_hash: hashedPassword,
        role_id: roleDosen?.id || 2, 
        status_akun: "Pending", // KONSISTENSI STATUS (Gunakan P besar)
        master_dosen: {
          create: {
            nip: nip,
            nama_lengkap: nama_lengkap,
          }
        }
      }
    });

    return NextResponse.json({ message: "Registrasi sukses. Menunggu verifikasi dari Admin Fakultas." }, { status: 201 });

  } catch (error) {
    console.error("Register Error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan pada server." }, { status: 500 });
  }
}