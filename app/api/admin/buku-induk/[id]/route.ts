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
    const { email, ...masterFields } = body;

    const updateData: any = {};
    const allowedFields = [
      "nip", "nidn", "nama_lengkap", "gelar", "jenis_kelamin", "tanggal_lahir",
      "provinsi_lahir", "kota_lahir",
      "email_pribadi", "alamat", "no_telp", "jurusan", "program_studi", "jabatan",
      "pangkat_golongan", "status_dosen", "bidang_keahlian",
      "pendidikan_terakhir", "tanggal_lulus",
    ];
    const dateFields = ["tanggal_lahir", "tanggal_lulus"];
    for (const key of allowedFields) {
      if (masterFields[key] !== undefined) {
        if (dateFields.includes(key) && masterFields[key]) {
          updateData[key] = new Date(masterFields[key]);
        } else {
          updateData[key] = masterFields[key] || null;
        }
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

    return NextResponse.json({ message: "Data berhasil diperbarui", data: updated });
  } catch (error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ error: "Data dosen tidak ditemukan." }, { status: 404 });
    }
    console.error("Buku Induk update error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan pada server." }, { status: 500 });
  }
}
