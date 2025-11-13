import { ProfileDashboard } from "@/components/dashboard/profile-dashboard";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Perfil | Dashboard",
};

export default function ProfilePage() {
  return <ProfileDashboard />;
}



