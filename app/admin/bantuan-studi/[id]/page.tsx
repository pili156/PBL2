"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Download, FileText, Loader2 } from "lucide-react";

function formatDate(dateValue?: string | Date | null) {
  if (!dateValue) return "-";
  return new Date(dateValue).toLocaleDateString("id-ID", {
    day: "2-digit", month: "long", year: "numeric",
  });
}

function normalizeStatus(status?: string | null) {
  if (!status) return "Pending";
  const text = status.toLowerCase();
  if (text.includes("selesai") || text.includes("completed")) return "Selesai";
  if (text.includes("disetujui") || text.includes("diterima")) return "Disetujui";
  if (text.includes("revisi") || text.includes("ditolak")) return "Perlu Revisi";
  return "Diproses";
}

function statusBadge(status: string) {
  switch (status) {
    case "Disetujui": return "text-emerald-700 bg-emerald-100";
    case "Selesai": return "text-sky-700 bg-sky-100";
    case "Perlu Revisi": return "text-orange-700 bg-orange-100";
    default: return "text-amber-700 bg-amber-100";
  }
}

type DetailData = {
  id: number;
  semester_ke: number;
  tahun_akademik: string | null;
  tahun_ke: number | null;
  nominal: string | number;
  status_pencairan: string | null;
  catatan_keuangan: string | null;
  created_at: string | null;
  pengajuan_studi: {
    id: number;
    user: {
      username: string | null;
      email: string | null;
      master_dosen: { nama_lengkap: string | null; nip: string | null } | null;
    } | null;
    jenis_studi: { nama_jenis: string | null } | null;
    jalur_pendanaan: { nama_pendanaan: string | null } | null;
    wilayah: { nama_wilayah: string | null } | null;
    dokumen_pengajuan: Array<{
      id: number;
      file_path: string | null;
      master_dokumen: { nama_dokumen: string | null } | null;
    }>;
  } | null;
};

export default function AdminBantuanStudiDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const [data, setData] = useState<DetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [catatan, setCatatan] = useState("");

  useEffect(() => {
    if (!id) {
      setError("ID tidak valid.");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const res = await fetch(`/api/user-reimbursement/${id}`);
        const result = await res.json();
        if (!res.ok) throw new Error(result?.error || "Gagal memuat data");
        setData(result);
        setCatatan(result.catatan_keuangan || "");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleAction = async (status: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/pengajuan-monitoring/dokumen/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status_verifikasi: status, catatan_revisi: catatan }),
      });

      if (!res.ok) throw new Error("Gagal memperbarui status");

      // Also update the parent pengajuan_reimbursement status
      // Since we're using the existing admin API for dokumen, we need to
      // handle the reimbursement status separately
      const reimbursementRes = await fetch(`/api/admin/pengajuan-monitoring/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dokumen: [{ id: Number(id), status_verifikasi: status, catatan_revisi: catatan }],
        }),
      });

      if (!reimbursementRes.ok) throw new Error("Gagal memperbarui");

      router.refresh();
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memproses");
    } finally {
      setActionLoading(false);
    }
  };

  // Simplified action using direct update for reimbursement record
  const handleVerification = async (newStatus: string) => {
    setActionLoading(true);
    try {
      // Update the reimbursement record's status and catatan
      const res = await fetch(`/api/admin/bantuan-studi/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, catatan_revisi: catatan }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData?.error || "Gagal memperbarui status");
      }

      router.refresh();
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memproses");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <p className="text-slate-600">Memuat detail...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Data tidak ditemukan</h1>
        <p className="mt-3 text-slate-600">{error || "Data tidak tersedia."}</p>
        <Link href="/admin/bantuan-studi" className="mt-6 inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700">
          Kembali
        </Link>
      </div>
    );
  }

  const statusLabel = normalizeStatus(data.status_pencairan);
  const dokumenFiles = data.pengajuan_studi?.dokumen_pengajuan ?? [];
  const isPending = data.status_pencairan?.toLowerCase() === "pending" || data.status_pencairan?.toLowerCase() === "menunggu";

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-3">
          <Link href="/admin/bantuan-studi" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-slate-900">
            <ArrowLeft size={18} /> Kembali
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Verifikasi Bantuan Studi</h1>
            <p className="text-sm text-slate-500">Detail pengajuan bantuan studi.</p>
          </div>
        </div>
        <div className={`rounded-3xl px-5 py-4 text-sm font-semibold ${statusBadge(statusLabel)}`}>
          {statusLabel}
        </div>
      </div>

      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.16em] text-slate-500">
              Semester {data.semester_ke} {data.tahun_akademik ? `- TA ${data.tahun_akademik}` : ""}
            </p>
            <h2 className="text-2xl font-semibold text-slate-900">
              {data.pengajuan_studi?.user?.master_dosen?.nama_lengkap || data.pengajuan_studi?.user?.username || "Dosen"}
            </h2>
            <p className="text-sm text-slate-500">
              NIP: {data.pengajuan_studi?.user?.master_dosen?.nip || "-"} • Diajukan {formatDate(data.created_at)}
            </p>
          </div>
          <div className="rounded-3xl bg-slate-50 p-5">
            <p className="text-sm text-slate-500">Bantuan Diajukan</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">
              Rp {Number(data.nominal ?? 0).toLocaleString("id-ID", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <div className="space-y-6">
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Dokumen Terupload</h2>
            <div className="mt-4 space-y-3">
              {dokumenFiles.length === 0 ? (
                <p className="text-sm text-slate-500">Belum ada dokumen.</p>
              ) : (
                dokumenFiles.map((doc) => (
                  <div key={doc.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText size={18} className="text-blue-600" />
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {doc.master_dokumen?.nama_dokumen || "Dokumen"}
                          </p>
                          <p className="text-xs text-slate-500">
                            {doc.file_path ? "Tersedia" : "Belum diupload"}
                          </p>
                        </div>
                      </div>
                      {doc.file_path && (
                        <a
                          href={doc.file_path}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 rounded-full border border-blue-600 bg-white px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50"
                        >
                          <Download size={16} /> Download
                        </a>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Informasi Pemohon</h2>
            <div className="mt-4 grid gap-4 text-sm text-slate-700 sm:grid-cols-2">
              <div>
                <p className="text-xs text-slate-500">Nama</p>
                <p className="font-semibold">{data.pengajuan_studi?.user?.master_dosen?.nama_lengkap || data.pengajuan_studi?.user?.username || "-"}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">NIP</p>
                <p className="font-semibold">{data.pengajuan_studi?.user?.master_dosen?.nip || "-"}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Email</p>
                <p className="font-semibold">{data.pengajuan_studi?.user?.email || "-"}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Jenis Studi</p>
                <p className="font-semibold">{data.pengajuan_studi?.jenis_studi?.nama_jenis || "-"}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Pendanaan</p>
                <p className="font-semibold">{data.pengajuan_studi?.jalur_pendanaan?.nama_pendanaan || "-"}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Wilayah</p>
                <p className="font-semibold">{data.pengajuan_studi?.wilayah?.nama_wilayah || "-"}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Tindakan Verifikasi</h2>

            <div className="mt-4 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Catatan Verifikasi</label>
                <textarea
                  rows={4}
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  placeholder="Tambahkan catatan untuk pemohon..."
                  className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => handleVerification("Disetujui")}
                  disabled={actionLoading || !isPending}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                  Setujui
                </button>
                <button
                  onClick={() => handleVerification("Revisi")}
                  disabled={actionLoading || !isPending}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
                  Minta Revisi
                </button>
                <button
                  onClick={() => handleVerification("Ditolak")}
                  disabled={actionLoading || !isPending}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-red-600 px-6 py-3 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
                  Tolak
                </button>
              </div>

              {!isPending && (
                <div className="rounded-2xl bg-blue-50 border border-blue-200 p-4 text-sm text-blue-700">
                  Pengajuan ini sudah diproses. Status saat ini: <strong>{statusLabel}</strong>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
