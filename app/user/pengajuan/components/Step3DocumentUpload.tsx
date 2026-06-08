"use client";

import { useState, useMemo, useCallback } from "react";
import { Upload, CheckCircle, AlertCircle, ArrowRight, ArrowLeft, Loader2, FileUp } from "lucide-react";
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

interface UploadState {
  [key: string]: {
    uploading: boolean;
    progress: number;
    error: string | null;
  };
}

export default function Step3DocumentUpload({
  groupKey,
  documents,
  onDocumentUpload,
  onDocumentDelete,
  onNext,
  onPrev,
}: Props) {
  const group = DOCUMENT_GROUPS[groupKey as keyof typeof DOCUMENT_GROUPS];
  const [uploadStates, setUploadStates] = useState<UploadState>({});
  const [batchUploading, setBatchUploading] = useState(false);

  if (!group) {
    return <div className="text-red-600">Kelompok dokumen tidak ditemukan</div>;
  }

  const stats = useMemo(() => {
    const total = group.documents.length;
    const required = group.documents.filter(d => d.required).length;
    const optional = group.documents.filter(d => !d.required).length;
    const uploaded = group.documents.filter(d => documents[d.id] !== null).length;
    const requiredUploaded = group.documents.filter(d => d.required && documents[d.id] !== null).length;
    const optionalUploaded = group.documents.filter(d => !d.required && documents[d.id] !== null).length;
    return { total, required, optional, uploaded, requiredUploaded, optionalUploaded };
  }, [documents, group.documents]);

  const allRequiredUploaded = stats.requiredUploaded === stats.required;

  const handleFileUpload = useCallback(async (docType: DocumentType, file: File) => {
    setUploadStates(prev => ({ ...prev, [docType]: { uploading: true, progress: 0, error: null } }));

    const progressInterval = setInterval(() => {
      setUploadStates(prev => {
        const current = prev[docType]?.progress || 0;
        if (current < 90) {
          return { ...prev, [docType]: { ...prev[docType], progress: current + 10 } };
        }
        return prev;
      });
    }, 100);

    try {
      await onDocumentUpload(docType, {
        id: `${docType}-${Date.now()}`,
        name: file.name,
        size: file.size,
        uploadedAt: new Date().toISOString(),
      }, file);

      clearInterval(progressInterval);
      setUploadStates(prev => ({ ...prev, [docType]: { uploading: false, progress: 100, error: null } }));
    } catch (error) {
      clearInterval(progressInterval);
      setUploadStates(prev => ({ ...prev, [docType]: { uploading: false, progress: 0, error: 'Upload failed' } }));
    }
  }, [onDocumentUpload]);

  const handleBatchUpload = useCallback(async (files: FileList) => {
    if (!allRequiredUploaded || batchUploading) return;

    setBatchUploading(true);
    const uploads: Promise<void>[] = [];

    Array.from(files).forEach((file) => {
      const matchingDoc = group.documents.find(doc => 
        !documents[doc.id] && 
        (doc.required || stats.optionalUploaded < stats.optional)
      );

      if (matchingDoc) {
        uploads.push(
          new Promise((resolve) => {
            handleFileUpload(matchingDoc.id as DocumentType, file).then(resolve);
          })
        );
      }
    });

    await Promise.all(uploads);
    setBatchUploading(false);
  }, [allRequiredUploaded, batchUploading, documents, group.documents, stats, handleFileUpload]);

  return (
    <div className="w-full">
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {group.label.replace(/^\d+\.\s*/, '')}
            </h1>
            <p className="text-gray-600">{group.description}</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-lg">
              <CheckCircle size={18} className="text-green-600" />
              <span className="text-sm font-medium text-green-700">
                {stats.uploaded}/{stats.total} Uploaded
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
          <div className="text-sm text-blue-600 mb-1">Total</div>
          <div className="text-2xl font-bold text-blue-900">{stats.total}</div>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-xl border border-red-200">
          <div className="text-sm text-red-600 mb-1">Wajib</div>
          <div className="text-2xl font-bold text-red-900">{stats.requiredUploaded}/{stats.required}</div>
        </div>
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-4 rounded-xl border border-amber-200">
          <div className="text-sm text-amber-600 mb-1">opsional</div>
          <div className="text-2xl font-bold text-amber-900">{stats.optionalUploaded}/{stats.optional}</div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
          <div className="text-sm text-green-600 mb-1">Progress</div>
          <div className="text-2xl font-bold text-green-900">
            {Math.round((stats.uploaded / stats.total) * 100)}%
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-8">
        {group.documents.map((doc) => {
          const uploadedFile = documents[doc.id];
          const uploadState = uploadStates[doc.id];
          const isUploading = uploadState?.uploading;

          return (
            <div key={doc.id}>
              <div className={isUploading ? "opacity-70" : ""}>
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
                  uploadProgress={uploadState?.progress || 0}
                  onUpload={(file) => handleFileUpload(doc.id as DocumentType, file)}
                  onDelete={
                    uploadedFile && !isUploading
                      ? () => onDocumentDelete(doc.id as DocumentType)
                      : undefined
                  }
                />
              </div>
              {isUploading && (
                <div className="mt-2">
                  <div className="flex items-center gap-2 text-sm text-blue-600">
                    <Loader2 size={16} className="animate-spin" />
                    Mengunggah... {(uploadState?.progress || 0)}%
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1 overflow-hidden">
                    <div
                      className="bg-blue-600 h-full transition-all duration-300 w-[var(--progress)]"
                      style={{ '--progress': `${uploadState?.progress || 0}%` } as React.CSSProperties}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mb-8 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <FileUp size={20} className="text-blue-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 mb-1">Format yang didukung:</p>
            <p className="text-sm text-gray-600">
              PDF • Maksimal 2MB per file
            </p>
          </div>
        </div>
      </div>

      {!allRequiredUploaded && (
        <div className="mb-8 p-5 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertCircle size={20} className="text-red-600" />
            </div>
            <div className="text-sm text-red-900">
              <p className="font-semibold mb-1">Dokumen yang diperlukan belum lengkap</p>
              <p>
                Silahkan upload semua dokumen yang bertanda WAJIB ({stats.required - stats.requiredUploaded} lagi)
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between">
        <button
          onClick={onPrev}
          className="px-8 py-3 rounded-lg font-semibold text-gray-700 bg-gray-200 hover:bg-gray-300 transition-all flex items-center gap-2"
          aria-label="Kembali"
        >
          <ArrowLeft size={20} />
          Kembali
        </button>

        <button
          onClick={onNext}
          disabled={!allRequiredUploaded}
          className={`px-8 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 ${
            allRequiredUploaded
              ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg"
              : "bg-gray-200 text-gray-500 cursor-not-allowed"
          }`}
        >
          {stats.uploaded === stats.total ? 'Selesai Mengunggah' : 'Lanjutkan ke Grup Berikutnya'}
          <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
}
