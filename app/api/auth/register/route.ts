import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, nama_lengkap, nip, jurusan, program_studi, password } = body;

    // Validasi input kosong
    if (!email || !nip || !password || !nama_lengkap) {
      return NextResponse.json({ error: "Semua kolom wajib diisi!" }, { status: 400 });
    }

    // Cek apakah NIP atau Email sudah ada di database
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: email }, { username: nip }],
      },
    });

    if (existingUser) {
      return NextResponse.json({ error: "Email atau NIP sudah terdaftar!" }, { status: 400 });
    }

    // Enkripsi password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Simpan ke database (Tabel users dan master_dosen sekaligus)
    const newUser = await prisma.user.create({
      data: {
        username: nip, 
        email: email,
        password_hash: hashedPassword,
        role_id: 1, // Asumsi ID 1 adalah Dosen
        status_akun: "Pending",
        master_dosen: {
          create: {
            nip: nip,
            nama_lengkap: nama_lengkap,
            unit_kerja: program_studi, 
            // Jurusan bisa kamu tambahkan ke schema jika diperlukan
          },
        },
      },
    });

    return NextResponse.json({ message: "Registrasi berhasil! Menunggu persetujuan Admin." }, { status: 201 });

  } catch (error: any) {
  // Baris ini akan mencetak error APAPUN yang terjadi ke terminal VSCode kamu
  console.error("DETEKSI ERROR PRISMA:", error);
  
  return NextResponse.json(
    { error: error.message || "Terjadi kesalahan pada server." },
    { status: 500 }
  );
}}