// app/api/auth/register/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      email, 
      nama_lengkap, 
      nip, 
      nidn,
      tanggal_lahir,
      jenis_kelamin,
      email_pribadi,
      alamat,
      jurusan, 
      program_studi,
      no_telp,
      pangkat_golongan,
      jabatan,
      provinsi_lahir,
      kota_lahir,
      gelar,
      pendidikan_terakhir,
      password 
    } = body;

    // Validasi input dasar
    if (!email || !nama_lengkap || !nip || !password || !jurusan || !program_studi) {
      return NextResponse.json({ error: "Field utama wajib diisi!" }, { status: 400 });
    }

    // 1. Cek apakah EMAIL sudah terdaftar
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: "Email sudah terdaftar!" }, { status: 400 });
    }

    // 2. Cek apakah NIP sudah terdaftar (TAMBAHAN BARU)
    const existingNip = await prisma.masterDosen.findUnique({
      where: { nip }
    });

    if (existingNip) {
      return NextResponse.json({ error: "NIP tersebut sudah terdaftar di sistem!" }, { status: 400 });
    }

    // Enkripsi password
    const password_hash = await bcrypt.hash(password, 10);

    // Ambil role dosen
    const dosenRole = await prisma.masterRole.findFirst({
      where: { nama_role: "dosen" }
    });

    if (!dosenRole) {
      return NextResponse.json({ error: "Role Dosen tidak ditemukan di database" }, { status: 500 });
    }

    const autoUsername = email.split('@')[0];

    // Gunakan transaction untuk membuat User dan MasterDosen sekaligus
    const newUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          username: autoUsername,
          email: email,
          password_hash: password_hash,
          role_id: dosenRole.id,
          status_akun: "pending",
          master_dosen: {
            create: {
              nip: nip,
              nama_lengkap: nama_lengkap,
              nidn: nidn || null,
              tanggal_lahir: tanggal_lahir ? new Date(tanggal_lahir) : null,
              jenis_kelamin: jenis_kelamin || null,
              email_pribadi: email_pribadi || null,
              alamat: alamat || null,
              jurusan: jurusan || "",
              program_studi: program_studi || "",
              no_telp: no_telp || null,
              pangkat_golongan: pangkat_golongan || null,
              jabatan: jabatan || null,
              gelar: gelar || null,
              pendidikan_terakhir: pendidikan_terakhir || null,
              provinsi_lahir: provinsi_lahir || null,
              kota_lahir: kota_lahir || null,
            }
          }
        },
        include: {
          master_dosen: true 
        }
      });
      return user;
    });

    return NextResponse.json({ message: "Registrasi berhasil!", user: newUser }, { status: 201 });

  } catch (error: any) {
    console.error("Error saat registrasi:", error);
    return NextResponse.json({ error: "Terjadi kesalahan pada server" }, { status: 500 });
  }
}