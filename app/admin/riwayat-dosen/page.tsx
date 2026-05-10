// app/admin/riwayat-dosen/page.tsx
import { prisma } from '@/src/lib/prisma';
import {
  Search,
  Filter,
  Download,
  Eye,
  Calendar,
  Users,
  GraduationCap,
  CheckCircle2,
  AlertCircle,
  Wallet,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function RiwayatDosenPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; jurusan?: string; status?: string; page?: string; per_page?: string }>;
}) {
  const params = await searchParams;
  const search = params.search || '';
  const jurusanFilter = params.jurusan || '';
  const statusFilter = params.status || '';
  const currentPage = Math.max(1, Number(params.page) || 1);
  const itemsPerPage = Number(params.per_page) || 5; // Default diubah ke 5 sesuai gambar

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
    d.pengajuan_studi.some((p) => p.monitoring_khs.length === 0)
  ).length;

  const pengajuanKeuanganPending = allDosen.flatMap((d) =>
    d.pengajuan_studi.flatMap((p) =>
      p.pengajuan_reimbursement.filter((r) => r.status_pencairan?.toLowerCase() === 'pending')
    )
  ).length;

  const totalFiltered = await prisma.user.count({ where: whereClause });
  const totalPages = Math.ceil(totalFiltered / itemsPerPage);

  const filteredDosen = await prisma.user.findMany({
    where: whereClause,
    include: { master_dosen: true },
    orderBy: { username: 'asc' },
    skip: (currentPage - 1) * itemsPerPage,
    take: itemsPerPage,
  });

  const dataDosen = filteredDosen.map((user) => ({
    id: user.id,
    nama: user.master_dosen?.nama_lengkap || user.username || 'Dosen Tanpa Nama',
    jurusan: user.master_dosen?.jurusan || '-',
    nip: user.master_dosen?.nip || 'NIP Belum Diatur',
    jabatan: user.master_dosen?.jabatan || '-',
    status: user.status_akun === 'aktif' ? 'Aktif' : user.status_akun === 'pending' ? 'Pending' : 'Nonaktif',
    terakhirUpdate: user.updated_at
      ? user.updated_at.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
      : '-',
  }));

  const jurusanList = [...new Set(allDosen.map((d) => d.master_dosen?.jurusan).filter(Boolean))] as string[];

  const buildUrl = (newParams: Record<string, string | number>) => {
    const qp = new URLSearchParams({
      search,
      jurusan: jurusanFilter,
      status: statusFilter,
      page: String(currentPage),
      per_page: String(itemsPerPage),
      ...Object.fromEntries(Object.entries(newParams).map(([k, v]) => [k, String(v)])),
    });
    for (const [key, val] of Object.entries(qp)) {
      if (!val) qp.delete(key);
    }
    return `/admin/riwayat-dosen?${qp.toString()}`;
  };

  const startIdx = totalFiltered === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endIdx = Math.min(currentPage * itemsPerPage, totalFiltered);

  // Logika untuk menampilkan deretan angka pagination dengan titik-titik (1 ... 4)
  const getPageNumbers = () => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (currentPage <= 3) return [1, 2, 3, '...', totalPages];
    if (currentPage >= totalPages - 2) return [1, '...', totalPages - 2, totalPages - 1, totalPages];
    return [1, '...', currentPage, '...', totalPages];
  };

  if (!allDosen || allDosen.length === 0) {
    return (
      <div className="w-full mx-auto space-y-6 text-center py-10 bg-slate-50 min-h-screen p-6">
        <h2 className="text-xl text-slate-700">Data dosen belum tersedia.</h2>
        <p className="text-slate-500">Pastikan kamu sudah menjalankan perintah npx prisma db seed di terminal.</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8 min-h-screen bg-[#F8FAFC] p-4 sm:p-8">
      
      {/* HEADER SECTION */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Dashboard</h2>
          <p className="text-sm text-slate-500 mt-1">Ringkasan informasi sistem dan aktivitas terbaru</p>
        </div>
      </div>

      {/* SUMMARY CARDS SECTION */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* ... (Summary cards sama seperti sebelumnya) ... */}
        <div className="bg-white rounded-xl p-5 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 flex flex-col justify-between">
          <p className="text-xs text-slate-500 font-medium mb-3">Total Dosen Aktif</p>
          <div className="flex items-center gap-4">
            <Users className="text-blue-600" size={28} strokeWidth={1.5} />
            <span className="text-3xl font-bold text-slate-800">{totalDosenAktif}</span>
          </div>
          <p className="text-xs text-slate-400 mt-3">Dosen</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 flex flex-col justify-between">
          <p className="text-xs text-slate-500 font-medium mb-3">Aktif Studi</p>
          <div className="flex items-center gap-4">
            <GraduationCap className="text-emerald-500" size={28} strokeWidth={1.5} />
            <span className="text-3xl font-bold text-slate-800">{aktifStudi}</span>
          </div>
          <p className="text-xs text-slate-400 mt-3">Dosen</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 flex flex-col justify-between">
          <p className="text-xs text-slate-500 font-medium mb-3">Studi Lulus</p>
          <div className="flex items-center gap-4">
            <CheckCircle2 className="text-blue-500" size={28} strokeWidth={1.5} />
            <span className="text-3xl font-bold text-slate-800">{studiLulus}</span>
          </div>
          <p className="text-xs text-slate-400 mt-3">Dosen</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 flex flex-col justify-between">
          <p className="text-xs text-slate-500 font-medium mb-3">Belum Upload KHS</p>
          <div className="flex items-center gap-4">
            <AlertCircle className="text-red-500" size={28} strokeWidth={1.5} />
            <span className="text-3xl font-bold text-slate-800">{belumUploadKhs}</span>
          </div>
          <p className="text-xs text-slate-400 mt-3">Dosen</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 flex flex-col justify-between">
          <p className="text-xs text-slate-500 font-medium mb-3">Pengajuan Keuangan</p>
          <div className="flex items-center gap-4">
            <Wallet className="text-amber-500" size={28} strokeWidth={1.5} />
            <span className="text-3xl font-bold text-slate-800">{pengajuanKeuanganPending}</span>
          </div>
          <p className="text-xs text-slate-400 mt-3">Dosen</p>
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] overflow-hidden">
        
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between gap-4">
          <h3 className="text-lg font-bold text-slate-800">Dosen Terbaru</h3>
          <form className="flex flex-col sm:flex-row gap-3" action="/admin/riwayat-dosen" method="GET">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" name="search" defaultValue={search} placeholder="Cari nama atau NIP..." className="w-full sm:w-64 pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <select name="jurusan" defaultValue={jurusanFilter} className="border border-slate-200 text-slate-600 text-sm rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-blue-500 bg-white">
              <option value="">Semua Jurusan</option>
              {jurusanList.map((j) => (
                <option key={j} value={j}>{j}</option>
              ))}
            </select>
            <button type="submit" className="flex items-center gap-2 border border-slate-200 text-slate-600 text-sm font-medium px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors bg-white">
              <Filter size={16} /> Filter
            </button>
          </form>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-white">
                <th className="px-6 py-4 font-medium">No</th>
                <th className="px-6 py-4 font-medium">Nama Dosen</th>
                <th className="px-6 py-4 font-medium">NIP</th>
                <th className="px-6 py-4 font-medium">Program Studi / Jurusan</th>
                <th className="px-6 py-4 font-medium text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {dataDosen.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-500 text-sm">
                    Tidak ada data dosen yang sesuai dengan filter.
                  </td>
                </tr>
              ) : (
                dataDosen.map((dosen, index) => (
                  <tr key={dosen.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-500">{startIdx + index}.</td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-sm text-slate-800">{dosen.nama}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{dosen.nip}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{dosen.jurusan}</td>
                    <td className="px-6 py-4 flex justify-center">
                      <Link href={`/admin/riwayat-dosen/${dosen.id}`} className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors">
                        Lihat Detail
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* --- PAGINATION BARU SESUAI GAMBAR --- */}
        <div className="px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 bg-white">
          
          {/* Kiri: Items per page & Halaman Info */}
          <div className="flex items-center gap-3 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <span>Items per page</span>
              {/* Note dari Lixa: Idealnya pakai Client Component untuk onChange, tapi ini styling-nya sudah disesuaikan agar pas. */}
              <select 
                defaultValue={itemsPerPage}
                className="border border-slate-200 rounded-md px-2 py-1 outline-none focus:ring-1 focus:ring-blue-500 bg-white text-slate-700 font-medium"
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
              </select>
            </div>
            <div className="w-px h-4 bg-slate-300"></div> {/* Garis vertikal pembatas */}
            <span>
              Halaman {currentPage} | {startIdx} - {endIdx} of {totalFiltered}
            </span>
          </div>

          {/* Kanan: Pagination Navigation */}
          {totalFiltered > 0 && (
            <div className="flex items-center gap-1">
              <Link
                href={buildUrl({ page: Math.max(1, currentPage - 1) })}
                className={`p-1.5 rounded-full transition-colors ${currentPage <= 1 ? 'text-slate-300 pointer-events-none' : 'text-slate-500 hover:bg-slate-100'}`}
                aria-disabled={currentPage <= 1}
              >
                <ChevronLeft size={18} />
              </Link>

              <div className="flex items-center gap-1 mx-2">
                {getPageNumbers().map((p, idx) => (
                  p === '...' ? (
                    <span key={`ellipsis-${idx}`} className="px-2 text-slate-400 text-sm">...</span>
                  ) : (
                    <Link
                      key={p}
                      href={buildUrl({ page: p as number })}
                      className={`w-8 h-8 flex items-center justify-center rounded-full text-sm transition-colors ${
                        p === currentPage 
                          ? 'bg-blue-100 text-blue-600 font-semibold' 
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {p}
                    </Link>
                  )
                ))}
              </div>

              <Link
                href={buildUrl({ page: Math.min(totalPages, currentPage + 1) })}
                className={`p-1.5 rounded-full transition-colors ${currentPage >= totalPages ? 'text-slate-300 pointer-events-none' : 'text-slate-500 hover:bg-slate-100'}`}
                aria-disabled={currentPage >= totalPages}
              >
                <ChevronRight size={18} />
              </Link>
            </div>
          )}
        </div>
        {/* --- END OF PAGINATION --- */}

      </div>
    </div>
  );
}