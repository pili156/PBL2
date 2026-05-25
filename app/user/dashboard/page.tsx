import { prisma } from "@/src/lib/prisma";
import { cookies } from "next/headers";
import {
  Calendar,
  FileBadge,
  GraduationCap,
  ScrollText,
  Wallet,
} from "lucide-react";

function formatDate(date: Date | null | undefined): string {
  if (!date) return "-";

  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatMonthYear(date: Date | null | undefined): string {
  if (!date) return "-";

  return date.toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
  });
}

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const userEmail = cookieStore.get("user_email")?.value;

  const user = await prisma.user.findUnique({
    where: { email: userEmail ?? "" },
    include: {
      master_dosen: true,
      pengajuan_studi: {
        include: {
          status: true,
          jenis_studi: true,
          jalur_pendanaan: true,

          sk_kementerian: {
            orderBy: { tanggal_terbit: "desc" },
            take: 1,
          },

          monitoring_khs: {
            orderBy: { tanggal_unggah: "desc" },
            take: 1,
          },

          pengajuan_reimbursement: {
            orderBy: { id: "desc" },
            take: 1,
          },

          pesan_komunikasi: {
            include: { pengirim: true },
            orderBy: { waktu_kirim: "desc" },
            take: 5,
          },
        },

        orderBy: { tanggal_pengajuan: "desc" },
        take: 1,
      },
    },
  });

  const nama =
    user?.master_dosen?.nama_lengkap ??
    user?.username ??
    "Dosen PBL";

  const pengajuan = user?.pengajuan_studi?.[0];

  const statusPengajuan =
    pengajuan?.status?.nama_status ?? "Tidak ada";

  const statusStudi =
    pengajuan?.sk_kementerian?.[0]?.status_studi ?? "-";

  const adaKhs =
    (pengajuan?.monitoring_khs?.length ?? 0) > 0;

  const statusKeuangan =
    pengajuan?.pengajuan_reimbursement?.[0]
      ?.status_pencairan ?? "-";

  const progressItems = [
    {
      label: "Pengajuan Studi",
      done: !!pengajuan,
    },

    {
      label: "Verifikasi Dokumen",
      done:
        pengajuan?.status?.nama_status ===
        "Disetujui",
    },

    {
      label: "SK Terbit",
      done:
        (pengajuan?.sk_kementerian?.length ?? 0) > 0,
    },
  ];

  return (
    <div className="p-8 space-y-6">
      {/* WELCOME */}
      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-2 bg-white rounded-xl p-6 shadow-sm border">
          <p className="font-semibold text-black">
            Selamat datang kembali
          </p>

          <h2 className="text-4xl font-bold text-black mt-1">
            {nama}
          </h2>

          <p className="text-black font-medium mt-2">
            Berikut ringkasan aktivitas dan status studi Anda.
          </p>
        </div>

      {/* STATISTIK KARTU UTAMA */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Card 1: Status Pengajuan (Biru) */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg text-black">
              Reminder
            </h3>

            <p className="text-black font-medium text-sm">
              Deadline upload KHS Semester Genap 2024
            </p>

            <p className="text-red-500 mt-1 font-bold">
              30 Juni 2025
            </p>
          </div>
        </div>
      </div>

      {/* STATUS CARD */}
      <div className="grid grid-cols-4 gap-5">
        {/* STATUS PENGAJUAN */}
        <div className="bg-white rounded-xl border p-5 shadow-sm">
          <div className="flex gap-4">
            <div className="w-14 h-14 rounded-full flex items-center justify-center bg-blue-100 text-blue-600">
              <FileBadge />
            </div>

            <div>
              <p className="text-black font-semibold text-sm">
                Status Pengajuan
              </p>

              <h2 className="text-2xl font-bold text-black">
                {statusPengajuan}
              </h2>

              <p className="text-black font-medium text-sm mt-1">
                {statusPengajuan === "Disetujui"
                  ? "SK telah terbit"
                  : statusPengajuan === "Tidak ada"
                  ? "Belum mengajukan"
                  : "-"}
              </p>

              <button className="text-blue-500 text-sm mt-3 font-medium">
                Lihat Detail →
              </button>
            </div>
          </div>
        </div>

        {/* STATUS STUDI */}
        <div className="bg-white rounded-xl border p-5 shadow-sm">
          <div className="flex gap-4">
            <div className="w-14 h-14 rounded-full flex items-center justify-center bg-green-100 text-green-600">
              <GraduationCap />
            </div>

            <div>
              <p className="text-black font-semibold text-sm">
                Status Studi
              </p>

              <h2 className="text-2xl font-bold text-black">
                {statusStudi || "Aktif"}
              </h2>

              <p className="text-black font-medium text-sm mt-1">
                {statusStudi === "Aktif" ||
                !statusStudi ||
                statusStudi === "-"
                  ? "Semester berjalan"
                  : "-"}
              </p>

              <button className="text-blue-500 text-sm mt-3 font-medium">
                Lihat Detail →
              </button>
            </div>
          </div>
        </div>

        {/* STATUS KHS */}
        <div className="bg-white rounded-xl border p-5 shadow-sm">
          <div className="flex gap-4">
            <div className="w-14 h-14 rounded-full flex items-center justify-center bg-yellow-100 text-yellow-600">
              <ScrollText />
            </div>

            <div>
              <p className="text-black font-semibold text-sm">
                Status Laporan KHS
              </p>

              <h2 className="text-2xl font-bold text-black">
                {adaKhs
                  ? "Tepat Waktu"
                  : "Belum Upload"}
              </h2>

              <p className="text-black font-medium text-sm mt-1">
                {adaKhs
                  ? "Laporan aman"
                  : "Belum ada laporan"}
              </p>

              <button className="text-blue-500 text-sm mt-3 font-medium">
                Lihat Detail →
              </button>
            </div>
          </div>
        </div>

        {/* STATUS KEUANGAN */}
        <div className="bg-white rounded-xl border p-5 shadow-sm">
          <div className="flex gap-4">
            <div className="w-14 h-14 rounded-full flex items-center justify-center bg-purple-100 text-purple-600">
              <Wallet />
            </div>

            <div>
              <p className="text-black font-semibold text-sm">
                Status Keuangan
              </p>

              <h2 className="text-2xl font-bold text-black">
                {statusKeuangan || "Belum Dibayarkan"}
              </h2>

              <p className="text-black font-medium text-sm mt-1">
                {statusKeuangan &&
                statusKeuangan !== "-" &&
                statusKeuangan !==
                  "Belum Dibayarkan"
                  ? "Pembayaran diproses"
                  : "-"}
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
          <h2 className="text-xl font-bold text-black mb-5">
            Progres Studi
          </h2>

          <div className="space-y-5">
            {progressItems.map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      item.done
                        ? "bg-green-500"
                        : "bg-gray-300"
                    }`}
                  ></div>

                  <p className="text-black font-medium">
                    {item.label}
                  </p>
                </div>

                <p
                  className={`font-semibold ${
                    item.done
                      ? "text-green-600"
                      : "text-gray-400"
                  }`}
                >
                  {item.done ? "Selesai" : "Belum"}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* AKTIVITAS */}
        <div className="bg-white rounded-xl p-6 border shadow-sm">
          <h2 className="text-xl font-bold text-black mb-5">
            Aktivitas Terbaru
          </h2>

          <div className="space-y-5">
            {(pengajuan?.pesan_komunikasi?.length ?? 0) >
            0 ? (
              pengajuan!.pesan_komunikasi!.map((msg) => (
                <div
                  key={msg.id}
                  className="flex justify-between"
                >
                  <div>
                    <h3 className="font-semibold text-black">
                      {msg.isi_pesan?.slice(0, 50) ??
                        "Pesan"}
                    </h3>

                    <p className="text-gray-500 text-sm">
                      {msg.pengirim?.email ?? "System"}
                    </p>
                  </div>

                  <p className="text-xs text-gray-400">
                    {formatDate(msg.waktu_kirim)}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-sm">
                Belum ada aktivitas
              </p>
            )}
          </div>
        </div>

        {/* NOTIFIKASI */}
        <div className="bg-white rounded-xl p-6 border shadow-sm">
          <h2 className="text-xl font-bold text-black mb-5">
            Pengingat & Notifikasi
          </h2>

          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-sm text-black">
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
                <h3 className="font-medium text-sm text-black">
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
        <h2 className="text-xl font-bold text-black mb-6">
          Ringkasan Studi
        </h2>

        <div className="grid grid-cols-6 gap-5 text-sm">
          <div>
            <p className="text-gray-400">
              Jenis Studi
            </p>

            <h3 className="font-semibold text-black mt-1">
              {pengajuan?.jenis_studi?.nama_jenis ??
                "-"}
            </h3>
          </div>

          <div>
            <p className="text-gray-400">
              Jalur
            </p>

            <h3 className="font-semibold text-black mt-1">
              {pengajuan?.jalur_pendanaan
                ?.nama_pendanaan ?? "-"}
            </h3>
          </div>

          <div>
            <p className="text-gray-400">
              Perguruan Tinggi
            </p>

            <h3 className="font-semibold text-black mt-1">
              {pengajuan?.wilayah_studi ?? "-"}
            </h3>
          </div>

          <div>
            <p className="text-gray-400">
              Program Studi
            </p>

            <h3 className="font-semibold text-black mt-1">
              {user?.master_dosen?.program_studi ??
                "-"}
            </h3>
          </div>

          <div>
            <p className="text-gray-400">
              Mulai Studi
            </p>

            <h3 className="font-semibold text-black mt-1">
              {pengajuan?.tanggal_pengajuan
                ? formatMonthYear(
                    pengajuan.tanggal_pengajuan
                  )
                : "-"}
            </h3>
          </div>

          <div>
            <p className="text-gray-400">
              Selesai Studi
            </p>

            <h3 className="font-semibold text-black mt-1">
              {pengajuan?.sk_kementerian?.[0]
                ?.tanggal_terbit
                ? formatMonthYear(
                    pengajuan.sk_kementerian[0]
                      .tanggal_terbit
                  )
                : "-"}
            </h3>
          </div>
        </div>
      </div>
    </div>
  );
}