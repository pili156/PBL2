"use client";

import { DokumenDetail } from "../types";
import { Download, ZoomIn, ZoomOut, Maximize } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import StatusBadge from "@/src/components/StatusBadge";

interface DocumentViewerProps {
  document: DokumenDetail | null;
}

export default function DocumentViewer({ document }: DocumentViewerProps) {
  const [zoom, setZoom] = useState(100);
  const [blobUrl, setBlobUrl] = useState<string>("");
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [errorPdf, setErrorPdf] = useState(false);
  const prevDocIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!document?.file_path) {
      setBlobUrl("");
      return;
    }

    if (prevDocIdRef.current === document.id) return;
    prevDocIdRef.current = document.id;

    let cancelled = false;
    const controller = new AbortController();

    const loadPdf = async () => {
      setLoadingPdf(true);
      setErrorPdf(false);
      try {
        const res = await fetch(document.file_path, { signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const blob = await res.blob();
        if (!cancelled) {
          const url = URL.createObjectURL(blob);
          setBlobUrl((prev) => {
            if (prev) URL.revokeObjectURL(prev);
            return url;
          });
        }
      } catch {
        if (!cancelled) setErrorPdf(true);
      } finally {
        if (!cancelled) setLoadingPdf(false);
      }
    };

    loadPdf();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [document?.id, document?.file_path]);

  useEffect(() => {
    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, []);

  if (!document) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-6 h-96 flex items-center justify-center">
        <p className="text-slate-500">Pilih dokumen untuk dilihat</p>
      </div>
    );
  }

  const getPdfUrl = () => {
    if (!document.file_path) return "";
    if (document.file_path.startsWith("http")) return document.file_path;
    return document.file_path;
  };

  const iframeSrc = blobUrl ? `${blobUrl}#zoom=${zoom}` : "";

  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-900 truncate">
            {document.nama_dokumen}
          </h3>
          <p className="text-xs text-slate-500 mt-1">{document.file_path}</p>
        </div>
        <div className="flex items-center gap-2 ml-4">
          <button
            onClick={() => setZoom(Math.max(50, zoom - 10))}
            className="p-2 hover:bg-slate-200 rounded transition-colors"
            title="Zoom Out"
          >
            <ZoomOut size={18} className="text-slate-600" />
          </button>
          <span className="text-xs font-medium text-slate-600 min-w-[45px] text-center">
            {zoom}%
          </span>
          <button
            onClick={() => setZoom(Math.min(200, zoom + 10))}
            className="p-2 hover:bg-slate-200 rounded transition-colors"
            title="Zoom In"
          >
            <ZoomIn size={18} className="text-slate-600" />
          </button>
          <a
            href={getPdfUrl()}
            download
            className="p-2 hover:bg-slate-200 rounded transition-colors"
            title="Download"
          >
            <Download size={18} className="text-slate-600" />
          </a>
          <a
            href={getPdfUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 hover:bg-slate-200 rounded transition-colors"
            title="Fullscreen"
          >
            <Maximize size={18} className="text-slate-600" />
          </a>
        </div>
      </div>

      {/* Viewer Area */}
      <div className="bg-slate-100 h-96 overflow-auto flex items-center justify-center">
        {!getPdfUrl() ? (
          <p className="text-slate-400">File tidak tersedia</p>
        ) : loadingPdf ? (
          <p className="text-slate-400">Memuat dokumen...</p>
        ) : errorPdf ? (
          <p className="text-red-400">Gagal memuat dokumen</p>
        ) : (
          <iframe
            src={iframeSrc}
            className="w-full h-full"
            title="Document Viewer"
          />
        )}
      </div>

      {/* Info */}
      <div className="p-4 bg-slate-50 border-t border-slate-200 text-xs text-slate-600">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="font-medium text-slate-700">Status</p>
            <StatusBadge status={document.status_verifikasi} domain="verifikasi" size="md" dot className="mt-1" />
          </div>
          <div>
            <p className="font-medium text-slate-700">Updated</p>
            <p className="mt-1">
              {new Date(document.updated_at).toLocaleDateString('id-ID')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
