import { headers } from 'next/headers';
import { prisma } from '@/src/lib/prisma';
import {
  History, Upload, CheckCircle2, MessageSquare,
  FileText, Wallet, Edit, Shield,
} from 'lucide-react';
import { formatDateTime } from '@/src/lib/formatters';

export const dynamic = 'force-dynamic';

type ActivityType = 'upload' | 'verifikasi' | 'revisi' | 'pencairan' | 'surat' | 'komunikasi';

interface Activity {
  type: ActivityType;
  title: string;
  description: string;
  date: Date | null | undefined;
  user: string;
}

const activityConfig: Record<ActivityType, { icon: React.ComponentType<{ size?: number; className?: string }>; color: string; bg: string }> = {
  upload: { icon: Upload, color: 'text-blue-600', bg: 'bg-blue-100' },
  verifikasi: { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-100' },
  revisi: { icon: Edit, color: 'text-amber-600', bg: 'bg-amber-100' },
  pencairan: { icon: Wallet, color: 'text-violet-600', bg: 'bg-violet-100' },
  surat: { icon: FileText, color: 'text-slate-600', bg: 'bg-slate-100' },
  komunikasi: { icon: MessageSquare, color: 'text-sky-600', bg: 'bg-sky-100' },
};

const ActivityCard = ({ activity }: { activity: Activity }) => {
  const config = activityConfig[activity.type];
  const Icon = config.icon;
  return (
    <div className="flex gap-4 pb-6 last:pb-0 group">
      <div className="flex flex-col items-center flex-shrink-0">
        <div className={`w-10 h-10 rounded-full ${config.bg} flex items-center justify-center`}>
          <Icon size={17} className={config.color} />
        </div>
        <div className="w-0.5 flex-1 bg-slate-100 mt-1" />
      </div>
      <div className="flex-1 min-w-0 bg-white rounded-xl border border-slate-100 shadow-sm p-4 group-hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-800">{activity.title}</p>
            <p className="text-xs text-slate-500 mt-0.5">{activity.description}</p>
          </div>
          <span className="text-[10px] text-slate-400 font-medium flex-shrink-0 whitespace-nowrap">{formatDateTime(activity.date)}</span>
        </div>
        <div className="flex items-center gap-1.5 mt-2">
          <Shield size={11} className="text-slate-400" />
          <span className="text-[10px] text-slate-400 font-medium">{activity.user}</span>
        </div>
      </div>
    </div>
  );
};

export default async function LogAktivitasPage() {
  const headersList = await headers();
  const userEmail = headersList.get('x-user-email');
  if (!userEmail) {
    return <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-10 text-center text-slate-500">Silakan login terlebih dahulu</div>;
  }

  const user = await prisma.user.findUnique({
    where: { email: userEmail },
    include: { master_dosen: true },
  });

  if (!user) {
    return <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-10 text-center text-slate-500">User tidak ditemukan</div>;
  }

  const namaLengkap = user.master_dosen?.nama_lengkap || user.username || 'Dosen';

  const allPengajuan = await prisma.pengajuanStudi.findMany({
    where: { user_id: user.id },
    orderBy: { created_at: 'desc' },
    include: {
      monitoring_khs: { orderBy: { created_at: 'desc' } },
      pengajuan_reimbursement: { orderBy: { created_at: 'desc' } },
      sk_kementerian: true,
      status: true,
      pesan_komunikasi: {
        orderBy: { waktu_kirim: 'desc' },
        include: { pengirim: { include: { master_dosen: true } } },
      },
    },
  });

  const activities: Activity[] = [];

  const activityLogs = await prisma.activityLog.findMany({
    where: { user_id: user.id },
    orderBy: { created_at: 'desc' },
  });

  for (const log of activityLogs) {
    activities.push({
      type: 'upload',
      title: log.aktivitas || 'Aktivitas',
      description: log.tipe || 'sistem',
      date: log.created_at,
      user: 'Sistem',
    });
  }

  for (const pengajuan of allPengajuan) {
    if (pengajuan.tanggal_pengajuan) {
      activities.push({
        type: 'upload',
        title: `Pengajuan Studi Diajukan - ${pengajuan.perguruan_tinggi || 'Universitas'}`,
        description: 'Permohonan studi baru diajukan',
        date: new Date(pengajuan.tanggal_pengajuan),
        user: namaLengkap,
      });
    }

    if (pengajuan.status?.nama_status) {
      const sd = pengajuan.updated_at || pengajuan.created_at;
      if (sd) activities.push({
        type: 'verifikasi',
        title: `Status: ${pengajuan.status.nama_status} - ${pengajuan.perguruan_tinggi || ''}`,
        description: 'Pembaruan status pengajuan oleh admin',
        date: sd,
        user: 'Admin Sistem',
      });
    }

    for (const khs of pengajuan.monitoring_khs) {
      if (khs.tanggal_unggah) activities.push({
        type: 'upload',
        title: `Upload KHS Semester ${khs.semester_ke || '-'}`,
        description: `IPS: ${Number(khs.ipk || 0).toFixed(2)}`,
        date: khs.tanggal_unggah,
        user: namaLengkap,
      });
      if (khs.tanggal_evaluasi) activities.push({
        type: khs.status_evaluasi === 'revisi' ? 'revisi' : 'verifikasi',
        title: `KHS Semester ${khs.semester_ke || '-'} ${khs.status_evaluasi === 'valid' ? 'Disetujui' : khs.status_evaluasi === 'revisi' ? 'Diminta Revisi' : 'Diverifikasi'}`,
        description: khs.catatan_evaluasi || 'Evaluasi oleh admin',
        date: khs.tanggal_evaluasi,
        user: 'Admin',
      });
    }

    for (const sk of pengajuan.sk_kementerian) {
      if (sk.tanggal_terbit) activities.push({
        type: 'surat',
        title: 'SK Tugas Belajar Terbit',
        description: sk.nomor_sk ? `Nomor: ${sk.nomor_sk}` : 'SK Tugas Belajar',
        date: sk.tanggal_terbit,
        user: 'Admin Pusat',
      });
    }

    for (const r of pengajuan.pengajuan_reimbursement) {
      if (r.created_at) activities.push({
        type: 'upload',
        title: `Upload Bukti Bayar Semester ${r.semester_ke || '-'}`,
        description: `Rp ${Number(r.nominal || 0).toLocaleString('id-ID')}`,
        date: r.created_at,
        user: namaLengkap,
      });
      if (r.tanggal_pencairan) activities.push({
        type: 'pencairan',
        title: `Dana Semester ${r.semester_ke || '-'} Cair`,
        description: `Rp ${Number(r.nominal || 0).toLocaleString('id-ID')}`,
        date: r.tanggal_pencairan,
        user: 'Admin Keuangan',
      });
    }

    for (const msg of pengajuan.pesan_komunikasi) {
      activities.push({
        type: 'komunikasi',
        title: 'Catatan Sistem',
        description: msg.isi_pesan || 'Tidak ada keterangan',
        date: msg.waktu_kirim,
        user: msg.pengirim?.master_dosen?.nama_lengkap || msg.pengirim?.username || 'Admin',
      });
    }
  }

  const activitiesWithTime = activities.map((a) => ({
    ...a,
    _time: a.date ? new Date(a.date).getTime() : 0,
  }));

  const seen = new Map<string, boolean>();
  const uniqueActivities = activitiesWithTime.filter((a) => {
    const key = `${a.title}|${a._time}`;
    if (seen.has(key)) return false;
    seen.set(key, true);
    return true;
  });

  uniqueActivities.sort((a, b) => b._time - a._time);

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 space-y-6">
      <div className="border-b border-slate-100 pb-4">
        <h3 className="text-lg font-bold text-slate-800">Log Aktivitas</h3>
        <p className="text-sm text-slate-500 mt-0.5">
          Riwayat aktivitas studi Anda &bull; {uniqueActivities.length} aktivitas tercatat
        </p>
      </div>

      {uniqueActivities.length === 0 ? (
        <div className="text-center py-12">
          <History size={48} className="mx-auto text-slate-300 mb-4" strokeWidth={1.5} />
          <p className="text-sm text-slate-500 font-medium">Belum ada aktivitas</p>
        </div>
      ) : (
        <div className="space-y-1">
          {uniqueActivities.map((activity, index) => (
            <ActivityCard key={index} activity={activity} />
          ))}
        </div>
      )}
    </div>
  );
}
