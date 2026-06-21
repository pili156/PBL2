import { prisma } from '@/src/lib/prisma';
import { FileText, Check, Send, Star, Info, XCircle, CheckSquare, Banknote, Calendar, Building, User } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { acceptKeuangan, rejectKeuangan, uploadBuktiTransfer } from '../../../actions';
import DocumentViewerSection from './DocumentViewerSection';
import { formatRupiah, formatDateLong, formatDateTime } from '@/src/lib/formatters';
import StatusBadge from "@/src/components/StatusBadge";

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id_dosen: string; id: string }>;
}

const TrackingStep = ({
  icon: Icon, label, sub, date, active, done,
}: {
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  label: string; sub: string; date: Date | null | undefined; active: boolean; done: boolean;
}) => {
  const fd = date ? formatDateTime(date instanceof Date ? date : new Date(date)) : '';
  return (
    <div className="relative flex gap-4 items-start group">
      <div className="relative z-10 flex-shrink-0">
        <div className={`w-9 h-9 rounded-full flex items-center justify-center shadow-sm border-4 border-white transition-all ${
          done ? 'bg-emerald-500 text-white' : active ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-300'
        }`}>
          <Icon size={15} strokeWidth={3} />
        </div>
      </div>
      <div className="flex-1 min-w-0 pb-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className={`text-sm font-semibold ${done || active ? 'text-slate-800' : 'text-slate-400'}`}>{label}</p>
            <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
          </div>
          {fd && <span className="text-[10px] text-slate-400 font-medium flex-shrink-0 text-right">{fd}</span>}
        </div>
      </div>
    </div>
  );
};

export default async function DetailKeuanganPage({ params }: Props) {
  const { id_dosen, id } = await params;
  const keuanganId = Number(id);
  const idDosen = Number(id_dosen);

  if (isNaN(keuanganId) || isNaN(idDosen)) notFound();

  const keuangan = await prisma.pengajuanReimbursement.findUnique({
    where: { id: keuanganId },
    include: {
      pengajuan_studi: { include: { user: { include: { master_dosen: true } } } },
      dokumen_pengajuan: {
        include: { master_dokumen: true },
      },
    },
  });

  if (!keuangan) notFound();

  const status = keuangan.status_pencairan?.toLowerCase() || 'pending';
  const isSelesai = status === 'dicairkan' || status === 'selesai';
  const isVerifikasi = status === 'dicairkan' || status === 'pending' || status === 'selesai';
  const hasBuktiTransfer = keuangan.file_bukti_bayar !== null;
  const allDocsVerified = keuangan.dokumen_pengajuan.length > 0 &&
    keuangan.dokumen_pengajuan.every(d => d.status_verifikasi === 'terverifikasi');
  const bank = keuangan.nama_bank || '-';
  const norek = keuangan.nomor_rekening || '-';


  const steps = [
    { icon: Check, label: 'Upload Bukti', sub: 'Dokumen pembayaran diunggah', date: keuangan.created_at, active: true, done: true },
    { icon: Check, label: 'Verifikasi Admin', sub: allDocsVerified ? 'Berkas dan nominal diverifikasi' : 'Menunggu verifikasi dokumen', date: allDocsVerified ? keuangan.updated_at : null, active: allDocsVerified, done: allDocsVerified },
    { icon: Send, label: 'Dana Ditransfer', sub: hasBuktiTransfer ? (isSelesai ? 'Transfer ke rekening tujuan' : 'Menunggu konfirmasi') : 'Upload bukti transfer', date: isSelesai ? keuangan.tanggal_pencairan : null, active: hasBuktiTransfer, done: hasBuktiTransfer && isSelesai },
    { icon: Star, label: 'Selesai', sub: isSelesai ? 'Pencairan berhasil' : 'Menunggu', date: isSelesai ? keuangan.tanggal_pencairan : null, active: isSelesai, done: isSelesai },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white rounded-xl border border-slate-100 shadow-sm px-5 py-4">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Detail Pencairan</h2>
            <p className="text-sm text-slate-400 mt-0.5">Semester {keuangan.semester_ke || '-'}</p>
          </div>
          <StatusBadge status={keuangan.status_pencairan} domain="pencairan" size="md" dot />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 items-start">
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
            <h4 className="text-sm font-semibold text-slate-800 mb-5">Informasi Pencairan</h4>
            <div className="space-y-3">
              <InfoItem icon={Banknote} label="Nominal" value={keuangan.nominal ? formatRupiah(Number(keuangan.nominal)) : '-'} valueClass="text-blue-600 font-bold" />
              <InfoItem icon={Calendar} label="Tanggal Pengajuan" value={formatDateLong(keuangan.created_at)} />
              <InfoItem icon={Calendar} label="Tanggal Transfer" value={keuangan.tanggal_pencairan ? formatDateLong(keuangan.tanggal_pencairan) : '-'} />
              <InfoItem icon={Building} label="Bank Tujuan" value={bank} />
              <InfoItem icon={User} label="Nomor Rekening" value={norek} valueClass="font-mono" />
              <InfoItem icon={FileText} label="Semester" value={`Semester ${keuangan.semester_ke || '-'}`} />
            </div>
            {keuangan.catatan_keuangan && (
              <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                <p className="text-[10px] text-slate-400 font-medium mb-1">Catatan Keuangan</p>
                <p className="text-xs text-slate-700">{keuangan.catatan_keuangan}</p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
            <h4 className="text-sm font-semibold text-slate-800 mb-4">Tracking Proses</h4>
            <div className="relative">
              <div className="absolute left-[17px] top-2 bottom-2 w-0.5 bg-slate-100" />
              <div className="space-y-1">
                {steps.map((step, i) => <TrackingStep key={i} {...step} />)}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
            <h4 className="text-sm font-semibold text-slate-800 mb-4">Upload Bukti Transfer</h4>
            {keuangan.file_bukti_bayar ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg">
                  <CheckSquare size={16} className="text-emerald-600 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-emerald-700">Bukti transfer sudah diunggah</p>
                    <a href={keuangan.file_bukti_bayar} target="_blank" rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline mt-0.5 inline-block font-medium">
                      Lihat file
                    </a>
                  </div>
                </div>
              </div>
            ) : !allDocsVerified ? (
              <div className="p-4 bg-amber-50 border border-amber-100 rounded-lg flex items-center gap-3">
                <Info size={16} className="text-amber-600 flex-shrink-0" />
                <p className="text-xs text-amber-800 font-medium">
                  Semua dokumen harus terverifikasi terlebih dahulu sebelum mengunggah bukti transfer.
                </p>
              </div>
            ) : (
              <form action={uploadBuktiTransfer} encType="multipart/form-data" className="space-y-4">
                <input type="hidden" name="keuanganId" value={keuanganId} />
                <input type="hidden" name="idDosen" value={idDosen} />
                <div>
                  <input
                    type="file"
                    name="fileBukti"
                    accept=".pdf,.jpg,.jpeg,.png"
                    required
                    className="w-full text-sm p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all"
                  />
                  <p className="text-[10px] text-slate-400 mt-1.5">Format: PDF, JPG, PNG. Maks 5MB.</p>
                </div>
                <button type="submit"
                  className="w-full py-2.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
                  <Send size={15} /> Upload Bukti Transfer
                </button>
              </form>
            )}
          </div>

          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
            <h4 className="text-sm font-semibold text-slate-800 mb-4">Verifikasi Admin</h4>
            {keuangan.file_bukti_bayar ? (
              <form className="space-y-4">
                <input type="hidden" name="keuanganId" value={keuanganId} />
                <textarea name="catatan"
                  className="w-full text-sm p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 min-h-[80px] transition-all"
                  placeholder="Catatan verifikasi..."
                  defaultValue={keuangan.catatan_keuangan || ''} />
                <div className="grid grid-cols-2 gap-3">
                  <button type="submit" formAction={acceptKeuangan}
                    className="py-2.5 bg-emerald-500 text-white rounded-lg text-xs font-bold hover:bg-emerald-600 transition-all flex items-center justify-center gap-2">
                    <CheckSquare size={15} /> Terima
                  </button>
                  <button type="submit" formAction={rejectKeuangan}
                    className="py-2.5 bg-white text-red-600 border border-red-200 rounded-lg text-xs font-bold hover:bg-red-50 transition-all flex items-center justify-center gap-2">
                    <XCircle size={15} /> Tolak
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-4 bg-amber-50 border border-amber-100 rounded-lg flex items-center gap-3">
                <Info size={16} className="text-amber-600 flex-shrink-0" />
                <p className="text-xs text-amber-800 font-medium">
                  Upload bukti transfer terlebih dahulu sebelum melakukan verifikasi.
                </p>
              </div>
            )}
          </div>
        </div>

        <DocumentViewerSection documents={keuangan.dokumen_pengajuan} />
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-xl px-5 py-3.5 flex items-start gap-3">
        <Info size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-blue-800 font-medium">
          Pastikan nominal dan data rekening sesuai sebelum melakukan verifikasi.
        </p>
      </div>
    </div>
  );
}

const InfoItem = ({ icon: Icon, label, value, valueClass }: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string; value: string; valueClass?: string;
}) => (
  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
    <div className="p-2 bg-white rounded-lg shadow-sm"><Icon size={15} className="text-slate-400" /></div>
    <div>
      <p className="text-[10px] text-slate-400 font-medium">{label}</p>
      <p className={`text-sm text-slate-800 ${valueClass || 'font-medium'}`}>{value}</p>
    </div>
  </div>
);
