import { prisma } from '@/src/lib/prisma';
import {
  Search,
  Users,
  ShieldCheck,
  GraduationCap,
  Clock,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  Edit3,
  ArrowUpRight,
  UserPlus,
} from "lucide-react";
import Link from "next/link";
import ToggleSwitch from "./ToggleSwitch";
import { formatDate } from '@/src/lib/formatters';
import { ROLE_DISPLAY } from '@/src/lib/constants/roles';

export const dynamic = 'force-dynamic';

const ROLE_ID_MAP: Record<number, string> = {
  1: 'master_admin',
  2: 'admin',
  3: 'dosen',
};

const ROLE_BADGE: Record<string, string> = {
  master_admin: 'bg-purple-100 text-purple-700',
  admin: 'bg-blue-100 text-blue-700',
  dosen: 'bg-emerald-100 text-emerald-700',
};

const statusBadge = (status: string | null) => {
  const s = (status || 'pending').toLowerCase();
  const map: Record<string, string> = { aktif: 'bg-emerald-100 text-emerald-700', menunggu: 'bg-amber-100 text-amber-700', pending: 'bg-slate-100 text-slate-500' };
  return map[s] || 'bg-slate-100 text-slate-600';
};

const statusLabel = (status: string | null) => {
  const s = (status || 'pending').toLowerCase();
  const map: Record<string, string> = { aktif: 'Aktif', menunggu: 'Menunggu', pending: 'Tertunda' };
  return map[s] || 'Tertunda';
};

interface PageProps {
  searchParams: Promise<{
    search?: string;
    role?: string;
    status?: string;
    page?: string;
    per_page?: string;
  }>;
}

export default async function MonitoringPenggunaPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const search = params.search || '';
  const roleFilter = params.role || '';
  const statusFilter = params.status || '';
  const currentPage = Math.max(1, Number(params.page) || 1);
  const itemsPerPage = Number(params.per_page) || 10;

  const allUsers = await prisma.user.findMany({
    include: {
      role: true,
      master_dosen: true,
      _count: { select: { pengajuan_studi: true } },
      pengajuan_studi: {
        include: {
          status: true,
          jenis_studi: true,
        },
        orderBy: { created_at: 'desc' },
        take: 1,
      },
    },
    orderBy: { created_at: 'desc' },
  });

  const totalUsers = allUsers.length;
  const dosenCount = allUsers.filter(u => u.role_id === 3).length;
  const adminCount = allUsers.filter(u => u.role_id === 2 || u.role_id === 1).length;
  const menungguCount = allUsers.filter(u => u.status_akun === 'menunggu').length;
  const aktifCount = allUsers.filter(u => u.status_akun === 'aktif').length;

  let filtered = allUsers;
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(u =>
      (u.master_dosen?.nama_lengkap || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      (u.master_dosen?.nip || '').includes(q)
    );
  }
  if (roleFilter) {
    const roleId = Number(roleFilter);
    if (roleId) filtered = filtered.filter(u => u.role_id === roleId);
  }
  if (statusFilter) {
    filtered = filtered.filter(u => u.status_akun === statusFilter);
  }

  const totalFiltered = filtered.length;
  const totalPages = Math.ceil(totalFiltered / itemsPerPage);
  const paged = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const data = paged.map((u) => {
    const isDoktorLulus = 
      (u.master_dosen?.pendidikan_terakhir === 'S3' && u.master_dosen?.tanggal_lulus) ||
      (u.pengajuan_studi[0]?.status?.nama_status === 'lulus' && 
       (u.pengajuan_studi[0]?.jenis_studi?.nama_jenis?.toLowerCase().includes('s3') || 
        u.pengajuan_studi[0]?.jenis_studi?.nama_jenis?.toLowerCase().includes('doktor')));

    const namaLengkap = u.master_dosen?.nama_lengkap || u.username || 'Tanpa Nama';
    const namaDisplay = isDoktorLulus && !namaLengkap.startsWith('Dr.') 
      ? `Dr. ${namaLengkap}` 
      : namaLengkap;

    return {
      id: u.id,
      nama: namaDisplay,
      email: u.email || '-',
      nip: u.master_dosen?.nip || '-',
      roleId: u.role_id || 0,
      roleName: ROLE_ID_MAP[u.role_id || 0] || 'unknown',
      roleDisplay: ROLE_DISPLAY[ROLE_ID_MAP[u.role_id || 0]] || 'Tidak Diketahui',
      status: statusLabel(u.status_akun),
      statusRaw: u.status_akun || 'pending',
      inisial: (u.master_dosen?.nama_lengkap || u.username || '?').charAt(0).toUpperCase(),
      studiCount: u._count.pengajuan_studi,
      terakhirUpdate: formatDate(u.updated_at),
    };
  });

  const startIdx = totalFiltered === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endIdx = Math.min(currentPage * itemsPerPage, totalFiltered);

  const buildUrl = (newParams: Record<string, string | number>) => {
    const qp = new URLSearchParams();
    if (search) qp.set('search', search);
    if (roleFilter) qp.set('role', roleFilter);
    if (statusFilter) qp.set('status', statusFilter);
    qp.set('page', String(currentPage));
    qp.set('per_page', String(itemsPerPage));
    for (const [key, val] of Object.entries(newParams)) {
      if (val) qp.set(key, String(val));
      else qp.delete(key);
    }
    const qs = qp.toString();
    return `/master_admin/monitoring-pengguna${qs ? `?${qs}` : ''}`;
  };

  const getPageNumbers = () => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (currentPage <= 3) return [1, 2, 3, '...', totalPages];
    if (currentPage >= totalPages - 2) return [1, '...', totalPages - 2, totalPages - 1, totalPages];
    return [1, '...', currentPage, '...', totalPages];
  };

  const summaryCards = [
    { label: 'Total Pengguna', value: totalUsers, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Dosen Terdaftar', value: dosenCount, icon: GraduationCap, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Admin & Staf', value: adminCount, icon: ShieldCheck, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Aktif', value: aktifCount, icon: UserCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Menunggu Verifikasi', value: menungguCount, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  if (totalUsers === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <Users size={56} className="text-slate-300 mb-4" strokeWidth={1.5} />
        <h3 className="text-lg font-semibold text-slate-700 mb-1">Belum ada pengguna terdaftar</h3>
        <p className="text-sm text-slate-400">Data pengguna akan muncul setelah ada yang mendaftar.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Monitoring Pengguna</h2>
          <p className="text-sm text-slate-500 mt-1">Kelola seluruh akun pengguna sistem SIGAP</p>
        </div>
        <Link
          href="/master_admin/monitoring-pengguna/create"
          className="flex items-center gap-2 bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <UserPlus size={16} /> Tambah Pengguna
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
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
          <h3 className="text-base font-semibold text-slate-800">Daftar Pengguna</h3>
          <form className="flex flex-col sm:flex-row gap-3" method="GET">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                name="search"
                defaultValue={search}
                placeholder="Cari nama, email atau NIP..."
                className="w-full sm:w-56 pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
            <select
              name="role"
              defaultValue={roleFilter}
              className="border border-slate-200 text-slate-600 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white transition-all"
            >
              <option value="">Semua Role</option>
              <option value="3">Dosen</option>
              <option value="2">Admin</option>
              <option value="1">Master Admin</option>
            </select>
            <select
              name="status"
              defaultValue={statusFilter}
              className="border border-slate-200 text-slate-600 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white transition-all"
            >
              <option value="">Semua Status</option>
              <option value="aktif">Aktif</option>
              <option value="menunggu">Menunggu</option>
              <option value="pending">Tertunda</option>
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
                <th className="px-6 py-4">Nama</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">NIP</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Terakhir Update</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-400 text-sm">
                    Tidak ada pengguna yang sesuai dengan filter.
                  </td>
                </tr>
              ) : (
                data.map((user, index) => (
                  <tr key={user.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-400 font-mono">{startIdx + index}.</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                          {user.inisial}
                        </div>
                        <span className="font-medium text-sm text-slate-800">{user.nama}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">{user.email}</td>
                    <td className="px-6 py-4 text-sm text-slate-500 font-mono">{user.nip}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2.5 py-1 text-[11px] font-semibold rounded-full ${ROLE_BADGE[user.roleName] || 'bg-slate-100 text-slate-600'}`}>
                        {user.roleDisplay}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2.5 py-1 text-[11px] font-semibold rounded-full ${statusBadge(user.statusRaw)}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">{user.terakhirUpdate}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-3">
                        <span className="text-[11px] font-medium text-slate-500">
                          {user.statusRaw === 'aktif' ? 'Aktif' : 'Nonaktif'}
                        </span>
                        <ToggleSwitch userId={user.id} currentStatus={user.statusRaw} />
                        <Link
                          href={`/master_admin/monitoring-pengguna/${user.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 text-xs font-semibold rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          <Edit3 size={12} /> Kelola
                        </Link>
                      </div>
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
              <span>Menampilkan {startIdx}–{endIdx} dari {totalFiltered} pengguna</span>
              <span className="text-slate-300">|</span>
              <span>Tampil</span>
              <select
                defaultValue={itemsPerPage}
                className="border border-slate-200 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
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
