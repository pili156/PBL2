// app/admin/riwayat-dosen/[id_dosen]/keuangan/tambah/page.tsx
import { prisma } from '@/src/lib/prisma';
import { ArrowLeft, UploadCloud, Info } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { addManualKeuangan } from '../../../actions';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id_dosen: string }>;
}

export default async function TambahKeuanganPage({ params }: Props) {
  const { id_dosen } = await params;
  const idDosen = Number(id_dosen);

  if (isNaN(idDosen)) notFound();

  const dosen = await prisma.user.findUnique({
    where: { id: idDosen },
    include: {
      master_dosen: true,
      pengajuan_studi: { take: 1, orderBy: { created_at: 'desc' } },
    },
  });

  if (!dosen || !dosen.pengajuan_studi[0]) notFound();

  const pengajuanId = dosen.pengajuan_studi[0].id;
  const nama = dosen.master_dosen?.nama_lengkap || dosen.username || 'Dosen';

  return (
    <div className="max-w-3xl mx-auto space-y-6 pt-4">
      
      {/* HEADER TULISAN */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Tambah Pencairan Manual</h2>
          <p className="text-sm text-slate-500 mt-1">Input data pencairan dana untuk {nama}</p>
        </div>
        <Link href={`/admin/riwayat-dosen/${idDosen}/keuangan`} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-50 transition-colors shadow-sm">
          <ArrowLeft size={16} /> Kembali
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        
        {/* INFO BANNER */}
        <div className="bg-amber-50/50 p-4 border-b border-slate-100 flex gap-3 items-start">
          <Info size={16} className="text-amber-500 mt-0.5" />
          <p className="text-xs text-amber-800 leading-relaxed">
            Data yang diinputkan melalui form ini akan otomatis dicatat ke aktivitas log sebagai input manual oleh Admin.
          </p>
        </div>

        {/* FORM AREA */}
        <div className="p-6 md:p-8">
          <form action={addManualKeuangan} className="space-y-6" encType="multipart/form-data">
            <input type="hidden" name="pengajuanId" value={pengajuanId} />
            <input type="hidden" name="idDosen" value={idDosen} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Semester Ke <span className="text-red-500">*</span></label>
                <input type="number" name="semesterKe" required min="1" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all" />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Nominal (Rp) <span className="text-red-500">*</span></label>
                <input type="number" name="nominal" required min="0" placeholder="Contoh: 10000000" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Bank Tujuan</label>
                <input type="text" name="bank" placeholder="Contoh: Bank Mandiri" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all" />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Nomor Rekening</label>
                <input type="text" name="norek" placeholder="Contoh: 1234567890" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">File Bukti Transfer <span className="text-red-500">*</span></label>
              <div className="relative w-full">
                <input type="file" name="fileBukti" accept=".pdf,.jpg,.jpeg,.png" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                <div className="w-full border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center text-center bg-slate-50 hover:bg-blue-50 hover:border-blue-300 transition-all">
                  <UploadCloud size={24} className="text-blue-500 mb-2" />
                  <p className="text-sm font-bold text-slate-800">Klik atau Drag file bukti transfer</p>
                  <p className="text-[10px] text-slate-500 mt-1">PDF, JPG, PNG (Maks 5MB)</p>
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button type="submit" className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm">
                <UploadCloud size={16} /> Simpan Pencairan
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}