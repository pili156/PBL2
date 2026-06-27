import { prisma } from '@/src/lib/prisma';
import { Eye, BarChart3, Plus, FileText } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { formatDateLong } from '@/src/lib/formatters';
import StatusBadge from '@/src/components/StatusBadge';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id_dosen: string }>;
}

const IpkBar = ({ ipk, semester }: { ipk: number; semester: number }) => {
  const pct = Math.min((ipk / 4) * 100, 100);
  const color = ipk >= 3.5 ? 'bg-emerald-500' : ipk >= 3.0 ? 'bg-blue-500' : ipk >= 2.5 ? 'bg-amber-500' : 'bg-red-500';
  return (
    <div className="flex items-center gap-3">
      <span className="text-[10px] text-slate-400 w-16 flex-shrink-0">Sem {semester}</span>
      <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all w-[var(--progress)]`} style={{ '--progress': `${pct}%` } as React.CSSProperties} />
      </div>
      <span className="text-[11px] font-semibold text-slate-700 w-10 text-right tabular-nums">{ipk.toFixed(2)}</span>
    </div>
  );
};

export default async function RiwayatStudi({ params }: Props) {
  const { id_dosen } = await params;
  const idDosen = Number(id_dosen);

  if (isNaN(idDosen)) notFound();

  const dosen = await prisma.user.findUnique({
    where: { id: idDosen },
    include: {
      master_dosen: true,
      pengajuan_studi: {
        include: {
          monitoring_khs: { orderBy: { semester_ke: 'asc' } },
        },
      },
    },
  });

  if (!dosen) notFound();

  const khsList = dosen.pengajuan_studi.flatMap((p) => p.monitoring_khs);
  const pengajuan = dosen.pengajuan_studi[0] ?? null;

  const ipkValues = khsList.map((k) => Number(k.ipk || 0)).filter((v) => v > 0);
  const rataIpk = ipkValues.length > 0 ? (ipkValues.reduce((a, b) => a + b, 0) / ipkValues.length).toFixed(2) : '0.00';
  const ipkTertinggi = ipkValues.length > 0 ? Math.max(...ipkValues).toFixed(2) : '0.00';
  const ipkTerendah = ipkValues.length > 0 ? Math.min(...ipkValues).toFixed(2) : '0.00';

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mb-1">IPS Rata-rata</p>
          <p className="text-2xl font-bold text-blue-600">{rataIpk}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mb-1">IPS Tertinggi</p>
          <p className="text-2xl font-bold text-slate-800">{ipkTertinggi}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mb-1">IPS Terendah</p>
          <p className="text-2xl font-bold text-slate-800">{ipkTerendah}</p>
        </div>
      </div>

      {khsList.length > 1 && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
          <h4 className="text-sm font-semibold text-slate-800 mb-5 flex items-center gap-2">
            <BarChart3 size={15} className="text-blue-500" />
            Perkembangan IPS per Semester
          </h4>
          <div className="space-y-3">
            {khsList.map((k) => {
              const ipk = Number(k.ipk || 0);
              return ipk > 0 ? <IpkBar key={k.id} ipk={ipk} semester={k.semester_ke || 0} /> : null;
            })}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Arsip Semester</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">{khsList.length} semester tercatat</p>
          </div>
          <Link
            href={`/admin/riwayat-dosen/${idDosen}/khs/tambah`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={14} /> Tambah KHS
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-50/50">
                <th className="px-5 py-3.5 w-10">No</th>
                <th className="px-5 py-3.5">Semester</th>
                <th className="px-5 py-3.5">Tahun Akademik</th>
                <th className="px-5 py-3.5">IPS</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Tanggal Upload</th>
                <th className="px-5 py-3.5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {khsList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <FileText size={32} className="text-slate-300" strokeWidth={1.5} />
                      <p className="text-sm text-slate-400">Belum ada data KHS.</p>
                      <p className="text-xs text-slate-300">Klik &quot;Tambah KHS&quot; untuk menambahkan data secara manual.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                khsList.map((k, index) => {
                  const ipk = Number(k.ipk || 0);
                  const isDisabled = !k.file_khs_path;
                  return (
                    <tr key={k.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-3.5 text-sm text-slate-400 font-mono">{index + 1}</td>
                      <td className="px-5 py-3.5">
                        <span className="text-sm font-medium text-slate-800">Semester {k.semester_ke || '-'}</span>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-slate-600">{k.tahun_akademik || '-'}</td>
                      <td className="px-5 py-3.5">
                        <span className={`text-sm font-bold tabular-nums ${ipk >= 3.5 ? 'text-emerald-600' : ipk >= 3.0 ? 'text-blue-600' : ipk > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
                          {ipk > 0 ? ipk.toFixed(2) : '-'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={k.status_evaluasi} domain="evaluasi" size="sm" />
                      </td>
                      <td className="px-5 py-3.5 text-sm text-slate-500">{formatDateLong(k.tanggal_unggah)}</td>
                      <td className="px-5 py-3.5 text-center">
                        {isDisabled ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-400 text-xs font-medium rounded-lg cursor-not-allowed">
                            <Eye size={13} /> Review
                          </span>
                        ) : (
                          <Link
                            href={`/admin/riwayat-dosen/${idDosen}/khs/${k.id}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 text-xs font-semibold rounded-lg hover:bg-blue-100 transition-colors"
                          >
                            <Eye size={13} /> Review
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
