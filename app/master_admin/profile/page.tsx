import EditProfileForm from "@/app/components/EditProfileForm";

export default function MasterAdminProfilePage() {
  return <EditProfileForm backUrl="/master_admin/dashboard" apiUrl="/api/master_admin/profile" />;
}