"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users, ClipboardCheck, FileText, GraduationCap,
  ChevronRight, Loader2,
} from "lucide-react";
import type { TabKey } from "@/src/types/buku-induk";
import StatCard from "./StatCard";
import TabSemuaDosen from "./TabSemuaDosen";
import TabTugasBelajar from "./TabTugasBelajar";
import TabIzinBelajar from "./TabIzinBelajar";
import TabDoktor from "./TabDoktor";
import TabProfesor from "./TabProfesor";

interface DosenItem {
  id: number;
  nama_lengkap: string;
  nip: string | null;
  jurusan: string | null;
  jenjang: string | null;
  jenis_pengajuan_studi: string | null;
  status_kuliah: string | null;
  jabatan: string | null;
}

interface Stats {
  totalDosen: number;
  tugasBelajar: { total: number; aktif: number; lulus: number; do: number };
  izinBelajar: { total: number; aktif: number; selesai: number };
  doktor: number;
  profesor: number;
}

interface BukuIndukClientProps {
  apiUrl: string;
}

const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: "semua", label: "Semua Dosen", icon: <Users size={14} /> },
  { key: "tugas", label: "Tugas Belajar", icon: <ClipboardCheck size={14} /> },
  { key: "izin", label: "Izin Belajar", icon: <FileText size={14} /> },
  { key: "doktor", label: "Doktor", icon: <GraduationCap size={14} /> },
  { key: "profesor", label: "Profesor", icon: <GraduationCap size={14} /> },
];

const TAB_ACTIVE_COLOR: Record<TabKey, string> = {
  semua: "text-blue-500 border-blue-500",
  tugas: "text-blue-500 border-blue-500",
  izin: "text-blue-500 border-blue-500",
  doktor: "text-violet-600 border-violet-600",
  profesor: "text-emerald-600 border-emerald-600",
};

type TabMeta = {
  title: string;
  subtitle: string;
  breadcrumb?: string;
  stats: React.ReactNode;
};

function useTabMeta(stats: Stats | null, loading: boolean): Record<TabKey, TabMeta> {
  const tugasTotal = stats?.tugasBelajar?.total ?? 0;
  const tugasAktif = stats?.tugasBelajar?.aktif ?? 0;
  const tugasLulus = stats?.tugasBelajar?.lulus ?? 0;
  const tugasDO = stats?.tugasBelajar?.do ?? 0;
  const izinTotal = stats?.izinBelajar?.total ?? 0;
  const izinAktif = stats?.izinBelajar?.aktif ?? 0;
  const izinSelesai = stats?.izinBelajar?.selesai ?? 0;

  return {
    semua: {
      title: "Buku Induk",
      subtitle: "Master data akademik dosen Politeknik Negeri Semarang",
      stats: (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard label="Total Dosen" value={loading ? "-" : (stats?.totalDosen ?? 0)} sub="Seluruh dosen" iconBg="bg-blue-50" icon={<Users size={20} className="text-blue-500" />} />
          <StatCard label="Aktif Studi" value={loading ? "-" : tugasAktif + izinAktif} sub="Sedang studi" iconBg="bg-emerald-50" icon={<ClipboardCheck size={20} className="text-emerald-500" />} />
          <StatCard label="Doktor" value={loading ? "-" : (stats?.doktor ?? 0)} sub="Total doktor" iconBg="bg-violet-50" icon={<GraduationCap size={20} className="text-violet-500" />} />
          <StatCard label="Profesor" value={loading ? "-" : (stats?.profesor ?? 0)} sub="Total profesor" iconBg="bg-emerald-50" icon={<GraduationCap size={20} className="text-emerald-500" />} />
        </div>
      ),
    },
    tugas: {
      title: "Buku Induk - Tugas Belajar",
      subtitle: "Data dosen dengan status tugas belajar",
      stats: (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard label="Total Tugas Belajar" value={loading ? "-" : tugasTotal} sub="Seluruh data" iconBg="bg-emerald-50" icon={<ClipboardCheck size={20} className="text-emerald-500" />} />
          <StatCard label="Aktif" value={loading ? "-" : tugasAktif} sub="Sedang studi" iconBg="bg-emerald-50" icon={<ClipboardCheck size={20} className="text-emerald-500" />} />
          <StatCard label="Lulus" value={loading ? "-" : tugasLulus} sub="Selesai studi" iconBg="bg-blue-50" icon={<GraduationCap size={20} className="text-blue-500" />} />
          <StatCard label="DO / Mengundurkan Diri" value={loading ? "-" : tugasDO} sub="Tidak melanjutkan" iconBg="bg-amber-50" icon={<Users size={20} className="text-amber-500" />} />
        </div>
      ),
    },
    izin: {
      title: "Buku Induk - Izin Belajar",
      subtitle: "Data dosen dengan status izin belajar",
      stats: (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <StatCard label="Total Izin Belajar" value={loading ? "-" : izinTotal} sub="Seluruh data" iconBg="bg-orange-50" icon={<FileText size={20} className="text-orange-400" />} />
          <StatCard label="Aktif" value={loading ? "-" : izinAktif} sub="Sedang studi" iconBg="bg-orange-50" icon={<ClipboardCheck size={20} className="text-orange-400" />} />
          <StatCard label="Selesai" value={loading ? "-" : izinSelesai} sub="Selesai studi" iconBg="bg-orange-50" icon={<Users size={20} className="text-orange-400" />} />
        </div>
      ),
    },
    doktor: {
      title: "Buku Induk - Doktor",
      subtitle: "Daftar dosen dengan gelar doktor Politeknik Negeri Semarang",
      breadcrumb: "Doktor",
      stats: (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard label="Total Doktor" value={loading ? "-" : (stats?.doktor ?? 0)} sub="Orang" iconBg="bg-violet-50" icon={<GraduationCap size={20} className="text-violet-500" />} />
        </div>
      ),
    },
    profesor: {
      title: "Buku Induk - Profesor",
      subtitle: "Daftar dosen dengan gelar profesor Politeknik Negeri Semarang",
      breadcrumb: "Profesor",
      stats: (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard label="Total Profesor" value={loading ? "-" : (stats?.profesor ?? 0)} sub="Orang" iconBg="bg-emerald-50" icon={<GraduationCap size={20} className="text-emerald-500" />} />
        </div>
      ),
    },
  };
}

export default function BukuIndukClient({ apiUrl }: BukuIndukClientProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("semua");
  const [data, setData] = useState<DosenItem[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const metas = useTabMeta(stats, loading);
  const meta = metas[activeTab];

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const res = await fetch(apiUrl);
        if (res.ok) {
          const json = await res.json();
          setData(json.daftarDosen || []);
          if (json.stats) setStats(json.stats);
        }
      } catch (err) {
        console.error("Gagal mengambil data buku induk:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [apiUrl]);

  return (
    <div className="max-w-[1100px] mx-auto px-6 py-7">
      {meta.breadcrumb && (
        <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-4">
          <Link href="/dashboard" className="text-blue-500 hover:underline">Dashboard</Link>
          <ChevronRight size={13} className="text-gray-400" />
          <Link href="/buku-induk" className="text-blue-500 hover:underline">Buku Induk</Link>
          <ChevronRight size={13} className="text-gray-400" />
          <span className="text-gray-700 font-medium">{meta.breadcrumb}</span>
        </nav>
      )}

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{meta.title}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{meta.subtitle}</p>
        </div>
      </div>

      {meta.stats}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex border-b border-gray-200 px-5 overflow-x-auto">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-4 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors ${
                  isActive
                    ? TAB_ACTIVE_COLOR[tab.key]
                    : "text-gray-500 border-transparent hover:text-gray-700"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-gray-400">
            <Loader2 className="animate-spin text-blue-500 mr-2" size={18} />
            <span className="text-sm font-medium">Memuat data...</span>
          </div>
        ) : (
          <>
            {activeTab === "semua" && <TabSemuaDosen data={data} />}
            {activeTab === "tugas" && <TabTugasBelajar data={data} />}
            {activeTab === "izin" && <TabIzinBelajar data={data} />}
            {activeTab === "doktor" && <TabDoktor data={data} />}
            {activeTab === "profesor" && <TabProfesor data={data} />}
          </>
        )}
      </div>
    </div>
  );
}
