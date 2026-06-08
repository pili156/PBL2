'use client';

import { useActionState } from 'react';
import { Upload, AlertCircle } from 'lucide-react';
import { addManualKhs } from '../../../actions';

export default function AdminKHSForm({
  pengajuanId,
  idDosen,
  nama,
}: {
  pengajuanId: number;
  idDosen: number;
  nama: string;
}) {
  const [state, formAction, pending] = useActionState(addManualKhs, null);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Tambah KHS Manual</h2>
          <p className="text-sm text-slate-400 mt-0.5">Input data KHS untuk {nama}</p>
        </div>
      </div>

      {state?.error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
          <AlertCircle size={16} className="flex-shrink-0" />
          {state.error}
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
        <form action={formAction} className="space-y-5" encType="multipart/form-data">
          <input type="hidden" name="pengajuanId" value={pengajuanId} />
          <input type="hidden" name="idDosen" value={idDosen} />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Semester Ke</label>
              <input type="number" name="semesterKe" required min="1"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">IPK</label>
              <input type="number" name="ipk" step="0.01" min="0" max="4" placeholder="3.50"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Tahun Akademik</label>
            <select
              name="tahunAkademik"
              required
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
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

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">File KHS (PDF/JPG/PNG, maks 5MB)</label>
            <div className="relative">
              <input
                type="file"
                name="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Upload file KHS. Format: PDF, JPG, PNG. Maksimal 5MB.</p>
          </div>

          <div className="bg-amber-50 border border-amber-200/60 rounded-lg px-4 py-3">
            <p className="text-xs text-amber-700 font-medium">
              Data akan otomatis dicatat ke aktivitas log sebagai input manual.
            </p>
          </div>

          <button type="submit" disabled={pending}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50">
            {pending ? 'Memproses...' : <><Upload size={16} /> Upload & Simpan KHS</>}
          </button>
        </form>
      </div>
    </div>
  );
}