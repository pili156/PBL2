"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ROLE_DISPLAY } from "@/src/lib/constants/roles";
// PERBAIKAN: Menambahkan icon Phone untuk Nomor HP
import { User, Mail, Shield, Briefcase, BadgeCheck, Save, ArrowLeft, Loader2, Hash, Phone } from "lucide-react";
import { getJurusanData, getProvinsiData, getKotaData } from "@/app/register/actions";
import { logger } from '@/src/lib/logger';

type ProfileData = {
  email: string;
  username: string;
  role: string;
  master_dosen: {
    nip?: string;
    nidn?: string;
    nama_lengkap?: string;
    tanggal_lahir?: string;
    jenis_kelamin?: string;
    email_pribadi?: string;
    alamat?: string;
    pangkat_golongan?: string;
    jabatan?: string;
    jurusan?: string;
    program_studi?: string;
    no_telp?: string;
    gelar?: string;
    pendidikan_terakhir?: string;
    provinsi_lahir?: string;
    kota_lahir?: string;
  } | null;
};

type JurusanData = {
  id: number;
  nama_jurusan: string;
  program_studi: { id: number; nama_prodi: string }[];
};

type EditProfileFormProps = {
  backUrl: string;
  apiUrl?: string;
};

export default function EditProfileForm({ backUrl, apiUrl = "/api/user/profile" }: EditProfileFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [masterData, setMasterData] = useState<{ masterJabatan: { id: number; nama: string; singkatan: string; urutan: number }[]; masterPangkat: { id: number; pangkat: string; golongan: string }[] } | null>(null);
  const [selectedPangkat, setSelectedPangkat] = useState("");
  const [selectedJabatan, setSelectedJabatan] = useState("");
  const [dataJurusan, setDataJurusan] = useState<JurusanData[]>([]);
  const [isLoadingJurusan, setIsLoadingJurusan] = useState(true);
  const [dataProvinsi, setDataProvinsi] = useState<{ id: number; nama: string }[]>([]);
  const [dataKota, setDataKota] = useState<{ id: number; nama: string }[]>([]);
  const [isLoadingKota, setIsLoadingKota] = useState(false);

  const [formData, setFormData] = useState({
    nip: "",
    nidn: "",
    nama_lengkap: "",
    tanggal_lahir: "",
    jenis_kelamin: "",
    email_pribadi: "",
    alamat: "",
    pangkat_golongan: "",
    jabatan: "",
    jurusan: "",
    program_studi: "",
    no_telp: "",
    gelar: "",
    pendidikan_terakhir: "",
    provinsi_lahir: "",
    kota_lahir: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const [profileRes, masterRes, jurusanData, provinsiData] = await Promise.all([
        fetch(apiUrl),
        fetch("/api/master-data"),
        getJurusanData(),
        getProvinsiData(),
      ]);

      const profileJson = await profileRes.json();
      const masterJson = await masterRes.json();

      if (!profileRes.ok) {
        setErrorMsg(profileJson.error || "Gagal memuat data profil");
        return;
      }

      if (!masterRes.ok) {
        setErrorMsg(masterJson.error || "Gagal memuat data master");
      } else {
        setMasterData({ masterJabatan: masterJson.masterJabatan || [], masterPangkat: masterJson.masterPangkat || [] });
      }

      if (jurusanData) {
        setDataJurusan(jurusanData);
      }

      if (provinsiData) {
        setDataProvinsi(provinsiData);
      }

      setProfileData(profileJson);
      setFormData({
        nip: profileJson.master_dosen?.nip || "",
        nidn: profileJson.master_dosen?.nidn || "",
        nama_lengkap: profileJson.master_dosen?.nama_lengkap || "",
        tanggal_lahir: profileJson.master_dosen?.tanggal_lahir ? profileJson.master_dosen.tanggal_lahir.split("T")[0] : "",
        jenis_kelamin: profileJson.master_dosen?.jenis_kelamin || "",
        email_pribadi: profileJson.master_dosen?.email_pribadi || "",
        alamat: profileJson.master_dosen?.alamat || "",
        pangkat_golongan: profileJson.master_dosen?.pangkat_golongan || "",
        jabatan: profileJson.master_dosen?.jabatan || "",
        jurusan: profileJson.master_dosen?.jurusan || "",
        program_studi: profileJson.master_dosen?.program_studi || "",
        no_telp: profileJson.master_dosen?.no_telp || "",
        gelar: profileJson.master_dosen?.gelar || "",
        pendidikan_terakhir: profileJson.master_dosen?.pendidikan_terakhir || "",
        provinsi_lahir: profileJson.master_dosen?.provinsi_lahir || "",
        kota_lahir: profileJson.master_dosen?.kota_lahir || "",
      });
      setSelectedPangkat(profileJson.master_dosen?.pangkat_golongan || "");
      setSelectedJabatan(profileJson.master_dosen?.jabatan || "");

      if (profileJson.master_dosen?.provinsi_lahir && provinsiData) {
        const provinsi = provinsiData.find((p) => p.nama === profileJson.master_dosen.provinsi_lahir);
        if (provinsi) {
          setIsLoadingKota(true);
          try {
            const kotaRes = await getKotaData(provinsi.id);
            if (kotaRes) setDataKota(kotaRes);
          } catch (error) {
            logger.error("Gagal memuat data kota:", error);
          } finally {
            setIsLoadingKota(false);
          }
        }
      }
    } catch (error) {
      setErrorMsg("Gagal terhubung ke server");
    } finally {
      setLoading(false);
      setIsLoadingJurusan(false);
    }
  };

  // PERBAIKAN: Menambahkan HTMLTextAreaElement agar textarea Alamat tidak merah
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "pangkat_golongan") {
      setSelectedPangkat(value);
    }
    if (name === "jabatan") {
      setSelectedJabatan(value);
    }
  };

  const handleJurusanChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      jurusan: e.target.value,
      program_studi: "",
    }));
  };

  const handleProvinsiChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedNama = e.target.value;
    const provinsi = dataProvinsi.find((p) => p.nama === selectedNama);
    const provinsiId = provinsi?.id ?? 0;
    setFormData((prev) => ({
      ...prev,
      provinsi_lahir: selectedNama,
      kota_lahir: "",
    }));

    if (provinsiId) {
      setIsLoadingKota(true);
      try {
        const kotaRes = await getKotaData(provinsiId);
        if (kotaRes) setDataKota(kotaRes);
      } catch (error) {
        logger.error("Gagal memuat data kota:", error);
      } finally {
        setIsLoadingKota(false);
      }
    } else {
      setDataKota([]);
    }
  };

  const selectedJurusanObj = dataJurusan.find((j) => j.nama_jurusan === formData.jurusan);
  const availableProdi = selectedJurusanObj ? selectedJurusanObj.program_studi : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setSaving(true);

    try {
      const res = await fetch(apiUrl, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccessMsg("Profil berhasil diperbarui!");
        setProfileData((prev) => prev ? {
          ...prev,
          master_dosen: prev.master_dosen ? {
            ...prev.master_dosen,
            nip: formData.nip || prev.master_dosen.nip,
            nidn: formData.nidn || prev.master_dosen.nidn,
            nama_lengkap: formData.nama_lengkap || prev.master_dosen.nama_lengkap,
            tanggal_lahir: formData.tanggal_lahir || prev.master_dosen.tanggal_lahir,
            jenis_kelamin: formData.jenis_kelamin || prev.master_dosen.jenis_kelamin,
            email_pribadi: formData.email_pribadi || prev.master_dosen.email_pribadi,
            alamat: formData.alamat || prev.master_dosen.alamat,
            pangkat_golongan: formData.pangkat_golongan || prev.master_dosen.pangkat_golongan,
            jabatan: formData.jabatan || prev.master_dosen.jabatan,
            jurusan: formData.jurusan || prev.master_dosen.jurusan,
            program_studi: formData.program_studi || prev.master_dosen.program_studi,
            no_telp: formData.no_telp || prev.master_dosen.no_telp,
            gelar: formData.gelar || prev.master_dosen.gelar,
            pendidikan_terakhir: formData.pendidikan_terakhir || prev.master_dosen.pendidikan_terakhir,
            provinsi_lahir: formData.provinsi_lahir || prev.master_dosen.provinsi_lahir,
            kota_lahir: formData.kota_lahir || prev.master_dosen.kota_lahir,
          } : null,
        } : prev);
      } else {
        setErrorMsg(data.error || "Gagal memperbarui profil");
      }
    } catch (error) {
      setErrorMsg("Gagal terhubung ke server");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <button
        onClick={() => router.push(backUrl)}
        className="flex items-center gap-2 text-slate-600 hover:text-slate-800 mb-6 transition-colors"
        aria-label="Kembali"
      >
        <ArrowLeft size={20} />
        <span className="text-sm font-medium">Kembali</span>
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Edit Profil</h1>
              <p className="text-sm text-blue-100 mt-0.5">
                Role: <span className="font-semibold text-white">{profileData?.role ? ROLE_DISPLAY[profileData.role] || profileData.role : "-"}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Informasi Akun (Tidak Dapat Diubah)</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-500 mb-1">
                  <div className="flex items-center gap-1.5">
                    <Mail size={12} />
                    <span>Email</span>
                  </div>
                </label>
                <div className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700">
                  {profileData?.email || "-"}
                </div>
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">
                  <div className="flex items-center gap-1.5">
                    <Shield size={12} />
                    <span>Role</span>
                  </div>
                </label>
                <div className="px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700 font-medium">
                  {profileData?.role ? ROLE_DISPLAY[profileData.role] || profileData.role : "-"}
                </div>
              </div>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-green-50 border border-green-200 text-green-600 text-sm rounded-lg">
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-700 pt-2 border-t border-slate-100">
              Informasi yang Dapat Diedit
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-500 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <Hash size={12} />
                    <span>NIP</span>
                  </div>
                </label>
                <input
                  type="text"
                  name="nip"
                  value={formData.nip}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-slate-900"
                  placeholder="Masukkan NIP"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <Hash size={12} />
                    <span>NIDN</span>
                  </div>
                </label>
                <input
                  type="text"
                  name="nidn"
                  value={formData.nidn}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-slate-900"
                  placeholder="Masukkan NIDN"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-500 mb-1.5">
                Gelar
              </label>
              <input
                type="text"
                name="gelar"
                value={formData.gelar}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-slate-900"
                placeholder="Masukkan Gelar (contoh: S.Pd, M.Pd)"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-500 mb-1.5">
                Pendidikan Terakhir
              </label>
              <select
                name="pendidikan_terakhir"
                value={formData.pendidikan_terakhir}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-slate-900"
              >
                <option value="">-- Pilih Pendidikan --</option>
                <option value="S1">S1</option>
                <option value="S2">S2</option>
                <option value="S3">S3</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-500 mb-1.5">
                  Provinsi Kelahiran
                </label>
                <div className="relative">
                  <select
                    name="provinsi_lahir"
                    value={formData.provinsi_lahir}
                    onChange={handleProvinsiChange}
                    disabled={dataProvinsi.length === 0}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-slate-900 appearance-none"
                  >
                    <option value="" disabled>{dataProvinsi.length === 0 ? "Memuat..." : "Pilih Provinsi"}</option>
                    {dataProvinsi.map((p) => (
                      <option key={p.id} value={p.nama}>{p.nama}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1.5">
                  Kota/Kabupaten Kelahiran
                </label>
                <div className="relative">
                  <select
                    name="kota_lahir"
                    value={formData.kota_lahir}
                    onChange={handleChange}
                    disabled={!formData.provinsi_lahir || isLoadingKota || dataKota.length === 0}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-slate-900 appearance-none"
                  >
                    <option value="" disabled>{!formData.provinsi_lahir ? "Pilih Provinsi Dahulu" : isLoadingKota ? "Memuat..." : "Pilih Kota/Kabupaten"}</option>
                    {dataKota.map((k) => (
                      <option key={k.id} value={k.nama}>{k.nama}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-500 mb-1.5">
                  Tanggal Lahir
                </label>
                <input
                  type="date"
                  name="tanggal_lahir"
                  value={formData.tanggal_lahir}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1.5">
                  Jenis Kelamin
                </label>
                <select
                  name="jenis_kelamin"
                  value={formData.jenis_kelamin}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-slate-900"
                >
                  <option value="">-- Pilih --</option>
                  <option value="Laki-laki">Laki-laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-500 mb-1.5">
                <div className="flex items-center gap-1.5">
                  <Phone size={12} />
                  <span>Nomor HP</span>
                </div>
              </label>
              <input
                type="tel"
                name="no_telp"
                value={formData.no_telp}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-slate-900"
                placeholder="08xxxxxxxxxx"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-500 mb-1.5">
                <div className="flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
                  <span>Email Pribadi</span>
                </div>
              </label>
              <input
                type="email"
                name="email_pribadi"
                value={formData.email_pribadi}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-slate-900"
                placeholder="Masukkan email pribadi"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-500 mb-1.5">
                Alamat
              </label>
              <textarea
                name="alamat"
                value={formData.alamat}
                onChange={handleChange}
                rows={2}
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-slate-900 resize-none"
                placeholder="Masukkan alamat"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-500 mb-1.5">
                <div className="flex items-center gap-1.5">
                  <BadgeCheck size={12} />
                  <span>Nama Lengkap</span>
                </div>
              </label>
              <input
                type="text"
                name="nama_lengkap"
                value={formData.nama_lengkap}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-slate-900"
                placeholder="Masukkan nama lengkap"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-500 mb-1.5">
                  Pangkat/Golongan
                </label>
                <select
                  name="pangkat_golongan"
                  value={selectedPangkat}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-slate-900"
                >
                  <option value="">-- Pilih Pangkat --</option>
                  {masterData?.masterPangkat.map((pangkat) => (
                    <option key={pangkat.id} value={`${pangkat.pangkat} (${pangkat.golongan})`}>
                      {pangkat.pangkat} ({pangkat.golongan})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <Briefcase size={12} />
                    <span>Jabatan</span>
                  </div>
                </label>
                <select
                  name="jabatan"
                  value={selectedJabatan}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-slate-900"
                >
                  <option value="">-- Pilih Jabatan --</option>
                  {masterData?.masterJabatan.map((jabatan) => (
                    <option key={jabatan.id} value={jabatan.nama}>
                      {jabatan.nama} ({jabatan.singkatan})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-500 mb-1.5">
                  Jurusan
                </label>
                <div className="relative">
                  <select
                    name="jurusan"
                    value={formData.jurusan}
                    onChange={handleJurusanChange}
                    disabled={isLoadingJurusan || dataJurusan.length === 0}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-slate-900 appearance-none"
                  >
                    <option value="" disabled>{isLoadingJurusan ? "Memuat..." : "Pilih Jurusan"}</option>
                    {dataJurusan.map((jrs) => (
                      <option key={jrs.id} value={jrs.nama_jurusan}>{jrs.nama_jurusan}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1.5">
                  Program Studi
                </label>
                <div className="relative">
                  <select
                    name="program_studi"
                    value={formData.program_studi}
                    onChange={handleChange}
                    disabled={!formData.jurusan || availableProdi.length === 0}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-slate-900 appearance-none"
                  >
                    <option value="" disabled>{!formData.jurusan ? "Pilih Jurusan Dahulu" : "Pilih Program Studi"}</option>
                    {availableProdi.map((prodi) => (
                      <option key={prodi.id} value={prodi.nama_prodi}>{prodi.nama_prodi}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    <span>Simpan Perubahan</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}