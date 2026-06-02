// app/register/page.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Register() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  
  const [formData, setFormData] = useState({
    username: "", // TAMBAHAN: Field username yang sebelumnya hilang
    email: "",
    nama_lengkap: "",
    nip: "",
    jurusan: "",
    program_studi: "",
    password: "",
    konfirmasi_password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(""); // Reset pesan error
    setSuccessMsg(""); // Reset pesan sukses
    
    // Pengecekan domain polines di sisi frontend
    if (!formData.email.endsWith('@polines.ac.id')) {
      setErrorMsg("Hanya akun @polines.ac.id yang diizinkan untuk mendaftar!");
      return;
    }

    // Pengecekan keamanan password (Min. 8 karakter)
    if (formData.password.length < 8) {
      setErrorMsg("Keamanan lemah: Password minimal harus 8 karakter!");
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
        // Beri jeda 1.5 detik agar user bisa membaca pesan sukses sebelum pindah halaman
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

  return (
    <div className="flex min-h-screen w-full relative font-sans bg-[#005B9F]">
      {/* Layer Background Gambar */}
      <div className="absolute inset-0 lg:w-[60%] z-0">
        <div
          className="absolute inset-0 bg-cover bg-center fixed lg:absolute"
          style={{ backgroundImage: "url('/auth/background2.jpeg')" }}
        />
        {/* Overlay Biru */}
        <div className="absolute inset-0 bg-[#005B9F] opacity-70 fixed lg:absolute" />
      </div>

      {/* Sisi Kiri - Konten Informasi */}
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

      {/* Sisi Kanan - Panel Form */}
      <div className="relative z-10 flex w-full lg:w-[45%] flex-col justify-center items-center bg-white lg:rounded-l-2xl shadow-[-10px_0_20px_rgba(0,0,0,0.05)] ml-auto min-h-screen py-10 lg:py-0">
        <div className="w-full max-w-md p-8 lg:p-12">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Buat Akun</h2>
            <p className="text-sm text-gray-500">Daftar untuk mengakses sistem</p>
          </div>

          {/* MENAMPILKAN PESAN ERROR */}
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg text-center">
              {errorMsg}
            </div>
          )}

          {/* MENAMPILKAN PESAN SUKSES */}
          {successMsg && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-600 text-sm rounded-lg text-center">
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            
            {/* Input Username (BARU DITAMBAHKAN) */}
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </span>
              <input 
                id="username"
                name="username"
                autoComplete="username"
                type="text" 
                required
                placeholder="Username Unik" 
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                className="w-full border border-gray-200 rounded-full pl-12 pr-4 py-3 text-sm text-gray-700 outline-none focus:border-blue-500 transition-colors bg-gray-50/50"
              />
            </div>

            {/* Input Email */}
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="16" x="2" y="4" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </span>
              <input 
                id="email"
                name="email"
                autoComplete="email"
                type="email" 
                required
                placeholder="Email Polines (@polines.ac.id)" 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className={`w-full border rounded-full pl-12 pr-4 py-3 text-sm text-gray-700 outline-none transition-colors bg-gray-50/50 ${errorMsg.includes("Email") || errorMsg.includes("@polines") ? "border-red-400 focus:border-red-500" : "border-gray-200 focus:border-blue-500"}`}
              />
            </div>

            {/* Input Nama Lengkap */}
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </span>
              <input 
                id="nama_lengkap"
                name="nama_lengkap"
                autoComplete="name"
                type="text" 
                required
                placeholder="Nama Lengkap dengan gelar" 
                value={formData.nama_lengkap}
                onChange={(e) => setFormData({...formData, nama_lengkap: e.target.value})}
                className="w-full border border-gray-200 rounded-full pl-12 pr-4 py-3 text-sm text-gray-700 outline-none focus:border-blue-500 transition-colors bg-gray-50/50"
              />
            </div>

            {/* Input NIP */}
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="14" x="2" y="5" rx="2" />
                  <circle cx="8" cy="12" r="2" />
                  <path d="M14 11h4" />
                  <path d="M14 14h4" />
                </svg>
              </span>
              <input 
                id="nip"
                name="nip"
                autoComplete="off"
                type="text" 
                required
                placeholder="NIP" 
                value={formData.nip}
                onChange={(e) => setFormData({...formData, nip: e.target.value})}
                className="w-full border border-gray-200 rounded-full pl-12 pr-4 py-3 text-sm text-gray-700 outline-none focus:border-blue-500 transition-colors bg-gray-50/50"
              />
            </div>

            {/* Input Jurusan */}
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
                  <path d="M9 22v-4h6v4" />
                  <path d="M8 6h.01" />
                  <path d="M16 6h.01" />
                  <path d="M12 6h.01" />
                  <path d="M12 10h.01" />
                  <path d="M12 14h.01" />
                  <path d="M16 10h.01" />
                  <path d="M16 14h.01" />
                  <path d="M8 10h.01" />
                  <path d="M8 14h.01" />
                </svg>
              </span>
              <input 
                id="jurusan"
                name="jurusan"
                autoComplete="off"
                type="text" 
                required
                placeholder="Jurusan" 
                value={formData.jurusan}
                onChange={(e) => setFormData({...formData, jurusan: e.target.value})}
                className="w-full border border-gray-200 rounded-full pl-12 pr-4 py-3 text-sm text-gray-700 outline-none focus:border-blue-500 transition-colors bg-gray-50/50"
              />
            </div>

            {/* Input Program Studi */}
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
                </svg>
              </span>
              <input 
                id="program_studi"
                name="program_studi"
                autoComplete="off"
                type="text" 
                required
                placeholder="Program Studi / Bagian / UPA" 
                value={formData.program_studi}
                onChange={(e) => setFormData({...formData, program_studi: e.target.value})}
                className="w-full border border-gray-200 rounded-full pl-12 pr-4 py-3 text-sm text-gray-700 outline-none focus:border-blue-500 transition-colors bg-gray-50/50"
              />
            </div>

            {/* Input Password */}
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </span>
              <input 
                id="password"
                name="password"
                autoComplete="new-password"
                type="password" 
                required
                minLength={8}
                placeholder="Password (Min. 8 Karakter)" 
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className={`w-full border rounded-full pl-12 pr-4 py-3 text-sm text-gray-700 outline-none transition-colors bg-gray-50/50 ${errorMsg.includes("lemah") ? "border-red-400 focus:border-red-500" : "border-gray-200 focus:border-blue-500"}`}
              />
            </div>

            {/* Input Konfirmasi Password */}
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </span>
              <input 
                id="konfirmasi_password"
                name="konfirmasi_password"
                autoComplete="new-password"
                type="password" 
                required
                placeholder="Konfirmasi Password" 
                value={formData.konfirmasi_password}
                onChange={(e) => setFormData({...formData, konfirmasi_password: e.target.value})}
                className={`w-full border rounded-full pl-12 pr-4 py-3 text-sm text-gray-700 outline-none transition-colors bg-gray-50/50 ${errorMsg.includes("cocok") ? "border-red-400 focus:border-red-500" : "border-gray-200 focus:border-blue-500"}`}
              />
            </div>

            {/* Tombol Register */}
            <button 
              type="submit"
              disabled={loading}
              className="w-full py-3.5 mt-2 bg-[#005B9F] hover:bg-[#004A85] text-white rounded-full font-medium text-sm transition-colors disabled:opacity-50"
            >
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