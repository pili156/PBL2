import { prisma } from "../../../src/lib/prisma"; // Pastikan path ke file prisma client kamu sudah sesuai ya Mel
import Link from "next/link";
import { Plus, Edit, Trash2 } from "lucide-react";

export default async function BukuIndukPage() {
  // Mengambil seluruh data dari model MasterDosen (dengan huruf M & D kapital di schema, dipanggil masterDosen)
  const daftarDosen = await prisma.masterDosen.findMany({
    orderBy: { 
      nama_lengkap: "asc" 
    },
    include: {
      user: {
        select: { email: true }
      }
    }
  });

  return (
    <div className="p-8 bg-[#F8FAFC] min-h-screen text-[#1F1F1F]">
      {/* Bagian Atas / Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#0A192F]">Buku Induk Pegawai</h1>
          <p className="text-sm text-gray-400 mt-1">
            Sistem Digitalisasi Data Kepegawaian SIGAP Politeknik Negeri Semarang.
          </p>
        </div>
        
        {/* Tombol ke halaman tambah data */}
        <Link 
          href="/admin/buku-induk/tambah" 
          className="bg-[#0085FF] hover:bg-[#006ACC] text-white px-5 py-3 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg transition-all"
        >
          <Plus size={18} /> Tambah Data Pegawai
        </Link>
      </div>

      {/* Tabel Utama Buku Induk */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0A192F] text-white uppercase text-[11px] tracking-widest font-black">
                <th className="p-5 text-center w-16">No</th>
                <th className="p-5">NIP / NIDN</th>
                <th className="p-5">Nama Lengkap</th>
                <th className="p-5">Email</th>
                <th className="p-5">Pangkat / Golongan</th>
                <th className="p-5">Jabatan</th>
                <th className="p-5">Jurusan / Prodi</th>
                <th className="p-5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm font-medium">
              {daftarDosen.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-10 text-center text-gray-400 italic">
                    Belum ada data pegawai di dalam sistem. Klik "Tambah Data Pegawai" untuk mengisi.
                  </td>
                </tr>
              ) : (
                daftarDosen.map((dosen, index) => (
                  <tr key={dosen.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-5 text-center font-mono text-gray-400">{index + 1}</td>
                    <td className="p-5 font-mono text-sm">{dosen.nip || "-"}</td>
                    <td className="p-5 font-bold text-[#0A192F]">{dosen.nama_lengkap || "-"}</td>
                    <td className="p-5 text-gray-600 text-xs">{dosen.user?.email || "-"}</td>
                    <td className="p-5 text-gray-600">{dosen.pangkat_golongan || "-"}</td>
                    <td className="p-5 text-gray-600">{dosen.jabatan || "-"}</td>
                    <td className="p-5 text-gray-500">
                      <div className="font-semibold text-gray-700">{dosen.jurusan || "-"}</div>
                      <div className="text-xs text-gray-400 font-normal">{dosen.program_studi || ""}</div>
                    </td>
                    <td className="p-5">
                      <div className="flex justify-center items-center gap-3">
                        {/* Tombol Edit: Mengarah ke Form 34 Kolom Excel secara dinamis berdasarkan ID */}
                        <Link 
                          href={`/admin/buku-induk/edit/${dosen.id}`} 
                          className="p-2 bg-blue-50 text-[#0085FF] rounded-xl hover:bg-blue-100 transition-colors flex items-center justify-center"
                        >
                          <Edit size={16} />
                        </Link>
                        
                        {/* Tombol Hapus */}
                        <button className="p-2 bg-red-50 text-[#CC3333] rounded-xl hover:bg-red-100 transition-colors flex items-center justify-center">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}