"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2, AlertCircle } from "lucide-react";

export default function EditBukuIndukExcelPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id; 

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  // State menampung 34 field master sesuai struktur Excel TUBEL
  const [formData, setFormData] = useState({
    dosen_tendik: "",
    jurusan_bagian_upa: "",
    nama: "",
    nip: "",
    jabatan: "",
    status_kuliah: "",
    tanggal_lulus: "",
    jenis_pengajuan_studi: "",
    jenis_tugas_belajar: "",
    tingkat_prioritas_pembinaan: "",
    monitoring: "",
    periode_studi: "",
    tmt_tubel: "",
    selesai_tubel: "",
    jurusan_studi: "",
    tahun_anggaran: "",
    no_sk_tubel: "",
    tanggal_sk_tubel: "",
    tanggal_upload_aplikasi: "",
    link_sk_tubel: "",
    link_pengajuan_ibel_tb: "",
    periode_perpanjangan_tubel: "",
    no_sk_perpanjangan_tubel: "",
    link_sk_perpanjangan_tubel: "",
    no_persetujuan_perjadin_setneg: "",
    link_persetujuan_setneg: "",
    masa_pemberhentian_tunjangan: "",
    pemberhentian_tunjangan: "",
    ijazah_transkrip: "",
    dokumen_pengaktifan_kembali: "",
    pendidikan_terakhir: "",
    catatan: "",
  });

  // Fungsi load data lama dengan proteksi SAFE FETCH (Anti Crash)
  useEffect(() => {
    async function loadDataDosen() {
      if (!id) return;
      try {
        setFetching(true);
        
        // Mencoba mengambil data dari API Route
        const response = await fetch(`/api/buku-induk/${id}`);
        
        if (response.ok) {
          const result = await response.json();
          if (result.data) {
            // Gabungkan data dari DB dengan state default agar field yang kosong ga bermasalah
            setFormData((prev) => ({ ...prev, ...result.data }));
          }
        } else {
          // JIKA API NOT FOUND / ERROR: Jangan di-throw error biar ga crash merah!
          console.warn(`API Route /api/buku-induk/${id} merespon status ${response.status}. Menggunakan form kosong.`);
        }
      } catch (err: any) {
        console.error("Gagal fetch data lama, sistem dialihkan ke form kosong:", err.message);
      } finally {
        setFetching(false);
      }
    }
    loadDataDosen();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Mengirimkan pembaruan data ke backend API Route PUT
      const response = await fetch(`/api/buku-induk/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Gagal memperbarui data.");

      alert("Data Buku Induk Pegawai berhasil diperbarui!");
      router.push("/master_admin/buku-induk");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan sistem saat menyimpan.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="p-8 min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center text-gray-500 font-medium">
        <Loader2 className="animate-spin text-[#0085FF] mb-2" size={32} />
        Sedang memuat data master excel ke dalam form edit...
      </div>
    );
  }

  return (
    <div className="p-8 bg-[#F8FAFC] min-h-screen text-[#1F1F1F]">
      {/* Batas Atas Halaman */}
      <div className="mb-8 flex items-center gap-4">
        <Link
          href="/master_admin/buku-induk"
          className="p-2 bg-white rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 shadow-sm transition-all"
          aria-label="Kembali"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-[#0A192F]">Edit Data Master Pegawai</h1>
          <p className="text-sm text-gray-400 mt-1">Form sinkronisasi 34 data kolom Excel Master TUBEL SIGAP Polines.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-[#CC3333] rounded-xl text-sm font-semibold flex items-center gap-2">
            <AlertCircle size={18} /> {error}
          </div>
        )}

        {/* GRUP 1: BIODATA & IDENTITAS UTAMA */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
          <h2 className="text-base font-extrabold text-[#0085FF] uppercase tracking-wider mb-6 pb-2 border-b border-gray-100">
            I. Identitas & Satuan Kerja Kepegawaian
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-[#0A192F] uppercase tracking-wider">1. DOSEN / TENDIK</label>
              <select name="dosen_tendik" value={formData.dosen_tendik} onChange={handleChange} className="p-3 border border-gray-200 rounded-xl text-sm font-medium focus:border-[#0085FF] bg-[#F8FAFC]">
                <option value="">-- Pilih Kategori --</option>
                <option value="DOSEN">DOSEN</option>
                <option value="TENDIK">TENDIK</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-[#0A192F] uppercase tracking-wider">2. JURUSAN / BAGIAN / UPA</label>
              <input type="text" name="jurusan_bagian_upa" value={formData.jurusan_bagian_upa} onChange={handleChange} placeholder="Contoh: Teknik Elektro" className="p-3 border border-gray-200 rounded-xl text-sm font-medium bg-[#F8FAFC]" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-[#0A192F] uppercase tracking-wider">3. NAMA PEGAWAI</label>
              <input type="text" name="nama" value={formData.nama} onChange={handleChange} placeholder="Nama beserta gelar lengkap" className="p-3 border border-gray-200 rounded-xl text-sm font-bold text-[#0A192F] bg-[#F8FAFC]" required />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-[#0A192F] uppercase tracking-wider">4. NIP / NIDN</label>
              <input type="text" name="nip" value={formData.nip} onChange={handleChange} className="p-3 border border-gray-200 rounded-xl text-sm font-mono bg-[#F8FAFC]" required />
            </div>
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-xs font-bold text-[#0A192F] uppercase tracking-wider">5. JABATAN FUNGSIONAL</label>
              <input type="text" name="jabatan" value={formData.jabatan} onChange={handleChange} placeholder="Contoh: Lektor / Asisten Ahli" className="p-3 border border-gray-200 rounded-xl text-sm font-medium bg-[#F8FAFC]" />
            </div>
          </div>
        </div>

        {/* GRUP 2: STATUS, REKOMENDASI & PRIORITAS STUDI LAKU */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
          <h2 className="text-base font-extrabold text-[#0085FF] uppercase tracking-wider mb-6 pb-2 border-b border-gray-100">
            II. Status Studi & Tingkat Pembinaan Perguruan Tinggi
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-[#0A192F] uppercase tracking-wider">6. STATUS KULIAH</label>
              <select name="status_kuliah" value={formData.status_kuliah} onChange={handleChange} className="p-3 border border-gray-200 rounded-xl text-sm font-medium bg-[#F8FAFC]">
                <option value="Belum Lulus">Belum Lulus</option>
                <option value="Lulus">Lulus</option>
                <option value="Perpanjangan">Perpanjangan</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-[#0A192F] uppercase tracking-wider">7. TANGGAL LULUS</label>
              <input type="date" name="tanggal_lulus" value={formData.tanggal_lulus} onChange={handleChange} className="p-3 border border-gray-200 rounded-xl text-sm bg-[#F8FAFC]" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-[#0A192F] uppercase tracking-wider">8. JENIS PENGAJUAN STUDI</label>
              <input type="text" name="jenis_pengajuan_studi" value={formData.jenis_pengajuan_studi} onChange={handleChange} placeholder="Contoh: Tugas Belajar" className="p-3 border border-gray-200 rounded-xl text-sm bg-[#F8FAFC]" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-[#0A192F] uppercase tracking-wider">9. JENIS TUGAS BELAJAR</label>
              <input type="text" name="jenis_tugas_belajar" value={formData.jenis_tugas_belajar} onChange={handleChange} placeholder="Contoh: Tanpa Tupoksi" className="p-3 border border-gray-200 rounded-xl text-sm bg-[#F8FAFC]" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-[#0A192F] uppercase tracking-wider">10. TINGKAT PRIORITAS PEMBINAAN 2025</label>
              <input type="text" name="tingkat_prioritas_pembinaan" value={formData.tingkat_prioritas_pembinaan} onChange={handleChange} className="p-3 border border-gray-200 rounded-xl text-sm bg-[#F8FAFC]" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-[#0A192F] uppercase tracking-wider">11. MONITORING PERKEMBANGAN</label>
              <input type="text" name="monitoring" value={formData.monitoring} onChange={handleChange} className="p-3 border border-gray-200 rounded-xl text-sm bg-[#F8FAFC]" />
            </div>
          </div>
        </div>

        {/* GRUP 3: DETAIL AKADEMIK & KAMPUS TEMPAT STUDI */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
          <h2 className="text-base font-extrabold text-[#0085FF] uppercase tracking-wider mb-6 pb-2 border-b border-gray-100">
            III. Rincian Tempat & Durasi Masa Studi Serta Anggaran
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-[#0A192F] uppercase tracking-wider">12. PERIODE STUDI (DURASI)</label>
              <input type="text" name="periode_studi" value={formData.periode_studi} onChange={handleChange} placeholder="Contoh: 1 Okt 2021 – 30 Sep 2024" className="p-3 border border-gray-200 rounded-xl text-sm bg-[#F8FAFC]" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-[#0A192F] uppercase tracking-wider">13. TMT TUBEL</label>
              <input type="date" name="tmt_tubel" value={formData.tmt_tubel} onChange={handleChange} className="p-3 border border-gray-200 rounded-xl text-sm bg-[#F8FAFC]" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-[#0A192F] uppercase tracking-wider">14. SELESAI TUBEL</label>
              <input type="date" name="selesai_tubel" value={formData.selesai_tubel} onChange={handleChange} className="p-3 border border-gray-200 rounded-xl text-sm bg-[#F8FAFC]" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-[#0A192F] uppercase tracking-wider">15. JURUSAN STUDI</label>
              <input type="text" name="jurusan_studi" value={formData.jurusan_studi} onChange={handleChange} placeholder="Contoh: Ilmu Komputer" className="p-3 border border-gray-200 rounded-xl text-sm bg-[#F8FAFC]" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-[#0A192F] uppercase tracking-wider">18. JENJANG PENDIDIKAN</label>
              <select name="pendidikan_terakhir" value={formData.pendidikan_terakhir} onChange={handleChange} className="p-3 border border-gray-200 rounded-xl text-sm bg-[#F8FAFC]">
                <option value="">-- Pilih Jenjang --</option>
                <option value="S1">S1</option>
                <option value="S2">S2</option>
                <option value="S3">S3</option>
              </select>
            </div>
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-xs font-bold text-[#0A192F] uppercase tracking-wider">19. TAHUN ANGGARAN REIMBURSE</label>
              <input type="text" name="tahun_anggaran" value={formData.tahun_anggaran} onChange={handleChange} placeholder="Contoh: 2025/2026" className="p-3 border border-gray-200 rounded-xl text-sm bg-[#F8FAFC]" />
            </div>
          </div>
        </div>

        {/* GRUP 4: LEGALITAS & SURAT KEPUTUSAN (SK) UTAMA */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
          <h2 className="text-base font-extrabold text-[#0085FF] uppercase tracking-wider mb-6 pb-2 border-b border-gray-100">
            V. Legalitas Administrasi & Dokumen Surat Keputusan (SK)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-[#0A192F] uppercase tracking-wider">20. NO SK SURAT TUGAS BELAJAR</label>
              <input type="text" name="no_sk_tubel" value={formData.no_sk_tubel} onChange={handleChange} className="p-3 border border-gray-200 rounded-xl text-sm bg-[#F8FAFC]" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-[#0A192F] uppercase tracking-wider">21. TANGGAL SK SURAT TUGAS</label>
              <input type="date" name="tanggal_sk_tubel" value={formData.tanggal_sk_tubel} onChange={handleChange} className="p-3 border border-gray-200 rounded-xl text-sm bg-[#F8FAFC]" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-[#0A192F] uppercase tracking-wider">22. TANGGAL UPLOAD DI APLIKASI</label>
              <input type="date" name="tanggal_upload_aplikasi" value={formData.tanggal_upload_aplikasi} onChange={handleChange} className="p-3 border border-gray-200 rounded-xl text-sm bg-[#F8FAFC]" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-[#0A192F] uppercase tracking-wider">23. LINK CLOUD / DRIVE SK TUBEL</label>
              <input type="url" name="link_sk_tubel" value={formData.link_sk_tubel} onChange={handleChange} placeholder="https://drive.google.com/..." className="p-3 border border-gray-200 rounded-xl text-sm text-blue-600 font-mono bg-[#F8FAFC]" />
            </div>
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-xs font-bold text-[#0A192F] uppercase tracking-wider">24. LINK PENGAJUAN AWAL IBEL / TB</label>
              <input type="url" name="link_pengajuan_ibel_tb" value={formData.link_pengajuan_ibel_tb} onChange={handleChange} placeholder="https://..." className="p-3 border border-gray-200 rounded-xl text-sm text-blue-600 font-mono bg-[#F8FAFC]" />
            </div>
          </div>
        </div>

        {/* GRUP 5: PERPANJANGAN & SETNEG (KHUSUS LUAR NEGERI) */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
          <h2 className="text-base font-extrabold text-[#0085FF] uppercase tracking-wider mb-6 pb-2 border-b border-gray-100">
            V. Rincian Perpanjangan Studi & Administrasi SETNEG (Luar Negeri)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-[#0A192F] uppercase tracking-wider">25. PERIODE PERPANJANGAN TUBEL</label>
              <input type="text" name="periode_perpanjangan_tubel" value={formData.periode_perpanjangan_tubel} onChange={handleChange} placeholder="Contoh: 6 Bulan / 1 Tahun" className="p-3 border border-gray-200 rounded-xl text-sm bg-[#F8FAFC]" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-[#0A192F] uppercase tracking-wider">26. NO SK PERPANJANGAN TUBEL</label>
              <input type="text" name="no_sk_perpanjangan_tubel" value={formData.no_sk_perpanjangan_tubel} onChange={handleChange} className="p-3 border border-gray-200 rounded-xl text-sm bg-[#F8FAFC]" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-[#0A192F] uppercase tracking-wider">27. LINK DRIVE SK PERPANJANGAN</label>
              <input type="url" name="link_sk_perpanjangan_tubel" value={formData.link_sk_perpanjangan_tubel} onChange={handleChange} className="p-3 border border-gray-200 rounded-xl text-sm text-blue-600 bg-[#F8FAFC]" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-[#0A192F] uppercase tracking-wider">28. NO PERSETUJUAN PERJADIN SETNEG</label>
              <input type="text" name="no_persetujuan_perjadin_setneg" value={formData.no_persetujuan_perjadin_setneg} onChange={handleChange} className="p-3 border border-gray-200 rounded-xl text-sm bg-[#F8FAFC]" />
            </div>
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-xs font-bold text-[#0A192F] uppercase tracking-wider">29. LINK PERSETUJUAN FLIGHT / SETNEG</label>
              <input type="url" name="link_persetujuan_setneg" value={formData.link_persetujuan_setneg} onChange={handleChange} className="p-3 border border-gray-200 rounded-xl text-sm text-blue-600 bg-[#F8FAFC]" />
            </div>
          </div>
        </div>

        {/* GRUP 6: KEUANGAN, BERKAS KELULUSAN & CATATAN */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
          <h2 className="text-base font-extrabold text-[#0085FF] uppercase tracking-wider mb-6 pb-2 border-b border-gray-100">
            VI. Berkas Kelulusan, Penyesuaian Tunjangan & Catatan Tambahan
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-[#0A192F] uppercase tracking-wider">30. MASA PEMBERHENTIAN TUNJANGAN (BULAN)</label>
              <input type="number" name="masa_pemberhentian_tunjangan" value={formData.masa_pemberhentian_tunjangan} onChange={handleChange} placeholder="Contoh: 7" className="p-3 border border-gray-200 rounded-xl text-sm bg-[#F8FAFC]" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-[#0A192F] uppercase tracking-wider">31. STATUS SURAT PEMBERHENTIAN TUNJANGAN</label>
              <input type="text" name="pemberhentian_tunjangan" value={formData.pemberhentian_tunjangan} onChange={handleChange} className="p-3 border border-gray-200 rounded-xl text-sm bg-[#F8FAFC]" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-[#0A192F] uppercase tracking-wider">32. STATUS IJAZAH & TRANSKRIP NILAI</label>
              <input type="text" name="ijazah_transkrip" value={formData.ijazah_transkrip} onChange={handleChange} placeholder="Contoh: Sudah Verifikasi / Belum" className="p-3 border border-gray-200 rounded-xl text-sm bg-[#F8FAFC]" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-[#0A192F] uppercase tracking-wider">33. STATUS DOKUMEN PENGAKTIFAN KEMBALI</label>
              <input type="text" name="dokumen_pengaktifan_kembali" value={formData.dokumen_pengaktifan_kembali} onChange={handleChange} className="p-3 border border-gray-200 rounded-xl text-sm bg-[#F8FAFC]" />
            </div>
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-xs font-bold text-[#0A192F] uppercase tracking-wider">34. CATATAN / KENDALA PERKEMBANGAN STUDI</label>
              <textarea name="catatan" value={formData.catatan} onChange={handleChange} rows={4} placeholder="Masukkan catatan opsional atau kendala publikasi jurnal/sidang dosen di sini..." className="p-3 border border-gray-200 rounded-xl text-sm font-medium bg-[#F8FAFC] focus:outline-none focus:border-[#0085FF]"></textarea>
            </div>
          </div>
        </div>

        {/* TOMBOL AKSI */}
        <div className="flex justify-end gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <Link
            href="/master_admin/buku-induk"
            className="px-6 py-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-50 transition-all"
          >
            Batal
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="bg-[#0085FF] hover:bg-[#006ACC] text-white px-8 py-3 rounded-xl font-bold text-sm flex items-center gap-2 shadow-md transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Memproses...
              </>
            ) : (
              <>
                <Save size={18} /> Simpan Seluruh Pembaruan
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}