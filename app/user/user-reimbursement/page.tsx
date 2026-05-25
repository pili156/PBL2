import Link from "next/link";
import { headers } from "next/headers";
import { prisma } from "@/src/lib/prisma";
import { Clock3, CheckCircle2, FileText, Plus, AlertCircle } from "lucide-react";

function formatRupiah(value: unknown) {
  if (value === null || value === undefined) return "-";
  const numericValue = typeof value === "object" && value !== null && "toNumber" in value
    ? Number((value as { toNumber: () => number }).toNumber())
    : Number(value);
  if (Number.isNaN(numericValue)) return "-";
  return `Rp ${numericValue.toLocaleString("id-ID", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function normalizeStatus(status?: string | null) {
  if (!status) return "Pending";
  const text = status.toLowerCase();
  if (text.includes("selesai") || text.includes("completed")) return "Selesai";
  if (text.includes("disetujui") || text.includes("approved") || text.includes("diterima")) return "Disetujui";
  if (text.includes("revisi") || text.includes("ditolak")) return "Perlu Revisi";
  return "Diproses";
}

function statusClasses(status: string) {
  switch (status) {
    case "Disetujui": return "text-emerald-600 bg-emerald-50 border-emerald-100";
    case "Selesai": return "text-sky-600 bg-sky-50 border-sky-100";
    case "Perlu Revisi": return "text-orange-600 bg-orange-50 border-orange-100";
    default: return "text-amber-600 bg-amber-50 border-amber-100";
  }
}

const STATUS_CARDS = [
  { label: "Total Pengajuan", key: "total", icon: FileText },
  { label: "Diproses", key: "diproses", icon: Clock3 },
  { label: "Disetujui", key: "disetujui", icon: CheckCircle2 },
  { label: "Perlu Revisi", key: "revisi", icon: AlertCircle },
];

export default async function BantuanStudiPage() {
  const headersList = await headers();
  const userId = parseInt(headersList.get('x-user-id') || '0');

  if (!userId) {
    return (
      <div className="rounded-3xl bg-white p-10 shadow-sm border border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900">Bantuan Studi Saya</h1>
        <p className="mt-2 text-slate-600">Silakan login untuk melihat data bantuan studi Anda.</p>
      </div>
    );
  }

  const pengajuan = await prisma.pengajuanStudi.findFirst({
    where: { user_id: userId },
    orderBy: { created_at: "desc" },
    include: {
      pengajuan_reimbursement: {
        where: { jenis_pengajuan: "bantuan_studi" },
        orderBy: { created_at: "desc" },
      },
    },
  });

  const bantuanStudiList = pengajuan?.pengajuan_reimbursement ?? [];

  const counts = {
    total: bantuanStudiList.length,
    diproses: bantuanStudiList.filter((item) => {
      const status = item.status_pencairan?.toLowerCase() ?? "";
      return status === "pending" || status === "diproses" || status === "menunggu";
    }).length,
    disetujui: bantuanStudiList.filter((item) => {
      const status = item.status_pencairan?.toLowerCase() ?? "";
      return status.includes("disetujui") || status.includes("diterima");
    }).length,
    revisi: bantuanStudiList.filter((item) => {
      const status = item.status_pencairan?.toLowerCase() ?? "";
      return status.includes("revisi") || status.includes("ditolak");
    }).length,
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">Bantuan Studi Saya</h1>
        <p className="text-sm text-slate-500">Ajukan dan pantau permohonan bantuan studi lanjut Anda.</p>
      </div>

      <div className="grid gap-4 xl:grid-cols-4">
        {STATUS_CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.key} className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-700">
                <Icon size={24} />
              </div>
              <div>
                <p className="text-sm text-slate-500">{card.label}</p>
                <p className="text-3xl font-semibold text-slate-900">{counts[card.key as keyof typeof counts]}</p>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400 mt-1">Pengajuan</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-[28px] border border-slate-200 shadow-sm p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Daftar Pengajuan Bantuan Studi</h2>
          </div>
          <Link
            href="/user/user-reimbursement/ajukan"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            <Plus size={16} /> Ajukan Baru
          </Link>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-y-3 text-left">
            <thead>
              <tr className="text-sm font-semibold text-slate-600">
                <th className="px-4 py-3">No</th>
                <th className="px-4 py-3">Semester</th>
                <th className="px-4 py-3">Tahun Akademik</th>
                <th className="px-4 py-3">Nominal</th>
                <th className="px-4 py-3">Tanggal Pengajuan</th>
                <th className="px-4 py-3">Status</th>
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
                  const status = normalizeStatus(item.status_pencairan);
                  const statusClass = statusClasses(status);
                  return (
                    <tr key={item.id} className="bg-slate-50/80 rounded-[18px] border border-slate-100">
                      <td className="px-4 py-4 text-sm font-medium text-slate-700">{index + 1}.</td>
                      <td className="px-4 py-4 text-sm text-slate-700">Semester {item.semester_ke}</td>
                      <td className="px-4 py-4 text-sm text-slate-700">{item.tahun_akademik || "-"}</td>
                      <td className="px-4 py-4 text-sm text-slate-700">{formatRupiah(item.nominal)}</td>
                      <td className="px-4 py-4 text-sm text-slate-600">
                        {item.created_at
                          ? new Date(item.created_at).toLocaleDateString("id-ID", {
                              day: "2-digit", month: "long", year: "numeric",
                            })
                          : "-"}
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${statusClass}`}>
                          {status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <Link
                          href={`/user/user-reimbursement/${item.id}`}
                          className="inline-flex items-center justify-center rounded-full border border-blue-600 bg-white px-4 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-50"
                        >
                          Lihat Detail
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
