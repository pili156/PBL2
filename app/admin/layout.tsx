import AdminLayout from "../components/AdminLayout";
import { menuItems } from "../configs/menu";
import { ROLES } from "@/src/lib/constants/roles";

export default function AdminLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminLayout role={ROLES.ADMIN_FAKULTAS} menuItems={menuItems} fallbackRoles={[ROLES.MASTER_ADMIN, ROLES.ADMIN]}>
      {children}
    </AdminLayout>
  );
}
