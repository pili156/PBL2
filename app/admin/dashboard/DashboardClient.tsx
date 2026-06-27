// app/admin/dashboard/DashboardClient.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { 
  Clock, FileCheck, AlertCircle, ArrowRight, GraduationCap, Download, AlertTriangle, FilePlus
} from "lucide-react";
import { formatDateTime } from "@/src/lib/formatters";
import StatusBadge from "@/src/components/StatusBadge";
import DateFilter from "./DateFilter";

const RechartsBar = dynamic(() => import("recharts").then(mod => {
  const { ResponsiveContainer, BarChart, Bar, CartesianGrid, Tooltip, XAxis, YAxis, Legend } = mod;
  return function ChartBar({ data, ...props }: any) {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis dataKey="jurusan" tick={{ fontSize: 11, fill: '#64748b' }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} />
          <Tooltip cursor={{fill: '#f8fafc'}} formatter={(val: any) => [val, "Total Pengajuan"]} />
          <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={50} />
        </BarChart>
      </ResponsiveContainer>
    );
  };
}), { ssr: false, loading: () => <div className="h-[280px] w-full bg-slate-100 animate-pulse rounded-lg" /> });

const RechartsPie = dynamic(() => import("recharts").then(mod => {
  const { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } = mod;
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
  return function ChartPie({ data }: { data: any[] }) {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={3} dataKey="value" stroke="none">
            {data.map((entry: any, index: number) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(val: any) => [val, "Jumlah"]} />
          <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }}/>
        </PieChart>
      </ResponsiveContainer>
    );
  };
}), { ssr: false, loading: () => <div className="h-[280px] w-full bg-slate-100 animate-pulse rounded-lg" /> });

export default function DashboardClient({ data }: { data: any }) {
  const router = useRouter();
  const [showAlert, setShowAlert] = useState(false); // State untuk alert custom

  // Fungsi Export Excel
  const handleExport = async () => {
    if (!data.exportData || data.exportData.length === 0) {
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 4000);
      return;
    }

    const XLSXModule = await import("xlsx");
    const wb = XLSXModule.utils.book_new();
    const ws = XLSXModule.utils.json_to_sheet(data.exportData);
    
    const colWidths = Object.keys(data.exportData[0] || {}).map((key) => ({
      wch: Math.max(key.length * 1.5, 20),
    }));
    ws['!cols'] = colWidths;

    XLSXModule.utils.book_append_sheet(wb, ws, "Ringkasan_Dashboard");
    
    let fileName = "Ringkasan_Admin_Semua_Waktu.xlsx";
    if (data.dari && data.sampai) {
      fileName = `Ringkasan_Admin_${data.dari}_sd_${data.sampai}.xlsx`;
    } else if (data.dari) {
      fileName = `Ringkasan_Admin_Sejak_${data.dari}.xlsx`;
    } else if (data.sampai) {
      fileName = `Ringkasan_Admin_Hingga_${data.sampai}.xlsx`;
    }

    XLSXModule.writeFile(wb, fileName);
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen space-y-8 rounded-2xl">
      
      {/* ALERT NOTIFICATION (Muncul saat data export kosong) */}
      {showAlert && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-5 py-3.5 rounded-xl flex items-center gap-3 shadow-sm transition-all animate-in fade-in slide-in-from-top-4 duration-300">
          <AlertCircle size={20} className="text-rose-500" />
          <span className="text-sm font-bold">Tidak ada data untuk di-export pada rentang tanggal ini.</span>
          <button 
            onClick={() => setShowAlert(false)} 
            className="ml-auto text-rose-400 hover:text-rose-600 font-bold text-lg leading-none"
          >
            &times;
          </button>
        </div>
      )}

      {/* 1. HEADER & ACTIONS */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dashboard Admin SIGAP</h1>
          <p className="text-slate-500 text-sm mt-1">Pusat kendali dan pemantauan data pengajuan studi lanjut.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <DateFilter />

          <button 
            onClick={handleExport} 
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg text-sm font-bold transition-all shadow-sm hover:shadow-md"
          >
            <Download size={16} strokeWidth={2.5} />
            Export Data
          </button>
        </div>
      </div>

      {/* 2. KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Dosen Aktif Studi" value={data.kpi.aktifStudi} icon={<GraduationCap size={24}/>} color="blue" trend="Status SK Aktif"/>
        <StatCard title="Perlu Verifikasi" value={data.kpi.pendingVerifikasi} icon={<Clock size={24}/>} color="amber" trend="Menunggu Diproses" isUrgent={data.kpi.pendingVerifikasi > 0}/>
        <StatCard title="KHS Terlambat" value={data.kpi.khsTerlambat} icon={<AlertCircle size={24}/>} color="red" trend="Butuh Peringatan" isUrgent={data.kpi.khsTerlambat > 0}/>
        <StatCard title="SK Diterbitkan" value={data.kpi.totalSK} icon={<FileCheck size={24}/>} color="emerald" trend="Total Arsip Valid"/>
      </div>

      {/* 3. CHART SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart Tren Jurusan */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-base font-bold text-slate-800 mb-4">Distribusi Pengajuan per Jurusan</h3>
          <div className="h-[280px] w-full">
            <RechartsBar data={data.monitoringData} />
          </div>
        </div>

        {/* Pie Chart Status */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <h3 className="text-base font-bold text-slate-800 mb-4">Rasio Status Pengajuan</h3>
          <div className="h-[280px] w-full flex-grow">
            {data.grafikStatus.length > 0 ? (
              <RechartsPie data={data.grafikStatus} />
            ) : (
              <div className="flex h-full items-center justify-center"><p className="text-xs text-slate-400 italic">Data tidak tersedia untuk filter ini.</p></div>
            )}
          </div>
        </div>
      </div>

      {/* 4. DATA LISTS (Baru Masuk & Antrean) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Pengajuan Baru */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-800">Pengajuan Baru Masuk</h3>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><FilePlus size={18}/></div>
          </div>
          {data.pengajuanBaru.length > 0 ? (
            <div className="space-y-3">
              {data.pengajuanBaru.map((item: any) => (
                <div key={item.id} className="flex justify-between items-center p-3 border border-slate-100 bg-slate-50/50 rounded-xl">
                  <div>
                    <p className="font-bold text-sm text-slate-700">{item.dosen}</p>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">{item.jenis} • {formatDateTime(item.tanggal)}</p>
                  </div>
                  <StatusBadge status={item.status} size="sm" />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 flex-grow"><p className="text-xs text-slate-400 italic">Belum ada pengajuan baru.</p></div>
          )}
        </div>

        {/* Antrean Verifikasi */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-800">Antrean Verifikasi Mendesak</h3>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><Clock size={18}/></div>
          </div>
          {data.urgentTasks.length > 0 ? (
            <div className="space-y-3">
              {data.urgentTasks.map((task: any) => (
                <Link href={`/admin/verifikasi-pengajuan/${task.pengajuan_id}`} key={task.id} className="group flex justify-between items-center p-3 border border-slate-100 bg-white hover:border-blue-300 hover:shadow-sm rounded-xl transition-all cursor-pointer">
                  <div>
                    <p className="font-bold text-sm text-slate-700 group-hover:text-blue-700 transition">{task.dosen}</p>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">{task.dokumen}</p>
                  </div>
                  <ArrowRight size={16} className="text-slate-300 group-hover:text-blue-600 transition" />
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 flex-grow"><p className="text-xs text-slate-400 italic">Antrean verifikasi kosong. Luar biasa!</p></div>
          )}
        </div>
      </div>

      {/* 5. WARNING TABLE (Melewati Batas Revisi) */}
      {data.lewatBatas.length > 0 && (
        <div className="bg-white p-6 rounded-xl border border-rose-200 shadow-sm ring-4 ring-rose-50 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-800">Perhatian: Melewati Batas Waktu Revisi ( &gt; 7 Hari )</h3>
              <p className="text-xs text-slate-500 mt-1">Dokumen di bawah ini sudah terlalu lama berstatus revisi/ditolak tanpa adanya pembaruan dari dosen.</p>
            </div>
            <div className="p-2 bg-rose-100 text-rose-600 rounded-lg animate-pulse"><AlertTriangle size={20}/></div>
          </div>
          
          <div className="overflow-x-auto rounded-lg border border-slate-100">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-bold">Nama Dosen</th>
                  <th className="px-4 py-3 font-bold">Dokumen Bermasalah</th>
                  <th className="px-4 py-3 font-bold">Terakhir Diupdate</th>
                  <th className="px-4 py-3 font-bold text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.lewatBatas.map((item: any) => (
                  <tr key={item.id} className="hover:bg-rose-50/30 transition">
                    <td className="px-4 py-3 font-medium text-slate-800">{item.dosen}</td>
                    <td className="px-4 py-3">{item.dokumen}</td>
                    <td className="px-4 py-3 text-rose-600 font-semibold">{formatDateTime(item.tanggalUpdate)}</td>
                    <td className="px-4 py-3 text-center">
                      <Link href={`/admin/verifikasi-pengajuan/${item.pengajuan_id}`} className="text-xs font-bold text-blue-600 hover:underline">Tinjau</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}

// Sub-Component Card
function StatCard({ title, value, icon, trend, color, isUrgent }: any) {
  const colors: any = {
    blue: "bg-blue-50 text-blue-600 border-blue-200",
    amber: "bg-amber-50 text-amber-600 border-amber-200",
    red: "bg-rose-50 text-rose-600 border-rose-200",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-200",
  };

  return (
    <div className={`bg-white p-5 rounded-xl border shadow-sm transition-all hover:-translate-y-1 ${isUrgent ? 'border-rose-300 ring-4 ring-rose-50' : 'border-slate-200'}`}>
      <div className="flex justify-between items-start">
        <div className="space-y-1.5">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{title}</p>
          <h3 className="text-3xl font-black text-slate-800">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl ${colors[color]}`}>
          {icon}
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2">
        <div className={`w-1.5 h-1.5 rounded-full ${isUrgent ? 'animate-ping bg-rose-600' : 'bg-slate-300'}`} />
        <p className={`text-[11px] font-bold ${isUrgent ? 'text-rose-600' : 'text-slate-500'}`}>
          {trend}
        </p>
      </div>
    </div>
  );
}