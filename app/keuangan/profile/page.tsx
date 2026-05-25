import EditProfileForm from "@/app/components/EditProfileForm";

export default function KeuanganProfilePage() {
  return <EditProfileForm backUrl="/keuangan/dashboard" apiUrl="/api/keuangan/profile" />;
}
