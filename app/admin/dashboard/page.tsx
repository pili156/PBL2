import { headers } from "next/headers";
import { prisma } from "@/src/lib/prisma";
import MasterAdminDashboard from "./MasterAdminDashboard";
import DashboardClient from "./DashboardClient";

function getDateFilter(filter: string) {
  const now = new Date();
  switch (filter) {
    case "bulan":
      return { gte: new Date(now.getFullYear(), now.getMonth(), 1) };
    case "semester":
      return { gte: new Date(now.getFullYear(), now.getMonth() - 5, 1) };
    case "tahun":
      return { gte: new Date(now.getFullYear(), 0, 1) };
    default:
      return undefined;
  }
}

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const headersList = await headers();
  const userRole = headersList.get("x-user-role") || "";

  if (userRole === "master_admin") {
    const params = await searchParams;
    return (
      <MasterAdminDashboard
        dari={typeof params.dari === "string" ? params.dari : undefined}
        sampai={typeof params.sampai === "string" ? params.sampai : undefined}
      />
    );
  }

  const params = await searchParams;
  const filter = typeof params.filter === "string" ? params.filter : "all";
  const dateFilter = getDateFilter(filter);
  const dateCondition = dateFilter ? { created_at: dateFilter } : {};

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

    prisma.pengajuanStudi.findMany({
      where: dateCondition,
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

  const exportData = mappedPengajuanBaru.map((p) => ({
    Dosen: p.dosen,
    Jenis: p.jenis,
    Tanggal: p.tanggal,
    Status: p.status,
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
        exportData,
        filter,
      }}
    />
  );
}