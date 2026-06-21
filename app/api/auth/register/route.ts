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
    
    // Tarik nilai jurusan dan program studi langsung dari body mentah
    // Hal ini untuk mencegah error jika variabel ini belum didaftarkan ke Zod `registerSchema`
    const { jurusan, program_studi } = body;

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

    const roleDosen = await prisma.masterRole.findFirst({ where: { nama_role: "dosen" } });

    const autoUsername = email.split('@')[0];
    
    // Menyimpan data tambahan jurusan dan prodi ke tabel master_dosen
    await prisma.user.create({
      data: {
        username: autoUsername,
        email: email,
        password_hash: hashedPassword,
        role_id: roleDosen?.id || 2, 
        status_akun: "pending",
        master_dosen: {
          create: {
            nip: nip,
            nama_lengkap: nama_lengkap,
            jurusan: jurusan,
            program_studi: program_studi,
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