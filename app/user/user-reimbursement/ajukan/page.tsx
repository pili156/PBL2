"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Upload, Banknote, CalendarDays } from "lucide-react";

const PAYMENT_METHODS = [
  { value: "Transfer Bank", label: "Transfer Bank" },
  { value: "Virtual Account", label: "Virtual Account" },
  { value: "Tunai", label: "Tunai" },
];

export default function UserReimbursementCreatePage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const querySemester = searchParams?.get("semester") ?? "1";
  const [semester, setSemester] = useState(querySemester);
  const [tanggalPembayaran, setTanggalPembayaran] = useState("");
  const [nominal, setNominal] = useState("");
  const [metodePembayaran, setMetodePembayaran] = useState(PAYMENT_METHODS[0].value);
  const [catatan, setCatatan] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (querySemester) {
      setSemester(querySemester);
    }
  }, [querySemester]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0] ?? null;
    setFile(selected);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!tanggalPembayaran || !nominal || !metodePembayaran || !file) {
      setError("Lengkapi semua kolom yang wajib diisi, termasuk bukti pembayaran.");
      return;
    }

    const cleanedNominal = nominal.replace(/[^0-9]/g, "");

    if (!cleanedNominal) {
      setError("Nominal harus berisi angka.");
      return;
    }

    const formData = new FormData();
    formData.append("semester_ke", semester);
    formData.append("tanggal_pembayaran", tanggalPembayaran);
    formData.append("nominal", cleanedNominal);
    formData.append("metode_pembayaran", metodePembayaran);
    formData.append("catatan_keuangan", catatan);
    formData.append("file_bukti_bayar", file);

    try {
      setIsSubmitting(true);
      const response = await fetch("/api/user-reimbursement", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Terjadi kesalahan saat mengajukan reimbursement.");
      }

      router.push(`/user/user-reimbursement/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan tidak terduga.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Link href="/user/user-reimbursement" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-slate-900">
            <ArrowLeft size={18} /> Kembali
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Ajukan Reimbursement Baru</h1>
            <p className="text-sm text-slate-500">Lengkapi data berikut untuk mengajukan reimbursement biaya studi.</p>
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
              value={semester}
              onChange={(event) => setSemester(event.target.value)}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              {Array.from({ length: 8 }, (_, index) => (
                <option key={index + 1} value={index + 1}>
                  Semester {index + 1}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="tanggalPembayaran" className="text-sm font-medium text-slate-700">Tanggal Pembayaran *</label>
            <div className="relative">
              <input
                id="tanggalPembayaran"
                type="date"
                value={tanggalPembayaran}
                onChange={(event) => setTanggalPembayaran(event.target.value)}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 pr-12 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
              <CalendarDays className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          <div className="space-y-2 sm:col-span-2">
            <label htmlFor="nominal" className="text-sm font-medium text-slate-700">Nominal Diajukan *</label>
            <input
              id="nominal"
              type="text"
              value={nominal}
              onChange={(event) => setNominal(event.target.value)}
              placeholder="5000000"
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
            <p className="text-xs text-slate-500">Nominal sesuai bukti pembayaran.</p>
          </div>

          <div className="space-y-2">
            <label htmlFor="metodePembayaran" className="text-sm font-medium text-slate-700">Metode Pembayaran *</label>
            <select
              id="metodePembayaran"
              value={metodePembayaran}
              onChange={(event) => setMetodePembayaran(event.target.value)}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              {PAYMENT_METHODS.map((method) => (
                <option key={method.value} value={method.value}>
                  {method.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="file" className="text-sm font-medium text-slate-700">Upload Bukti Pembayaran *</label>
            <label className="flex min-h-[156px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-4 py-7 text-center text-sm text-slate-500 transition hover:border-blue-400 hover:bg-slate-100">
              <Upload className="mb-3 h-8 w-8 text-blue-600" />
              <span className="font-semibold text-slate-700">Drag & drop file di sini</span>
              <span className="mt-1 text-xs text-slate-500">atau klik untuk memilih file</span>
              <span className="mt-2 text-xs text-slate-400">Format: JPG, PNG, PDF (maks. 5MB)</span>
              <input
                id="file"
                type="file"
                accept="image/jpeg,image/png,application/pdf"
                onChange={handleFileChange}
                className="sr-only"
              />
            </label>
            {file && <p className="text-sm text-slate-600">File dipilih: {file.name}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="catatan" className="text-sm font-medium text-slate-700">Catatan (Opsional)</label>
          <textarea
            id="catatan"
            rows={4}
            value={catatan}
            onChange={(event) => setCatatan(event.target.value)}
            placeholder="Tulis catatan jika diperlukan..."
            className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
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
            disabled={isSubmitting}
            className="inline-flex items-center justify-center rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Mengirim..." : "Kirim Pengajuan"}
          </button>
        </div>

        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-700">
          Pastikan bukti pembayaran jelas dan sesuai dengan nominal yang diajukan.
        </div>
      </form>
    </div>
  );
}
