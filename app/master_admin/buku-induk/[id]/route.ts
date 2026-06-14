import { NextResponse } from "next/server";
import { prisma } from "../../../../src/lib/prisma"; // Sesuaikan path prisma client kamu ya Mel

// 1. API UNTUK MENGAMBIL DATA LAMA DOSEN (GET)
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const idDosen = parseInt(id);

    if (isNaN(idDosen)) {
      return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
    }

    // Ambil data ke model masterDosen
    const dosen = await prisma.masterDosen.findUnique({
      where: { id: idDosen },
    });

    if (!dosen) {
      return NextResponse.json({ error: "Data pegawai tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ data: dosen }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 2. API UNTUK MENYIMPAN HASIL EDITAN EXCEL (PUT)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const idDosen = parseInt(id);
    const body = await request.json();

    if (isNaN(idDosen)) {
      return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
    }

    // Update data masterDosen di PostgreSQL sesuai ke-34 kolom data excel kamu
    const updatedDosen = await prisma.masterDosen.update({
      where: { id: idDosen },
      data: {
        nip: body.nip || null,
        nama_lengkap: body.nama || null, // disesuaikan field input form ke db
        pangkat_golongan: body.pangkat_golongan || null,
        jabatan: body.jabatan || null,
        jurusan: body.jurusan_bagian_upa || null,
        program_studi: body.program_studi || null,
        // Jika kolom excel lainnya (seperti tmt_tubel dll) belum kamu daftarkan di schema.prisma,
        // Prisma otomatis mengabaikannya tanpa bikin eror crash database.
      },
    });

    return NextResponse.json({ message: "Data berhasil diperbarui", data: updatedDosen }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}