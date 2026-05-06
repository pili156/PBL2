import { DocumentType } from "./type";

export const DOCUMENT_GROUPS = {
  kesehatan: {
    label: "1. Kesehatan & rekomendasi",
    description: "Dokumen kesehatan dan rekomendasi dari atasan",
    documents: [
      {
        id: "sk_kesehatan_jasmani" as DocumentType,
        title: "SK Kesehatan Jasmani",
        description: "Dari RS Pemerintah atau Rumah Sakit Bersertifikat",
        required: true,
        status: "wajib" as const,
      },
      {
        id: "sk_kesehatan_rohani" as DocumentType,
        title: "SK Kesehatan Rohani",
        description: "Dari dokter spesialis kesehatan mental",
        required: true,
        status: "wajib" as const,
      },
      {
        id: "surat_rekomendasi_atasan" as DocumentType,
        title: "Surat Rekomendasi Atasan",
        description: "Rekomendasi resmi dari kepala satuan kerja",
        required: true,
        status: "wajib" as const,
      },
      {
        id: "surat_keterangan_pimpinan" as DocumentType,
        title: "Surat Keterangan Pimpinan",
        description: "Surat keterangan kesesuaian bidang dari pimpinan",
        required: true,
        status: "wajib" as const,
      },
    ] as const,
  },
  identitas: {
    label: "2. Dokumen Identitas & Keluarga",
    description: "Dokumen identitas dan keluarga yang diperlukan",
    documents: [
      {
        id: "kartu_virtual_asn" as DocumentType,
        title: "Kartu Virtual ASN",
        description: "Bukti identitas dari ASN Portal",
        required: true,
        status: "wajib" as const,
      },
      {
        id: "akta_nikah" as DocumentType,
        title: "Akta Nikah",
        description: "Salinan bersertifikat akta nikah",
        required: false,
        status: "terunggu" as const,
      },
      {
        id: "kp4" as DocumentType,
        title: "KP-4",
        description: "Daftar Susunan Keluarga (KP-4)",
        required: false,
        status: "terunggu" as const,
      },
    ] as const,
  },
  kepegawaian: {
    label: "3. Dokumen Legalitas Kepegawaian",
    description: "Dokumen-dokumen kepegawaian yang sah",
    documents: [
      {
        id: "kartu_pegawai_karpeg" as DocumentType,
        title: "Kartu Pegawai (KARPEG)",
        description: "Kartu pegawai resmi dari institusi",
        required: true,
        status: "wajib" as const,
      },
      {
        id: "sk_cpns" as DocumentType,
        title: "SK Cpns",
        description: "Surat Keputusan pengangkatan Cpns",
        required: false,
        status: "terunggu" as const,
      },
      {
        id: "sk_pns" as DocumentType,
        title: "SK PNS",
        description: "Surat Keputusan pengangkatan PNS",
        required: false,
        status: "terunggu" as const,
      },
      {
        id: "sk_pangkat_terakhir" as DocumentType,
        title: "SK Pangkat Terakhir",
        description: "SK pangkat/golongan terakhir",
        required: true,
        status: "wajib" as const,
      },
      {
        id: "sk_jabatan_terakhir" as DocumentType,
        title: "SK Jabatan Terakhir",
        description: "SK jabatan/fungsional terakhir",
        required: true,
        status: "wajib" as const,
      },
      {
        id: "penilaian_prestasi_kerja" as DocumentType,
        title: "Penilaian Prestasi Kerja",
        description: "Dokumen penilaian prestasi kerja terbaru",
        required: true,
        status: "wajib" as const,
      },
    ] as const,
  },
  akademik: {
    label: "4. Dokumen Akademik & Institusi Tujuan",
    description: "Dokumen akademik dan dari institusi tujuan",
    documents: [
      {
        id: "ijazah_pendidikan_terakhir" as DocumentType,
        title: "Ijazah Pendidikan Terakhir",
        description: "Fotokopi ijazah pendidikan terakhir",
        required: true,
        status: "wajib" as const,
      },
      {
        id: "fotokopi_surat_loa" as DocumentType,
        title: "Fotokopi Surat LoA",
        description: "Letter of Acceptance dari institusi tujuan",
        required: true,
        status: "wajib" as const,
      },
      {
        id: "surat_akreditasi_prodi_kampus" as DocumentType,
        title: "Surat Akreditasi Prodi & Kampus",
        description: "Bukti akreditasi institusi tujuan",
        required: true,
        status: "wajib" as const,
      },
      {
        id: "perjanjian_tugas_belajar" as DocumentType,
        title: "Perjanjian Tugas Belajar",
        description: "Perjanjian tugas belajar dengan institusi",
        required: true,
        status: "wajib" as const,
      },
      {
        id: "surat_pernyataan_pimpinan_unit" as DocumentType,
        title: "Surat Pernyataan Pimpinan Unit",
        description: "Surat pernyataan persetujuan dari pimpinan unit",
        required: true,
        status: "wajib" as const,
      },
      {
        id: "surat_pernyataan_pegawai" as DocumentType,
        title: "Surat Pernyataan Pegawai",
        description: "Surat pernyataan kesanggupan dari pegawai",
        required: true,
        status: "wajib" as const,
      },
      {
        id: "jaminan_pembiayaan" as DocumentType,
        title: "Jaminan Pembiayaan",
        description: "Jaminan pembiayaan untuk studi (khusus Mandiri)",
        required: false,
        status: "terunggu" as const,
      },
      {
        id: "surat_persetujuan_seteng" as DocumentType,
        title: "Surat Persetujuan Seteng",
        description: "Surat persetujuan dari setengan institusi",
        required: false,
        status: "terunggu" as const,
      },
    ] as const,
  },
};

export const STUDY_TYPES = [
  {
    id: "tugas_belajar",
    title: "Tugas Belajar",
    description:
      "Diberikan kepada dosen yang akan mengikuti pendidikan formal dan dibebaskan dari tugas kedinasan sehari-hari.",
    icon: "GraduationCap",
  },
  {
    id: "izin_belajar",
    title: "Izin Belajar",
    description:
      "Diberikan kepada dosen yang mengikuti pendidikan formal dengan biaya sendiri tanpa dibebaskan dari tugas kedinasan.",
    icon: "Book",
  },
];

export const FUNDING_TYPES = [
  {
    id: "beasiswa",
    title: "Beasiswa",
    description:
      "Pendanaan yang bersumber dari sponsor, pemerintah, atau lembaga mitra universitas.",
    icon: "Award",
  },
  {
    id: "mandiri",
    title: "Mandiri",
    description:
      "Pendanaan secara personal atau independen tanpa keterkaitkan kontrak sponsor pihak ketiga.",
    icon: "Wallet",
  },
];

export const STUDY_REGIONS = [
  {
    id: "dalam_negeri",
    title: "Dalam Negeri",
    description: "Kuliah dilakukan di kampus dalam wilayah Negara Indonesia",
    icon: "Book",
  },
  {
    id: "luar_negeri",
    title: "Luar Negeri",
    description: "Kuliah dilakukan di kampus yang berada di luar wilayah Negara Indonesia",
    icon: "GraduationCap",
  },
];

export const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
export const ALLOWED_FILE_TYPES = ["application/pdf"];

export const DOCUMENT_TYPE_TO_MASTER_ID: Record<DocumentType, number> = {
  "sk_kesehatan_jasmani": 9,
  "sk_kesehatan_rohani": 20,
  "surat_rekomendasi_atasan": 10,
  "surat_keterangan_pimpinan": 11,
  "kartu_virtual_asn": 1,
  "akta_nikah": 7,
  "kp4": 8,
  "kartu_pegawai_karpeg": 1,
  "sk_cpns": 2,
  "sk_pns": 3,
  "sk_pangkat_terakhir": 4,
  "sk_jabatan_terakhir": 5,
  "penilaian_prestasi_kerja": 6,
  "ijazah_pendidikan_terakhir": 17,
  "fotokopi_surat_loa": 14,
  "surat_akreditasi_prodi_kampus": 18,
  "jaminan_pembiayaan": 13,
  "perjanjian_tugas_belajar": 12,
  "surat_pernyataan_pimpinan_unit": 15,
  "surat_pernyataan_pegawai": 16,
  "surat_persetujuan_seteng": 19,
};

export async function fetchMasterData() {
  try {
    const response = await fetch('/api/master-data');
    if (!response.ok) throw new Error('Failed to fetch master data');
    return await response.json();
  } catch (error) {
    console.error('Error fetching master data:', error);
    return null;
  }
}
