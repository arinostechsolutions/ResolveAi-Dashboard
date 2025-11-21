import { CustomReportTypesManager } from "@/components/dashboard/custom-report-types-manager";

export default function ReportTypesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-200">
          Tipos de Sugestões de Melhorias
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Gerencie os tipos de sugestões de melhorias disponíveis no aplicativo mobile e dashboard
        </p>
      </div>
      <CustomReportTypesManager />
    </div>
  );
}

