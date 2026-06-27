import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { logger } from "@/src/lib/logger";

function normalizeStatus(val: string | null): string | null {
  if (!val) return null;
  const v = val.toLowerCase();
  if (v === "selesai") return "Selesai";
  if (v === "lulus") return "Lulus";
  if (v === "do") return "DO";
  if (v === "aktif" || v === "diterima" || v === "terverifikasi" || v === "pending" || v === "menunggu_verifikasi") return "Aktif";
  return val;
}

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
                take: 1,
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
      logger.error("Gagal query ke tabel masterDosen:", dbError);
      dataDosen = [];
    }

    const totalDosen = dataDosen.length;

    // Single-pass stats computation
    let tugasBelajarTotal = 0;
    let tugasBelajarAktif = 0;
    let tugasBelajarLulus = 0;
    let tugasBelajarDO = 0;
    let izinBelajarTotal = 0;
    let izinBelajarAktif = 0;
    let izinBelajarSelesai = 0;
    let doktorTotal = 0;
    let profesorTotal = 0;

    for (const d of dataDosen) {
      const jenis = (d.jenis_pengajuan_studi || "").toLowerCase();
      const pendidikan = (d.pendidikan_terakhir || "").toUpperCase();
      const isTB = jenis.includes("tugas belajar") && pendidikan !== "S3";
      const isIB = jenis.includes("izin belajar") && pendidikan !== "S3";
      const status = normalizeStatus(d.status_kuliah);

      if (isTB) {
        tugasBelajarTotal++;
        if (status === "Aktif") tugasBelajarAktif++;
        else if (status === "Lulus") tugasBelajarLulus++;
        else if (status === "DO") tugasBelajarDO++;
      }

      if (isIB) {
        izinBelajarTotal++;
        if (status === "Aktif") izinBelajarAktif++;
        else if (status === "Selesai") izinBelajarSelesai++;
      }

      if (pendidikan === "S3") {
        doktorTotal++;
        const isJabatanProfesor = (d.jabatan || "").toLowerCase() === "profesor";
        const hasProfesorData = d.data_profesor != null;
        if (isJabatanProfesor || hasProfesorData) {
          profesorTotal++;
        }
      }
    }

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
    logger.error("Error global pada API Buku Induk:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
