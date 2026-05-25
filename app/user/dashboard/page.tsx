"use client";

import { useEffect, useState } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";

interface ChartDataReimbursement {
  semester: string;
  nominal: number;
}

interface ChartDataDokumen {
  name: string;
  value: number;
}

interface DashboardData {
  nama_dosen: string;
  status_pengajuan: string;
  semester: number | string;
  wilayah_studi: string;
  jenis_studi: string;
  status_studi: string;
  pendanaan: string;
  grafikReimbursement: ChartDataReimbursement[];
  grafikDokumen: ChartDataDokumen[];
}

// Warna untuk Pie Chart (Jika ada data)
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#ef4444'];
// Warna untuk Pie Chart (Jika kosong)
const EMPTY_COLOR = ['#e5e7eb']; 

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch("/api/user/dashboard");
        if (response.ok) {
          const result = await response.json();
          setData(result);
        }
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-2xl">
        <p className="text-gray-500 font-medium animate-pulse">Memuat data dashboard...</p>
      </div>
    );
  }

  if (!data) return null;

  // --- LOGIKA UNTUK DATA KOSONG GRAFIK ---
  const isReimbursementEmpty = data.grafikReimbursement.length === 0;
  const barChartData = isReimbursementEmpty 
    ? [{ semester: 'Belum ada data', nominal: 0 }] 
    : data.grafikReimbursement;

  const isDokumenEmpty = data.grafikDokumen.length === 0;
  const pieChartData = isDokumenEmpty 
    ? [{ name: 'Belum ada data', value: 1 }] 
    : data.grafikDokumen;
  const pieColors = isDokumenEmpty ? EMPTY_COLOR : COLORS;

  return (
    <div className="w-full h-full p-6 bg-gray-50 rounded-2xl overflow-y-auto space-y-6">
      
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Selamat datang, {data.nama_dosen}</h1>
        <p className="text-gray-500 mt-1">Berikut adalah ringkasan informasi akademik Anda saat ini.</p>
      </div>

      {/* STATISTIK KARTU UTAMA */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Card 1: Status Pengajuan (Biru) */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-sm font-medium text-gray-500">Status Pengajuan</span>
            <p className="text-xl font-bold text-blue-600 mt-1">{data.status_pengajuan}</p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
        </div>

        {/* Card 2: Semester Berjalan (Abu-abu gelap) */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-sm font-medium text-gray-500">Semester Berjalan</span>
            <p className="text-xl font-bold text-gray-800 mt-1">
              {data.semester !== "-" ? `Semester ${data.semester}` : "-"}
            </p>
          </div>
          <div className="p-3 bg-gray-100 text-gray-700 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
            </svg>
          </div>
        </div>

        {/* Card 3: Status Studi (Hijau Emerald) */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-sm font-medium text-gray-500">Status Studi</span>
            <p className="text-xl font-bold text-emerald-600 mt-1">{data.status_studi}</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
            </svg>
          </div>
        </div>

      </div>

      {/* BAGIAN GRAFIK */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        
        {/* Grafik 1: Reimbursement */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Riwayat Reimbursement</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="semester" />
                <YAxis 
                  tickFormatter={(value) => `Rp${(value/1000000).toFixed(0)}Jt`} 
                  width={80} 
                />
                {!isReimbursementEmpty && (
                  <RechartsTooltip 
                    formatter={(value: any) => {
                      const formattedValue = new Intl.NumberFormat('id-ID', { 
                        style: 'currency', 
                        currency: 'IDR' 
                      }).format(Number(value));
                      return [formattedValue, "Nominal"];
                    }}
                  />
                )}
                <Bar dataKey="nominal" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Grafik 2: Status Dokumen */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Status Dokumen Pengajuan</h2>
          <div className="h-[300px] w-full relative">
            {/* Tambahan teks di tengah jika kosong */}
            {isDokumenEmpty && (
              <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none mb-8">
                <span className="text-gray-400 font-medium italic text-sm">Tidak ada data</span>
              </div>
            )}
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                {!isDokumenEmpty && <RechartsTooltip />}
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}