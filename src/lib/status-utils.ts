export function normalizeStatus(status?: string | null): string {
  if (!status) return "Pending";
  const text = status.toLowerCase();
  if (text.includes("selesai") || text.includes("completed")) return "Selesai";
  if (text.includes("disetujui") || text.includes("approved") || text.includes("diterima")) return "Disetujui";
  if (text.includes("revisi") || text.includes("ditolak")) return "Perlu Revisi";
  if (text.includes("diproses") || text.includes("pending") || text.includes("menunggu")) return "Diproses";
  return "Diproses";
}

export function statusBadgeClass(status: string): string {
  switch (status) {
    case "Disetujui": return "text-emerald-700 bg-emerald-50 border border-emerald-200";
    case "Selesai": return "text-sky-700 bg-sky-50 border border-sky-200";
    case "Perlu Revisi": return "text-orange-700 bg-orange-50 border border-orange-200";
    case "Diproses": return "text-amber-700 bg-amber-50 border border-amber-200";
    default: return "text-slate-600 bg-slate-50 border border-slate-200";
  }
}

export function getStatusBadgeClass(status: string): string {
  switch(status?.toLowerCase()) {
    case 'valid': 
    case 'disetujui': 
    case 'selesai': 
      return 'text-emerald-700 bg-emerald-50 border border-emerald-200';
    case 'revisi': 
    case 'ditolak': 
      return 'text-rose-700 bg-rose-50 border border-rose-200';
    case 'pending': 
    case 'menunggu': 
      return 'text-amber-700 bg-amber-50 border border-amber-200';
    default: 
      return 'text-slate-600 bg-slate-50 border border-slate-200';
  }
}
