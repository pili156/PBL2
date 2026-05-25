import { cookies } from "next/headers";
import Link from "next/link";
import { prisma } from "@/src/lib/prisma";
import { Plus, Download } from "lucide-react";

export const dynamic = "force-dynamic";

function formatRupiah(value: unknown) {
  if (value === null || value === undefined) return "-";
  const numericValue = typeof value === "object" && value !== null && "toNumber" in value
    ? Number((value as { toNumber: () => number }).toNumber())
    : Number(value);
  if (Number.isNaN(numericValue)) return "-";
  return `Rp ${numericValue.toLocaleString("id-ID", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function normalizeStatus(status?: string | null) {
  if (!status) return "Diproses";
  const text = status.toLowerCase();
  if (text.includes("cair") || text.includes("dicaikan") || text.includes("selesai")) return "Cair";
  if (text.includes("tolak") || text.includes("revisi")) return "Ditolak";
  return "Diproses";
}

function statusBadge(status: string) {
  switch (status) {
    case "Cair":
      return (
        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> CAIR
        </span>
      );
    case "Ditolak":
      return (
        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-md">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> DITOLAK
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-md">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> DIPROSES
        </span>
      );
  }
}

export default async function RiwayatKeuanganPage() {
  const cookieStore = await cookies();
  const userEmail = cookieStore.get("user_email")?.value;

  if (!userEmail) {
    return <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-10 text-center text-slate-500">Silakan login terlebih dahulu</div>;
  }

  const currentUser = await prisma.user.findUnique({
    where: { email: userEmail },
  });

  if (!currentUser) {
    return <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-10 text-center text-slate-500">User tidak ditemukan</div>;
  }

  const pengajuan = await prisma.pengajuanStudi.findFirst({
    where: { user_id: currentUser.id },
    orderBy: { created_at: "desc" },
    include: {
      pengajuan_reimbursement: {
        orderBy: { created_at: "desc" },
      },
    },
  });

  const riwayatList = pengajuan?.pengajuan_reimbursement ?? [];

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Riwayat Pencairan Bantuan Studi</h3>
          <p className="text-sm text-slate-500 mt-0.5">Pantau status pencairan dan unduh bukti transfer</p>
        </div>
        <Link
          href="/user/user-reimbursement/ajukan"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus size={16} /> Ajukan Baru
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-200 text-xs font-bold text-slate-800">
              <th className="py-4 px-2 w-12 text-center">No</th>
              <th className="py-4 px-4">Semester</th>
              <th className="py-4 px-4">Tahun Akademik</th>
              <th className="py-4 px-4">Nominal</th>
              <th className="py-4 px-4">Tanggal Pengajuan</th>
              <th className="py-4 px-4">Tanggal Cair</th>
              <th className="py-4 px-4">Status</th>
              <th className="py-4 px-4 text-center">Bukti Transfer</th>
            </tr>
          </thead>
          <tbody>
            {riwayatList.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-10 text-slate-500">
                  Belum ada riwayat pencairan bantuan studi.
                </td>
              </tr>
            ) : (
              riwayatList.map((item, index) => {
                const status = normalizeStatus(item.status_pencairan);
                return (
                  <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-2 text-sm text-slate-600 text-center">{index + 1}.</td>
                    <td className="py-4 px-4 text-sm text-slate-800">Semester {item.semester_ke}</td>
                    <td className="py-4 px-4 text-sm text-slate-600">{item.tahun_akademik || "-"}</td>
                    <td className="py-4 px-4 text-sm font-bold text-slate-800">{formatRupiah(item.nominal)}</td>
                    <td className="py-4 px-4 text-sm text-slate-600">
                      {item.created_at
                        ? new Date(item.created_at).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })
                        : "-"}
                    </td>
                    <td className="py-4 px-4 text-sm text-slate-600">
                      {item.tanggal_pencairan
                        ? new Date(item.tanggal_pencairan).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })
                        : "-"}
                    </td>
                    <td className="py-4 px-4">{statusBadge(status)}</td>
                    <td className="py-4 px-4 text-center">
                      {item.file_bukti_bayar ? (
                        <a
                          href={item.file_bukti_bayar}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-blue-600 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-50 transition-all"
                        >
                          <Download size={14} /> Lihat
                        </a>
                      ) : (
                        <span className="text-[10px] text-slate-400">-</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {riwayatList.some((r) => r.catatan_keuangan) && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-xs text-amber-800">
          <p className="font-bold mb-1">Catatan:</p>
          {riwayatList.filter((r) => r.catatan_keuangan).map((r) => (
            <p key={r.id} className="mb-0.5">• Semester {r.semester_ke}: {r.catatan_keuangan}</p>
          ))}
        </div>
      )}
    </div>
  );
}
