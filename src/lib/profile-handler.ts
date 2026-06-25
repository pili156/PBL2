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
      nidn: user.master_dosen.nidn,
      nama_lengkap: user.master_dosen.nama_lengkap,
      tanggal_lahir: user.master_dosen.tanggal_lahir,
      jenis_kelamin: user.master_dosen.jenis_kelamin,
      email_pribadi: user.master_dosen.email_pribadi,
      alamat: user.master_dosen.alamat,
      pangkat_golongan: user.master_dosen.pangkat_golongan,
      jabatan: user.master_dosen.jabatan,
      jurusan: user.master_dosen.jurusan,
      program_studi: user.master_dosen.program_studi,
      no_telp: user.master_dosen.no_telp,
      gelar: user.master_dosen.gelar,
      pendidikan_terakhir: user.master_dosen.pendidikan_terakhir,
      provinsi_lahir: user.master_dosen.provinsi_lahir,
      kota_lahir: user.master_dosen.kota_lahir,
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

  const { username, nip, nidn, nama_lengkap, tanggal_lahir, jenis_kelamin, email_pribadi, alamat, pangkat_golongan, jabatan, jurusan, program_studi, no_telp, gelar, pendidikan_terakhir, provinsi_lahir, kota_lahir } = parsed.data;

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
        nidn: nidn !== undefined ? nidn : user.master_dosen.nidn,
        nama_lengkap: nama_lengkap || user.master_dosen.nama_lengkap,
        tanggal_lahir: tanggal_lahir ? new Date(tanggal_lahir) : user.master_dosen.tanggal_lahir,
        jenis_kelamin: jenis_kelamin !== undefined ? jenis_kelamin : user.master_dosen.jenis_kelamin,
        email_pribadi: email_pribadi !== undefined ? email_pribadi : user.master_dosen.email_pribadi,
        alamat: alamat !== undefined ? alamat : user.master_dosen.alamat,
        pangkat_golongan: pangkat_golongan || user.master_dosen.pangkat_golongan,
        jabatan: jabatan || user.master_dosen.jabatan,
        jurusan: jurusan || user.master_dosen.jurusan,
        program_studi: program_studi || user.master_dosen.program_studi,
        no_telp: no_telp || user.master_dosen.no_telp,
        gelar: gelar !== undefined ? gelar : user.master_dosen.gelar,
        pendidikan_terakhir: pendidikan_terakhir !== undefined ? pendidikan_terakhir : user.master_dosen.pendidikan_terakhir,
        provinsi_lahir: provinsi_lahir !== undefined ? provinsi_lahir : user.master_dosen.provinsi_lahir,
        kota_lahir: kota_lahir !== undefined ? kota_lahir : user.master_dosen.kota_lahir,
      }
    });
  }

  return NextResponse.json({ message: "Profil berhasil diperbarui" });
}
