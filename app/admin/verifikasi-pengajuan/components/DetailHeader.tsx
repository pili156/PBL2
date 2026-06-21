"use client";

import Link from "next/link";
import { PengajuanDetail } from "../types";
import { ArrowLeft, FileText, XCircle } from "lucide-react";

interface DetailHeaderProps {
  pengajuan: PengajuanDetail | null;
  allDocumentsVerified?: boolean;
  hasSkUploaded?: boolean;
  onReject?: () => void;
}

export default function DetailHeader({ pengajuan, allDocumentsVerified = false, hasSkUploaded = false, onReject }: DetailHeaderProps) {
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
        <div className="flex items-center gap-3">
          {pengajuan.id && allDocumentsVerified ? (
            <Link
              href={`/admin/status/${pengajuan.id}`}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors text-sm font-semibold"
            >
              <FileText size={16} />
              Upload SK
            </Link>
          ) : pengajuan.id ? (
            <span
              title="Semua dokumen harus terverifikasi terlebih dahulu"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-300 text-white cursor-not-allowed transition-colors text-sm font-semibold opacity-60"
            >
              <FileText size={16} />
              Upload SK
            </span>
          ) : null}
          {allDocumentsVerified && !hasSkUploaded ? (
            <button
              onClick={onReject}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors text-sm font-semibold"
            >
              <XCircle size={16} />
              Tolak Pengajuan
            </button>
          ) : (
            <span
              title={!allDocumentsVerified ? "Semua dokumen harus terverifikasi terlebih dahulu" : "SK sudah diupload, pengajuan tidak dapat ditolak"}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-300 text-white cursor-not-allowed transition-colors text-sm font-semibold opacity-60"
            >
              <XCircle size={16} />
              Tolak Pengajuan
            </span>
          )}
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
    </div>
  );
}
