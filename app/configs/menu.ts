import { ROLES } from "@/src/lib/constants/roles";
import type { MenuItem } from "@/src/types";

export const menuItems: MenuItem[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: "LayoutDashboard", allowedRoles: [ROLES.MASTER_ADMIN, ROLES.ADMIN_FAKULTAS] },
  { href: "/admin/verifikasi-pengajuan", label: "Verifikasi Pengajuan", icon: "ShieldCheck", allowedRoles: [ROLES.MASTER_ADMIN, ROLES.ADMIN_FAKULTAS] },
  { href: "/admin/riwayat-dosen", label: "Monitoring Dosen", icon: "Users", allowedRoles: [ROLES.MASTER_ADMIN, ROLES.ADMIN_FAKULTAS] },
  { href: "/admin/buku-induk", label: "Buku Induk", icon: "BookOpen", allowedRoles: [ROLES.MASTER_ADMIN, ROLES.ADMIN_FAKULTAS] },

  { href: "/master_admin/monitoring-pengguna", label: "Monitoring Pengguna", icon: "UserCheck", allowedRoles: [ROLES.MASTER_ADMIN] },
  { href: "/master_admin/role-permission", label: "Peran & Hak Akses", icon: "Shield", allowedRoles: [ROLES.MASTER_ADMIN] },
  { href: "/master_admin/audit-log", label: "Log Aktivitas", icon: "ClipboardList", allowedRoles: [ROLES.MASTER_ADMIN] },
];
