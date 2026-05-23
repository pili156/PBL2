import { cookies } from 'next/headers';
import { prisma } from '@/src/lib/prisma';
import { notFound } from 'next/navigation';
import TabNavigation from './TabNavigation';

export const dynamic = 'force-dynamic';

export default async function RiwayatLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const userEmail = cookieStore.get('user_email')?.value;

  if (!userEmail) notFound();

  const user = await prisma.user.findUnique({
    where: { email: userEmail },
    include: {
      master_dosen: true,
      pengajuan_studi: {
        include: { status: true },
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
  const statusStudi = user.pengajuan_studi[0]?.status?.nama_status || 'Belum Mengajukan';

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
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100">
        <TabNavigation />
      </div>

      <div>{children}</div>
    </div>
  );
}
