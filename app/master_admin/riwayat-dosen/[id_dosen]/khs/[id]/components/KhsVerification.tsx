"use client";

import { useState } from "react";
import { Check, RotateCcw } from "lucide-react";
import { logger } from '@/src/lib/logger';

interface KhsVerificationProps {
  khsId: number;
  currentStatus?: string;
  currentCatatan?: string;
  onSuccess?: () => void;
  isLoading?: boolean;
}

export default function KhsVerification({
  khsId,
  currentStatus = "pending",
  currentCatatan = "",
  onSuccess,
  isLoading = false,
}: KhsVerificationProps) {
  const [catatan, setCatatan] = useState(currentCatatan);
  const [loading, setLoading] = useState(false);

  const handleVerifikasi = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/monitoring-khs/${khsId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status_evaluasi: "diterima",
          catatan_evaluasi: catatan,
        }),
      });

      if (response.ok) {
        onSuccess?.();
      }
    } catch (error) {
      logger.error("Error:", error);
      alert("Terjadi kesalahan saat memverifikasi KHS");
    } finally {
      setLoading(false);
    }
  };

  const handleRevisi = async () => {
    if (!catatan.trim()) {
      alert("Catatan revisi tidak boleh kosong");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/admin/monitoring-khs/${khsId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status_evaluasi: "revisi",
          catatan_evaluasi: catatan,
        }),
      });

      if (response.ok) {
        onSuccess?.();
      } else {
        alert("Gagal mengirim permintaan revisi");
      }
    } catch (error) {
      logger.error("Error:", error);
      alert("Terjadi kesalahan saat mengirim permintaan revisi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
      <h3 className="text-sm font-semibold text-slate-800 mb-5">Evaluasi KHS</h3>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-2">
            Catatan Evaluasi (opsional kecuali jika meminta revisi)
          </label>
          <textarea
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
            placeholder="Ketikkan catatan atau alasan revisi Anda di sini..."
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
            rows={4}
            disabled={isLoading || loading}
          />
        </div>

        <div className="flex gap-3 justify-end pt-4 border-t border-slate-200">
          <button
            onClick={handleRevisi}
            disabled={isLoading || loading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
          >
            <RotateCcw size={16} />
            Permintaan Revisi
          </button>
          <button
            onClick={handleVerifikasi}
            disabled={isLoading || loading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
          >
            <Check size={16} />
            Verifikasi KHS
          </button>
        </div>
      </div>
    </div>
  );
}
