// app/admin/riwayat-dosen/[id_dosen]/keuangan/[id]/page.tsx
import { prisma } from '@/src/lib/prisma';
import { ArrowLeft, Download, CheckSquare, XCircle, FileText, Info } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { acceptKeuangan, rejectKeuangan } from '../../../actions';

export const dynamic = 'force-dynamic';

export default async function DetailKeuanganPage({ params }: { params: Promise<{ id_dosen: string; id: string }> }) {
  const { id_dosen, id } = await params;
  const keuanganId = Number(id);
  const idDosen = Number(id_dosen);

  if (isNaN(keuanganId)) notFound();

  const keuangan = await prisma.pengajuanReimbursement.findUnique({
    where: { id: keuanganId },
    include: { pengajuan_studi: { include: { user: { include: { master_dosen: true } } } } },
  });

  if (!keuangan) notFound();

  const statusText = keuangan.status_pencairan?.toUpperCase() || 'PENDING';
  let statusStyle = 'text-amber-700 bg-amber-100';
  if (statusText === 'DICAIRKAN' || statusText === 'SELESAI') statusStyle = 'text-emerald-700 bg-emerald-100';
  else if (statusText === 'DITOLAK') statusStyle = 'text-red-700 bg-red-100';

  const formatRupiah = (angka: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
  const formatDate = (date: Date | null) => date ? date.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : '-';

  return (
    <div className="w-full space-y-6 pt-4">
      
      {/* HEADER */}
      <div className="flex justify-between items-center pb-2 border-b border-slate-100">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Detail Evaluasi Pencairan</h2>
          <p className="text-sm text-slate-500 mt-1">Tahap {keuangan.semester_ke}</p>
        </div>
        <Link href={`/admin/riwayat-dosen/${idDosen}/keuangan`} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-50 transition-colors shadow-sm">
          <ArrowLeft size={16} /> Kembali
        </Link>
      </div>

      {/* SPLIT SCREEN CONTENT (KIRI: Form & Info, KANAN: Bukti Bayar) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        
        {/* KIRI (Info & Form) */}
        <div className="xl:col-span-1 space-y-6">
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
          <h3 className="text-sm font-bold text-slate-800 mb-6">Informasi Pencairan</h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2 text-sm border-b border-slate-50 pb-2">
              <span className="text-slate-500">Tahap</span>
              <span className="font-bold text-slate-800 text-right">Tahap {keuangan.semester_ke}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm border-b border-slate-50 pb-2">
              <span className="text-slate-500">Nominal</span>
              <span className="font-bold text-blue-600 text-right">{keuangan.nominal ? formatRupiah(Number(keuangan.nominal)) : '-'}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm border-b border-slate-50 pb-2">
              <span className="text-slate-500">Tgl Pengajuan</span>
              <span className="font-bold text-slate-800 text-right">{formatDate(keuangan.created_at)}</span>
            </div>
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tujuan Rekening</p>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <p className="text-xs font-bold text-slate-800">
                  {keuangan.pengajuan_studi.user.master_dosen?.nama_bank || 'Bank Belum Diatur'}
                </p>
                <p className="text-sm font-mono font-semibold text-blue-600 mt-1">
                  {keuangan.pengajuan_studi.user.master_dosen?.nomor_rekening || '-'}
                </p>
                <p className="text-[10px] text-slate-500 mt-1">a.n. {keuangan.pengajuan_studi.user.master_dosen?.nama_lengkap}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm border-t border-slate-50 pt-2 items-center">
              <span className="text-slate-500">Status Verifikasi</span>
              <span className={`px-2 py-0.5 text-[10px] rounded font-bold uppercase tracking-wider text-center ${statusStyle}`}>
                {statusText}
              </span>
            </div>
          </div>
          <div className="mt-6">
            <a 
              href={keuangan.file_bukti_bayar || '#'} 
              target="_blank" 
              rel="noopener noreferrer"
              className={`w-full flex items-center justify-center gap-2 py-2.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all ${!keuangan.file_bukti_bayar && 'opacity-50 pointer-events-none'}`}
            >
              <Download size={14} /> Download File Asli
            </a>
          </div>
        </div>

          <form className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 space-y-4">
            <h4 className="text-sm font-bold text-slate-800">Tindakan Admin</h4>
            <input type="hidden" name="keuanganId" value={keuanganId} />
            <textarea name="catatan" className="w-full text-sm p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none min-h-[90px]" placeholder="Tambahkan catatan audit..." defaultValue={keuangan.catatan_keuangan || ''}></textarea>
            <div className="grid grid-cols-2 gap-2">
              <button type="submit" formAction={acceptKeuangan} className="py-2.5 bg-emerald-500 text-white rounded-lg text-xs font-bold hover:bg-emerald-600 transition-all flex items-center justify-center gap-1.5">
                <CheckSquare size={14} /> SETUJUI
              </button>
              <button type="submit" formAction={rejectKeuangan} className="py-2.5 bg-white text-red-600 border border-red-200 rounded-lg text-xs font-bold hover:bg-red-50 transition-all flex items-center justify-center gap-1.5">
                <XCircle size={14} /> TOLAK
              </button>
            </div>
          </form>
        </div>

        {/* KANAN (Preview Bukti) */}
        <div className="xl:col-span-2 bg-white rounded-xl border border-slate-100 shadow-sm flex flex-col min-h-[500px]">
          <div className="p-4 border-b border-slate-100 bg-slate-800 rounded-t-xl">
            <h3 className="text-sm font-semibold text-white text-center">Preview Bukti Pembayaran</h3>
          </div>
          <div className="flex-1 p-6 bg-[#525659] flex items-center justify-center rounded-b-xl">
            {keuangan.file_bukti_bayar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={keuangan.file_bukti_bayar} alt="Bukti Transfer" className="max-w-full max-h-[600px] object-contain bg-white shadow-lg" />
            ) : (
              <div className="text-center text-slate-300">
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