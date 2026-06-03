import { prisma } from '@/src/lib/prisma';
import {
  ClipboardList,
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";
import Link from "next/link";

export const dynamic = 'force-dynamic';

const tipeBadge = (tipe: string | null) => {
  const t = (tipe || '').toLowerCase();
  const styles: Record<string, string> = {
    create: 'bg-emerald-100 text-emerald-700',
    update: 'bg-blue-100 text-blue-700',
    delete: 'bg-red-100 text-red-700',
    verifikasi: 'bg-amber-100 text-amber-700',
    login: 'bg-purple-100 text-purple-700',
    evaluasi: 'bg-cyan-100 text-cyan-700',
    pencairan: 'bg-green-100 text-green-700',
  };
  return styles[t] || 'bg-slate-100 text-slate-600';
};

const tipeDisplay = (tipe: string | null): string => {
  const map: Record<string, string> = {
    create: 'Dibuat',
    update: 'Diubah',
    delete: 'Dihapus',
    verifikasi: 'Verifikasi',
    login: 'Masuk',
    evaluasi: 'Evaluasi',
    pencairan: 'Pencairan',
  };
  return map[(tipe || '').toLowerCase()] || tipe || '-';
};

const formatWaktu = (date: Date | null | undefined) => {
  if (!date) return '-';
  return date.toLocaleDateString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

interface PageProps {
  searchParams: Promise<{
    search?: string;
    tipe?: string;
    page?: string;
    per_page?: string;
  }>;
}

export default async function AuditLogPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const search = params.search || '';
  const tipeFilter = params.tipe || '';
  const currentPage = Math.max(1, Number(params.page) || 1);
  const itemsPerPage = Number(params.per_page) || 20;

  const totalLogs = await prisma.activityLog.count();
  const uniqueTipe = await prisma.activityLog.findMany({
    select: { tipe: true },
    distinct: ['tipe'],
    where: { tipe: { not: null } },
  });

  const where: any = {};
  if (tipeFilter) where.tipe = tipeFilter;
  if (search) {
    where.OR = [
      { aktivitas: { contains: search, mode: 'insensitive' } },
      { created_by: { contains: search, mode: 'insensitive' } },
      { user: { master_dosen: { nama_lengkap: { contains: search, mode: 'insensitive' } } } },
    ];
  }

  const totalFiltered = await prisma.activityLog.count({ where });
  const totalPages = Math.ceil(totalFiltered / itemsPerPage);

  const logs = await prisma.activityLog.findMany({
    where,
    include: {
      user: { include: { master_dosen: true } },
    },
    orderBy: { created_at: 'desc' },
    skip: (currentPage - 1) * itemsPerPage,
    take: itemsPerPage,
  });

  const data = logs.map((log) => ({
    id: log.id,
    waktu: formatWaktu(log.created_at),
    user: log.user?.master_dosen?.nama_lengkap || log.created_by || 'Sistem',
    email: log.user?.email || '-',
    aktivitas: log.aktivitas || '-',
    tipe: log.tipe || '-',
    pengajuanId: log.pengajuan_id,
  }));

  const startIdx = totalFiltered === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endIdx = Math.min(currentPage * itemsPerPage, totalFiltered);

  const buildUrl = (newParams: Record<string, string | number>) => {
    const qp = new URLSearchParams();
    if (search) qp.set('search', search);
    if (tipeFilter) qp.set('tipe', tipeFilter);
    qp.set('page', String(currentPage));
    qp.set('per_page', String(itemsPerPage));
    for (const [key, val] of Object.entries(newParams)) {
      if (val) qp.set(key, String(val));
      else qp.delete(key);
    }
    const qs = qp.toString();
    return `/master_admin/audit-log${qs ? `?${qs}` : ''}`;
  };

  const getPageNumbers = () => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (currentPage <= 3) return [1, 2, 3, '...', totalPages];
    if (currentPage >= totalPages - 2) return [1, '...', totalPages - 2, totalPages - 1, totalPages];
    return [1, '...', currentPage, '...', totalPages];
  };

  const summaryCards = [
    { label: 'Total Aktivitas', value: totalLogs, icon: ClipboardList, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Tipe Terdaftar', value: uniqueTipe.length, icon: Filter, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  const tipeList = uniqueTipe.map(t => t.tipe).filter(Boolean) as string[];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Log Aktivitas</h2>
          <p className="text-sm text-slate-500 mt-1">Catatan seluruh aktivitas yang terjadi dalam sistem SIGAP</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{card.label}</span>
                <div className={`${card.bg} p-2 rounded-lg`}>
                  <Icon size={16} className={card.color} strokeWidth={2} />
                </div>
              </div>
              <p className="text-3xl font-bold text-slate-800">{card.value}</p>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-base font-semibold text-slate-800">Log Aktivitas</h3>
          <form className="flex flex-col sm:flex-row gap-3" method="GET">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                name="search"
                defaultValue={search}
                placeholder="Cari aktivitas atau user..."
                className="w-full sm:w-56 pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
            <select
              name="tipe"
              defaultValue={tipeFilter}
              className="border border-slate-200 text-slate-600 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white transition-all"
            >
              <option value="">Semua Tipe</option>
              {tipeList.map((t) => (
                <option key={t} value={t}>{tipeDisplay(t)}</option>
              ))}
            </select>
            <button
              type="submit"
              className="flex items-center gap-2 bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Search size={15} /> Cari
            </button>
          </form>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-50/50">
                <th className="px-6 py-4 w-12">No</th>
                <th className="px-6 py-4">Waktu</th>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Aktivitas</th>
                <th className="px-6 py-4">Tipe</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 text-sm">
                    <ClipboardList size={40} className="mx-auto mb-3 text-slate-300" strokeWidth={1.5} />
                    Belum ada log aktivitas.
                  </td>
                </tr>
              ) : (
                data.map((log, index) => (
                  <tr key={log.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-400 font-mono">{startIdx + index}.</td>
                    <td className="px-6 py-4 text-sm text-slate-500 whitespace-nowrap">{log.waktu}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-slate-800">{log.user}</span>
                        <span className="text-xs text-slate-400">{log.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 max-w-md truncate">{log.aktivitas}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2.5 py-1 text-[11px] font-semibold rounded-full ${tipeBadge(log.tipe)}`}>
                        {tipeDisplay(log.tipe)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalFiltered > 0 && (
          <div className="px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 bg-white">
            <div className="flex items-center gap-3 text-sm text-slate-500">
              <span>Menampilkan {startIdx}–{endIdx} dari {totalFiltered} log</span>
              <span className="text-slate-300">|</span>
              <span>Tampil</span>
              <select
                defaultValue={itemsPerPage}
                className="border border-slate-200 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
              >
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>

            <div className="flex items-center gap-1">
              <Link
                href={buildUrl({ page: Math.max(1, currentPage - 1) })}
                className={`p-1.5 rounded-lg transition-colors ${
                  currentPage <= 1 ? 'text-slate-300 pointer-events-none' : 'text-slate-500 hover:bg-slate-100'
                }`}
                aria-disabled={currentPage <= 1}
              >
                <ChevronLeft size={18} />
              </Link>

              <div className="flex items-center gap-1 mx-1">
                {getPageNumbers().map((p, idx) =>
                  p === '...' ? (
                    <span key={`e-${idx}`} className="px-2 text-slate-400 text-sm">...</span>
                  ) : (
                    <Link
                      key={p}
                      href={buildUrl({ page: p as number })}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                        p === currentPage ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {p}
                    </Link>
                  )
                )}
              </div>

              <Link
                href={buildUrl({ page: Math.min(totalPages, currentPage + 1) })}
                className={`p-1.5 rounded-lg transition-colors ${
                  currentPage >= totalPages ? 'text-slate-300 pointer-events-none' : 'text-slate-500 hover:bg-slate-100'
                }`}
                aria-disabled={currentPage >= totalPages}
              >
                <ChevronRight size={18} />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
