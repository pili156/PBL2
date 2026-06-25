import { prisma } from '@/src/lib/prisma';
import {
  GraduationCap, Target, Wallet,
} from 'lucide-react';
import { notFound } from 'next/navigation';
import { formatRupiah, formatDate } from '@/src/lib/formatters';
import TimelineSteps from '@/app/components/TimelineSteps';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id_dosen: string }>;
}

const StatCard = ({ icon: Icon, label, value, color }: { icon: React.ComponentType<{ size?: number; className?: string }>; label: string; value: string; color: string }) => (
  <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
    <div className="flex items-start justify-between mb-3">
      <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{label}</p>
      <div className="p-2 bg-slate-50 rounded-lg"><Icon size={16} className={color} /></div>
    </div>
    <p className="text-2xl font-bold text-slate-800">{value}</p>
  </div>
);

export default async function DashboardDosen({ params }: Props) {
  const { id_dosen } = await params;
  const idDosen = Number(id_dosen);

  if (isNaN(idDosen)) notFound();

  const dosen = await prisma.user.findUnique({
    where: { id: idDosen },
    include: {
      master_dosen: true,
      pengajuan_studi: {
        include: {
          jenis_studi: true,
          jalur_pendanaan: true,
          status: true,
          wilayah: true,
          sk_kementerian: true,
          monitoring_khs: { orderBy: { semester_ke: 'asc' } },
          pengajuan_reimbursement: true,
        },
        orderBy: { created_at: 'desc' },
      },
    },
  });

  if (!dosen) notFound();

  const namaDosen = dosen.master_dosen?.nama_lengkap || dosen.username || 'Dosen';
  const nip = dosen.master_dosen?.nip || '-';
  const jurusan = dosen.master_dosen?.jurusan || '-';

  if (dosen.pengajuan_studi.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-12 text-center">
        <GraduationCap size={48} className="mx-auto text-slate-300 mb-4" strokeWidth={1.5} />
        <p className="text-slate-500 font-medium">Belum ada data studi</p>
        <p className="text-slate-400 text-sm mt-1">Dosen ini belum memiliki pengajuan studi.</p>
      </div>
    );
  }

  const pengajuan = dosen.pengajuan_studi[0];
  const skKementerian = pengajuan.sk_kementerian?.[0] ?? null;
  const khsList = pengajuan.monitoring_khs;
  const semesterAktif = khsList.length;
  const isSelesai = ['studi_selesai', 'selesai'].includes(pengajuan.status?.nama_status?.toLowerCase() ?? '');
  const lastKhs = semesterAktif > 0 ? khsList[khsList.length - 1] : null;
  const isDisetujui = ['disetujui', 'diterima', 'aktif', 'sedang berjalan'].includes(pengajuan.status?.nama_status?.toLowerCase() ?? '') || !!skKementerian;

  const ipkValues = khsList.map((k) => Number(k.ipk || 0)).filter((v) => v > 0);
  const rataIpk = ipkValues.length > 0 ? (ipkValues.reduce((a, b) => a + b, 0) / ipkValues.length).toFixed(2) : '-';
  const maxIpk = ipkValues.length > 0 ? Math.max(...ipkValues).toFixed(2) : '-';
  const totalSks = semesterAktif * 20;

  const totalBantuan = pengajuan.pengajuan_reimbursement.reduce((s, r) => s + Number(r.nominal || 0), 0);
  const totalCair = pengajuan.pengajuan_reimbursement
    .filter((r) => r.status_pencairan === 'dicairkan')
    .reduce((s, r) => s + Number(r.nominal || 0), 0);

  const steps = [
    { label: 'Pengajuan', sub: formatDate(pengajuan.tanggal_pengajuan), done: true },
    { label: 'Persetujuan', sub: isDisetujui ? 'Disetujui' : 'Proses', done: isDisetujui },
    { label: 'SK Tugas', sub: skKementerian ? 'Terbit' : 'Proses', done: !!skKementerian },
    { label: 'Studi Aktif', sub: semesterAktif > 0 ? `Sem ${lastKhs?.semester_ke ?? '-'}` : 'Belum', done: semesterAktif > 0 },
    { label: 'Selesai', sub: isSelesai ? 'Lulus' : 'Belum', done: isSelesai },
  ];

  const completedSteps = steps.filter(step => step.done).length;
  const progressPercentage = Math.min(100, Math.max(0, ((completedSteps - 1) / (steps.length - 1)) * 100));

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-base font-semibold text-slate-800">Progress Studi</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {completedSteps} dari {steps.length} tahapan selesai
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-2xl font-bold text-emerald-600">{Math.round(progressPercentage)}%</p>
              <p className="text-[10px] text-slate-400 font-medium">Progress</p>
            </div>
            <span className="bg-blue-50 text-blue-600 text-[11px] font-semibold px-3 py-1 rounded-full">
              {pengajuan.jenis_studi?.nama_jenis || 'Studi'}
            </span>
          </div>
        </div>
        <TimelineSteps
          pengajuanId={pengajuan.id}
          steps={steps}
          basePath="/master_admin"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
            <h4 className="text-sm font-semibold text-slate-800 mb-5">Detail Informasi Studi</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1">
              {[
                { label: 'Nama Dosen', value: namaDosen },
                { label: 'NIP', value: nip },
                { label: 'Jurusan', value: jurusan },
                { label: 'Jenis Studi', value: pengajuan.jenis_studi?.nama_jenis || '-' },
                { label: 'Wilayah Studi', value: pengajuan.wilayah?.nama_wilayah || '-' },
                { label: 'Jalur Pendanaan', value: pengajuan.jalur_pendanaan?.nama_pendanaan || '-' },
                { label: 'Tanggal Mulai', value: formatDate(pengajuan.tanggal_pengajuan) },
                { label: 'Perguruan Tinggi', value: pengajuan.perguruan_tinggi || '-' },
              ].map((item) => (
                <div key={item.label} className="flex justify-between py-2 border-b border-slate-50">
                  <span className="text-xs text-slate-500">{item.label}</span>
                  <span className="text-xs font-medium text-slate-800 text-right">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {skKementerian && (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h4 className="text-sm font-semibold text-slate-800 mb-4">SK Tugas Belajar</h4>
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-slate-800">{skKementerian.nomor_sk || 'SK Tugas Belajar'}</p>
                  <p className="text-xs text-slate-400 mt-0.5">Terbit: {formatDate(skKementerian.tanggal_terbit)}</p>
                </div>
                <a href={skKementerian.file_sk_path || '#'} target="_blank"
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors">
                  Lihat SK
                </a>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
            <h4 className="text-sm font-semibold text-slate-800 mb-5 flex items-center gap-2">
              <Target size={15} className="text-slate-400" />
              Capaian Studi
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-4 bg-slate-50 rounded-xl">
                <p className="text-2xl font-bold text-blue-600">{rataIpk}</p>
                <p className="text-[10px] text-slate-400 font-medium mt-1">IPS Rata-rata</p>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-xl">
                <p className="text-2xl font-bold text-slate-800">{maxIpk}</p>
                <p className="text-[10px] text-slate-400 font-medium mt-1">IPS Tertinggi</p>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-xl">
                <p className="text-2xl font-bold text-slate-800">{totalSks}</p>
                <p className="text-[10px] text-slate-400 font-medium mt-1">SKS Lulus</p>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-xl">
                <p className="text-2xl font-bold text-slate-800">{semesterAktif}</p>
                <p className="text-[10px] text-slate-400 font-medium mt-1">Semester Aktif</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
            <h4 className="text-sm font-semibold text-slate-800 mb-5 flex items-center gap-2">
              <Wallet size={15} className="text-slate-400" />
              Bantuan Pendidikan
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span className="text-xs text-slate-500">Total Bantuan</span>
                <span className="text-sm font-bold text-slate-800">{formatRupiah(totalBantuan)}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                <span className="text-xs text-emerald-600 font-medium">Sudah Cair</span>
                <span className="text-sm font-bold text-emerald-600">{formatRupiah(totalCair)}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span className="text-xs text-slate-500">Sisa</span>
                <span className="text-sm font-bold text-slate-800">{formatRupiah(totalBantuan - totalCair)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
