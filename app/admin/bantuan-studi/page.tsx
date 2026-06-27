import Link from "next/link";
import { headers } from "next/headers";
import { prisma } from "@/src/lib/prisma";
import { FileText, Clock3, CheckCircle2, AlertCircle, Download } from "lucide-react";
import { formatRupiah } from "@/src/lib/formatters";
import StatusBadge from "@/src/components/StatusBadge";

const STATUS_CARDS = [
  { label: "Total Pengajuan", key: "total", icon: FileText },
  { label: "Diproses", key: "diproses", icon: Clock3 },
  { label: "Disetujui", key: "disetujui", icon: CheckCircle2 },
  { label: "Perlu Revisi", key: "revisi", icon: AlertCircle },
];

export default async function AdminBantuanStudiPage() {
  const headersList = await headers();
  const role = headersList.get("x-user-role");

  if (!role || (role !== "master_admin" && role !== "admin")) {
    return (
      <div className="rounded-3xl bg-white p-10 shadow-sm border border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900">Akses Ditolak</h1>
        <p className="mt-2 text-slate-600">Anda tidak memiliki akses ke halaman ini.</p>
      </div>
    );
  }

  const bantuanStudiList = await prisma.pengajuanReimbursement.findMany({
    where: { jenis_pengajuan: "bantuan_studi" },
    orderBy: { created_at: "desc" },
    include: {
      pengajuan_studi: {
        include: {
          user: {
            include: { master_dosen: true },
          },
          status: true,
          jenis_studi: true,
          dokumen_pengajuan: {
            where: { master_dokumen_id: { in: [21, 22, 23, 24] } },
            include: { master_dokumen: true },
          },
        },
      },
    },
  });

  const counts = {
    total: bantuanStudiList.length,
    diproses: bantuanStudiList.filter((item) => {
      const s = item.status_pencairan?.toLowerCase() ?? "";
      return s === "pending" || s === "diproses" || s === "menunggu";
    }).length,
    disetujui: bantuanStudiList.filter((item) => {
      const s = item.status_pencairan?.toLowerCase() ?? "";
      return ["disetujui", "dicairkan", "selesai"].includes(s);
    }).length,
    revisi: bantuanStudiList.filter((item) => {
      const s = item.status_pencairan?.toLowerCase() ?? "";
      return ["revisi", "ditolak", "dibatalkan"].includes(s);
    }).length,
  };

  const totalDisbursed = bantuanStudiList
    .filter((item) => {
      const s = item.status_pencairan?.toLowerCase() ?? "";
      return ["disetujui", "dicairkan", "selesai"].includes(s);
    })
    .reduce((sum, item) => sum + Number(item.nominal ?? 0), 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-slate-800">Verifikasi Bantuan Studi</h1>
        <p className="text-sm text-slate-500">Verifikasi pengajuan bantuan studi dari dosen.</p>
      </div>

      <div className="grid gap-4 xl:grid-cols-5">
        {STATUS_CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.key} className="rounded-xl bg-white border border-slate-200 p-6 shadow-sm flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-slate-50 flex items-center justify-center text-slate-700">
                <Icon size={24} />
              </div>
              <div>
                <p className="text-sm text-slate-500">{card.label}</p>
                <p className="text-3xl font-bold text-slate-800">{counts[card.key as keyof typeof counts]}</p>
              </div>
            </div>
          );
        })}
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-6 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-sm text-emerald-700 font-medium">Total Dana Tersalurkan</p>
            <p className="text-xl font-semibold text-emerald-900">{formatRupiah(totalDisbursed)}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-base font-bold text-slate-800">Daftar Pengajuan Bantuan Studi</h2>

        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-y-3 text-left">
            <thead>
              <tr className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-4 py-3">No</th>
                <th className="px-4 py-3">Nama Dosen</th>
                <th className="px-4 py-3">Semester</th>
                <th className="px-4 py-3">Nominal</th>
                <th className="px-4 py-3">Status Dokumen</th>
                <th className="px-4 py-3">Status Pengajuan</th>
                <th className="px-4 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {bantuanStudiList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-500">
                    Belum ada pengajuan bantuan studi.
                  </td>
                </tr>
              ) : (
                bantuanStudiList.map((item, index) => {
                  const allDocs = item.pengajuan_studi?.dokumen_pengajuan ?? [];
                  return (
                    <tr key={item.id} className="bg-slate-50/80 border border-slate-100">
                      <td className="px-4 py-4 text-sm font-medium text-slate-700">{index + 1}.</td>
                      <td className="px-4 py-4 text-sm text-slate-700">
                        {(() => {
                          const namaLengkap = item.pengajuan_studi?.user?.master_dosen?.nama_lengkap || item.pengajuan_studi?.user?.username || "-";
                          const isDoktorLulus = 
                            (item.pengajuan_studi?.user?.master_dosen?.pendidikan_terakhir === 'S3' && item.pengajuan_studi?.user?.master_dosen?.tanggal_lulus) ||
                            (item.pengajuan_studi?.status?.nama_status === 'lulus' && 
                             (item.pengajuan_studi?.jenis_studi?.nama_jenis?.toLowerCase().includes('s3') || 
                              item.pengajuan_studi?.jenis_studi?.nama_jenis?.toLowerCase().includes('doktor')));
                          return isDoktorLulus && !namaLengkap.startsWith('Dr.') ? `Dr. ${namaLengkap}` : namaLengkap;
                        })()}
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-700">Semester {item.semester_ke}</td>
                      <td className="px-4 py-4 text-sm text-slate-700">{formatRupiah(item.nominal)}</td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-1.5">
                          {allDocs.length === 0 ? (
                            <span className="text-xs text-slate-400">Tidak ada</span>
                          ) : (
                            allDocs.map((doc) => {
                              return (
                                <div
                                  key={doc.id}
                                  className="flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium bg-white border border-slate-200"
                                  title={doc.master_dokumen?.nama_dokumen ?? ""}
                                >
                                  <span className="max-w-[100px] truncate">{doc.master_dokumen?.nama_dokumen?.replace("Bantuan Studi ", "") || "Dokumen"}</span>
                                  <StatusBadge status={doc.status_verifikasi} domain="verifikasi" size="sm" />
                                  {doc.file_path && (
                                    <a href={doc.file_path} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-800">
                                      <Download size={10} />
                                    </a>
                                  )}
                                </div>
                              );
                            })
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <StatusBadge status={item.status_pencairan} domain="pencairan" size="md" />
                      </td>
                      <td className="px-4 py-4 text-center">
                        <Link
                          href={`/admin/bantuan-studi/${item.id}`}
                          className="inline-flex items-center justify-center rounded-lg border border-blue-600 bg-white px-4 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-50"
                        >
                          Verifikasi
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
