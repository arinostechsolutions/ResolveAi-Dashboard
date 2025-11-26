import { CustomReportTypesManager } from "@/components/dashboard/custom-report-types-manager";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tipos de Sugestões | Dashboard",
};

export default function TiposDeSugestoesPage() {
  return <CustomReportTypesManager />;
}




