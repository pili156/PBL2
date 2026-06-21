"use client";

import { useState } from "react";
import { Eye, FileText } from "lucide-react";
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
  jenis_pengajuan_studi: string | null;
  status_kuliah: string | null;
}

interface TabTugasBelajarProps {
  data: DosenItem[];
}

const PER_PAGE = 8;

function mapStatus(statusKuliah: string | null): StatusDosen {
  if (!statusKuliah) return "Aktif";
  if (statusKuliah === "Lulus") return "Lulus";
  if (statusKuliah === "DO") return "DO";
  if (statusKuliah === "Selesai") return "Selesai";
  return "Aktif";
}

export default function TabTugasBelajar({ data }: TabTugasBelajarProps) {
  const [search, setSearch] = useState("");
  const [jurusan, setJurusan] = useState("Semua Jurusan");
  const [status, setStatus] = useState("Semua Status");
  const [page, setPage] = useState(1);

  const filtered = data.filter((d) => {
    const jenisStudi = (d.jenis_pengajuan_studi || "").toLowerCase();
    if (!jenisStudi.includes("tugas belajar")) return false;

    const nama = (d.nama_lengkap || "").toLowerCase();
    const nip = (d.nip || "").toString();
    const jur = (d.jurusan || "").toLowerCase();
    const pt = (d.perguruan_tinggi || "").toLowerCase();
    const stat = d.status_kuliah || "Aktif";

    const matchSearch = nama.includes(search.toLowerCase()) || nip.includes(search) || jur.includes(search.toLowerCase()) || pt.includes(search.toLowerCase());
    const matchJurusan = jurusan === "Semua Jurusan" || jur.includes(jurusan.toLowerCase());
    const matchStatus = status === "Semua Status" || stat === status;

    return matchSearch && matchJurusan && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <>
      <FilterBar
        searchPlaceholder="Cari nama, NIP, atau jurusan..."
        searchValue={search}
        onSearchChange={setSearch}
        filters={[
          {
            label: "Jurusan",
            options: ["Semua Jurusan", "Teknik Elektro", "Teknik Informatika", "Teknik Mesin"],
            value: jurusan,
            onChange: setJurusan,
          },
          {
            label: "Status",
            options: ["Semua Status", "Aktif", "Lulus", "DO"],
            value: status,
            onChange: setStatus,
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
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 whitespace-nowrap">Perguruan Tinggi</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 whitespace-nowrap">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 whitespace-nowrap">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-400 italic">Tidak ada data tugas belajar.</td>
              </tr>
            ) : (
              paged.map((d, i) => (
                <tr key={d.id} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                  <td className="px-4 py-3.5 text-sm text-gray-500">{(page - 1) * PER_PAGE + i + 1}</td>
                  <td className="px-4 py-3.5 text-sm text-blue-500 font-medium cursor-pointer hover:underline">{d.nama_lengkap}</td>
                  <td className="px-4 py-3.5 text-sm text-gray-600">{d.nip || "-"}</td>
                  <td className="px-4 py-3.5 text-sm text-gray-600">{d.perguruan_tinggi || "-"}</td>
                  <td className="px-4 py-3.5"><StatusBadge status={mapStatus(d.status_kuliah)} /></td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1.5">
                      <button className="w-7 h-7 flex items-center justify-center rounded-md border border-gray-200 text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-colors">
                        <Eye size={13} />
                      </button>
                      <button className="w-7 h-7 flex items-center justify-center rounded-md border border-gray-200 text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-colors">
                        <FileText size={13} />
                      </button>
                    </div>
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
        accentColor="blue"
      />
    </>
  );
}
