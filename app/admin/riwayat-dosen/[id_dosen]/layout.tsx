// app/admin/riwayat-dosen/[id_dosen]/layout.tsx
import { prisma } from '@/src/lib/prisma';
import { ArrowLeft, Download, GraduationCap, Clock, Wallet, Target } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import TabNavigation from './TabNavigation';

export const dynamic = 'force-dynamic';

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ id_dosen: string }>;
}

export default async function DetailDosenLayout({ children, params }: LayoutProps) {
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
          pengajuan_reimbursement: true,
        },
        orderBy: { created_at: 'desc' },
        take: 1,
      },
    },
  });

  if (!dosen) notFound();

  const namaDosen = dosen.master_dosen?.nama_lengkap || dosen.username || 'Dosen';
  const inisial = namaDosen.charAt(0).toUpperCase();
  const nip = dosen.master_dosen?.nip || '-';
  const email = dosen.email || '-';
  const noHp = '-';
  const jurusan = dosen.master_dosen?.jurusan || '-';
  const programStudi = dosen.master_dosen?.program_studi;

  // Kalkulasi Metrik (Sesuaikan dengan field DB kamu)
  const latestPengajuan = dosen.pengajuan_studi[0] ?? null;
  const khsList = latestPengajuan?.monitoring_khs || [];
  const ipkValues = khsList.map((k: any) => Number(k.ipk || 0)).filter((v: number) => v > 0);
  const rataIpk = ipkValues.length > 0 ? (ipkValues.reduce((a: number, b: number) => a + b, 0) / ipkValues.length).toFixed(2) : '-';
  const semesterAktif = khsList.length;

  const totalCair = latestPengajuan?.pengajuan_reimbursement
    ?.filter((r: any) => r.status_pencairan === 'DICAIRKAN')
    .reduce((sum: number, r: any) => sum + Number(r.nominal || 0), 0) || 0;

  const formatRupiah = (angka: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <nav className="flex items-center gap-2 text-xs text-slate-500 mb-1.5 font-medium">
            <Link href="/admin" className="hover:text-blue-600 transition-colors">Dashboard</Link>
            <span>›</span>
            <Link href="/admin/riwayat-dosen" className="hover:text-blue-600 transition-colors">Monitoring Dosen</Link>
            <span>›</span>
            <span className="text-slate-800">Detail Dosen</span>
          </nav>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Monitoring Dosen</h2>
          <p className="text-sm text-slate-500 mt-1">Kelola dan pantau perkembangan studi dosen secara menyeluruh</p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/riwayat-dosen" className="inline-flex items-center gap-2 bg-white border border-slate-200 text-slate-600 text-sm font-medium px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
            <ArrowLeft size={16} /> Kembali ke Daftar Dosen
          </Link>
          <button className="inline-flex items-center gap-2 bg-white border border-slate-200 text-slate-600 text-sm font-medium px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
            <Download size={16} /> Export Data
          </button>
        </div>
      </div>

      {/* Header Card 4 Metrik Sesuai UI */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
        <div className="flex flex-col xl:flex-row gap-8">
          
          {/* Info Dosen */}
          <div className="flex gap-5 xl:w-[35%] xl:border-r border-slate-100 pr-4">
            <div className="w-16 h-16 rounded-full bg-blue-100 border-2 border-blue-50 flex items-center justify-center text-blue-600 text-2xl font-bold flex-shrink-0">
              {inisial}
            </div>
            <div className="space-y-2 flex-1">
              <div>
                <h3 className="text-base font-bold text-slate-800 leading-tight">{namaDosen}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{jurusan}{programStudi ? ` - ${programStudi}` : ''}</p>
              </div>
              <div className="grid grid-cols-1 gap-1 text-[11px] text-slate-600">
                <p className="flex items-center gap-2"><span className="w-4 text-slate-400">NIP</span> {nip}</p>
                <p className="flex items-center gap-2"><span className="w-4 text-slate-400">✉</span> {email}</p>
                <p className="flex items-center gap-2"><span className="w-4 text-slate-400">☎</span> {noHp}</p>
              </div>
            </div>
          </div>

          {/* 4 Kotak Metrik */}
          <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="border border-slate-100 rounded-xl p-4 flex flex-col justify-center bg-slate-50/50">
              <div className="flex items-center gap-2 mb-2 text-slate-500">
                <GraduationCap size={16} /> <p className="text-[10px] font-bold uppercase tracking-wider">IPK Rata-rata</p>
              </div>
              <p className="text-2xl font-black text-slate-800">{rataIpk}</p>
              <p className="text-[10px] text-slate-400 mt-1">Dari 4 Semester</p>
            </div>
            <div className="border border-slate-100 rounded-xl p-4 flex flex-col justify-center bg-slate-50/50">
              <div className="flex items-center gap-2 mb-2 text-slate-500">
                <Clock size={16} /> <p className="text-[10px] font-bold uppercase tracking-wider">Semester Aktif</p>
              </div>
              <p className="text-2xl font-black text-slate-800">{semesterAktif}</p>
              <p className="text-[10px] text-slate-400 mt-1">Semester</p>
            </div>
            <div className="border border-slate-100 rounded-xl p-4 flex flex-col justify-center bg-slate-50/50">
              <div className="flex items-center gap-2 mb-2 text-slate-500">
                <Wallet size={16} /> <p className="text-[10px] font-bold uppercase tracking-wider">Total Bantuan Cair</p>
              </div>
              <p className="text-lg font-black text-slate-800">{totalCair > 0 ? formatRupiah(totalCair) : 'Rp 0'}</p>
              <p className="text-[10px] text-slate-400 mt-1">Dari Rp 50.000.000</p>
            </div>
            <div className="border border-slate-100 rounded-xl p-4 flex flex-col justify-center bg-slate-50/50">
              <div className="flex items-center gap-2 mb-2 text-slate-500">
                <Target size={16} /> <p className="text-[10px] font-bold uppercase tracking-wider">Target Lulus</p>
              </div>
              <p className="text-lg font-black text-slate-800">Juli 2027</p>
              <p className="text-[10px] text-slate-400 mt-1">Perkiraan</p>
            </div>
          </div>

        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100">
        <TabNavigation idDosen={idDosen.toString()} />
      </div>

      {/* Konten Halaman Tab */}
      <div>{children}</div>

    </div>
  );
}