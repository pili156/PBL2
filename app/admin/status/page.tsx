import { prisma } from "../../../src/lib/prisma";
import Link from "next/link";
import { Search } from "lucide-react";

export default async function MonitoringPengajuanPage() {
  const pengajuan = await prisma.pengajuanStudi.findMany({
    include: {
      user: { include: { master_dosen: true } },
      status: true,
    },
    orderBy: { created_at: 'desc' }
  });

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <div className="mb-2">
        <p className="text-sm text-slate-400 font-medium">
          Dashboard {'>'} <span className="text-blue-600 font-bold">Status</span>
        </p>
      </div>
      <h1 className="text-3xl font-bold text-slate-900 mb-10">Status Pengajuan Dosen</h1>

      {/* Filter & Search - Tetap simpel sesuai image_4ab16e */}
      <div className="flex items-center justify-between gap-6 mb-8">
        <div className="flex gap-8">
          <div className="flex items-center gap-2 cursor-pointer group">
          <span className="text-sm font-bold text-slate-500 group-hover:text-slate-700">Semua Semester</span>
          <span className="text-[10px] text-slate-400">▼</span>
        </div>
        <div className="flex items-center gap-2 cursor-pointer group">
          <span className="text-sm font-bold text-slate-500 group-hover:text-slate-700">Semua Status</span>
          <span className="text-[10px] text-slate-400">▼</span>
          </div>
        </div>

        <div className="relative w-full max-w-sm">
          <input 
            type="text" 
            placeholder="Cari Dosen / NIP..." 
            className="w-full pl-6 pr-12 py-3 bg-white border border-slate-200 rounded-full outline-none focus:border-blue-500 text-sm shadow-sm"
          />
          <Search className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="p-6 text-xs font-bold text-slate-500 uppercase tracking-wider">No</th>
              <th className="p-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Nama Dosen</th>
              <th className="p-6 text-xs font-bold text-slate-500 uppercase tracking-wider">NIP</th>
              <th className="p-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Status</th>
              <th className="p-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {pengajuan.map((item, index) => (
              <tr key={item.id} className="hover:bg-slate-50/30 transition-colors">
                <td className="p-6 text-sm font-bold text-slate-400 text-center w-20">{index + 1}.</td>
                <td className="p-6 text-sm font-bold text-slate-700">{item.user?.master_dosen?.nama_lengkap || "-"}</td>
                <td className="p-6 text-sm font-medium text-slate-400">{item.user?.master_dosen?.nip || "-"}</td>
                <td className="p-6 text-center">
                  <span className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                    item.status?.nama_status === 'DITERIMA' 
                      ? 'text-emerald-700 bg-emerald-50 border border-emerald-200' 
                      : item.status?.nama_status === 'REVISI'
                      ? 'text-amber-700 bg-amber-50 border border-amber-200'
                      : 'text-rose-700 bg-rose-50 border border-rose-200'
                  }`}>
                    {item.status?.nama_status || "PENDING"}
                  </span>
                </td>
                <td className="p-6 text-center">
                  <Link 
                    href={`/admin/status/${item.id}`}
                    className="text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors"
                  >
                    Review
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}