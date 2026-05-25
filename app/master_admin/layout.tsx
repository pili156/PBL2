import AdminLayout from "../components/AdminLayout";
import { masterAdminMenuItems } from "../configs/menu-master-admin";

export default function MasterAdminLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminLayout role="master_admin" menuItems={masterAdminMenuItems}>
      {children}
    </AdminLayout>
  );
}
