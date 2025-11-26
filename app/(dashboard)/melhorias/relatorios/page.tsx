import { ReportsDashboard } from "@/components/dashboard/reports-dashboard";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Relatórios | Dashboard",
};

export default function RelatoriosPage() {
  return <ReportsDashboard />;
}




