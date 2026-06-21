"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2 } from "lucide-react";

export default function CreateMasterJabatanPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ nama: "", singkatan: "", urutan: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/master-jabatan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama: formData.nama,
          singkatan: formData.singkatan,
          urutan: Number(formData.urutan),
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Gagal menyimpan data jabatan.");
      }

      router.push("/master_admin/master-jabatan");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan sistem.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 bg-[#F8FAFC] min-h-screen text-[#1F1F1F]">
      <div className="mb-8 flex items-center gap-4">
        <Link href="/master_admin/master-jabatan" className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 transition">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Tambah Jabatan</h1>
          <p className="text-sm text-gray-500">Tambahkan jabatan fungsional baru ke daftar master.</p>
        </div>
      </div>

      <div className="max-w-2xl rounded-3xl bg-white border border-gray-100 p-8 shadow-sm">
        {error && <div className="mb-6 rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Nama Jabatan</label>
              <input
                name="nama"
                type="text"
                value={formData.nama}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="Asisten Ahli"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Singkatan</label>
              <input
                name="singkatan"
                type="text"
                value={formData.singkatan}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="AA"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Urutan</label>
              <input
                name="urutan"
                type="number"
                value={formData.urutan}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="1"
                min={0}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save size={16} />}
            Simpan Jabatan
          </button>
        </form>
      </div>
    </div>
  );
}
