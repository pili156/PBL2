import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

function normalizeStatus(val: string | null): string | null {
  if (!val) return null;
  const v = val.toLowerCase();
  if (v === "selesai") return "Selesai";
  if (v === "lulus") return "Lulus";
  if (v === "do") return "DO";
  if (v === "aktif" || v === "diterima" || v === "terverifikasi" || v === "pending" || v === "menunggu_verifikasi") return "Aktif";
  return val;
}

export async function GET() {
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
          data_tubel: true,
          data_doktor: true,
          data_profesor: true,
          data_izin_belajar: true,
        },
      });

      dataDosen = raw.map((d) => {
        const pengajuan = d.user?.pengajuan_studi?.[0] ?? null;
        const jenisStudi = pengajuan?.jenis_studi?.nama_jenis ?? null;
        const statusPengajuan = pengajuan?.status?.nama_status ?? null;
        const tubel = d.data_tubel;
        const doktor = d.data_doktor;
        const profesor = d.data_profesor;
        const izinBelajar = d.data_izin_belajar;

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
          jabatan: d.jabatan || (profesor ? "Profesor" : null),
          program_studi: d.program_studi,
          pangkat_golongan: d.pangkat_golongan,
          no_telp: d.no_telp,
          gelar: d.gelar,
          pendidikan_terakhir: d.pendidikan_terakhir || tubel?.jenjang || null,
          bidang_keahlian: d.bidang_keahlian || tubel?.jurusan_studi || doktor?.bidang_keahlian || profesor?.bidang_keahlian || null,
          status_dosen: d.status_dosen || tubel?.status_kuliah || doktor?.status || profesor?.status || null,
          tanggal_lulus: d.tanggal_lulus || tubel?.tanggal_lulus || doktor?.tanggal_lulus || null,
          jenis_pengajuan_studi: jenisStudi || tubel?.jenis_pengajuan_studi || izinBelajar?.jenis_status_belajar || null,
          status_kuliah: normalizeStatus(statusPengajuan || tubel?.status_kuliah || doktor?.status || izinBelajar?.lulus_belum || null),
          perguruan_tinggi: pengajuan?.perguruan_tinggi || tubel?.tempat_studi || doktor?.perguruan_tinggi || profesor?.perguruan_tinggi || null,
          program_studi_doktor: doktor?.program_studi || null,
          tahun_doktor: doktor?.tahun || null,
          tahun_profesor: profesor?.tahun || null,
          data_doktor: doktor,
          data_profesor: profesor,
          data_izin_belajar: izinBelajar,
        };
      });
    } catch (dbError) {
      console.error("Gagal query ke tabel masterDosen:", dbError);
      dataDosen = [];
    }

    const totalDosen = dataDosen.length;

    const tugasBelajarTotal = dataDosen.filter((d: any) =>
      (d.jenis_pengajuan_studi || "").toLowerCase().includes("tugas belajar") &&
      (d.pendidikan_terakhir || "").toUpperCase() !== "S3"
    ).length;

    const tugasBelajarAktif = dataDosen.filter((d: any) =>
      (d.jenis_pengajuan_studi || "").toLowerCase().includes("tugas belajar") &&
      normalizeStatus(d.status_kuliah) === "Aktif" &&
      (d.pendidikan_terakhir || "").toUpperCase() !== "S3"
    ).length;

    const tugasBelajarLulus = dataDosen.filter((d: any) =>
      (d.jenis_pengajuan_studi || "").toLowerCase().includes("tugas belajar") &&
      normalizeStatus(d.status_kuliah) === "Lulus" &&
      (d.pendidikan_terakhir || "").toUpperCase() !== "S3"
    ).length;

    const tugasBelajarDO = dataDosen.filter((d: any) =>
      (d.jenis_pengajuan_studi || "").toLowerCase().includes("tugas belajar") &&
      normalizeStatus(d.status_kuliah) === "DO" &&
      (d.pendidikan_terakhir || "").toUpperCase() !== "S3"
    ).length;

    const izinBelajarTotal = dataDosen.filter((d: any) =>
      (d.jenis_pengajuan_studi || "").toLowerCase().includes("izin belajar") &&
      (d.pendidikan_terakhir || "").toUpperCase() !== "S3"
    ).length;

    const izinBelajarAktif = dataDosen.filter((d: any) =>
      (d.jenis_pengajuan_studi || "").toLowerCase().includes("izin belajar") &&
      normalizeStatus(d.status_kuliah) === "Aktif" &&
      (d.pendidikan_terakhir || "").toUpperCase() !== "S3"
    ).length;

    const izinBelajarSelesai = dataDosen.filter((d: any) =>
      (d.jenis_pengajuan_studi || "").toLowerCase().includes("izin belajar") &&
      normalizeStatus(d.status_kuliah) === "Selesai" &&
      (d.pendidikan_terakhir || "").toUpperCase() !== "S3"
    ).length;

    const doktorTotal = dataDosen.filter((d: any) => {
      const pendidikanTerakhir = (d.pendidikan_terakhir || "").toUpperCase();
      return pendidikanTerakhir === "S3";
    }).length;

    const profesorTotal = dataDosen.filter((d: any) => {
      const isJabatanProfesor = (d.jabatan || "").toLowerCase() === "profesor";
      const hasProfesorData = d.data_profesor != null;
      const isS3 = (d.pendidikan_terakhir || "").toUpperCase() === "S3";
      return (isJabatanProfesor || hasProfesorData) && isS3;
    }).length;

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
    console.error("Error pada API Dashboard Summary Buku Induk:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
