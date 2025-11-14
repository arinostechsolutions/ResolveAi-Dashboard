import { MapDashboard } from "@/components/dashboard/map-dashboard";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mapa Estratégico | Dashboard",
};

export default function MapPage() {
  return <MapDashboard />;
}



