import { prisma } from '@/src/lib/prisma';
import { Download, GraduationCap, BookOpen, Wallet } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import TabNavigation from './TabNavigation';
import BackButton from '@/app/components/BackButton';
import { formatRupiah } from '@/src/lib/formatters';

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
  const jurusan = dosen.master_dosen?.jurusan || '-';
  const programStudi = dosen.master_dosen?.program_studi;

  const latestPengajuan = dosen.pengajuan_studi[0] ?? null;
  const khsList = latestPengajuan?.monitoring_khs || [];
  const ipkValues = khsList.map((k) => Number(k.ipk || 0)).filter((v) => v > 0);
  const rataIpk = ipkValues.length > 0
    ? (ipkValues.reduce((a, b) => a + b, 0) / ipkValues.length).toFixed(2)
    : '-';
  const semesterAktif = khsList.length;

  const totalCair = latestPengajuan?.pengajuan_reimbursement
    ?.filter((r) => r.status_pencairan === 'dicairkan')
    .reduce((sum, r) => sum + Number(r.nominal || 0), 0) || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <BackButton />
          <nav className="flex items-center gap-2 text-sm text-slate-400">
            <Link href="/master_admin/dashboard" className="hover:text-slate-600 transition-colors">Dashboard</Link>
            <span>/</span>
            <Link href="/master_admin/riwayat-dosen" className="hover:text-slate-600 transition-colors">Data Dosen</Link>
            <span>/</span>
            <span className="text-slate-800 font-medium">{namaDosen}</span>
          </nav>
        </div>
        <a
          href={`/api/export/studi/${idDosen}`}
          className="inline-flex items-center gap-2 bg-white border border-slate-200 text-slate-600 text-sm font-medium px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors"
        >
          <Download size={16} /> Export Excel
        </a>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
        <div className="flex flex-col lg:flex-row lg:items-center gap-5">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
              {inisial}
            </div>
            <div className="min-w-0">
              <h3 className="text-lg font-semibold text-slate-900 truncate">{namaDosen}</h3>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-slate-500">
                <span className="font-mono text-xs">{nip}</span>
                <span className="hidden sm:inline w-1 h-1 rounded-full bg-slate-300" />
                <span>{jurusan}{programStudi ? ` — ${programStudi}` : ''}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5 px-4 py-2 bg-slate-50 rounded-lg">
              <GraduationCap size={16} className="text-blue-500" />
              <div className="text-right">
                <p className="text-[10px] text-slate-400 font-medium leading-tight">IPS Rata-rata</p>
                <p className="text-sm font-bold text-slate-800">{rataIpk}</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 px-4 py-2 bg-slate-50 rounded-lg">
              <BookOpen size={16} className="text-emerald-500" />
              <div className="text-right">
                <p className="text-[10px] text-slate-400 font-medium leading-tight">Semester</p>
                <p className="text-sm font-bold text-slate-800">{semesterAktif > 0 ? `${semesterAktif}` : '-'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 px-4 py-2 bg-slate-50 rounded-lg">
              <Wallet size={16} className="text-violet-500" />
              <div className="text-right">
                <p className="text-[10px] text-slate-400 font-medium leading-tight">Bantuan Cair</p>
                <p className="text-sm font-bold text-slate-800">{totalCair > 0 ? formatRupiah(totalCair) : '-'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <TabNavigation idDosen={idDosen.toString()} />

      <div>{children}</div>


    </div>
  );
}
