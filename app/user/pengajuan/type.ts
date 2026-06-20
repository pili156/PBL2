export type StudyType = "tugas_belajar" | "izin_belajar";
export type FundingType = "beasiswa" | "mandiri";
export type StudyRegion = "dalam_negeri" | "luar_negeri";

export type DocumentType = 
  | "sk_kesehatan_jasmani"
  | "sk_kesehatan_rohani"
  | "surat_rekomendasi_atasan"
  | "surat_keterangan_pimpinan"
  | "kartu_virtual_asn"
  | "akta_nikah"
  | "kp4"
  | "kartu_pegawai_karpeg"
  | "sk_cpns"
  | "sk_pns"
  | "sk_pangkat_terakhir"
  | "sk_jabatan_terakhir"
  | "penilaian_prestasi_kerja"
  | "ijazah_pendidikan_terakhir"
  | "fotokopi_surat_loa"
  | "surat_akreditasi_prodi_kampus"
  | "jaminan_pembiayaan"
  | "perjanjian_tugas_belajar"
  | "surat_pernyataan_pimpinan_unit"
  | "surat_pernyataan_pegawai"
  | "surat_persetujuan_seteng";

export type UploadFile = {
  id: string;
  name: string;
  size: number;
  url?: string;
  uploadedAt?: string;
};

export type PengajuanFormData = {
  studyType?: StudyType;
  fundingType?: FundingType;
  studyRegion?: StudyRegion;
  namaBeasiswa?: string;
  documents: Record<DocumentType, UploadFile | null>;
};

export type PengajuanStep = 1 | 2 | 3;