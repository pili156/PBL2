'use client';

import { useActionState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, UploadCloud, Info, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { addManualKeuangan } from '../../../actions';
import FileDropzone from '@/app/user/laporanKHS/FileDropzone';

async function addManualKeuanganAction(
  prevState: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string } | null> {
  try {
    await addManualKeuangan(formData);
    return null;
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Gagal menyimpan data pencairan' };
  }
}

export default function AdminKeuanganForm({
  pengajuanId,
  idDosen,
  nama,
}: {
  pengajuanId: number;
  idDosen: number;
  nama: string;
}) {
  const [state, formAction, pending] = useActionState(addManualKeuanganAction, null);
  const router = useRouter();
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !pending && !state?.error) {
      router.push(`/admin/riwayat-dosen/${idDosen}/keuangan`);
    }
    wasPending.current = pending;
  }, [pending, state, router, idDosen]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Link
            href={`/admin/riwayat-dosen/${idDosen}/keuangan`}
            className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft size={16} />
            Kembali
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Tambah Pencairan Manual</h1>
            <p className="text-sm text-slate-500">Input data pencairan dana untuk {nama}</p>
          </div>
        </div>
      </div>

      <form action={formAction} className="space-y-6 rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
        <input type="hidden" name="pengajuanId" value={pengajuanId} />
        <input type="hidden" name="idDosen" value={idDosen} />

        {state?.error && (
          <div className="rounded-2xl bg-red-50 border border-red-200 p-4 text-sm text-red-700 flex items-center gap-2">
            <AlertCircle size={16} className="flex-shrink-0" />
            {state.error}
          </div>
        )}

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Semester *</label>
            <select
              name="semesterKe"
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              required
            >
              <option value="">Pilih Semester</option>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map((num) => (
                <option key={num} value={num}>Semester {num}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Tahun Akademik *</label>
            <select
              name="tahunAkademik"
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              required
            >
              <option value="">Pilih Tahun Akademik</option>
              {Array.from({ length: 4 }, (_, i) => {
                const currentYear = new Date().getFullYear();
                const startYear = currentYear - 2 + i;
                const endYear = startYear + 1;
                return (
                  <option key={startYear} value={`${startYear}/${endYear}`}>
                    {startYear}/{endYear}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="space-y-2 sm:col-span-2">
            <label className="text-sm font-medium text-slate-700">Nominal (Rp) *</label>
            <input
              type="number"
              name="nominal"
              min="0"
              placeholder="5000000"
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              required
            />
            <p className="text-xs text-slate-500">Nominal pencairan yang diajukan (angka saja).</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Bank Tujuan *</label>
            <select
              name="bank"
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              required
            >
              <option value="">Pilih Bank</option>
              <option value="Bank Mandiri">Bank Mandiri</option>
              <option value="Bank BRI">Bank BRI</option>
              <option value="Bank BNI">Bank BNI</option>
              <option value="Bank BCA">Bank BCA</option>
              <option value="Bank BTN">Bank BTN</option>
              <option value="Bank CIMB Niaga">Bank CIMB Niaga</option>
              <option value="Bank Danamon">Bank Danamon</option>
              <option value="Bank Permata">Bank Permata</option>
              <option value="Bank BSI">Bank BSI</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Nomor Rekening *</label>
            <input
              type="text"
              name="norek"
              placeholder="1234567890"
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              required
            />
          </div>
        </div>

        <div className="border-t border-slate-200 pt-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Upload Dokumen Pendukung</h3>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Formulir Bantuan Studi *
                <a
                  href="/FORMULIR%20BANTUAN%20STUDI.docx"
                  download
                  className="text-xs text-blue-600 hover:text-blue-800 underline ml-2 font-normal"
                >
                  Download template
                </a>
              </label>
              <FileDropzone name="fileFormulir" accept=".pdf" maxSizeMB={2} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Bukti Pembayaran *</label>
              <FileDropzone name="fileBuktiPembayaran" accept=".pdf" maxSizeMB={2} />
            </div>
          </div>

          <div className="space-y-2 mt-6">
            <label className="text-sm font-medium text-slate-700">Bukti Transfer *</label>
            <FileDropzone name="fileBukti" accept=".pdf,.jpg,.jpeg,.png" maxSizeMB={5} />
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Link
            href={`/admin/riwayat-dosen/${idDosen}/keuangan`}
            className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Batal
          </Link>
          <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {pending ? 'Mengirim...' : <><UploadCloud size={16} /> Kirim Pengajuan</>}
          </button>
        </div>
      </form>

      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start gap-3">
        <Info className="text-blue-500 flex-shrink-0 mt-0.5" size={16} />
        <p className="text-xs text-blue-800 font-medium">
          Data akan otomatis dicatat ke aktivitas log sebagai input manual.
        </p>
      </div>
    </div>
  );
}
