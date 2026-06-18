"use client";

import Link from "next/link";
import { PengajuanMonitoring } from "../types";
import { MoreVertical } from "lucide-react";
import StatusBadge from "@/src/components/StatusBadge";

interface MonitoringTableProps {
  data: PengajuanMonitoring[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function MonitoringTable({
  data,
  currentPage,
  totalPages,
  onPageChange,
}: MonitoringTableProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">No</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Nama Dosen</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">NIP</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Proses</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Tanggal Unggah</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {data.map((item, index) => (
              <tr
                key={item.id}
                className="hover:bg-slate-50 transition-colors"
              >
                <td className="px-6 py-4 text-sm text-slate-700 font-medium">
                  {(currentPage - 1) * 5 + index + 1}
                </td>
                <td className="px-6 py-4 text-sm text-slate-900 font-medium">
                  {item.nama_lengkap}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {item.nip}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {item.dokumen_terverifikasi}/{item.total_dokumen}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {item.tanggal_pengajuan}
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={item.status} domain="pengajuan" size="md" />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <Link
                      href={`/master_admin/verifikasi-pengajuan/${item.id}`}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Lihat Detail
                    </Link>
                    <button className="p-1 hover:bg-slate-100 rounded transition-colors">
                      <MoreVertical size={18} className="text-slate-500" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between bg-slate-50">
        <p className="text-sm text-slate-600">
          Items per page <span className="font-semibold">5</span> | Halaman{" "}
          <span className="font-semibold">{currentPage}</span> of{" "}
          <span className="font-semibold">{totalPages}</span>
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-2 py-1 rounded border border-slate-300 text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            ←
          </button>
          <button
            disabled
            className="px-3 py-1 rounded bg-blue-600 text-white font-medium"
          >
            {currentPage}
          </button>
          <span className="text-slate-600">...</span>
          <button
            disabled
            className="px-3 py-1 rounded text-slate-600 font-medium"
          >
            {totalPages}
          </button>
          <button
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-2 py-1 rounded border border-slate-300 text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}
