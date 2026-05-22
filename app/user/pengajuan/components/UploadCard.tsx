"use client";

import { Upload, File, Trash2, AlertCircle, CheckCircle, X, Loader2 } from "lucide-react";
import { useRef, useState, useCallback } from "react";
import { MAX_FILE_SIZE, ALLOWED_FILE_TYPES } from "../constants";

type Props = {
  title: string;
  description?: string;
  required?: boolean;
  status?: "wajib" | "opsional";
  file?: { name: string; size?: number } | null;
  uploadProgress?: number;
  onUpload: (file: File) => void;
  onDelete?: () => void;
  error?: string;
};

export default function UploadCard({
  title,
  description,
  required,
  status = "wajib",
  file,
  uploadProgress = 0,
  onUpload,
  onDelete,
  error,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(error || null);
  const [isHovered, setIsHovered] = useState(false);

  const handleFileSelect = useCallback((selectedFile: File) => {
    setUploadError(null);

    if (selectedFile.size > MAX_FILE_SIZE) {
      setUploadError("Ukuran file tidak boleh lebih dari 2MB");
      return;
    }

    if (!ALLOWED_FILE_TYPES.includes(selectedFile.type)) {
      setUploadError("Format file harus PDF");
      return;
    }

    onUpload(selectedFile);
  }, [onUpload]);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files?.[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }, [handleFileSelect]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      handleFileSelect(e.target.files[0]);
    }
  }, [handleFileSelect]);

  const getStatusBadge = () => {
    if (status === "wajib") {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-100 px-2 py-1 rounded">
          WAJIB
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-100 px-2 py-1 rounded">
        OPSIONAL
      </span>
    );
  };

  return (
    <div
      className={`border-2 rounded-xl p-5 bg-white transition-all duration-300 ${
        uploadError
          ? "border-red-300 bg-red-50 shadow-md"
          : file
            ? "border-green-300 bg-green-50 shadow-md"
            : isDragging
              ? "border-blue-400 bg-blue-50 shadow-lg"
              : isHovered
                ? "border-blue-300 shadow-md"
                : "border-gray-200 hover:border-gray-300"
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-900">{title}</h3>
            
            {/* PERBAIKAN: Conditional rendering untuk Badge */}
            {file ? (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded">
                <CheckCircle size={14} /> DIUNGGAH
              </span>
            ) : (
              getStatusBadge()
            )}

          </div>
          {description && (
            <p className="text-sm text-gray-600">{description}</p>
          )}
        </div>
        
        {/* Kode {file && ... Uploaded} yang sebelumnya ada di sebelah kanan sudah dihapus agar rapi */}
      </div>

      {!file ? (
        <div
          onClick={() => inputRef.current?.click()}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-300 ${
            isDragging
              ? "border-blue-500 bg-blue-50 shadow-inner"
              : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
          }`}
        >
          <div className="flex flex-col items-center">
            <div className={`p-3 rounded-full mb-3 transition-all ${
              isDragging ? "bg-blue-100" : "bg-gray-100"
            }`}>
              {isDragging ? (
                <Loader2 size={32} className="text-blue-600 animate-spin" />
              ) : (
                <Upload size={32} className="text-gray-400" />
              )}
            </div>
            <p className="text-sm font-medium text-gray-700 mb-1">
              {isDragging ? 'Lepaskan file di sini' : 'Klik untuk upload atau drag file di sini'}
            </p>
            <p className="text-xs text-gray-500">Format: PDF • Max 2MB</p>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between bg-white border border-gray-200 p-3 rounded-lg">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="p-2 bg-green-100 rounded-lg flex-shrink-0">
              <File size={20} className="text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {file.name}
              </p>
              {file.size && (
                <p className="text-xs text-gray-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              )}
            </div>
          </div>

          {onDelete && (
            <button
              onClick={onDelete}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
              title="Hapus file"
            >
              <Trash2 size={18} />
            </button>
          )}
        </div>
      )}

      {uploadProgress > 0 && uploadProgress < 100 && (
        <div className="mt-3">
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-blue-600 h-full transition-all duration-300 rounded-full"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className="text-xs text-center text-gray-500 mt-1">{uploadProgress}%</p>
        </div>
      )}

      {uploadError && (
        <div className="mt-3 flex items-start gap-2 text-red-600 text-sm">
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
          <p>{uploadError}</p>
        </div>
      )}

      <input
        type="file"
        hidden
        ref={inputRef}
        onChange={handleInputChange}
        accept=".pdf"
      />
    </div>
  );
}