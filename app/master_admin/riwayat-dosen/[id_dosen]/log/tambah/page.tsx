import { prisma } from '@/src/lib/prisma';
import { Plus } from 'lucide-react';
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
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Tambah Catatan Manual</h2>
          <p className="text-sm text-slate-400 mt-0.5">Catatan aktivitas untuk {nama}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
        <form className="space-y-5">
          <input type="hidden" name="pengajuanId" value={pengajuanId} />

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Jenis Aktivitas</label>
            <select name="aktivitas" required
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white">
              <option value="Upload Dokumen">Upload Dokumen</option>
              <option value="Edit Data Studi">Edit Data Studi</option>
              <option value="Upload KHS Manual">Upload KHS Manual</option>
              <option value="Upload Bukti Transfer">Upload Bukti Transfer</option>
              <option value="Generate Surat">Generate Surat</option>
              <option value="Pencairan Selesai">Pencairan Selesai</option>
              <option value="Revisi Data">Revisi Data</option>
              <option value="Lainnya">Lainnya</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Keterangan</label>
            <textarea name="keterangan" rows={4} placeholder="Deskripsi aktivitas..."
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
          </div>

          <button type="submit" formAction={addManualLog}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm">
            <Plus size={16} /> Simpan Catatan
          </button>
        </form>
      </div>

      <p className="text-xs text-slate-400 text-center">
        Catatan akan otomatis muncul di Log Aktivitas dengan label <span className="font-semibold text-orange-500">Manual</span>.
      </p>
    </div>
  );
}
