import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { prisma } from "@/src/lib/prisma";

export const runtime = "nodejs";
export const maxBodySize = "10mb";

interface ImportResult {
  created: number;
  updated: number;
  skipped: number;
  errors: string[];
  sheets: Record<string, { imported: number; errors: number }>;
}

function parseDate(val: unknown): Date | null {
  if (!val) return null;
  if (typeof val === "number") {
    const d = new Date((val - 25569) * 86400 * 1000);
    return isNaN(d.getTime()) ? null : d;
  }
  const str = String(val).trim();
  if (!str) return null;
  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
}

function getVal(row: Record<string, unknown>, keys: string[]): string {
  for (const k of keys) {
    const v = row[k];
    if (v !== undefined && v !== null && String(v).trim() !== "") {
      return String(v).trim();
    }
  }
  return "";
}

function findHeader(headers: string[], terms: string[]): string {
  return (
    headers.find((h) =>
      terms.some((t) => h.toUpperCase().includes(t.toUpperCase()))
    ) || ""
  );
}

function upsertDosenByNip(nip: string, data: Record<string, unknown>) {
  return prisma.masterDosen.upsert({
    where: { nip },
    create: { nip, ...data },
    update: data,
  });
}

async function processTubelSheet(
  raw: Record<string, unknown>[]
): Promise<{ imported: number; errors: number }> {
  let imported = 0;
  let errors = 0;
  const headers = Object.keys(raw[0] || {});

  const hNama = findHeader(headers, ["NAMA"]);
  const hNip = findHeader(headers, ["NIP"]);
  const hJurusan = findHeader(headers, ["JURUSAN/BAGIAN", "JURUSAN"]);
  const hJabatan = findHeader(headers, ["JABATAN"]);
  const hDosenTendik = findHeader(headers, ["DOSEN/ TENDIK", "DOSEN/TENDIK"]);
  const hStatusKuliah = findHeader(headers, ["STATUS KULIAH"]);
  const hTglLulus = findHeader(headers, ["TANGGAL LULUS"]);
  const hJenisPengajuan = findHeader(headers, ["JENIS PENGAJUAN"]);
  const hJenisTubel = findHeader(headers, ["JENIS TUGAS BELAJAR"]);
  const hPrioritas = findHeader(headers, ["TINGKAT PRIORITAS"]);
  const hMonitoring = findHeader(headers, ["MONITORING"]);
  const hPeriode = findHeader(headers, ["PERIODE STUDI"]);
  const hTmtTubel = findHeader(headers, ["TMT TUBEL"]);
  const hSelesaiTubel = findHeader(headers, ["SELESAI TUBEL"]);
  const hSumberBiaya = findHeader(headers, ["SUMBER BIAYA"]);
  const hTempatStudi = findHeader(headers, ["TEMPAT STUDI"]);
  const hJurusanStudi = findHeader(headers, ["JURUSAN STUDI", "PROGRAM STUDI"]);
  const hJenjang = findHeader(headers, ["JENJANG"]);
  const hTahunAnggaran = findHeader(headers, ["TAHUN ANGGARAN"]);
  const hNoSk = findHeader(headers, ["NO SK TUBEL", "NO SK"]);
  const hTglSk = findHeader(headers, ["TANGGAL SK"]);
  const hTglUpload = findHeader(headers, ["TANGGAL UPLOAD"]);
  const hLinkSk = findHeader(headers, ["LINK SK TUBEL", "LINK SK"]);
  const hLinkPengajuan = findHeader(headers, ["LINK PENGAJUAN"]);
  const hPeriodePerpanjangan = findHeader(headers, ["PERIODE PERPANJANGAN"]);
  const hNoSkPerpanjangan = findHeader(headers, ["NO SK PERPANJANGAN"]);
  const hLinkSkPerpanjangan = findHeader(headers, ["LINK SK PERPANJANGAN"]);
  const hNoSetneg = findHeader(headers, ["NO PERSETUJUAN", "PERJADIN"]);
  const hLinkSetneg = findHeader(headers, ["LINK PERSETUJUAN", "SETNEG"]);
  const hMasaPemberhentian = findHeader(headers, ["MASA PEMBERHENTIAN"]);
  const hPemberhentian = findHeader(headers, [
    "STATUS SURAT PEMBERHENTIAN",
    "PEMBERHENTIAN TUNJANGAN",
  ]);
  const hIjazah = findHeader(headers, ["IJAZAH"]);
  const hPengaktifan = findHeader(headers, ["DOKUMEN PENGAKTIFAN"]);
  const hCatatan = findHeader(headers, ["CATATAN"]);

  for (let i = 0; i < raw.length; i++) {
    const row = raw[i];
    try {
      const nama = getVal(row, hNama ? [hNama] : ["NAMA"]);
      const nip = getVal(row, hNip ? [hNip] : ["NIP"]);

      if (!nama && !nip) continue;

      const jurusanUpa = getVal(row, hJurusan ? [hJurusan] : ["JURUSAN/BAGIAN/UPA"]);
      const jabatan = getVal(row, hJabatan ? [hJabatan] : ["JABATAN"]);
      const dosenTendik = getVal(row, hDosenTendik ? [hDosenTendik] : ["DOSEN/ TENDIK"]);
      const statusKuliah = getVal(row, hStatusKuliah ? [hStatusKuliah] : ["STATUS KULIAH"]);
      const tanggalLulus = parseDate(getVal(row, hTglLulus ? [hTglLulus] : ["TANGGAL LULUS"]));
      const jenisPengajuan = getVal(row, hJenisPengajuan ? [hJenisPengajuan] : ["JENIS PENGAJUAN STUDI"]);
      const jenisTubel = getVal(row, hJenisTubel ? [hJenisTubel] : ["JENIS TUGAS BELAJAR"]);
      const prioritas = getVal(row, hPrioritas ? [hPrioritas] : ["TINGKAT PRIORITAS"]);
      const monitoring = getVal(row, hMonitoring ? [hMonitoring] : ["MONITORING"]);
      const periode = getVal(row, hPeriode ? [hPeriode] : ["PERIODE STUDI"]);
      const tmtTubel = parseDate(getVal(row, hTmtTubel ? [hTmtTubel] : ["TMT TUBEL"]));
      const selesaiTubel = parseDate(getVal(row, hSelesaiTubel ? [hSelesaiTubel] : ["SELESAI TUBEL"]));
      const sumberBiaya = getVal(row, hSumberBiaya ? [hSumberBiaya] : ["SUMBER BIAYA"]);
      const tempatStudi = getVal(row, hTempatStudi ? [hTempatStudi] : ["TEMPAT STUDI"]);
      const jurusanStudi = getVal(row, hJurusanStudi ? [hJurusanStudi] : ["JURUSAN STUDI"]);
      const jenjang = getVal(row, hJenjang ? [hJenjang] : ["JENJANG"]);
      const tahunAnggaran = getVal(row, hTahunAnggaran ? [hTahunAnggaran] : ["TAHUN ANGGARAN"]);
      const noSk = getVal(row, hNoSk ? [hNoSk] : ["NO SK TUBEL"]);
      const tglSk = parseDate(getVal(row, hTglSk ? [hTglSk] : ["TANGGAL SK"]));
      const tglUpload = parseDate(getVal(row, hTglUpload ? [hTglUpload] : ["TANGGAL UPLOAD APLIKASI"]));
      const linkSk = getVal(row, hLinkSk ? [hLinkSk] : ["LINK SK TUBEL"]);
      const linkPengajuan = getVal(row, hLinkPengajuan ? [hLinkPengajuan] : ["LINK PENGAJUAN"]);
      const periodePerpanjangan = getVal(row, hPeriodePerpanjangan ? [hPeriodePerpanjangan] : ["PERIODE PERPANJANGAN"]);
      const noSkPerpanjangan = getVal(row, hNoSkPerpanjangan ? [hNoSkPerpanjangan] : ["NO SK PERPANJANGAN"]);
      const linkSkPerpanjangan = getVal(row, hLinkSkPerpanjangan ? [hLinkSkPerpanjangan] : ["LINK SK PERPANJANGAN"]);
      const noSetneg = getVal(row, hNoSetneg ? [hNoSetneg] : ["NO PERSETUJUAN PERJADIN"]);
      const linkSetneg = getVal(row, hLinkSetneg ? [hLinkSetneg] : ["LINK PERSETUJUAN"]);
      const masaPemberhentian = getVal(row, hMasaPemberhentian ? [hMasaPemberhentian] : ["MASA PEMBERHENTIAN"]);
      const pemberhentian = getVal(row, hPemberhentian ? [hPemberhentian] : ["STATUS SURAT PEMBERHENTIAN"]);
      const ijazah = getVal(row, hIjazah ? [hIjazah] : ["IJAZAH"]);
      const pengaktifan = getVal(row, hPengaktifan ? [hPengaktifan] : ["DOKUMEN PENGAKTIFAN"]);
      const catatan = getVal(row, hCatatan ? [hCatatan] : ["CATATAN"]);

      if (nip) {
        const existing = await prisma.masterDosen.findUnique({ where: { nip } });
        if (existing) {
          await prisma.masterDosen.update({
            where: { id: existing.id },
            data: {
              nama_lengkap: nama || existing.nama_lengkap,
              jurusan: jurusanUpa || existing.jurusan,
              jabatan: jabatan || existing.jabatan,
              pendidikan_terakhir: jenjang || existing.pendidikan_terakhir,
              bidang_keahlian: jurusanStudi || existing.bidang_keahlian,
              status_dosen: statusKuliah === "Lulus" ? "Aktif" : existing.status_dosen,
            },
          });
        } else {
          await prisma.masterDosen.create({
            data: {
              nip,
              nama_lengkap: nama,
              jurusan: jurusanUpa,
              jabatan,
              pendidikan_terakhir: jenjang,
              bidang_keahlian: jurusanStudi,
            },
          });
        }

        const dosen = await prisma.masterDosen.findUnique({ where: { nip } });
        if (dosen) {
          const tubelData = {
            dosen_tendik: dosenTendik || null,
            jurusan_bagian_upa: jurusanUpa || null,
            nama_pegawai: nama || null,
            nip_baru: nip || null,
            jabatan_fungsional: jabatan || null,
            status_kuliah: statusKuliah || null,
            tanggal_lulus: tanggalLulus,
            jenis_pengajuan_studi: jenisPengajuan || null,
            jenis_tugas_belajar: jenisTubel || null,
            tingkat_prioritas_pembinaan: prioritas || null,
            monitoring: monitoring || null,
            periode_studi: periode || null,
            tmt_tubel: tmtTubel,
            selesai_tubel: selesaiTubel,
            sumber_biaya: sumberBiaya || null,
            tempat_studi: tempatStudi || null,
            jurusan_studi: jurusanStudi || null,
            jenjang: jenjang || null,
            tahun_anggaran: tahunAnggaran || null,
            no_sk_tubel: noSk || null,
            tanggal_sk_tubel: tglSk,
            tanggal_upload_aplikasi: tglUpload,
            link_sk_tubel: linkSk || null,
            link_pengajuan_ibel_tb: linkPengajuan || null,
            periode_perpanjangan_tubel: periodePerpanjangan || null,
            no_sk_perpanjangan_tubel: noSkPerpanjangan || null,
            link_sk_perpanjangan_tubel: linkSkPerpanjangan || null,
            no_persetujuan_perjadin_setneg: noSetneg || null,
            link_persetujuan_setneg: linkSetneg || null,
            masa_pemberhentian_tunjangan: masaPemberhentian || null,
            pemberhentian_tunjangan: pemberhentian || null,
            ijazah_transkrip: ijazah || null,
            dokumen_pengaktifan_kembali: pengaktifan || null,
            catatan: catatan || null,
          };

          await prisma.dataTubel.upsert({
            where: { dosen_id: dosen.id },
            create: { dosen_id: dosen.id, ...tubelData },
            update: tubelData,
          });
        }
        imported++;
      }
    } catch (err: any) {
      errors++;
    }
  }
  return { imported, errors };
}

async function processDoktorSheet(
  raw: Record<string, unknown>[]
): Promise<{ imported: number; errors: number }> {
  let imported = 0;
  let errors = 0;

  for (let i = 0; i < raw.length; i++) {
    const row = raw[i];
    try {
      const nip = String(row["NIP/NIK"] || "").trim();
      const nama = String(row["Nama Dosen"] || row["Nama"] || "").trim();
      if (!nama) continue;

      const jurusan = String(row["Jurusan"] || "").trim();
      const programStudi = String(row["Program Studi"] || "").trim();
      const gelarAkademik = String(row["Gelar Akademik"] || "").trim();
      const bidangKeahlian = String(row["Bidang Keahlian"] || "").trim();
      const perguruanTinggi = String(row["Perguruan Tinggi"] || "").trim();
      const tahun = parseInt(String(row["Tahun"] || "0")) || null;
      const ijazah = String(row["ijazah"] || "").trim();
      const status = String(row["Status"] || "").trim();
      const tanggalLulus = parseDate(row["Tgl Lulus"]);

      let dosenId: number | null = null;
      if (nip) {
        const dosen = await upsertDosenByNip(nip, {
          nama_lengkap: nama || undefined,
          jurusan: jurusan || undefined,
          bidang_keahlian: bidangKeahlian || undefined,
          pendidikan_terakhir: "S3",
        });
        dosenId = dosen.id;
      }

      if (dosenId) {
        await prisma.dataDoktor.upsert({
          where: { dosen_id: dosenId },
          create: {
            dosen_id: dosenId,
            nip: nip || null,
            nama_dosen: nama,
            jurusan,
            program_studi: programStudi || null,
            gelar_akademik: gelarAkademik || null,
            bidang_keahlian: bidangKeahlian || null,
            perguruan_tinggi: perguruanTinggi || null,
            tahun,
            ijazah: ijazah || null,
            status: status || null,
            tanggal_lulus: tanggalLulus,
          },
          update: {
            nip: nip || null,
            nama_dosen: nama,
            jurusan,
            program_studi: programStudi || null,
            gelar_akademik: gelarAkademik || null,
            bidang_keahlian: bidangKeahlian || null,
            perguruan_tinggi: perguruanTinggi || null,
            tahun,
            ijazah: ijazah || null,
            status: status || null,
            tanggal_lulus: tanggalLulus,
          },
        });
      }
      imported++;
    } catch (err: any) {
      errors++;
    }
  }
  return { imported, errors };
}

async function processProfesorSheet(
  raw: Record<string, unknown>[]
): Promise<{ imported: number; errors: number }> {
  let imported = 0;
  let errors = 0;

  for (let i = 0; i < raw.length; i++) {
    const row = raw[i];
    try {
      const nip = String(row["NIP/NIK"] || "").trim();
      const nama = String(row["Nama Dosen"] || row["Nama"] || "").trim();
      if (!nama) continue;

      const jurusan = String(row["Jurusan"] || "").trim();
      const bidangKeahlian = String(row["Bidang Keahlian"] || "").trim();
      const perguruanTinggi = String(row["Perguruan Tinggi"] || "").trim();
      const tahun = parseInt(String(row["Tahun"] || "0")) || null;
      const ijazah = String(row["ijazah"] || "").trim();
      const status = String(row["Status"] || "").trim();

      let dosenId: number | null = null;
      if (nip) {
        const dosen = await upsertDosenByNip(nip, {
          nama_lengkap: nama || undefined,
          jurusan: jurusan || undefined,
          bidang_keahlian: bidangKeahlian || undefined,
        });
        dosenId = dosen.id;
      }

      if (dosenId) {
        await prisma.dataProfesor.upsert({
          where: { dosen_id: dosenId },
          create: {
            dosen_id: dosenId,
            nip: nip || null,
            nama_dosen: nama,
            jurusan,
            bidang_keahlian: bidangKeahlian || null,
            perguruan_tinggi: perguruanTinggi || null,
            tahun,
            ijazah: ijazah || null,
            status: status || null,
          },
          update: {
            nip: nip || null,
            nama_dosen: nama,
            jurusan,
            bidang_keahlian: bidangKeahlian || null,
            perguruan_tinggi: perguruanTinggi || null,
            tahun,
            ijazah: ijazah || null,
            status: status || null,
          },
        });
      }
      imported++;
    } catch (err: any) {
      errors++;
    }
  }
  return { imported, errors };
}

async function processIzinBelajarSheet(
  raw: Record<string, unknown>[]
): Promise<{ imported: number; errors: number }> {
  let imported = 0;
  let errors = 0;

  for (let i = 0; i < raw.length; i++) {
    const row = raw[i];
    try {
      const nip = String(row["NIP"] || "").trim();
      const nama = String(row["Nama"] || "").trim();
      if (!nama) continue;

      const jurusan = String(row["Jurusan"] || "").trim();
      const tahunAkademik = String(row["TA"] || row["Tahun Akademik"] || "").trim();
      const jenisStatusBelajar = String(row["Jenis status Belajar"] || "").trim();
      const sumberBiaya = String(row["SUMBER BIAYA"] || "").trim();
      const tempatStudi = String(row["TEMPAT STUDI"] || "").trim();
      const noSk = String(row["No SK Surat Ijin Belajar"] || "").trim();
      const tanggalSk = parseDate(row["Tgl SK Surat Ijin Belajar"]);
      const lulusBelum = String(row["LULUS / BELUM LULUS"] || row["Lulus / Belum Lulus "] || "").trim();
      const masaKuliahAktif = String(row["Masa Kuliah Aktif"] || "").trim();

      if (nip) {
        const dosen = await upsertDosenByNip(nip, {
          nama_lengkap: nama || undefined,
          jurusan: jurusan || undefined,
        });

        await prisma.dataIzinBelajar.upsert({
          where: { dosen_id: dosen.id },
          create: {
            dosen_id: dosen.id,
            nip: nip || null,
            nama_dosen: nama,
            jurusan,
            tahun_akademik: tahunAkademik || null,
            jenis_status_belajar: jenisStatusBelajar || null,
            sumber_biaya: sumberBiaya || null,
            tempat_studi: tempatStudi || null,
            no_sk: noSk || null,
            tanggal_sk: tanggalSk,
            lulus_belum: lulusBelum || null,
            masa_kuliah_aktif: masaKuliahAktif || null,
          },
          update: {
            nip: nip || null,
            nama_dosen: nama,
            jurusan,
            tahun_akademik: tahunAkademik || null,
            jenis_status_belajar: jenisStatusBelajar || null,
            sumber_biaya: sumberBiaya || null,
            tempat_studi: tempatStudi || null,
            no_sk: noSk || null,
            tanggal_sk: tanggalSk,
            lulus_belum: lulusBelum || null,
            masa_kuliah_aktif: masaKuliahAktif || null,
          },
        });
      }
      imported++;
    } catch (err: any) {
      errors++;
    }
  }
  return { imported, errors };
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "File tidak ditemukan" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = XLSX.read(buffer, { type: "buffer" });

    const result: ImportResult = {
      created: 0,
      updated: 0,
      skipped: 0,
      errors: [],
      sheets: {},
    };

    for (const sheetName of workbook.SheetNames) {
      const sheet = workbook.Sheets[sheetName];
      const raw: Record<string, unknown>[] = XLSX.utils.sheet_to_json(sheet, {
        defval: "",
      });

      if (raw.length === 0) continue;

      const upperName = sheetName.toUpperCase().replace(/\s+/g, " ");

      try {
        if (
          upperName.includes("DATA TUBEL") ||
          upperName.includes("DATA TUBEL") ||
          (upperName === "DATA TUBEL")
        ) {
          const r = await processTubelSheet(raw);
          result.sheets["DATA TUBEL"] = r;
          result.created += r.imported;
          result.errors.push(
            ...Array.from({ length: r.errors }, (_, j) => `Sheet ${sheetName}: error baris ${j + 1}`)
          );
        } else if (upperName.includes("DATA K A P") || upperName.includes("DATA KAP")) {
          const r = await processTubelSheet(raw);
          result.sheets["DATA KAP"] = r;
          result.created += r.imported;
        } else if (upperName.includes("URUTAN DOKTOR")) {
          const r = await processDoktorSheet(raw);
          result.sheets["URUTAN DOKTOR"] = r;
          result.created += r.imported;
        } else if (upperName.includes("URUTAN PROF")) {
          const r = await processProfesorSheet(raw);
          result.sheets["URUTAN PROF"] = r;
          result.created += r.imported;
        } else if (
          upperName.includes("IJIN BELAJAR") ||
          upperName.includes("IZIN BELAJAR")
        ) {
          const r = await processIzinBelajarSheet(raw);
          result.sheets[sheetName] = r;
          result.created += r.imported;
        } else if (upperName.includes("TUGAS BELAJAR")) {
          const r = await processTubelSheet(raw);
          result.sheets["TUGAS BELAJAR"] = r;
          result.created += r.imported;
        }
      } catch (sheetError: any) {
        result.errors.push(`Sheet ${sheetName}: ${sheetError.message}`);
      }
    }

    return NextResponse.json({
      message: "Import selesai",
      result,
      totalSheets: workbook.SheetNames.length,
    });
  } catch (error: any) {
    console.error("Import Excel error:", error);
    return NextResponse.json(
      { error: error.message || "Gagal import Excel" },
      { status: 500 }
    );
  }
}
