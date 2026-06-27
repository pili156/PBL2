"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import DetailHeader from "../components/DetailHeader";
import DocumentList from "../components/DocumentList";
import DocumentViewer from "../components/DocumentViewer";
import AdminComments from "../components/AdminComments";
import { PengajuanDetail, DokumenDetail } from "../types";

export default function DetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [pengajuan, setPengajuan] = useState<PengajuanDetail | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<DokumenDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  useEffect(() => {
    fetchDetail();
  }, [id]);

  useEffect(() => {
    if (pengajuan && pengajuan.dokumen.length > 0) {
      setSelectedDoc(pengajuan.dokumen[0]);
    }
  }, [pengajuan]);

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/pengajuan-monitoring/${id}`);
      const result = await response.json();

      if (response.ok) {
        setPengajuan(result);
      } else {
        setMessage({
          type: "error",
          text: result?.error || "Gagal memuat data",
        });
      }
    } catch (error) {
      console.error("Error fetching detail:", error);
      setMessage({ type: "error", text: "Terjadi kesalahan" });
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (
    documentId: number,
    status: string,
    catatan: string
  ) => {
    setUpdating(true);
    try {
      const response = await fetch(`/api/admin/pengajuan-monitoring/dokumen/${documentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status_verifikasi: status,
          catatan_revisi: catatan,
        }),
      });

      if (response.ok) {
        setMessage({
          type: "success",
          text: `Dokumen berhasil diperbarui dengan status ${status}`,
        });
        await fetchDetail();
      } else {
        setMessage({ type: "error", text: "Gagal memperbarui dokumen" });
      }
    } catch (error) {
      console.error("Error updating document:", error);
      setMessage({ type: "error", text: "Terjadi kesalahan" });
    } finally {
      setUpdating(false);
    }
  };

  const handleReject = async () => {
    if (!pengajuan) return;
    const confirmed = window.confirm("Apakah Anda yakin ingin menolak pengajuan ini?");
    if (!confirmed) return;

    setUpdating(true);
    try {
      const response = await fetch(`/api/admin/pengajuan-monitoring/${id}/reject`, {
        method: "POST",
      });

      if (response.ok) {
        setMessage({ type: "success", text: "Pengajuan berhasil ditolak" });
        await fetchDetail();
      } else {
        const result = await response.json();
        setMessage({ type: "error", text: result?.error || "Gagal menolak pengajuan" });
      }
    } catch (error) {
      console.error("Error rejecting pengajuan:", error);
      setMessage({ type: "error", text: "Terjadi kesalahan" });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <p className="text-center text-slate-500 py-8">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Message */}
      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Header */}
      <DetailHeader
        pengajuan={pengajuan}
        allDocumentsVerified={
          pengajuan !== null &&
          pengajuan.dokumen.length > 0 &&
          pengajuan.dokumen.every((doc) => doc.status_verifikasi === "terverifikasi")
        }
        hasSkUploaded={
          pengajuan !== null &&
          pengajuan.sk_kementerian !== undefined &&
          pengajuan.sk_kementerian.some((sk) => sk.file_sk_path !== null)
        }
        onReject={handleReject}
      />

      {/* Info Cards */}
      {pengajuan && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border border-slate-200">
            <p className="text-xs text-slate-600 font-medium">JENIS STUDI</p>
            <p className="text-sm font-semibold text-slate-900 mt-2">
              {pengajuan.jenis_studi || "-"}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-slate-200">
            <p className="text-xs text-slate-600 font-medium">JALUR PENDANAAN</p>
            <p className="text-sm font-semibold text-slate-900 mt-2">
              {pengajuan.jalur_pendanaan}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-slate-200">
            <p className="text-xs text-slate-600 font-medium">WILAYAH STUDI</p>
            <p className="text-sm font-semibold text-slate-900 mt-2">
              {pengajuan.wilayah_studi}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-slate-200">
            <p className="text-xs text-slate-600 font-medium">TANGGAL PENGAJUAN</p>
            <p className="text-sm font-semibold text-slate-900 mt-2">
              {pengajuan.tanggal_pengajuan}
            </p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Documents List */}
        <div>
          <DocumentList
            documents={pengajuan?.dokumen || []}
            selectedDoc={selectedDoc}
            onSelectDoc={setSelectedDoc}
          />
        </div>

        {/* Viewer and Comments */}
        <div className="lg:col-span-2 space-y-6">
          <DocumentViewer document={selectedDoc} />
          <AdminComments
            document={selectedDoc}
            onVerify={handleVerify}
            isLoading={updating}
          />
        </div>
      </div>
    </div>
  );
}
