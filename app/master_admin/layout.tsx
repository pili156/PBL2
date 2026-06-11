import AdminLayout from "../components/AdminLayout";
import { adminMenuItems, masterAdminMenuItems } from "../configs/menu";
import { ROLES } from "@/src/lib/constants/roles";

export default function MasterAdminLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminLayout role={ROLES.MASTER_ADMIN} menuItems={[...adminMenuItems, ...masterAdminMenuItems]}>
      {children}
    </AdminLayout>
  );
}
