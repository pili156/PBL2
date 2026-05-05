"use client";

import { UploadCloud, FileText, Trash2 } from "lucide-react";
import { useRef } from "react";

type Props = {
  title: string;
  description: string;
  required?: boolean;
  file?: any;
  onUpload: (file: File) => void;
  onDelete?: () => void;
};

export default function UploadCard({
  title,
  description,
  required,
  file,
  onUpload,
  onDelete,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="border rounded-xl p-4 shadow-sm bg-white relative">
      {required && (
        <span className="absolute top-3 right-3 text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
          WAJIB
        </span>
      )}

      <div className="flex flex-col gap-3">
        <h3 className="font-semibold">{title}</h3>
        <p className="text-sm text-gray-500">{description}</p>

        {!file ? (
          <div
            onClick={() => inputRef.current?.click()}
            className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50"
          >
            <UploadCloud className="mx-auto mb-2" />
            <p className="text-sm">Klik untuk upload</p>
          </div>
        ) : (
          <div className="flex items-center justify-between bg-gray-100 p-3 rounded">
            <div className="flex items-center gap-2">
              <FileText size={20} />
              <div>
                <p className="text-sm">{file.name}</p>
                <p className="text-xs text-gray-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>

            <button onClick={onDelete}>
              <Trash2 size={18} className="text-red-500" />
            </button>
          </div>
        )}

        <input
          type="file"
          hidden
          ref={inputRef}
          onChange={(e) => {
            if (e.target.files?.[0]) {
              onUpload(e.target.files[0]);
            }
          }}
        />
      </div>
    </div>
  );
}