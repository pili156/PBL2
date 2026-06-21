"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud, Loader2, CheckCircle, FileText, X } from "lucide-react";

interface ReuploadButtonProps {
  khsId: number;
}

export default function ReuploadButton({ khsId }: ReuploadButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      alert("Hanya file PDF yang diperbolehkan");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert("Ukuran file maksimal 2MB");
      return;
    }

    setSelectedFile(file);
  };

  const handleCancel = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleVerifikasi = async () => {
    if (!selectedFile) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const res = await fetch(`/api/user/laporan-khs/${khsId}`, {
        method: "PUT",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Gagal mengupload file");
      }

      setSelectedFile(null);
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Terjadi kesalahan saat upload");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        accept=".pdf"
        className="hidden"
        onChange={handleFileChange}
      />

      {selectedFile ? (
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <FileText size={18} className="text-blue-600 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-blue-800 truncate">{selectedFile.name}</p>
              <p className="text-[10px] text-blue-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
            <button onClick={handleCancel} disabled={uploading} className="p-1 hover:bg-blue-100 rounded transition-colors">
              <X size={14} className="text-blue-500" />
            </button>
          </div>
          <button
            onClick={handleVerifikasi}
            disabled={uploading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 text-white text-sm font-bold rounded-lg hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Mengupload...
              </>
            ) : (
              <>
                <CheckCircle size={18} /> Verifikasi & Kirim
              </>
            )}
          </button>
        </div>
      ) : (
        <button
          onClick={handleClick}
          disabled={uploading}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <UploadCloud size={18} /> Upload Ulang
        </button>
      )}
    </>
  );
}
