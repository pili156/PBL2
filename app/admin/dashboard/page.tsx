// app/admin/dashboard/page.tsx
import { prisma } from "@/src/lib/prisma";
import DashboardClient from "./DashboardClient";

export default async function AdminDashboardPage(props: { searchParams: Promise<{ filter?: string }> }) {
  
  const searchParams = await props.searchParams;
  const filter = searchParams.filter || 'all';
  
  // --- 1. LOGIKA FILTER TANGGAL ---
  let dateFilter: any = {};
  let skDateFilter: any = {};
  
  if (filter === 'bulan') {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    dateFilter = { created_at: { gte: oneMonthAgo } };
    skDateFilter = { tanggal_terbit: { gte: oneMonthAgo } };
  } else if (filter === 'semester') {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    dateFilter = { created_at: { gte: sixMonthsAgo } };
    skDateFilter = { tanggal_terbit: { gte: sixMonthsAgo } };
  } else if (filter === 'tahun') {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    dateFilter = { created_at: { gte: oneYearAgo } };
    skDateFilter = { tanggal_terbit: { gte: oneYearAgo } };
  }

  // --- 2. DATA KPI UTAMA ---
  const [pendingVerifikasi, totalSK, khsTerlambat, aktifStudi] = await Promise.all([
    prisma.dokumenPengajuan.count({ 
      where: { status_verifikasi: "Pending", ...dateFilter } 
    }),
    prisma.skKementerian.count({ 
      where: skDateFilter 
    }),
    prisma.monitoringKhs.count({ 
      where: { catatan_evaluasi: { contains: "Terlambat", mode: 'insensitive' }, ...dateFilter } 
    }),
    prisma.skKementerian.count({ where: { status_studi: "Aktif" } })
  ]);

  // --- 3. DATA GRAFIK BAR (Tren Jurusan) ---
  const daftarJurusan = ["Elektro", "Sipil", "Mesin", "AB", "Akuntansi"];
  const monitoringData = await Promise.all(
    daftarJurusan.map(async (jurusan) => {
      const total = await prisma.pengajuanStudi.count({
        where: { user: { master_dosen: { unit_kerja: jurusan } }, ...dateFilter }
      });
      return { jurusan, total };
    })
  );

  // --- 4. DATA GRAFIK PIE (Status Pengajuan) ---
  const statusDataRaw = await prisma.pengajuanStudi.groupBy({
    by: ['status_id'],
    _count: true,
    where: dateFilter
  });
  const masterStatus = await prisma.masterStatusPengajuan.findMany();
  const grafikStatus = masterStatus.map(s => ({
    name: s.nama_status || 'Unknown',
    value: statusDataRaw.find(d => d.status_id === s.id)?._count || 0
  })).filter(s => s.value > 0);

  // --- 5. DATA TINDAKAN CEPAT (Antrean Pending) ---
  const urgentTasksRaw = await prisma.dokumenPengajuan.findMany({
    where: { status_verifikasi: "Pending", ...dateFilter },
    include: { master_dokumen: true, pengajuan_studi: { include: { user: { include: { master_dosen: true } } } } },
    take: 4,
    orderBy: { updated_at: 'asc' }
  });
  const urgentTasks = urgentTasksRaw.map(t => ({
    id: t.id,
    pengajuan_id: t.pengajuan_id,
    dosen: t.pengajuan_studi?.user?.master_dosen?.nama_lengkap || 'Dosen',
    dokumen: t.master_dokumen?.nama_dokumen || 'Berkas',
    tanggal: t.updated_at?.toISOString() || null
  }));

  // --- 6. DATA PENGAJUAN BARU MASUK ---
  const pengajuanBaruRaw = await prisma.pengajuanStudi.findMany({
    where: dateFilter,
    include: { user: { include: { master_dosen: true } }, jenis_studi: true, status: true },
    take: 5,
    orderBy: { created_at: 'desc' }
  });
  const pengajuanBaru = pengajuanBaruRaw.map(p => ({
    id: p.id,
    dosen: p.user?.master_dosen?.nama_lengkap || 'Dosen',
    jenis: p.jenis_studi?.nama_jenis || 'Studi',
    status: p.status?.nama_status || 'Pending',
    tanggal: p.created_at?.toISOString() || null
  }));

  // --- 7. DOKUMEN MELEWATI BATAS REVISI (7 Hari) ---
  const tujuhHariLalu = new Date();
  tujuhHariLalu.setDate(tujuhHariLalu.getDate() - 7);
  const lewatBatasRaw = await prisma.dokumenPengajuan.findMany({
    where: {
      status_verifikasi: { in: ["Revisi", "Ditolak"] },
      updated_at: { lt: tujuhHariLalu }
    },
    include: { master_dokumen: true, pengajuan_studi: { include: { user: { include: { master_dosen: true } } } } },
    take: 5
  });
  const lewatBatas = lewatBatasRaw.map(t => ({
    id: t.id,
    pengajuan_id: t.pengajuan_id,
    dosen: t.pengajuan_studi?.user?.master_dosen?.nama_lengkap || 'Dosen',
    dokumen: t.master_dokumen?.nama_dokumen || 'Berkas',
    status: t.status_verifikasi || 'Revisi',
    tanggalUpdate: t.updated_at?.toISOString() || null
  }));

  // --- 8. DATA UNTUK EXPORT EXCEL ---
  const allPengajuan = await prisma.pengajuanStudi.findMany({
    where: dateFilter,
    include: { user: { include: { master_dosen: true } }, status: true, jenis_studi: true }
  });
  const exportData = allPengajuan.map((p, idx) => ({
    "No": idx + 1,
    "Nama Dosen": p.user?.master_dosen?.nama_lengkap || "Unknown",
    "NIP": p.user?.master_dosen?.nip || "-",
    "Jurusan": p.user?.master_dosen?.unit_kerja || "-",
    "Jenis Studi": p.jenis_studi?.nama_jenis || "-",
    "Status Pengajuan": p.status?.nama_status || "-",
    "Tanggal Pengajuan": p.created_at ? p.created_at.toLocaleDateString('id-ID') : "-"
  }));

  const dashboardData = {
    kpi: { pendingVerifikasi, totalSK, khsTerlambat, aktifStudi },
    monitoringData,
    grafikStatus,
    urgentTasks,
    pengajuanBaru,
    lewatBatas,
    exportData,
    filter
  };

  return <DashboardClient data={dashboardData} />;
}