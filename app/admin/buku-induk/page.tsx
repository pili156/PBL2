"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Plus, Search, Eye, Edit, Trash2, 
  FileText, Download, AlertTriangle, Users, 
  GraduationCap, Briefcase, Award, CheckCircle, Loader2
} from "lucide-react";

export default function BukuIndukDashboardPage() {
  const router = useRouter();
  
  // State Data Master dari Database
  const [daftarDosen, setDaftarDosen] = useState([]);
  const [lulusanTerbaru, setLulusanTerbaru] = useState([]);
  const [stats, setStats] = useState({
    totalDosen: 0,
    tugasBelajar: { total: 0, aktif: 0, lulus: 0, do: 0 },
    izinBelajar: { total: 0, aktif: 0, selesai: 0 },
    doktor: 0,
    profesor: 0
  });

  // State Kontrol Antarmuka (UI) & Filtering
  const [searchTerm, setSearchTerm] = useState("");
  const [filterJurusan, setFilterJurusan] = useState("Semua Jurusan");
  const [filterStatus, setFilterStatus] = useState("Semua Status");
  const [activeTab, setActiveTab] = useState("Semua Dosen");
  const [loading, setLoading] = useState(true);

  // 1. Ambil Data Real-Time Dari Database (Via API Route Baru)
  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        // PERBAIKAN: Diarahkan ke rute API admin yang baru
        const res = await fetch("/api/admin/buku-induk");
        if (res.ok) {
          const json = await res.json();
          setDaftarDosen(json.daftarDosen || []);
          setLulusanTerbaru(json.lulusanTerbaru || []);
          if (json.stats) setStats(json.stats);
        }
      } catch (err) {
        console.error("Gagal sinkronisasi data dengan PostgreSQL:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboardData();
  }, []);

  // 2. Fungsi Hapus Data Pegawai (Delete Action)
  const handleHapusDosen = async (id: number, nama: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus data ${nama} dari Buku Induk?`)) {
      try {
        // PERBAIKAN: Menggunakan URL endpoint yang valid dengan method DELETE
        const res = await fetch(`/api/admin/buku-induk?id=${id}`, {
          method: "DELETE"
        });
        
        if (res.ok) {
          alert("Data berhasil dihapus!");
          setDaftarDosen((prev) => prev.filter((dosen: any) => dosen.id !== id));
        } else {
          alert("Gagal menghapus data dari database.");
        }
      } catch (err) {
        alert("Terjadi kesalahan koneksi saat menghapus.");
      }
    }
  };

  // 3. Logika Filter Berlapis (Search Bar, Dropdown 5 Jurusan Polines, Status, & Tab)
  const dataTerfilter = daftarDosen.filter((dosen: any) => {
    const namaDosen = (dosen.nama_lengkap || dosen.nama || "").toLowerCase();
    const nipDosen = (dosen.nip || "").toString();
    const jurusanDosen = (dosen.jurusan || dosen.prodi || "").toLowerCase();
    const statusKuliah = dosen.status_kuliah || dosen.statusKuliah || "Aktif";
    const jenisStudi = dosen.jenis_pengajuan_studi || dosen.jenisPengajuanStudi || "";
    const jenjangStudi = dosen.jenjang || dosen.jenjangStudi || "";
    const jabatanDosen = dosen.jabatan || dosen.jabatanFungsional || "";

    // A. Cocokkan Search Input (Nama, NIP, atau Kata Kunci Jurusan)
    const matchesSearch = 
      namaDosen.includes(searchTerm.toLowerCase()) ||
      nipDosen.includes(searchTerm) ||
      jurusanDosen.includes(searchTerm.toLowerCase());
      
    // B. Cocokkan dengan 5 Jurusan Resmi Polines
    const matchesJurusan = 
      filterJurusan === "Semua Jurusan" || 
      jurusanDosen.includes(filterJurusan.toLowerCase());
    
    // C. Cocokkan dengan Status Kelayakan Kuliah
    const matchesStatus = 
      filterStatus === "Semua Status" || 
      statusKuliah.toLowerCase() === filterStatus.toLowerCase();
    
    // D. Cocokkan dengan Tab Kategori Aktif
    const matchesTab = 
      activeTab === "Semua Dosen" ||
      (activeTab === "Tugas Belajar" && jenisStudi.includes("Tugas Belajar")) ||
      (activeTab === "Izin Belajar" && jenisStudi.includes("Izin Belajar")) ||
      (activeTab === "Doktor" && jenjangStudi.toUpperCase() === "S3") ||
      (activeTab === "Profesor" && jabatanDosen.toLowerCase() === "profesor");

    return matchesSearch && matchesJurusan && matchesStatus && matchesTab;
  });

  return (
    <div className="p-6 bg-[#F4F7FE] min-h-screen text-[#1F1F1F] font-sans selection:bg-[#0085FF]/20">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <div className="text-xs font-bold text-gray-400 flex items-center gap-2">
            Dashboard <span className="text-gray-300">/</span> <span className="text-[#0085FF]">Buku Induk</span>
          </div>
          <h1 className="text-2xl font-black text-[#0A192F] tracking-tight mt-1">Buku Induk</h1>
          <p className="text-xs text-gray-500 font-medium">Master data akademik dosen Politeknik Negeri Semarang</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button onClick={() => alert("Fitur Import Excel dalam persiapan pengembangan PBL.")} className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-600 px-4 py-2.5 rounded-xl text-xs font-bold border border-gray-200/80 shadow-sm transition-all">
            <FileText size={15} /> Import Data
          </button>
          <button onClick={() => alert("Fitur Export Excel/PDF dalam persiapan pengembangan PBL.")} className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-600 px-4 py-2.5 rounded-xl text-xs font-bold border border-gray-200/80 shadow-sm transition-all">
            <Download size={15} /> Export
          </button>
          <button onClick={() => router.push("/admin/buku-induk/tambah")} className="flex items-center gap-2 bg-[#0085FF] hover:bg-[#006ACC] text-white px-4 py-2.5 rounded-xl text-xs font-black shadow-md shadow-blue-500/10 transition-all ml-auto md:ml-0">
            <Plus size={16} /> Tambah Data Manual
          </button>
        </div>
      </div>

      {/* STATS SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 cursor-pointer hover:scale-[1.02] transition-all" onClick={() => setActiveTab("Semua Dosen")}>
          <div className="p-3 bg-blue-50 rounded-xl text-[#0085FF]"><Users size={22} /></div>
          <div>
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total Dosen</div>
            <div className="text-xl font-black text-[#0A192F]">{stats.totalDosen}</div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 cursor-pointer hover:scale-[1.02] transition-all" onClick={() => setActiveTab("Tugas Belajar")}>
          <div className="p-3 bg-green-50 rounded-xl text-green-500"><GraduationCap size={22} /></div>
          <div>
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Tugas Belajar</div>
            <div className="text-xl font-black text-[#0A192F]">{stats.tugasBelajar.total}</div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 cursor-pointer hover:scale-[1.02] transition-all" onClick={() => setActiveTab("Izin Belajar")}>
          <div className="p-3 bg-amber-50 rounded-xl text-amber-500"><Briefcase size={22} /></div>
          <div>
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Izin Belajar</div>
            <div className="text-xl font-black text-[#0A192F]">{stats.izinBelajar.total}</div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 cursor-pointer hover:scale-[1.02] transition-all" onClick={() => setActiveTab("Doktor")}>
          <div className="p-3 bg-purple-50 rounded-xl text-purple-500"><Award size={22} /></div>
          <div>
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Doktor</div>
            <div className="text-xl font-black text-[#0A192F]">{stats.doktor}</div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 cursor-pointer hover:scale-[1.02] transition-all" onClick={() => setActiveTab("Profesor")}>
          <div className="p-3 bg-teal-50 rounded-xl text-teal-500"><CheckCircle size={22} /></div>
          <div>
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Profesor</div>
            <div className="text-xl font-black text-[#0A192F]">{stats.profesor}</div>
          </div>
        </div>
      </div>

      {/* TWO COLUMN GRID LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* LEFTSIDE CONTENT (FILTERS & MAIN DATA TABLE) */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            
            {/* Tab Kategori Atas */}
            <div className="flex flex-wrap items-center gap-2 border-b border-gray-100 pb-3 text-xs font-bold text-gray-400">
              {["Semua Dosen", "Tugas Belajar", "Izin Belajar", "Doktor", "Profesor"].map((tab) => (
                <button 
                  key={tab} 
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 rounded-lg transition-all ${activeTab === tab ? "bg-blue-50 text-[#0085FF]" : "hover:bg-gray-50 hover:text-[#0A192F]"}`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Input Pencarian & Dropdown 5 Jurusan Polines */}
            <div className="flex flex-col md:flex-row items-center gap-3">
              <div className="relative w-full md:flex-1">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Cari nama dosen, NIP, atau jurusan..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-[#F8FAFC] border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#0085FF] transition-all"
                />
              </div>

              <select 
                value={filterJurusan}
                onChange={(e) => setFilterJurusan(e.target.value)}
                className="w-full md:w-48 p-2 bg-[#F8FAFC] border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 focus:outline-none"
              >
                <option>Semua Jurusan</option>
                <option>Teknik Elektro</option>
                <option>Teknik Mesin</option>
                <option>Teknik Sipil</option>
                <option>Administrasi Bisnis</option>
                <option>Akuntansi</option>
              </select>

              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full md:w-40 p-2 bg-[#F8FAFC] border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 focus:outline-none"
              >
                <option>Semua Status</option>
                <option>Belum Lulus</option>
                <option>Lulus</option>
                <option>Perpanjangan</option>
              </select>
            </div>
          </div>

          {/* TABEL BUKU INDUK UTAMA */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 bg-[#F8FAFC] text-gray-400 text-[10px] font-black uppercase tracking-widest">
                    <th className="p-4 text-center w-12">No</th>
                    <th className="p-4">Nama Dosen</th>
                    <th className="p-4">NIP</th>
                    <th className="p-4">Jurusan</th>
                    <th className="p-4 text-center">Jenjang</th>
                    <th className="p-4">Status Studi</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="text-xs font-bold divide-y divide-gray-50">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-gray-400 font-medium">
                        <Loader2 className="animate-spin text-[#0085FF] inline-block mr-2" size={16} />
                        Sinkronisasi basis data PostgreSQL...
                      </td>
                    </tr>
                  ) : dataTerfilter.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-gray-400 font-medium italic">Tidak ditemukan data pegawai yang cocok.</td>
                    </tr>
                  ) : (
                    dataTerfilter.map((dosen: any, i) => (
                      <tr key={dosen.id} className="hover:bg-slate-50/50 transition-all">
                        <td className="p-4 text-center font-mono text-gray-400 font-medium">{i + 1}</td>
                        <td className="p-4 text-[#0085FF] font-black cursor-pointer hover:underline" onClick={() => router.push(`/admin/buku-induk/edit/${dosen.id}`)}>{dosen.nama_lengkap}</td>
                        <td className="p-4 font-mono text-gray-500 font-medium">{dosen.nip || "-"}</td>
                        <td className="p-4 text-gray-600 font-semibold">{dosen.jurusan || "-"}</td>
                        <td className="p-4 text-center font-mono text-gray-700">{dosen.jenjang || "-"}</td>
                        <td className="p-4 text-gray-500 font-medium">{dosen.jenis_pengajuan_studi || "Dosen Aktif"}</td>
                        <td className="p-4 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black tracking-wide uppercase ${
                            dosen.status_kuliah === "Belum Lulus" ? "bg-green-50 text-green-600" :
                            dosen.status_kuliah === "Lulus" ? "bg-blue-50 text-blue-600" : "bg-purple-50 text-purple-600"
                          }`}>
                            {dosen.status_kuliah || "Aktif"}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-1.5">
                            <button onClick={() => router.push(`/admin/buku-induk/edit/${dosen.id}`)} className="p-1.5 bg-gray-50 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"><Eye size={14} /></button>
                            <button onClick={() => router.push(`/admin/buku-induk/edit/${dosen.id}`)} className="p-1.5 bg-blue-50 text-[#0085FF] rounded-lg"><Edit size={14} /></button>
                            <button onClick={() => handleHapusDosen(dosen.id, dosen.nama_lengkap)} className="p-1.5 bg-red-50 text-red-500 rounded-lg"><Trash2 size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* TABEL LULUSAN TERBARU */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <h2 className="text-sm font-black text-[#0A192F]">Lulusan Terbaru (Bisa Ditambahkan ke Buku Induk)</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-100 font-black text-gray-400 uppercase tracking-wider text-[10px]">
                    <th className="pb-3">Nama Dosen</th>
                    <th className="pb-3">NIP</th>
                    <th className="pb-3">Jenjang</th>
                    <th className="pb-3">Universitas</th>
                    <th className="pb-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="font-bold text-gray-600 divide-y divide-gray-50">
                  {lulusanTerbaru.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-4 text-center text-gray-400 font-medium italic">Belum ada data kelulusan baru semester ini.</td>
                    </tr>
                  ) : (
                    lulusanTerbaru.map((lulus: any) => (
                      <tr key={lulus.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-3 text-[#0A192F] font-black">{lulus.nama_lengkap}</td>
                        <td className="py-3 font-mono text-gray-400">{lulus.nip}</td>
                        <td className="py-3 font-mono text-gray-700">{lulus.jenjang}</td>
                        <td className="py-3 text-gray-700">{lulus.tempat_studi || "-"}</td>
                        <td className="py-3 text-center">
                          <button onClick={() => router.push(`/admin/buku-induk/edit/${lulus.id}`)} className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-[#0085FF] font-black text-[11px] rounded-xl transition-all">
                            Klasifikasikan Gelar
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHTSIDE CONTENT (ALERTS & SIDE PANEL SUMMARY) */}
        <div className="space-y-6">
          <div className="bg-[#FFF9F2] p-5 rounded-2xl border border-[#FFE7CC] space-y-4">
            <h3 className="text-xs font-black text-[#D97706] uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle size={16} /> Perhatian
            </h3>
            <div className="space-y-3 text-xs font-bold text-gray-700">
              <div className="flex justify-between items-center p-2 bg-white/70 rounded-xl border border-[#FFE7CC] cursor-pointer" onClick={() => { setSearchTerm(""); setFilterStatus("Belum Lulus"); }}>
                <span className="font-medium text-gray-600">Belum Upload Laporan</span>
                <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-md font-black text-[10px]">Aktif</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-white/70 rounded-xl border border-[#FFE7CC] cursor-pointer" onClick={() => { setFilterStatus("Perpanjangan"); }}>
                <span className="font-medium text-gray-600">Masa Studi Perpanjangan</span>
                <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-md font-black text-[10px]">Pantau</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-black text-[#0A192F] uppercase tracking-wider">Ringkasan Reimbursement</h3>
              <button onClick={() => alert("Mengarahkan ke modul Keuangan SIGAP...")} className="text-[10px] font-black text-[#0085FF] hover:underline">Lihat Detail</button>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-black">
              <div className="p-2 bg-slate-50 rounded-xl">
                <div className="text-[9px] font-bold text-gray-400">TOTAL</div>
                <div className="text-gray-700 mt-0.5">Rp 1.25B</div>
              </div>
              <div className="p-2 bg-green-50 rounded-xl">
                <div className="text-[9px] font-bold text-gray-400">CAIR</div>
                <div className="text-green-600 mt-0.5">Rp 980M</div>
              </div>
              <div className="p-2 bg-amber-50 rounded-xl">
                <div className="text-[9px] font-bold text-gray-400">PENDING</div>
                <div className="text-amber-600 mt-0.5">Rp 270M</div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
