export function normalizeStatus(status?: string | null): string {
  if (!status) return "Menunggu";
  const text = status.toLowerCase().trim();
  if (["dicairkan", "selesai", "completed"].includes(text)) return "Selesai";
  if (["ditolak", "dibatalkan"].includes(text)) return "Perlu Revisi";
  if (["diproses", "draft", "pending", "menunggu"].includes(text)) return "Diproses";
  if (["disetujui", "diterima", "approved"].includes(text)) return "Disetujui";
  if (text.includes("selesai") || text.includes("cair")) return "Selesai";
  if (text.includes("tolak") || text.includes("batal") || text.includes("revisi")) return "Perlu Revisi";
  if (text.includes("proses") || text.includes("tunggu") || text.includes("draft") || text.includes("pending")) return "Diproses";
  if (text.includes("setuju") || text.includes("terima") || text.includes("approv")) return "Disetujui";
  return "Menunggu";
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
