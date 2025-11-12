"use client";

import { useCity } from "@/context/city-context";
import { useReportsSummary } from "@/hooks/use-reports-summary";
import { useTopReports } from "@/hooks/use-top-reports";
import { TopReportsTable } from "@/components/tables/top-reports-table";
import { SummaryCard } from "@/components/cards/summary-card";
import { Layers, MapPin, FileText } from "lucide-react";

const formatNumber = (value: number) =>
  new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 }).format(value);

export function ReportsDashboard() {
  const { cityId } = useCity();
  const summary = useReportsSummary({ cityId });
  const topReports = useTopReports({ cityId, sort: "oldest", status: "pendente", limit: 10 });

  const pendingTotal =
    summary.data?.byStatus.find((item) => item.status === "pendente")
      ?.total ?? 0;
  const inProgressTotal =
    summary.data?.byStatus.find((item) => item.status === "em_andamento")
      ?.total ?? 0;

  return (
    <div className="flex flex-col gap-6 pb-12">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Pendentes"
          value={
            summary.isLoading ? "—" : formatNumber(pendingTotal)
          }
          description="Denúncias aguardando triagem ou encaminhamento."
          icon={<FileText className="size-6" />}
          tone="amber"
        />
        <SummaryCard
          title="Em andamento"
          value={
            summary.isLoading ? "—" : formatNumber(inProgressTotal)
          }
          description="Equipes da prefeitura já estão atuando nesses casos."
          icon={<Layers className="size-6" />}
          tone="sky"
        />
        <SummaryCard
          title="Bairros atendidos"
          value={
            summary.isLoading
              ? "—"
              : formatNumber(summary.data?.byNeighborhood.length ?? 0)
          }
          description="Cobertura atual das solicitações pela cidade."
          icon={<MapPin className="size-6" />}
          tone="emerald"
        />
        <SummaryCard
          title="Tipos de denúncia"
          value={
            summary.isLoading
              ? "—"
              : formatNumber(summary.data?.byType.length ?? 0)
          }
          description="Categorias ativas configuradas no módulo ResolveAI."
          icon={<Layers className="size-6" />}
          tone="violet"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          {topReports.isLoading || !topReports.data ? (
            <div className="flex h-64 items-center justify-center rounded-3xl border border-slate-800 bg-slate-900/60 text-slate-400">
              Carregando fila de atendimentos...
            </div>
          ) : (
            <TopReportsTable data={topReports.data.results} />
          )}
        </div>
        <div className="space-y-6 xl:col-span-1">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg shadow-slate-900/30">
            <h3 className="text-base font-semibold text-white">
              Tipos mais frequentes
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-300">
              {summary.data?.byType.slice(0, 6).map((item) => (
                <li
                  key={item.type}
                  className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/50 px-3 py-2"
                >
                  <span>{item.type}</span>
                  <span className="text-emerald-300">{item.total}</span>
                </li>
              )) ?? (
                <li className="text-slate-400">Carregando...</li>
              )}
            </ul>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg shadow-slate-900/30">
            <h3 className="text-base font-semibold text-white">
              Bairros mais impactados
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-300">
              {summary.data?.byNeighborhood.slice(0, 6).map((item) => (
                <li
                  key={item.neighborhood}
                  className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/50 px-3 py-2"
                >
                  <span>{item.neighborhood}</span>
                  <span className="text-sky-300">{item.total}</span>
                </li>
              )) ?? (
                <li className="text-slate-400">Carregando...</li>
              )}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}

