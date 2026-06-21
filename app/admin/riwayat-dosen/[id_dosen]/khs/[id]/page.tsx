'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Download, FileText, Calendar, BookOpen, Target, User, Clock } from 'lucide-react';
import Link from 'next/link';
import { formatDateLong } from '@/src/lib/formatters';
import { getStatusLabel } from '@/src/lib/status-utils';
import KhsVerification from './components/KhsVerification';

interface KhsData {
  id: number;
  semester_ke?: number | null;
  tahun_akademik?: string | null;
  file_khs_path?: string | null;
  ipk?: number | string | null;
  tanggal_unggah?: Date | null;
  catatan_evaluasi?: string | null;
  status_evaluasi?: string | null;
  pengajuan_studi?: {
    user?: {
      master_dosen?: {
        nama_lengkap?: string;
      };
    };
  };
}

interface Props {
  params: Promise<{ id_dosen: string; id: string }>;
}

export default function DetailKhsPage({ params }: Props) {
  const [khs, setKhs] = useState<KhsData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchKhs = async () => {
      try {
        const { id_dosen, id } = await params;
        const khsId = Number(id);
        const idDosen = Number(id_dosen);

        if (isNaN(khsId) || isNaN(idDosen)) {
          return;
        }

        const response = await fetch(`/api/admin/monitoring-khs/${khsId}`);
        if (response.ok) {
          const data = await response.json();
          setKhs(data);
        }
      } catch (error) {
        console.error('Error fetching KHS:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchKhs();
  }, [params]);

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!khs) {
    return <div className="p-6">KHS tidak ditemukan</div>;
  }

  const ipkValue = khs.ipk ? Number(khs.ipk).toFixed(2) : '-';
  const isDisabled = !khs.file_khs_path;
  const namaDosen = khs.pengajuan_studi?.user?.master_dosen?.nama_lengkap || 'Dosen';
  const statusLabel = getStatusLabel(khs.status_evaluasi, 'evaluasi');
  const statusColor = khs.status_evaluasi === 'valid' || khs.status_evaluasi === 'diterima'
    ? 'text-emerald-600'
    : khs.status_evaluasi === 'revisi'
    ? 'text-orange-600'
    : khs.status_evaluasi === 'ditolak'
    ? 'text-red-600'
    : 'text-amber-600';

  const infoItems = [
    { icon: BookOpen, label: 'Semester', value: `Semester ${khs.semester_ke || '-'}` },
    { icon: Calendar, label: 'Tahun Akademik', value: khs.tahun_akademik || '-' },
    { icon: User, label: 'Dosen', value: namaDosen },
    { icon: Calendar, label: 'Tanggal Upload', value: khs.tanggal_unggah ? formatDateLong(khs.tanggal_unggah as any) : '-' },
    { icon: Target, label: 'IPK', value: `${ipkValue} / 4.00`, highlight: true },
    { icon: Clock, label: 'Status', value: statusLabel, statusColor },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Preview KHS</h2>
          <p className="text-sm text-slate-400 mt-0.5">Semester {khs.semester_ke || '-'} — {khs.tahun_akademik || 'Tahun tidak tersedia'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 items-start">
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
            <h3 className="text-sm font-semibold text-slate-800 mb-5">Informasi KHS</h3>
            <div className="space-y-3">
              {infoItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <Icon size={16} className="text-slate-400" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-medium">{item.label}</p>
                      <p className={`text-sm ${item.statusColor || item.highlight ? 'font-bold' : 'font-medium'} ${item.statusColor || 'text-slate-800'} ${item.highlight && !item.statusColor ? 'text-blue-600' : ''}`}>
                        {item.value}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {khs.catatan_evaluasi && (
              <div className="mt-5 p-3 bg-slate-50 rounded-lg">
                <p className="text-[10px] text-slate-400 font-medium mb-1">Catatan</p>
                <p className="text-xs text-slate-700">{khs.catatan_evaluasi}</p>
              </div>
            )}

            <div className="mt-5">
              <a
                href={khs.file_khs_path || '#'}
                target="_blank"
                className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                  isDisabled
                    ? 'bg-slate-50 text-slate-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
                }`}
              >
                <Download size={16} /> Download PDF
              </a>
            </div>
          </div>

          <KhsVerification
            khsId={khs.id}
            currentStatus={khs.status_evaluasi || 'pending'}
            currentCatatan={khs.catatan_evaluasi || ''}
            onSuccess={() => router.refresh()}
          />
        </div>

        <div className="xl:col-span-3 bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
          <div className="flex items-center justify-between px-5 py-3.5 bg-slate-800 border-b border-slate-700">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <FileText size={15} className="text-slate-400" />
              Dokumen KHS
            </h3>
            {khs.file_khs_path && (
              <a
                href={khs.file_khs_path}
                target="_blank"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 text-white rounded-md text-xs font-medium hover:bg-white/20 transition-colors"
              >
                <Download size={13} /> Unduh
              </a>
            )}
          </div>

          <div className="flex-1 bg-[#525659] p-4 flex items-center justify-center min-h-[500px]">
            {khs.file_khs_path ? (
              <iframe
                src={khs.file_khs_path}
                className="w-full h-full min-h-[500px] bg-white rounded-lg shadow-lg"
                title="Preview KHS"
              />
            ) : (
              <div className="text-center text-slate-400 bg-slate-700/50 p-12 rounded-xl">
                <FileText size={56} className="mx-auto mb-4 opacity-30" strokeWidth={1.5} />
                <p className="text-sm font-medium text-slate-300">Dokumen Belum Tersedia</p>
                <p className="text-xs text-slate-500 mt-1">File KHS belum diunggah.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
