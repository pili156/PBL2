import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/src/lib/prisma";

interface BukuIndukInput {
  nip?: string;
  nama_lengkap?: string;
  email?: string;
  pangkat_golongan?: string;
  jabatan?: string;
  jurusan?: string;
  program_studi?: string;
  no_telp?: string;
  [key: string]: any;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: idParam } = await params;
  const id = Number(idParam);
  if (Number.isNaN(id)) {
    return NextResponse.json({ error: "ID tidak valid." }, { status: 400 });
  }

  const data = await prisma.masterDosen.findUnique({ 
    where: { id },
    include: {
      user: {
        select: { email: true, username: true }
      },
      data_tubel: true,
      data_doktor: true,
      data_profesor: true,
      data_izin_belajar: true,
    }
  });

  if (!data) {
    return NextResponse.json({ error: "Data dosen tidak ditemukan." }, { status: 404 });
  }

  return NextResponse.json({ data });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: idParam } = await params;
  const id = Number(idParam);
  if (Number.isNaN(id)) {
    return NextResponse.json({ error: "ID tidak valid." }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { data_tubel, data_doktor, data_profesor, data_izin_belajar, email, ...masterFields } = body;

    const updateData: any = {};
    const allowedFields = [
      "nip", "nidn", "nama_lengkap", "gelar", "jenis_kelamin", "tanggal_lahir",
      "provinsi_lahir", "kota_lahir",
      "email_pribadi", "alamat", "no_telp", "jurusan", "program_studi", "jabatan",
      "pangkat_golongan", "status_dosen", "bidang_keahlian",
      "pendidikan_terakhir", "tanggal_lulus",
    ];
    for (const key of allowedFields) {
      if (masterFields[key] !== undefined) {
        updateData[key] = masterFields[key] || null;
      }
    }

    const updated = await prisma.masterDosen.update({
      where: { id },
      data: updateData,
      include: {
        user: { select: { email: true, username: true } }
      }
    });

    if (email !== undefined && updated.user) {
      await prisma.user.update({
        where: { id: updated.user_id || 0 },
        data: { email }
      });
    }

    if (data_tubel !== undefined) {
      await prisma.dataTubel.upsert({
        where: { dosen_id: id },
        update: {
          jenis_pengajuan_studi: data_tubel.jenis_pengajuan_studi || null,
          status_kuliah: data_tubel.status_kuliah || null,
          periode_studi: data_tubel.periode_studi || null,
          no_sk_tubel: data_tubel.no_sk_tubel || null,
          tahun_anggaran: data_tubel.tahun_anggaran || null,
        },
        create: {
          dosen_id: id,
          nip_baru: updated.nip || null,
          nama_pegawai: updated.nama_lengkap || null,
          jurusan_bagian_upa: updated.jurusan || null,
          jabatan_fungsional: updated.jabatan || null,
          jenis_pengajuan_studi: data_tubel.jenis_pengajuan_studi || null,
          status_kuliah: data_tubel.status_kuliah || null,
          periode_studi: data_tubel.periode_studi || null,
          no_sk_tubel: data_tubel.no_sk_tubel || null,
          tahun_anggaran: data_tubel.tahun_anggaran || null,
        },
      });
    }

    if (data_izin_belajar !== undefined) {
      await prisma.dataIzinBelajar.upsert({
        where: { dosen_id: id },
        update: {
          tahun_akademik: data_izin_belajar.tahun_akademik || null,
          no_sk: data_izin_belajar.no_sk || null,
          lulus_belum: data_izin_belajar.lulus_belum || null,
        },
        create: {
          dosen_id: id,
          nip: updated.nip || null,
          nama_dosen: updated.nama_lengkap || null,
          jurusan: updated.jurusan || null,
          tahun_akademik: data_izin_belajar.tahun_akademik || null,
          no_sk: data_izin_belajar.no_sk || null,
          lulus_belum: data_izin_belajar.lulus_belum || null,
        },
      });
    }

    if (data_doktor !== undefined) {
      await prisma.dataDoktor.upsert({
        where: { dosen_id: id },
        update: {
          program_studi: data_doktor.program_studi || null,
          gelar_akademik: data_doktor.gelar_akademik || null,
          perguruan_tinggi: data_doktor.perguruan_tinggi || null,
          tahun: data_doktor.tahun || null,
          status: data_doktor.status || null,
          tanggal_lulus: data_doktor.tanggal_lulus || null,
        },
        create: {
          dosen_id: id,
          nip: updated.nip || null,
          nama_dosen: updated.nama_lengkap || null,
          jurusan: updated.jurusan || null,
          program_studi: data_doktor.program_studi || null,
          gelar_akademik: data_doktor.gelar_akademik || null,
          perguruan_tinggi: data_doktor.perguruan_tinggi || null,
          tahun: data_doktor.tahun || null,
          status: data_doktor.status || null,
          tanggal_lulus: data_doktor.tanggal_lulus || null,
        },
      });
    }

    if (data_profesor !== undefined) {
      await prisma.dataProfesor.upsert({
        where: { dosen_id: id },
        update: {
          bidang_keahlian: data_profesor.bidang_keahlian || null,
          perguruan_tinggi: data_profesor.perguruan_tinggi || null,
          tahun: data_profesor.tahun || null,
          status: data_profesor.status || null,
        },
        create: {
          dosen_id: id,
          nip: updated.nip || null,
          nama_dosen: updated.nama_lengkap || null,
          jurusan: updated.jurusan || null,
          bidang_keahlian: data_profesor.bidang_keahlian || null,
          perguruan_tinggi: data_profesor.perguruan_tinggi || null,
          tahun: data_profesor.tahun || null,
          status: data_profesor.status || null,
        },
      });
    }

    return NextResponse.json({ message: "Data berhasil diperbarui", data: updated });
  } catch (error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ error: "Data dosen tidak ditemukan." }, { status: 404 });
    }
    console.error("Buku Induk update error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan pada server." }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: idParam } = await params;
  const id = Number(idParam);
  if (Number.isNaN(id)) {
    return NextResponse.json({ error: "ID tidak valid." }, { status: 400 });
  }

  try {
    await prisma.masterDosen.delete({ where: { id } });
    return NextResponse.json({ message: "Data berhasil dihapus." }, { status: 200 });
  } catch (error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ error: "Data dosen tidak ditemukan." }, { status: 404 });
    }
    console.error("Buku Induk delete error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan pada server." }, { status: 500 });
  }
}
