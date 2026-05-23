import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/src/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userEmail = cookieStore.get("user_email")?.value;

    if (!userEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      include: {
        role: true,
        master_dosen: true,
      }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role?.nama_role,
      master_dosen: user.master_dosen ? {
        nip: user.master_dosen.nip,
        nama_lengkap: user.master_dosen.nama_lengkap,
        pangkat_golongan: user.master_dosen.pangkat_golongan,
        jabatan: user.master_dosen.jabatan,
        unit_kerja: user.master_dosen.unit_kerja,
        jurusan: user.master_dosen.jurusan,
        program_studi: user.master_dosen.program_studi,
      } : null,
    }, { status: 200 });

  } catch (error) {
    console.error("Get Profile Error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan pada server" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const cookieStore = await cookies();
    const userEmail = cookieStore.get("user_email")?.value;

    if (!userEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { username, nip, nama_lengkap, pangkat_golongan, jabatan, unit_kerja, jurusan, program_studi } = body;

    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      include: { master_dosen: true }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (username) {
      const existingUser = await prisma.user.findFirst({
        where: { 
          username: username,
          NOT: { id: user.id }
        }
      });
      if (existingUser) {
        return NextResponse.json({ error: "Username sudah digunakan" }, { status: 400 });
      }
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        username: username || user.username,
      }
    });

    if (user.master_dosen) {
      if (nip && nip !== user.master_dosen.nip) {
        const existingDosen = await prisma.masterDosen.findFirst({
          where: {
            nip: nip,
            NOT: { id: user.master_dosen.id }
          }
        });
        if (existingDosen) {
          return NextResponse.json({ error: "NIP sudah digunakan" }, { status: 400 });
        }
      }

      await prisma.masterDosen.update({
        where: { id: user.master_dosen.id },
        data: {
          nip: nip || user.master_dosen.nip,
          nama_lengkap: nama_lengkap || user.master_dosen.nama_lengkap,
          pangkat_golongan: pangkat_golongan || user.master_dosen.pangkat_golongan,
          jabatan: jabatan || user.master_dosen.jabatan,
          unit_kerja: unit_kerja || user.master_dosen.unit_kerja,
          jurusan: jurusan || user.master_dosen.jurusan,
          program_studi: program_studi || user.master_dosen.program_studi,
        }
      });
    }

    return NextResponse.json({ message: "Profil berhasil diperbarui" }, { status: 200 });

  } catch (error) {
    console.error("Update Profile Error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan pada server" }, { status: 500 });
  }
}