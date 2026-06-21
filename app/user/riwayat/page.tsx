import { headers } from 'next/headers';
import { prisma } from '@/src/lib/prisma';
import { notFound } from 'next/navigation';
import { BookOpen, Wallet, GraduationCap, TrendingUp, Coins, ClipboardList } from 'lucide-react';
import Link from 'next/link';
import { formatRupiah } from '@/src/lib/formatters';

export const dynamic = 'force-dynamic';

const STATUS_CAIR = ["dicairkan", "selesai"] as const;

export default async function RiwayatRootPage() {
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
          monitoring_khs: true,
          pengajuan_reimbursement: {
            include: {
              dokumen_pengajuan: true,
            },
          },
        },
        orderBy: { created_at: 'desc' },
      },
    },
  });

  if (!user) notFound();

  // Helper function to determine effective status based on documents and pencairan status
  const getEffectiveStatus = (item: typeof user.pengajuan_studi[0]['pengajuan_reimbursement'][0]): string => {
    // Check if any document has revisi status
    const hasDocumentRevision = item.dokumen_pengajuan?.some(
      (doc) => doc.status_verifikasi === "revisi"
    );

    if (hasDocumentRevision) {
      return "revisi";
    }

    return item.status_pencairan?.toLowerCase() ?? "pending";
  };

  const totalPengajuan = user.pengajuan_studi.length;
  const latestPengajuan = user.pengajuan_studi[0];

  let totalIpk = 0;
  let countIpk = 0;
  let totalBantuanCair = 0;
  let totalKhs = 0;

  for (const p of user.pengajuan_studi) {
    for (const khs of p.monitoring_khs) {
      if (khs.ipk) { totalIpk += Number(khs.ipk); countIpk++; }
      totalKhs++;
    }
    for (const r of p.pengajuan_reimbursement) {
      if (r.nominal) {
        const effectiveStatus = getEffectiveStatus(r);
        if ((STATUS_CAIR as readonly string[]).includes(effectiveStatus)) {
          totalBantuanCair += Number(r.nominal);
        }
      }
    }
  }

  const rataIpk = countIpk > 0 ? (totalIpk / countIpk) : 0;
  const statusStudi = latestPengajuan?.status?.nama_status || 'Belum Mengajukan';

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <ClipboardList size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider">Total Pengajuan</p>
              <p className="text-2xl font-bold text-slate-800">{totalPengajuan}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
              <TrendingUp size={20} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider">Rata-rata IPK</p>
              <p className="text-2xl font-bold text-slate-800">{rataIpk > 0 ? rataIpk.toFixed(2) : '-'}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <Coins size={20} className="text-amber-600" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider">Bantuan Cair</p>
              <p className="text-2xl font-bold text-slate-800">{formatRupiah(totalBantuanCair)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <GraduationCap size={20} className="text-purple-600" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider">Status Studi</p>
              <span className="inline-block px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[10px] font-bold uppercase tracking-wider">
                {statusStudi}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Daftar Pengajuan Studi</h3>
        {totalPengajuan === 0 ? (
          <div className="text-center py-10 text-slate-500">
            <p>Belum ada pengajuan studi.</p>
            <Link href="/user/pengajuan" className="text-blue-600 font-bold text-sm mt-2 inline-block hover:underline">
              Ajukan Studi Baru
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {user.pengajuan_studi.map((p, i) => {
              const khsCount = p.monitoring_khs.length;
              const ipkRata = khsCount > 0
                ? p.monitoring_khs.reduce((sum, k) => sum + Number(k.ipk || 0), 0) / khsCount
                : 0;
              const totalCair = p.pengajuan_reimbursement
                .filter(r => {
                  const effectiveStatus = getEffectiveStatus(r);
                  return (STATUS_CAIR as readonly string[]).includes(effectiveStatus);
                })
                .reduce((sum, r) => sum + Number(r.nominal || 0), 0);

              return (
                <div key={p.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                      {i + 1}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{p.perguruan_tinggi || 'Universitas'}</p>
                      <p className="text-xs text-slate-500">
                        {p.jenis_studi?.nama_jenis || '-'} &bull; {p.jalur_pendanaan?.nama_pendanaan || '-'} &bull; {khsCount} KHS &bull; IPK {ipkRata > 0 ? ipkRata.toFixed(2) : '-'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-500">{formatRupiah(totalCair)} cair</span>
                    <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px] font-bold">
                      {p.status?.nama_status || '-'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/user/riwayat/studi" className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
            <BookOpen size={24} className="text-blue-600" />
          </div>
          <div>
            <p className="font-bold text-slate-800">Riwayat Studi</p>
            <p className="text-sm text-slate-500">Lihat KHS dan status evaluasi per semester</p>
          </div>
        </Link>
        <Link href="/user/riwayat/keuangan" className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center">
            <Wallet size={24} className="text-emerald-600" />
          </div>
          <div>
            <p className="font-bold text-slate-800">Riwayat Keuangan</p>
            <p className="text-sm text-slate-500">Cek status pencairan bantuan studi</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
