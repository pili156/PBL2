import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/src/lib/prisma";

interface BukuIndukInput {
  nip?: string;
  nama_lengkap?: string;
  email?: string;
  pangkat_golongan?: string;
  jabatan?: string;
  unit_kerja?: string;
  jurusan?: string;
  program_studi?: string;
  no_telp?: string;
  [key: string]: any;
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  if (Number.isNaN(id)) {
    return NextResponse.json({ error: "ID tidak valid." }, { status: 400 });
  }

  const data = await prisma.masterDosen.findUnique({ 
    where: { id },
    include: {
      user: {
        select: { email: true, username: true }
      }
    }
  });

  if (!data) {
    return NextResponse.json({ error: "Data dosen tidak ditemukan." }, { status: 404 });
  }

  return NextResponse.json({ data });
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  if (Number.isNaN(id)) {
    return NextResponse.json({ error: "ID tidak valid." }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { nip, nama_lengkap, email, pangkat_golongan, jabatan, unit_kerja, jurusan, program_studi, no_telp, ...otherFields } = body as BukuIndukInput;

    // Update master_dosen
    const updateData: any = {};
    if (nip !== undefined) updateData.nip = nip;
    if (nama_lengkap !== undefined) updateData.nama_lengkap = nama_lengkap;
    if (pangkat_golongan !== undefined) updateData.pangkat_golongan = pangkat_golongan;
    if (jabatan !== undefined) updateData.jabatan = jabatan;
    if (unit_kerja !== undefined) updateData.unit_kerja = unit_kerja;
    if (jurusan !== undefined) updateData.jurusan = jurusan;
    if (program_studi !== undefined) updateData.program_studi = program_studi;
    if (no_telp !== undefined) updateData.no_telp = no_telp;

    // Tambah field lain yang mungkin ada di schema
    Object.keys(otherFields).forEach(key => {
      if (otherFields[key] !== undefined) {
        updateData[key] = otherFields[key];
      }
    });

    const updated = await prisma.masterDosen.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: { email: true, username: true }
        }
      }
    });

    // Jika ada update email, update juga di tabel user
    if (email !== undefined && updated.user) {
      await prisma.user.update({
        where: { id: updated.user_id || 0 },
        data: { email }
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
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
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
