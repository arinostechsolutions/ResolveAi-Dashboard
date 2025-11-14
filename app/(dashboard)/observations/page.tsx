import { ObservationsPage } from "@/components/admin/observations-page";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Observações | Dashboard",
};

export default function ObservationsPageRoute() {
  return <ObservationsPage />;
}

