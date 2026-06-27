'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Send, FileText, X, Loader2, AlertCircle } from 'lucide-react';
import { submitRevisi } from '../actions';

interface RevisiKHSButtonProps {
  khsId: number;
  currentIps: number | null;
}

export default function RevisiKHSButton({ khsId, currentIps }: RevisiKHSButtonProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [ips, setIps] = useState(currentIps ? Number(currentIps).toFixed(2) : '');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.type !== 'application/pdf') {
      setError('Hanya file PDF yang diperbolehkan');
      return;
    }
    if (f.size > 2 * 1024 * 1024) {
      setError('Ukuran file maksimal 2MB');
      return;
    }
    setError(null);
    setFile(f);
  };

  const handleSubmit = async () => {
    const numVal = parseFloat(ips);
    if (isNaN(numVal) || numVal < 0 || numVal > 4) {
      setError('IPS harus antara 0 - 4.00');
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('ipk', ips);
      if (file) {
        formData.append('file', file);
      }

      const result = await submitRevisi(khsId, formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setIsOpen(false);
        router.refresh();
      }
    } catch {
      setError('Terjadi kesalahan saat mengirim revisi');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
    setIps(currentIps ? Number(currentIps).toFixed(2) : '');
    setFile(null);
    setError(null);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex-1 flex items-center justify-center gap-2 py-3 bg-amber-500 text-white text-sm font-bold rounded-lg hover:bg-amber-600 transition-colors shadow-sm"
      >
        <Send size={18} /> Kirim Revisi
      </button>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 shadow-sm space-y-4">
        <h4 className="text-sm font-bold text-amber-800 flex items-center gap-2">
          <Send size={14} /> Form Revisi KHS
        </h4>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            IPS <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            max="4.00"
            value={ips}
            onChange={(e) => {
              setIps(e.target.value);
              setError(null);
            }}
            placeholder="0.00 - 4.00"
            className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm font-bold focus:ring-2 focus:ring-amber-500 outline-none"
            disabled={submitting}
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            File KHS (PDF) <span className="text-slate-400 font-normal">- opsional jika hanya ingin ubah IPS</span>
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={handleFileChange}
          />

          {file ? (
            <div className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg">
              <FileText size={18} className="text-amber-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-800 truncate">{file.name}</p>
                <p className="text-[10px] text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <button
                onClick={() => {
                  setFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                disabled={submitting}
                className="p-1 hover:bg-slate-100 rounded transition-colors"
              >
                <X size={14} className="text-slate-400" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={submitting}
              className="w-full p-3 border-2 border-dashed border-slate-200 rounded-lg text-xs font-bold text-slate-500 hover:border-amber-300 hover:text-amber-600 transition-colors"
            >
              Klik untuk pilih file PDF
            </button>
          )}
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-600 text-xs font-bold">
            <AlertCircle size={14} /> {error}
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <button
            onClick={handleCancel}
            disabled={submitting}
            className="flex-1 py-2.5 border border-slate-200 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || !ips}
            className="flex-1 py-2.5 bg-amber-500 text-white text-xs font-bold rounded-lg hover:bg-amber-600 transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <Loader2 size={14} className="animate-spin" /> Mengirim...
              </>
            ) : (
              <>
                <Send size={14} /> Kirim Revisi
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
