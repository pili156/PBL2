"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function Login() {
  const [identifier, setIdentifier] = useState(""); // Bisa berupa Email atau NIP
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    // Nanti logika untuk menembak API Login diletakkan di sini
    console.log("Mencoba login dengan:", identifier, password);
    alert("Fitur API Login belum tersambung.");
  };

  return (
    <div className="flex min-h-screen bg-white font-['Poppins']">
      {/* Sisi Kiri - Informasi & Background */}
      <div className="relative hidden w-[55%] flex-col justify-center px-20 lg:flex overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: "url('/background1.png')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#007DFE] via-[#013564] to-[#02182D] opacity-80" />
        
        <div className="relative z-10 text-white">
          <Image src="/logo1.png" alt="Logo Polines" width={161} height={161} className="mb-8" />
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

      {/* Sisi Kanan - Form Login */}
      <div className="flex w-full lg:w-[45%] flex-col justify-center items-center p-8 lg:p-16 relative">
        <div className="w-full max-w-md bg-white rounded-2xl p-8 relative z-10">
          <h2 className="text-3xl font-bold text-[#333333] mb-2">Selamat Datang!</h2>
          <p className="text-[#333333] mb-8 text-sm">Masuk untuk Melanjutkan</p>

          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            {/* Input Email/NIP */}
            <div className="flex items-center bg-white border border-[#EEEEEE] rounded-[30px] px-6 py-4">
              <span className="text-gray-400 mr-3">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 7.00005L10.2 11.65C11.2667 12.45 12.7333 12.45 13.8 11.65L20 7" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><rect x="3" y="5" width="18" height="14" rx="2" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round"/></svg>
              </span>
              <input 
                type="text" 
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Email / NIP" 
                className="w-full outline-none text-sm text-[#333333] placeholder-gray-400 bg-transparent"
              />
            </div>

            {/* Input Password */}
            <div className="flex items-center bg-white border border-[#EEEEEE] rounded-[30px] px-6 py-4">
              <span className="text-gray-400 mr-3">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="5" y="11" width="14" height="10" rx="2" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M8 11V7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7V11" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </span>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password" 
                className="w-full outline-none text-sm text-[#333333] placeholder-gray-400 bg-transparent"
              />
            </div>

            {/* Ingat Saya */}
            <div className="flex items-center justify-between text-sm mt-2">
              <label className="flex items-center text-gray-500 cursor-pointer">
                <input type="checkbox" className="mr-2 w-4 h-4 rounded border-gray-300" />
                Ingat saya
              </label>
            </div>

            {/* Tombol Masuk */}
            <button 
              type="submit"
              className="w-full py-4 mt-4 bg-gradient-to-r from-[#017CFE] via-[#015AB7] to-[#014A98] text-white rounded-[30px] font-medium text-sm hover:opacity-90 transition-opacity"
            >
              Masuk
            </button>
          </form>

          <p className="text-center text-xs text-gray-500 mt-8">
            Belum punya akun? <Link href="/register" className="text-[#017CFE] font-medium">Daftar</Link>
          </p>
        </div>
      </div>
    </div>
  );
}