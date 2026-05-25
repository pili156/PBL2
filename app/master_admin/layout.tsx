import AdminLayout from "../components/AdminLayout";
import { menuItems } from "../configs/menu";
import { ROLES } from "@/src/lib/constants/roles";

export default function MasterAdminLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminLayout role={ROLES.MASTER_ADMIN} menuItems={menuItems}>
      {children}
    </AdminLayout>
  );
}
