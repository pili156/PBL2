"use client";

import { DokumenDetail } from "../types";
import { useState } from "react";
import { Check, RotateCcw } from "lucide-react";

interface AdminCommentsProps {
  document: DokumenDetail | null;
  onVerify?: (documentId: number, status: string, catatan: string) => void;
  isLoading?: boolean;
}

export default function AdminComments({
  document,
  onVerify,
  isLoading = false,
}: AdminCommentsProps) {
  const [catatan, setCatatan] = useState(document?.catatan_revisi || "");

  const handleVerifikasi = () => {
    if (document && onVerify) {
      onVerify(document.id, "terverifikasi", catatan);
    }
  };

  const handleRevisi = () => {
    if (document && onVerify) {
      onVerify(document.id, "revisi", catatan);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6">
      <h3 className="text-lg font-semibold mb-4">Catatan Admin</h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Tambahkan catatan mengenai dokumen ini (opsional kecuali jika meminta revisi)...
          </label>
          <textarea
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
            placeholder="Ketikkan catatan Anda di sini..."
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={4}
            disabled={!document || isLoading}
          />
        </div>

        <div className="flex gap-3 justify-end pt-4 border-t border-slate-200">
          <button
            onClick={handleRevisi}
            disabled={!document || isLoading}
            className="flex items-center gap-2 px-6 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            <RotateCcw size={18} />
            Permintaan Revisi
          </button>
          <button
            onClick={handleVerifikasi}
            disabled={!document || isLoading}
            className="flex items-center gap-2 px-6 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            <Check size={18} />
            Verifikasi Dokumen
          </button>
        </div>
      </div>
    </div>
  );
}
