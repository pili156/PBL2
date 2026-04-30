import { NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { nip, email, password, nama_lengkap } = await request.json();

    if (!email || !password || !nip || !nama_lengkap) {
      return NextResponse.json({ message: "Semua kolom wajib diisi" }, { status: 400 });
    }

    // Cek email di tabel User
    const existingUser = await prisma.user.findFirst({ where: { email } });
    // Cek NIP di tabel MasterDosen
    const existingDosen = await prisma.masterDosen.findFirst({ where: { nip } });

    if (existingUser || existingDosen) {
      return NextResponse.json({ message: "Email atau NIP sudah terdaftar" }, { status: 400 });
    }

    // Cari ID untuk role 'dosen'
    const dosenRole = await prisma.masterRole.findFirst({ 
      where: { nama_role: 'dosen' } 
    });

    if (!dosenRole) {
      return NextResponse.json({ message: "Role dosen belum diatur di database" }, { status: 500 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert ke tabel User SEKALIGUS ke tabel MasterDosen
    await prisma.user.create({
      data: {
        email,
        password_hash: hashedPassword,
        role_id: dosenRole.id,
        status_akun: 'menunggu',
        master_dosen: {
          create: {
            nip,
            nama_lengkap
          }
        }
      }
    });

    return NextResponse.json({ 
      message: "Registrasi berhasil. Silakan tunggu persetujuan Admin." 
    }, { status: 201 });

  } catch (error) {
    console.error("Register Error:", error);
    return NextResponse.json({ message: "Terjadi kesalahan pada server" }, { status: 500 });
  }
}