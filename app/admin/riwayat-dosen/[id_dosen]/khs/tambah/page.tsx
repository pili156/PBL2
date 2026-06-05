import { prisma } from '@/src/lib/prisma';
import { Plus, Upload, Loader2 } from 'lucide-react';
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
          <h2 className="text-xl font-bold text-slate-900">Tambah KHS Manual</h2>
          <p className="text-sm text-slate-400 mt-0.5">Input data KHS untuk {nama}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
        <form action={addManualKhs} className="space-y-5" encType="multipart/form-data">
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
            <input type="text" name="tahunAkademik" placeholder="Contoh: 2024/2025"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">SKS</label>
            <input type="number" name="sks" defaultValue="20" min="0"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
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

          <button type="submit"
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm">
            <Upload size={16} /> Upload & Simpan KHS
          </button>
        </form>
      </div>
    </div>
  );
}
