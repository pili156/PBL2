import { ROLES } from "@/src/lib/constants/roles";
import type { MenuItem } from "@/src/types";

// 1. MENU KHUSUS ADMIN (Hanya mengarah ke /admin/...)
export const adminMenuItems: MenuItem[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: "LayoutDashboard", allowedRoles: [ROLES.ADMIN] },
  { href: "/admin/verifikasi-pengajuan", label: "Verifikasi Pengajuan", icon: "ShieldCheck", allowedRoles: [ROLES.ADMIN] },
  { href: "/admin/riwayat-dosen", label: "Monitoring Dosen", icon: "Users", allowedRoles: [ROLES.ADMIN] },
  { href: "/admin/buku-induk", label: "Buku Induk", icon: "BookOpen", allowedRoles: [ROLES.ADMIN] },
];

// 2. MENU KHUSUS MASTER ADMIN (Ada 7 Menu, Semuanya mengarah ke /master_admin/...)
export const masterAdminMenuItems: MenuItem[] = [
  // --- Menu Dasar (Copy dari Admin tapi jalurnya diubah) ---
  { href: "/master_admin/dashboard", label: "Dashboard", icon: "LayoutDashboard", allowedRoles: [ROLES.MASTER_ADMIN] },
  { href: "/master_admin/verifikasi-pengajuan", label: "Verifikasi Pengajuan", icon: "ShieldCheck", allowedRoles: [ROLES.MASTER_ADMIN] },
  { href: "/master_admin/riwayat-dosen", label: "Monitoring Dosen", icon: "Users", allowedRoles: [ROLES.MASTER_ADMIN] },
  { href: "/master_admin/buku-induk", label: "Buku Induk", icon: "BookOpen", allowedRoles: [ROLES.MASTER_ADMIN] },
  // --- Menu Spesial Master Admin ---
  { href: "/master_admin/monitoring-pengguna", label: "Monitoring Pengguna", icon: "UserCheck", allowedRoles: [ROLES.MASTER_ADMIN] },
  { href: "/master_admin/role-permission", label: "Peran & Hak Akses", icon: "Shield", allowedRoles: [ROLES.MASTER_ADMIN] },
  { href: "/master_admin/audit-log", label: "Log Aktivitas", icon: "ClipboardList", allowedRoles: [ROLES.MASTER_ADMIN] },
];