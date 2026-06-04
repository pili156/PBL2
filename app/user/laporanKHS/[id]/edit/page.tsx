import { ArrowLeft, UploadCloud, Info, FileText } from 'lucide-react';
import Link from 'next/link';
import { getKHSById, updateKHS } from '../../actions';
import { notFound } from 'next/navigation';
import FileDropzone from '../../FileDropzone';

export const dynamic = 'force-dynamic';

export default async function EditKHSPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const khsId = Number(resolvedParams.id);

  if (isNaN(khsId)) notFound();

  const khs = await getKHSById(khsId);
  if (!khs) notFound();

  const currentFileName = khs.file_khs_path
    ? decodeURIComponent(khs.file_khs_path.split('/').pop() || '')
    : undefined;

  async function handleUpdate(formData: FormData) {
    'use server';
    await updateKHS(khsId, formData);
  }

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-500">

      <div className="flex items-center gap-4 border-b border-slate-200 pb-4">
        <Link
          href={`/user/laporanKHS/${khsId}`}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Edit KHS</h2>
          <p className="text-sm text-slate-500 mt-1">Perbarui informasi dan dokumen KHS</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 md:p-8">
        <h3 className="text-base font-bold text-slate-800 mb-6 border-b border-slate-100 pb-3">
          Form Edit KHS
        </h3>

        <form action={handleUpdate} className="space-y-6">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Semester <span className="text-red-500">*</span>
              </label>
              <select
                name="semester"
                defaultValue={khs.semester_ke || 1}
                className="w-full p-3 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                required
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                  <option key={num} value={num}>Semester {num}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Tahun Akademik <span className="text-red-500">*</span>
              </label>
              <select
                name="tahun_akademik"
                defaultValue={khs.tahun_akademik || ''}
                className="w-full p-3 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                required
              >
                <option value="">Pilih Tahun Akademik</option>
                <option value="2023/2024 Ganjil">2023/2024 Ganjil</option>
                <option value="2023/2024 Genap">2023/2024 Genap</option>
                <option value="2024/2025 Ganjil">2024/2025 Ganjil</option>
                <option value="2024/2025 Genap">2024/2025 Genap</option>
                <option value="2025/2026 Ganjil">2025/2026 Ganjil</option>
                <option value="2025/2026 Genap">2025/2026 Genap</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              IPK <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="ipk"
              step="0.01"
              min="0"
              max="4.00"
              defaultValue={khs.ipk ? Number(khs.ipk).toFixed(2) : ''}
              className="w-full md:w-1/2 p-3 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none font-bold"
              required
            />
            <p className="text-[11px] text-slate-500 mt-2">Masukkan IPK sesuai yang tertera di KHS (skala 0 - 4.00)</p>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Upload File KHS (PDF)
            </label>

            {khs.file_khs_path && (
              <div className="mb-4 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-red-50 text-red-500 rounded-lg">
                    <FileText size={24} />
                  </div>
                  <div className="text-left flex-1">
                    <p className="text-sm font-bold text-slate-800">File KHS Saat Ini</p>
                    <p className="text-xs text-slate-500 mt-0.5">Pilih file baru jika ingin mengganti</p>
                  </div>
                </div>
              </div>
            )}

            <FileDropzone name="file" currentFileName={currentFileName} />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Catatan (Opsional)
            </label>
            <textarea
              name="catatan"
              rows={3}
              defaultValue={khs.catatan_evaluasi || ''}
              placeholder="Tulis catatan jika diperlukan..."
              className="w-full p-3 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
            ></textarea>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Link
              href={`/user/laporanKHS/${khsId}`}
              className="px-6 py-2.5 border border-slate-200 text-slate-600 text-sm font-bold rounded-lg hover:bg-slate-50 transition-colors"
            >
              Batal
            </Link>
            <button
              type="submit"
              className="px-8 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
            >
              <UploadCloud size={16} /> Update
            </button>
          </div>

        </form>

      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start gap-3">
        <Info className="text-blue-500 flex-shrink-0 mt-0.5" size={16} />
        <p className="text-[11px] text-blue-800 font-medium">
          Setelah update, dokumen akan diverifikasi ulang oleh admin. Status KHS Anda akan kembali menjadi dalam antrean pemeriksaan.
        </p>
      </div>

    </div>
  );
}