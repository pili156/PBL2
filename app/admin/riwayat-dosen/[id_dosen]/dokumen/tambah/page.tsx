// app/admin/riwayat-dosen/[id_dosen]/dokumen/tambah/page.tsx
import { prisma } from '@/src/lib/prisma';
import { ArrowLeft, UploadCloud, Info } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { addManualDokumen } from '../../../actions';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id_dosen: string }>;
}

export default async function TambahDokumenPage({ params }: Props) {
  const { id_dosen } = await params;
  const idDosen = Number(id_dosen);

  if (isNaN(idDosen)) notFound();

  // Logika DB tetap sama persis
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

  const masterDokumen = await prisma.masterDokumen.findMany({
    orderBy: { nama_dokumen: 'asc' },
  });

  return (
    <div className="max-w-3xl mx-auto space-y-6 pt-4">
      
      {/* HEADER TULISAN */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Upload Dokumen Dosen</h2>
          <p className="text-sm text-slate-500 mt-1">Tambahkan dokumen kelengkapan studi untuk {nama}</p>
        </div>
        <Link href={`/admin/riwayat-dosen/${idDosen}/dokumen`} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-50 transition-colors shadow-sm">
          <ArrowLeft size={16} /> Kembali
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        
        {/* INFO BANNER */}
        <div className="bg-blue-50/50 p-4 border-b border-slate-100 flex gap-3 items-start">
          <Info size={16} className="text-blue-500 mt-0.5" />
          <p className="text-xs text-blue-800 leading-relaxed">
            Pastikan jenis dokumen yang dipilih sesuai dengan file yang diunggah. Dokumen akan langsung masuk ke tab "Dokumen Pendaftaran".
          </p>
        </div>

        {/* FORM AREA */}
        <div className="p-6 md:p-8">
          <form action={addManualDokumen} className="space-y-6" encType="multipart/form-data">
            <input type="hidden" name="pengajuanId" value={pengajuanId} />
            <input type="hidden" name="idDosen" value={idDosen} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Jenis Dokumen <span className="text-red-500">*</span></label>
                <select name="masterDokumenId" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all appearance-none">
                  <option value="">-- Pilih Jenis Dokumen --</option>
                  {masterDokumen.map((md: { id: number; nama_dokumen?: string | null }) => (
                    <option key={md.id} value={md.id}>{md.nama_dokumen || `Dokumen #${md.id}`}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">File Dokumen <span className="text-red-500">*</span></label>
              
              {/* Custom File Input (Drag & Drop Look) */}
              <div className="relative w-full">
                <input
                  type="file"
                  name="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  required
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="w-full border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center text-center bg-slate-50 hover:bg-blue-50 hover:border-blue-300 transition-all">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3">
                    <UploadCloud size={24} className="text-blue-500" />
                  </div>
                  <p className="text-sm font-bold text-slate-800">Klik atau Drag & Drop file ke sini</p>
                  <p className="text-xs text-slate-500 mt-1">Format yang didukung: PDF, JPG, PNG (Maksimal 5MB)</p>
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button type="submit" className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm">
                <UploadCloud size={16} /> Upload & Simpan
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}