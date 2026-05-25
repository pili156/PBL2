"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload, FileText, Loader2, CheckCircle, AlertCircle } from "lucide-react";

type FileUploadState = {
  file: File | null;
  uploading: boolean;
  uploaded: boolean;
  error: string | null;
};

const DOKUMEN_LIST = [
  { key: "formulir", label: "Formulir Bantuan Studi", masterId: 21 },
  { key: "bukti_spp", label: "Bukti Pembayaran SPP", masterId: 22 },
  { key: "akreditasi", label: "Bukti Akreditasi Program Studi", masterId: 23 },
  { key: "loa", label: "Letter of Acceptance (LoA)", masterId: 24 },
];

export default function BantuanStudiCreatePage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    semester: "1",
    tahunAkademik: "",
    tahunKe: "1",
    nominal: "",
  });
  const [files, setFiles] = useState<Record<string, FileUploadState>>({
    formulir: { file: null, uploading: false, uploaded: false, error: null },
    bukti_spp: { file: null, uploading: false, uploaded: false, error: null },
    akreditasi: { file: null, uploading: false, uploaded: false, error: null },
    loa: { file: null, uploading: false, uploaded: false, error: null },
  });
  const [pengajuanId, setPengajuanId] = useState<number | null>(null);
  const [pengajuanStudiId, setPengajuanStudiId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function ensurePengajuanStudi() {
      try {
        const res = await fetch("/api/user/pengajuan");
        if (res.ok) {
          const data = await res.json();
          if (data.id) {
            setPengajuanStudiId(data.id);
            return;
          }
        }
        const createRes = await fetch("/api/pengajuan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        });
        if (createRes.ok) {
          const createData = await createRes.json();
          if (createData.pengajuan?.id) {
            setPengajuanStudiId(createData.pengajuan.id);
          }
        }
      } catch {}
    }
    ensurePengajuanStudi();
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileSelect = (key: string, file: File | null) => {
    if (!file) return;
    if (file.type !== "application/pdf") {
      setFiles((prev) => ({ ...prev, [key]: { ...prev[key], file: null, error: "Format file harus PDF" } }));
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setFiles((prev) => ({ ...prev, [key]: { ...prev[key], file: null, error: "Ukuran file maksimal 2MB" } }));
      return;
    }
    setFiles((prev) => ({ ...prev, [key]: { ...prev[key], file, error: null, uploaded: false } }));
  };

  const uploadDokumen = async (key: string, masterId: number, reimbursementId: number): Promise<boolean> => {
    const fileEntry = files[key];
    if (!fileEntry.file || !pengajuanStudiId) return false;

    setFiles((prev) => ({ ...prev, [key]: { ...prev[key], uploading: true, error: null } }));

    try {
      const formDataFile = new FormData();
      formDataFile.append("file", fileEntry.file);
      formDataFile.append("master_dokumen_id", masterId.toString());
      formDataFile.append("pengajuan_reimbursement_id", reimbursementId.toString());

      const response = await fetch(`/api/pengajuan/${pengajuanStudiId}/dokumen`, {
        method: "POST",
        body: formDataFile,
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Upload gagal");
      }

      setFiles((prev) => ({ ...prev, [key]: { ...prev[key], uploading: false, uploaded: true, error: null } }));
      return true;
    } catch (err) {
      setFiles((prev) => ({
        ...prev,
        [key]: { ...prev[key], uploading: false, error: err instanceof Error ? err.message : "Upload gagal" },
      }));
      return false;
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!formData.nominal || !formData.tahunAkademik) {
      setError("Nominal dan Tahun Akademik wajib diisi.");
      return;
    }

    const allHaveFiles = DOKUMEN_LIST.every((d) => files[d.key].file);
    if (!allHaveFiles) {
      setError("Semua file wajib diupload.");
      return;
    }

    if (!pengajuanStudiId) {
      setError("Gagal memuat data pengajuan. Silakan muat ulang halaman.");
      return;
    }

    setIsSubmitting(true);

    // Submit metadata dulu untuk mendapatkan reimbursement ID
    try {
      const body = new FormData();
      body.append("jenis_pengajuan", "bantuan_studi");
      body.append("semester_ke", formData.semester);
      body.append("tahun_akademik", formData.tahunAkademik);
      body.append("tahun_ke", formData.tahunKe);
      body.append("nominal", formData.nominal);

      const response = await fetch("/api/user-reimbursement", {
        method: "POST",
        body,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.error || "Gagal mengajukan bantuan studi.");
      }

      const reimbursementId = result.id;

      // Upload all 4 files dengan reimbursement_id
      for (const dok of DOKUMEN_LIST) {
        const success = await uploadDokumen(dok.key, dok.masterId, reimbursementId);
        if (!success) {
          setIsSubmitting(false);
          setError(`Gagal mengupload ${dok.label}. Silakan coba lagi.`);
          return;
        }
      }

      router.push(`/user/user-reimbursement/${reimbursementId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
      setIsSubmitting(false);
    }
  };

  const allFilesReady = DOKUMEN_LIST.every((d) => files[d.key].file && !files[d.key].uploading);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Link href="/user/user-reimbursement" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-slate-900">
            <ArrowLeft size={18} /> Kembali
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Ajukan Bantuan Studi</h1>
            <p className="text-sm text-slate-500">Lengkapi data berikut untuk mengajukan bantuan studi lanjut.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
        {error && (
          <div className="rounded-2xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="semester" className="text-sm font-medium text-slate-700">Semester *</label>
            <select
              id="semester"
              value={formData.semester}
              onChange={(e) => handleInputChange("semester", e.target.value)}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              {Array.from({ length: 8 }, (_, i) => (
                <option key={i + 1} value={i + 1}>Semester {i + 1}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="tahunKe" className="text-sm font-medium text-slate-700">Tahun Ke- *</label>
            <select
              id="tahunKe"
              value={formData.tahunKe}
              onChange={(e) => handleInputChange("tahunKe", e.target.value)}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              {Array.from({ length: 8 }, (_, i) => (
                <option key={i + 1} value={i + 1}>Tahun ke-{i + 1}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2 sm:col-span-2">
            <label htmlFor="tahunAkademik" className="text-sm font-medium text-slate-700">Tahun Akademik *</label>
            <input
              id="tahunAkademik"
              type="text"
              value={formData.tahunAkademik}
              onChange={(e) => handleInputChange("tahunAkademik", e.target.value)}
              placeholder="Contoh: 2025/2026"
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <label htmlFor="nominal" className="text-sm font-medium text-slate-700">Bantuan SPP Diajukan *</label>
            <input
              id="nominal"
              type="text"
              value={formData.nominal}
              onChange={(e) => handleInputChange("nominal", e.target.value)}
              placeholder="5000000"
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
            <p className="text-xs text-slate-500">Nominal bantuan SPP yang diajukan (angka saja).</p>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Upload Dokumen Pendukung</h3>

          <div className="grid gap-6 sm:grid-cols-2">
            {DOKUMEN_LIST.map((dok) => {
              const state = files[dok.key];
              const isUploaded = state.uploaded;
              const isUploading = state.uploading;
              const hasFile = !!state.file;

              return (
                <div key={dok.key} className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    {dok.label} *
                    {dok.key === 'formulir' && (
                      <a
                        href="/FORMULIR%20BANTUAN%20STUDI.docx"
                        download
                        className="text-xs text-blue-600 hover:text-blue-800 underline ml-2 font-normal"
                      >
                        Download template
                      </a>
                    )}
                  </label>
                  <div className={`rounded-2xl border ${isUploaded ? "border-green-300 bg-green-50" : "border-dashed border-slate-300 bg-slate-50"} p-4 transition`}>
                    {isUploaded ? (
                      <div className="flex items-center gap-3">
                        <CheckCircle size={20} className="text-green-600" />
                        <span className="text-sm text-green-700 font-medium">Terupload</span>
                        {state.file && (
                          <span className="text-xs text-slate-500 truncate ml-2">{state.file.name}</span>
                        )}
                      </div>
                    ) : (
                      <>
                        <input
                          type="file"
                          accept=".pdf"
                          hidden
                          id={`file-${dok.key}`}
                          onChange={(e) => handleFileSelect(dok.key, e.target.files?.[0] ?? null)}
                        />
                        <label
                          htmlFor={`file-${dok.key}`}
                          className="flex flex-col items-center justify-center cursor-pointer py-4"
                        >
                          <Upload className="mb-2 h-6 w-6 text-blue-600" />
                          <span className="text-sm font-semibold text-slate-700">
                            {hasFile ? state.file!.name : "Klik untuk pilih file"}
                          </span>
                          <span className="text-xs text-slate-500 mt-1">Format: PDF, maks. 2MB</span>
                        </label>
                        {isUploading && (
                          <div className="flex items-center gap-2 mt-2 text-blue-600 text-sm">
                            <Loader2 size={14} className="animate-spin" />
                            Mengupload...
                          </div>
                        )}
                      </>
                    )}
                    {state.error && (
                      <p className="text-xs text-red-600 mt-1">{state.error}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Link
            href="/user/user-reimbursement"
            className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Batal
          </Link>
          <button
            type="submit"
            disabled={!allFilesReady || isSubmitting}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Mengirim...
              </>
            ) : (
              "Kirim Pengajuan"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
