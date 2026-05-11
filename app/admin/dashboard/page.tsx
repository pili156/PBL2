import { 
  Clock, 
  FileCheck, 
  AlertCircle,
  ArrowRight,
  TrendingUp,
  GraduationCap,
  Calendar
} from "lucide-react";
import { prisma } from "@/src/lib/prisma"; 
import LineChartJurusan from "./LineChartJurusan"; 

export default async function AdminDashboardPage() {
  // =====================================================================
  // 1. DATA FETCHING - KPI UTAMA
  // =====================================================================
  const [
    pendingVerifikasi,
    totalSK,
    khsTerlambat,
    aktifStudi
  ] = await Promise.all([
    prisma.dokumenPengajuan.count({ where: { status_verifikasi: "Pending" } }),
    prisma.skKementerian.count(),
    prisma.monitoringKhs.count({ 
      where: { catatan_evaluasi: { contains: "Terlambat", mode: 'insensitive' } } 
    }),
    prisma.skKementerian.count({ where: { status_studi: "Aktif" } }) 
  ]);

  // =====================================================================
  // 2. DATA FETCHING - MONITORING PER JURUSAN (Untuk Line Chart)
  // =====================================================================
  const daftarJurusan = ["Elektro", "Sipil", "Mesin", "AB", "Akuntansi"];
  
  const monitoringData = await Promise.all(
    daftarJurusan.map(async (jurusan) => {
      const total = await prisma.pengajuanStudi.count({
        where: { 
          user: { 
            master_dosen: { unit_kerja: jurusan } 
          } 
        }
      });
      return { jurusan, total };
    })
  );

  // =====================================================================
  // 3. DATA FETCHING - ANTREAN VERIFIKASI (Tindakan Cepat)
  // =====================================================================
  const urgentTasks = await prisma.dokumenPengajuan.findMany({
    where: { status_verifikasi: "Pending" },
    include: {
      master_dokumen: true,
      pengajuan_studi: {
        include: { 
          user: { 
            include: { master_dosen: true } 
          } 
        }
      }
    },
    take: 6, // Mengambil sedikit lebih banyak karena sekarang satu baris penuh
    orderBy: { updated_at: 'asc' }
  });

  return (
    <div className="p-6 bg-slate-50 min-h-screen space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard Admin SIGAP Polines</h1>
          <p className="text-slate-500">Kelola dan pantau seluruh data pengajuan studi lanjut dosen secara real-time.</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-2 rounded-lg shadow-sm border border-slate-200">
          <Calendar className="text-blue-600" size={20} />
          <span className="text-sm font-medium text-slate-700">
            {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>
      </div>

      {/* KPI Cards (Tetap di Baris Atas) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Dosen Aktif Studi" 
          value={aktifStudi} 
          icon={<GraduationCap size={24} />} 
          trend="Status Aktif di SK" 
          color="blue" 
        />
        <StatCard 
          title="Perlu Verifikasi" 
          value={pendingVerifikasi} 
          icon={<Clock size={24} />} 
          trend="Berkas menunggu" 
          color="amber" 
          isUrgent={pendingVerifikasi > 0}
        />
        <StatCard 
          title="KHS Terlambat" 
          value={khsTerlambat} 
          icon={<AlertCircle size={24} />} 
          trend="Butuh tindakan segera" 
          color="red" 
          isUrgent={khsTerlambat > 0}
        />
        <StatCard 
          title="SK Terbit" 
          value={totalSK} 
          icon={<FileCheck size={24} />} 
          trend="Total arsip kementerian" 
          color="emerald" 
        />
      </div>

      {/* Row 1: Tren Dosen (Full Width) */}
      <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-xl font-bold text-slate-800">Tren Dosen Studi Lanjut</h3>
            <p className="text-sm text-slate-400">Distribusi total pengajuan berdasarkan unit kerja (jurusan).</p>
          </div>
          <div className="p-3 bg-blue-50 rounded-full text-blue-600">
            <TrendingUp size={24} />
          </div>
        </div>
        
        {/* Grafik Line Chart */}
        <div className="pt-4">
          <LineChartJurusan data={monitoringData} />
        </div>
      </div>

      {/* Row 2: Tindakan Cepat (Full Width) */}
      <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-bold text-slate-800">Tindakan Cepat</h3>
            <p className="text-sm text-slate-400">Verifikasi berkas terbaru yang memerlukan perhatian Anda.</p>
          </div>
          <button className="text-sm font-bold text-blue-600 hover:underline">
            Lihat Semua Antrean
          </button>
        </div>

        {/* List Antrean dalam bentuk Grid agar rapi di Row yang luas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {urgentTasks.length > 0 ? urgentTasks.map((task) => (
            <div key={task.id} className="group flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-blue-200 hover:bg-white transition-all shadow-sm hover:shadow-md">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-blue-600 font-bold border border-slate-200 group-hover:border-blue-400 shrink-0 uppercase">
                {task.pengajuan_studi?.user?.master_dosen?.nama_lengkap?.charAt(0) || '?'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-800 truncate">
                  {task.pengajuan_studi?.user?.master_dosen?.nama_lengkap || 'Dosen'}
                </p>
                <p className="text-xs text-slate-500 truncate" title={task.master_dokumen?.nama_dokumen || ''}>
                  {task.master_dokumen?.nama_dokumen || 'Verifikasi Berkas'}
                </p>
              </div>
              <button className="p-2 bg-white rounded-lg border border-slate-200 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <ArrowRight size={18} />
              </button>
            </div>
          )) : (
            <div className="col-span-full text-center py-12">
              <div className="inline-block p-4 bg-emerald-50 rounded-full text-emerald-600 mb-4">
                <FileCheck size={32} />
              </div>
              <p className="text-slate-400 font-medium">Luar biasa! Tidak ada antrean verifikasi saat ini.</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

// Sub-component StatCard
function StatCard({ title, value, icon, trend, color, isUrgent }: any) {
  const colors: any = {
    blue: "bg-blue-600 text-white shadow-blue-100",
    amber: "bg-amber-500 text-white shadow-amber-100",
    red: "bg-rose-600 text-white shadow-rose-100",
    emerald: "bg-emerald-600 text-white shadow-emerald-100",
  };

  return (
    <div className={`bg-white p-6 rounded-2xl border shadow-sm transition-all hover:-translate-y-1 ${isUrgent ? 'border-rose-200 ring-4 ring-rose-50' : 'border-slate-200'}`}>
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{title}</p>
          <h3 className="text-3xl font-black text-slate-900">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl shadow-lg ${colors[color]}`}>
          {icon}
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2">
        <div className={`w-1.5 h-1.5 rounded-full ${isUrgent ? 'animate-ping bg-rose-600' : 'bg-slate-300'}`} />
        <p className={`text-xs font-semibold ${isUrgent ? 'text-rose-600' : 'text-slate-500'}`}>
          {trend}
        </p>
      </div>
    </div>
  );
}