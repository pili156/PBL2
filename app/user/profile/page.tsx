import EditProfileForm from "@/app/components/EditProfileForm";

export default function UserProfilePage() {
  return <EditProfileForm backUrl="/user/dashboard" apiUrl="/api/user/profile" />;
}