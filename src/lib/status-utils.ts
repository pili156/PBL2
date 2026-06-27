export type StatusDomain = 'pengajuan' | 'verifikasi' | 'evaluasi' | 'pencairan' | 'akun' | 'studi';

const STATUS_LABELS: Record<string, Record<string, string>> = {
  akun: {
    aktif: 'Aktif',
    menunggu: 'Menunggu',
    pending: 'Pending',
  },
  verifikasi: {
    pending: 'Pending',
    terverifikasi: 'Terverifikasi',
    revisi: 'Revisi',
  },
  evaluasi: {
    pending: 'Pending',
    valid: 'Valid',
    revisi: 'Revisi',
    diterima: 'Diterima',
    ditolak: 'Ditolak',
  },
  pencairan: {
    pending: 'Diproses',
    disetujui: 'Disetujui',
    dicairkan: 'Dicairkan',
    selesai: 'Selesai',
    ditolak: 'Ditolak',
    revisi: 'Perlu Revisi',
    draft: 'Draft',
    dibatalkan: 'Dibatalkan',
  },
  pengajuan: {
    draft: 'Draft',
    menunggu_verifikasi: 'Menunggu Verifikasi',
    perlu_revisi: 'Perlu Revisi',
    pending: 'Pending',
    diterima: 'Diterima',
    ditolak: 'Ditolak',
    lulus: 'Lulus',
    terverifikasi: 'Terverifikasi',
    revisi: 'Revisi',
  },
  studi: {
    aktif: 'Aktif',
    belum_ada_sk: 'Belum ada SK',
  },
};

const STATUS_COLORS: Record<string, Record<string, string>> = {
  akun: {
    aktif: 'text-emerald-700 bg-emerald-50 border border-emerald-200',
    menunggu: 'text-amber-700 bg-amber-50 border border-amber-200',
    pending: 'text-amber-700 bg-amber-50 border border-amber-200',
  },
  verifikasi: {
    pending: 'text-amber-700 bg-amber-50 border border-amber-200',
    terverifikasi: 'text-emerald-700 bg-emerald-50 border border-emerald-200',
    revisi: 'text-rose-700 bg-rose-50 border border-rose-200',
  },
  evaluasi: {
    pending: 'text-amber-700 bg-amber-50 border border-amber-200',
    valid: 'text-emerald-700 bg-emerald-50 border border-emerald-200',
    revisi: 'text-rose-700 bg-rose-50 border border-rose-200',
    diterima: 'text-emerald-700 bg-emerald-50 border border-emerald-200',
    ditolak: 'text-rose-700 bg-rose-50 border border-rose-200',
  },
  pencairan: {
    pending: 'text-amber-700 bg-amber-50 border border-amber-200',
    disetujui: 'text-emerald-700 bg-emerald-50 border border-emerald-200',
    dicairkan: 'text-sky-700 bg-sky-50 border border-sky-200',
    selesai: 'text-sky-700 bg-sky-50 border border-sky-200',
    ditolak: 'text-rose-700 bg-rose-50 border border-rose-200',
    revisi: 'text-orange-700 bg-orange-50 border border-orange-200',
    draft: 'text-slate-500 bg-slate-50 border border-slate-200',
    dibatalkan: 'text-rose-700 bg-rose-50 border border-rose-200',
  },
  pengajuan: {
    draft: 'text-slate-500 bg-slate-50 border border-slate-200',
    menunggu_verifikasi: 'text-amber-700 bg-amber-50 border border-amber-200',
    perlu_revisi: 'text-orange-700 bg-orange-50 border border-orange-200',
    pending: 'text-amber-700 bg-amber-50 border border-amber-200',
    diterima: 'text-emerald-700 bg-emerald-50 border border-emerald-200',
    ditolak: 'text-rose-700 bg-rose-50 border border-rose-200',
    lulus: 'text-sky-700 bg-sky-50 border border-sky-200',
    terverifikasi: 'text-emerald-700 bg-emerald-50 border border-emerald-200',
    revisi: 'text-orange-700 bg-orange-50 border border-orange-200',
  },
  studi: {
    aktif: 'text-emerald-700 bg-emerald-50 border border-emerald-200',
    belum_ada_sk: 'text-slate-500 bg-slate-50 border border-slate-200',
  },
};

const STATUS_TOOLTIPS: Record<string, Record<string, string>> = {
  pengajuan: {
    draft: 'Pengajuan masih berupa draf, belum dikirim ke admin',
    menunggu_verifikasi: 'Pengajuan telah dikirim dan menunggu diperiksa oleh Admin',
    perlu_revisi: 'Ada dokumen yang perlu diperbaiki oleh dosen',
    pending: 'Pengajuan dalam antrean verifikasi',
    diterima: 'Pengajuan telah diterima dan disetujui',
    ditolak: 'Pengajuan ditolak oleh admin',
    lulus: 'Program studi telah selesai dilaksanakan',
    terverifikasi: 'Semua dokumen telah diverifikasi',
    revisi: 'Ada dokumen yang perlu diperbaiki',
  },
  verifikasi: {
    pending: 'Dokumen menunggu untuk diperiksa oleh Admin',
    terverifikasi: 'Dokumen telah diperiksa dan dinyatakan valid',
    revisi: 'Dokumen perlu diperbaiki oleh dosen',
  },
  evaluasi: {
    pending: 'KHS menunggu evaluasi oleh Admin',
    valid: 'KHS telah dievaluasi dan dinyatakan valid',
    revisi: 'KHS perlu diperbaiki oleh dosen',
    diterima: 'KHS telah diterima',
    ditolak: 'KHS ditolak, perlu pengajuan ulang',
  },
  pencairan: {
    pending: 'Pengajuan telah diterima dan mengantre untuk diproses',
    disetujui: 'Pengajuan telah disetujui oleh Admin',
    dicairkan: 'Dana telah dicairkan ke rekening tujuan',
    selesai: 'Proses pencairan telah selesai',
    ditolak: 'Pengajuan ditolak',
    revisi: 'Ada data yang perlu diperbaiki',
    draft: 'Pengajuan masih berupa draf',
    dibatalkan: 'Pengajuan telah dibatalkan',
  },
  akun: {
    aktif: 'Akun aktif dan dapat digunakan',
    menunggu: 'Akun menunggu aktivasi oleh Admin',
    pending: 'Akun masih dalam proses verifikasi',
  },
  studi: {
    aktif: 'Status studi aktif',
    belum_ada_sk: 'Belum ada SK yang diterbitkan',
  },
};

export function getStatusTooltip(status?: string | null, domain?: StatusDomain): string {
  if (!status) return '';
  const s = status.toLowerCase().trim();
  const d = domain || detectDomain(s);
  return STATUS_TOOLTIPS[d]?.[s] || '';
}

function detectDomain(status?: string | null): StatusDomain {
  if (!status) return 'pencairan';
  const s = status.toLowerCase().trim();
  if (['aktif', 'menunggu'].includes(s) && !['disetujui'].includes(s)) return 'akun';
  if (['terverifikasi'].includes(s)) return 'verifikasi';
  if (['valid', 'diterima', 'ditolak'].includes(s)) return 'evaluasi';
  if (['dicairkan', 'disetujui', 'selesai', 'draft', 'dibatalkan'].includes(s)) return 'pencairan';
  if (['draft', 'menunggu_verifikasi', 'perlu_revisi', 'lulus'].includes(s)) return 'pengajuan';
  return 'pencairan';
}

export function getStatusLabel(status?: string | null, domain?: StatusDomain): string {
  if (!status) return 'Menunggu';
  const s = status.toLowerCase().trim();
  const d = domain || detectDomain(s);
  return STATUS_LABELS[d]?.[s] || s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, ' ');
}

export function getStatusBadgeClass(status?: string | null, domain?: StatusDomain): string {
  if (!status) return 'text-slate-600 bg-slate-50 border border-slate-200';
  const s = status.toLowerCase().trim();
  const d = domain || detectDomain(s);
  return STATUS_COLORS[d]?.[s] || 'text-slate-600 bg-slate-50 border border-slate-200';
}

export function getStatusColor(status?: string | null, domain?: StatusDomain): string {
  return getStatusBadgeClass(status, domain);
}

export function isStatusDone(status?: string | null, domain?: StatusDomain): boolean {
  if (!status) return false;
  const s = status.toLowerCase().trim();
  const doneValues = {
    verifikasi: ['terverifikasi'],
    evaluasi: ['valid', 'diterima'],
    pencairan: ['dicairkan', 'selesai'],
    pengajuan: ['diterima', 'lulus', 'terverifikasi'],
    akun: ['aktif'],
    studi: ['aktif'],
  };
  const d = domain || detectDomain(s);
  return doneValues[d]?.includes(s) || false;
}

// Backward-compat: normalizeStatus → getStatusLabel for pencairan domain
export function normalizeStatus(status?: string | null): string {
  return getStatusLabel(status, 'pencairan');
}

// Backward-compat: statusBadgeClass → getStatusBadgeClass for pencairan domain
export function statusBadgeClass(status: string): string {
  return getStatusBadgeClass(status, 'pencairan');
}

/**
 * Calculate overall pengajuan status based on submitted documents
 * @param dokumen - Array of documents with file_path and status_verifikasi
 * @param dbStatus - The status from database (e.g. 'ditolak', 'menunggu_verifikasi')
 * @returns 'terverifikasi', 'revisi', 'pending', 'ditolak', or null if no documents submitted
 */
export function getOverallPengajuanStatus(
  dokumen: Array<{ file_path: string | null; status_verifikasi: string }>,
  dbStatus?: string | null
): string | null {
  const normalizedDb = dbStatus?.toLowerCase().trim();

  if (normalizedDb === 'ditolak') return 'ditolak';
  if (normalizedDb === 'lulus') return 'lulus';

  if (!dokumen || dokumen.length === 0) return null;
  
  const submittedDokumen = dokumen.filter((d) => d.file_path);
  if (submittedDokumen.length === 0) return null;
  
  const allTerverifikasi = submittedDokumen.every((d) => d.status_verifikasi === 'terverifikasi');
  const hasRevisi = submittedDokumen.some((d) => d.status_verifikasi === 'revisi');
  
  if (allTerverifikasi) return 'terverifikasi';
  if (hasRevisi) return 'revisi';
  return 'pending';
}
