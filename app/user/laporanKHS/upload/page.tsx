// app/user/laporanKHS/upload/page.tsx
import { ArrowLeft, UploadCloud, Info } from 'lucide-react';
import Link from 'next/link';
import { uploadKHS } from '../actions';
import { getDashboardData } from '../actions';
import { cookies } from 'next/headers';

export default async function UploadKHSPage({
  searchParams,
}: {
  searchParams: Promise<{ semester?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const prefillSemester = resolvedSearchParams.semester || '';

  const cookieStore = await cookies();
  const userEmail = cookieStore.get('user_email')?.value;

  if (!userEmail) {
    return <div>Silakan login terlebih dahulu</div>;
  }

  const { prisma } = await import('@/lib/prisma');
  const user = await prisma.user.findUnique({
    where: { email: userEmail },
  });

  if (!user) {
    return <div>User tidak ditemukan</div>;
  }

  const userId = user.id;
  const dashboardData = await getDashboardData(userId);
  
  // Get existing semesters to prevent duplicate upload
  const existingSemesters = dashboardData?.pengajuan_studi[0]?.monitoring_khs.map(
    (khs) => khs.semester_ke
  ) || [];

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="flex items-center gap-4 border-b border-slate-200 pb-4">
        <Link 
          href="/user/laporanKHS" 
          className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Upload KHS</h2>
          <p className="text-sm text-slate-500 mt-1">Unggah dokumen KHS untuk semester Anda</p>
        </div>
      </div>

      {/* FORM UPLOAD */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 md:p-8">
        <h3 className="text-base font-bold text-slate-800 mb-6 border-b border-slate-100 pb-3">
          Form Upload KHS
        </h3>

        <form action={uploadKHS} className="space-y-6">
          
          {/* Baris 1: Semester & Tahun Akademik */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Semester <span className="text-red-500">*</span>
              </label>
              <select 
                name="semester" 
                defaultValue={prefillSemester}
                className="w-full p-3 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
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
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Tahun Akademik <span className="text-red-500">*</span>
              </label>
              <select 
                name="tahun_akademik" 
                className="w-full p-3 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
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

          {/* Baris 2: IPK */}
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
              placeholder="Contoh: 3.50"
              className="w-full md:w-1/2 p-3 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
            <p className="text-[11px] text-slate-500 mt-2">Masukkan IPK sesuai yang tertera di KHS (skala 0 - 4.00)</p>
          </div>

          {/* Baris 3: File Upload */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Upload File KHS (PDF) <span className="text-red-500">*</span>
            </label>
            <div className="border-2 border-dashed border-blue-200 bg-blue-50/30 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-blue-50/60 transition-colors cursor-pointer group">
              <input 
                type="file" 
                name="file" 
                accept=".pdf" 
                className="hidden" 
                id="file-upload"
                required
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-blue-600 mb-4 shadow-sm group-hover:scale-110 transition-transform">
                  <UploadCloud size={24} />
                </div>
                <p className="text-sm font-bold text-blue-600">Klik untuk memilih file</p>
                <p className="text-sm text-slate-500 mt-1"> atau drag & drop file di sini</p>
                <p className="text-[10px] font-bold text-slate-400 mt-3 uppercase tracking-widest">Format PDF, maksimal 5MB</p>
              </label>
            </div>
          </div>

          {/* Baris 4: Catatan Opsional */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Catatan (Opsional)
            </label>
            <textarea 
              name="catatan" 
              rows={3}
              placeholder="Tulis catatan jika diperlukan..."
              className="w-full p-3 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
            ></textarea>
          </div>

          {/* Tombol Aksi */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Link 
              href="/user/laporanKHS" 
              className="px-6 py-2.5 border border-slate-200 text-slate-600 text-sm font-bold rounded-lg hover:bg-slate-50 transition-colors"
            >
              Batal
            </Link>
            <button 
              type="submit" 
              className="px-8 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
            >
              <UploadCloud size={16} /> Submit
            </button>
          </div>

        </form>

      </div>

      {/* FOOTER INFO */}
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start gap-3">
        <Info className="text-blue-500 flex-shrink-0 mt-0.5" size={16} />
        <p className="text-[11px] text-blue-800 font-medium">
          Pastikan dokumen yang diupload adalah KHS resmi dan terbaru. File yang sudah di-submit akan masuk ke antrean verifikasi admin.
        </p>
      </div>

    </div>
  );
}