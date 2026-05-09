"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(""); // Menyimpan pesan error
  
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(""); // Reset pesan error setiap kali submit

    // Pengecekan domain polines di sisi frontend (jika format berupa email)
    if (identifier.includes('@') && !identifier.endsWith('@polines.ac.id')) {
      setErrorMsg("Gunakan email @polines.ac.id untuk login!");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await res.json();

      if (res.ok) {
        // Berhasil login, langsung proses redirect berdasarkan role (TANPA ALERT POPUP)
        if (data.user.role === "admin") {
          router.push("/admin/dashboard");
        } else if (data.user.role === "master_admin" || data.user.role === "master admin") {
          router.push("/master_admin/dashboard");
        } else if (data.user.role === "keuangan") {
          router.push("/keuangan/dashboard"); 
        } else {
          router.push("/user/dashboard"); // Default
        }
      } else {
        // Gagal login, tangkap pesan error dari API (misal: "Akun belum diaktifkan. Silakan hubungi Admin.")
        setErrorMsg(data.error || "Login Gagal");
      }
    } catch (error) {
      setErrorMsg("Gagal terhubung ke server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full relative font-sans bg-[#005B9F]">
      {/* Layer Background Gambar */}
      <div className="absolute inset-0 lg:w-[60%] z-0">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/auth/background2.jpeg')" }}
        />
        {/* Overlay Biru */}
        <div className="absolute inset-0 bg-[#005B9F] opacity-70" />
      </div>

      {/* Sisi Kiri - Konten Informasi */}
      <div className="relative z-10 hidden w-[55%] flex-col justify-center px-16 lg:flex">
        <div className="text-white mt-10">
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
      <div className="relative z-10 flex w-full lg:w-[45%] flex-col justify-center items-center bg-white lg:rounded-l-2xl shadow-[-10px_0_20px_rgba(0,0,0,0.05)]">
        
        <div className="w-full max-w-md p-8 lg:p-12">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Selamat Datang!
            </h2>
            <p className="text-sm text-gray-500">Masuk untuk Melanjutkan</p>
          </div>

          {/* MENAMPILKAN PESAN ERROR */}
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg text-center">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Input Email / NIP */}
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="16" x="2" y="4" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </span>
              <input
                id="identifier"
                name="identifier"
                autoComplete="username"
                type="text"
                required
                placeholder="Email Polines / NIP"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className={`w-full border rounded-full pl-12 pr-4 py-3 text-sm text-gray-700 outline-none transition-colors bg-gray-50/50 ${errorMsg ? "border-red-400 focus:border-red-500" : "border-gray-200 focus:border-blue-500"}`}
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
                autoComplete="current-password"
                type="password"
                required
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full border rounded-full pl-12 pr-4 py-3 text-sm text-gray-700 outline-none transition-colors bg-gray-50/50 ${errorMsg ? "border-red-400 focus:border-red-500" : "border-gray-200 focus:border-blue-500"}`}
              />
            </div>

            {/* Checkbox Ingat Saya */}
            <div className="flex items-center gap-2 mt-1 mb-2 px-2">
              <input 
                type="checkbox" 
                id="remember" 
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
              />
              <label htmlFor="remember" className="text-xs text-gray-500 cursor-pointer">
                ingat saya
              </label>
            </div>

            {/* Tombol Masuk */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#005B9F] hover:bg-[#004A85] text-white rounded-full font-medium text-sm transition-colors disabled:opacity-50"
            >
              {loading ? "Memproses..." : "Masuk"}
            </button>
          </form>

          <p className="text-center text-xs text-gray-500 mt-6">
            Belum punya akun?{" "}
            <Link href="/register" className="text-[#005B9F] font-medium hover:underline">
              Daftar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}