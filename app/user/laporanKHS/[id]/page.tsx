// app/user/laporanKHS/[id]/page.tsx
import { getKHSById } from '../actions';
import { ArrowLeft, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';
import { getStatusLabel } from '@/src/lib/status-utils';
import Link from 'next/link';
import StatusBadge from "@/src/components/StatusBadge";
import ReuploadButton from '../ReuploadButton';
import EditIPSForm from './EditIPSForm';
import RevisiKHSButton from './RevisiKHSButton';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function DetailKHSUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const khsId = Number(resolvedParams.id);

  if (isNaN(khsId)) {
    notFound();
  }

  const khs = await getKHSById(khsId);

  if (!khs) {
    notFound();
  }

  const statusEvaluasi = getStatusLabel(khs.status_evaluasi, 'evaluasi');
  const isRevisi = statusEvaluasi === 'Revisi';
  const isValid = statusEvaluasi === 'Valid';
  const isPending = statusEvaluasi === 'Pending';

  const tanggalUpload = khs.tanggal_unggah 
    ? new Date(khs.tanggal_unggah).toLocaleDateString('id-ID', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      })
    : '-';

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-500">
      
      <div className="flex items-center gap-4 border-b border-slate-200 pb-4">
        <Link 
          href="/user/riwayat/studi"
          className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600"
          aria-label="Kembali"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Detail KHS</h2>
          <p className="text-sm text-slate-500 mt-1">Informasi detail dokumen KHS</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[700px]">
          <div className="p-4 border-b border-slate-100 bg-white">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <FileText size={16} className="text-blue-600" /> Dokumen KHS
            </h3>
          </div>
          
          <div className="flex-1 bg-slate-100 flex flex-col">
            <div className="bg-slate-700 text-slate-300 px-4 py-2 flex justify-between items-center text-xs font-mono">
              <span>KHS_Semester_{khs.semester_ke}_Tahun_{khs.tahun_akademik?.replace(/\s/g, '_')}.pdf</span>
              <div className="flex items-center gap-4">
                <span>1 / 1</span>
                <span>100%</span>
              </div>
            </div>
            
            <div className="flex-1 p-6 overflow-auto flex justify-center">
              {khs.file_khs_path ? (
                <iframe 
                  src={khs.file_khs_path} 
                  className="w-full h-full border-0 shadow-lg" 
                  title="PDF KHS"
                />
              ) : (
                <div className="w-full h-full bg-white shadow-lg border border-slate-200 p-8 flex items-center justify-center">
                  <p className="text-slate-500">File tidak ditemukan</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 md:p-8">
            <h3 className="text-sm font-bold text-slate-800 mb-6 border-b border-slate-100 pb-3">
              Informasi KHS
            </h3>

            <div className="space-y-4 mb-8">
              <div className="grid grid-cols-2 py-1">
                <span className="text-xs text-slate-500">Semester</span>
                <span className="text-xs font-bold text-slate-800">Semester {khs.semester_ke}</span>
              </div>
              <div className="grid grid-cols-2 py-1">
                <span className="text-xs text-slate-500">Tahun Akademik</span>
                <span className="text-xs font-bold text-slate-800">{khs.tahun_akademik || '-'}</span>
              </div>
              <div className="grid grid-cols-2 py-1">
                <span className="text-xs text-slate-500">IPS</span>
                <EditIPSForm
                  khsId={khsId}
                  currentValue={khs.ipk ? Number(khs.ipk) : null}
                  isRevisi={isRevisi}
                  hideEdit={isRevisi}
                />
              </div>
              <div className="grid grid-cols-2 py-1">
                <span className="text-xs text-slate-500">Tanggal Upload</span>
                <span className="text-xs font-bold text-slate-800">{tanggalUpload}</span>
              </div>
              <div className="grid grid-cols-2 py-1 items-center">
                <span className="text-xs text-slate-500">Status</span>
                <div>
                  <StatusBadge status={khs.status_evaluasi} domain="evaluasi" size="md" dot />
                </div>
              </div>
              {(isRevisi || isValid) && (
                <>
                  <div className="grid grid-cols-2 py-1 pt-4 border-t border-slate-100">
                    <span className="text-xs text-slate-500">Diverifikasi Oleh</span>
                    <span className="text-xs font-bold text-slate-800">
                      {khs.pengajuan_studi?.user?.master_dosen?.nama_lengkap || '-'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 py-1">
                    <span className="text-xs text-slate-500">Tanggal Verifikasi</span>
                    <span className="text-xs font-bold text-slate-800">
                      {khs.tanggal_evaluasi 
                        ? new Date(khs.tanggal_evaluasi).toLocaleDateString('id-ID', { 
                            day: 'numeric', 
                            month: 'long', 
                            year: 'numeric' 
                          })
                        : '-'}
                    </span>
                  </div>
                </>
              )}
            </div>

            {isRevisi && khs.catatan_evaluasi && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-8 shadow-sm">
                <h5 className="flex items-center gap-2 text-amber-800 font-bold text-sm mb-2">
                  <AlertCircle size={18} /> Catatan dari Admin
                </h5>
                <p className="text-sm text-amber-700 leading-relaxed">
                  {khs.catatan_evaluasi}
                </p>
              </div>
            )}
            
            {isValid && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 mb-8 shadow-sm">
                <h5 className="flex items-center gap-2 text-emerald-800 font-bold text-sm mb-2">
                  <CheckCircle2 size={18} /> KHS Disetujui
                </h5>
                <p className="text-sm text-emerald-700 leading-relaxed">
                  Dokumen KHS Anda telah diverifikasi dan datanya valid.
                </p>
              </div>
            )}

            {isPending && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-8 shadow-sm">
                <h5 className="flex items-center gap-2 text-blue-800 font-bold text-sm mb-2">
                  <AlertCircle size={18} /> Menunggu Verifikasi
                </h5>
                <p className="text-sm text-blue-700 leading-relaxed">
                  Dokumen KHS Anda sedang dalam antrean verifikasi admin.
                </p>
              </div>
            )}

            <div className="flex gap-3">
              {isRevisi && (
                <RevisiKHSButton
                  khsId={khsId}
                  currentIps={khs.ipk ? Number(khs.ipk) : null}
                />
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}