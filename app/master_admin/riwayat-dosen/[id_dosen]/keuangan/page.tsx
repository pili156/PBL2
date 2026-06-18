import { prisma } from '@/src/lib/prisma';
import { Plus, Wallet, TrendingUp, Banknote, Clock, Check, Send, FileText } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { formatRupiah, formatDateLong } from '@/src/lib/formatters';
import StatusBadge from "@/src/components/StatusBadge";

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id_dosen: string }>;
}

const statusIcon = (status: string | null | undefined, step: number) => {
  const s = status?.toLowerCase() || 'pending';
  const isSelesai = s === 'dicairkan' || s === 'selesai';
  const isDiproses = s === 'pending' || s === 'diproses';
  const steps = [
    step <= 1 || (step === 1), // Pengajuan
    step <= 2 || (step === 2 && (isDiproses || isSelesai)), // Verifikasi
    step <= 3 || (step === 3 && isSelesai), // Cair
    step <= 4 || (step === 4 && isSelesai), // Selesai
  ];
  return steps[step - 1];
};

const TrackingStep = ({ label, icon: Icon, active, last }: { label: string; icon: React.ComponentType<{ size?: number }>; active: boolean; last?: boolean }) => (
  <div className="flex items-center gap-3">
    <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
      active ? 'bg-emerald-500 text-white shadow-sm' : 'bg-slate-100 text-slate-300'
    }`}>
      <Icon size={16} />
    </div>
    <span className={`text-xs font-medium ${active ? 'text-slate-800' : 'text-slate-400'}`}>{label}</span>
    {!last && <ChevronRight size={14} className="text-slate-300 flex-shrink-0" />}
  </div>
);

import { ChevronRight } from 'lucide-react';

export default async function RiwayatKeuangan({ params }: Props) {
  const { id_dosen } = await params;
  const idDosen = Number(id_dosen);

  if (isNaN(idDosen)) notFound();

  const keuanganList = await prisma.pengajuanReimbursement.findMany({
    where: { pengajuan_studi: { user_id: idDosen } },
    orderBy: { created_at: 'asc' },
    include: {
      pengajuan_studi: {
        include: { user: { include: { master_dosen: true } } },
      },
    },
  });

  const totalBantuan = keuanganList.reduce((total, k) => total + Number(k.nominal || 0), 0);
  const totalDicairkan = keuanganList
    .filter((k) => k.status_pencairan === 'dicairkan')
    .reduce((total, k) => total + Number(k.nominal || 0), 0);
  const sisaBantuan = totalBantuan - totalDicairkan;
  const jumlahPencairan = keuanganList.filter((k) => k.status_pencairan === 'dicairkan').length;

  const latestStatus = keuanganList.length > 0 ? keuanganList[keuanganList.length - 1].status_pencairan || 'pending' : null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Total Bantuan</p>
            <div className="p-2 bg-blue-50 rounded-lg"><Wallet size={15} className="text-blue-600" /></div>
          </div>
          <p className="text-xl font-bold text-slate-800">{formatRupiah(totalBantuan)}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Sudah Cair</p>
            <div className="p-2 bg-emerald-50 rounded-lg"><TrendingUp size={15} className="text-emerald-600" /></div>
          </div>
          <p className="text-xl font-bold text-emerald-600">{formatRupiah(totalDicairkan)}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Sisa Bantuan</p>
            <div className="p-2 bg-amber-50 rounded-lg"><Banknote size={15} className="text-amber-600" /></div>
          </div>
          <p className="text-xl font-bold text-amber-600">{formatRupiah(sisaBantuan)}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Jumlah Cair</p>
            <div className="p-2 bg-violet-50 rounded-lg"><Clock size={15} className="text-violet-600" /></div>
          </div>
          <p className="text-xl font-bold text-slate-800">{jumlahPencairan}x</p>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-800">History Pencairan Dana</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">{keuanganList.length} transaksi</p>
          </div>
          <Link
            href={`/master_admin/riwayat-dosen/${idDosen}/keuangan/tambah`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={14} /> Tambah Pencairan
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-50/50">
                <th className="px-5 py-3.5 w-10">No</th>
                <th className="px-5 py-3.5">Tahap</th>
                <th className="px-5 py-3.5 text-right">Nominal</th>
                <th className="px-5 py-3.5">Tanggal Transfer</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {keuanganList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-400 text-sm">
                    Belum ada data pencairan.
                  </td>
                </tr>
              ) : (
                keuanganList.map((k, index) => {
                  return (
                    <tr key={k.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-3.5 text-sm text-slate-400 font-mono">{index + 1}.</td>
                      <td className="px-5 py-3.5">
                        <span className="text-sm font-medium text-slate-800">Semester {k.semester_ke || '-'}</span>
                      </td>
                      <td className="px-5 py-3.5 text-sm font-semibold text-slate-800 text-right tabular-nums">
                        {k.nominal ? formatRupiah(Number(k.nominal)) : 'Rp 0'}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-slate-500">
                        {k.tanggal_pencairan ? formatDateLong(k.tanggal_pencairan) : formatDateLong(k.created_at)}
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={k.status_pencairan} domain="pencairan" size="sm" dot />
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <Link
                          href={`/master_admin/riwayat-dosen/${idDosen}/keuangan/${k.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 text-xs font-semibold rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          Detail
                        </Link>
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
