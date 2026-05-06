"use client";

import { useState, useMemo } from "react";
import UploadCard from "./UploadCard";
import { DOCUMENT_GROUPS } from "../constants";
import { DocumentType, UploadFile } from "../type";

type Props = {
  groupKey: string;
  documents: Record<DocumentType, UploadFile | null>;
  onDocumentUpload: (docType: DocumentType, file: UploadFile, fileObj: File) => void;
  onDocumentDelete: (docType: DocumentType) => void;
  onNext: () => void;
  onPrev: () => void;
};

export default function Step3DocumentUpload({
  groupKey,
  documents,
  onDocumentUpload,
  onDocumentDelete,
  onNext,
  onPrev,
}: Props) {
  const group = DOCUMENT_GROUPS[groupKey as keyof typeof DOCUMENT_GROUPS];
  const [uploadStates, setUploadStates] = useState<Partial<Record<DocumentType, boolean>>>({});

  if (!group) {
    return <div className="text-red-600">Kelompok dokumen tidak ditemukan</div>;
  }

  const allRequiredUploaded = useMemo(() => {
    return group.documents.every((doc) => {
      if (doc.required) {
        return documents[doc.id];
      }
      return true;
    });
  }, [documents, group.documents]);

  const handleFileUpload = (docType: DocumentType, file: File) => {
    setUploadStates((prev) => ({ ...prev, [docType]: true }));

    setTimeout(() => {
      onDocumentUpload(docType, {
        id: `${docType}-${Date.now()}`,
        name: file.name,
        size: file.size,
        uploadedAt: new Date().toISOString(),
      }, file);
      setUploadStates((prev) => ({ ...prev, [docType]: false }));
    }, 500);
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          {group.label}
        </h1>
        <p className="text-gray-600">{group.description}</p>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        {group.documents.map((doc) => {
          const uploadedFile = documents[doc.id];
          const isUploading = uploadStates[doc.id];

          return (
            <div key={doc.id}>
              <div className={isUploading ? "opacity-50 pointer-events-none" : ""}>
                <UploadCard
                  title={doc.title}
                  description={doc.description}
                  status={doc.status}
                  file={
                    uploadedFile
                      ? {
                          name: uploadedFile.name,
                          size: uploadedFile.size,
                        }
                      : null
                  }
                  onUpload={(file) => handleFileUpload(doc.id, file)}
                  onDelete={
                    uploadedFile
                      ? () => onDocumentDelete(doc.id)
                      : undefined
                  }
                />
              </div>
              {isUploading && (
                <div className="text-center mt-2 text-sm text-blue-600">
                  Mengunggah...
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Info Box */}
      <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg flex gap-3">
        <div className="text-blue-600 text-lg mt-0.5">ℹ️</div>
        <div className="text-sm text-blue-900">
          <p className="font-semibold mb-1">Format yang didukung:</p>
          <p>PDF • Maksimal 2MB per file</p>
        </div>
      </div>

      {/* Validation Message */}
      {!allRequiredUploaded && (
        <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
          <div className="text-red-600 text-lg mt-0.5">⚠️</div>
          <div className="text-sm text-red-900">
            <p className="font-semibold">Dokumen yang diperlukan belum lengkap</p>
            <p>Silahkan upload semua dokumen yang bertanda WAJIB</p>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <button
          onClick={onPrev}
          className="px-8 py-3 rounded-lg font-semibold text-gray-700 bg-gray-200 hover:bg-gray-300 transition-all"
        >
          ← Kembali
        </button>

        <button
          onClick={onNext}
          disabled={!allRequiredUploaded}
          className={`px-8 py-3 rounded-lg font-semibold transition-all ${
            allRequiredUploaded
              ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg"
              : "bg-gray-200 text-gray-500 cursor-not-allowed"
          }`}
        >
          Lanjutkan ke Grup Berikutnya →
        </button>
      </div>
    </div>
  );
}
