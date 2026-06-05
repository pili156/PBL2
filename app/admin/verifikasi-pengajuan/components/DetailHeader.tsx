"use client";

import Link from "next/link";
import { PengajuanDetail } from "../types";
import { ArrowLeft } from "lucide-react";

interface DetailHeaderProps {
  pengajuan: PengajuanDetail | null;
}

export default function DetailHeader({ pengajuan }: DetailHeaderProps) {
  if (!pengajuan) {
    return null;
  }

  return (
    <div className="mb-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-600 mb-4">
        <Link href="/admin/dashboard" className="hover:text-blue-600">
          Dashboard
        </Link>
        <span>{">"}</span>
        <Link href="/admin/verifikasi-pengajuan" className="hover:text-blue-600">
          Monitoring Pengajuan
        </Link>
        <span>{">"}</span>
        <span className="text-slate-900 font-medium">Detail</span>
      </div>

      {/* Header Info */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {pengajuan.nama_lengkap}
          </h1>
          <p className="text-slate-600 mt-2">NIP: {pengajuan.nip}</p>
        </div>
        <Link
          href="/admin/verifikasi-pengajuan"
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
          aria-label="Kembali"
        >
          <ArrowLeft size={18} />
          Kembali
        </Link>
      </div>
    </div>
  );
}
