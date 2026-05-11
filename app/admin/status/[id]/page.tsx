import { prisma } from "../../../../src/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, UploadCloud } from "lucide-react";

export default async function ManajemenStatusPage({ params }: { params: any }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  const data: any = await prisma.pengajuanStudi.findUnique({
    where: { 
      id: parseInt(id) 
    },
    include: {
      user: { 
        include: { 
          master_dosen: true 
        } 
      },
      status: true,
      wilayah: true
    }
  });

  if (!data) return notFound();

  return (
    <div className="p-8 bg-[#F8FAFC] min-h-screen">
      {/* Header Section dengan Judul Baru */}
      <div className="mb-10">
        <div className="flex items-center gap-4 mb-2">
          <Link href="/admin/status" className="p-2 hover:bg-gray-200 rounded-full transition-all">
            <ChevronLeft size={28} className="text-[#0A192F]" />
          </Link>
          <h1 className="text-3xl font-bold text-[#0A192F]">Upload SK</h1>
        </div>
        <p className="text-sm text-gray-400 font-medium ml-14">
          Dashboard {'>'} <span className="text-gray-500 font-bold">Status</span>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-[#1F1F1F]">
        {/* Kolom Kiri: Form Upload & Status */}
        <div className="lg:col-span-2 bg-white p-10 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div>
            <h2 className="font-bold text-xl mb-2 text-[#0A192F]">Penerbitan Surat Keputusan</h2>
            <p className="text-sm text-gray-400 mb-8 font-medium italic">Harap unggah dokumen resmi dalam format PDF (Maks. 5MB).</p>
            
            <div className="border-2 border-dashed border-blue-100 bg-blue-50/20 rounded-2xl p-20 flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 transition-all group">
              <div className="bg-white p-6 rounded-full shadow-lg mb-6 group-hover:scale-110 transition-transform">
                <UploadCloud size={48} className="text-[#0085FF]" />
              </div>
              <p className="text-base font-bold text-[#0A192F] uppercase tracking-widest">Klik untuk Unggah SK Resmi</p>
              <p className="text-[10px] text-gray-400 mt-3 font-black tracking-widest">SUPPORTED FORMAT: PDF ONLY</p>
            </div>

            {/* Dropdown Status: Kosong di awal, lalu pilih DITERIMA */}
            <div className="mt-12">
              <label className="block text-[10px] font-black text-[#434343] mb-4 uppercase tracking-[0.2em]">Update Status Verifikasi:</label>
              <select className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-[#0085FF] font-bold text-sm text-[#434343] cursor-pointer">
                <option value="">Pilih Status Baru...</option>
                <option value="DITERIMA">DITERIMA</option>
              </select>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Informasi Dosen */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 h-fit">
          <h2 className="font-bold text-xl text-[#0A192F] mb-8 border-b border-gray-50 pb-5">Informasi Dosen</h2>
          <div className="space-y-7">
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-400 font-black uppercase mb-1.5 tracking-[0.15em]">Nama Lengkap</span>
              <span className="font-bold text-[#1F1F1F] text-sm">{data.user?.master_dosen?.nama_lengkap || "-"}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-400 font-black uppercase mb-1.5 tracking-[0.15em]">NIP</span>
              <span className="font-bold font-mono text-[#1F1F1F] text-sm">{data.user?.master_dosen?.nip || "-"}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-400 font-black uppercase mb-1.5 tracking-[0.15em]">Wilayah</span>
              <span className="font-bold text-[#1F1F1F] text-sm">{data.wilayah?.nama_wilayah || "-"}</span>
            </div>

            <div className="pt-8 mt-4 border-t border-gray-50 flex justify-between items-center">
              <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Status Saat Ini</span>
              <span className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] ${
                data.status?.nama_status === 'DITERIMA' 
                  ? 'bg-[#C4F2C9] text-[#2D7336]' 
                  : 'bg-[#FFE2E2] text-[#CC3333]'
              }`}>
                {data.status?.nama_status || "PENDING"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="mt-12 flex justify-end">
        <button className="bg-[#0085FF] text-white px-14 py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-blue-100 hover:bg-[#006ACC] hover:-translate-y-1 transition-all active:scale-95">
          Simpan & Terbitkan SK
        </button>
      </div>
    </div>
  );
}