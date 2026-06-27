"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Loader2, User, FileText, GraduationCap } from "lucide-react";

interface DosenDetail {
  id: number;
  nip: string | null;
  nidn: string | null;
  nama_lengkap: string | null;
  tanggal_lahir: string | null;
  jenis_kelamin: string | null;
  email_pribadi: string | null;
  alamat: string | null;
  jurusan: string | null;
  jabatan: string | null;
  program_studi: string | null;
  pangkat_golongan: string | null;
  no_telp: string | null;
  gelar: string | null;
  provinsi_lahir: string | null;
  kota_lahir: string | null;
  pendidikan_terakhir: string | null;
  bidang_keahlian: string | null;
  status_dosen: string | null;
  tanggal_lulus: string | null;
  user?: { email: string | null; username: string | null } | null;
}

interface DetailDosenModalProps {
  dosenId: number | null;
  isOpen: boolean;
  onClose: () => void;
  apiUrl: string;
  onEdit?: (id: number) => void;
}

function fmtDate(v: string | null | undefined) {
  if (!v) return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? v : d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</span>
      <span className="text-sm text-gray-800 font-medium">{value || "-"}</span>
    </div>
  );
}

export default function DetailDosenModal({ dosenId, isOpen, onClose, apiUrl, onEdit }: DetailDosenModalProps) {
  const [data, setData] = useState<DosenDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    if (!dosenId || !isOpen) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${apiUrl}/${dosenId}`);
      if (!res.ok) throw new Error("Gagal memuat data");
      const json = await res.json();
      setData(json.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [dosenId, isOpen, apiUrl]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Detail Data Dosen</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-8rem)] px-6 py-5">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-gray-400">
              <Loader2 className="animate-spin text-blue-500 mr-2" size={18} />
              <span className="text-sm font-medium">Memuat data...</span>
            </div>
          ) : error ? (
            <div className="text-center py-16 text-red-400 text-sm">{error}</div>
          ) : data ? (
            <div className="space-y-6">
              <div className="bg-blue-50 rounded-xl p-5 flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-bold">
                  {(data.nama_lengkap || "?").charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{data.nama_lengkap || "-"}</h3>
                  <p className="text-sm text-gray-500">NIP: {data.nip || "-"} | {data.jabatan || "-"}</p>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <h4 className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <User size={14} /> Identitas & Kepegawaian
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <Field label="NIP" value={data.nip} />
                  <Field label="NIDN" value={data.nidn} />
                  <Field label="Nama Lengkap" value={data.nama_lengkap} />
                  <Field label="Gelar" value={data.gelar} />
                  <Field label="Jenis Kelamin" value={data.jenis_kelamin} />
                  <Field label="Tanggal Lahir" value={fmtDate(data.tanggal_lahir)} />
                  <Field label="Provinsi Lahir" value={data.provinsi_lahir} />
                  <Field label="Kota Lahir" value={data.kota_lahir} />
                  <Field label="Email Pribadi" value={data.email_pribadi} />
                  <Field label="No. Telp" value={data.no_telp} />
                  <Field label="Alamat" value={data.alamat} />
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <h4 className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <FileText size={14} /> Pekerjaan & Jurusan
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <Field label="Jurusan" value={data.jurusan} />
                  <Field label="Program Studi" value={data.program_studi} />
                  <Field label="Jabatan Fungsional" value={data.jabatan} />
                  <Field label="Pangkat / Golongan" value={data.pangkat_golongan} />
                  <Field label="Status Dosen" value={data.status_dosen} />
                  <Field label="Bidang Keahlian" value={data.bidang_keahlian} />
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <h4 className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <GraduationCap size={14} /> Pendidikan & Studi
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <Field label="Pendidikan Terakhir" value={data.pendidikan_terakhir} />
                  <Field label="Tanggal Lulus" value={fmtDate(data.tanggal_lulus)} />
                </div>
              </div>


            </div>
          ) : null}
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Tutup
          </button>
          {onEdit && data && (
            <button
              onClick={() => onEdit(data.id)}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              Edit Data
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
