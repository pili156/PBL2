// app/api/auth/register/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import bcrypt from 'bcryptjs';
import { registerSchema } from '@/src/lib/validation';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { email, password, nip, nama_lengkap } = parsed.data;
    
    // Tarik nilai dari body mentah
    const { jurusan, program_studi, nidn, tempat_lahir, tanggal_lahir, jenis_kelamin, email_pribadi, alamat } = body;

    // Cek apakah Email atau NIP sudah digunakan
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

    const hashedPassword = await bcrypt.hash(password, 10);

    // Cari ID untuk role Dosen
    const roleDosen = await prisma.masterRole.findFirst({ where: { nama_role: "dosen" } });

    const autoUsername = email.split('@')[0];
    
    // Menyimpan data user sekaligus membuat relasi profil jurusan dan prodi ke tabel master_dosen
    await prisma.user.create({
      data: {
        username: autoUsername,
        email: email,
        password_hash: hashedPassword,
        // PERBAIKAN: Fallback id harus 3 (Dosen). Jika pakai 2, user baru bisa otomatis jadi Admin!
        role_id: roleDosen?.id || 3, 
        status_akun: "pending",
        master_dosen: {
          create: {
            nip: nip,
            nama_lengkap: nama_lengkap,
<<<<<<< HEAD
            // PERBAIKAN: Fallback string kosong agar Prisma tidak error jika data frontend terputus
            jurusan: jurusan || "", 
            program_studi: program_studi || "",
=======
            nidn: nidn || null,
            tempat_lahir: tempat_lahir || null,
            tanggal_lahir: tanggal_lahir ? new Date(tanggal_lahir) : null,
            jenis_kelamin: jenis_kelamin || null,
            email_pribadi: email_pribadi || null,
            alamat: alamat || null,
            jurusan: jurusan,
            program_studi: program_studi,
>>>>>>> b89cd71014d8a27631cfffb5ea009c1f0e1917e1
          }
        }
      }
    });

    return NextResponse.json({ message: "Registrasi sukses. Menunggu verifikasi dari Admin Fakultas." }, { status: 201 });

  } catch (error) {
    console.error("Register Error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan pada server saat registrasi." }, { status: 500 });
  }
}