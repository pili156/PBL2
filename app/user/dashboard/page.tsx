"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Upload, Wallet, ClipboardCheck, FileEdit } from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  LineChart, Line
} from "recharts";
import { formatRupiah } from "@/src/lib/formatters";
import StatusBadge from "@/src/components/StatusBadge";

// --- Interfaces Data ---
interface DashboardData {
  nama_dosen: string;
  status_pengajuan: string;
  semester: number;
  progress_studi: number;
  status_studi: string;
  jenis_studi: string;
  skInfo: { nomor_sk: string; tanggal_terbit: string; file_sk_path: string } | null;
  timelineKHS: { semester: number; status: string; ipk: number }[];
  grafikIPK: { semester: string; ipk: number }[];
  summaryReimbursement: { diajukan: number; dicairkan: number; pending: number };
  grafikReimbursement: { semester: string; nominal: number }[];
  checklistDokumen: { nama: string; status: string; isMandatory: boolean; catatan: string | null }[];
}

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
      <div className="w-full h-full flex items-center justify-center bg-slate-50 rounded-2xl">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-slate-500 font-medium text-sm">Memuat Pusat Monitoring Studi...</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="w-full h-full p-6 bg-slate-50 rounded-2xl overflow-y-auto space-y-8">
      
      {/* 1. HEADER & PROGRESS STUDI */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Selamat datang, {data.nama_dosen}</h1>
          <p className="text-slate-500 text-sm mt-1">Pusat Informasi, Monitoring, & Evaluasi Studi Akademik Anda.</p>
        </div>
        <div className="w-full md:w-1/3">
          <div className="flex justify-between text-xs font-semibold mb-2">
            <span className="text-slate-600">Progress Masa Studi</span>
            <span className="text-blue-600">Semester {data.semester} / 8 ({data.progress_studi}%)</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full transition-all duration-500" style={{ width: `${data.progress_studi}%` }}></div>
          </div>
        </div>
      </div>

      {/* 2. QUICK ACTIONS */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">Aksi Cepat</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/user/pengajuan" className="flex flex-col items-center justify-center p-5 bg-white hover:bg-blue-50/50 border border-slate-200 hover:border-blue-300 rounded-xl text-slate-700 hover:text-blue-700 transition shadow-sm group">
            <div className="p-3 bg-blue-50 rounded-lg text-blue-600 mb-3 group-hover:bg-blue-100 transition">
              <FileEdit size={20} />
            </div>
            <span className="font-semibold text-xs text-center">Ajukan / Update Studi</span>
          </Link>

          <Link href="/user/laporanKHS/upload" className="flex flex-col items-center justify-center p-5 bg-white hover:bg-emerald-50/50 border border-slate-200 hover:border-emerald-300 rounded-xl text-slate-700 hover:text-emerald-700 transition shadow-sm group">
            <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600 mb-3 group-hover:bg-emerald-100 transition">
              <Upload size={20} />
            </div>
            <span className="font-semibold text-xs text-center">Upload KHS Baru</span>
          </Link>

          <Link href="/user/user-reimbursement/ajukan" className="flex flex-col items-center justify-center p-5 bg-white hover:bg-amber-50/50 border border-slate-200 hover:border-amber-300 rounded-xl text-slate-700 hover:text-amber-700 transition shadow-sm group">
            <div className="p-3 bg-amber-50 rounded-lg text-amber-600 mb-3 group-hover:bg-amber-100 transition">
              <Wallet size={20} />
            </div>
            <span className="font-semibold text-xs text-center">Klaim Reimbursement</span>
          </Link>

          <Link href="/user/status" className="flex flex-col items-center justify-center p-5 bg-white hover:bg-purple-50/50 border border-slate-200 hover:border-purple-300 rounded-xl text-slate-700 hover:text-purple-700 transition shadow-sm group">
            <div className="p-3 bg-purple-50 rounded-lg text-purple-600 mb-3 group-hover:bg-purple-100 transition">
              <ClipboardCheck size={20} />
            </div>
            <span className="font-semibold text-xs text-center">Cek Status Dokumen</span>
          </Link>
        </div>
      </div>

      {/* 3. INFORMASI STATUS & SK */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Status Pengajuan</span>
          <p className="text-lg font-bold text-blue-600 mt-2">{data.status_pengajuan}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Status Studi Terkini</span>
          <p className="text-lg font-bold text-emerald-600 mt-2">{data.status_studi}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">SK Kementerian</span>
          {data.skInfo ? (
            <div className="space-y-2">
              <div>
                <p className="text-sm font-bold text-slate-800">{data.skInfo.nomor_sk}</p>
                <p className="text-[11px] text-slate-400 font-medium">Terbit: {new Date(data.skInfo.tanggal_terbit).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
              </div>
              {data.skInfo.file_sk_path && (
                <a href={data.skInfo.file_sk_path} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-xs text-blue-600 font-semibold hover:text-blue-700 mt-1 hover:underline">
                  <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  Unduh Dokumen SK
                </a>
              )}
            </div>
          ) : (
            <p className="text-sm font-medium text-slate-400 italic mt-2">Belum ada SK Diterbitkan</p>
          )}
        </div>
      </div>

      {/* 4. KHS TIMELINE & GRAFIK IPK */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Timeline KHS */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <h3 className="text-base font-bold text-slate-800 mb-4">Timeline KHS per Semester</h3>
          {data.timelineKHS.length > 0 ? (
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 flex-grow">
              {data.timelineKHS.map((khs, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 border border-slate-100 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition">
                  <div>
                    <p className="font-bold text-sm text-slate-700">Semester {khs.semester}</p>
                    <p className="text-xs text-slate-500 mt-0.5 font-medium">Indeks Prestasi: {khs.ipk.toFixed(2)}</p>
                  </div>
                  <StatusBadge status={khs.status} domain="evaluasi" size="sm" />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 flex-grow">
              <p className="text-xs text-slate-400 italic">Belum ada data lembar KHS yang diunggah.</p>
            </div>
          )}
        </div>

        {/* Grafik IPK */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-base font-bold text-slate-800 mb-4">Grafik Perkembangan IPK</h3>
          <div className="h-[280px] w-full">
            {data.grafikIPK.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.grafikIPK} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="semester" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis domain={[0, 4.0]} tickCount={5} tick={{ fontSize: 11, fill: '#64748b' }} />
                  {/* @ts-ignore: Bypass bug type bawaan dari Recharts */}
                  <RechartsTooltip formatter={(value: any) => [Number(value).toFixed(2), "IPK"]} />
                  <Line type="monotone" dataKey="ipk" stroke="#10b981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center">
                <p className="text-xs text-slate-400 italic">Data transkrip tidak cukup untuk menampilkan grafik.</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* 5. DOKUMEN & REIMBURSEMENT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Checklist Dokumen */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <h3 className="text-base font-bold text-slate-800 mb-4">Checklist Dokumen Kelengkapan Pengajuan</h3>
          {data.checklistDokumen.length > 0 ? (
            <div className="space-y-1 max-h-[350px] overflow-y-auto pr-1 flex-grow">
              {data.checklistDokumen.map((doc, idx) => (
                <div key={idx} className="flex justify-between items-start p-3 border-b border-slate-100 last:border-0 hover:bg-slate-50/30 rounded-lg transition">
                  <div className="max-w-[70%]">
                    <p className="font-semibold text-slate-700 text-xs leading-relaxed">{doc.nama}</p>
                    {doc.catatan && (
                      <div className="flex items-start mt-1.5 text-[11px] text-rose-600 bg-rose-50/50 p-2 rounded-md border border-rose-100">
                        <span className="font-bold mr-1">Catatan:</span> {doc.catatan}
                      </div>
                    )}
                  </div>
                  <StatusBadge status={doc.status} domain="verifikasi" size="sm" />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 flex-grow">
              <p className="text-xs text-slate-400 italic">Belum ada berkas dokumen pengajuan.</p>
            </div>
          )}
        </div>

        {/* Ringkasan & Grafik Reimbursement */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <h3 className="text-base font-bold text-slate-800 mb-4">Ringkasan Dana Reimbursement</h3>
          
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Diajukan</p>
              <p className="font-bold text-slate-700 text-xs mt-1">{formatRupiah(data.summaryReimbursement.diajukan)}</p>
            </div>
            <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl text-center">
              <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Dicairkan</p>
              <p className="font-bold text-emerald-700 text-xs mt-1">{formatRupiah(data.summaryReimbursement.dicairkan)}</p>
            </div>
            <div className="p-3 bg-amber-50/50 border border-amber-100 rounded-xl text-center">
              <p className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">Tertunda (Pending)</p>
              <p className="font-bold text-amber-700 text-xs mt-1">{formatRupiah(data.summaryReimbursement.pending)}</p>
            </div>
          </div>

          <div className="h-[200px] w-full flex-grow">
            {data.grafikReimbursement.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.grafikReimbursement} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="semester" tick={{ fontSize: 11, fill: '#64748b' }} />
                  {/* @ts-ignore: Bypass bug type bawaan dari Recharts */}
                  <YAxis 
                    tickFormatter={(val: any) => `Rp${(Number(val)/1000000).toFixed(0)}Jt`} 
                    width={55} 
                    tick={{ fontSize: 11, fill: '#64748b' }} 
                  />
                  {/* @ts-ignore: Bypass bug type bawaan dari Recharts */}
                  <RechartsTooltip formatter={(value: any) => [formatRupiah(Number(value)), "Nominal"]} />
                  <Bar dataKey="nominal" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center">
                <p className="text-xs text-slate-400 italic">Belum ada riwayat data pendanaan finansial.</p>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}