import { AlertCircle, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { headers } from "next/headers";
import { prisma } from "@/src/lib/prisma";
import StatusBadge from "@/src/components/StatusBadge";

export const dynamic = "force-dynamic";

export default async function StatusProsesUser() {
  const headersList = await headers();
  const userEmail = headersList.get('x-user-email');

  let statusPengajuan = "belum_ada";
  if (userEmail) {
    const currentUser = await prisma.user.findUnique({
      where: { email: userEmail },
    });
    if (currentUser) {
      const pengajuan = await prisma.pengajuanStudi.findFirst({
        where: { user_id: currentUser.id },
        orderBy: { created_at: "desc" },
        include: { status: true },
      });
      statusPengajuan = pengajuan?.status?.nama_status || "belum_ada";
    }
  }

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-1">Status</h1>
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <span>Dashboard</span>
          <span>&gt;</span>
          <span className="text-blue-600 font-bold">Status</span>
        </div>
      </div>

      <div className="max-w-5xl space-y-8">
        <p className="text-sm text-slate-500 leading-relaxed max-w-4xl">
          Pengajuan studi lanjut Anda sedang diproses. Admin kepegawaian telah mengunggah Surat Keputusan (SK). 
          Anda dapat mengunduh file di bawah ini dan memantau status studi aktif Anda.
        </p>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm inline-flex items-center gap-4">
          <span className="font-bold text-sm text-slate-800">Status Pengajuan :</span>
          <StatusBadge status={statusPengajuan} domain="pengajuan" size="md" uppercase />
        </div>

        <div className="bg-amber-50 border border-amber-200 p-6 rounded-xl flex gap-5 max-w-4xl">
          <div className="bg-amber-500 w-10 h-10 rounded-full flex items-center justify-center shrink-0">
            <AlertCircle className="text-white" size={24} />
          </div>
          <p className="text-sm text-amber-800 leading-relaxed font-medium">
            Pengajuan Anda sedang diperiksa oleh Admin Kepegawaian. Proses ini memerlukan waktu untuk 
            validasi dokumen SK dan persiapan studi aktif Anda. Mohon cek halaman ini secara berkala.
          </p>
        </div>

        <div className="pt-10">
          <Link 
            href="/user/dashboard" 
            className="inline-flex items-center gap-2 text-slate-500 font-bold text-sm hover:text-blue-600 transition-all group"
          >
            <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            Kembali
          </Link>
        </div>
      </div>
    </div>
  );
}
