import { NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { email, password, nip, nama_lengkap, jurusan, program_studi } = await request.json();

    if (!email || !password || !nip || !nama_lengkap) {
      return NextResponse.json({ error: "Kolom wajib belum diisi" }, { status: 400 });
    }

    // Cek email di tabel User
    const existingUser = await prisma.user.findFirst({ where: { email } });
    // Cek NIP di tabel MasterDosen
    const existingDosen = await prisma.masterDosen.findFirst({ where: { nip } });

    if (existingUser || existingDosen) {
      return NextResponse.json({ error: "Email atau NIP sudah terdaftar" }, { status: 400 });
    }

    // Cari ID untuk role 'dosen'
    const dosenRole = await prisma.masterRole.findFirst({ 
      where: { nama_role: 'dosen' } 
    });

    if (!dosenRole) {
      return NextResponse.json({ error: "Role dosen belum diatur di database" }, { status: 500 });
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
            nama_lengkap,
            jurusan,          // Data tambahan dari form
            program_studi     // Data tambahan dari form
          }
        }
      }
    });

    return NextResponse.json({ 
      message: "Registrasi berhasil. Silakan tunggu persetujuan Admin." 
    }, { status: 201 });

  } catch (error) {
    console.error("Register Error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan pada server" }, { status: 500 });
  }
}