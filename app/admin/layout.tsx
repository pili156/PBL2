import AdminLayout from "../components/AdminLayout";
import { adminMenuItems } from "../configs/menu";
import { ROLES } from "@/src/lib/constants/roles";

export default function AdminLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminLayout role={ROLES.ADMIN} menuItems={adminMenuItems} fallbackRoles={[ROLES.MASTER_ADMIN]}>
      {children}
    </AdminLayout>
  );
}
