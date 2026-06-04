import { headers } from 'next/headers';
import { prisma } from '@/src/lib/prisma';
import { notFound } from 'next/navigation';
import { Building2, GraduationCap } from 'lucide-react';
import TabNavigation from './TabNavigation';

export const dynamic = 'force-dynamic';

export default async function RiwayatLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers();
  const userEmail = headersList.get('x-user-email');

  if (!userEmail) notFound();

  const user = await prisma.user.findUnique({
    where: { email: userEmail },
    include: {
      master_dosen: true,
      pengajuan_studi: {
        include: {
          status: true,
          jenis_studi: true,
          jalur_pendanaan: true,
        },
        orderBy: { created_at: 'desc' },
        take: 1,
      },
    },
  });

  if (!user) notFound();

  const namaLengkap = user.master_dosen?.nama_lengkap || user.username || 'Dosen';
  const inisial = namaLengkap.charAt(0).toUpperCase();
  const nip = user.master_dosen?.nip || '-';
  const jurusan = user.master_dosen?.jurusan || '-';

  const latestPengajuan = user.pengajuan_studi[0];
  const statusStudi = latestPengajuan?.status?.nama_status || 'Belum Mengajukan';
  const jenisStudi = latestPengajuan?.jenis_studi?.nama_jenis || null;
  const jalurPendanaan = latestPengajuan?.jalur_pendanaan?.nama_pendanaan || null;
  const perguruanTinggi = latestPengajuan?.perguruan_tinggi || null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Riwayat & Monitoring</h2>
        <p className="text-sm text-slate-500 mt-1">Pantau perkembangan studi dan bantuan studi Anda</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 flex items-center gap-5">
        <div className="w-12 h-12 rounded-full bg-blue-100 border-2 border-blue-50 flex items-center justify-center text-blue-600 text-xl font-bold flex-shrink-0">
          {inisial}
        </div>
        <div className="flex flex-wrap items-center gap-x-8 gap-y-1 text-sm">
          <div>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider">Nama</p>
            <p className="font-bold text-slate-800">{namaLengkap}</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider">NIP</p>
            <p className="font-bold text-slate-800">{nip}</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider">Jurusan</p>
            <p className="font-bold text-slate-800">{jurusan}</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider">Status Studi</p>
            <span className="inline-block px-2.5 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[10px] font-bold uppercase tracking-wider">
              {statusStudi}
            </span>
          </div>
          {perguruanTinggi && (
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider">PT Tujuan</p>
              <p className="font-bold text-slate-800 flex items-center gap-1">
                <Building2 size={12} className="text-slate-400" />
                {perguruanTinggi}
              </p>
            </div>
          )}
          {jenisStudi && (
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider">Jenis Studi</p>
              <p className="font-bold text-slate-800 flex items-center gap-1">
                <GraduationCap size={12} className="text-slate-400" />
                {jenisStudi}
                {jalurPendanaan && <span className="text-slate-400 font-normal"> &bull; {jalurPendanaan}</span>}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100">
        <TabNavigation />
      </div>

      <div>{children}</div>
    </div>
  );
}
