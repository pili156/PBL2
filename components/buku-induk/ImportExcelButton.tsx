"use client";

import { useState, useRef } from "react";
import { Upload, Loader2, CheckCircle, AlertCircle, X } from "lucide-react";

interface ImportResult {
  created: number;
  updated: number;
  skipped: number;
  errors: string[];
  sheets: Record<string, { imported: number; errors: number }>;
}

interface ImportExcelButtonProps {
  onImportComplete?: () => void;
}

export default function ImportExcelButton({ onImportComplete }: ImportExcelButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImport = async (file: File) => {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/buku-induk/import-excel", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal import");

      setResult(json.result);
      onImportComplete?.();
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImport(file);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-emerald-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
      >
        <Upload size={16} /> Import Excel
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => { setIsOpen(false); setResult(null); setError(""); }} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Import Data Excel</h2>
              <button onClick={() => { setIsOpen(false); setResult(null); setError(""); }} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="px-6 py-5">
              {!result && !loading && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-500">
                    Upload file Excel (.xlsx) yang berisi data Tugas Belajar, Data Doktor, dan Data Profesor.
                  </p>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-blue-400 hover:bg-blue-50/50 transition-all cursor-pointer"
                  >
                    <Upload size={32} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-sm font-medium text-gray-600">Klik untuk memilih file</p>
                    <p className="text-xs text-gray-400 mt-1">Format: .xlsx (maks 10MB)</p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>
              )}

              {loading && (
                <div className="flex flex-col items-center py-12 text-gray-400">
                  <Loader2 className="animate-spin text-blue-500 mb-3" size={28} />
                  <p className="text-sm font-medium">Mengimport data...</p>
                  <p className="text-xs text-gray-400 mt-1">Proses ini mungkin memakan waktu</p>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                  <AlertCircle size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-red-700">Gagal Import</p>
                    <p className="text-xs text-red-500 mt-1">{error}</p>
                  </div>
                </div>
              )}

              {result && (
                <div className="space-y-4">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3">
                    <CheckCircle size={18} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-emerald-700">Import Berhasil</p>
                      <p className="text-xs text-emerald-600 mt-1">
                        {result.created} data berhasil diimport.
                      </p>
                    </div>
                  </div>

                  {Object.keys(result.sheets).length > 0 && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Detail Per Sheet</p>
                      <div className="space-y-2">
                        {Object.entries(result.sheets).map(([name, info]) => (
                          <div key={name} className="flex items-center justify-between text-sm">
                            <span className="text-gray-700 font-medium">{name}</span>
                            <span className="text-gray-500">{info.imported} baris</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {result.errors.length > 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                      <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-2">Error ({result.errors.length})</p>
                      <div className="max-h-32 overflow-y-auto space-y-1">
                        {result.errors.slice(0, 10).map((err, i) => (
                          <p key={i} className="text-xs text-amber-600">{err}</p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end px-6 py-4 border-t border-gray-100 bg-gray-50">
              <button
                onClick={() => { setIsOpen(false); setResult(null); setError(""); }}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
              >
                {result ? "Tutup" : "Batal"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
