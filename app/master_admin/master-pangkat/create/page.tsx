"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2 } from "lucide-react";

export default function CreateMasterPangkatPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ pangkat: "", golongan: "" });
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
      const response = await fetch("/api/master-pangkat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pangkat: formData.pangkat,
          golongan: formData.golongan,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Gagal menyimpan data pangkat.");
      }

      router.push("/master_admin/master-pangkat");
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
        <Link href="/master_admin/master-pangkat" className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 transition">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Tambah Pangkat</h1>
          <p className="text-sm text-gray-500">Tambahkan entri pangkat baru ke daftar master.</p>
        </div>
      </div>

      <div className="max-w-2xl rounded-3xl bg-white border border-gray-100 p-8 shadow-sm">
        {error && <div className="mb-6 rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Pangkat</label>
              <input
                name="pangkat"
                type="text"
                value={formData.pangkat}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="Penata Muda"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Golongan</label>
              <input
                name="golongan"
                type="text"
                value={formData.golongan}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="III/a"
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
            Simpan Pangkat
          </button>
        </form>
      </div>
    </div>
  );
}
