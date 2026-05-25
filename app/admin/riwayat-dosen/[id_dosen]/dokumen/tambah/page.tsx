import { prisma } from '@/src/lib/prisma';
import { ArrowLeft, Upload } from 'lucide-react';
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
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Upload Dokumen</h2>
          <p className="text-sm text-slate-400 mt-0.5">Upload dokumen untuk {nama}</p>
        </div>
        <Link href={`/admin/riwayat-dosen/${idDosen}/dokumen`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
          <ArrowLeft size={16} /> Kembali
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
        <form action={addManualDokumen} className="space-y-5" encType="multipart/form-data">
          <input type="hidden" name="pengajuanId" value={pengajuanId} />
          <input type="hidden" name="idDosen" value={idDosen} />

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Jenis Dokumen</label>
            <select name="masterDokumenId" required
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white">
              <option value="">-- Pilih Jenis Dokumen --</option>
              {masterDokumen.map((md: { id: number; nama_dokumen?: string | null }) => (
                <option key={md.id} value={md.id}>{md.nama_dokumen || `Dokumen #${md.id}`}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">File Dokumen (PDF/JPG/PNG, maks 5MB)</label>
            <div className="relative">
              <input
                type="file"
                name="file"
                accept=".pdf,.jpg,.jpeg,.png"
                required
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Upload file dokumen. Format: PDF, JPG, PNG. Maksimal 5MB.</p>
          </div>

          <button type="submit"
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm">
            <Upload size={16} /> Upload Dokumen
          </button>
        </form>
      </div>
    </div>
  );
}
