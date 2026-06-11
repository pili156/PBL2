import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { prisma } from './prisma';
import { profileSchema } from './validation';

export async function getProfile() {
  const headersList = await headers();
  const userEmail = headersList.get('x-user-email');

  if (!userEmail) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: userEmail },
    include: { role: true, master_dosen: true }
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
      no_telp: user.master_dosen.no_telp,
    } : null,
  });
}

export async function updateProfile(request: Request) {
  const headersList = await headers();
  const userEmail = headersList.get('x-user-email');

  if (!userEmail) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = profileSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { username, nip, nama_lengkap, pangkat_golongan, jabatan, unit_kerja, jurusan, program_studi, no_telp } = parsed.data;

  const user = await prisma.user.findUnique({
    where: { email: userEmail },
    include: { master_dosen: true }
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (user.master_dosen) {
    if (nip && nip !== user.master_dosen.nip) {
      const existingDosen = await prisma.masterDosen.findFirst({
        where: { nip, NOT: { id: user.master_dosen.id } }
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
        no_telp: no_telp || user.master_dosen.no_telp,
      }
    });
  }

  return NextResponse.json({ message: "Profil berhasil diperbarui" });
}
