// app/admin/riwayat-dosen/page.tsx
import { prisma } from '@/lib/prisma';
import {
  Search,
  Filter,
  Download,
  Eye,
  Calendar,
  User,
  FileText,
  CheckCircle,
  AlertTriangle
} from "lucide-react";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function RiwayatDosenPage() {
  // ===============================================================
  // --- PART 1: DATA FETCHING DINAMIS DARI DATABASE PRISMA ---
  // ===============================================================

  const allDosenData = await prisma.user.findMany({
    where: { role_id: 3 },
    include: {
      master_dosen: true,
    },
    orderBy: {
      username: 'asc'
    }
  });

  if (!allDosenData || allDosenData.length === 0) {
    return (
      <div className="w-full mx-auto space-y-6 text-center py-10">
        <h2 className="text-xl text-slate-700">Data dosen belum tersedia.</h2>
        <p className="text-slate-500">Pastikan kamu sudah menjalankan perintah npx prisma db seed di terminal.</p>
      </div>
    );
  }

  // ===============================================================
  // --- PART 2: INTEGRASI DATA KE UI FRONT-END ---
  // ===============================================================

  const dataDosen = allDosenData.map((user) => ({
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

  return (
    // PERUBAHAN: max-w-7xl diganti jadi w-full agar layout melebar penuh ke samping
    <div className="w-full space-y-6 min-h-screen p-2 sm:p-4">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Riwayat Dosen</h2>
          <p className="text-sm text-slate-500 mt-1">Kelola dan lihat riwayat akademik seluruh dosen</p>
        </div>
        <button className="flex items-center gap-2 bg-sigap-primary text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:opacity-90 transition-opacity">
          <Download size={16} />
          Export Data
        </button>
      </div>

      {/* Summary Cards - 5 Kolom Sejajar Sesuai UI Awal */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Card 1 */}
        <div className="bg-sigap-cardBlue rounded-xl p-4 flex flex-col items-center justify-center text-center shadow-sm border border-slate-100">
          <p className="text-sm text-slate-600 font-medium mb-2">Total Dosen Aktif</p>
          <div className="flex items-center gap-3">
            <User className="text-blue-500" size={28} />
            <span className="text-3xl font-bold text-slate-800">{dataDosen.length}</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Dosen</p>
        </div>
        {/* Card 2 */}
        <div className="bg-sigap-cardGreen rounded-xl p-4 flex flex-col items-center justify-center text-center shadow-sm border border-slate-100">
          <p className="text-sm text-slate-600 font-medium mb-2">Aktif Studi</p>
          <div className="flex items-center gap-3">
            <FileText className="text-green-500" size={28} />
            <span className="text-3xl font-bold text-slate-800">14</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">KHS</p>
        </div>
        {/* Card 3 */}
        <div className="bg-sigap-cardBlue rounded-xl p-4 flex flex-col items-center justify-center text-center shadow-sm border border-slate-100">
          <p className="text-sm text-slate-600 font-medium mb-2">Studi Lulus</p>
          <div className="flex items-center gap-3">
            <CheckCircle className="text-blue-500" size={28} />
            <span className="text-3xl font-bold text-slate-800">14</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">KHS</p>
        </div>
        {/* Card 4 */}
        <div className="bg-sigap-cardRed rounded-xl p-4 flex flex-col items-center justify-center text-center shadow-sm border border-slate-100">
          <p className="text-sm text-slate-600 font-medium mb-2">Belum Upload KHS</p>
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-red-400" size={28} />
            <span className="text-3xl font-bold text-slate-800">14</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">KHS</p>
        </div>
        {/* Card 5 */}
        <div className="bg-sigap-cardYellow rounded-xl p-4 flex flex-col items-center justify-center text-center shadow-sm border border-slate-100">
          <p className="text-sm text-slate-600 font-medium mb-2">Pengajuan Keuangan</p>
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-yellow-400" size={28} />
            <span className="text-3xl font-bold text-slate-800">14</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">KHS</p>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama dosen atau NIP..."
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <select className="border border-slate-200 text-slate-500 text-sm rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 min-w-[140px] bg-white">
            <option>Semua Jurusan</option>
            <option>Teknik Elektro</option>
            <option>Teknik Sipil</option>
            <option>Teknik Mesin</option>
            <option>Admin Bisnis (AB)</option>
            <option>Akuntansi</option>
          </select>
          <select className="border border-slate-200 text-slate-500 text-sm rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 min-w-[140px] bg-white">
            <option>Semua Status</option>
            <option>Aktif</option>
            <option>Pending</option>
            <option>Nonaktif</option>
          </select>
          <button className="flex items-center gap-2 border border-slate-200 text-slate-600 text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-slate-50 transition-colors bg-white">
            <Filter size={16} />
            Filter
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-4 font-medium">No</th>
                <th className="px-6 py-4 font-medium">Dosen</th>
                <th className="px-6 py-4 font-medium">NIP</th>
                <th className="px-6 py-4 font-medium">Jurusan</th>
                <th className="px-6 py-4 font-medium">Jabatan</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Terakhir Update</th>
                <th className="px-6 py-4 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {dataDosen.map((dosen, index) => (
                <tr key={dosen.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-sm text-slate-500 font-medium">{index + 1}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {/* Avatar dinamis */}
                      <div className="w-9 h-9 rounded-full bg-sigap-primary flex items-center justify-center text-white text-xs font-bold">
                        {dosen.nama.split(" ")[1]?.charAt(0) || dosen.nama.charAt(0)}
                      </div>
                      <span className="font-semibold text-sm text-slate-800">{dosen.nama}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 font-mono">{dosen.nip}</td>
                  <td className="px-6 py-4 text-sm text-slate-700">{dosen.jurusan}</td>
                  <td className="px-6 py-4 text-sm text-slate-700">{dosen.jabatan}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        dosen.status === 'Aktif' ? 'bg-green-100 text-green-700' : 
                        dosen.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 
                        'bg-red-100 text-red-700'
                      }`}>
                      {dosen.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 flex items-center gap-1.5">
                    <Calendar size={14} />
                    {dosen.terakhirUpdate}
                  </td>
                  <td className="px-6 py-4">
                    <Link href={`/admin/riwayat-dosen/${dosen.id}`} className="flex items-center gap-1.5 bg-blue-50 text-blue-600 w-fit text-xs font-semibold px-3 py-1.5 rounded-md hover:bg-blue-100 transition-colors">
                      <Eye size={14} />
                      Detail
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
          <p className="text-sm text-slate-500">Menampilkan <span className="font-medium">1-{dataDosen.length}</span> dari <span className="font-medium">{dataDosen.length}</span> dosen</p>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 border border-slate-200 text-sm text-slate-500 rounded-md hover:bg-slate-50 transition-colors disabled:opacity-50" disabled>
              Previous
            </button>
            <button className="px-3 py-1.5 bg-sigap-primary text-white text-sm rounded-md">1</button>
            <button className="px-3 py-1.5 border border-slate-200 text-sm text-slate-500 rounded-md hover:bg-slate-50 transition-colors disabled:opacity-50" disabled>
              Next
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}