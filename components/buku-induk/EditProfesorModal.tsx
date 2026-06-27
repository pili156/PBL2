"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Loader2, Save, User, FileText, GraduationCap } from "lucide-react";
import { getProvinsiData, getKotaData, getJurusanData, getJabatanData, getPangkatData } from "@/app/register/actions";

interface DosenDetail {
  id: number;
  nip: string | null;
  nidn: string | null;
  nama_lengkap: string | null;
  tanggal_lahir: string | null;
  jenis_kelamin: string | null;
  email_pribadi: string | null;
  alamat: string | null;
  jurusan: string | null;
  jabatan: string | null;
  program_studi: string | null;
  pangkat_golongan: string | null;
  no_telp: string | null;
  gelar: string | null;
  provinsi_lahir: string | null;
  kota_lahir: string | null;
  pendidikan_terakhir: string | null;
  bidang_keahlian: string | null;
  status_dosen: string | null;
  tanggal_lulus: string | null;
}

interface EditDosenModalProps {
  dosenId: number | null;
  isOpen: boolean;
  onClose: () => void;
  apiUrl: string;
  onSave?: () => void;
}

function InputField({ label, name, value, onChange, type = "text", required = false, readOnly = false, placeholder }: {
  label: string; name: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string; required?: boolean; readOnly?: boolean; placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</label>
      <input
        type={type} name={name} value={value} onChange={onChange} placeholder={placeholder}
        readOnly={readOnly} required={required}
        className="p-2.5 border border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none disabled:bg-gray-50 disabled:text-gray-600"
      />
    </div>
  );
}

function SelectField({ label, name, value, onChange, options }: {
  label: string; name: string; value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</label>
      <select name={name} value={value} onChange={onChange}
        className="p-2.5 border border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none bg-white">
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function Section({ title, icon, color = "blue", children }: {
  title: string; icon: React.ReactNode; color?: string; children: React.ReactNode;
}) {
  const colors: Record<string, string> = {
    blue: "text-blue-600",
    violet: "text-violet-600",
    emerald: "text-emerald-600",
  };
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <h4 className={`text-sm font-bold ${colors[color] || colors.blue} uppercase tracking-wider mb-4 flex items-center gap-2`}>
        {icon} {title}
      </h4>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {children}
      </div>
    </div>
  );
}

export default function EditDosenModal({ dosenId, isOpen, onClose, apiUrl, onSave }: EditDosenModalProps) {
  const [data, setData] = useState<DosenDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [dataProvinsi, setDataProvinsi] = useState<{ id: number; nama: string }[]>([]);
  const [dataKota, setDataKota] = useState<{ id: number; nama: string }[]>([]);
  const [dataJurusan, setDataJurusan] = useState<{ id: number; nama_jurusan: string; program_studi: { id: number; nama_prodi: string }[] }[]>([]);
  const [dataJabatan, setDataJabatan] = useState<{ id: number; nama: string }[]>([]);
  const [dataPangkat, setDataPangkat] = useState<{ id: number; pangkat: string; golongan: string }[]>([]);
  const [isLoadingKota, setIsLoadingKota] = useState(false);

  const [formData, setFormData] = useState({
    nip: "", nidn: "", nama_lengkap: "", gelar: "", jenis_kelamin: "", tanggal_lahir: "",
    provinsi_lahir: "", kota_lahir: "",
    email_pribadi: "", alamat: "", no_telp: "",
    jurusan: "", program_studi: "", jabatan: "", pangkat_golongan: "", status_dosen: "", bidang_keahlian: "",
    pendidikan_terakhir: "", tanggal_lulus: "",
  });

  useEffect(() => {
    const loadMaster = async () => {
      const [provinsiRes, jurusanRes, jabatanRes, pangkatRes] = await Promise.all([
        getProvinsiData(), getJurusanData(), getJabatanData(), getPangkatData(),
      ]);
      if (provinsiRes) setDataProvinsi(provinsiRes);
      if (jurusanRes) setDataJurusan(jurusanRes);
      if (jabatanRes) setDataJabatan(jabatanRes);
      if (pangkatRes) setDataPangkat(pangkatRes);
    };
    loadMaster();
  }, []);

  const fetchData = useCallback(async () => {
    if (!dosenId || !isOpen) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${apiUrl}/${dosenId}`);
      if (!res.ok) throw new Error("Gagal memuat data");
      const json = await res.json();
      const d: DosenDetail = json.data;
      setData(d);

      const fmtDate = (v: string | null | undefined) => {
        if (!v) return "";
        const d = new Date(v);
        return isNaN(d.getTime()) ? "" : d.toISOString().split("T")[0];
      };

      setFormData({
        nip: d.nip || "",
        nidn: d.nidn || "",
        nama_lengkap: d.nama_lengkap || "",
        gelar: d.gelar || "",
        jenis_kelamin: d.jenis_kelamin || "",
        tanggal_lahir: fmtDate(d.tanggal_lahir),
        provinsi_lahir: d.provinsi_lahir || "",
        kota_lahir: d.kota_lahir || "",
        email_pribadi: d.email_pribadi || "",
        alamat: d.alamat || "",
        no_telp: d.no_telp || "",
        jurusan: d.jurusan || "",
        program_studi: d.program_studi || "",
        jabatan: d.jabatan || "",
        pangkat_golongan: d.pangkat_golongan || "",
        status_dosen: d.status_dosen || "",
        bidang_keahlian: d.bidang_keahlian || "",
        pendidikan_terakhir: d.pendidikan_terakhir || "",
        tanggal_lulus: fmtDate(d.tanggal_lulus),
      });

      if (d.provinsi_lahir) {
        const selected = dataProvinsi.find((p) => p.nama === d.provinsi_lahir);
        if (selected) {
          setIsLoadingKota(true);
          const kotaRes = await getKotaData(selected.id);
          if (kotaRes) setDataKota(kotaRes);
          setIsLoadingKota(false);
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [dosenId, isOpen, apiUrl, dataProvinsi]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (isOpen) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleProvinsiChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedName = e.target.value;
    const selected = dataProvinsi.find((p) => p.nama === selectedName);
    setFormData((prev) => ({ ...prev, provinsi_lahir: selectedName, kota_lahir: "" }));
    if (selected) {
      setIsLoadingKota(true);
      try {
        const kotaRes = await getKotaData(selected.id);
        if (kotaRes) setDataKota(kotaRes);
      } finally {
        setIsLoadingKota(false);
      }
    } else {
      setDataKota([]);
    }
  };

  const handleJurusanChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, jurusan: e.target.value, program_studi: "" }));
  };

  const selectedJurusan = dataJurusan.find((j) => j.nama_jurusan === formData.jurusan);
  const prodiOptions = selectedJurusan
    ? selectedJurusan.program_studi.map((p) => ({ value: p.nama_prodi, label: p.nama_prodi }))
    : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dosenId) return;
    setSaving(true);
    setError("");

    try {
      const body: Record<string, any> = {
        nip: formData.nip || undefined,
        nidn: formData.nidn || undefined,
        nama_lengkap: formData.nama_lengkap || undefined,
        gelar: formData.gelar || undefined,
        jenis_kelamin: formData.jenis_kelamin || undefined,
        tanggal_lahir: formData.tanggal_lahir || undefined,
        provinsi_lahir: formData.provinsi_lahir || undefined,
        kota_lahir: formData.kota_lahir || undefined,
        email_pribadi: formData.email_pribadi || undefined,
        alamat: formData.alamat || undefined,
        no_telp: formData.no_telp || undefined,
        jurusan: formData.jurusan || undefined,
        program_studi: formData.program_studi || undefined,
        jabatan: formData.jabatan || undefined,
        pangkat_golongan: formData.pangkat_golongan || undefined,
        status_dosen: formData.status_dosen || undefined,
        bidang_keahlian: formData.bidang_keahlian || undefined,
        pendidikan_terakhir: formData.pendidikan_terakhir || undefined,
        tanggal_lulus: formData.tanggal_lulus || undefined,
      };

      const res = await fetch(`${apiUrl}/${dosenId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal menyimpan");

      onSave?.();
      onClose();
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Edit Data Dosen</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-8rem)] px-6 py-5">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-gray-400">
              <Loader2 className="animate-spin text-blue-500 mr-2" size={18} />
              <span className="text-sm font-medium">Memuat data...</span>
            </div>
          ) : error && !data ? (
            <div className="text-center py-16 text-red-400 text-sm">{error}</div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl p-3 font-medium">
                  {error}
                </div>
              )}

              <Section title="Identitas & Kepegawaian" icon={<User size={14} />}>
                <InputField label="NIP" name="nip" value={formData.nip} onChange={handleChange} />
                <InputField label="NIDN" name="nidn" value={formData.nidn} onChange={handleChange} />
                <InputField label="Nama Lengkap" name="nama_lengkap" value={formData.nama_lengkap} onChange={handleChange} required />
                <InputField label="Gelar" name="gelar" value={formData.gelar} onChange={handleChange} />
                <SelectField label="Jenis Kelamin" name="jenis_kelamin" value={formData.jenis_kelamin} onChange={handleChange}
                  options={[{ value: "", label: "-- Pilih --" }, { value: "Laki-laki", label: "Laki-laki" }, { value: "Perempuan", label: "Perempuan" }]} />
                <InputField label="Tanggal Lahir" name="tanggal_lahir" value={formData.tanggal_lahir} onChange={handleChange} type="date" />
                <SelectField label="Provinsi Lahir" name="provinsi_lahir" value={formData.provinsi_lahir} onChange={handleProvinsiChange}
                  options={[{ value: "", label: "-- Pilih --" }, ...dataProvinsi.map((p) => ({ value: p.nama, label: p.nama }))]} />
                <SelectField label="Kota Lahir" name="kota_lahir" value={formData.kota_lahir} onChange={handleChange}
                  options={[{ value: "", label: "-- Pilih --" }, ...dataKota.map((k) => ({ value: k.nama, label: k.nama }))]} />
                <InputField label="Email Pribadi" name="email_pribadi" value={formData.email_pribadi} onChange={handleChange} type="email" />
                <InputField label="No. Telp" name="no_telp" value={formData.no_telp} onChange={handleChange} />
                <InputField label="Alamat" name="alamat" value={formData.alamat} onChange={handleChange} />
              </Section>

              <Section title="Pekerjaan & Jurusan" icon={<FileText size={14} />}>
                <SelectField label="Jurusan" name="jurusan" value={formData.jurusan} onChange={handleJurusanChange}
                  options={[{ value: "", label: "-- Pilih --" }, ...dataJurusan.map((j) => ({ value: j.nama_jurusan, label: j.nama_jurusan }))]} />
                <SelectField label="Program Studi" name="program_studi" value={formData.program_studi} onChange={handleChange}
                  options={[{ value: "", label: !formData.jurusan ? "Pilih Jurusan Dahulu" : "-- Pilih --" }, ...prodiOptions]} />
                <SelectField label="Jabatan Fungsional" name="jabatan" value={formData.jabatan} onChange={handleChange}
                  options={[{ value: "", label: "-- Pilih --" }, ...dataJabatan.map((j) => ({ value: j.nama, label: j.nama }))]} />
                <SelectField label="Pangkat / Golongan" name="pangkat_golongan" value={formData.pangkat_golongan} onChange={handleChange}
                  options={[{ value: "", label: "-- Pilih --" }, ...dataPangkat.map((p) => ({ value: `${p.pangkat} (${p.golongan})`, label: `${p.pangkat} (${p.golongan})` }))]} />
                <SelectField label="Status Dosen" name="status_dosen" value={formData.status_dosen} onChange={handleChange}
                  options={[{ value: "", label: "-- Pilih --" }, { value: "Aktif", label: "Aktif" }, { value: "Nonaktif", label: "Nonaktif" }, { value: "Pensiun", label: "Pensiun" }]} />
                <InputField label="Bidang Keahlian" name="bidang_keahlian" value={formData.bidang_keahlian} onChange={handleChange} />
              </Section>

              <Section title="Pendidikan & Studi" icon={<GraduationCap size={14} />}>
                <SelectField label="Pendidikan Terakhir" name="pendidikan_terakhir" value={formData.pendidikan_terakhir} onChange={handleChange}
                  options={[{ value: "", label: "-- Pilih --" }, { value: "S1", label: "S1" }, { value: "S2", label: "S2" }, { value: "S3", label: "S3" }]} />
                <InputField label="Tanggal Lulus" name="tanggal_lulus" value={formData.tanggal_lulus} onChange={handleChange} type="date" />
              </Section>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-lg transition-colors">
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving || loading}
                  className="px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  {saving ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
