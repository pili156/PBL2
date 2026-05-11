import { AlertCircle, ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function StatusProsesUser() {
  // Simulasi status dari database
  const statusPengajuan = "DIPROSES";

  return (
    <div className="p-8 bg-[#F8FAFC] min-h-screen font-sans text-[#1F1F1F]">
      {/* Header Breadcrumb */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0A192F] mb-1">Status</h1>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <span>Dashboard</span>
          <span>&gt;</span>
          <span className="text-[#0085FF] font-bold">Status</span>
        </div>
      </div>

      {/* Konten Utama */}
      <div className="max-w-5xl space-y-8">
        <p className="text-sm text-gray-500 leading-relaxed max-w-4xl">
          Pengajuan studi lanjut Anda sedang diproses. Admin kepegawaian telah mengunggah Surat Keputusan (SK). 
          Anda dapat mengunduh file di bawah ini dan memantau status studi aktif Anda.
        </p>

        {/* Badge Status */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 inline-flex items-center gap-4">
          <span className="font-bold text-sm text-[#0A192F]">Status Pengajuan :</span>
          <div className="bg-[#8E8E8E] text-white px-4 py-1.5 rounded-md text-xs font-bold flex items-center gap-2 tracking-widest uppercase">
            {statusPengajuan}
            <span className="text-[14px]">⏳</span>
          </div>
        </div>

        {/* Info Box (Orange/Yellow) */}
        <div className="bg-[#FFF4E5] border border-[#FFE7A5] p-6 rounded-2xl flex gap-5 max-w-4xl">
          <div className="bg-[#E59500] w-10 h-10 rounded-full flex items-center justify-center shrink-0">
            <AlertCircle className="text-white" size={24} />
          </div>
          <p className="text-sm text-[#8A6D3B] leading-relaxed font-medium">
            Pengajuan Anda sedang diperiksa oleh Admin Kepegawaian. Proses ini memerlukan waktu untuk 
            validasi dokumen SK dan persiapan studi aktif Anda. Mohon cek halaman ini secara berkala.
          </p>
        </div>

        {/* Tombol Kembali */}
        <div className="pt-10">
          <Link 
            href="/user/dashboard" 
            className="inline-flex items-center gap-2 text-gray-500 font-bold text-sm hover:text-[#0085FF] transition-all group"
          >
            <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            Kembali
          </Link>
        </div>
      </div>
    </div>
  );
}