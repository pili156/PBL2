import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma"; 
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, nama_lengkap, nip, program_studi, password } = body;

    if (!email || !nip || !password || !nama_lengkap) {
      return NextResponse.json({ error: "Semua kolom wajib diisi!" }, { status: 400 });
    }

    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email: email }, { username: nip }] },
    });

    if (existingUser) {
      return NextResponse.json({ error: "Email atau NIP sudah terdaftar!" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        username: nip, 
        email: email,
        password_hash: hashedPassword,
        status_akun: "Pending",
        role: {
          connect: { id: 1 } // Menghubungkan ke Role Dosen
        },
        master_dosen: {
          create: {
            nip: nip,
            nama_lengkap: nama_lengkap,
            unit_kerja: program_studi, 
          },
        },
      },
    });

    return NextResponse.json({ message: "Registrasi berhasil!" }, { status: 201 });

  } catch (error: any) {
    console.error("DETEKSI ERROR PRISMA:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}