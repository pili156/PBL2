"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, Shield, Briefcase, BadgeCheck, Save, ArrowLeft, Loader2, Hash } from "lucide-react";

type ProfileData = {
  email: string;
  username: string;
  role: string;
  master_dosen: {
    nip?: string;
    nama_lengkap?: string;
    pangkat_golongan?: string;
    jabatan?: string;
    unit_kerja?: string;
    jurusan?: string;
    program_studi?: string;
  } | null;
};

const roleDisplayMap: Record<string, string> = {
  dosen: "Dosen",
  admin: "Admin",
  admin_fakultas: "Admin Fakultas",
  master_admin: "Master Admin",
  keuangan: "Bagian Keuangan",
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

  const [formData, setFormData] = useState({
    username: "",
    nip: "",
    nama_lengkap: "",
    pangkat_golongan: "",
    jabatan: "",
    unit_kerja: "",
    jurusan: "",
    program_studi: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch(apiUrl);
      const data = await res.json();

      if (res.ok) {
        setProfileData(data);
        setFormData({
          username: data.username || "",
          nip: data.master_dosen?.nip || "",
          nama_lengkap: data.master_dosen?.nama_lengkap || "",
          pangkat_golongan: data.master_dosen?.pangkat_golongan || "",
          jabatan: data.master_dosen?.jabatan || "",
          unit_kerja: data.master_dosen?.unit_kerja || "",
          jurusan: data.master_dosen?.jurusan || "",
          program_studi: data.master_dosen?.program_studi || "",
        });
      } else {
        setErrorMsg(data.error || "Gagal memuat data profil");
      }
    } catch (error) {
      setErrorMsg("Gagal terhubung ke server");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

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
        if (profileData) {
          setProfileData({
            ...profileData,
            username: formData.username || profileData.username,
            master_dosen: profileData.master_dosen ? {
              ...profileData.master_dosen,
              nama_lengkap: formData.nama_lengkap || profileData.master_dosen.nama_lengkap,
              pangkat_golongan: formData.pangkat_golongan || profileData.master_dosen.pangkat_golongan,
              jabatan: formData.jabatan || profileData.master_dosen.jabatan,
              unit_kerja: formData.unit_kerja || profileData.master_dosen.unit_kerja,
              jurusan: formData.jurusan || profileData.master_dosen.jurusan,
              program_studi: formData.program_studi || profileData.master_dosen.program_studi,
            } : null,
          });
        }
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
                Role: <span className="font-semibold text-white">{profileData?.role ? roleDisplayMap[profileData.role] || profileData.role : "-"}</span>
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
                  {profileData?.role ? roleDisplayMap[profileData.role] || profileData.role : "-"}
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
                    <User size={12} />
                    <span>Username</span>
                  </div>
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  placeholder="Masukkan username"
                />
              </div>
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
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  placeholder="Masukkan NIP"
                />
              </div>
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
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                placeholder="Masukkan nama lengkap"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-500 mb-1.5">
                  Pangkat/Golongan
                </label>
                <input
                  type="text"
                  name="pangkat_golongan"
                  value={formData.pangkat_golongan}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  placeholder="Contoh: IV/a"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <Briefcase size={12} />
                    <span>Jabatan</span>
                  </div>
                </label>
                <input
                  type="text"
                  name="jabatan"
                  value={formData.jabatan}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  placeholder="Masukkan jabatan"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-500 mb-1.5">
                Unit Kerja
              </label>
              <input
                type="text"
                name="unit_kerja"
                value={formData.unit_kerja}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                placeholder="Masukkan unit kerja"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-500 mb-1.5">
                  Jurusan
                </label>
                <input
                  type="text"
                  name="jurusan"
                  value={formData.jurusan}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  placeholder="Masukkan jurusan"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1.5">
                  Program Studi
                </label>
                <input
                  type="text"
                  name="program_studi"
                  value={formData.program_studi}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  placeholder="Masukkan program studi"
                />
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