import { NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { nip, nama_lengkap, email, pangkat_golongan, jabatan, unit_kerja, jurusan, program_studi, no_telp } = await request.json();

    if (!nip || !nama_lengkap || !email) {
      return NextResponse.json({ error: "NIP, Nama Lengkap, dan Email wajib diisi." }, { status: 400 });
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email },
          { master_dosen: { nip: nip } }
        ]
      }
    });

    if (existingUser) {
      return NextResponse.json({ error: "Email atau NIP tersebut sudah terdaftar." }, { status: 400 });
    }

    const roleDosen = await prisma.masterRole.findFirst({ where: { nama_role: "dosen" } });

    const autoUsername = email.split('@')[0];
    const tempPassword = bcrypt.hashSync(nip, 10);

    const newUser = await prisma.user.create({
      data: {
        username: autoUsername,
        email: email,
        password_hash: tempPassword,
        role_id: roleDosen?.id || 2,
        status_akun: "aktif",
        master_dosen: {
          create: {
            nip: nip,
            nama_lengkap: nama_lengkap,
            pangkat_golongan: pangkat_golongan || null,
            jabatan: jabatan || null,
            unit_kerja: unit_kerja || null,
            jurusan: jurusan || null,
            program_studi: program_studi || null,
            no_telp: no_telp || null,
          }
        }
      }
    });

    return NextResponse.json({ message: "Data pegawai berhasil ditambahkan ke Buku Induk!" }, { status: 201 });
  } catch (error) {
    console.error("Buku Induk Create Error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan pada server." }, { status: 500 });
  }
}
