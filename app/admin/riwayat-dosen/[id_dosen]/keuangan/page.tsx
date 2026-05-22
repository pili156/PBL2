// app/admin/riwayat-dosen/[id_dosen]/keuangan/page.tsx
import { prisma } from '@/src/lib/prisma';
import { Info, Download, Cloud, Plus, CheckCircle2, Clock, MapPin } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface RiwayatKeuanganTabProps {
  params: Promise<{ id_dosen: string }>;
}

export default async function RiwayatKeuanganTab({ params }: RiwayatKeuanganTabProps) {
  const { id_dosen } = await params;
  const idDosen = Number(id_dosen);

  if (isNaN(idDosen)) notFound();

  // Fetch Daftar Keuangan
  const keuanganList = await prisma.pengajuanReimbursement.findMany({
    where: { pengajuan_studi: { user_id: idDosen } },
    orderBy: { created_at: 'asc' },
  });

  const totalDisetujui = 50000000; // Asumsi pagu bantuan dari DB/Sistem
  const totalDicairkan = keuanganList
    .filter((k: any) => k.status_pencairan === 'DICAIRKAN' || k.status_pencairan === 'SELESAI')
    .reduce((total: number, k: any) => total + Number(k.nominal || 0), 0);
  const sisaBantuan = totalDisetujui - totalDicairkan;

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
  };

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return '-';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER TAB */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white rounded-xl border border-slate-100 shadow-sm p-4 sm:px-6">
        <div>
          <h3 className="text-base font-bold text-slate-800">Riwayat Keuangan</h3>
          <p className="text-xs text-slate-500 mt-1">Riwayat bantuan studi dan pencairan dana</p>
        </div>
        <Link href={`/admin/riwayat-dosen/${idDosen}/keuangan/tambah`} className="flex items-center justify-center gap-2 bg-blue-600 text-white text-xs font-bold px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
          <Plus size={14} /> Tambah Pencairan
        </Link>
      </div>

      {/* 2 KOLOM GRID: KIRI (Timeline & Tabel) - KANAN (Info & Catatan) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* KOLOM KIRI (Lebar) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Timeline Horizontal (Tracking Pencairan) */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
            <h4 className="text-sm font-bold text-slate-800 mb-8">Tracking Pencairan Bantuan</h4>
            <div className="relative flex justify-between items-start w-full px-2 overflow-x-auto pb-2">
              <div className="absolute top-4 left-8 right-8 h-[2px] bg-slate-100 -z-10 min-w-[400px]"></div>
              <div className="absolute top-4 left-8 h-[2px] bg-emerald-500 -z-10 transition-all w-[75%] min-w-[300px]"></div>
              
              {[
                { label: 'Pengajuan Dibuat', sub: '10 Agu 2023', done: true },
                { label: 'Dokumen Diverifikasi', sub: '15 Agu 2023', done: true },
                { label: 'Disetujui Pimpinan', sub: '20 Agu 2023', done: true },
                { label: 'Diproses Keuangan', sub: '21 Agu 2023', active: true },
                { label: 'Dana Dicairkan', sub: 'Menunggu', done: false },
              ].map((step: any, i: number) => (
                <div key={i} className="flex flex-col items-center w-24 bg-white min-w-[90px]">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-3 border-4 border-white shadow-sm ${step.done ? 'bg-emerald-500 text-white' : step.active ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                    {step.done ? <CheckCircle2 size={16} /> : step.active ? <Clock size={16} /> : <MapPin size={16} />}
                  </div>
                  <p className={`text-[10px] font-bold text-center leading-tight ${step.active || step.done ? 'text-slate-800' : 'text-slate-400'}`}>{step.label}</p>
                  <p className="text-[9px] text-slate-400 text-center mt-1">{step.sub}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Tabel Riwayat Pencairan */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
            <h4 className="text-sm font-bold text-slate-800 mb-4">Riwayat Pencairan</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-3 pr-4 w-10">No</th>
                    <th className="py-3 pr-4">Tahap</th>
                    <th className="py-3 pr-4">Nominal</th>
                    <th className="py-3 pr-4">Tgl Transfer</th>
                    <th className="py-3 pr-4 text-center">Aksi</th>
                    <th className="py-3 pl-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {keuanganList.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-500 text-xs">Belum ada pengajuan keuangan.</td>
                    </tr>
                  ) : (
                    keuanganList.map((k: any, index: number) => {
                      const statusText = (k.status_pencairan ?? 'PENDING').toUpperCase();
                      let statusStyle = 'bg-amber-100 text-amber-700';
                      if (statusText === 'DICAIRKAN' || statusText === 'SELESAI') statusStyle = 'bg-emerald-100 text-emerald-700';
                      else if (statusText === 'DRAFT') statusStyle = 'bg-slate-100 text-slate-600';
                      else if (statusText === 'DITOLAK' || statusText === 'DIBATALKAN') statusStyle = 'bg-red-100 text-red-700';

                      return (
                        <tr key={k.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                          <td className="py-3 pr-4 text-xs font-medium text-slate-500">{index + 1}</td>
                          <td className="py-3 pr-4 text-xs font-bold text-slate-800">Tahap {k.semester_ke}</td>
                          <td className="py-3 pr-4 text-xs font-bold text-slate-800">{k.nominal ? formatRupiah(Number(k.nominal)) : '-'}</td>
                          <td className="py-3 pr-4 text-xs text-slate-500">{formatDate(k.tanggal_pencairan || k.created_at)}</td>
                          <td className="py-3 pr-4 flex justify-center">
                            <Link href={`/admin/riwayat-dosen/${idDosen}/keuangan/${k.id}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded text-[10px] font-bold hover:bg-blue-600 hover:text-white transition-colors">
                              Detail
                            </Link>
                          </td>
                          <td className="py-3 pl-2">
                            <span className={`inline-block px-2 py-0.5 text-[9px] rounded font-bold uppercase tracking-wider ${statusStyle}`}>
                              {statusText}
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

        {/* KOLOM KANAN (Kecil) */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Ringkasan Bantuan List */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
            <h4 className="text-sm font-bold text-slate-800 mb-4">Rincian Bantuan Studi</h4>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b border-slate-50 pb-2">
                <span className="text-slate-500 text-xs">Total Disetujui</span>
                <span className="font-bold text-slate-800 text-xs">{formatRupiah(totalDisetujui)}</span>
              </div>
              <div className="flex justify-between border-b border-slate-50 pb-2">
                <span className="text-slate-500 text-xs">Total Sudah Cair</span>
                <span className="font-bold text-emerald-600 text-xs">{formatRupiah(totalDicairkan)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 text-xs">Sisa Bantuan</span>
                <span className="font-bold text-amber-600 text-xs">{formatRupiah(sisaBantuan)}</span>
              </div>
            </div>
          </div>

          {/* Banner Catatan */}
          <div className="bg-[#FFFDF5] border border-amber-200/60 rounded-xl p-5 shadow-sm">
            <div className="flex gap-2 items-start">
              <Info className="text-amber-500 mt-0.5 flex-shrink-0" size={16} />
              <div>
                <h4 className="text-xs font-bold text-amber-900 mb-1">Catatan</h4>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  Pencairan tahap selanjutnya akan diproses setelah penyampaian KHS semester berjalan disetujui.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}