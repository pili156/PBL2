import EditProfileForm from "@/app/components/EditProfileForm";

export default function MasterAdminProfilePage() {
  return <EditProfileForm backUrl="/admin/dashboard" apiUrl="/api/master_admin/profile" />;
}