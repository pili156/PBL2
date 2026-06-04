"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, CheckCircle2, FileText, AlertCircle, Loader2, Check, Clock, Upload } from "lucide-react";
import { formatDateLong, formatDateTime } from "@/src/lib/formatters";
import { normalizeStatus, statusBadgeClass } from "@/src/lib/status-utils";

type BantuanStudiDetail = {
  id: number;
  semester_ke: number;
  tahun_akademik: string | null;
  tahun_ke: number | null;
  nominal: string | number;
  status_pencairan: string | null;
  catatan_keuangan: string | null;
  file_bukti_bayar: string | null;
  created_at: string | null;
  pengajuan_studi: {
    id: number;
    user: { username: string | null } | null;
    jenis_studi: { nama_jenis: string | null } | null;
    jalur_pendanaan: { nama_pendanaan: string | null } | null;
    wilayah: { nama_wilayah: string | null } | null;
    dokumen_pengajuan: Array<{
      id: number;
      file_path: string | null;
      status_verifikasi: string | null;
      catatan_revisi: string | null;
      master_dokumen: { nama_dokumen: string | null } | null;
    }>;
  } | null;
};

export default function BantuanStudiDetailPage() {
  const params = useParams();
  const id = params?.id;
  const [data, setData] = useState<BantuanStudiDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploads, setUploads] = useState<Record<number, { file: File | null; uploading: boolean; error: string | null }>>({});

  useEffect(() => {
    if (!id) {
      setError("ID pengajuan tidak valid.");
      setLoading(false);
      return;
    }

    const fetchDetail = async () => {
      try {
        const response = await fetch(`/api/user-reimbursement/${id}`);
        const result = await response.json();

        if (!response.ok) {
          setError(result?.error || "Gagal memuat detail.");
          return;
        }

        setData(result);
      } catch (err) {
        setError("Terjadi kesalahan saat memuat data.");
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

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
        <h1 className="text-2xl font-semibold text-slate-900">Pengajuan tidak ditemukan</h1>
        <p className="mt-3 text-slate-600">{error || "Data tidak tersedia."}</p>
        <Link href="/user/user-reimbursement" className="mt-6 inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700">
          Kembali
        </Link>
      </div>
    );
  }

  const dokumenFiles = data.pengajuan_studi?.dokumen_pengajuan ?? [];

  const getDocOverallStatus = () => {
    if (dokumenFiles.length === 0) return null;
    const allTerverifikasi = dokumenFiles.every((d) => d.status_verifikasi === 'terverifikasi');
    const hasRevisi = dokumenFiles.some((d) => d.status_verifikasi === 'revisi');
    if (allTerverifikasi) return 'terverifikasi';
    if (hasRevisi) return 'revisi';
    return 'pending';
  };
  const docOverallStatus = getDocOverallStatus();
  const allVerified = docOverallStatus === 'terverifikasi';
  const anyRevisi = docOverallStatus === 'revisi';

  const statusLabel = normalizeStatus(data.status_pencairan);

  const handleFileSelect = (docId: number, file: File) => {
    if (file.type !== 'application/pdf') {
      setUploads(prev => ({ ...prev, [docId]: { file: null, uploading: false, error: 'Format file harus PDF' } }));
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setUploads(prev => ({ ...prev, [docId]: { file: null, uploading: false, error: 'Ukuran file tidak boleh lebih dari 2MB' } }));
      return;
    }
    setUploads(prev => ({ ...prev, [docId]: { file, uploading: false, error: null } }));
  };

  const handleResubmit = async (docId: number) => {
    const upload = uploads[docId];
    if (!upload?.file) return;

    setUploads(prev => ({ ...prev, [docId]: { ...prev[docId], uploading: true, error: null } }));

    try {
      const formData = new FormData();
      formData.append('file', upload.file);

      const response = await fetch(`/api/pengajuan/${data.pengajuan_studi!.id}/dokumen/${docId}`, {
        method: 'PUT',
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Gagal mengunggah');
      }

      const result = await response.json();

      setData(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          pengajuan_studi: prev.pengajuan_studi ? {
            ...prev.pengajuan_studi,
            dokumen_pengajuan: prev.pengajuan_studi.dokumen_pengajuan.map(d =>
              d.id === docId
                ? { ...d, file_path: result.filePath, status_verifikasi: 'Pending', catatan_revisi: null }
                : d
            ),
          } : null,
        };
      });

      setUploads(prev => {
        const next = { ...prev };
        delete next[docId];
        return next;
      });
    } catch (err) {
      setUploads(prev => ({
        ...prev,
        [docId]: { ...prev[docId], uploading: false, error: err instanceof Error ? err.message : 'Gagal mengunggah' },
      }));
    }
  };

  const docProgressSteps = [
    {
      label: "Dokumen Diupload",
      sub: dokumenFiles.length > 0 ? `${dokumenFiles.length} dokumen` : "Belum ada",
      done: dokumenFiles.length > 0,
      description: "Dokumen pendukung telah diunggah",
    },
    {
      label: "Diverifikasi Admin",
      sub: allVerified ? "Semua terverifikasi" : anyRevisi ? "Ada dokumen perlu revisi" : "Menunggu verifikasi",
      done: allVerified || anyRevisi,
      description: allVerified ? "Semua dokumen telah diverifikasi" : anyRevisi ? "Beberapa dokumen perlu diperbaiki" : "Dokumen sedang diverifikasi",
    },
    {
      label: "Selesai",
      sub: allVerified ? "Pengajuan disetujui" : "Menunggu",
      done: allVerified,
      description: allVerified ? "Semua dokumen telah terverifikasi" : "Menunggu verifikasi semua dokumen",
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-3">
          <Link href="/user/user-reimbursement" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-slate-900">
            <ArrowLeft size={18} /> Kembali
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Detail Bantuan Studi</h1>
            <p className="text-sm text-slate-500">Lihat detail dan progres pengajuan bantuan studi Anda.</p>
          </div>
        </div>
        <div className={`rounded-3xl px-5 py-4 text-sm font-semibold ${statusBadgeClass(statusLabel)}`}>
          {statusLabel}
        </div>
      </div>

      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.16em] text-slate-500">
              Semester {data.semester_ke} {data.tahun_akademik ? `- TA ${data.tahun_akademik}` : ""}
              {data.tahun_ke ? ` (Tahun ke-${data.tahun_ke})` : ""}
            </p>
            <h2 className="text-2xl font-semibold text-slate-900">
              {data.pengajuan_studi?.jalur_pendanaan?.nama_pendanaan ?? "Bantuan Studi"}
            </h2>
            <p className="text-sm text-slate-500">
              Diajukan pada {formatDateLong(data.created_at)} • ID BST-{String(data.id).padStart(3, "0")}
            </p>
          </div>
          <div className="rounded-3xl bg-slate-50 p-5 text-right xl:text-left">
            <p className="text-sm text-slate-500">Bantuan Diajukan</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">
              Rp {Number(data.nominal ?? 0).toLocaleString("id-ID", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-slate-900">Status Dokumen</h2>
            <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold ${
              docOverallStatus === 'terverifikasi' ? 'bg-green-100 text-green-700' :
              docOverallStatus === 'revisi' ? 'bg-red-100 text-red-700' :
              'bg-yellow-100 text-yellow-700'
            }`}>
              {docOverallStatus === 'terverifikasi' ? <><Check size={12} /> TERVERIFIKASI</> :
               docOverallStatus === 'revisi' ? <><AlertCircle size={12} /> REVISI</> :
               <><Clock size={12} /> PENDING</>}
            </span>
          </div>
          <div className="mt-6 space-y-4">
            {docProgressSteps.map((step) => (
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
                <p className="font-semibold text-slate-900">{data.pengajuan_studi?.user?.username ?? "-"}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Jenis Studi</p>
                <p className="font-semibold text-slate-900">{data.pengajuan_studi?.jenis_studi?.nama_jenis ?? "-"}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Pendanaan</p>
                <p className="font-semibold text-slate-900">{data.pengajuan_studi?.jalur_pendanaan?.nama_pendanaan ?? "-"}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Wilayah Studi</p>
                <p className="font-semibold text-slate-900">{data.pengajuan_studi?.wilayah?.nama_wilayah ?? "-"}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Semester</p>
                <p className="font-semibold text-slate-900">Semester {data.semester_ke}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Tahun Akademik</p>
                <p className="font-semibold text-slate-900">{data.tahun_akademik || "-"}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Nominal</p>
                <p className="font-semibold text-slate-900">
                  Rp {Number(data.nominal ?? 0).toLocaleString("id-ID", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </p>
              </div>
              {data.file_bukti_bayar && (
                <div className="sm:col-span-2">
                  <p className="text-xs text-slate-500 mb-1">Bukti Transfer Dana</p>
                  <a
                    href={data.file_bukti_bayar}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition-all"
                  >
                    <FileText size={16} /> Download Bukti Transfer
                  </a>
                </div>
              )}
              <div className="sm:col-span-2">
                <p className="text-xs text-slate-500">Catatan</p>
                <p className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                  {data.catatan_keuangan || "-"}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Daftar Dokumen <span className="text-slate-400">({dokumenFiles.length} items)</span>
            </h3>
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {dokumenFiles.length === 0 ? (
                <p className="text-sm text-slate-500">Belum ada dokumen.</p>
              ) : (
                dokumenFiles.map((doc) => {
                  const status = (doc.status_verifikasi || 'pending').toLowerCase();
                  return (
                    <div key={doc.id} className="p-4 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-all">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className="mt-1">
                            {status === 'terverifikasi' ? (
                              <Check size={18} className="text-green-500" />
                            ) : status === 'revisi' ? (
                              <AlertCircle size={18} className="text-red-500" />
                            ) : (
                              <Clock size={18} className="text-yellow-500" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm text-slate-900">
                              {doc.master_dokumen?.nama_dokumen || "Dokumen"}
                            </h4>
                            {doc.catatan_revisi && (
                              <p className="text-xs text-red-600 mt-1">
                                Catatan: {doc.catatan_revisi}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {status === 'terverifikasi' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700">
                              <Check size={12} /> TERVERIFIKASI
                            </span>
                          ) : status === 'revisi' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-700">
                              <AlertCircle size={12} /> REVISI
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-700">
                              <Clock size={12} /> PENDING
                            </span>
                          )}
                          {doc.file_path && (
                            <a
                              href={doc.file_path}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              title="Lihat dokumen"
                            >
                              <FileText size={16} />
                            </a>
                          )}
                        </div>
                      </div>
                      {status === 'revisi' && (
                        <div className="mt-3 pt-3 border-t border-red-100">
                          <div className="flex flex-wrap items-center gap-2">
                            <input
                              type="file"
                              accept=".pdf"
                              hidden
                              id={`resubmit-file-${doc.id}`}
                              onChange={(e) => {
                                if (e.target.files?.[0]) handleFileSelect(doc.id, e.target.files[0]);
                              }}
                            />
                            <button
                              onClick={() => document.getElementById(`resubmit-file-${doc.id}`)?.click()}
                              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                            >
                              <Upload size={14} />
                              Pilih File
                            </button>
                            {uploads[doc.id]?.file && (
                              <span className="text-xs text-slate-600 truncate max-w-[180px]">
                                {uploads[doc.id].file!.name}
                              </span>
                            )}
                            {uploads[doc.id]?.file && !uploads[doc.id]?.uploading && (
                              <button
                                onClick={() => handleResubmit(doc.id)}
                                className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                              >
                                Kirim Ulang
                              </button>
                            )}
                            {uploads[doc.id]?.uploading && (
                              <div className="flex items-center gap-2">
                                <Loader2 size={14} className="animate-spin text-blue-600" />
                                <span className="text-xs text-blue-600">Mengirim ulang...</span>
                              </div>
                            )}
                          </div>
                          {uploads[doc.id]?.error && (
                            <p className="text-xs text-red-600 mt-1">{uploads[doc.id].error}</p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {anyRevisi && (
            <Link
              href={`/user/user-reimbursement/ajukan`}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700"
            >
              <AlertCircle size={16} /> Perbaiki & Ajukan Ulang
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
