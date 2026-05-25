import AdminLayout from "../components/AdminLayout";
import { adminMenuItems } from "../configs/menu-admin";
import { ROLES } from "@/src/lib/constants/roles";

export default function AdminLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminLayout role={ROLES.ADMIN_FAKULTAS} menuItems={adminMenuItems}>
      {children}
    </AdminLayout>
  );
}
