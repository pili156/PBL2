export interface PengajuanMonitoring {
  id: number;
  user_id: number;
  nama_lengkap: string;
  nip: string;
  jenis_studi: string;
  status: string;
  tanggal_pengajuan: string;
  total_dokumen: number;
  dokumen_terverifikasi: number;
  alamat_kampus: string;
}

export interface DokumenDetail {
  id: number;
  nama_dokumen: string;
  file_path: string;
  status_verifikasi: string;
  catatan_revisi: string | null;
  updated_at: string;
}

export interface PengajuanDetail {
  id: number;
  nama_lengkap: string;
  nip: string;
  jenis_studi: string;
  jalur_pendanaan: string;
  wilayah_studi: string;
  alamat_kampus: string;
  status: string;
  tanggal_pengajuan: string;
  dokumen: DokumenDetail[];
}
