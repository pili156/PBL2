"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import BackLink from "@/app/components/BackLink";
import { ArrowLeft, UploadCloud, Check, Loader2, User, FileText, MapPin, ShieldCheck, AlertCircle } from "lucide-react";

type Props = {
  params: Promise<{ id: string }>;
};

export default function ManajemenStatusPage({ params }: Props) {
  const [id, setId] = useState<string>("");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function fetchParams() {
      const resolved = await params;
      setId(resolved.id);
    }
    fetchParams();
  }, [params]);

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  async function fetchData() {
    try {
      const response = await fetch(`/api/admin/pengajuan-monitoring/${id}`);
      if (response.ok) {
        const result = await response.json();
        setData(result);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setMessage({ type: 'error', text: 'Hanya file PDF yang diperbolehkan' });
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'File maksimal 5MB' });
        return;
      }
      setSelectedFile(file);
      setMessage(null);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    
    if (!selectedFile) {
      setMessage({ type: 'error', text: 'Silakan pilih file SK terlebih dahulu' });
      return;
    }

    if (!selectedStatus) {
      setMessage({ type: 'error', text: 'Silakan pilih status verifikasi terlebih dahulu' });
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('status_pengajuan', selectedStatus);
    formData.append('status_studi', 'aktif');

    setUploading(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/admin/status/${id}/sk`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'SK berhasil diupload dan disimpan!' });
        setSelectedFile(null);
        setSelectedStatus("");
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        fetchData();
      } else {
        setMessage({ type: 'error', text: result.error || 'Gagal upload SK' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Terjadi kesalahan saat upload' });
    } finally {
      setUploading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex-1 p-8 flex flex-col items-center justify-center min-h-screen bg-slate-50">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
        <p className="text-sm font-medium text-slate-500">Memuat data pengajuan...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 bg-slate-50 min-h-screen flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-sm border border-slate-200 max-w-md w-full">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={32} />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Data Tidak Ditemukan</h2>
          <p className="text-sm text-slate-500 mb-6">Pengajuan yang Anda cari tidak ada atau telah dihapus.</p>
          <BackLink href="/admin/status" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 bg-slate-50 min-h-screen">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-2">
          <Link 
            href="/admin/status" 
            className="p-2 hover:bg-slate-200 bg-white shadow-sm border border-slate-200 rounded-full transition-all text-slate-600 hover:text-slate-900" 
            aria-label="Kembali"
          >
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">Upload SK & Verifikasi</h1>
        </div>
        <p className="text-sm text-slate-500 font-medium pl-14">
          Manajemen Status <span className="mx-2">•</span> <span className="text-slate-800">Penerbitan Surat Keputusan</span>
        </p>
      </div>

      {/* Alert Message */}
      {message && (
        <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 font-medium text-sm border shadow-sm ${
          message.type === 'success' 
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
            : 'bg-red-50 text-red-700 border-red-200'
        }`}>
          {message.type === 'success' ? (
            <div className="bg-emerald-100 p-1 rounded-full"><Check size={16} /></div>
          ) : (
            <div className="bg-red-100 p-1 rounded-full"><AlertCircle size={16} /></div>
          )}
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
          
          {/* Kolom Kiri: Form Upload & Status (Mendominasi 2 Kolom) */}
          <div className="xl:col-span-2 flex flex-col gap-6">
            <div className="bg-white p-6 lg:p-8 rounded-2xl shadow-sm border border-slate-200 flex flex-col h-full">
              
              <div className="mb-6">
                <h2 className="font-bold text-lg text-slate-900">Dokumen Surat Keputusan (SK)</h2>
                <p className="text-sm text-slate-500 mt-1">Unggah dokumen resmi SK dalam format PDF. Ukuran maksimal 5MB.</p>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              
              {/* Dropzone Area */}
              <label 
                htmlFor="file-upload"
                className={`flex-1 border-2 border-dashed rounded-xl p-8 lg:p-12 flex flex-col items-center justify-center cursor-pointer transition-all group ${
                  selectedFile 
                    ? 'border-emerald-300 bg-emerald-50/50 hover:bg-emerald-50' 
                    : 'border-blue-200 bg-blue-50/30 hover:bg-blue-50/80 hover:border-blue-300'
                }`}
              >
                <div className={`p-4 rounded-full shadow-sm mb-5 transition-transform group-hover:scale-110 ${
                  selectedFile ? 'bg-emerald-100 text-emerald-600' : 'bg-white border border-blue-100 text-blue-500'
                }`}>
                  {selectedFile ? <Check size={32} /> : <UploadCloud size={32} />}
                </div>
                
                {selectedFile ? (
                  <div className="text-center">
                    <p className="text-sm font-bold text-emerald-700">{selectedFile.name}</p>
                    <p className="text-xs text-emerald-600/70 mt-2 font-medium">Klik untuk mengganti file dokumen</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-sm font-bold text-slate-700">Klik untuk mencari dokumen SK</p>
                    <p className="text-xs text-slate-400 mt-2">Hanya mendukung format .PDF</p>
                  </div>
                )}
              </label>

              {/* Pemilihan Status Baru */}
              <div className="mt-8 border-t border-slate-100 pt-6">
                <label className="block text-sm font-bold text-slate-700 mb-2">Update Status Verifikasi Akhir</label>
                <p className="text-xs text-slate-500 mb-4">Tentukan status pengajuan setelah SK ini diterbitkan.</p>
                <select 
                  name="status_pengajuan"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  required
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-[#0085FF] font-bold text-sm text-[#434343] cursor-pointer"
                >
                  <option value="" disabled selected>Pilih status persetujuan...</option>
                  <option value="diterima">Diterima (Disetujui)</option>
                  <option value="pending">Pending (Menunggu)</option>
                  <option value="revisi">Butuh Revisi</option>
                </select>
              </div>

            </div>
          </div>

          {/* Kolom Kanan: Informasi Dosen (Sidebar Info) */}
          <div className="xl:col-span-1">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 sticky top-8">
              <h2 className="font-bold text-lg text-slate-900 mb-6 flex items-center gap-2">
                <User size={20} className="text-slate-400" />
                Informasi Pemohon
              </h2>
              
              <div className="space-y-5">
                {/* Info Item */}
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block flex items-center gap-1.5">
                    <User size={14} /> Nama Lengkap
                  </label>
                  <p className="font-semibold text-slate-800 text-sm bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
                    {data.nama_lengkap || "-"}
                  </p>
                </div>

                {/* Info Item */}
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block flex items-center gap-1.5">
                    <FileText size={14} /> NIP / Identitas
                  </label>
                  <p className="font-mono font-medium text-slate-700 text-sm bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
                    {data.nip || "-"}
                  </p>
                </div>

                {/* Info Item */}
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block flex items-center gap-1.5">
                    <MapPin size={14} /> Wilayah Studi
                  </label>
                  <p className="font-semibold text-slate-800 text-sm bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
                    {data.wilayah_studi || "-"}
                  </p>
                </div>

              <div className="pt-8 mt-4 border-t border-gray-50 flex justify-between items-center">
                <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Status Saat Ini</span>
                <span className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] ${
                  data.status === 'diterima' || data.status === 'terverifikasi'
                    ? 'bg-[#C4F2C9] text-[#2D7336]' 
                    : 'bg-[#FFE2E2] text-[#CC3333]'
                }`}>
                  {data.status || "pending"}
                </span>
              </div>

              {data.sk_kementerian && data.sk_kementerian.length > 0 && (
                <div className="pt-6 mt-4 border-t border-gray-50">
                  <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest block mb-3">SK Tugas Belajar</span>
                  {data.sk_kementerian.map((sk: any) => (
                    <div key={sk.id} className="bg-blue-50 rounded-xl p-4 space-y-2">
                      {sk.nomor_sk && (
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] text-gray-400 font-black uppercase">Nomor SK</span>
                          <span className="text-xs font-bold text-[#1F1F1F]">{sk.nomor_sk}</span>
                        </div>
                      )}
                      {sk.tanggal_terbit && (
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] text-gray-400 font-black uppercase">Terbit</span>
                          <span className="text-xs font-bold text-[#1F1F1F]">{sk.tanggal_terbit}</span>
                        </div>
                      )}
                      {sk.file_sk_path && (
                        <a
                          href={sk.file_sk_path}
                          target="_blank"
                          className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors block text-center mt-2"
                        >
                          Lihat Dokumen SK
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-12 flex justify-end">
          <button 
            type="submit"
            disabled={uploading || !selectedStatus}
            className="bg-[#0085FF] text-white px-14 py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-blue-100 hover:bg-[#006ACC] hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {uploading ? (
              <>
                <Loader2 className="animate-spin" size={16} />
               Mengupload...
              </>
            ) : (
              'Simpan & Terbitkan SK'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}