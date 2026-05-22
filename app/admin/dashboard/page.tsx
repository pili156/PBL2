import { 
  Users, 
  CheckSquare, 
  ListTodo, 
  FileCheck,
  SlidersHorizontal
} from "lucide-react";
// Import prisma client dari path yang sesuai dengan struktur folder Anda
import { prisma } from "@/src/lib/prisma"; 

export default async function AdminDashboardPage() {
  // =====================================================================
  // 1. DATA FETCHING UNTUK TOP STATS CARDS
  // =====================================================================
  
  // Total Dosen: Menghitung user yang memiliki role 'Dosen' melalui relasi MasterRole
  const totalDosen = await prisma.user.count({
    where: { 
      role: {
        nama_role: "Dosen"
      }
    }
  });

  // Verifikasi: Menghitung DokumenPengajuan dengan status 'Pending'
  const totalVerifikasi = await prisma.dokumenPengajuan.count({
    where: { 
      status_verifikasi: "Pending" 
    } 
  });

  // Total SK Terbit: Menghitung record di tabel SkKementerian
  const totalSKTerbit = await prisma.skKementerian.count();

  // Terlambat KHS: Menghitung MonitoringKhs yang mengandung kata 'Terlambat' di catatan evaluasi
  const totalTerlambatKHS = await prisma.monitoringKhs.count({
    where: { 
      catatan_evaluasi: {
        contains: "Terlambat",
        mode: 'insensitive'
      } 
    }
  });

  // =====================================================================
  // 2. DATA FETCHING UNTUK BAR CHART (PROJECT STATUS)
  // =====================================================================
  
  const daftarJurusan = ["Elektro", "Sipil", "Mesin", "AB", "Akuntansi"];
  
  const chartData = await Promise.all(
    daftarJurusan.map(async (jurusan) => {
      // Total Dosen per jurusan (diambil via MasterDosen)
      const green = await prisma.user.count({
        where: { 
          master_dosen: { unit_kerja: jurusan },
          role: { nama_role: "Dosen" }
        }
      });

      // Verifikasi pending per jurusan
      const yellow = await prisma.dokumenPengajuan.count({
        where: {
          status_verifikasi: "Pending",
          pengajuan_studi: {
            user: {
              master_dosen: { unit_kerja: jurusan }
            }
          }
        }
      });

      // Terlambat KHS per jurusan
      const blue = await prisma.monitoringKhs.count({
        where: {
          catatan_evaluasi: { contains: "Terlambat", mode: 'insensitive' },
          pengajuan_studi: {
            user: {
              master_dosen: { unit_kerja: jurusan }
            }
          }
        }
      });

      const totalValue = green + yellow + blue;
      return { 
        label: jurusan, 
        green, 
        yellow, 
        blue, 
        total: totalValue === 0 ? 1 : totalValue // Menghindari pembagian dengan nol
      };
    })
  );

  // =====================================================================
  // 3. DATA FETCHING UNTUK TABEL (BUTUH TINDAKAN CEPAT)
  // =====================================================================
  
  const dataTindakanCepat = await prisma.monitoringKhs.findMany({
    where: {
      catatan_evaluasi: { contains: "Terlambat", mode: 'insensitive' } 
    },
    include: {
      pengajuan_studi: {
        include: {
          user: {
            include: {
              master_dosen: true // Mengambil nama lengkap dan unit kerja
            }
          },
          jenis_studi: true // Mengambil jenjang studi (S2/S3)
        }
      }
    },
    take: 5, 
    orderBy: {
      id: 'desc'
    }
  });

  const tableData = dataTindakanCepat.map((item) => {
    const dataDosen = item.pengajuan_studi?.user?.master_dosen;
    const jenjang = item.pengajuan_studi?.jenis_studi;

    return {
      id: item.id,
      name: dataDosen?.nama_lengkap || "N/A",
      jurusan: dataDosen?.unit_kerja || "N/A",
      jenjang: jenjang?.nama_jenis || "N/A",
      terlambat: item.catatan_evaluasi || "Terlambat",
    };
  });

  // =====================================================================
  // 4. RENDER UI
  // =====================================================================
  return (
    <div className="max-w-7xl mx-auto space-y-6 p-4">
      
      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Dosen */}
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-slate-700 mb-2">Total Dosen</p>
            <h3 className="text-3xl font-bold text-slate-800">{totalDosen}</h3>
            <p className="text-xs text-slate-400 mt-1">Dosen Terdaftar</p>
          </div>
          <div className="w-14 h-14 bg-blue-50 text-blue-400 rounded-full flex items-center justify-center">
            <Users size={28} strokeWidth={2} />
          </div>
        </div>

        {/* Verifikasi */}
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-slate-700 mb-2">Verifikasi</p>
            <h3 className="text-3xl font-bold text-slate-800">{totalVerifikasi}</h3>
            <p className="text-xs text-slate-400 mt-1">Berkas Pending</p>
          </div>
          <div className="w-14 h-14 bg-blue-50 text-blue-400 rounded-xl flex items-center justify-center">
            <CheckSquare size={32} strokeWidth={2} />
          </div>
        </div>

        {/* Terlambat KHS */}
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-slate-700 mb-2">Terlambat KHS</p>
            <h3 className="text-3xl font-bold text-slate-800">{totalTerlambatKHS}</h3>
            <p className="text-xs text-slate-400 mt-1">Laporan Belum Masuk</p>
          </div>
          <div className="w-14 h-14 bg-blue-50 text-blue-400 rounded-xl flex items-center justify-center">
            <ListTodo size={32} strokeWidth={2} />
          </div>
        </div>

        {/* Total SK Terbit */}
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-slate-700 mb-2">Total SK Terbit</p>
            <h3 className="text-3xl font-bold text-slate-800">{totalSKTerbit}</h3>
            <p className="text-xs text-slate-400 mt-1">SK Selesai</p>
          </div>
          <div className="w-14 h-14 bg-blue-50 text-blue-400 rounded-xl flex items-center justify-center">
            <FileCheck size={32} strokeWidth={2} />
          </div>
        </div>
      </div>

      {/* Project Status Chart */}
      <div className="bg-white p-8 rounded-lg border border-slate-200 shadow-sm">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Status Studi Lanjut</h3>
            <p className="text-sm text-slate-400 mt-1">Berdasarkan Jurusan</p>
          </div>
        </div>

        <div className="space-y-6 max-w-2xl">
          {chartData.map((row) => {
            const greenPct = (row.green / row.total) * 100;
            const yellowPct = (row.yellow / row.total) * 100;
            const bluePct = (row.blue / row.total) * 100;

            return (
              <div key={row.label} className="flex items-center gap-8">
                <span className="w-24 text-sm font-medium text-slate-700">{row.label}</span>
                <div className="flex-1 flex h-6 text-xs font-medium text-slate-700 text-center overflow-hidden rounded">
                  {row.green > 0 && (
                    <div style={{ width: `${greenPct}%` }} className="bg-[#2DD4BF] flex items-center justify-center">
                      {row.green}
                    </div>
                  )}
                  {row.yellow > 0 && (
                    <div style={{ width: `${yellowPct}%` }} className="bg-[#FCD34D] flex items-center justify-center">
                      {row.yellow}
                    </div>
                  )}
                  {row.blue > 0 && (
                    <div style={{ width: `${bluePct}%` }} className="bg-[#93C5FD] flex items-center justify-center">
                      {row.blue}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-8 mt-12">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#2DD4BF]"></div>
            <span className="text-xs text-slate-600 font-medium">Total Dosen</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#FCD34D]"></div>
            <span className="text-xs text-slate-600 font-medium">Verifikasi</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#93C5FD]"></div>
            <span className="text-xs text-slate-600 font-medium">Terlambat KHS</span>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white p-8 rounded-lg border border-slate-200 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-slate-800">Butuh Tindakan Cepat KHS</h3>
          <button className="flex items-center gap-2 bg-[#F1F5F9] text-blue-600 text-xs font-bold px-4 py-2 rounded-md hover:bg-slate-200 transition-colors">
            Filter & Short <SlidersHorizontal size={14} />
          </button>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-semibold text-slate-400">
                <th className="pb-4 font-normal">Dosen</th>
                <th className="pb-4 font-normal">Jurusan</th>
                <th className="pb-4 font-normal">Jenjang</th>
                <th className="pb-4 font-normal">Keterangan</th>
                <th className="pb-4 font-normal">Action</th>
              </tr>
            </thead>
            <tbody>
              {tableData.length > 0 ? tableData.map((row) => (
                <tr key={row.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-500">
                        {row.name.charAt(0)}
                      </div>
                      <span className="font-bold text-sm text-slate-800">{row.name}</span>
                    </div>
                  </td>
                  <td className="py-4 font-bold text-sm text-slate-800">{row.jurusan}</td>
                  <td className="py-4 font-bold text-sm text-slate-800">{row.jenjang}</td>
                  <td className="py-4 font-bold text-sm text-red-500">{row.terlambat}</td>
                  <td className="py-4">
                    <button className="bg-blue-50 text-blue-500 text-xs font-bold px-3 py-1.5 rounded hover:bg-blue-100 transition-colors">
                      Detail
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 text-sm">
                    Tidak ada data tindakan cepat saat ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}