// app/admin/riwayat-dosen/[id_dosen]/keuangan/[id]/page.tsx

import { prisma } from '@/lib/prisma';
import { ArrowLeft, Download, FileText, AlertCircle, CheckSquare, XSquare } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

const formatRupiah = (angka: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(angka);
};

export default async function DetailKeuanganPage({
  params,
}: {
  params: Promise<{ id_dosen: string; id: string }>;
}) {
  const { id_dosen, id } = await params;
  const keuanganId = Number(id);
  const idDosen = Number(id_dosen);

  if (isNaN(keuanganId)) {
    notFound();
  }

  const keuangan = await prisma.pengajuanReimbursement.findUnique({
    where: { id: keuanganId },
    include: {
      pengajuan_studi: {
        include: {
          jenis_studi: true,
          user: {
            include: { master_dosen: true },
          },
        },
      },
    },
  });

  if (!keuangan) {
    notFound();
  }

  const dosen = keuangan.pengajuan_studi?.user;
  const namaDosen = dosen?.master_dosen?.nama_lengkap || dosen?.username || '-';
  const nip = dosen?.master_dosen?.nip || '-';
  const jurusan = dosen?.master_dosen?.jurusan || '-';
  const jenisBiaya = keuangan.pengajuan_studi?.jenis_studi?.nama_jenis || 'SPP';

  return (
    <div className="bg-white rounded-b-xl border border-slate-200 border-t-0 p-6 md:p-8">
      
      {/* HEADER: Judul & Tombol Kembali ditarik ke kanan */}
      <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-6">
        <h3 className="text-2xl font-bold text-slate-800">
          Detail Pengajuan Reimbursement
        </h3>
        <Link
          href={`/admin/riwayat-dosen/${idDosen}/keuangan`}
          className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft size={18} />
          Kembali
        </Link>
      </div>

      {/* GRID 2 KOLOM (Sesuai Desain UI) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* KOLOM KIRI: Data Dosen & Catatan Evaluasi */}
        <div className="space-y-6">
          
          {/* Box 1: Data Dosen */}
          <div className="border border-slate-200 rounded-xl p-6">
            <h4 className="font-bold text-slate-800 border-b border-slate-100 pb-3 mb-4">Data Dosen</h4>
            
            <div className="space-y-3.5">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500">Nama Dosen</span>
                <span className="text-sm font-bold text-slate-800">{namaDosen}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500">NIP</span>
                <span className="text-sm font-bold text-slate-800">{nip}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500">Program Studi / Jurusan</span>
                <span className="text-sm font-bold text-slate-800">{jurusan}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500">Jenis Biaya</span>
                <span className="text-sm font-bold text-slate-800">{jenisBiaya} Semester {keuangan.semester_ke} 2025</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500">Semester</span>
                <span className="text-sm font-bold text-slate-800">Semester {keuangan.semester_ke}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500">Tanggal Upload</span>
                <span className="text-sm font-bold text-slate-800">
                  {keuangan.created_at
                    ? keuangan.created_at.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                    : '-'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500">Nominal Diajukan</span>
                <span className="text-sm font-bold text-slate-800">
                  {keuangan.nominal ? formatRupiah(Number(keuangan.nominal)) : 'Rp 0'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500">Bank</span>
                <span className="text-sm font-bold text-slate-800">BCA - 1234 2435 3456 3456</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-sm text-slate-500">Status Pengajuan</span>
                <span
                  className={`inline-block px-3 py-1 text-xs rounded-md font-bold ${
                    keuangan.status_pencairan === 'Dicairkan' || keuangan.status_pencairan === 'Selesai'
                      ? 'bg-green-100 text-green-700'
                      : keuangan.status_pencairan === 'Dibatalkan' || keuangan.status_pencairan === 'Ditolak'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {keuangan.status_pencairan?.toUpperCase() || 'DITERIMA'}
                </span>
              </div>
            </div>
          </div>

          {/* Box 2: Catatan Evaluasi & Aksi */}
          <div className="border border-slate-200 rounded-xl p-6">
            <h4 className="font-bold text-slate-800 border-b border-slate-100 pb-3 mb-4">Catatan Evaluasi</h4>
            
            <textarea 
              className="w-full border border-slate-200 rounded-lg p-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4 resize-none"
              rows={4}
              placeholder="Tulis alasan revisi atau catatan di sini..."
              defaultValue={keuangan.catatan_keuangan || ''}
            ></textarea>

            {/* Banner Peringatan */}
            <div className="bg-[#FFFDF5] border border-yellow-200 rounded-lg p-3 flex items-start gap-3 mb-5">
              <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={16} />
              <p className="text-xs text-slate-600">
                Setelah menyetujui pengajuan, pastikan melakukan transfer ke rekening dosen yang terdaftar.
              </p>
            </div>

            {/* Tombol Aksi (DITERIMA / DITOLAK) */}
            <div className="flex gap-3">
              <button className="flex-1 flex items-center justify-center gap-2 bg-green-100 text-green-700 border border-green-200 font-bold py-2.5 rounded-lg hover:bg-green-200 transition-colors">
                DITERIMA <CheckSquare size={18} />
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 bg-red-50 text-red-600 border border-red-100 font-bold py-2.5 rounded-lg hover:bg-red-100 transition-colors">
                DITOLAK <AlertCircle size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* KOLOM KANAN: Bukti Pembayaran */}
        <div className="border border-slate-200 rounded-xl p-6 flex flex-col h-full">
          <h4 className="font-bold text-slate-800 border-b border-slate-100 pb-3 mb-4">Bukti Pembayaran</h4>
          
          {/* Area Preview Dokumen */}
          <div className="flex-1 border border-slate-200 rounded-xl bg-slate-50 flex flex-col items-center justify-center p-8 text-center min-h-[500px] relative overflow-hidden">
            {keuangan.file_bukti_bayar ? (
              <>
                {/* Asumsi file berupa gambar (receipt). Jika PDF, bisa pakai iframe */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={keuangan.file_bukti_bayar} 
                  alt="Bukti Pembayaran" 
                  className="absolute inset-0 w-full h-full object-contain p-2"
                />
              </>
            ) : (
              <>
                <FileText size={48} className="text-slate-300 mb-4" />
                <p className="text-sm font-semibold text-slate-500 mb-1">Dokumen Belum Tersedia</p>
                <p className="text-xs text-slate-400">Dosen belum mengunggah file bukti pembayaran.</p>
              </>
            )}
          </div>

          {/* Tombol Download di bawah preview */}
          <div className="mt-4 pt-4 border-t border-slate-100">
            <a
              href={keuangan.file_bukti_bayar || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center justify-center gap-2 w-max text-sm font-bold text-blue-600 border border-blue-200 bg-white px-4 py-2.5 rounded-lg hover:bg-blue-50 transition-colors ${!keuangan.file_bukti_bayar && 'opacity-50 cursor-not-allowed pointer-events-none'}`}
            >
              Download Dokumen <Download size={16} />
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}