import { DashboardHome } from "@/components/dashboard/dashboard-home";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Visão Geral | Dashboard",
};

export default function DashboardHomePage() {
  return <DashboardHome />;
}

