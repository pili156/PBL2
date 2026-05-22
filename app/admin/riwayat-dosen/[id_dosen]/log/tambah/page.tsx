// app/admin/riwayat-dosen/[id_dosen]/log/tambah/page.tsx
import { prisma } from '@/src/lib/prisma';
import { ArrowLeft, Plus, Info, Edit } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { addManualLog } from '../../../actions';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id_dosen: string }>;
}

export default async function TambahLogPage({ params }: Props) {
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
    <div className="max-w-2xl mx-auto space-y-6 pt-4">
      
      {/* HEADER */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Tambah Catatan Manual</h2>
          <p className="text-sm text-slate-500 mt-1">Input log aktivitas untuk {nama}</p>
        </div>
        <Link href={`/admin/riwayat-dosen/${idDosen}/log`} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-50 transition-colors shadow-sm">
          <ArrowLeft size={16} /> Kembali
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        
        {/* INFO BANNER */}
        <div className="bg-blue-50/50 p-4 border-b border-slate-100 flex gap-3 items-start">
          <Info size={16} className="text-blue-500 mt-0.5" />
          <p className="text-xs text-blue-800 leading-relaxed">
            Gunakan form ini hanya jika ada aktivitas di luar sistem yang perlu didokumentasikan (misal: penyerahan berkas fisik, pertemuan tatap muka).
          </p>
        </div>

        {/* FORM AREA */}
        <div className="p-6 md:p-8">
          <form className="space-y-6">
            <input type="hidden" name="pengajuanId" value={pengajuanId} />
            
            {/* Supaya action berjalan dengan app router, kita bisa letakkan di button type submit dengan formAction */}

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Jenis Aktivitas <span className="text-red-500">*</span></label>
              <select name="aktivitas" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all appearance-none">
                <option value="Penyerahan Berkas Fisik">Penyerahan Berkas Fisik</option>
                <option value="Konsultasi / Tatap Muka">Konsultasi / Tatap Muka</option>
                <option value="Revisi Dokumen Manual">Revisi Dokumen Manual</option>
                <option value="Peringatan Keterlambatan">Peringatan Keterlambatan</option>
                <option value="Lainnya">Aktivitas Lainnya...</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Keterangan / Detail <span className="text-red-500">*</span></label>
              <textarea name="keterangan" rows={4} required placeholder="Jelaskan detail aktivitas secara singkat..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all resize-none" />
            </div>

            <div className="pt-4 flex justify-end">
              <button type="submit" formAction={addManualLog} className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm">
                <Edit size={16} /> Simpan ke Log
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}