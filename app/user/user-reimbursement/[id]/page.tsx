"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, CheckCircle2, Clock3, Download } from "lucide-react";

function formatDate(dateValue?: string | Date | null) {
  if (!dateValue) return "-";
  const date = new Date(dateValue);
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatDateTime(dateValue?: string | Date | null) {
  if (!dateValue) return "-";
  const date = new Date(dateValue);
  return `${date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })} - ${date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })} WIB`;
}

function normalizeStatus(status?: string | null) {
  if (!status) return "Belum Diajukan";
  const text = status.toLowerCase();
  if (text.includes("selesai") || text.includes("completed")) return "Selesai";
  if (text.includes("disetujui") || text.includes("approved")) return "Disetujui";
  if (text.includes("revisi")) return "Perlu Revisi";
  return "Diproses";
}

function statusBadge(status: string) {
  switch (status) {
    case "Disetujui":
      return "text-emerald-700 bg-emerald-100";
    case "Selesai":
      return "text-sky-700 bg-sky-100";
    case "Perlu Revisi":
      return "text-orange-700 bg-orange-100";
    default:
      return "text-amber-700 bg-amber-100";
  }
}

type ReimbursementDetail = {
  id: number;
  semester_ke: number;
  nominal: string | number;
  status_pencairan: string | null;
  catatan_keuangan: string | null;
  nomor_rekening: string | null;
  nama_bank: string | null;
  file_bukti_bayar: string | null;
  created_at: string | null;
  tanggal_pencairan: string | null;
  pengajuan_studi: {
    user: { username: string | null } | null;
    jalur_pendanaan: { nama_pendanaan: string | null } | null;
  } | null;
};

export default function ReimbursementDetailPage() {
  const params = useParams();
  const id = params?.id;
  const [reimbursement, setReimbursement] = useState<ReimbursementDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError("ID pengajuan tidak valid.");
      setLoading(false);
      return;
    }

    const fetchReimbursement = async () => {
      try {
        const response = await fetch(`/api/user-reimbursement/${id}`);
        const data = await response.json();

        if (!response.ok) {
          setError(data?.error || "Gagal memuat detail reimbursement.");
          return;
        }

        setReimbursement(data);
      } catch (err) {
        setError("Terjadi kesalahan saat memuat data.");
      } finally {
        setLoading(false);
      }
    };

    fetchReimbursement();
  }, [id]);

  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <p className="text-slate-600">Memuat detail reimbursement...</p>
      </div>
    );
  }

  if (error || !reimbursement) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Pengajuan tidak ditemukan</h1>
        <p className="mt-3 text-slate-600">{error || "Data reimbursement tidak tersedia."}</p>
        <Link href="/user/user-reimbursement" className="mt-6 inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700">
          Kembali ke Reimbursement
        </Link>
      </div>
    );
  }

  const statusLabel = normalizeStatus(reimbursement.status_pencairan);
  const isApproved = statusLabel === "Disetujui" || statusLabel === "Selesai";
  const isDone = statusLabel === "Selesai";
  const isRevision = statusLabel === "Perlu Revisi";
  const progressSteps = [
    {
      label: "Progres Pengajuan",
      sub: formatDate(reimbursement.created_at),
      done: true,
      description: "Pengajuan berhasil dikirim",
    },
    {
      label: "Diverifikasi Admin",
      sub: isApproved || isRevision ? formatDate(reimbursement.created_at) : "Menunggu verifikasi",
      done: isApproved || isRevision || isDone,
      description: isRevision ? "Perlu revisi pada dokumen" : "Bukti pembayaran telah diverifikasi",
    },
    {
      label: "Disetujui",
      sub: isApproved ? formatDate(reimbursement.created_at) : isRevision ? "Perlu revisi" : "Menunggu persetujuan",
      done: isApproved || isDone,
      description: isApproved ? "Pengajuan disetujui oleh admin" : "Menunggu persetujuan",
    },
    {
      label: "Dana Ditranfer",
      sub: isDone ? formatDate(reimbursement.tanggal_pencairan) : "Menunggu transfer",
      done: isDone,
      description: isDone ? "Dana telah ditransfer ke rekening Anda" : "Menunggu transfer dana",
    },
    {
      label: "Selesai",
      sub: isDone ? formatDate(reimbursement.tanggal_pencairan) : "Menunggu penyelesaian",
      done: isDone,
      description: isDone ? "Dana telah diterima" : "Menunggu penyelesaian akhir",
    },
  ];

  const downloadUrl = reimbursement.file_bukti_bayar
    ? reimbursement.file_bukti_bayar.startsWith("/")
      ? reimbursement.file_bukti_bayar
      : `/uploads/dokumen/${reimbursement.id}/${reimbursement.file_bukti_bayar}`
    : undefined;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-3">
          <Link href="/user/user-reimbursement" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-slate-900">
            <ArrowLeft size={18} /> Kembali
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Detail Pengajuan Pembayaran</h1>
            <p className="text-sm text-slate-500">Lihat detail dan progres pengajuan reimbursement Anda.</p>
          </div>
        </div>
        <div className={`rounded-3xl px-5 py-4 text-sm font-semibold ${statusBadge(statusLabel)}`}>
          {statusLabel}
        </div>
      </div>

      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.16em] text-slate-500">Semester {reimbursement.semester_ke}</p>
            <h2 className="text-2xl font-semibold text-slate-900">{reimbursement.pengajuan_studi?.jalur_pendanaan?.nama_pendanaan ?? "Reimbursement Studi"}</h2>
            <p className="text-sm text-slate-500">Diajukan pada {formatDate(reimbursement.created_at)} • ID REIMB-{String(reimbursement.id).padStart(3, "0")}</p>
          </div>
          <div className="rounded-3xl bg-slate-50 p-5 text-right xl:text-left">
            <p className="text-sm text-slate-500">Nominal Diajukan</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">Rp {Number(reimbursement.nominal ?? 0).toLocaleString("id-ID", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
            <p className="mt-3 text-sm text-slate-500">
              {statusLabel === "Selesai"
                ? "Dana telah diterima"
                : statusLabel === "Disetujui"
                ? "Menunggu penyaluran dana"
                : statusLabel === "Perlu Revisi"
                ? "Perlu ditindaklanjuti"
                : "Sedang diproses"}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Progres Pengajuan</h2>
          <div className="mt-6 space-y-4">
            {progressSteps.map((step) => (
              <div key={step.label} className="flex gap-4">
                <div className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full">
                  {step.done ? (
                    <CheckCircle2 size={24} className="text-emerald-500" />
                  ) : (
                    <div className="h-6 w-6 rounded-full border-2 border-slate-300" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-900">{step.label}</p>
                  <p className="text-xs text-slate-500">{step.sub}</p>
                  <p className="text-sm text-slate-600">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Informasi Pengajuan</h2>
            <div className="mt-6 grid gap-4 text-sm text-slate-700 sm:grid-cols-2">
              <div>
                <p className="text-xs text-slate-500">Nama Dosen</p>
                <p className="font-semibold text-slate-900">{reimbursement.pengajuan_studi?.user?.username ?? "-"}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Nominal Diajukan</p>
                <p className="font-semibold text-slate-900">Rp {Number(reimbursement.nominal ?? 0).toLocaleString("id-ID", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Tanggal Pengajuan</p>
                <p className="font-semibold text-slate-900">{formatDate(reimbursement.created_at)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Tanggal Pembayaran</p>
                <p className="font-semibold text-slate-900">{formatDate(reimbursement.tanggal_pencairan)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Metode Pembayaran</p>
                <p className="font-semibold text-slate-900">{reimbursement.nama_bank ?? "-"}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Rekening Tujuan</p>
                <p className="font-semibold text-slate-900">{reimbursement.nomor_rekening ?? "-"}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs text-slate-500">Catatan</p>
                <p className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">{reimbursement.catatan_keuangan || "-"}</p>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Bukti Pembayaran</h2>
            <div className="mt-4 rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{reimbursement.file_bukti_bayar ?? "-"}</p>
                  <p className="text-xs text-slate-500">{reimbursement.file_bukti_bayar ? "Bukti pembayaran tersedia" : "Tidak ada file terlampir."}</p>
                </div>
                <a
                  href={downloadUrl ?? "#"}
                  target="_blank"
                  rel="noreferrer"
                  download={!!downloadUrl}
                  className={`inline-flex items-center justify-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${downloadUrl ? "border-blue-600 bg-white text-blue-600 hover:bg-blue-50" : "border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed"}`}
                >
                  <Download size={16} /> Download
                </a>
              </div>
            </div>
          </div>

          {isRevision && (
            <Link
              href={`/user/user-reimbursement/ajukan?semester=${reimbursement.semester_ke}`}
              className="inline-flex w-full items-center justify-center rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Perbaiki & Ajukan Ulang
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
