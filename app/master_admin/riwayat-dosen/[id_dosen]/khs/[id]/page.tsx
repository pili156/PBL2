import { prisma } from '@/src/lib/prisma';
import { Download, FileText, Calendar, BookOpen, Target, User } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { formatDateLong } from '@/src/lib/formatters';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id_dosen: string; id: string }>;
}

export default async function DetailKhsPage({ params }: Props) {
  const { id_dosen, id } = await params;
  const khsId = Number(id);
  const idDosen = Number(id_dosen);

  if (isNaN(khsId) || isNaN(idDosen)) notFound();

  const khs = await prisma.monitoringKhs.findUnique({
    where: { id: khsId },
    include: {
      pengajuan_studi: {
        include: {
          user: { include: { master_dosen: true } },
        },
      },
    },
  });

  if (!khs) notFound();

  const ipkValue = khs.ipk ? Number(khs.ipk).toFixed(2) : '-';
  const isDisabled = !khs.file_khs_path;
  const namaDosen = khs.pengajuan_studi?.user?.master_dosen?.nama_lengkap || 'Dosen';

  const infoItems = [
    { icon: BookOpen, label: 'Semester', value: `Semester ${khs.semester_ke || '-'}` },
    { icon: Calendar, label: 'Tahun Akademik', value: khs.tahun_akademik || '-' },
    { icon: User, label: 'Dosen', value: namaDosen },
    { icon: Calendar, label: 'Tanggal Upload', value: formatDateLong(khs.tanggal_unggah) },
    { icon: Target, label: 'IPK', value: `${ipkValue} / 4.00`, highlight: true },
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
                      <p className={`text-sm ${item.highlight ? 'font-bold text-blue-600' : 'font-medium text-slate-800'}`}>
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
