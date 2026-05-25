import AdminLayout from "../components/AdminLayout";
import { adminMenuItems } from "../configs/menu-admin";

export default function AdminLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminLayout role="admin_fakultas" menuItems={adminMenuItems}>
      {children}
    </AdminLayout>
  );
}
