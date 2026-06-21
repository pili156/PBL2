// app/register/page.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getJurusanData } from "./actions"; // IMPORT SERVER ACTION DI SINI

// Tipe Data untuk hasil fetch dari Database
interface ProgramStudi {
  id: number;
  nama_prodi: string;
}

interface Jurusan {
  id: number;
  nama_jurusan: string;
  program_studi: ProgramStudi[];
}

export default function Register() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  
  // State untuk menyimpan data dari database
  const [dataJurusan, setDataJurusan] = useState<Jurusan[]>([]);
  const [isLoadingJurusan, setIsLoadingJurusan] = useState(true);

  const [formData, setFormData] = useState({
    email: "",
    nama_lengkap: "",
    nip: "",
    nidn: "",
    tempat_lahir: "",
    tanggal_lahir: "",
    jenis_kelamin: "",
    email_pribadi: "",
    alamat: "",
    jurusan: "",
    program_studi: "",
    password: "",
    konfirmasi_password: "",
  });

  // Ambil data jurusan MENGGUNAKAN SERVER ACTION
  useEffect(() => {
    const fetchJurusan = async () => {
      try {
        const data = await getJurusanData(); // Panggil fungsi server langsung
        if (data && data.length > 0) {
          setDataJurusan(data);
        }
      } catch (error) {
        console.error("Gagal memuat data jurusan:", error);
      } finally {
        setIsLoadingJurusan(false);
      }
    };

    fetchJurusan();
  }, []);

  const handleJurusanChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData({
      ...formData,
      jurusan: e.target.value,
      program_studi: "", // Reset prodi saat jurusan diganti
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    
    if (!formData.email.endsWith('@polines.ac.id')) {
      setErrorMsg("Hanya akun @polines.ac.id yang diizinkan untuk mendaftar!");
      return;
    }

    if (!formData.jurusan || !formData.program_studi) {
      setErrorMsg("Jurusan dan Program Studi wajib dipilih!");
      return;
    }

    if (formData.password.length < 8) {
      setErrorMsg("Password minimal 8 karakter");
      return;
    }
    if (!/[A-Z]/.test(formData.password)) {
      setErrorMsg("Password harus mengandung minimal 1 huruf kapital");
      return;
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)) {
      setErrorMsg("Password harus mengandung minimal 1 karakter unik (!@#$%^&* dll)");
      return;
    }

    if (formData.password !== formData.konfirmasi_password) {
      setErrorMsg("Password dan Konfirmasi Password tidak cocok!");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccessMsg("Berhasil mendaftar! Mengalihkan ke halaman login...");
        setTimeout(() => {
          router.push("/login");
        }, 1500);
      } else {
        setErrorMsg(data.error || "Gagal mendaftar");
      }
    } catch (error) {
      setErrorMsg("Terjadi kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
  };

  // Mencari daftar prodi berdasarkan nama jurusan yang dipilih
  const selectedJurusanObj = dataJurusan.find(j => j.nama_jurusan === formData.jurusan);
  const availableProdi = selectedJurusanObj ? selectedJurusanObj.program_studi : [];

  return (
    <div className="flex min-h-screen w-full relative font-sans bg-[#005B9F]">
      <div className="absolute inset-0 lg:w-[60%] z-0">
        <div
          className="absolute inset-0 bg-cover bg-center fixed lg:absolute"
          style={{ backgroundImage: "url('/auth/background2.jpeg')" }}
        />
        <div className="absolute inset-0 bg-[#005B9F] opacity-70 fixed lg:absolute" />
      </div>

      <div className="relative z-10 hidden w-[55%] flex-col justify-center px-16 lg:flex">
        <div className="text-white mt-10 fixed top-1/2 -translate-y-1/2">
          <Image
            src="/auth/logo2.png"
            alt="Logo Polines"
            width={120}
            height={120}
            className="mb-6"
          />
          <h1 className="text-5xl font-bold mb-2 tracking-wide">SIGAP</h1>
          <h2 className="text-2xl font-medium mb-6 leading-snug w-[80%]">
            Sistem Informasi Gelar <br /> Akademik Polines
          </h2>
          <div className="w-[50px] h-[4px] bg-[#F6EB16] mb-6"></div>
          <p className="text-sm font-light w-[85%] leading-relaxed max-w-md opacity-90">
            Platform terintegrasi untuk pengajuan, verifikasi, monitoring studi
            lanjut, hingga pengelolaan reimbursement dosen secara efisien dalam
            satu sistem.
          </p>
        </div>
      </div>

      <div className="relative z-10 flex w-full lg:w-[45%] flex-col justify-center items-center bg-white lg:rounded-l-2xl shadow-[-10px_0_20px_rgba(0,0,0,0.05)] ml-auto min-h-screen py-10 lg:py-0">
        <div className="w-full max-w-md p-8 lg:p-12">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Buat Akun</h2>
            <p className="text-sm text-gray-500">Daftar untuk mengakses sistem</p>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg text-center">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-600 text-sm rounded-lg text-center">
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
              </span>
              <input id="email" name="email" autoComplete="email" type="email" required placeholder="Email Polines (@polines.ac.id)" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className={`w-full border rounded-full pl-12 pr-4 py-3 text-sm text-gray-700 outline-none transition-colors bg-gray-50/50 ${errorMsg.includes("Email") || errorMsg.includes("@polines") ? "border-red-400 focus:border-red-500" : "border-gray-200 focus:border-blue-500"}`} />
            </div>

            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
              </span>
              <input id="nama_lengkap" name="nama_lengkap" autoComplete="name" type="text" required placeholder="Nama Lengkap dengan gelar" value={formData.nama_lengkap} onChange={(e) => setFormData({...formData, nama_lengkap: e.target.value})} className="w-full border border-gray-200 rounded-full pl-12 pr-4 py-3 text-sm text-gray-700 outline-none focus:border-blue-500 transition-colors bg-gray-50/50" />
            </div>

            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2" /><circle cx="8" cy="12" r="2" /><path d="M14 11h4" /><path d="M14 14h4" /></svg>
              </span>
              <input id="nip" name="nip" autoComplete="off" type="text" required placeholder="NIP" value={formData.nip} onChange={(e) => setFormData({...formData, nip: e.target.value})} className="w-full border border-gray-200 rounded-full pl-12 pr-4 py-3 text-sm text-gray-700 outline-none focus:border-blue-500 transition-colors bg-gray-50/50" />
            </div>

            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2" /><circle cx="8" cy="12" r="2" /><path d="M14 11h4" /><path d="M14 14h4" /></svg>
              </span>
              <input id="nidn" name="nidn" autoComplete="off" type="text" required placeholder="NIDN" value={formData.nidn} onChange={(e) => setFormData({...formData, nidn: e.target.value})} className="w-full border border-gray-200 rounded-full pl-12 pr-4 py-3 text-sm text-gray-700 outline-none focus:border-blue-500 transition-colors bg-gray-50/50" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <input id="tempat_lahir" name="tempat_lahir" type="text" required placeholder="Tempat Lahir" value={formData.tempat_lahir} onChange={(e) => setFormData({...formData, tempat_lahir: e.target.value})} className="w-full border border-gray-200 rounded-full px-4 py-3 text-sm text-gray-700 outline-none focus:border-blue-500 transition-colors bg-gray-50/50" />
              </div>
              <div className="relative">
                <input id="tanggal_lahir" name="tanggal_lahir" type="date" required placeholder="Tanggal Lahir" value={formData.tanggal_lahir} onChange={(e) => setFormData({...formData, tanggal_lahir: e.target.value})} className="w-full border border-gray-200 rounded-full px-4 py-3 text-sm text-gray-700 outline-none focus:border-blue-500 transition-colors bg-gray-50/50" />
              </div>
            </div>

            <div className="relative">
              <select id="jenis_kelamin" name="jenis_kelamin" required value={formData.jenis_kelamin} onChange={(e) => setFormData({...formData, jenis_kelamin: e.target.value})} className="w-full border border-gray-200 rounded-full px-4 py-3 text-sm text-gray-700 outline-none focus:border-blue-500 transition-colors bg-gray-50/50 appearance-none">
                <option value="">Jenis Kelamin</option>
                <option value="Laki-laki">Laki-laki</option>
                <option value="Perempuan">Perempuan</option>
              </select>
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>

            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
              </span>
              <input id="email_pribadi" name="email_pribadi" type="email" required placeholder="Email Pribadi" value={formData.email_pribadi} onChange={(e) => setFormData({...formData, email_pribadi: e.target.value})} className="w-full border border-gray-200 rounded-full pl-12 pr-4 py-3 text-sm text-gray-700 outline-none focus:border-blue-500 transition-colors bg-gray-50/50" />
            </div>

            <div className="relative">
              <textarea id="alamat" name="alamat" rows={2} required placeholder="Alamat" value={formData.alamat} onChange={(e) => setFormData({...formData, alamat: e.target.value})} className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-700 outline-none focus:border-blue-500 transition-colors bg-gray-50/50 resize-none" />
            </div>

            {/* DROPDOWN JURUSAN (DINAMIS) */}
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2" /><path d="M9 22v-4h6v4" /><path d="M8 6h.01" /><path d="M16 6h.01" /><path d="M12 6h.01" /><path d="M12 10h.01" /><path d="M12 14h.01" /><path d="M16 10h.01" /><path d="M16 14h.01" /><path d="M8 10h.01" /><path d="M8 14h.01" /></svg>
              </span>
              <select 
                id="jurusan"
                name="jurusan"
                required
                value={formData.jurusan}
                onChange={handleJurusanChange}
                disabled={isLoadingJurusan || dataJurusan.length === 0}
                className="w-full border border-gray-200 rounded-full pl-12 pr-10 py-3 text-sm text-gray-700 outline-none focus:border-blue-500 transition-colors bg-gray-50/50 appearance-none disabled:bg-gray-100 disabled:text-gray-400"
              >
                <option value="" disabled>
                  {isLoadingJurusan ? "Memuat data jurusan..." : "Pilih Jurusan"}
                </option>
                {dataJurusan.map((jrs) => (
                  <option key={jrs.id} value={jrs.nama_jurusan}>{jrs.nama_jurusan}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>

            {/* DROPDOWN PROGRAM STUDI (DINAMIS) */}
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" /></svg>
              </span>
              <select 
                id="program_studi"
                name="program_studi"
                required
                disabled={!formData.jurusan || availableProdi.length === 0}
                value={formData.program_studi}
                onChange={(e) => setFormData({...formData, program_studi: e.target.value})}
                className="w-full border border-gray-200 rounded-full pl-12 pr-10 py-3 text-sm text-gray-700 outline-none focus:border-blue-500 transition-colors bg-gray-50/50 appearance-none disabled:bg-gray-100 disabled:text-gray-400"
              >
                <option value="" disabled>
                  {!formData.jurusan ? "Pilih Jurusan Dahulu" : "Pilih Program Studi"}
                </option>
                {availableProdi.map((prodi) => (
                  <option key={prodi.id} value={prodi.nama_prodi}>{prodi.nama_prodi}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>

            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
              </span>
              <input id="password" name="password" autoComplete="new-password" type="password" required minLength={8} placeholder="Min. 8 karakter, 1 huruf kapital, 1 karakter unik" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className={`w-full border rounded-full pl-12 pr-4 py-3 text-sm text-gray-700 outline-none transition-colors bg-gray-50/50 ${errorMsg.includes("lemah") ? "border-red-400 focus:border-red-500" : "border-gray-200 focus:border-blue-500"}`} />
            </div>

            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
              </span>
              <input id="konfirmasi_password" name="konfirmasi_password" autoComplete="new-password" type="password" required placeholder="Konfirmasi Password" value={formData.konfirmasi_password} onChange={(e) => setFormData({...formData, konfirmasi_password: e.target.value})} className={`w-full border rounded-full pl-12 pr-4 py-3 text-sm text-gray-700 outline-none transition-colors bg-gray-50/50 ${errorMsg.includes("cocok") ? "border-red-400 focus:border-red-500" : "border-gray-200 focus:border-blue-500"}`} />
            </div>

            <button type="submit" disabled={loading} className="w-full py-3.5 mt-2 bg-[#005B9F] hover:bg-[#004A85] text-white rounded-full font-medium text-sm transition-colors disabled:opacity-50">
              {loading ? "Memproses..." : "Register"}
            </button>
          </form>
          
          <p className="text-center text-xs text-gray-500 mt-6">
            Sudah punya akun?{" "}
            <Link href="/login" className="text-[#005B9F] font-medium hover:underline">
              Masuk
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}