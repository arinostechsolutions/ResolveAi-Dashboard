import { ActionsDashboard } from "@/components/dashboard/actions-dashboard";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ações | Dashboard",
};

export default function AcoesPage() {
  return <ActionsDashboard />;
}

