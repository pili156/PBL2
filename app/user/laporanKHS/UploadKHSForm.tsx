'use client';

import { useActionState } from 'react';
import { ArrowLeft, UploadCloud, Info, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { uploadKHS } from './actions';
import FileDropzone from './FileDropzone';

export default function UploadKHSForm({ prefillSemester, existingSemesters }: {
  prefillSemester: string;
  existingSemesters: number[];
}) {
  const [state, formAction, pending] = useActionState(uploadKHS, null);

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-4 border-b border-slate-200 pb-4">
        <Link
          href="/user/laporanKHS"
          className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600"
          aria-label="Kembali"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Upload KHS</h2>
          <p className="text-sm text-slate-900 mt-1">Unggah dokumen KHS untuk semester Anda</p>
        </div>
      </div>

      {state?.error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
          <AlertCircle size={16} className="flex-shrink-0" />
          {state.error}
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 md:p-8">
        <h3 className="text-base font-bold text-slate-900 mb-6 border-b border-slate-100 pb-3">
          Form Upload KHS
        </h3>

        <form action={formAction} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-900 mb-2">
                Semester <span className="text-red-500">*</span>
              </label>
              <select
                name="semester"
                defaultValue={prefillSemester}
                className="w-full p-3 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none text-slate-900"
                required
              >
                <option value="">Pilih Semester</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                  <option key={num} value={num} disabled={existingSemesters.includes(num)}>
                    Semester {num} {existingSemesters.includes(num) ? '(Sudah diupload)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-900 mb-2">
                Tahun Akademik <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="tahun_akademik"
                placeholder="Contoh: 2024/2025 Ganjil"
                className="w-full p-3 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none text-slate-900"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">
              IPK <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="ipk"
              step="0.01"
              min="0"
              max="4.00"
              placeholder="Contoh: 3.50"
              className="w-full md:w-1/2 p-3 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none text-slate-900"
              required
            />
            <p className="text-xs text-slate-900 mt-2">Masukkan IPK sesuai yang tertera di KHS (skala 0 - 4.00)</p>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">
              Upload File KHS (PDF) <span className="text-red-500">*</span>
            </label>
            <FileDropzone name="file" />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">
              Catatan (Opsional)
            </label>
            <textarea
              name="catatan"
              rows={3}
              placeholder="Tulis catatan jika diperlukan..."
              className="w-full p-3 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none text-slate-900"
            ></textarea>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Link
              href="/user/laporanKHS"
              className="px-6 py-2.5 border border-slate-200 text-slate-900 text-sm font-bold rounded-lg hover:bg-slate-50 transition-colors"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={pending}
              className="px-8 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
            >
              {pending ? (
                <>Memproses...</>
              ) : (
                <><UploadCloud size={16} /> Submit</>
              )}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start gap-3">
        <Info className="text-blue-500 flex-shrink-0 mt-0.5" size={16} />
        <p className="text-xs text-blue-800 font-medium">
          Pastikan dokumen yang diupload adalah KHS resmi dan terbaru. File yang sudah di-submit akan masuk ke antrean verifikasi admin.
        </p>
      </div>
    </div>
  );
}