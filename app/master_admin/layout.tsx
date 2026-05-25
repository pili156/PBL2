import AdminLayout from "../components/AdminLayout";
import { masterAdminMenuItems } from "../configs/menu-master-admin";
import { ROLES } from "@/src/lib/constants/roles";

export default function MasterAdminLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminLayout role={ROLES.MASTER_ADMIN} menuItems={masterAdminMenuItems}>
      {children}
    </AdminLayout>
  );
}
