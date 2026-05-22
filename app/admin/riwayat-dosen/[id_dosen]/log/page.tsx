// app/admin/riwayat-dosen/[id_dosen]/log/page.tsx
import { prisma } from '@/src/lib/prisma';
import { History, Filter, Upload, CheckCircle2, MessageSquare, FileText, Wallet, Edit } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id_dosen: string }>;
}

const formatDateTime = (date: Date | null | undefined) => {
  if (!date) return '-';
  return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) + ' WIB';
};

type ActivityType = 'upload' | 'verifikasi' | 'revisi' | 'pencairan' | 'surat' | 'komunikasi' | 'manual';

interface Activity {
  type: ActivityType;
  title: string;
  description: string;
  date: Date | null | undefined;
  user: string;
  isManual?: boolean;
}

const activityConfig: Record<ActivityType, { color: string; bg: string; label: string }> = {
  upload: { color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200', label: 'Upload' },
  verifikasi: { color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200', label: 'Verifikasi' },
  revisi: { color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200', label: 'Revisi' },
  pencairan: { color: 'text-violet-600', bg: 'bg-violet-50 border-violet-200', label: 'Keuangan' },
  surat: { color: 'text-slate-600', bg: 'bg-slate-50 border-slate-200', label: 'Sistem' },
  komunikasi: { color: 'text-sky-600', bg: 'bg-sky-50 border-sky-200', label: 'Pesan' },
  manual: { color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200', label: 'Manual' },
};

const typeIcon: Record<ActivityType, React.ComponentType<{ size?: number; className?: string }>> = {
  upload: Upload,
  verifikasi: CheckCircle2,
  revisi: Edit,
  pencairan: Wallet,
  surat: FileText,
  komunikasi: MessageSquare,
  manual: Edit,
};

export default async function LogAktivitasPage({ params }: Props) {
  const { id_dosen } = await params;
  const idDosen = Number(id_dosen);

  if (isNaN(idDosen)) notFound();

  // --- LOGIKA FETCH DATA ASLI KAMU (TIDAK ADA YANG DIUBAH) ---
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
      type: 'manual', // Paksa tipe manual untuk bedakan dengan sistem
      title: log.aktivitas || 'Aktivitas',
      description: log.tipe || 'sistem',
      date: log.created_at,
      user: 'Admin (Manual)',
      isManual: true,
    });
  }

  if (pengajuan) {
    if (pengajuan.tanggal_pengajuan) {
      activities.push({
        type: 'upload', title: 'Pengajuan Bantuan Studi Dibuat', description: 'Permohonan studi baru diajukan',
        date: new Date(pengajuan.tanggal_pengajuan), user: dosen.master_dosen?.nama_lengkap || 'Dosen',
      });
    }

    if (pengajuan.status?.nama_status) {
      const sd = pengajuan.updated_at || pengajuan.created_at;
      if (sd) activities.push({
        type: 'verifikasi', title: `Status Pengajuan: ${pengajuan.status.nama_status}`, description: 'Pembaruan status pengajuan',
        date: sd, user: 'Sistem / Admin',
      });
    }

    for (const khs of pengajuan.monitoring_khs) {
      if (khs.tanggal_unggah) activities.push({
        type: 'upload', title: `Upload KHS Semester ${khs.semester_ke || '-'}`, description: `IPK: ${Number(khs.ipk || 0).toFixed(2)}`,
        date: khs.tanggal_unggah, user: dosen.master_dosen?.nama_lengkap || 'Dosen',
      });
      if (khs.tanggal_evaluasi) activities.push({
        type: khs.status_evaluasi === 'DITOLAK' ? 'revisi' : 'verifikasi',
        title: `Verifikasi KHS Semester ${khs.semester_ke || '-'}`, description: khs.status_evaluasi === 'DITERIMA' ? 'Disetujui' : khs.status_evaluasi === 'DITOLAK' ? 'Ditolak' : 'Direvisi',
        date: khs.tanggal_evaluasi, user: 'Admin',
      });
    }

    for (const sk of pengajuan.sk_kementerian) {
      if (sk.tanggal_terbit) activities.push({
        type: 'surat', title: 'SK Tugas Belajar Terbit', description: sk.nomor_sk ? `Nomor: ${sk.nomor_sk}` : 'SK Pusat',
        date: sk.tanggal_terbit, user: 'Sistem',
      });
    }

    for (const r of pengajuan.pengajuan_reimbursement) {
      if (r.created_at) activities.push({
        type: 'upload', title: `Upload Bukti Bayar Semester ${r.semester_ke || '-'}`, description: `Tahap ${r.semester_ke}`,
        date: r.created_at, user: dosen.master_dosen?.nama_lengkap || 'Dosen',
      });
      if (r.tanggal_pencairan) activities.push({
        type: 'pencairan', title: `Dana Bantuan Semester ${r.semester_ke || '-'} Cair`, description: `Telah ditransfer ke rekening`,
        date: r.tanggal_pencairan, user: 'Admin Keuangan',
      });
    }

    for (const msg of pengajuan.pesan_komunikasi) {
      activities.push({
        type: 'komunikasi', title: 'Catatan Sistem', description: msg.isi_pesan || 'Tidak ada keterangan',
        date: msg.waktu_kirim, user: msg.pengirim?.master_dosen?.nama_lengkap || msg.pengirim?.username || 'Admin',
      });
    }
  }

  activities.sort((a, b) => {
    const da = a.date ? new Date(a.date).getTime() : 0;
    const db = b.date ? new Date(b.date).getTime() : 0;
    return db - da; // Descending (Terbaru di atas)
  });

  const uniqueActivities = activities.filter(
    (a, i, self) => i === self.findIndex((x) => x.title === a.title && x.date?.getTime() === a.date?.getTime())
  );

  return (
    <div className="space-y-6">
      
      {/* HEADER TAB LOG */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white rounded-xl border border-slate-100 shadow-sm p-4 sm:px-6">
        <div>
          <h3 className="text-base font-bold text-slate-800">Log Aktivitas</h3>
          <p className="text-xs text-slate-500 mt-1">Riwayat aktivitas dan perubahan data dosen</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-600 text-xs font-bold px-4 py-2.5 rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
            <Filter size={14} /> Filter Aktivitas
          </button>
          <Link href={`/admin/riwayat-dosen/${idDosen}/log/tambah`} className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-blue-600 text-white text-xs font-bold px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
            Tambah Manual
          </Link>
        </div>
      </div>

      {/* TABEL LOG AKTIVITAS (UI BARU) */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50">
                <th className="py-4 px-6 w-48">Waktu</th>
                <th className="py-4 px-6">Aktivitas & Keterangan</th>
                <th className="py-4 px-6 w-40">Oleh</th>
                <th className="py-4 px-6 text-center w-32">Tipe</th>
              </tr>
            </thead>
            <tbody>
              {uniqueActivities.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-12">
                    <History size={48} className="mx-auto text-slate-300 mb-4" strokeWidth={1.5} />
                    <p className="text-sm text-slate-500 font-medium">Belum ada aktivitas tercatat.</p>
                  </td>
                </tr>
              ) : (
                uniqueActivities.map((activity, index) => {
                  const conf = activityConfig[activity.type];
                  const Icon = typeIcon[activity.type];
                  return (
                    <tr key={index} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors relative">
                      <td className="py-4 px-6 text-[11px] font-medium text-slate-500 relative">
                        {/* Garis konektor visual timeline di tabel */}
                        {index !== uniqueActivities.length - 1 && <div className="absolute left-9 top-8 bottom-[-1rem] w-px bg-slate-100 -z-10"></div>}
                        <div className="flex items-center gap-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-sm flex-shrink-0 bg-white`}>
                            <Icon size={12} className={conf.color} />
                          </div>
                          {formatDateTime(activity.date)}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <p className="text-xs font-bold text-slate-800">{activity.title}</p>
                        <p className="text-[10px] text-slate-500 mt-1">{activity.description}</p>
                      </td>
                      <td className="py-4 px-6 text-xs font-semibold text-slate-700">{activity.user}</td>
                      <td className="py-4 px-6 text-center">
                        <span className={`inline-block px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider rounded border ${conf.bg} ${conf.color}`}>
                          {conf.label}
                        </span>
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