"use client";

import { useState } from "react";
import { FileText, Check, AlertCircle, Clock, Download, ZoomIn, ZoomOut, Maximize, RotateCcw, Loader2 } from "lucide-react";
import StatusBadge from "@/src/components/StatusBadge";

type UploadedDoc = {
  id: number;
  file_path: string | null;
  status_verifikasi: string | null;
  catatan_revisi: string | null;
  master_dokumen: { nama_dokumen: string | null } | null;
};

export default function DocumentViewerSection({ documents }: { documents: UploadedDoc[] }) {
  const [docs, setDocs] = useState<UploadedDoc[]>(documents);
  const [selectedDoc, setSelectedDoc] = useState<UploadedDoc | null>(
    documents.length > 0 ? documents[0] : null
  );
  const [zoom, setZoom] = useState(100);
  const [catatan, setCatatan] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verifyMessage, setVerifyMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "terverifikasi":
        return <Check size={16} className="text-green-500" />;
      case "revisi":
        return <AlertCircle size={16} className="text-red-500" />;
      case "pending":
      case "menunggu":
        return <Clock size={16} className="text-yellow-500" />;
      default:
        return <FileText size={16} className="text-gray-500" />;
    }
  };

  const getPdfUrl = (doc: UploadedDoc) => {
    if (!doc.file_path) return "";
    if (doc.file_path.startsWith("http")) return doc.file_path;
    return doc.file_path;
  };

  const handleVerify = async (docId: number, status: string) => {
    setVerifying(true);
    setVerifyMessage(null);
    try {
      const response = await fetch(`/api/admin/pengajuan-monitoring/dokumen/${docId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status_verifikasi: status, catatan_revisi: status === "revisi" ? catatan : null }),
      });

      if (!response.ok) {
        throw new Error("Gagal memperbarui dokumen");
      }

      const updatedDoc = { ...(docs.find(d => d.id === docId) as UploadedDoc) };
      updatedDoc.status_verifikasi = status;
      updatedDoc.catatan_revisi = status === "revisi" ? catatan : null;

      setDocs(prev => prev.map(d => d.id === docId ? updatedDoc : d));
      if (selectedDoc?.id === docId) {
        setSelectedDoc(updatedDoc);
      }
      setCatatan("");
      setVerifyMessage({
        type: "success",
        text: `Dokumen berhasil di-${status === "terverifikasi" ? "verifikasi" : "revisi"}`,
      });
    } catch {
      setVerifyMessage({ type: "error", text: "Gagal memperbarui dokumen" });
    } finally {
      setVerifying(false);
    }
  };

  if (docs.length === 0) {
    return (
      <div className="xl:col-span-3 bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
          <h4 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
            <FileText size={15} className="text-slate-400" />
            Dokumen yang Diupload
          </h4>
        </div>
        <div className="flex-1 bg-slate-50 p-6 flex items-center justify-center text-center text-slate-400">
          <div>
            <FileText size={64} className="mx-auto mb-4 opacity-20" strokeWidth={1.5} />
            <p className="text-sm font-medium text-slate-400">Belum ada dokumen yang diupload</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="xl:col-span-3 grid grid-cols-1 xl:grid-cols-5 gap-6">
      {/* Document List */}
      <div className="xl:col-span-2 bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
          <h4 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
            <FileText size={15} className="text-slate-400" />
            Dokumen
          </h4>
          <span className="text-xs text-slate-400">{docs.length} items</span>
        </div>
        <div className="flex-1 bg-slate-50 p-4 overflow-y-auto space-y-2">
          {docs.map((doc) => {
            const status = (doc.status_verifikasi || "pending").toLowerCase();
            return (
              <div
                key={doc.id}
                onClick={() => {
                  setSelectedDoc(doc);
                  setVerifyMessage(null);
                }}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  selectedDoc?.id === doc.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1">{getStatusIcon(status)}</div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm text-slate-900 truncate">
                      {doc.master_dokumen?.nama_dokumen || "Dokumen"}
                    </h4>
                    {doc.catatan_revisi && (
                      <p className="text-xs text-red-600 mt-1 truncate">
                        Catatan: {doc.catatan_revisi}
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-2 ml-7">
                  <StatusBadge status={status} domain="verifikasi" size="sm" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Document Viewer + Verification Panel */}
      <div className="xl:col-span-3 space-y-6">
        {/* Document Viewer */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
          {selectedDoc ? (
            <>
              <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-900 truncate text-sm">
                    {selectedDoc.master_dokumen?.nama_dokumen || "Dokumen"}
                  </h3>
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
                    href={getPdfUrl(selectedDoc)}
                    download
                    className="p-2 hover:bg-slate-200 rounded transition-colors"
                    title="Download"
                  >
                    <Download size={18} className="text-slate-600" />
                  </a>
                  <a
                    href={getPdfUrl(selectedDoc)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 hover:bg-slate-200 rounded transition-colors"
                    title="Fullscreen"
                  >
                    <Maximize size={18} className="text-slate-600" />
                  </a>
                </div>
              </div>
              <div className="flex-1 bg-slate-100 overflow-auto flex items-center justify-center min-h-[400px]">
                {getPdfUrl(selectedDoc) ? (
                  <iframe
                    src={`${getPdfUrl(selectedDoc)}#zoom=${zoom}`}
                    className="w-full h-full"
                    title={selectedDoc.master_dokumen?.nama_dokumen || "Dokumen"}
                  />
                ) : (
                  <p className="text-slate-400">File tidak tersedia</p>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-slate-500">Pilih dokumen untuk dilihat</p>
            </div>
          )}
        </div>

        {/* Verification Panel */}
        {selectedDoc && (
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
            <h4 className="text-sm font-semibold text-slate-800 mb-4">Verifikasi Dokumen</h4>

            {verifyMessage && (
              <div className={`mb-4 p-3 rounded-lg text-xs font-medium ${
                verifyMessage.type === "success"
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}>
                {verifyMessage.text}
              </div>
            )}

            <div className="space-y-4">
              <textarea
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                placeholder="Catatan revisi (wajib jika revisi)..."
                rows={3}
                disabled={verifying}
                className="w-full text-sm p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 min-h-[80px] transition-all resize-none"
              />

              <div className="flex gap-3 justify-end pt-4 border-t border-slate-200">
                <button
                  onClick={() => handleVerify(selectedDoc.id, "revisi")}
                  disabled={verifying || !catatan.trim()}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-red-600 border border-red-200 rounded-lg text-xs font-bold hover:bg-red-50 transition-all disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {verifying ? <Loader2 size={15} className="animate-spin" /> : <RotateCcw size={15} />}
                  Permintaan Revisi
                </button>
                <button
                  onClick={() => handleVerify(selectedDoc.id, "terverifikasi")}
                  disabled={verifying}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-500 text-white rounded-lg text-xs font-bold hover:bg-emerald-600 transition-all disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {verifying ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                  Verifikasi Dokumen
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
