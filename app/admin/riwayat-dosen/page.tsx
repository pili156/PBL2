import { prisma } from '@/src/lib/prisma';
import {
  Search,
  Users,
  GraduationCap,
  CheckCircle2,
  AlertCircle,
  Wallet,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  Download,
} from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/src/lib/formatters";
import type { StatusDosen } from "@/src/types/buku-induk";
import StatusBadge from "@/components/buku-induk/StatusBadge";

function normalizeStatus(val: string | null): string | null {
  if (!val) return null;
  const v = val.toLowerCase();
  if (v === "selesai") return "Selesai";
  if (v === "lulus") return "Lulus";
  if (v === "do") return "DO";
  if (v === "aktif" || v === "diterima" || v === "terverifikasi" || v === "pending" || v === "menunggu_verifikasi") return "Aktif";
  return val;
}

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{
    search?: string;
    jurusan?: string;
    status?: string;
    page?: string;
    per_page?: string;
  }>;
}

async function getSummaryData() {
  const allDosen = await prisma.user.findMany({
    where: { role_id: 3 },
    include: {
      master_dosen: true,
      pengajuan_studi: {
        include: {
          monitoring_khs: true,
          pengajuan_reimbursement: true,
          status: true,
        },
      },
    },
  });

  const totalDosenAktif = allDosen.filter((d) => d.status_akun === 'aktif').length;

  const aktifStudi = allDosen.filter((d) =>
    d.pengajuan_studi.some((p) => {
      const s = p.status?.nama_status?.toLowerCase();
      return s === 'aktif' || s === 'disetujui' || s === 'sedang berjalan';
    })
  ).length;

  const studiLulus = allDosen.filter((d) =>
    d.pengajuan_studi.some((p) => {
      const s = p.status?.nama_status?.toLowerCase();
      return s === 'lulus' || s === 'selesai' || s === 'completed';
    })
  ).length;

  const belumUploadKhs = allDosen.filter((d) =>
    d.pengajuan_studi.some((p) => 
      p.monitoring_khs.length === 0 && 
      p.status?.nama_status?.toLowerCase() !== 'ditolak'
    )
  ).length;

  const pengajuanKeuanganPending = allDosen.flatMap((d) =>
    d.pengajuan_studi.flatMap((p) =>
      p.pengajuan_reimbursement.filter((r) => r.status_pencairan?.toLowerCase() === 'pending')
    )
  ).length;

  const jurusanList = [...new Set(allDosen.map((d) => d.master_dosen?.jurusan).filter(Boolean))] as string[];

  const empty = allDosen.length === 0;

  return { totalDosenAktif, aktifStudi, studiLulus, belumUploadKhs, pengajuanKeuanganPending, jurusanList, empty };
}



export default async function RiwayatDosenPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const search = params.search || '';
  const jurusanFilter = params.jurusan || '';
  const statusFilter = params.status || '';
  const currentPage = Math.max(1, Number(params.page) || 1);
  const itemsPerPage = Number(params.per_page) || 10;

  const { totalDosenAktif, aktifStudi, studiLulus, belumUploadKhs, pengajuanKeuanganPending, jurusanList, empty } = await getSummaryData();

  const whereClause: any = { role_id: 3 };
  if (search) {
    whereClause.OR = [
      { username: { contains: search, mode: 'insensitive' } },
      { master_dosen: { nip: { contains: search, mode: 'insensitive' } } },
      { master_dosen: { nama_lengkap: { contains: search, mode: 'insensitive' } } },
    ];
  }
  if (jurusanFilter) {
    whereClause.master_dosen = { ...(whereClause.master_dosen || {}), jurusan: jurusanFilter };
  }
  if (statusFilter && statusFilter !== 'Semua') {
    whereClause.status_akun = statusFilter.toLowerCase();
  }

  const totalFiltered = await prisma.user.count({ where: whereClause });
  const totalPages = Math.ceil(totalFiltered / itemsPerPage);

  const filteredDosen = await prisma.user.findMany({
    where: whereClause,
    include: { 
      master_dosen: {
        include: {
          data_tubel: true,
          data_doktor: true,
          data_izin_belajar: true,
        },
      },
      pengajuan_studi: {
        include: {
          status: true,
          jenis_studi: true,
        },
        orderBy: { created_at: 'desc' },
        take: 1,
      },
    },
    orderBy: [{ status_akun: 'asc' }, { username: 'asc' }],
    skip: (currentPage - 1) * itemsPerPage,
    take: itemsPerPage,
  });

  const dataDosen = filteredDosen.map((user) => {
    const namaLengkap = user.master_dosen?.nama_lengkap || user.username || 'Dosen Tanpa Nama';
    const gelar = user.master_dosen?.gelar || '';
    
    const isDoktorLulus = 
      (user.master_dosen?.pendidikan_terakhir === 'S3' && user.master_dosen?.tanggal_lulus) ||
      (user.pengajuan_studi[0]?.status?.nama_status === 'lulus' && 
       (user.pengajuan_studi[0]?.jenis_studi?.nama_jenis?.toLowerCase().includes('s3') || 
        user.pengajuan_studi[0]?.jenis_studi?.nama_jenis?.toLowerCase().includes('doktor')));
    
    const namaDisplay = isDoktorLulus && !namaLengkap.startsWith('Dr.') 
      ? `Dr. ${namaLengkap}` 
      : namaLengkap;
    const gelarDisplay = gelar;

    const statusPengajuan = user.pengajuan_studi[0]?.status?.nama_status ?? null;
    const statusKuliah = normalizeStatus(
      statusPengajuan || user.master_dosen?.data_tubel?.status_kuliah ||
      user.master_dosen?.data_doktor?.status || user.master_dosen?.data_izin_belajar?.lulus_belum || null
    ) ?? 'Aktif';

    return {
      id: user.id,
      nama: namaDisplay + (gelarDisplay ? `.${gelarDisplay}` : ''),
      jurusan: user.master_dosen?.jurusan || '-',
      nip: user.master_dosen?.nip || 'NIP Belum Diatur',
      statusKuliah: statusKuliah as StatusDosen,
      inisial: (user.master_dosen?.nama_lengkap || user.username || 'D').charAt(0).toUpperCase(),
      terakhirUpdate: formatDate(user.updated_at),
    };
  });

  const startIdx = totalFiltered === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endIdx = Math.min(currentPage * itemsPerPage, totalFiltered);

  const buildUrl = (newParams: Record<string, string | number>) => {
    const qp = new URLSearchParams();
    if (search) qp.set('search', search);
    if (jurusanFilter) qp.set('jurusan', jurusanFilter);
    if (statusFilter) qp.set('status', statusFilter);
    qp.set('page', String(currentPage));
    qp.set('per_page', String(itemsPerPage));
    for (const [key, val] of Object.entries(newParams)) {
      if (val) qp.set(key, String(val));
      else qp.delete(key);
    }
    const qs = qp.toString();
    return `/admin/riwayat-dosen${qs ? `?${qs}` : ''}`;
  };

  const getPageNumbers = () => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (currentPage <= 3) return [1, 2, 3, '...', totalPages];
    if (currentPage >= totalPages - 2) return [1, '...', totalPages - 2, totalPages - 1, totalPages];
    return [1, '...', currentPage, '...', totalPages];
  };

  const summaryCards = [
    { label: 'Total Dosen Aktif', value: totalDosenAktif, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Aktif Studi', value: aktifStudi, icon: GraduationCap, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Studi Lulus', value: studiLulus, icon: CheckCircle2, color: 'text-violet-600', bg: 'bg-violet-50' },
    { label: 'Belum Upload KHS', value: belumUploadKhs, icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Pengajuan Keuangan', value: pengajuanKeuanganPending, icon: Wallet, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  if (empty) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <Users size={56} className="text-slate-300 mb-4" strokeWidth={1.5} />
        <h3 className="text-lg font-semibold text-slate-700 mb-1">Data dosen belum tersedia</h3>
        <p className="text-sm text-slate-400">Pastikan Anda sudah menjalankan <code className="bg-slate-100 px-2 py-0.5 rounded text-xs font-mono">npx prisma db seed</code> di terminal.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Monitoring & Riwayat Dosen</h2>
          <p className="text-sm text-slate-500 mt-1">Kelola dan pantau seluruh data studi dosen</p>
        </div>
        <a
          href="/api/export/dosen"
          className="inline-flex items-center gap-2 bg-white border border-slate-200 text-slate-600 text-sm font-medium px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors"
        >
          <Download size={16} /> Export Excel
        </a>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{card.label}</span>
                <div className={`${card.bg} p-2 rounded-lg`}>
                  <Icon size={16} className={card.color} strokeWidth={2} />
                </div>
              </div>
              <p className="text-3xl font-bold text-slate-800">{card.value}</p>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-base font-semibold text-slate-800">Daftar Dosen</h3>
          <form className="flex flex-col sm:flex-row gap-3" method="GET">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                name="search"
                defaultValue={search}
                placeholder="Cari nama atau NIP..."
                className="w-full sm:w-56 pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
            <select
              name="jurusan"
              defaultValue={jurusanFilter}
              className="border border-slate-200 text-slate-600 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white transition-all"
            >
              <option value="">Semua Jurusan</option>
              {jurusanList.map((j) => (
                <option key={j} value={j}>{j}</option>
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
              <tr className="border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-50/50">
                <th className="px-6 py-4 w-12">No</th>
                <th className="px-6 py-4">Nama Dosen</th>
                <th className="px-6 py-4">NIP</th>
                <th className="px-6 py-4">Jurusan / Prodi</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Terakhir Update</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {dataDosen.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400 text-sm">
                    Tidak ada data dosen yang sesuai dengan filter.
                  </td>
                </tr>
              ) : (
                dataDosen.map((dosen, index) => (
                  <tr key={dosen.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-400 font-mono">{startIdx + index}.</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                          {dosen.inisial}
                        </div>
                        <span className="font-medium text-sm text-slate-800">{dosen.nama}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 font-mono">{dosen.nip}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{dosen.jurusan}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={dosen.statusKuliah} />
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">{dosen.terakhirUpdate}</td>
                    <td className="px-6 py-4 text-center">
                      <Link
                        href={`/admin/riwayat-dosen/${dosen.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 text-xs font-semibold rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        Detail <ArrowUpRight size={13} />
                      </Link>
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
              <span className="hidden sm:inline">
                Menampilkan {startIdx}–{endIdx} dari {totalFiltered} dosen
              </span>
              <span className="sm:hidden">
                Hal. {currentPage} | {startIdx}–{endIdx}
              </span>
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-slate-400">|</span>
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
            </div>

            <div className="flex items-center gap-1">
              <Link
                href={buildUrl({ page: Math.max(1, currentPage - 1) })}
                className={`p-1.5 rounded-lg transition-colors ${
                  currentPage <= 1
                    ? 'text-slate-300 pointer-events-none'
                    : 'text-slate-500 hover:bg-slate-100'
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
                        p === currentPage
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-slate-600 hover:bg-slate-100'
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
                  currentPage >= totalPages
                    ? 'text-slate-300 pointer-events-none'
                    : 'text-slate-500 hover:bg-slate-100'
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
