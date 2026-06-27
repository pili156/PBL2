import { headers } from "next/headers";
import Link from "next/link";
import { prisma } from "@/src/lib/prisma";
import { Plus, Download, Wallet, Coins, CheckCircle2, Eye } from "lucide-react";
import { formatRupiah, formatDateLong } from "@/src/lib/formatters";
import StatusBadge from "@/src/components/StatusBadge";

export const dynamic = "force-dynamic";

const STATUS_CAIR = ["dicairkan", "selesai"] as const;

export default async function RiwayatKeuanganPage() {
  const headersList = await headers();
  const userEmail = headersList.get('x-user-email');

  if (!userEmail) {
    return <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-10 text-center text-slate-500">Silakan login terlebih dahulu</div>;
  }

  const allPengajuan = await prisma.pengajuanStudi.findMany({
    where: { user: { email: userEmail } },
    orderBy: { created_at: "desc" },
    include: {
      pengajuan_reimbursement: {
        orderBy: { created_at: "desc" },
        include: {
          dokumen_pengajuan: true,
        },
      },
    },
  });

  if (allPengajuan.length === 0) {
    return <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-10 text-center text-slate-500">Lakukan Studi Terlebih Dahulu</div>;
  }

  const allRiwayat = allPengajuan.flatMap((p) =>
    p.pengajuan_reimbursement.map((r) => ({
      ...r,
      perguruan_tinggi: p.perguruan_tinggi || "Universitas",
      pengajuan_id: p.id,
    }))
  );

  const computeEffectiveStatus = (item: typeof allRiwayat[0]): string => {
    if (item.dokumen_pengajuan?.some((doc) => doc.status_verifikasi === "revisi")) {
      return "revisi";
    }
    return item.status_pencairan?.toLowerCase() ?? "pending";
  };

  const riwayatEnriched = allRiwayat.map((r) => ({
    ...r,
    _effectiveStatus: computeEffectiveStatus(r),
  }));

  const { totalBantuan, totalCair } = riwayatEnriched.reduce(
    (acc, r) => {
      const nominal = Number(r.nominal || 0);
      acc.totalBantuan += nominal;
      if ((STATUS_CAIR as readonly string[]).includes(r._effectiveStatus)) {
        acc.totalCair += nominal;
      }
      return acc;
    },
    { totalBantuan: 0, totalCair: 0 }
  );
  const sisa = totalBantuan - totalCair;

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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-50 rounded-lg p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
            <Wallet size={20} className="text-blue-600" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider">Total Bantuan</p>
            <p className="text-lg font-bold text-slate-800">{formatRupiah(totalBantuan)}</p>
          </div>
        </div>
        <div className="bg-slate-50 rounded-lg p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
            <CheckCircle2 size={20} className="text-emerald-600" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider">Sudah Cair</p>
            <p className="text-lg font-bold text-emerald-600">{formatRupiah(totalCair)}</p>
          </div>
        </div>
        <div className="bg-slate-50 rounded-lg p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
            <Coins size={20} className="text-amber-600" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider">Sisa Belum Cair</p>
            <p className="text-lg font-bold text-amber-600">{formatRupiah(sisa)}</p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-200 text-xs font-bold text-slate-800">
              <th className="py-4 px-2 w-12 text-center">No</th>
              <th className="py-4 px-4">Pengajuan</th>
              <th className="py-4 px-4">Semester</th>
              <th className="py-4 px-4">Tahun Akademik</th>
              <th className="py-4 px-4">Nominal</th>
              <th className="py-4 px-4">Tanggal Pengajuan</th>
              <th className="py-4 px-4">Tanggal Cair</th>
              <th className="py-4 px-4">Status</th>
              <th className="py-4 px-4 text-center">Bukti Transfer</th>
              <th className="py-4 px-4 text-center">Detail</th>
            </tr>
          </thead>
          <tbody>
                    {riwayatEnriched.length === 0 ? (
              <tr>
                <td colSpan={10} className="text-center py-10 text-slate-500">
                  Belum ada riwayat pencairan bantuan studi.
                </td>
              </tr>
            ) : (
              riwayatEnriched.map((item, index) => (
                <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-2 text-sm text-slate-600 text-center">{index + 1}.</td>
                  <td className="py-4 px-4 text-sm text-slate-600">{item.perguruan_tinggi}</td>
                  <td className="py-4 px-4 text-sm text-slate-800">Semester {item.semester_ke}</td>
                  <td className="py-4 px-4 text-sm text-slate-600">{item.tahun_akademik || "-"}</td>
                  <td className="py-4 px-4 text-sm font-bold text-slate-800">{formatRupiah(item.nominal)}</td>
                  <td className="py-4 px-4 text-sm text-slate-600">{formatDateLong(item.created_at)}</td>
                  <td className="py-4 px-4 text-sm text-slate-600">{formatDateLong(item.tanggal_pencairan)}</td>
                  <td className="py-4 px-4"><StatusBadge 
                    status={item._effectiveStatus} 
                    domain={item.dokumen_pengajuan?.some(doc => doc.status_verifikasi === "revisi") ? "verifikasi" : "pencairan"} 
                    size="sm" 
                    dot 
                  /></td>
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
                  <td className="py-4 px-4 text-center">
                    <Link
                      href={`/user/user-reimbursement/${item.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-100 transition-all"
                    >
                      <Eye size={14} /> Lihat
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {(() => {
        const catatanItems = riwayatEnriched.filter((r) => r.catatan_keuangan);
        return catatanItems.length > 0 ? (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-xs text-amber-800">
            <p className="font-bold mb-1">Catatan:</p>
            {catatanItems.map((r) => (
              <p key={r.id} className="mb-0.5">&bull; {r.perguruan_tinggi} - Semester {r.semester_ke}: {r.catatan_keuangan}</p>
            ))}
          </div>
        ) : null;
      })()}
    </div>
  );
}
