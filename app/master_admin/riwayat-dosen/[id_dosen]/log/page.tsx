import { prisma } from '@/src/lib/prisma';
import {
  History, Upload, CheckCircle2, MessageSquare,
  FileText, Wallet, Edit, Shield, Plus,
} from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { formatDateTime } from '@/src/lib/formatters';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id_dosen: string }>;
}

type ActivityType = 'upload' | 'verifikasi' | 'revisi' | 'pencairan' | 'surat' | 'komunikasi' | 'manual';

interface Activity {
  type: ActivityType;
  title: string;
  description: string;
  date: Date | null | undefined;
  user: string;
  isManual?: boolean;
}

const activityConfig: Record<ActivityType, { icon: React.ComponentType<{ size?: number; className?: string }>; color: string; bg: string }> = {
  upload: { icon: Upload, color: 'text-blue-600', bg: 'bg-blue-100' },
  verifikasi: { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-100' },
  revisi: { icon: Edit, color: 'text-amber-600', bg: 'bg-amber-100' },
  pencairan: { icon: Wallet, color: 'text-violet-600', bg: 'bg-violet-100' },
  surat: { icon: FileText, color: 'text-slate-600', bg: 'bg-slate-100' },
  komunikasi: { icon: MessageSquare, color: 'text-sky-600', bg: 'bg-sky-100' },
  manual: { icon: Edit, color: 'text-orange-600', bg: 'bg-orange-100' },
};

const ActivityCard = ({ activity }: { activity: Activity }) => {
  const config = activityConfig[activity.type];
  const Icon = config.icon;
  return (
    <div className="relative flex gap-4 pb-6 last:pb-0 group">
      <div className="relative z-10 flex-shrink-0">
        <div className={`w-10 h-10 rounded-full ${config.bg} flex items-center justify-center`}>
          <Icon size={17} className={config.color} />
        </div>
      </div>
      <div className="flex-1 min-w-0 bg-white rounded-xl border border-slate-100 shadow-sm p-4 group-hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-slate-800">{activity.title}</p>
              {activity.isManual && (
                <span className="px-1.5 py-0.5 bg-orange-100 text-orange-600 rounded text-[9px] font-bold uppercase tracking-wider">Manual</span>
              )}
            </div>
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

export default async function LogAktivitasPage({ params }: Props) {
  const { id_dosen } = await params;
  const idDosen = Number(id_dosen);

  if (isNaN(idDosen)) notFound();

  const dosen = await prisma.user.findUnique({
    where: { id: idDosen },
    include: {
      master_dosen: true,
      pengajuan_studi: {
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
        orderBy: { created_at: 'desc' },
        take: 1,
      },
    },
  });

  if (!dosen) notFound();

  const activities: Activity[] = [];
  const pengajuan = dosen.pengajuan_studi[0] ?? null;

  const activityLogs = await prisma.activityLog.findMany({
    where: { user_id: idDosen },
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

  if (pengajuan) {
    if (pengajuan.tanggal_pengajuan) {
      activities.push({
        type: 'upload',
        title: 'Pengajuan Studi Diajukan',
        description: 'Permohonan studi baru diajukan',
        date: new Date(pengajuan.tanggal_pengajuan),
        user: dosen.master_dosen?.nama_lengkap || 'Dosen',
      });
    }

    if (pengajuan.status?.nama_status) {
      const sd = pengajuan.updated_at || pengajuan.created_at;
      if (sd) activities.push({
        type: 'verifikasi',
        title: `Status: ${pengajuan.status.nama_status}`,
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
        user: dosen.master_dosen?.nama_lengkap || 'Dosen',
      });
      if (khs.tanggal_evaluasi) activities.push({
        type: khs.status_evaluasi === 'ditolak' ? 'revisi' : 'verifikasi',
        title: `KHS Semester ${khs.semester_ke || '-'} ${khs.status_evaluasi === 'diterima' ? 'Diverifikasi' : khs.status_evaluasi === 'ditolak' ? 'Ditolak' : 'Direvisi'}`,
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
        user: dosen.master_dosen?.nama_lengkap || 'Dosen',
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

  activities.sort((a, b) => {
    const da = a.date ? new Date(a.date).getTime() : 0;
    const db = b.date ? new Date(b.date).getTime() : 0;
    return db - da;
  });

  const uniqueActivities = activities.filter(
    (a, i, self) => i === self.findIndex((x) => x.title === a.title && x.date?.getTime() === a.date?.getTime())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-800">Log Aktivitas</h3>
          <p className="text-sm text-slate-400 mt-0.5">{uniqueActivities.length} aktivitas tercatat</p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/master_admin/riwayat-dosen/${idDosen}/log/tambah`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={14} /> Tambah Catatan
          </Link>
        </div>
      </div>

      {uniqueActivities.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-12 text-center">
          <History size={48} className="mx-auto text-slate-300 mb-4" strokeWidth={1.5} />
          <p className="text-sm text-slate-500 font-medium">Belum ada aktivitas</p>
        </div>
      ) : (
        <div className="relative">
          <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-slate-100" />
          <div className="space-y-1">
            {uniqueActivities.map((activity, index) => (
              <ActivityCard key={index} activity={activity} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
