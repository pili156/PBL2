// app/admin/riwayat-dosen/[id_dosen]/khs/tambah/page.tsx
import { prisma } from '@/src/lib/prisma';
import { ArrowLeft, UploadCloud, Info } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { addManualKhs } from '../../../actions';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id_dosen: string }>;
}

export default async function TambahKhsPage({ params }: Props) {
  const { id_dosen } = await params;
  const idDosen = Number(id_dosen);

  if (isNaN(idDosen)) notFound();

  // Logika Fetch DB tidak diubah
  const dosen = await prisma.user.findUnique({
    where: { id: idDosen },
    include: {
      pengajuan_studi: { take: 1, orderBy: { created_at: 'desc' } },
    },
  });

  if (!dosen || !dosen.pengajuan_studi[0]) notFound();

  const pengajuanId = dosen.pengajuan_studi[0].id;

  return (
    <div className="max-w-3xl mx-auto space-y-6 pt-4">
      
      {/* HEADER TULISAN */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Tambah KHS Manual</h2>
          <p className="text-sm text-slate-500 mt-1">Input data dan unggah dokumen KHS secara manual</p>
        </div>
        <Link href={`/admin/riwayat-dosen/${idDosen}/khs`} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-50 transition-colors shadow-sm">
          <ArrowLeft size={16} /> Kembali
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        
        {/* INFO BANNER */}
        <div className="bg-amber-50/50 p-4 border-b border-slate-100 flex gap-3 items-start">
          <Info size={16} className="text-amber-500 mt-0.5" />
          <p className="text-xs text-amber-800 leading-relaxed">
            Data yang diinputkan melalui form ini akan diverifikasi terlebih dahulu sebelum masuk ke kalkulasi IPK Rata-rata.
          </p>
        </div>

        {/* FORM AREA */}
        <div className="p-6 md:p-8">
          <form action={addManualKhs} className="space-y-6" encType="multipart/form-data">
            <input type="hidden" name="pengajuanId" value={pengajuanId} />
            <input type="hidden" name="idDosen" value={idDosen} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Semester Ke <span className="text-red-500">*</span></label>
                <input type="number" name="semesterKe" required min="1" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all" />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">IPK Semester <span className="text-red-500">*</span></label>
                <input type="number" name="ipk" step="0.01" min="0" max="4" placeholder="Contoh: 3.85" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Tahun Akademik</label>
                <input type="text" name="tahunAkademik" placeholder="Contoh: 2024/2025" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all" />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">SKS Diambil</label>
                <input type="number" name="sks" defaultValue="20" min="0" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">File KHS / Transkrip <span className="text-red-500">*</span></label>
              <div className="relative w-full">
                <input type="file" name="file" accept=".pdf,.jpg,.jpeg,.png" required className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                <div className="w-full border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center text-center bg-slate-50 hover:bg-blue-50 hover:border-blue-300 transition-all">
                  <UploadCloud size={24} className="text-blue-500 mb-2" />
                  <p className="text-sm font-bold text-slate-800">Klik atau Drag file KHS ke sini</p>
                  <p className="text-[10px] text-slate-500 mt-1">PDF, JPG, PNG (Maks 5MB)</p>
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button type="submit" className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm">
                <UploadCloud size={16} /> Simpan KHS
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}