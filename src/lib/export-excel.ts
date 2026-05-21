import * as XLSX from 'xlsx';

export interface DosenRow {
  No: number;
  Nama: string;
  NIP: string;
  Jurusan: string;
  Status: string;
  'Terakhir Update': string;
}

export interface RiwayatStudiRow {
  No: number;
  Semester: string;
  'Tahun Akademik': string;
  IPK: string;
  SKS: number;
  'Tanggal Upload': string;
}

export interface RiwayatKeuanganRow {
  No: number;
  Semester: string;
  Nominal: string;
  'Tanggal Pengajuan': string;
  'Tanggal Cair': string;
  Status: string;
}

export function exportToExcel(
  data: unknown[],
  sheetName: string,
  fileName: string
): Uint8Array {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data as Record<string, unknown>[]);

  const colWidths = Object.keys(data[0] || {}).map((key) => ({
    wch: Math.max(key.length * 2, 15),
  }));
  ws['!cols'] = colWidths;

  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
}

export function exportDosen(data: DosenRow[]): Uint8Array {
  return exportToExcel(data, 'Data Dosen', 'data-dosen.xlsx');
}

export function exportRiwayatStudi(data: RiwayatStudiRow[]): Uint8Array {
  return exportToExcel(data, 'Riwayat Studi', 'riwayat-studi.xlsx');
}

export function exportRiwayatKeuangan(data: RiwayatKeuanganRow[]): Uint8Array {
  return exportToExcel(data, 'Riwayat Keuangan', 'riwayat-keuangan.xlsx');
}
