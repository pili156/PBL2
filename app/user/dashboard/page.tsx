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
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <span className="text-sm font-medium text-gray-500">Status Pengajuan</span>
          <p className="text-lg font-bold text-blue-600">{data.status_pengajuan}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <span className="text-sm font-medium text-gray-500">Semester Berjalan</span>
          <p className="text-lg font-bold text-gray-800">Semester {data.semester}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <span className="text-sm font-medium text-gray-500">Status Studi</span>
          <p className="text-lg font-bold text-emerald-600">{data.status_studi}</p>
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