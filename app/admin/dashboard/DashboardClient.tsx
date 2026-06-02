// app/admin/dashboard/DashboardClient.tsx
"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import * as XLSX from "xlsx";
import { 
  Clock, FileCheck, AlertCircle, ArrowRight, GraduationCap, Download, AlertTriangle, FilePlus, Calendar
} from "lucide-react";
import { 
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend
} from "recharts";

// Jurus Bypass TS untuk Recharts
const SafeTooltip = RechartsTooltip as any;
const SafeXAxis = XAxis as any;
const SafeYAxis = YAxis as any;
const SafeBar = Bar as any;
const SafePie = Pie as any;
const SafeLegend = Legend as any;

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function DashboardClient({ data }: { data: any }) {
  const router = useRouter();

  // Fungsi Export Excel
  const handleExport = () => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data.exportData);
    
    const colWidths = Object.keys(data.exportData[0] || {}).map((key) => ({
      wch: Math.max(key.length * 1.5, 20),
    }));
    ws['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, "Ringkasan_Dashboard");
    XLSX.writeFile(wb, `Ringkasan_Admin_${data.filter.toUpperCase()}.xlsx`);
  };

  // Format Tanggal Profesional (Misal: 01 Juni 2026, 14:30)
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).replace('.', ':') + ' WIB';
  };

  // Format Tanggal Hari Ini untuk Header
  const todayDate = new Date().toLocaleDateString('id-ID', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const getStatusBadgeClass = (status: string) => {
    switch(status?.toLowerCase()) {
      case 'valid': case 'disetujui': case 'selesai': return 'text-emerald-700 bg-emerald-50 border border-emerald-200';
      case 'revisi': case 'ditolak': return 'text-rose-700 bg-rose-50 border border-rose-200';
      case 'pending': case 'menunggu': return 'text-amber-700 bg-amber-50 border border-amber-200';
      default: return 'text-slate-600 bg-slate-50 border border-slate-200';
    }
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen space-y-8 rounded-2xl">
      
      {/* 1. HEADER & ACTIONS */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dashboard Admin SIGAP</h1>
          <p className="text-slate-500 text-sm mt-1">Pusat kendali dan pemantauan data pengajuan studi lanjut.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Widget Tanggal Hari Ini */}
          <div className="hidden lg:flex items-center gap-2 bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-lg text-slate-600 shadow-sm">
            <Calendar size={18} className="text-blue-600" />
            <span className="text-sm font-bold">{todayDate}</span>
          </div>

          {/* Filter Data */}
          <select 
            className="bg-slate-50 border border-slate-200 text-slate-700 text-sm font-bold rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 outline-none cursor-pointer hover:bg-slate-100 transition shadow-sm"
            value={data.filter}
            onChange={(e) => router.push(`?filter=${e.target.value}`)}
          >
            <option value="all">📅 Semua Waktu</option>
            <option value="bulan">📅 Bulan Ini</option>
            <option value="semester">📅 Semester Ini</option>
            <option value="tahun">📅 Tahun Ini</option>
          </select>

          {/* Tombol Export */}
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
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.monitoringData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <SafeXAxis dataKey="jurusan" tick={{ fontSize: 11, fill: '#64748b' }} />
                <SafeYAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <SafeTooltip cursor={{fill: '#f8fafc'}} formatter={(val: any) => [val, "Total Pengajuan"]} />
                <SafeBar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart Status */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <h3 className="text-base font-bold text-slate-800 mb-4">Rasio Status Pengajuan</h3>
          <div className="h-[280px] w-full flex-grow">
            {data.grafikStatus.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <SafePie data={data.grafikStatus} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={3} dataKey="value" stroke="none">
                    {data.grafikStatus.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </SafePie>
                  <SafeTooltip formatter={(val: any) => [val, "Jumlah"]} />
                  <SafeLegend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }}/>
                </PieChart>
              </ResponsiveContainer>
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
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">{item.jenis} • {formatDate(item.tanggal)}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${getStatusBadgeClass(item.status)}`}>{item.status}</span>
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
                    <td className="px-4 py-3 text-rose-600 font-semibold">{formatDate(item.tanggalUpdate)}</td>
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
        <div className={`p-3 rounded-lg ${colors[color]}`}>
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