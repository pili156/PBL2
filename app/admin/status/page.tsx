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
    <div className="p-8 bg-[#F8FAFC] min-h-screen">
      {/* Header Baru sesuai permintaan */}
      <div className="mb-2">
        <p className="text-sm text-gray-400 font-medium">
          Dashboard {'>'} <span className="text-[#0085FF] font-bold">Status</span>
        </p>
      </div>
      <h1 className="text-3xl font-bold text-[#0A192F] mb-10">Status Pengajuan Dosen</h1>

      {/* Filter & Search - Tetap simpel sesuai image_4ab16e */}
      <div className="flex items-center justify-between gap-6 mb-8">
        <div className="flex gap-8">
          <div className="flex items-center gap-2 cursor-pointer group">
            <span className="text-sm font-bold text-gray-500 group-hover:text-gray-700">Semua Semester</span>
            <span className="text-[10px] text-gray-400">▼</span>
          </div>
          <div className="flex items-center gap-2 cursor-pointer group">
            <span className="text-sm font-bold text-gray-500 group-hover:text-gray-700">Semua Status</span>
            <span className="text-[10px] text-gray-400">▼</span>
          </div>
        </div>

        <div className="relative w-full max-w-sm">
          <input 
            type="text" 
            placeholder="Cari Dosen / NIP..." 
            className="w-full pl-6 pr-12 py-3 bg-white border border-gray-200 rounded-full outline-none focus:border-blue-500 text-sm shadow-sm"
          />
          <Search className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        </div>
      </div>

      {/* Tabel - Persis seperti image_4a4bd6 & image_4ab16e */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-50 p-4">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-50">
              <th className="p-6 text-[11px] font-black text-gray-400 uppercase tracking-widest">No</th>
              <th className="p-6 text-[11px] font-black text-gray-400 uppercase tracking-widest">Nama Dosen</th>
              <th className="p-6 text-[11px] font-black text-gray-400 uppercase tracking-widest">NIP</th>
              <th className="p-6 text-[11px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
              <th className="p-6 text-[11px] font-black text-gray-400 uppercase tracking-widest text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {pengajuan.map((item, index) => (
              <tr key={item.id} className="hover:bg-gray-50/30 transition-colors">
                <td className="p-6 text-sm font-bold text-gray-400 text-center w-20">{index + 1}.</td>
                <td className="p-6 text-sm font-bold text-gray-700">{item.user?.master_dosen?.nama_lengkap || "-"}</td>
                <td className="p-6 text-sm font-medium text-gray-400">{item.user?.master_dosen?.nip || "-"}</td>
                <td className="p-6 text-center">
                  <span className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                    item.status?.nama_status === 'DITERIMA' 
                      ? 'bg-[#C4F2C9] text-[#2D7336]' 
                      : item.status?.nama_status === 'REVISI'
                      ? 'bg-[#FFEFD2] text-[#B38B3F]'
                      : 'bg-[#FFE2E2] text-[#CC3333]'
                  }`}>
                    {item.status?.nama_status || "PENDING"}
                  </span>
                </td>
                <td className="p-6 text-center">
                  <Link 
                    href={`/admin/status/${item.id}`}
                    className="text-[11px] font-black uppercase tracking-widest text-gray-400 hover:text-[#0085FF] transition-colors"
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