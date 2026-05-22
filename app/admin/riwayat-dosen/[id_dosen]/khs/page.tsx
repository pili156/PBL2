// app/admin/riwayat-dosen/[id_dosen]/khs/page.tsx
import { prisma } from '@/src/lib/prisma';
import { Download, Cloud, BarChart3, UploadCloud } from 'lucide-react'; 
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface RiwayatKhsTabProps {
  params: Promise<{ id_dosen: string }>;
}

export default async function RiwayatKhsTab({ params }: RiwayatKhsTabProps) {
  const { id_dosen } = await params;
  const idDosen = Number(id_dosen);

  if (isNaN(idDosen)) notFound();

  // Fetch Data Dosen SEKALIGUS Data KHS-nya
  const dosen = await prisma.user.findUnique({
    where: { id: idDosen },
    include: {
      pengajuan_studi: {
        include: {
          monitoring_khs: {
            orderBy: { semester_ke: 'asc' },
          },
        },
      },
    },
  });

  if (!dosen) notFound();

  // Ekstrak list KHS dari relasi pengajuan_studi
  const khsList = dosen.pengajuan_studi.flatMap((p: any) => p.monitoring_khs);

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return '-';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER TAB */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white rounded-xl border border-slate-100 shadow-sm p-4 sm:px-6">
        <div>
          <h3 className="text-base font-bold text-slate-800">Riwayat Studi (KHS)</h3>
          <p className="text-xs text-slate-500 mt-1">Riwayat perkembangan akademik dosen setiap semester</p>
        </div>
        <Link href={`/admin/riwayat-dosen/${idDosen}/khs/tambah`} className="flex items-center justify-center gap-2 bg-blue-600 text-white text-xs font-bold px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
          <UploadCloud size={14} /> Upload KHS Manual
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* KOLOM KIRI: Tabel KHS (Lebar) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          
          <div className="p-5 border-b border-slate-100 flex justify-between items-center">
            <h4 className="text-sm font-bold text-slate-800">Riwayat Semester & IPK</h4>
          </div>

          <div className="overflow-x-auto p-5 pt-0">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 pr-2 w-10">No</th>
                  <th className="py-3 pr-2">Semester</th>
                  <th className="py-3 pr-2 text-center">IPK</th>
                  <th className="py-3 pr-2 text-center">SKS</th>
                  <th className="py-3 pr-2">Tgl Upload</th>
                  <th className="py-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {khsList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-slate-500 text-xs">
                      Belum ada data KHS yang diunggah.
                    </td>
                  </tr>
                ) : (
                  khsList.map((k: any, index: number) => (
                    <tr key={k.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 pr-2 text-xs font-medium text-slate-500">{index + 1}</td>
                      <td className="py-3 pr-2 text-xs font-bold text-slate-800">Semester {k.semester_ke}</td>
                      <td className="py-3 pr-2 text-xs font-bold text-slate-800 text-center">{k.ipk ? Number(k.ipk).toFixed(2) : '-'}</td>
                      <td className="py-3 pr-2 text-xs text-slate-600 text-center">20</td>
                      <td className="py-3 pr-2 text-xs text-slate-500">{formatDate(k.tanggal_unggah)}</td>
                      <td className="py-3 flex justify-center items-center gap-1">
                        <Link href={`/admin/riwayat-dosen/${idDosen}/khs/${k.id}`} className="px-3 py-1 bg-blue-50 text-blue-600 rounded text-[10px] font-bold hover:bg-blue-600 hover:text-white transition-colors">
                          Detail
                        </Link>
                        {k.file_khs_path && (
                          <a href={k.file_khs_path} target="_blank" rel="noopener noreferrer" className="p-1.5 text-slate-400 hover:text-blue-600 bg-slate-50 rounded hover:bg-blue-50 transition-colors" title="Download">
                            <Download size={14} />
                          </a>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* KOLOM KANAN: Grafik Mini */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 flex flex-col h-full min-h-[300px]">
            <h4 className="text-sm font-bold text-slate-800 mb-4">Grafik Perkembangan IPK</h4>
            <div className="flex-1 bg-slate-50 rounded-xl border border-dashed border-slate-200 flex flex-col items-center justify-center p-4 text-center">
              <BarChart3 size={32} className="text-slate-300 mb-2" />
              <p className="text-xs font-bold text-slate-500">Area Grafik Recharts</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}