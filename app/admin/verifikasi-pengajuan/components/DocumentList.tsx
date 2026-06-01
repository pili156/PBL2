"use client";

import { DokumenDetail } from "../types";
import { FileText, Check, AlertCircle, Clock } from "lucide-react";

interface DocumentListProps {
  documents: DokumenDetail[];
  selectedDoc: DokumenDetail | null;
  onSelectDoc: (doc: DokumenDetail) => void;
}

export default function DocumentList({
  documents,
  selectedDoc,
  onSelectDoc,
}: DocumentListProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "terverifikasi":
        return <Check size={16} className="text-green-500" />;
      case "revisi":
        return <AlertCircle size={16} className="text-red-500" />;
      case "pending":
        return <Clock size={16} className="text-yellow-500" />;
      default:
        return <FileText size={16} className="text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "terverifikasi":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700">
            <Check size={12} /> TERVERIFIKASI
          </span>
        );
      case "revisi":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-700">
            <AlertCircle size={12} /> REVISI
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-700">
            <Clock size={12} /> PENDING
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6">
      <h3 className="text-lg font-semibold mb-4">
        Daftar dokumen <span className="text-slate-400">{documents.length} items</span>
      </h3>
      
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {documents.map((doc) => (
          <div
            key={doc.id}
            onClick={() => onSelectDoc(doc)}
            className={`p-4 rounded-lg border cursor-pointer transition-all ${
              selectedDoc?.id === doc.id
                ? "border-blue-500 bg-blue-50"
                : "border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50"
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-1">{getStatusIcon(doc.status_verifikasi)}</div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm text-slate-900 truncate">
                  {doc.nama_dokumen}
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Updated {new Date(doc.updated_at).toLocaleDateString('id-ID')}
                </p>
              </div>
            </div>
            <div className="mt-2 ml-7">
              {getStatusBadge(doc.status_verifikasi)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
