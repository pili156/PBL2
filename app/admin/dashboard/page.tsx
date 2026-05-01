import { 
  Users, 
  CheckSquare, 
  ListTodo, 
  FileCheck,
  SlidersHorizontal
} from "lucide-react";

export default function AdminDashboardPage() {
  const chartData = [
    { label: "Elektro", green: 2, yellow: 3, blue: 5, total: 10 },
    { label: "Sipil", green: 1, yellow: 2, blue: 7, total: 10 },
    { label: "Mesin", green: 4, yellow: 6, blue: 8, total: 18 },
    { label: "AB", green: 6, yellow: 3, blue: 8, total: 17 },
    { label: "Akuntansi", green: 3, yellow: 2, blue: 6, total: 11 },
  ];

  const tableData = [
    { name: "Pak Rafly", jurusan: "Elektro", jenjang: "S3", terlambat: "-1", id: 1 },
    { name: "Bu Wika", jurusan: "AB", jenjang: "S3", terlambat: "-10", id: 2 },
    { name: "Pak Haikal", jurusan: "Sipil", jenjang: "S3", terlambat: "-8", id: 3 },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-slate-700 mb-2">Total Dosen</p>
            <h3 className="text-3xl font-bold text-slate-800">5</h3>
            <p className="text-xs text-slate-400 mt-1">Dosen</p>
          </div>
          <div className="w-14 h-14 bg-blue-50 text-blue-400 rounded-full flex items-center justify-center">
            <Users size={28} strokeWidth={2} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-slate-700 mb-2">Verifikasi</p>
            <h3 className="text-3xl font-bold text-slate-800">10</h3>
            <p className="text-xs text-slate-400 mt-1">Dosen</p>
          </div>
          <div className="w-14 h-14 bg-blue-50 text-blue-400 rounded-xl flex items-center justify-center">
            <CheckSquare size={32} strokeWidth={2} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-slate-700 mb-2">Terlambat KHS</p>
            <h3 className="text-3xl font-bold text-slate-800">15</h3>
            <p className="text-xs text-slate-400 mt-1">Dosen</p>
          </div>
          <div className="w-14 h-14 bg-blue-50 text-blue-400 rounded-xl flex items-center justify-center">
            <ListTodo size={32} strokeWidth={2} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-slate-700 mb-2">Total SK Terbit</p>
            <h3 className="text-3xl font-bold text-slate-800">2</h3>
            <p className="text-xs text-slate-400 mt-1">Dosen</p>
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
            <h3 className="text-lg font-bold text-slate-800">Project status</h3>
            <p className="text-sm text-slate-400 mt-1">Oktober</p>
          </div>
          <select className="border border-slate-200 text-slate-500 text-sm rounded-md px-3 py-1.5 outline-none">
            <option>Oktober</option>
            <option>November</option>
          </select>
        </div>

        <div className="space-y-6 max-w-2xl">
          {chartData.map((row) => {
            const greenPct = (row.green / row.total) * 100;
            const yellowPct = (row.yellow / row.total) * 100;
            const bluePct = (row.blue / row.total) * 100;

            return (
              <div key={row.label} className="flex items-center gap-8">
                <span className="w-24 text-sm font-medium text-slate-700">{row.label}</span>
                <div className="flex-1 flex h-6 text-xs font-medium text-slate-700 text-center">
                  <div style={{ width: `${greenPct}%` }} className="bg-[#2DD4BF] flex items-center justify-center">
                    {row.green}
                  </div>
                  <div style={{ width: `${yellowPct}%` }} className="bg-[#FCD34D] flex items-center justify-center">
                    {row.yellow}
                  </div>
                  <div style={{ width: `${bluePct}%` }} className="bg-[#93C5FD] flex items-center justify-center">
                    {row.blue}
                  </div>
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

        <div className="w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-semibold text-slate-400">
                <th className="pb-4 font-normal">Dosen</th>
                <th className="pb-4 font-normal">Jurusan</th>
                <th className="pb-4 font-normal">Jenjang</th>
                <th className="pb-4 font-normal">Terlambat</th>
                <th className="pb-4 font-normal">Action</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((row) => (
                <tr key={row.id} className="border-b border-slate-50 last:border-0">
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      {/* Avatar Placeholder */}
                      <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-500">
                        {row.name.charAt(4)}
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
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}