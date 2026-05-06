"use client";

import { Upload, File, Trash2, AlertCircle } from "lucide-react";
import { useRef, useState } from "react";
import { MAX_FILE_SIZE, ALLOWED_FILE_TYPES } from "../constants";

type Props = {
  title: string;
  description?: string;
  required?: boolean;
  status?: "wajib" | "terunggu";
  file?: { name: string; size?: number } | null;
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
  onUpload,
  onDelete,
  error,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(error || null);

  const handleFileSelect = (selectedFile: File) => {
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
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files?.[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  return (
    <div
      className={`border-2 rounded-xl p-5 bg-white transition-all ${
        uploadError
          ? "border-red-300 bg-red-50"
          : file
            ? "border-blue-200 bg-blue-50"
            : "border-gray-200 hover:border-gray-300"
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-900">{title}</h3>
            {status === "wajib" && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-100 px-2 py-1 rounded">
                WAJIB
              </span>
            )}
            {status === "terunggu" && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded">
                TERUNGGU
              </span>
            )}
          </div>
          {description && (
            <p className="text-sm text-gray-600">{description}</p>
          )}
        </div>
      </div>

      {/* Upload Area or File Display */}
      {!file ? (
        <div
          onClick={() => inputRef.current?.click()}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            isDragging
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
          }`}
        >
          <Upload className="mx-auto mb-2 text-gray-400" size={32} />
          <p className="text-sm font-medium text-gray-700 mb-1">
            Klik untuk upload atau drag file di sini
          </p>
          <p className="text-xs text-gray-500">Format: PDF • Max 2MB</p>
        </div>
      ) : (
        <div className="flex items-center justify-between bg-white border border-gray-200 p-3 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded">
              <File size={20} className="text-blue-600" />
            </div>
            <div className="flex-1">
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
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Hapus file"
            >
              <Trash2 size={18} />
            </button>
          )}
        </div>
      )}

      {/* Error Message */}
      {uploadError && (
        <div className="mt-3 flex items-start gap-2 text-red-600 text-sm">
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
          <p>{uploadError}</p>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        type="file"
        hidden
        ref={inputRef}
        onChange={(e) => {
          if (e.target.files?.[0]) {
            handleFileSelect(e.target.files[0]);
          }
        }}
        accept=".pdf,.png,.jpg,.jpeg"
      />
    </div>
  );
}