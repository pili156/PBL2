"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Download, Search } from "lucide-react";
import { PengajuanMonitoring } from "./types";
import MonitoringTable from "./components/MonitoringTable";

export default function VerifikasiPengajuanPage() {
  const [data, setData] = useState<PengajuanMonitoring[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState("semua");
  const [searchNip, setSearchNip] = useState("");

  useEffect(() => {
    fetchData();
  }, [currentPage, selectedStatus]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        status: selectedStatus,
      });

      const response = await fetch(
        `/api/admin/pengajuan-monitoring?${params}`
      );
      const result = await response.json();

      if (response.ok) {
        setData(result.data);
        setTotalPages(result.totalPages);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = searchNip
    ? data.filter((item) =>
        item.nip.toLowerCase().includes(searchNip.toLowerCase())
      )
    : data;

  const stats = [
    {
      label: "Belum Direview",
      count: data.filter((d) => d.status === "pending").length,
      color: "bg-gray-100",
    },
    {
      label: "Pending",
      count: data.filter((d) => d.status === "pending").length,
      color: "bg-red-100",
      icon: "⚠️",
    },
    {
      label: "Terverifikasi",
      count: data.filter((d) => d.status === "terverifikasi").length,
      color: "bg-green-100",
      icon: "✓",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-600">
        <Link href="/admin/dashboard" className="hover:text-blue-600">
          Dashboard
        </Link>
        <span>{">"}</span>
        <span className="text-slate-900 font-medium">Monitoring Pengajuan</span>
      </div>

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Monitoring Pengajuan Dosen
          </h1>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
          <Download size={18} />
          Export Excle
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className={`${stat.color} rounded-lg p-6 text-center`}
          >
            <div className="text-3xl font-bold mb-2">
              {stat.icon && <span className="mr-2">{stat.icon}</span>}
              {stat.count}
            </div>
            <p className="text-sm font-medium text-slate-700">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 flex items-center gap-4">
        <input
          type="text"
          placeholder="Cari Dosen / NIP..."
          value={searchNip}
          onChange={(e) => setSearchNip(e.target.value)}
          className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button className="p-2 hover:bg-slate-100 rounded transition-colors">
          <Search size={20} className="text-slate-600" />
        </button>

        <select
          value={selectedStatus}
          onChange={(e) => {
            setSelectedStatus(e.target.value);
            setCurrentPage(1);
          }}
          className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="semua">Semua Status</option>
          <option value="pending">Pending</option>
          <option value="terverifikasi">Terverifikasi</option>
          <option value="revisi">Revisi</option>
        </select>

        <button
          onClick={() => {
            setSelectedStatus("semua");
            setSearchNip("");
            setCurrentPage(1);
          }}
          className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors font-medium"
        >
          Reset
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
          <p className="text-slate-500">Loading data...</p>
        </div>
      ) : (
        <MonitoringTable
          data={filteredData}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}
