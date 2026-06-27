import { NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import bcrypt from 'bcryptjs';
import { bukuIndukSchema } from '@/src/lib/validation';
import { logger } from '@/src/lib/logger';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = bukuIndukSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { nip, nama_lengkap, email, pangkat_golongan, jabatan, jurusan, program_studi, no_telp } = parsed.data;

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
    const rawPassword = 'Sandi@' + nip.slice(-4);
    const tempPassword = bcrypt.hashSync(rawPassword, 10);

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
            jurusan: jurusan || null,
            program_studi: program_studi || null,
            no_telp: no_telp || null,
          }
        }
      }
    });

    return NextResponse.json({ message: `Data pegawai berhasil ditambahkan! Password awal: ${rawPassword}` }, { status: 201 });
  } catch (error) {
    logger.error("Buku Induk Create Error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan pada server." }, { status: 500 });
  }
}
