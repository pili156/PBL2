"use client";

import { useState, useMemo } from "react";
import { Eye } from "lucide-react";
import StatusBadge from "./StatusBadge";
import FilterBar from "./FilterBar";
import Pagination from "./Pagination";
import type { StatusDosen } from "@/src/types/buku-induk";

interface DosenItem {
  id: number;
  nama_lengkap: string;
  nip: string | null;
  jurusan: string | null;
  perguruan_tinggi: string | null;
  pendidikan_terakhir: string | null;
  status_kuliah: string | null;
  data_doktor?: unknown;
}

interface TabDoktorProps {
  data: DosenItem[];
  onViewDetail?: (id: number) => void;
}

const PER_PAGE = 8;

function isDoktor(d: DosenItem): boolean {
  const pendidikanTerakhir = (d.pendidikan_terakhir || "").toUpperCase();
  return pendidikanTerakhir === "S3";
}

function mapStatus(statusKuliah: string | null): StatusDosen {
  if (!statusKuliah) return "Aktif";
  if (statusKuliah === "Lulus") return "Lulus";
  if (statusKuliah === "DO") return "DO";
  if (statusKuliah === "Selesai") return "Selesai";
  return "Aktif";
}

export default function TabDoktor({ data, onViewDetail }: TabDoktorProps) {
  const [search, setSearch] = useState("");
  const [jurusan, setJurusan] = useState("Semua Jurusan");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => data.filter((d) => {
    if (!isDoktor(d)) return false;

    const nama = (d.nama_lengkap || "").toLowerCase();
    const nip = (d.nip || "").toString();
    const jur = (d.jurusan || "").toLowerCase();
    const pt = (d.perguruan_tinggi || "").toLowerCase();

    const matchSearch = nama.includes(search.toLowerCase()) || nip.includes(search) || jur.includes(search.toLowerCase()) || pt.includes(search.toLowerCase());
    const matchJurusan = jurusan === "Semua Jurusan" || jur.includes(jurusan.toLowerCase());

    return matchSearch && matchJurusan;
  }), [data, search, jurusan]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <>
      <FilterBar
        searchPlaceholder="Cari nama doktor, NIP, atau jurusan..."
        searchValue={search}
        onSearchChange={setSearch}
        filters={[
          {
            label: "Jurusan",
            options: ["Semua Jurusan", "Teknik Elektro", "Teknik Informatika", "Teknik Sipil", "Teknik Mesin", "Teknik Kimia"],
            value: jurusan,
            onChange: setJurusan,
          },
        ]}
      />

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50 border-y border-gray-100">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 whitespace-nowrap">No</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 whitespace-nowrap">Nama Dosen</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 whitespace-nowrap">NIP</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 whitespace-nowrap">Jurusan</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 whitespace-nowrap">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 whitespace-nowrap">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-400 italic">Tidak ada data doktor.</td>
              </tr>
            ) : (
              paged.map((d, i) => (
                <tr key={d.id} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                  <td className="px-4 py-3.5 text-sm text-gray-600">{(page - 1) * PER_PAGE + i + 1}</td>
                  <td className="px-4 py-3.5 text-sm text-blue-500 font-medium cursor-pointer hover:underline" onClick={() => onViewDetail?.(d.id)}>{d.nama_lengkap}</td>
                  <td className="px-4 py-3.5 text-sm text-gray-600">{d.nip || "-"}</td>
                  <td className="px-4 py-3.5 text-sm text-gray-600">{d.jurusan || "-"}</td>
                  <td className="px-4 py-3.5"><StatusBadge status={mapStatus(d.status_kuliah)} /></td>
                  <td className="px-4 py-3.5">
                    <button
                      onClick={() => onViewDetail?.(d.id)}
                      className="w-7 h-7 flex items-center justify-center rounded-md border border-gray-200 text-gray-500 hover:border-violet-400 hover:text-violet-500 transition-colors"
                      title="Lihat Detail"
                    >
                      <Eye size={13} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        totalData={filtered.length}
        perPage={PER_PAGE}
        onPageChange={setPage}
        accentColor="purple"
      />
    </>
  );
}
