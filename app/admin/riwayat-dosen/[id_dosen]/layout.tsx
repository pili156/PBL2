// app/admin/riwayat-dosen/[id_dosen]/layout.tsx
import { prisma } from '@/lib/prisma';
import { Download, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import TabNavigation from './TabNavigation';

export const dynamic = 'force-dynamic';

export default async function DetailDosenLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id_dosen: string }>;
}) {
  const { id_dosen } = await params;
  const idDosen = Number(id_dosen);

  const dosen = await prisma.user.findUnique({
    where: { id: idDosen },
    include: {
      master_dosen: true,
      pengajuan_studi: {
        include: { monitoring_khs: true },
      },
    },
  });

  if (!dosen) {
    return (
      <div className="w-full text-center py-20">
        <h2 className="text-xl text-slate-700">Data Dosen tidak ditemukan.</h2>
        <Link href="/admin/riwayat-dosen" className="text-sigap-primary hover:underline mt-4 inline-block">
          Kembali ke Daftar Dosen
        </Link>
      </div>
    );
  }

  const namaDosen = dosen.master_dosen?.nama_lengkap || dosen.username;
  const nip = dosen.master_dosen?.nip || '-';
  const jurusan = dosen.master_dosen?.jurusan || '-';
  const tglBergabung = dosen.created_at 
    ? new Date(dosen.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) 
    : '10 Agustus 2020';

  // ✅ CLEAN IPK CALCULATION
  const allKhs = dosen.pengajuan_studi.flatMap(p => p.monitoring_khs);
  const validKhs = allKhs.filter(k => k.ipk !== null);

  const rataRataIpk =
    validKhs.length > 0
      ? (validKhs.reduce((acc, k) => acc + Number(k.ipk), 0) / validKhs.length).toFixed(2)
      : "0.00";

  return (
    <div className="w-full min-h-screen p-6 lg:p-8 bg-sigap-bg space-y-6">

      {/* HEADER */}
      <div className="space-y-2">
        <p className="text-sm text-slate-500">
          Dashboard {'>'} Data Dosen {'>'} <span className="text-slate-700 font-medium">Riwayat Dosen</span>
        </p>
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold text-slate-800">Riwayat Studi Dosen</h2>
          <button className="flex items-center gap-2 bg-sigap-primary text-white text-sm font-medium px-4 py-2 rounded-lg hover:opacity-90">
            <Download size={16} /> Export Excel
          </button>
        </div>
      </div>

      {/* CARD DOSEN (MIRIP UI) */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-base font-bold text-slate-800 mb-6">Data Dosen</h3>
        
        <div className="flex flex-col md:flex-row gap-6 md:gap-12 items-start md:items-center">
          {/* Avatar & Nama */}
          <div className="flex items-center gap-4 min-w-[220px]">
            <div className="w-14 h-14 rounded-full bg-slate-200 flex-shrink-0"></div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Nama Dosen</p>
              <p className="text-sm font-bold text-slate-800">{namaDosen}</p>
              <p className="text-xs text-slate-500 mt-3 mb-1">NIP</p>
              <p className="text-sm font-bold text-slate-800">{nip}</p>
            </div>
          </div>

          {/* Kampus & Prodi */}
          <div className="min-w-[180px]">
            <p className="text-xs text-slate-500 mb-1">Program Studi / Jurusan</p>
            <p className="text-sm font-bold text-slate-800">{jurusan}</p>
            <p className="text-xs text-slate-500 mt-3 mb-1">Kampus</p>
            <p className="text-sm font-bold text-slate-800">Universitas Indonesia</p>
          </div>

          {/* Status */}
          <div className="min-w-[150px]">
            <p className="text-xs text-slate-500 mb-1">Tanggal Bergabung</p>
            <p className="text-sm font-bold text-slate-800">{tglBergabung}</p>
            <p className="text-xs text-slate-500 mt-3 mb-1">Status Dosen</p>
            <p className="text-sm font-bold text-green-600">Aktif</p>
          </div>

          {/* IPK BOX */}
          <div className="ml-auto bg-sigap-cardGreen rounded-xl p-4 text-center border-none min-w-[120px]">
            <p className="text-xs text-slate-500 mb-1">Rata rata IPK</p>
            <p className="text-3xl font-bold text-slate-800">{rataRataIpk}</p>
            <p className="text-xs text-slate-400 mt-1">Dari 4.00</p>
          </div>
        </div>
      </div>

      {/* TABS & CONTENT */}
      <div>
        <TabNavigation idDosen={idDosen.toString()} />
        <div>{children}</div>
      </div>

      {/* BACK BUTTON */}
      <div className="pt-2">
        <Link href="/admin/riwayat-dosen" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900">
          <ArrowLeft size={18} /> Kembali
        </Link>
      </div>
    </div>
  );
}