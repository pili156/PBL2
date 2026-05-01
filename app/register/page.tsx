"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Register() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
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
    
    if (formData.password !== formData.konfirmasi_password) {
      alert("Password dan Konfirmasi Password tidak cocok!");
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
        alert("Berhasil mendaftar!");
        router.push("/login"); 
      } else {
        alert(data.error || "Gagal mendaftar");
      }
    } catch (error) {
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white font-['Inter']">
      {/* Sisi Kiri - Informasi & Background */}
      <div className="relative hidden w-[55%] flex-col justify-center px-20 lg:flex overflow-hidden font-['Poppins']">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30"
          // pastikan path ini benar, saya samakan dengan login page
          style={{ backgroundImage: "url('/auth/background1.jpeg')" }} 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#007DFE] via-[#013564] to-[#02182D] opacity-80" />
        
        <div className="relative z-10 text-white">
          <Image src="/auth/logo1.png" alt="Logo Polines" width={161} height={161} className="mb-8" />
          <h1 className="text-6xl font-bold mb-4">SIGAP</h1>
          <h2 className="text-3xl font-medium mb-6 leading-tight w-[80%]">
            Sistem Informasi Gelar Akademik Polines
          </h2>
          <div className="w-[86px] h-0 border-[5px] border-[#F6EB16] mb-6"></div>
          <p className="text-sm font-normal w-[80%] leading-relaxed">
            Platform terintegrasi untuk pengajuan, verifikasi, monitoring studi lanjut, hingga pengelolaan reimbursement dosen secara efisien dalam satu sistem.
          </p>
        </div>
      </div>

      {/* Sisi Kanan - Form Register */}
      <div className="flex w-full lg:w-[45%] flex-col justify-center items-center p-8 lg:p-12 relative overflow-y-auto">
        <div className="w-full max-w-md bg-white rounded-2xl relative z-10">
          <h2 className="text-2xl font-bold text-[#111827] mb-8">Buat Akun</h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input 
              id="email"
              name="email"
              autoComplete="email"
              type="email" 
              required
              placeholder="Email Polines" 
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full border border-[#E5E7EB] rounded px-4 py-3 text-sm text-gray-700 outline-none focus:border-blue-500"
            />
            <input 
              id="nama_lengkap"
              name="nama_lengkap"
              autoComplete="name"
              type="text" 
              required
              placeholder="Nama Lengkap dengan gelar" 
              value={formData.nama_lengkap}
              onChange={(e) => setFormData({...formData, nama_lengkap: e.target.value})}
              className="w-full border border-[#E5E7EB] rounded px-4 py-3 text-sm text-gray-700 outline-none focus:border-blue-500"
            />
            <input 
              id="nip"
              name="nip"
              autoComplete="off"
              type="text" 
              required
              placeholder="NIP" 
              value={formData.nip}
              onChange={(e) => setFormData({...formData, nip: e.target.value})}
              className="w-full border border-[#E5E7EB] rounded px-4 py-3 text-sm text-gray-700 outline-none focus:border-blue-500"
            />
            <input 
              id="jurusan"
              name="jurusan"
              autoComplete="off"
              type="text" 
              required
              placeholder="Jurusan" 
              value={formData.jurusan}
              onChange={(e) => setFormData({...formData, jurusan: e.target.value})}
              className="w-full border border-[#E5E7EB] rounded px-4 py-3 text-sm text-gray-700 outline-none focus:border-blue-500"
            />
            <input 
              id="program_studi"
              name="program_studi"
              autoComplete="off"
              type="text" 
              required
              placeholder="Program Studi / Bagian / UPA" 
              value={formData.program_studi}
              onChange={(e) => setFormData({...formData, program_studi: e.target.value})}
              className="w-full border border-[#E5E7EB] rounded px-4 py-3 text-sm text-gray-700 outline-none focus:border-blue-500"
            />
            <input 
              id="password"
              name="password"
              autoComplete="new-password"
              type="password" 
              required
              placeholder="Password" 
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full border border-[#E5E7EB] rounded px-4 py-3 text-sm text-gray-700 outline-none focus:border-blue-500"
            />
            <input 
              id="konfirmasi_password"
              name="konfirmasi_password"
              autoComplete="new-password"
              type="password" 
              required
              placeholder="Konfirmasi Password" 
              value={formData.konfirmasi_password}
              onChange={(e) => setFormData({...formData, konfirmasi_password: e.target.value})}
              className="w-full border border-[#E5E7EB] rounded px-4 py-3 text-sm text-gray-700 outline-none focus:border-blue-500"
            />

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-4 mt-6 bg-gradient-to-r from-[#017CFE] via-[#015AB7] to-[#014A98] text-white rounded-[30px] font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? "Memproses..." : "Register"}
            </button>
          </form>
          
          <p className="text-center text-xs text-gray-500 mt-6">
            Sudah punya akun? <Link href="/login" className="text-[#017CFE] font-medium">Masuk</Link>
          </p>
        </div>
      </div>
    </div>
  );
}