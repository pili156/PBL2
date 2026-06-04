'use client';

import { useState, useRef } from 'react';
import { UploadCloud, FileText, AlertCircle, CheckCircle2 } from 'lucide-react';

interface FileDropzoneProps {
  name: string;
  accept?: string;
  maxSizeMB?: number;
  currentFileName?: string;
}

export default function FileDropzone({ name, accept = '.pdf', maxSizeMB = 2, currentFileName }: FileDropzoneProps) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  const validateFile = (f: File): string | null => {
    if (f.type !== 'application/pdf') return 'Hanya file PDF yang diperbolehkan';
    if (f.size > maxSizeBytes) return `Ukuran file maksimal ${maxSizeMB}MB`;
    return null;
  };

  const handleFile = (f: File) => {
    const err = validateFile(f);
    if (err) {
      setError(err);
      setFile(null);
      if (inputRef.current) inputRef.current.value = '';
    } else {
      setError(null);
      setFile(f);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  return (
    <div>
      <div
        className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-colors cursor-pointer ${
          dragOver
            ? 'border-blue-500 bg-blue-50'
            : error
              ? 'border-red-300 bg-red-50/30'
              : 'border-blue-200 bg-blue-50/30 hover:bg-blue-50/60'
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          name={name}
          accept={accept}
          className="hidden"
          onChange={handleChange}
          required={!currentFileName}
        />

        {file ? (
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
              <FileText size={24} />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-slate-800">{file.name}</p>
              <p className="text-xs text-slate-500">{(file.size / (1024 * 1024)).toFixed(1)} MB</p>
            </div>
          </div>
        ) : (
          <>
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-blue-600 mb-4 shadow-sm group-hover:scale-110 transition-transform">
              <UploadCloud size={24} />
            </div>
            <p className="text-sm font-bold text-blue-600">
              {currentFileName ? 'Pilih File Baru' : 'Klik untuk memilih file'}
            </p>
            <p className="text-sm text-slate-500 mt-1">atau drag & drop file di sini</p>
            <p className="text-[10px] font-bold text-slate-400 mt-3 uppercase tracking-widest">Format PDF, maksimal {maxSizeMB}MB</p>
          </>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 mt-2 text-red-600 text-xs font-bold">
          <AlertCircle size={14} /> {error}
        </div>
      )}

      {file && !error && (
        <div className="flex items-center gap-2 mt-2 text-emerald-600 text-xs font-bold">
          <CheckCircle2 size={14} /> File siap diunggah
        </div>
      )}
    </div>
  );
}
