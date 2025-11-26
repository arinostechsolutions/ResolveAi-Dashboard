import { MapDashboard } from "@/components/dashboard/map-dashboard";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mapa | Dashboard",
};

export default function MapaPage() {
  return <MapDashboard />;
}




