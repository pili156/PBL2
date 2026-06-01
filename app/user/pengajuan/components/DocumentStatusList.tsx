"use client";

import { useEffect, useState } from "react";
import { FileText, Check, AlertCircle, Clock, Download, Award, Upload, Loader2 } from "lucide-react";

type Dokumen = {
  id: number;
  nama_dokumen: string;
  file_path: string | null;
  status_verifikasi: string;
  catatan_revisi: string | null;
};

type SK = {
  id: number;
  nomor_sk: string | null;
  file_sk_path: string | null;
  tanggal_terbit: string | null;
  status_studi: string | null;
};

type PengajuanData = {
  id: number;
  jenis_studi: string | null;
  jalur_pendanaan: string | null;
  wilayah_studi: string | null;
  status: string;
  tanggal_pengajuan: string;
  created_at: string;
  dokumen: Dokumen[];
  sk: SK | null;
};

export default function DocumentStatusList() {
  const [data, setData] = useState<PengajuanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploads, setUploads] = useState<Record<number, { file: File | null; uploading: boolean; error: string | null }>>({});

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/user/pengajuan');
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError('Gagal memuat data pengajuan');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleFileSelect = (docId: number, file: File) => {
    if (file.type !== 'application/pdf') {
      setUploads(prev => ({ ...prev, [docId]: { file: null, uploading: false, error: 'Format file harus PDF' } }));
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setUploads(prev => ({ ...prev, [docId]: { file: null, uploading: false, error: 'Ukuran file tidak boleh lebih dari 2MB' } }));
      return;
    }
    setUploads(prev => ({ ...prev, [docId]: { file, uploading: false, error: null } }));
  };

  const handleResubmit = async (docId: number) => {
    const upload = uploads[docId];
    if (!upload?.file) return;

    setUploads(prev => ({ ...prev, [docId]: { ...prev[docId], uploading: true, error: null } }));

    try {
      const formData = new FormData();
      formData.append('file', upload.file);

      const response = await fetch(`/api/pengajuan/${data!.id}/dokumen/${docId}`, {
        method: 'PUT',
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Gagal mengunggah');
      }

      const result = await response.json();

      setData(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          dokumen: prev.dokumen.map(d =>
            d.id === docId
              ? { ...d, file_path: result.filePath, status_verifikasi: 'menunggu', catatan_revisi: null }
              : d
          ),
        };
      });

      setUploads(prev => {
        const next = { ...prev };
        delete next[docId];
        return next;
      });
    } catch (err) {
      setUploads(prev => ({
        ...prev,
        [docId]: { ...prev[docId], uploading: false, error: err instanceof Error ? err.message : 'Gagal mengunggah' },
      }));
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
            {status.toUpperCase()}
          </span>
        );
    }
  };

  const getStatusOverall = () => {
    if (!data) return null;
    const allTerverifikasi = data.dokumen.every((d) => d.status_verifikasi === 'terverifikasi');
    const hasRevisi = data.dokumen.some((d) => d.status_verifikasi === 'revisi');
    if (allTerverifikasi) return 'Terverifikasi';
    if (hasRevisi) return 'Revisi';
    return 'Pending';
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 w-8 bg-blue-500 rounded-full mb-4"></div>
          <p className="text-slate-500">Memuat data...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500">{error || 'Data tidak ditemukan'}</p>
      </div>
    );
  }

  const overallStatus = getStatusOverall();

  return (
    <div className="w-full space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Status Pengajuan</h2>
            <p className="text-sm text-slate-500">Nomor: PLG-{data.id.toString().slice(-6)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400 mb-1">Status Keseluruhan</p>
            {getStatusBadge(overallStatus || 'pending')}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-50 p-4 rounded-lg">
            <p className="text-xs text-slate-400 mb-1">Jenis Studi</p>
            <p className="font-medium text-slate-900">{data.jenis_studi || '-'}</p>
          </div>
          <div className="bg-slate-50 p-4 rounded-lg">
            <p className="text-xs text-slate-400 mb-1">Pendanaan</p>
            <p className="font-medium text-slate-900">{data.jalur_pendanaan || '-'}</p>
          </div>
          <div className="bg-slate-50 p-4 rounded-lg">
            <p className="text-xs text-slate-400 mb-1">Wilayah</p>
            <p className="font-medium text-slate-900">{data.wilayah_studi || '-'}</p>
          </div>
          <div className="bg-slate-50 p-4 rounded-lg">
            <p className="text-xs text-slate-400 mb-1">Tanggal Pengajuan</p>
            <p className="font-medium text-slate-900">{data.tanggal_pengajuan || '-'}</p>
          </div>
        </div>

        {data.sk && data.sk.file_sk_path && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Award size={20} className="text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-blue-900">Surat Keputusan (SK)</p>
                  <p className="text-sm text-blue-700">
                    No: {data.sk.nomor_sk || 'Belum ada'} | {data.sk.tanggal_terbit || 'Belum ditetapkan'}
                  </p>
                </div>
              </div>
              <a
                href={data.sk.file_sk_path}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
              >
                <Download size={16} />
                Unduh SK
              </a>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-lg font-semibold mb-4">
          Daftar Dokumen submitted <span className="text-slate-400">({data.dokumen.length} items)</span>
        </h3>
        
        <div className="space-y-3 max-h-[500px] overflow-y-auto">
          {data.dokumen.map((doc) => (
            <div
              key={doc.id}
              className="p-4 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    {doc.status_verifikasi === 'terverifikasi' ? (
                      <Check size={18} className="text-green-500" />
                    ) : doc.status_verifikasi === 'revisi' ? (
                      <AlertCircle size={18} className="text-red-500" />
                    ) : (
                      <Clock size={18} className="text-yellow-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm text-slate-900">
                      {doc.nama_dokumen}
                    </h4>
                    {doc.catatan_revisi && (
                      <p className="text-xs text-red-600 mt-1">
                        Catatan: {doc.catatan_revisi}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(doc.status_verifikasi)}
                  {doc.file_path && (
                    <a
                      href={doc.file_path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="Lihat dokumen"
                    >
                      <FileText size={16} />
                    </a>
                  )}
                </div>
              </div>
              {doc.status_verifikasi === 'revisi' && (
                <div className="mt-3 pt-3 border-t border-red-100">
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="file"
                      accept=".pdf"
                      hidden
                      id={`resubmit-file-${doc.id}`}
                      onChange={(e) => {
                        if (e.target.files?.[0]) handleFileSelect(doc.id, e.target.files[0]);
                      }}
                    />
                    <button
                      onClick={() => document.getElementById(`resubmit-file-${doc.id}`)?.click()}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                    >
                      <Upload size={14} />
                      Pilih File
                    </button>
                    {uploads[doc.id]?.file && (
                      <span className="text-xs text-slate-600 truncate max-w-[180px]">
                        {uploads[doc.id].file!.name}
                      </span>
                    )}
                    {uploads[doc.id]?.file && !uploads[doc.id]?.uploading && (
                      <button
                        onClick={() => handleResubmit(doc.id)}
                        className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                      >
                        Kirim Ulang
                      </button>
                    )}
                    {uploads[doc.id]?.uploading && (
                      <div className="flex items-center gap-2">
                        <Loader2 size={14} className="animate-spin text-blue-600" />
                        <span className="text-xs text-blue-600">Mengirim ulang...</span>
                      </div>
                    )}
                  </div>
                  {uploads[doc.id]?.error && (
                    <p className="text-xs text-red-600 mt-1">{uploads[doc.id].error}</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}