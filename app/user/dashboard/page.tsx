import { Calendar, FileBadge, GraduationCap, ScrollText, Wallet } from "lucide-react";
import { prisma } from "@/src/lib/prisma"; // Sesuaikan dengan struktur folder Anda

export default async function DashboardPage() {
  // TODO: Ganti dengan ID user dari session yang sedang login (misal dari NextAuth/IronSession)
  const currentUserId = 1; 

  // Ambil data user beserta relasi dosen dan pengajuan studi terbarunya
  const user = await prisma.user.findUnique({
    where: { id: currentUserId },
    include: {
      master_dosen: true,
      pengajuan_studi: {
        orderBy: { tanggal_pengajuan: 'desc' },
        take: 1, // Ambil pengajuan terbaru
        include: {
          jenis_studi: true,
          jalur_pendanaan: true,
          status: true,
          sk_kementerian: {
            orderBy: { tanggal_terbit: 'desc' },
            take: 1,
          },
          monitoring_khs: {
            orderBy: { semester_ke: 'desc' },
            take: 1,
          },
          pengajuan_reimbursement: {
            orderBy: { id: 'desc' },
            take: 1,
          }
        }
      }
    }
  });

  // Ekstrak data untuk mempermudah render di JSX
  const dosen = user?.master_dosen;
  const pengajuan = user?.pengajuan_studi[0];
  const sk = pengajuan?.sk_kementerian[0];
  const khs = pengajuan?.monitoring_khs[0];
  const reimbursement = pengajuan?.pengajuan_reimbursement[0];

  return (
    <div className="p-8 space-y-6">
      {/* WELCOME */}
      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-2 bg-white rounded-xl p-6 shadow-sm border">
          <p className="text-gray-500">Selamat datang kembali</p>

          <h2 className="text-4xl font-bold mt-1">
            {dosen?.nama_lengkap || user?.username || "Pengguna"}
          </h2>

          <p className="text-gray-400 mt-2">
            Berikut ringkasan aktivitas dan status studi Anda.
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center">
            <Calendar className="text-blue-600" />
          </div>

          <div>
            <h3 className="font-bold text-lg">Reminder</h3>
            <p className="text-gray-500 text-sm">
              Deadline upload KHS Semester Genap
            </p>
            <p className="text-red-500 mt-1 font-medium">
              30 Juni 2026
            </p>
          </div>
        </div>
      </div>

      {/* STATUS CARD */}
      <div className="grid grid-cols-4 gap-5">
        <div className="bg-white rounded-xl border p-5 shadow-sm">
          <div className="flex gap-4">
            <div className="w-14 h-14 rounded-full flex items-center justify-center bg-blue-100 text-blue-600">
              <FileBadge />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Status Pengajuan</p>
              <h2 className="text-2xl font-bold">
                {pengajuan?.status?.nama_status || "Belum Ada"}
              </h2>
              <p className="text-gray-400 text-sm mt-1">
                {sk ? "SK telah terbit" : "Menunggu SK"}
              </p>
              <button className="text-blue-500 text-sm mt-3 font-medium">
                Lihat Detail →
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border p-5 shadow-sm">
          <div className="flex gap-4">
            <div className="w-14 h-14 rounded-full flex items-center justify-center bg-green-100 text-green-600">
              <GraduationCap />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Status Studi</p>
              <h2 className="text-2xl font-bold">
                {sk?.status_studi || "Belum Aktif"}
              </h2>
              <p className="text-gray-400 text-sm mt-1">Semester berjalan</p>
              <button className="text-blue-500 text-sm mt-3 font-medium">
                Lihat Detail →
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border p-5 shadow-sm">
          <div className="flex gap-4">
            <div className="w-14 h-14 rounded-full flex items-center justify-center bg-yellow-100 text-yellow-600">
              <ScrollText />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Status Laporan KHS</p>
              <h2 className="text-2xl font-bold">
                {khs?.catatan_evaluasi ? "Sudah Dinilai" : khs ? "Terkirim" : "Belum Ada"}
              </h2>
              <p className="text-gray-400 text-sm mt-1">Laporan Semester {khs?.semester_ke || "-"}</p>
              <button className="text-blue-500 text-sm mt-3 font-medium">
                Lihat Detail →
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border p-5 shadow-sm">
          <div className="flex gap-4">
            <div className="w-14 h-14 rounded-full flex items-center justify-center bg-purple-100 text-purple-600">
              <Wallet />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Status Keuangan</p>
              <h2 className="text-2xl font-bold">
                {reimbursement?.status_pencairan || "Belum Ada"}
              </h2>
              <p className="text-gray-400 text-sm mt-1">
                Semester {reimbursement?.semester_ke || "-"}
              </p>
              <button className="text-blue-500 text-sm mt-3 font-medium">
                Lihat Detail →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-3 gap-5">
        {/* PROGRESS */}
        <div className="bg-white rounded-xl p-6 border shadow-sm">
          <h2 className="text-xl font-bold mb-5">Progres Studi</h2>
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${pengajuan ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <p className="text-gray-600">Pengajuan Studi</p>
              </div>
              <p className={pengajuan ? 'text-green-600 font-semibold' : 'text-gray-400 font-semibold'}>
                {pengajuan ? 'Selesai' : 'Belum'}
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${pengajuan?.status_id && pengajuan.status_id > 1 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <p className="text-gray-600">Verifikasi Dokumen</p>
              </div>
              <p className={pengajuan?.status_id && pengajuan.status_id > 1 ? 'text-green-600 font-semibold' : 'text-gray-400 font-semibold'}>
                {pengajuan?.status_id && pengajuan.status_id > 1 ? 'Selesai' : 'Proses'}
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${sk ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <p className="text-gray-600">SK Terbit</p>
              </div>
              <p className={sk ? 'text-green-600 font-semibold' : 'text-gray-400 font-semibold'}>
                {sk ? 'Selesai' : 'Menunggu'}
              </p>
            </div>
          </div>
        </div>

        {/* AKTIVITAS (Bisa dibuat dinamis dengan relasi log jika ada) */}
        <div className="bg-white rounded-xl p-6 border shadow-sm">
          <h2 className="text-xl font-bold mb-5">Aktivitas Terbaru</h2>
          <div className="space-y-5">
            {sk && (
              <div className="flex justify-between">
                <div>
                  <h3 className="font-semibold">SK Kementrian telah terbit</h3>
                  <p className="text-gray-400 text-sm">Unduh SK Anda sekarang.</p>
                </div>
                <p className="text-xs text-gray-400">
                  {sk.tanggal_terbit?.toLocaleDateString('id-ID')}
                </p>
              </div>
            )}
            {pengajuan && (
              <div className="flex justify-between">
                <div>
                  <h3 className="font-semibold">Pengajuan studi dibuat</h3>
                  <p className="text-gray-400 text-sm">Menunggu proses verifikasi.</p>
                </div>
                <p className="text-xs text-gray-400">
                  {pengajuan.tanggal_pengajuan?.toLocaleDateString('id-ID')}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* NOTIFIKASI */}
        <div className="bg-white rounded-xl p-6 border shadow-sm">
          <h2 className="text-xl font-bold mb-5">Pengingat & Notifikasi</h2>
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-sm">Upload KHS Semester Genap</h3>
                <p className="text-gray-400 text-xs">Deadline : 30 Juni 2026</p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-600">
                Segera
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* RINGKASAN */}
      <div className="bg-white rounded-xl border shadow-sm p-6">
        <h2 className="text-xl font-bold mb-6">Ringkasan Studi</h2>
        <div className="grid grid-cols-6 gap-5 text-sm">
          <div>
            <p className="text-gray-400">Jenis Studi</p>
            <h3 className="font-semibold mt-1">{pengajuan?.jenis_studi?.nama_jenis || "-"}</h3>
          </div>
          <div>
            <p className="text-gray-400">Jalur</p>
            <h3 className="font-semibold mt-1">{pengajuan?.jalur_pendanaan?.nama_pendanaan || "-"}</h3>
          </div>
          <div className="col-span-2">
            <p className="text-gray-400">Wilayah Studi</p>
            <h3 className="font-semibold mt-1">{pengajuan?.wilayah_studi || "-"}</h3>
          </div>
          <div className="col-span-2">
            <p className="text-gray-400">Program Studi / Jurusan</p>
            <h3 className="font-semibold mt-1">
              {dosen?.program_studi || "-"} / {dosen?.jurusan || "-"}
            </h3>
          </div>
        </div>
      </div>
    </div>
  );
}