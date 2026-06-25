// app/register/page.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getJurusanData, getPangkatData, getJabatanData, getProvinsiData, getKotaData } from "./actions"; 

interface ProgramStudi {
  id: number;
  nama_prodi: string;
}

interface Jurusan {
  id: number;
  nama_jurusan: string;
  program_studi: ProgramStudi[];
}

interface Provinsi {
  id: number;
  nama: string;
}

interface KotaKabupaten {
  id: number;
  nama: string;
}

export default function Register() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  
  const [dataJurusan, setDataJurusan] = useState<Jurusan[]>([]);
  const [dataPangkat, setDataPangkat] = useState<any[]>([]);
  const [dataJabatan, setDataJabatan] = useState<any[]>([]);
  const [dataProvinsi, setDataProvinsi] = useState<Provinsi[]>([]);
  const [dataKota, setDataKota] = useState<KotaKabupaten[]>([]);
  const [isLoadingMaster, setIsLoadingMaster] = useState(true);
  const [isLoadingKota, setIsLoadingKota] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    konfirmasi_password: "",
    nama_lengkap: "",
    provinsi_lahir: "",
    kota_lahir: "",
    tanggal_lahir: "",
    jenis_kelamin: "",
    no_telp: "",
    email_pribadi: "",
    alamat: "",
    nip: "",
    nidn: "",
    pangkat_golongan: "",
    jabatan: "",
    jurusan: "",
    program_studi: "",
  });

  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const [jurusanRes, pangkatRes, jabatanRes, provinsiRes] = await Promise.all([
          getJurusanData(),
          getPangkatData(),
          getJabatanData(),
          getProvinsiData()
        ]);
        
        if (jurusanRes) setDataJurusan(jurusanRes);
        if (pangkatRes) setDataPangkat(pangkatRes);
        if (jabatanRes) setDataJabatan(jabatanRes);
        if (provinsiRes) setDataProvinsi(provinsiRes);
      } catch (error) {
        console.error("Gagal memuat data master:", error);
      } finally {
        setIsLoadingMaster(false);
      }
    };

    fetchMasterData();
  }, []);

  const handleJurusanChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData({
      ...formData,
      jurusan: e.target.value,
      program_studi: "", 
    });
  };

  const handleProvinsiChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const provinsiId = Number(e.target.value);
    setFormData({
      ...formData,
      provinsi_lahir: e.target.value,
      kota_lahir: "",
    });
    
    if (provinsiId) {
      setIsLoadingKota(true);
      try {
        const kotaRes = await getKotaData(provinsiId);
        if (kotaRes) setDataKota(kotaRes);
      } catch (error) {
        console.error("Gagal memuat data kota:", error);
      } finally {
        setIsLoadingKota(false);
      }
    } else {
      setDataKota([]);
    }
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

  const selectedJurusanObj = dataJurusan.find(j => j.nama_jurusan === formData.jurusan);
  const availableProdi = selectedJurusanObj ? selectedJurusanObj.program_studi : [];

  const inputClass = "w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:border-[#005B9F] focus:ring-1 focus:ring-[#005B9F] outline-none transition-colors bg-white disabled:bg-gray-100 disabled:text-gray-500 placeholder-gray-400";
  const labelClass = "block text-sm font-semibold text-gray-700 mb-1.5";

  return (
    // PERBAIKAN: Menggunakan h-screen overflow-hidden agar body tidak bisa di-scroll, murni split screen
    <div className="flex h-screen w-full relative font-sans bg-[#005B9F] overflow-hidden">
      
      {/* --- SISI KIRI (Teks & Background) --- */}
      <div className="hidden lg:flex relative w-[40%] flex-col justify-center px-10 xl:px-16 z-10">
        <div
          className="absolute inset-0 bg-cover bg-center -z-10"
          style={{ backgroundImage: "url('/auth/background2.jpeg')" }}
        />
        <div className="absolute inset-0 bg-[#005B9F] opacity-85 -z-10" />

        <div className="text-white z-10">
          <Image
            src="/auth/logo2.png"
            alt="Logo Polines"
            width={110}
            height={110}
            className="mb-8"
          />
          <h1 className="text-4xl xl:text-5xl font-bold mb-3 tracking-wide">SIGAP</h1>
          <h2 className="text-xl xl:text-2xl font-medium mb-6 leading-snug">
            Sistem Informasi Gelar <br /> Akademik Polines
          </h2>
          <div className="w-[50px] h-[4px] bg-[#F6EB16] mb-6"></div>
          <p className="text-sm font-light leading-relaxed opacity-90 pr-8 xl:pr-12">
            Platform terintegrasi untuk pengajuan, verifikasi, monitoring studi
            lanjut, hingga pengelolaan reimbursement dosen secara efisien dalam
            satu sistem.
          </p>
        </div>
      </div>

      {/* --- SISI KANAN (Formulir yang bisa di-scroll) --- */}
      <div className="flex-1 w-full lg:w-[60%] h-full overflow-y-auto bg-gray-50 lg:rounded-l-[2.5rem] shadow-[-15px_0_30px_rgba(0,0,0,0.15)] z-20 relative">
        <div className="w-full max-w-3xl mx-auto px-6 py-10 lg:px-14 lg:py-12">
          
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Pendaftaran Akun</h2>
            <p className="text-sm text-gray-500">Lengkapi formulir di bawah ini untuk mendaftar ke sistem SIGAP.</p>
          </div>

          {errorMsg && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded-r-lg shadow-sm">
              <p className="font-bold mb-1">Pendaftaran Gagal</p>
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 text-sm rounded-r-lg shadow-sm">
              <p className="font-bold mb-1">Berhasil</p>
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-8">
            
            {/* BAGIAN 1: INFORMASI AKUN */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-[#005B9F] mb-4 border-b border-gray-100 pb-2">1. Informasi Akun</h3>
              <div className="grid grid-cols-1 gap-5">
                <div>
                  <label className={labelClass}>Email Polines <span className="text-red-500">*</span></label>
                  <input type="email" required placeholder="contoh@polines.ac.id" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className={inputClass} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className={labelClass}>Password <span className="text-red-500">*</span></label>
                    <input type="password" required minLength={8} placeholder="Min. 8 karakter" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Konfirmasi Password <span className="text-red-500">*</span></label>
                    <input type="password" required placeholder="Ulangi password" value={formData.konfirmasi_password} onChange={(e) => setFormData({...formData, konfirmasi_password: e.target.value})} className={inputClass} />
                  </div>
                </div>
                <p className="text-xs text-gray-500 bg-blue-50 p-3 rounded-lg border border-blue-100">
                  <span className="font-semibold text-blue-700">Info Password:</span> Harus mengandung minimal 8 karakter, 1 huruf kapital, dan 1 karakter unik (!@#$%^&*).
                </p>
              </div>
            </div>

            {/* BAGIAN 2: DATA PRIBADI */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-[#005B9F] mb-4 border-b border-gray-100 pb-2">2. Data Pribadi</h3>
              <div className="grid grid-cols-1 gap-5">
                <div>
                  <label className={labelClass}>Nama Lengkap (beserta gelar) <span className="text-red-500">*</span></label>
                  <input type="text" required placeholder="Contoh: Dr. Budi Santoso, S.T., M.T." value={formData.nama_lengkap} onChange={(e) => setFormData({...formData, nama_lengkap: e.target.value})} className={inputClass} />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className={labelClass}>Provinsi Kelahiran <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <select required value={formData.provinsi_lahir} onChange={handleProvinsiChange} disabled={isLoadingMaster || dataProvinsi.length === 0} className={`${inputClass} appearance-none`}>
                        <option value="" disabled>{isLoadingMaster ? "Memuat..." : "Pilih Provinsi"}</option>
                        {dataProvinsi.map((p) => (
                          <option key={p.id} value={p.id}>{p.nama}</option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Kota/Kabupaten Kelahiran <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <select required disabled={!formData.provinsi_lahir || isLoadingKota || dataKota.length === 0} value={formData.kota_lahir} onChange={(e) => setFormData({...formData, kota_lahir: e.target.value})} className={`${inputClass} appearance-none`}>
                        <option value="" disabled>{!formData.provinsi_lahir ? "Pilih Provinsi Dahulu" : isLoadingKota ? "Memuat..." : "Pilih Kota/Kabupaten"}</option>
                        {dataKota.map((k) => (
                          <option key={k.id} value={k.nama}>{k.nama}</option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Tanggal Lahir <span className="text-red-500">*</span></label>
                  <input type="date" required value={formData.tanggal_lahir} onChange={(e) => setFormData({...formData, tanggal_lahir: e.target.value})} className={inputClass} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className={labelClass}>Jenis Kelamin <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <select required value={formData.jenis_kelamin} onChange={(e) => setFormData({...formData, jenis_kelamin: e.target.value})} className={`${inputClass} appearance-none`}>
                        <option value="" disabled>Pilih Jenis Kelamin</option>
                        <option value="Laki-laki">Laki-laki</option>
                        <option value="Perempuan">Perempuan</option>
                      </select>
                      <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Nomor HP (WhatsApp) <span className="text-red-500">*</span></label>
                    <input type="tel" required placeholder="08xxxxxxxxxx" value={formData.no_telp} onChange={(e) => setFormData({...formData, no_telp: e.target.value})} className={inputClass} />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Email Pribadi (Cadangan) <span className="text-red-500">*</span></label>
                  <input type="email" required placeholder="contoh@gmail.com" value={formData.email_pribadi} onChange={(e) => setFormData({...formData, email_pribadi: e.target.value})} className={inputClass} />
                </div>

                <div>
                  <label className={labelClass}>Alamat Domisili <span className="text-red-500">*</span></label>
                  <textarea rows={3} required placeholder="Masukkan alamat lengkap..." value={formData.alamat} onChange={(e) => setFormData({...formData, alamat: e.target.value})} className={`${inputClass} resize-none`} />
                </div>
              </div>
            </div>

            {/* BAGIAN 3: DATA KEPEGAWAIAN */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-[#005B9F] mb-4 border-b border-gray-100 pb-2">3. Data Kepegawaian & Akademik</h3>
              <div className="grid grid-cols-1 gap-5">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className={labelClass}>NIP <span className="text-red-500">*</span></label>
                    <input type="text" required placeholder="Nomor Induk Pegawai" value={formData.nip} onChange={(e) => setFormData({...formData, nip: e.target.value})} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>NIDN <span className="text-red-500">*</span></label>
                    <input type="text" required placeholder="Nomor Induk Dosen Nasional" value={formData.nidn} onChange={(e) => setFormData({...formData, nidn: e.target.value})} className={inputClass} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className={labelClass}>Pangkat / Golongan <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <select required value={formData.pangkat_golongan} onChange={(e) => setFormData({...formData, pangkat_golongan: e.target.value})} disabled={isLoadingMaster || dataPangkat.length === 0} className={`${inputClass} appearance-none`}>
                        <option value="" disabled>{isLoadingMaster ? "Memuat..." : "Pilih Golongan"}</option>
                        {dataPangkat.map((p) => (
                          <option key={p.id} value={`${p.pangkat} (${p.golongan})`}>{p.pangkat} ({p.golongan})</option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Jabatan Fungsional <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <select required value={formData.jabatan} onChange={(e) => setFormData({...formData, jabatan: e.target.value})} disabled={isLoadingMaster || dataJabatan.length === 0} className={`${inputClass} appearance-none`}>
                        <option value="" disabled>{isLoadingMaster ? "Memuat..." : "Pilih Jabatan"}</option>
                        {dataJabatan.map((j) => (
                          <option key={j.id} value={j.nama}>{j.nama}</option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-2">
                  <div>
                    <label className={labelClass}>Jurusan <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <select required value={formData.jurusan} onChange={handleJurusanChange} disabled={isLoadingMaster || dataJurusan.length === 0} className={`${inputClass} appearance-none border-blue-200 bg-blue-50/30`}>
                        <option value="" disabled>{isLoadingMaster ? "Memuat..." : "Pilih Jurusan"}</option>
                        {dataJurusan.map((jrs) => (
                          <option key={jrs.id} value={jrs.nama_jurusan}>{jrs.nama_jurusan}</option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Program Studi <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <select required disabled={!formData.jurusan || availableProdi.length === 0} value={formData.program_studi} onChange={(e) => setFormData({...formData, program_studi: e.target.value})} className={`${inputClass} appearance-none border-blue-200 bg-blue-50/30`}>
                        <option value="" disabled>{!formData.jurusan ? "Pilih Jurusan Dahulu" : "Pilih Program Studi"}</option>
                        {availableProdi.map((prodi) => (
                          <option key={prodi.id} value={prodi.nama_prodi}>{prodi.nama_prodi}</option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            <div className="pt-2">
              <button type="submit" disabled={loading} className="w-full py-4 bg-[#005B9F] hover:bg-[#004A85] text-white rounded-xl font-bold text-base shadow-md hover:shadow-lg transition-all disabled:opacity-70 flex justify-center items-center gap-2">
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Memproses Pendaftaran...
                  </>
                ) : "Daftar Akun Sekarang"}
              </button>
              
              <p className="text-center text-sm text-gray-500 mt-6 mb-8">
                Sudah punya akun?{" "}
                <Link href="/login" className="text-[#005B9F] font-bold hover:underline">
                  Masuk di sini
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}