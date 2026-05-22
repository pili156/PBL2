// app/admin/riwayat-dosen/[id_dosen]/khs/[id]/page.tsx
import { prisma } from '@/src/lib/prisma';
import { ArrowLeft, Download, FileText, CheckSquare, XCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { acceptKhs, rejectKhs, submitRevisionKhs } from '../../../actions';

export const dynamic = 'force-dynamic';

interface DetailKhsPageProps {
  params: Promise<{ id_dosen: string; id: string }>;
}

export default async function DetailKhsPage({ params }: DetailKhsPageProps) {
  const { id_dosen, id } = await params;
  const khsId = Number(id);
  const idDosen = Number(id_dosen);

  if (isNaN(khsId) || isNaN(idDosen)) {
    notFound();
  }

  const khs = await prisma.monitoringKhs.findUnique({
    where: { id: khsId },
    include: {
      pengajuan_studi: {
        include: {
          user: {
            include: { master_dosen: true },
          },
        },
      },
    },
  });

  if (!khs) {
    notFound();
  }

  const ipkValue = khs.ipk ? Number(khs.ipk).toFixed(2) : '-';

  const formatDate = (date: Date | null) => {
    if (!date) return '-';
    return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  return (
    <div className="w-full space-y-6 pt-4">
      
      {/* HEADER DETAIL KHS */}
      <div className="flex justify-between items-center pb-2 border-b border-slate-100">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Detail KHS (Preview)</h2>
          <p className="text-sm text-slate-500 mt-1">Semester {khs.semester_ke}</p>
        </div>
        <Link 
          href={`/admin/riwayat-dosen/${idDosen}/khs`} 
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm"
        >
          <ArrowLeft size={16} /> Kembali ke Riwayat Studi
        </Link>
      </div>

      {/* SPLIT SCREEN CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* KOLOM KIRI: Informasi KHS & Form Evaluasi */}
        <div className="lg:col-span-1 space-y-6">
          
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
            <h3 className="text-sm font-bold text-slate-800 mb-6">Informasi KHS</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between text-sm border-b border-slate-50 pb-2">
                <span className="text-slate-500">Semester</span>
                <span className="font-bold text-slate-800">Semester {khs.semester_ke}</span>
              </div>
              <div className="flex justify-between text-sm border-b border-slate-50 pb-2">
                <span className="text-slate-500">Tanggal Upload</span>
                <span className="font-bold text-slate-800">{formatDate(khs.tanggal_unggah)}</span>
              </div>
              <div className="flex justify-between text-sm border-b border-slate-50 pb-2">
                <span className="text-slate-500">IPK</span>
                <span className="font-bold text-blue-600">{ipkValue}</span>
              </div>
            </div>

            {/* Download Button */}
            <div className="mt-6">
              <a 
                href={khs.file_khs_path || '#'} 
                target="_blank" 
                rel="noopener noreferrer"
                className={`w-full flex items-center justify-center gap-2 py-2.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all ${!khs.file_khs_path && 'opacity-50 pointer-events-none'}`}
              >
                <Download size={14} /> Download File Asli
              </a>
            </div>
          </div>

          {/* Form Verifikasi Admin */}
          <form className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 space-y-4">
            <h4 className="text-sm font-bold text-slate-800">Tindakan Evaluasi</h4>
            <input type="hidden" name="khsId" value={khsId} />
            
            <textarea
              name="catatan"
              className="w-full text-sm p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none min-h-[90px] resize-none"
              placeholder="Tulis alasan revisi atau catatan audit..."
              defaultValue={khs.catatan_evaluasi || ''}
            ></textarea>
            
            <div className="grid grid-cols-2 gap-2">
              <button 
                type="submit" 
                formAction={acceptKhs} 
                className="py-2.5 bg-emerald-500 text-white rounded-lg text-xs font-bold hover:bg-emerald-600 transition-colors flex items-center justify-center gap-1.5 shadow-sm"
              >
                <CheckSquare size={14} /> DITERIMA
              </button>
              <button 
                type="submit" 
                formAction={rejectKhs} 
                className="py-2.5 bg-white text-red-600 border border-red-200 rounded-lg text-xs font-bold hover:bg-red-50 transition-colors flex items-center justify-center gap-1.5 shadow-sm"
              >
                <XCircle size={14} /> DITOLAK
              </button>
            </div>
            
            <button 
              type="submit" 
              formAction={submitRevisionKhs} 
              className="w-full py-2.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-lg text-xs font-bold hover:bg-blue-600 hover:text-white transition-colors flex items-center justify-center gap-1.5"
            >
              <AlertCircle size={14} /> KIRIM REVISI
            </button>
          </form>
        </div>

        {/* KOLOM KANAN: Preview KHS (Lebih Lebar) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-100 shadow-sm flex flex-col min-h-[600px] h-full">
          <div className="p-4 border-b border-slate-100 bg-slate-800 rounded-t-xl">
            <h3 className="text-sm font-semibold text-white text-center">Preview KHS</h3>
          </div>
          
          <div className="flex-1 p-6 bg-[#525659] flex items-center justify-center overflow-hidden rounded-b-xl relative">
            {khs.file_khs_path ? (
              khs.file_khs_path.toLowerCase().endsWith('.pdf') ? (
                // Jika PDF, gunakan iframe
                <iframe 
                  src={khs.file_khs_path} 
                  className="w-full h-full min-h-[600px]" 
                  title="PDF Preview"
                />
              ) : (
                // Jika Gambar, gunakan img
                <img 
                  src={khs.file_khs_path} 
                  alt="Dokumen KHS" 
                  className="max-w-full h-auto max-h-[800px] object-contain bg-white shadow-lg"
                />
              )
            ) : (
              <div className="text-center text-slate-300 bg-slate-800/50 p-10 rounded-xl">
                <FileText size={48} className="mx-auto mb-3 opacity-50" />
                <p className="text-sm font-medium">Dokumen Belum Tersedia</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}