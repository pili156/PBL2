import { headers } from "next/headers";
import { prisma } from "@/src/lib/prisma";
import MasterAdminDashboard from "./MasterAdminDashboard";
import DashboardClient from "./DashboardClient";

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const headersList = await headers();
  const userRole = headersList.get("x-user-role") || "";
  const params = await searchParams;
  
  const dari = typeof params.dari === "string" ? params.dari : undefined;
  const sampai = typeof params.sampai === "string" ? params.sampai : undefined;

  if (userRole === "master_admin") {
    return (
      <MasterAdminDashboard
        dari={dari}
        sampai={sampai}
      />
    );
  }

  // Buat Custom Date Condition untuk range tanggal (dari & sampai)
  const dateCondition: any = {};
  if (dari || sampai) {
    dateCondition.created_at = {};
    if (dari) dateCondition.created_at.gte = new Date(dari);
    if (sampai) {
      const endDate = new Date(sampai);
      endDate.setHours(23, 59, 59, 999);
      dateCondition.created_at.lte = endDate;
    }
  }

  const tujuhHariLalu = new Date();
  tujuhHariLalu.setDate(tujuhHariLalu.getDate() - 7);

  const [
    pendingVerifikasi,
    totalSK,
    khsTerlambat,
    aktifStudi,
    monitoringData,
    urgentTasks,
    pengajuanBaru,
    statusGroups,
    masterStatuses,
    lewatBatas,
    allExportDataRaw // <-- Tambahan khusus query Excel
  ] = await Promise.all([
    prisma.dokumenPengajuan.count({ where: { status_verifikasi: "pending" } }),
    prisma.skKementerian.count(),
    prisma.monitoringKhs.count({
      where: { catatan_evaluasi: { contains: "Terlambat", mode: "insensitive" } },
    }),
    prisma.skKementerian.count({ where: { status_studi: "aktif" } }),

    Promise.all(
      ["Elektro", "Sipil", "Mesin", "AB", "Akuntansi"].map(async (jurusan) => {
        const total = await prisma.pengajuanStudi.count({
          where: { user: { master_dosen: { unit_kerja: jurusan } } },
        });
        return { jurusan, total };
      })
    ),

    prisma.dokumenPengajuan.findMany({
      where: { status_verifikasi: "pending" },
      include: {
        master_dokumen: true,
        pengajuan_studi: {
          include: { user: { include: { master_dosen: true } } },
        },
      },
      take: 6,
      orderBy: { updated_at: "asc" },
    }),

    // Terapkan Range Tanggal untuk UI Pengajuan Baru (Dibatasi 5)
    prisma.pengajuanStudi.findMany({
      where: Object.keys(dateCondition).length > 0 ? dateCondition : {},
      include: {
        user: { include: { master_dosen: true } },
        dokumen_pengajuan: { include: { master_dokumen: true } },
        status: true,
      },
      orderBy: { created_at: "desc" },
      take: 5,
    }),

    prisma.pengajuanStudi.groupBy({
      by: ["status_id"],
      _count: true,
    }),
    prisma.masterStatusPengajuan.findMany(),

    prisma.dokumenPengajuan.findMany({
      where: {
        status_verifikasi: { in: ["revisi"] },
        updated_at: { lt: tujuhHariLalu },
      },
      include: {
        master_dokumen: true,
        pengajuan_studi: {
          include: { user: { include: { master_dosen: true } } },
        },
      },
      orderBy: { updated_at: "asc" },
    }),

    // Terapkan Range Tanggal untuk Excel Export (Semua data, tidak dilimit)
    prisma.pengajuanStudi.findMany({
      where: Object.keys(dateCondition).length > 0 ? dateCondition : {},
      include: {
        user: { include: { master_dosen: true } },
        dokumen_pengajuan: { include: { master_dokumen: true } },
        status: true,
      },
      orderBy: { created_at: "desc" },
    }),
  ]);

  const mappedUrgentTasks = urgentTasks.map((t) => ({
    id: t.id,
    dosen: t.pengajuan_studi?.user?.master_dosen?.nama_lengkap || "Dosen",
    dokumen: t.master_dokumen?.nama_dokumen || "Berkas",
    pengajuan_id: String(t.pengajuan_studi?.id ?? t.id),
  }));

  const mappedPengajuanBaru = pengajuanBaru.map((p) => ({
    id: p.id,
    dosen: p.user?.master_dosen?.nama_lengkap || "Dosen",
    jenis: p.dokumen_pengajuan?.[0]?.master_dokumen?.nama_dokumen || "Pengajuan",
    tanggal: p.created_at?.toISOString() || null,
    status: p.status?.nama_status || "pending",
    pengajuan_id: String(p.id),
  }));

  const mappedLewatBatas = lewatBatas.map((t) => ({
    id: t.id,
    dosen: t.pengajuan_studi?.user?.master_dosen?.nama_lengkap || "Dosen",
    dokumen: t.master_dokumen?.nama_dokumen || "Berkas",
    tanggalUpdate: t.updated_at?.toISOString() || null,
    pengajuan_id: String(t.pengajuan_studi?.id ?? t.id),
  }));

  const statusMap = new Map(masterStatuses.map((s) => [s.id, s.nama_status]));
  const grafikStatus = statusGroups
    .filter((g) => g.status_id !== null)
    .map((g) => ({
      name: statusMap.get(g.status_id!) || "Unknown",
      value: g._count,
    }));

  // Mapping semua data hasil query allExportDataRaw (tanpa take: 5)
  const exportData = allExportDataRaw.map((p) => ({
    Dosen: p.user?.master_dosen?.nama_lengkap || "Dosen",
    Jenis: p.dokumen_pengajuan?.[0]?.master_dokumen?.nama_dokumen || "Pengajuan",
    Tanggal: p.created_at ? p.created_at.toLocaleDateString("id-ID") : "-",
    Status: p.status?.nama_status || "pending",
  }));

  return (
    <DashboardClient
      data={{
        kpi: { aktifStudi, pendingVerifikasi, khsTerlambat, totalSK },
        monitoringData,
        pengajuanBaru: mappedPengajuanBaru,
        urgentTasks: mappedUrgentTasks,
        lewatBatas: mappedLewatBatas,
        grafikStatus,
        exportData, // Sekarang berisi semua data utuh
        dari,       // Parameter ini dipass untuk nama file Excel
        sampai,     // Parameter ini dipass untuk nama file Excel
      }}
    />
  );
}