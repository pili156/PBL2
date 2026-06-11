"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2 } from "lucide-react";

export default function TambahBukuIndukPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // State untuk menampung data form sesuai dengan field di schema.prisma
  const [formData, setFormData] = useState({
    nip: "",
    nama_lengkap: "",
    email: "",
    pangkat_golongan: "",
    jabatan: "",
    unit_kerja: "",
    jurusan: "",
    program_studi: "",
    no_telp: "",
  });

  // Fungsi untuk handle perubahan input form
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Fungsi saat form disubmit (Klik Simpan)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validasi sederhana wajib isi
    if (!formData.nip || !formData.nama_lengkap || !formData.email) {
      setError("NIP, Nama Lengkap, dan Email wajib diisi!");
      setLoading(false);
      return;
    }

    try {
      // Mengirimkan data ke API route /api/buku-induk
      const response = await fetch("/api/buku-induk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Gagal menyimpan data pegawai.");
      }

      // Jika berhasil, munculkan alert dan redirect kembali ke tabel utama
      alert("Data pegawai berhasil ditambahkan ke Buku Induk!");
      router.push("/admin/buku-induk");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan koneksi sistem.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 bg-[#F8FAFC] min-h-screen text-[#1F1F1F]">
      {/* Header & Tombol Kembali */}
      <div className="mb-8 flex items-center gap-4">
        <Link
          href="/admin/buku-induk"
          className="p-2 bg-white rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors shadow-sm"
          aria-label="Kembali"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-[#0A192F]">Tambah Data Pegawai</h1>
          <p className="text-sm text-gray-400 mt-1">
            Input data dosen atau tendik baru ke dalam Buku Induk Digital SIGAP Polines.
          </p>
        </div>
      </div>

      {/* Kotak Utama Form */}
      <div className="max-w-3xl bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-[#CC3333] rounded-xl text-sm font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Input NIP */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-[#0A192F] uppercase tracking-wider">
                NIP / NIDN <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="nip"
                value={formData.nip}
                onChange={handleChange}
                placeholder="Masukkan NIP (Contoh: 1985...)"
                className="p-3 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-[#0085FF] focus:ring-1 focus:ring-[#0085FF] transition-all bg-[#F8FAFC]"
                required
              />
            </div>

            {/* Input Nama Lengkap */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-[#0A192F] uppercase tracking-wider">
                Nama Lengkap & Gelar <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="nama_lengkap"
                value={formData.nama_lengkap}
                onChange={handleChange}
                placeholder="Masukkan Nama Beserta Gelar"
                className="p-3 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-[#0085FF] focus:ring-1 focus:ring-[#0085FF] transition-all bg-[#F8FAFC]"
                required
              />
            </div>

            {/* Input Email */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-[#0A192F] uppercase tracking-wider">
                Email Instansi <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="contoh@polines.ac.id"
                className="p-3 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-[#0085FF] focus:ring-1 focus:ring-[#0085FF] transition-all bg-[#F8FAFC]"
                required
              />
            </div>

            {/* Input Pangkat / Golongan */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-[#0A192F] uppercase tracking-wider">
                Pangkat / Golongan
              </label>
              <input
                type="text"
                name="pangkat_golongan"
                value={formData.pangkat_golongan}
                onChange={handleChange}
                placeholder="Contoh: Penata / IIIc"
                className="p-3 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-[#0085FF] focus:ring-1 focus:ring-[#0085FF] transition-all bg-[#F8FAFC]"
              />
            </div>

            {/* Input Jabatan Fungsional */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-[#0A192F] uppercase tracking-wider">
                Jabatan Fungsional
              </label>
              <input
                type="text"
                name="jabatan"
                value={formData.jabatan}
                onChange={handleChange}
                placeholder="Contoh: Lektor / Asisten Ahli"
                className="p-3 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-[#0085FF] focus:ring-1 focus:ring-[#0085FF] transition-all bg-[#F8FAFC]"
              />
            </div>

            {/* Input Unit Kerja */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-[#0A192F] uppercase tracking-wider">
                Unit Kerja
              </label>
              <input
                type="text"
                name="unit_kerja"
                value={formData.unit_kerja}
                onChange={handleChange}
                placeholder="Contoh: Jurusan Teknik Elektro"
                className="p-3 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-[#0085FF] focus:ring-1 focus:ring-[#0085FF] transition-all bg-[#F8FAFC]"
              />
            </div>

            {/* Input No. Telp */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-[#0A192F] uppercase tracking-wider">
                No. Telepon
              </label>
              <input
                type="text"
                name="no_telp"
                value={formData.no_telp}
                onChange={handleChange}
                placeholder="Contoh: 08123456789"
                className="p-3 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-[#0085FF] focus:ring-1 focus:ring-[#0085FF] transition-all bg-[#F8FAFC]"
              />
            </div>

            {/* Input Jurusan */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-[#0A192F] uppercase tracking-wider">
                Jurusan
              </label>
              <select
                name="jurusan"
                value={formData.jurusan}
                onChange={handleChange}
                className="p-3 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-[#0085FF] focus:ring-1 focus:ring-[#0085FF] transition-all bg-[#F8FAFC]"
              >
                <option value="">-- Pilih Jurusan --</option>
                <option value="Teknik Elektro">Teknik Elektro</option>
                <option value="Teknik Mesin">Teknik Mesin</option>
                <option value="Teknik Sipil">Teknik Sipil</option>
                <option value="Akuntansi">Akuntansi</option>
                <option value="Administrasi Bisnis">Administrasi Bisnis</option>
              </select>
            </div>

            {/* Input Program Studi */}
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-xs font-bold text-[#0A192F] uppercase tracking-wider">
                Program Studi
              </label>
              <input
                type="text"
                name="program_studi"
                value={formData.program_studi}
                onChange={handleChange}
                placeholder="Contoh: D4 Teknologi Rekayasa Komputer"
                className="p-3 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-[#0085FF] focus:ring-1 focus:ring-[#0085FF] transition-all bg-[#F8FAFC]"
              />
            </div>
          </div>

          {/* Tombol Aksi */}
          <div className="flex justify-end gap-4 border-t border-gray-100 pt-6 mt-6">
            <Link
              href="/admin/buku-induk"
              className="px-5 py-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-50 transition-all"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="bg-[#0085FF] hover:bg-[#006ACC] text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Menyimpan...
                </>
              ) : (
                <>
                  <Save size={18} /> Simpan Data Pegawai
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}