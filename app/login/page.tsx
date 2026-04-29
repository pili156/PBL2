"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [identifier, setIdentifier] = useState(""); // NIP atau Email
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Login Berhasil!");
        // Arahkan ke dashboard sesuai role
        router.push(data.user.role === "Admin" ? "/user/dashboard" : "/dashboard");
      } else {
        alert(data.error || "Login Gagal");
      }
    } catch (error) {
      alert("Gagal terhubung ke server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white font-['Inter']">
      {/* Sisi Kiri - Informasi */}
      <div className="relative hidden w-[55%] flex-col justify-center px-20 lg:flex overflow-hidden font-['Poppins']">
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
            Masuk ke akun Anda untuk mengelola pengajuan studi lanjut dan memantau progres akademik Anda.
          </p>
        </div>
      </div>

      {/* Sisi Kanan - Form Login */}
      <div className="flex w-full lg:w-[45%] flex-col justify-center items-center p-8 lg:p-12 relative">
        <div className="w-full max-w-md bg-white rounded-2xl relative z-10">
          <h2 className="text-2xl font-bold text-[#111827] mb-8">Masuk ke Akun</h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input 
              id="identifier"
              name="identifier"
              autoComplete="username"
              type="text" 
              required
              placeholder="Email atau NIP" 
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full border border-[#E5E7EB] rounded px-4 py-3 text-sm text-gray-700 outline-none focus:border-blue-500"
            />
            <input 
              id="password"
              name="password"
              autoComplete="current-password"
              type="password" 
              required
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-[#E5E7EB] rounded px-4 py-3 text-sm text-gray-700 outline-none focus:border-blue-500"
            />

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-4 mt-6 bg-gradient-to-r from-[#017CFE] via-[#015AB7] to-[#014A98] text-white rounded-[30px] font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? "Memproses..." : "Login"}
            </button>
          </form>
          
          <p className="text-center text-xs text-gray-500 mt-6">
            Belum punya akun? <Link href="/register" className="text-[#017CFE] font-medium">Daftar Sekarang</Link>
          </p>
        </div>
      </div>
    </div>
  );
}