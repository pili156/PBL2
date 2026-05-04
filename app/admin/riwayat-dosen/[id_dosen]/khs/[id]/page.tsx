// app/admin/riwayat-dosen/[id_dosen]/khs/[id]/page.tsx

import { prisma } from '@/lib/prisma';
import { ArrowLeft, Download, FileText, AlertCircle, CheckSquare } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function DetailKhsPage({
  params,
}: {
  params: Promise<{ id_dosen: string; id: string }>;
}) {
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

  const dosen = khs.pengajuan_studi?.user;
  const namaDosen = dosen?.master_dosen?.nama_lengkap || dosen?.username || '-';
  const nip = dosen?.master_dosen?.nip || '-';
  const jurusan = dosen?.master_dosen?.jurusan || '-';

  return (
    <div className="bg-white rounded-b-xl border border-slate-200 border-t-0 p-6 md:p-8">
      
      {/* HEADER DETAIL */}
      <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-6">
        <h3 className="text-2xl font-bold text-slate-800">
          KHS Semester {khs.semester_ke}
        </h3>
        <Link
          href={`/admin/riwayat-dosen/${idDosen}/khs`}
          className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft size={18} />
          Kembali
        </Link>
      </div>

      {/* GRID 2 KOLOM (Sesuai Desain UI Baru) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* KOLOM KIRI: Terbagi jadi 3 Kotak */}
        <div className="space-y-6">
          
          {/* Box 1: Data Dosen */}
          <div className="border border-slate-200 rounded-xl p-6">
            <h4 className="font-bold text-slate-800 border-b border-slate-100 pb-3 mb-4">Data Dosen</h4>
            
            <div className="flex items-start gap-6">
              {/* Avatar */}
              <div className="w-16 h-16 rounded-full bg-slate-200 flex-shrink-0 mt-1"></div>
              
              {/* List Data */}
              <div className="space-y-4 w-full">
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">Nama Dosen</p>
                  <p className="text-sm font-bold text-slate-800">{namaDosen}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">NIP</p>
                  <p className="text-sm font-bold text-slate-800">{nip}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">Program Studi / Jurusan</p>
                  <p className="text-sm font-bold text-slate-800">{jurusan}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">Semester</p>
                  <p className="text-sm font-bold text-slate-800">Semester {khs.semester_ke}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">IPK</p>
                  <p className="text-sm font-bold text-slate-800">
                    {khs.ipk ? Number(khs.ipk).toFixed(2) : '-'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Box 2: Keputusan Verifikasi */}
          <div className="border border-slate-200 rounded-xl p-6">
            <h4 className="font-bold text-slate-800 border-b border-slate-100 pb-3 mb-4">Keputusan Verifikasi</h4>
            <div className="flex gap-4">
              <button className="flex items-center justify-center gap-2 bg-green-100 text-green-700 border border-green-200 font-bold px-6 py-2.5 rounded-lg hover:bg-green-200 transition-colors">
                DITERIMA <CheckSquare size={18} />
              </button>
              <button className="flex items-center justify-center gap-2 bg-red-50 text-red-600 border border-red-100 font-bold px-6 py-2.5 rounded-lg hover:bg-red-100 transition-colors">
                DITOLAK <AlertCircle size={18} />
              </button>
            </div>
          </div>

          {/* Box 3: Catatan Evaluasi */}
          <div className="border border-slate-200 rounded-xl p-6">
            <h4 className="font-bold text-slate-800 border-b border-slate-100 pb-3 mb-4">Catatan Evaluasi</h4>
            
            <textarea 
              className="w-full border border-slate-200 rounded-lg p-4 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4 resize-none"
              rows={4}
              placeholder="Tulis alasan revisi atau catatan di sini..."
              defaultValue={khs.catatan_evaluasi || ''}
            ></textarea>

            {/* Action Buttons Bawah */}
            <div className="flex gap-3">
              <button className="bg-slate-200 text-slate-600 font-bold px-6 py-2.5 rounded-lg hover:bg-slate-300 transition-colors text-sm">
                Batalkan
              </button>
              <button className="bg-[#007BFF] text-white font-bold px-6 py-2.5 rounded-lg hover:bg-blue-600 transition-colors text-sm">
                Kirim Revisi
              </button>
            </div>
          </div>

        </div>

        {/* KOLOM KANAN: Detail KHS (Bukti PDF) */}
        <div className="border border-slate-200 rounded-xl p-6 flex flex-col h-full">
          <h4 className="font-bold text-slate-800 border-b border-slate-100 pb-3 mb-4">Detail KHS</h4>
          
          {/* Area Preview Dokumen */}
          <div className="flex-1 border border-slate-200 rounded-xl bg-slate-50 flex flex-col items-center justify-center p-8 text-center min-h-[500px] relative overflow-hidden mb-4">
            {khs.file_khs_path ? (
              <>
                {/* Menampilkan Gambar/PDF secara penuh */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={khs.file_khs_path} 
                  alt="Dokumen KHS" 
                  className="absolute inset-0 w-full h-full object-contain p-2"
                />
              </>
            ) : (
              <>
                <FileText size={48} className="text-slate-300 mb-4" />
                <p className="text-sm font-semibold text-slate-500 mb-1">Dokumen Belum Tersedia</p>
                <p className="text-xs text-slate-400">Dosen belum mengunggah file KHS.</p>
              </>
            )}
          </div>

          {/* Tombol Download ditaruh di pojok kiri bawah sesuai desain UI */}
          <div>
            <a
              href={khs.file_khs_path || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-2 text-sm font-bold text-blue-600 border border-blue-200 bg-white px-4 py-2.5 rounded-lg hover:bg-blue-50 transition-colors ${!khs.file_khs_path && 'opacity-50 cursor-not-allowed pointer-events-none'}`}
            >
              Download Dokumen <Download size={16} />
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}