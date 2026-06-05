"use client";
import { useState, useRef, useEffect } from "react";
import { Search, Command, FileText, User, FileSpreadsheet, Menu, X } from "lucide-react";
import { useRouter } from "next/navigation";

const menuItems = [
  { label: "Dashboard", href: "/admin/dashboard", icon: Menu },
  { label: "Verifikasi Pengajuan", href: "/admin/verifikasi-pengajuan", icon: FileText },
  { label: "Monitoring Dosen", href: "/admin/riwayat-dosen", icon: User },
  { label: "Buku Induk", href: "/admin/buku-induk", icon: FileSpreadsheet },
  { label: "Monitoring Pengguna", href: "/master_admin/monitoring-pengguna", icon: User },
  { label: "Peran & Hak Akses", href: "/master_admin/role-permission", icon: Menu },
  { label: "Log Aktivitas", href: "/master_admin/audit-log", icon: FileText },
];

const userMenuItems = [
  { label: "Dashboard", href: "/user/dashboard", icon: Menu },
  { label: "Pengajuan Studi", href: "/user/pengajuan", icon: FileText },
  { label: "Riwayat & Monitoring", href: "/user/riwayat", icon: FileText },
  { label: "Pengajuan Beasiswa", href: "/user/user-reimbursement", icon: FileText },
  { label: "Laporan KHS", href: "/user/laporanKHS", icon: FileText },
];

type SearchResult = {
  type: "menu" | "dosen";
  label: string;
  href?: string;
  subtitle?: string;
};

export default function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
      setResults([]);
    }
  }, [open]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const q = query.toLowerCase();
    const allItems = [...menuItems, ...userMenuItems];
    const filtered: SearchResult[] = allItems
      .filter((item) => item.label.toLowerCase().includes(q))
      .map((item) => ({ type: "menu", label: item.label, href: item.href }));
    setResults(filtered);
  }, [query]);

  const handleSelect = (result: SearchResult) => {
    if (result.href) {
      router.push(result.href);
    }
    setOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg transition-colors text-sm w-80"
      >
        <Search size={16} className="text-slate-400" />
        <span className="flex-1 text-left text-slate-400">Cari dosen, NIP, SK, menu...</span>
        <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 bg-[#0A192F] border border-slate-700 rounded text-[10px] font-medium text-slate-400">
          <Command size={10} />K
        </kbd>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
              <Search size={18} className="text-slate-400 flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari dosen, NIP, SK, atau menu..."
                className="flex-1 bg-transparent border-none outline-none text-sm text-slate-700 placeholder:text-slate-400"
              />
              {query && (
                <button onClick={() => setQuery("")} className="text-slate-400 hover:text-slate-600">
                  <X size={16} />
                </button>
              )}
            </div>

            {results.length > 0 && (
              <div className="max-h-72 overflow-y-auto p-2">
                <p className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Menu</p>
                {results.map((result, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelect(result)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-100 rounded-lg transition-colors text-left"
                  >
                    {result.type === "menu" ? <Menu size={16} className="text-slate-400" /> : <User size={16} className="text-slate-400" />}
                    <span>{result.label}</span>
                  </button>
                ))}
              </div>
            )}

            {query && results.length === 0 && (
              <div className="p-8 text-center text-sm text-slate-400">
                Tidak ditemukan hasil untuk "{query}"
              </div>
            )}

            <div className="flex items-center gap-4 px-5 py-3 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-400">
              <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 bg-white border border-slate-200 rounded text-[10px]">↑↓</kbd> Navigasi</span>
              <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 bg-white border border-slate-200 rounded text-[10px]">↵</kbd> Pilih</span>
              <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 bg-white border border-slate-200 rounded text-[10px]">Esc</kbd> Tutup</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
