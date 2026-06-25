import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/src/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    let dataDosen: any[] = [];

    try {
      const raw = await prisma.masterDosen.findMany({
        include: {
          user: {
            include: {
              pengajuan_studi: {
                include: {
                  jenis_studi: true,
                  status: true,
                },
                orderBy: { created_at: "desc" },
              },
            },
          },
        },
      });

      dataDosen = raw.map((d) => {
        const pengajuan = d.user?.pengajuan_studi?.[0] ?? null;
        const jenisStudi = pengajuan?.jenis_studi?.nama_jenis ?? null;
        const statusPengajuan = pengajuan?.status?.nama_status ?? null;

        return {
          id: d.id,
          nip: d.nip,
          nidn: d.nidn,
          nama_lengkap: d.nama_lengkap,
          tanggal_lahir: d.tanggal_lahir,
          jenis_kelamin: d.jenis_kelamin,
          email_pribadi: d.email_pribadi,
          alamat: d.alamat,
          jurusan: d.jurusan,
          jabatan: d.jabatan,
          program_studi: d.program_studi,
          pangkat_golongan: d.pangkat_golongan,
          no_telp: d.no_telp,
          jenis_pengajuan_studi: jenisStudi,
          status_kuliah: statusPengajuan,
          perguruan_tinggi: pengajuan?.perguruan_tinggi ?? null,
        };
      });
    } catch (dbError) {
      console.error("Gagal query ke tabel masterDosen:", dbError);
      dataDosen = [];
    }

    const totalDosen = dataDosen.length;

    const tugasBelajarTotal = dataDosen.filter((d: any) =>
      (d.jenis_pengajuan_studi || "").toLowerCase().includes("tugas belajar")
    ).length;

    const tugasBelajarAktif = dataDosen.filter((d: any) =>
      (d.jenis_pengajuan_studi || "").toLowerCase().includes("tugas belajar") &&
      (d.status_kuliah || "").toLowerCase() === "aktif"
    ).length;

    const tugasBelajarLulus = dataDosen.filter((d: any) =>
      (d.jenis_pengajuan_studi || "").toLowerCase().includes("tugas belajar") &&
      (d.status_kuliah || "").toLowerCase() === "lulus"
    ).length;

    const tugasBelajarDO = dataDosen.filter((d: any) =>
      (d.jenis_pengajuan_studi || "").toLowerCase().includes("tugas belajar") &&
      (d.status_kuliah || "").toLowerCase() === "do"
    ).length;

    const izinBelajarTotal = dataDosen.filter((d: any) =>
      (d.jenis_pengajuan_studi || "").toLowerCase().includes("izin belajar")
    ).length;

    const izinBelajarAktif = dataDosen.filter((d: any) =>
      (d.jenis_pengajuan_studi || "").toLowerCase().includes("izin belajar") &&
      (d.status_kuliah || "").toLowerCase() === "aktif"
    ).length;

    const izinBelajarSelesai = dataDosen.filter((d: any) =>
      (d.jenis_pengajuan_studi || "").toLowerCase().includes("izin belajar") &&
      (d.status_kuliah || "").toLowerCase() === "selesai"
    ).length;

    const doktorTotal = dataDosen.filter((d: any) =>
      (d.jenjang || "").toUpperCase() === "S3"
    ).length;

    const profesorTotal = dataDosen.filter((d: any) =>
      (d.jabatan || "").toLowerCase() === "profesor"
    ).length;

    return NextResponse.json({
      daftarDosen: dataDosen,
      lulusanTerbaru: [],
      stats: {
        totalDosen,
        tugasBelajar: {
          total: tugasBelajarTotal,
          aktif: tugasBelajarAktif,
          lulus: tugasBelajarLulus,
          do: tugasBelajarDO,
        },
        izinBelajar: {
          total: izinBelajarTotal,
          aktif: izinBelajarAktif,
          selesai: izinBelajarSelesai,
        },
        doktor: doktorTotal,
        profesor: profesorTotal,
      },
    }, { status: 200 });

  } catch (error) {
    console.error("Error pada API Buku Induk Master Admin:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: "ID tidak valid" },
        { status: 400 }
      );
    }

    await prisma.masterDosen.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json(
      { message: "Data berhasil dihapus" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error saat menghapus data:", error);
    return NextResponse.json(
      { error: "Gagal menghapus data" },
      { status: 500 }
    );
  }
}
