import { Suspense } from "react";
import {
  Users,
  UserCheck,
  FileText,
  UserPlus,
  TrendingUp,
  Activity,
  Shield,
  Filter,
} from "lucide-react";
import { prisma } from "@/src/lib/prisma";
import BarChartRegistrasi from "./BarChartRegistrasi";
import PieChartRole from "./PieChartRole";
import DateFilter from "./DateFilter";
import { formatDateTime } from "@/src/lib/formatters";

export default async function MasterAdminDashboard({
  dari,
  sampai,
}: {
  dari?: string;
  sampai?: string;
}) {
  const now = new Date();
  const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);

  const dateFilterStart = dari ? new Date(dari) : undefined;
  const dateFilterEnd = sampai ? new Date(sampai) : undefined;

  if (dateFilterEnd) {
    dateFilterEnd.setHours(23, 59, 59, 999);
  }

  const userDateFilter =
    dateFilterStart || dateFilterEnd
      ? {
          created_at: {
            ...(dateFilterStart ? { gte: dateFilterStart } : {}),
            ...(dateFilterEnd ? { lte: dateFilterEnd } : {}),
          },
        }
      : undefined;

  const pengajuanDateFilter =
    dateFilterStart || dateFilterEnd
      ? {
          created_at: {
            ...(dateFilterStart ? { gte: dateFilterStart } : {}),
            ...(dateFilterEnd ? { lte: dateFilterEnd } : {}),
          },
        }
      : undefined;

  const logDateFilter =
    dateFilterStart || dateFilterEnd
      ? {
          created_at: {
            ...(dateFilterStart ? { gte: dateFilterStart } : {}),
            ...(dateFilterEnd ? { lte: dateFilterEnd } : {}),
          },
        }
      : undefined;

  const chartDateFilter = dateFilterStart
    ? { gte: dateFilterStart }
    : { gte: twelveMonthsAgo };
  const chartDateFilterEnd = dateFilterEnd
    ? { lte: dateFilterEnd }
    : {};

  const [
    totalUsers,
    activeUsers,
    totalPengajuan,
    pendingUsers,
    recentUsers,
    roleGroups,
    roles,
    recentLogs,
  ] = await Promise.all([
    prisma.user.count({ where: userDateFilter }),
    prisma.user.count({
      where: { status_akun: "aktif", ...userDateFilter },
    }),
    prisma.pengajuanStudi.count({ where: pengajuanDateFilter }),
    prisma.user.count({
      where: { status_akun: "Pending", ...userDateFilter },
    }),
    prisma.user.findMany({
      where: {
        created_at: { ...chartDateFilter, ...chartDateFilterEnd },
      },
      select: { created_at: true },
      orderBy: { created_at: "asc" },
    }),
    prisma.user.groupBy({
      by: ["role_id"],
      _count: true,
      where: userDateFilter,
    }),
    prisma.masterRole.findMany(),
    prisma.activityLog.findMany({
      take: 10,
      where: logDateFilter,
      orderBy: { created_at: "desc" },
      include: { user: { select: { username: true, email: true } } },
    }),
  ]);

  const monthlyData = aggregateByMonth(recentUsers, now, dateFilterStart, dateFilterEnd);
  const roleData = buildRoleData(roleGroups, roles);

  const filterLabel =
    dari || sampai
      ? `${dari || "Awal"} – ${sampai || "Sekarang"}`
      : null;

  return (
    <div className="p-6 bg-slate-50 min-h-screen space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dashboard Master Admin</h1>
          <p className="text-slate-500">Pantau aktivitas sistem, kelola pengguna, dan tinjau log aktivitas secara real-time.</p>
        </div>
        <div className="flex items-center gap-3">
          {filterLabel && (
            <div className="flex items-center gap-2 bg-blue-50 text-blue-700 text-sm font-medium px-3 py-2 rounded-lg border border-blue-200">
              <Filter size={16} />
              {filterLabel}
            </div>
          )}
          <Suspense fallback={null}><DateFilter /></Suspense>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard
          title="Total User"
          value={totalUsers}
          icon={<Users size={24} />}
          trend="Seluruh pengguna terdaftar"
          color="blue"
        />
        <KpiCard
          title="User Aktif"
          value={activeUsers}
          icon={<UserCheck size={24} />}
          trend="Akun terverifikasi & aktif"
          color="emerald"
        />
        <KpiCard
          title="Total Pengajuan"
          value={totalPengajuan}
          icon={<FileText size={24} />}
          trend="Pengajuan studi lanjut"
          color="amber"
        />
        <KpiCard
          title="Registrasi Pending"
          value={pendingUsers}
          icon={<UserPlus size={24} />}
          trend="Menunggu verifikasi"
          color="purple"
          isUrgent={pendingUsers > 0}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-base font-bold text-slate-800">Registrasi User per Bulan</h3>
              <p className="text-sm text-slate-400">
                {dateFilterStart || dateFilterEnd
                  ? "Tren pendaftaran berdasarkan filter tanggal."
                  : "Tren pendaftaran pengguna 12 bulan terakhir."}
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-full text-blue-600">
              <TrendingUp size={24} />
            </div>
          </div>
          <BarChartRegistrasi data={monthlyData} />
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-base font-bold text-slate-800">Distribusi User by Role</h3>
              <p className="text-sm text-slate-400">Komposisi pengguna berdasarkan peran akses.</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-full text-purple-600">
              <Shield size={24} />
            </div>
          </div>
          <PieChartRole data={roleData} />
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-slate-800">Aktivitas Terbaru</h3>
            <p className="text-sm text-slate-400">Log aktivitas pengguna dalam sistem.</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-full text-slate-600">
            <Activity size={24} />
          </div>
        </div>

        {recentLogs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left">
                  <th className="pb-3 font-semibold text-slate-500 px-2">Waktu</th>
                  <th className="pb-3 font-semibold text-slate-500 px-2">User</th>
                  <th className="pb-3 font-semibold text-slate-500 px-2">Aktivitas</th>
                  <th className="pb-3 font-semibold text-slate-500 px-2">Tipe</th>
                </tr>
              </thead>
              <tbody>
                {recentLogs.map((log) => (
                  <tr key={log.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-2 text-slate-600 whitespace-nowrap">{formatDateTime(log.created_at)}</td>
                    <td className="py-3 px-2 font-medium text-slate-800">
                      {log.user?.username || log.user?.email || log.created_by || "-"}
                    </td>
                    <td className="py-3 px-2 text-slate-600">{log.aktivitas || "-"}</td>
                    <td className="py-3 px-2">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                        {log.tipe || "-"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <Activity size={32} className="mx-auto text-slate-300 mb-3" />
            <p className="text-slate-400 font-medium">Belum ada aktivitas tercatat.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function aggregateByMonth(
  users: { created_at: Date | null }[],
  now: Date,
  dateFilterStart?: Date,
  dateFilterEnd?: Date
): { bulan: string; total: number }[] {
  const months: Record<string, { label: string; total: number; sort: string }> = {};

  let startMonth: Date;
  if (dateFilterStart) {
    startMonth = new Date(dateFilterStart.getFullYear(), dateFilterStart.getMonth(), 1);
  } else {
    startMonth = new Date(now.getFullYear(), now.getMonth() - 11, 1);
  }

  let endMonth: Date;
  if (dateFilterEnd) {
    endMonth = new Date(dateFilterEnd.getFullYear(), dateFilterEnd.getMonth(), 1);
  } else {
    endMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  const m = new Date(startMonth);
  while (m <= endMonth) {
    const key = `${m.getFullYear()}-${String(m.getMonth() + 1).padStart(2, "0")}`;
    months[key] = {
      label: m.toLocaleDateString("id-ID", { month: "short", year: "numeric" }),
      total: 0,
      sort: key,
    };
    m.setMonth(m.getMonth() + 1);
  }

  for (const user of users) {
    if (!user.created_at) continue;
    const d = new Date(user.created_at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (months[key]) {
      months[key].total++;
    }
  }

  return Object.values(months)
    .sort((a, b) => a.sort.localeCompare(b.sort))
    .map((m) => ({ bulan: m.label, total: m.total }));
}

function buildRoleData(
  groups: { role_id: number | null; _count: number }[],
  roles: { id: number; nama_role: string | null }[]
): { name: string; value: number }[] {
  const roleMap = new Map(roles.map((r) => [r.id, r.nama_role || "Unknown"]));

  const result: { name: string; value: number }[] = [];
  for (const g of groups) {
    if (g.role_id === null) continue;
    result.push({
      name: roleMap.get(g.role_id) || "Unknown",
      value: g._count,
    });
  }
  return result;
}

function KpiCard({
  title,
  value,
  icon,
  trend,
  color,
  isUrgent,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  trend: string;
  color: string;
  isUrgent?: boolean;
}) {
  const colors: Record<string, string> = {
    blue: "bg-blue-600 text-white shadow-blue-100",
    amber: "bg-amber-500 text-white shadow-amber-100",
    emerald: "bg-emerald-600 text-white shadow-emerald-100",
    red: "bg-rose-600 text-white shadow-rose-100",
    purple: "bg-purple-600 text-white shadow-purple-100",
  };

  return (
    <div
      className={`bg-white p-6 rounded-xl border shadow-sm transition-all hover:-translate-y-1 ${
        isUrgent ? "border-rose-200 ring-4 ring-rose-50" : "border-slate-200"
      }`}
    >
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{title}</p>
          <h3 className="text-3xl font-black text-slate-900">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl shadow-lg ${colors[color]}`}>{icon}</div>
      </div>
      <div className="mt-4 flex items-center gap-2">
        <div
          className={`w-1.5 h-1.5 rounded-full ${
            isUrgent ? "animate-ping bg-rose-600" : "bg-slate-300"
          }`}
        />
        <p
          className={`text-xs font-semibold ${
            isUrgent ? "text-rose-600" : "text-slate-500"
          }`}
        >
          {trend}
        </p>
      </div>
    </div>
  );
}