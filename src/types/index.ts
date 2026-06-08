export type IconName =
  | "LayoutDashboard"
  | "ShieldCheck"
  | "Users"
  | "BookOpen"
  | "UserCheck"
  | "UserCog"
  | "Shield"
  | "ClipboardList"
  | "FileText"
  | "HandCoins";

export type MenuItem = {
  href: string;
  label: string;
  icon: IconName;
  allowedRoles: string[];
};
