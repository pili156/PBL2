import { Calendar, FileBadge, GraduationCap, ScrollText, Wallet } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="p-8 space-y-6">
      {/* WELCOME */}
      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-2 bg-white rounded-xl p-6 shadow-sm border">
          <p className="text-gray-500">Selamat datang kembali</p>

          <h2 className="text-4xl font-bold mt-1">
            Budi Doremi
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
              Deadline upload KHS Semester Genap 2024
            </p>

            <p className="text-red-500 mt-1 font-medium">
              30 Juni 2025
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
              <p className="text-gray-400 text-sm">
                Status Pengajuan
              </p>

              <h2 className="text-2xl font-bold">
                Disetujui
              </h2>

              <p className="text-gray-400 text-sm mt-1">
                SK telah terbit
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
              <p className="text-gray-400 text-sm">
                Status Studi
              </p>

              <h2 className="text-2xl font-bold">
                Aktif
              </h2>

              <p className="text-gray-400 text-sm mt-1">
                Semester berjalan
              </p>

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
              <p className="text-gray-400 text-sm">
                Status Laporan KHS
              </p>

              <h2 className="text-2xl font-bold">
                Tepat Waktu
              </h2>

              <p className="text-gray-400 text-sm mt-1">
                Laporan aman
              </p>

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
              <p className="text-gray-400 text-sm">
                Status Keuangan
              </p>

              <h2 className="text-2xl font-bold">
                Dana Dibayarkan
              </h2>

              <p className="text-gray-400 text-sm mt-1">
                Tahap 1
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
          <h2 className="text-xl font-bold mb-5">
            Progres Studi
          </h2>

          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <p className="text-gray-600">
                  Pengajuan Studi
                </p>
              </div>

              <p className="text-green-600 font-semibold">
                Selesai
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <p className="text-gray-600">
                  Verifikasi Dokumen
                </p>
              </div>

              <p className="text-green-600 font-semibold">
                Selesai
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <p className="text-gray-600">
                  SK Terbit
                </p>
              </div>

              <p className="text-green-600 font-semibold">
                Selesai
              </p>
            </div>
          </div>
        </div>

        {/* AKTIVITAS */}
        <div className="bg-white rounded-xl p-6 border shadow-sm">
          <h2 className="text-xl font-bold mb-5">
            Aktivitas Terbaru
          </h2>

          <div className="space-y-5">
            <div className="flex justify-between">
              <div>
                <h3 className="font-semibold">
                  SK Kementrian telah terbit
                </h3>

                <p className="text-gray-400 text-sm">
                  Unduh SK Anda sekarang.
                </p>
              </div>

              <p className="text-xs text-gray-400">
                28 Mei 2026
              </p>
            </div>

            <div className="flex justify-between">
              <div>
                <h3 className="font-semibold">
                  Pengajuan studi disetujui
                </h3>

                <p className="text-gray-400 text-sm">
                  Pengajuan Anda telah disetujui.
                </p>
              </div>

              <p className="text-xs text-gray-400">
                20 Mei 2026
              </p>
            </div>
          </div>
        </div>

        {/* NOTIFIKASI */}
        <div className="bg-white rounded-xl p-6 border shadow-sm">
          <h2 className="text-xl font-bold mb-5">
            Pengingat & Notifikasi
          </h2>

          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-sm">
                  Upload KHS Semester Genap 2026
                </h3>

                <p className="text-gray-400 text-xs">
                  Deadline : 30 Juni 2026
                </p>
              </div>

              <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-600">
                3 Hari Lagi
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-sm">
                  Upload Progress Studi
                </h3>

                <p className="text-gray-400 text-xs">
                  Belum diupload
                </p>
              </div>

              <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-600">
                Perlu Upload
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* RINGKASAN */}
      <div className="bg-white rounded-xl border shadow-sm p-6">
        <h2 className="text-xl font-bold mb-6">
          Ringkasan Studi
        </h2>

        <div className="grid grid-cols-6 gap-5 text-sm">
          <div>
            <p className="text-gray-400">
              Jenis Studi
            </p>

            <h3 className="font-semibold mt-1">
              Tugas Belajar
            </h3>
          </div>

          <div>
            <p className="text-gray-400">
              Jalur
            </p>

            <h3 className="font-semibold mt-1">
              Beasiswa
            </h3>
          </div>

          <div>
            <p className="text-gray-400">
              Perguruan Tinggi
            </p>

            <h3 className="font-semibold mt-1">
              Politeknik Negeri Semarang
            </h3>
          </div>

          <div>
            <p className="text-gray-400">
              Program Studi
            </p>

            <h3 className="font-semibold mt-1">
              D3 Teknik Informatika
            </h3>
          </div>

          <div>
            <p className="text-gray-400">
              Mulai Studi
            </p>

            <h3 className="font-semibold mt-1">
              Februari 2026
            </h3>
          </div>

          <div>
            <p className="text-gray-400">
              Selesai Studi
            </p>

            <h3 className="font-semibold mt-1">
              Februari 2028
            </h3>
          </div>
        </div>
      </div>
    </div>
  );
}