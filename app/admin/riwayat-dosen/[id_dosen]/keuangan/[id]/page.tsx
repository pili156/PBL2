// app/admin/riwayat-dosen/[id_dosen]/keuangan/[id]/page.tsx
import { prisma } from '@/lib/prisma';
import { ArrowLeft, Download, FileText, Check, Send, Star, Info, XCircle, CheckSquare } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { evaluateKeuangan, acceptKeuangan, rejectKeuangan } from '../../../actions';

export const dynamic = 'force-dynamic';

export default async function DetailKeuanganPage({
  params,
}: {
  params: Promise<{ id_dosen: string; id: string }>;
}) {
  const { id_dosen, id } = await params;
  const keuanganId = Number(id);
  const idDosen = Number(id_dosen);

  if (isNaN(keuanganId)) notFound();

  const keuangan = await prisma.pengajuanReimbursement.findUnique({
    where: { id: keuanganId },
    include: {
      pengajuan_studi: {
        include: {
          user: { include: { master_dosen: true } },
        },
      },
    },
  });

  if (!keuangan) notFound();

  const status = keuangan.status_pencairan?.toUpperCase() || 'PENDING';
  const isSelesai = status === 'DICAIRKAN' || status === 'SELESAI';
  const isDitolak = status === 'DITOLAK';
  const isVerifikasi = status !== 'PENDING' && status !== 'DRAFT'; 

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
  };

  return (
    <div className="w-full space-y-6">
      
      {/* 1. HEADER & STATUS (Full Width) */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-bold text-slate-800">Detail Pengajuan Keuangan</h2>
          <span className={`px-3 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider ${isSelesai ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
            {status}
          </span>
        </div>
        <Link href={`/admin/riwayat-dosen/${idDosen}/keuangan`} className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-blue-600 transition-all group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Kembali
        </Link>
      </div>

      {/* 2. TOP SUMMARY CARDS (3 Columns Berjajar) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Semester</p>
          <p className="text-lg font-bold text-slate-800 font-mono">Semester {keuangan.semester_ke}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Nominal</p>
          <p className="text-lg font-bold text-blue-600">{keuangan.nominal ? formatRupiah(Number(keuangan.nominal)) : '-'}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Tanggal Pengajuan</p>
          <p className="text-lg font-bold text-slate-800">
            {keuangan.created_at ? keuangan.created_at.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
          </p>
        </div>
      </div>

      {/* 3. MAIN CONTENT (Split View) */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* LEFT SIDE: Tracking & Catatan */}
        <div className="space-y-6">
          
          {/* Tracking Section */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
            <h4 className="text-sm font-bold text-slate-800 mb-8 pb-4 border-b border-slate-50">Tracking Pengajuan</h4>
            <div className="space-y-8 relative">
              <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-slate-100"></div>

              {[
                { label: 'Upload Bukti Pembayaran', sub: 'Oleh Dosen', date: keuangan.created_at, icon: Check, color: 'bg-emerald-500', active: true },
                { label: 'Diverifikasi Admin', sub: 'Oleh Admin', date: isVerifikasi ? keuangan.updated_at : null, icon: Check, color: isVerifikasi ? 'bg-emerald-500' : 'bg-slate-200', active: isVerifikasi },
                { label: 'Disetujui', sub: 'Oleh Admin', date: isVerifikasi ? keuangan.updated_at : null, icon: Check, color: isVerifikasi ? 'bg-emerald-500' : 'bg-slate-200', active: isVerifikasi },
                { label: 'Dana Ditransfer', sub: 'Oleh Keuangan', date: isSelesai ? keuangan.tanggal_pencairan : null, icon: Send, color: isSelesai ? 'bg-blue-600' : 'bg-slate-200', active: isSelesai },
                { label: 'Selesai', sub: isSelesai ? 'Proses Selesai' : 'Menunggu konfirmasi', date: isSelesai ? keuangan.tanggal_pencairan : null, icon: Star, color: isSelesai ? 'bg-emerald-500' : 'bg-slate-200', active: isSelesai },
              ].map((step, i) => (
                <div key={i} className="relative flex gap-6 items-start">
                  <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-white shadow-sm border-4 border-white ${step.color}`}>
                    <step.icon size={14} strokeWidth={3} />
                  </div>
                  <div className="flex-1 flex justify-between items-start">
                    <div>
                      <p className={`text-sm font-bold ${step.active ? 'text-slate-800' : 'text-slate-400'}`}>{step.label}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{step.sub}</p>
                    </div>
                    {step.date && <p className="text-[10px] text-slate-400 font-medium">
                      {step.date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })} WIB
                    </p>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Admin Evaluation Form */}
          <form className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 space-y-5">
            <h4 className="text-sm font-bold text-slate-800">Tindakan & Catatan Admin</h4>
            <input type="hidden" name="keuanganId" value={keuanganId} />
            <textarea
              name="catatan"
              className="w-full text-sm p-4 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none min-h-[120px] transition-all"
              placeholder="Tambahkan catatan audit dana di sini..."
              defaultValue={keuangan.catatan_keuangan || ''}
            ></textarea>
            <div className="grid grid-cols-2 gap-4">
              <button type="submit" formAction={acceptKeuangan}
                className="py-3 bg-emerald-500 text-white rounded-xl text-xs font-bold hover:bg-emerald-600 shadow-md shadow-emerald-100 transition-all flex items-center justify-center gap-2 uppercase tracking-widest">
                DITERIMA <CheckSquare size={16} />
              </button>
              <button type="submit" formAction={rejectKeuangan}
                className="py-3 bg-white text-red-600 border border-red-100 rounded-xl text-xs font-bold hover:bg-red-50 transition-all flex items-center justify-center gap-2 uppercase tracking-widest">
                DITOLAK <XCircle size={16} />
              </button>
            </div>
          </form>
        </div>

        {/* RIGHT SIDE: Bukti Pembayaran (Full Height Preview) */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm flex flex-col min-h-[600px]">
          <div className="p-5 border-b border-slate-50 flex justify-between items-center">
            <h4 className="text-sm font-bold text-slate-800">Bukti Pembayaran</h4>
            <a href={keuangan.file_bukti_bayar || '#'} target="_blank" className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-600 hover:text-white transition-all">
              <Download size={14} /> Download File
            </a>
          </div>
          <div className="flex-1 p-6 bg-slate-50 flex items-center justify-center overflow-hidden">
            <div className="w-full h-full bg-white rounded-xl shadow-inner relative flex items-center justify-center border border-slate-200 group">
              {keuangan.file_bukti_bayar ? (
                <img src={keuangan.file_bukti_bayar} alt="Bukti Transfer" className="max-w-full max-h-full object-contain p-4 group-hover:scale-[1.02] transition-transform duration-500" />
              ) : (
                <div className="text-center text-slate-300">
                  <FileText size={64} className="mx-auto mb-4 opacity-20" />
                  <p className="text-sm italic font-medium">File bukti pembayaran belum diunggah atau tidak dapat ditampilkan.</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* 4. FOOTER INFO BANNER */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-center gap-4">
        <Info className="text-blue-500 flex-shrink-0" size={20} />
        <p className="text-xs text-blue-800 font-medium">
          Sistem mendeteksi pengajuan ini sebagai <strong>Reimbursement Biaya Studi</strong>. Pastikan nominal dan bukti transfer sudah sesuai dengan SK yang berlaku sebelum melakukan verifikasi.
        </p>
      </div>

    </div>
  );
}