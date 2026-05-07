// app/admin/riwayat-dosen/[id_dosen]/layout.tsx

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

  return (
    <div className="w-full min-h-screen p-6 lg:p-8 bg-sigap-bg space-y-6">

      {/* HEADER UTAMA */}
      <div className="space-y-2">
        <p className="text-sm text-slate-500">
          Dashboard {'>'} Data Dosen {'>'} <span className="text-slate-700 font-medium">Riwayat Dosen</span>
        </p>
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold text-slate-800">Riwayat Studi Dosen</h2>
          <button className="flex items-center gap-2 bg-sigap-primary text-white text-sm font-medium px-4 py-2 rounded-lg hover:opacity-90 transition">
            <Download size={16} /> Export Excel
          </button>
        </div>
      </div>

      {/* TABS & KONTEN DINAMIS */}
      <div>
        {/* Tab Menu */}
        <TabNavigation idDosen={idDosen.toString()} />
        
        {/* Konten Page (Status/KHS/Keuangan) yang udah ada profil eksklusifnya akan muncul di sini */}
        <div className="mt-6">
          {children}
        </div> 
      </div>

      {/* TOMBOL KEMBALI */}
      <div className="pt-2">
        <Link href="/admin/riwayat-dosen" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition">
          <ArrowLeft size={18} /> Kembali
        </Link>
      </div>
      
    </div>
  );
}