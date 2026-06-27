export type TabKey = "semua" | "tugas" | "izin" | "doktor" | "profesor";

export type StatusDosen = "Aktif" | "Selesai" | "Lulus" | "DO" | "Pensiun";

export interface DosenSemua {
  no: number;
  nama: string;
  nip: string;
  jurusan: string;
  pendidikan_terakhir: string;
  statusStudi: string;
  status: StatusDosen;
}

export interface DosenTugasBelajar {
  no: number;
  nama: string;
  nip: string;
  pendidikan_terakhir: string;
  kampusTujuan: string;
  tahunMulai: number;
  semester: number;
  status: StatusDosen;
}

export interface DosenIzinBelajar {
  no: number;
  nama: string;
  nip: string;
  pendidikan_terakhir: string;
  kampusTujuan: string;
  tahunMulai: number;
  status: StatusDosen;
}

export interface DosenDoktor {
  urutan: string;
  nama: string;
  nip: string;
  jurusan: string;
  kampusLulusan: string;
  tanggalLulus: string;
  status: StatusDosen;
}

export interface DosenProfesor {
  urutan: string;
  nama: string;
  nip: string;
  jurusan: string;
  bidangKeahlian: string;
  tmtProfesor: string;
  status: StatusDosen;
}
