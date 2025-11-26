import { HealthAppointmentsManager } from "@/components/dashboard/health-appointments-manager";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gerenciar Saúde | Dashboard",
};

export default function GerenciarSaudePage() {
  return <HealthAppointmentsManager />;
}




