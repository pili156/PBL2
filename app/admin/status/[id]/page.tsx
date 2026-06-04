"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ChevronLeft, UploadCloud, Check, Loader2 } from "lucide-react";

type Props = {
  params: Promise<{ id: string }>;
};

export default function ManajemenStatusPage({ params }: Props) {
  const [id, setId] = useState<string>("");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
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

    const formData = new FormData();
    formData.append('file', selectedFile);
    
    const statusSelect = (e.currentTarget.elements.namedItem('status_pengajuan') as HTMLSelectElement);
    const statusPengajuan = statusSelect?.value;
    
    formData.append('status_pengajuan', statusPengajuan);
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
      <div className="p-8 bg-[#F8FAFC] min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2 text-slate-500">
          <Loader2 className="animate-spin" size={24} />
          <span>Memuat data...</span>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 bg-[#F8FAFC] min-h-screen">
        <div className="text-center">
          <p className="text-red-500">Data tidak ditemukan</p>
          <Link href="/admin/status" className="text-blue-600 hover:underline mt-2 inline-block">
            Kembali ke daftar
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-[#F8FAFC] min-h-screen">
      {/* Header Section dengan Judul Baru */}
      <div className="mb-10">
        <div className="flex items-center gap-4 mb-2">
          <Link href="/admin/status" className="p-2 hover:bg-gray-200 rounded-full transition-all">
            <ChevronLeft size={28} className="text-[#0A192F]" />
          </Link>
          <h1 className="text-3xl font-bold text-[#0A192F]">Upload SK</h1>
        </div>
        <p className="text-sm text-gray-400 font-medium ml-14">
          Dashboard {'>'} <span className="text-gray-500 font-bold">Status</span>
        </p>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
          message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.type === 'success' ? <Check size={20} /> : <span className="text-xl">⚠️</span>}
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-[#1F1F1F]">
          {/* Kolom Kiri: Form Upload & Status */}
          <div className="lg:col-span-2 bg-white p-10 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between">
            <div>
              <h2 className="font-bold text-xl mb-2 text-[#0A192F]">Penerbitan Surat Keputusan</h2>
              <p className="text-sm text-gray-400 mb-8 font-medium italic">Harap unggah dokumen resmi dalam format PDF (Maks. 5MB).</p>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              
              <label 
                htmlFor="file-upload"
                className={`border-2 border-dashed rounded-2xl p-20 flex flex-col items-center justify-center cursor-pointer transition-all group ${
                  selectedFile 
                    ? 'border-green-300 bg-green-50' 
                    : 'border-blue-100 bg-blue-50/20 hover:bg-blue-50'
                }`}
              >
                <div className={`bg-white p-6 rounded-full shadow-lg mb-6 group-hover:scale-110 transition-transform ${
                  selectedFile ? 'bg-green-100' : ''
                }`}>
                  {selectedFile ? (
                    <Check size={48} className="text-green-600" />
                  ) : (
                    <UploadCloud size={48} className="text-[#0085FF]" />
                  )}
                </div>
                {selectedFile ? (
                  <div className="text-center">
                    <p className="text-base font-bold text-green-700 uppercase tracking-widest">{selectedFile.name}</p>
                    <p className="text-[10px] text-green-600 mt-3 font-black">File dipilih - Klik untuk ganti</p>
                  </div>
                ) : (
                  <>
                    <p className="text-base font-bold text-[#0A192F] uppercase tracking-widest">Klik untuk Unggah SK Resmi</p>
                    <p className="text-[10px] text-gray-400 mt-3 font-black tracking-widest">SUPPORTED FORMAT: PDF ONLY</p>
                  </>
                )}
              </label>

              {/* Dropdown Status: Kosong di awal, lalu pilih DITERIMA */}
              <div className="mt-12">
                <label className="block text-[10px] font-black text-[#434343] mb-4 uppercase tracking-[0.2em]">Update Status Verifikasi:</label>
                <select 
                  name="status_pengajuan"
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-[#0085FF] font-bold text-sm text-[#434343] cursor-pointer"
                >
                  <option value="">Pilih Status Baru...</option>
                  <option value="diterima">DITERIMA</option>
                  <option value="pending">PENDING</option>
                  <option value="revisi">REVISI</option>
                </select>
              </div>
            </div>
          </div>

          {/* Kolom Kanan: Informasi Dosen */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 h-fit">
            <h2 className="font-bold text-xl text-[#0A192F] mb-8 border-b border-gray-50 pb-5">Informasi Dosen</h2>
            <div className="space-y-7">
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-400 font-black uppercase mb-1.5 tracking-[0.15em]">Nama Lengkap</span>
                <span className="font-bold text-[#1F1F1F] text-sm">{data.nama_lengkap || "-"}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-400 font-black uppercase mb-1.5 tracking-[0.15em]">NIP</span>
                <span className="font-bold font-mono text-[#1F1F1F] text-sm">{data.nip || "-"}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-400 font-black uppercase mb-1.5 tracking-[0.15em]">Wilayah</span>
                <span className="font-bold text-[#1F1F1F] text-sm">{data.wilayah_studi || "-"}</span>
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
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-12 flex justify-end">
          <button 
            type="submit"
            disabled={uploading}
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