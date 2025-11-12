"use client";

import { useState, useCallback } from "react";
import { useCity } from "@/context/city-context";
import { useDashboardOverview } from "@/hooks/use-dashboard-overview";
import { useReportsSummary } from "@/hooks/use-reports-summary";
import { useTopReports } from "@/hooks/use-top-reports";
import { useReportsMap } from "@/hooks/use-reports-map";
import { SummaryCard } from "@/components/cards/summary-card";
import { ReportsTrendChart } from "@/components/charts/reports-trend-chart";
import { StatusDistributionChart } from "@/components/charts/status-distribution-chart";
import { TopReportsTable } from "@/components/tables/top-reports-table";
import { ReportsMap } from "@/components/map/reports-map";
import { DashboardFilters, DashboardDateRange } from "@/components/dashboard/dashboard-filters";
import { useRouter } from "next/navigation";
import { TopReportsResponse } from "@/types/dashboard";
import {
  AlertTriangle,
  CheckCircle,
  Activity,
  MousePointerClick,
} from "lucide-react";

const formatNumber = (value: number) =>
  new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 }).format(value);

export function DashboardHome() {
  const { cityId } = useCity();
  const router = useRouter();
  const [dateRange, setDateRange] = useState<DashboardDateRange>({});

  const overview = useDashboardOverview({
    cityId,
    ...dateRange,
  });
  const summary = useReportsSummary({
    cityId,
    ...dateRange,
  });
  const topReports = useTopReports({
    cityId,
    sort: "engagement",
    status: "pendente",
  });
  const map = useReportsMap({
    cityId,
    status: "pendente",
  });

  const handleFollowReport = useCallback(
    (report: TopReportsResponse["results"][number]) => {
      const query = new URLSearchParams();
      query.set("q", report.id);
      query.set("status", report.status || "all");
      router.push(`/actions?${query.toString()}`);
    },
    [router],
  );

  return (
    <div className="flex flex-col gap-6 pb-12">
      <DashboardFilters currentRange={dateRange} onApply={setDateRange} />
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Denúncias totais"
          value={
            overview.isLoading
              ? "—"
              : formatNumber(overview.data?.totalReports ?? 0)
          }
          description="Total acumulado da cidade selecionada."
          icon={<AlertTriangle className="size-6" />}
          tone="emerald"
        />
        <SummaryCard
          title="Criadas no período"
          value={
            overview.isLoading
              ? "—"
              : formatNumber(overview.data?.createdInPeriod ?? 0)
          }
          description="Denúncias registradas dentro do intervalo filtrado."
          icon={<Activity className="size-6" />}
          tone="violet"
        />
        <SummaryCard
          title="Resolvemos"
          value={
            overview.isLoading
              ? "—"
              : formatNumber(
                  overview.data?.totalByStatus?.resolvido ?? 0,
                )
          }
          description="Casos concluídos pela operação da prefeitura."
          icon={<CheckCircle className="size-6" />}
          tone="sky"
        />
        <SummaryCard
          title="Engajamento total"
          value={
            overview.isLoading
              ? "—"
              : formatNumber(
                  (overview.data?.engagement.totalLikes ?? 0) +
                    (overview.data?.engagement.totalViews ?? 0) +
                    (overview.data?.engagement.totalShares ?? 0),
                )
          }
          description="Soma de curtidas, visualizações e compartilhamentos."
          icon={<MousePointerClick className="size-6" />}
          tone="amber"
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          {summary.isLoading || !summary.data ? (
            <div className="flex h-72 items-center justify-center rounded-3xl border border-slate-800 bg-slate-900/60 text-slate-400">
              Carregando série temporal...
            </div>
          ) : (
            <ReportsTrendChart timeline={summary.data.timeline} />
          )}
        </div>
        <div className="lg:col-span-2">
          {summary.isLoading || !summary.data ? (
            <div className="flex h-72 items-center justify-center rounded-3xl border border-slate-800 bg-slate-900/60 text-slate-400">
              Carregando distribuição...
            </div>
          ) : (
            <StatusDistributionChart byStatus={summary.data.byStatus} />
          )}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          {topReports.isLoading || !topReports.data ? (
            <div className="flex h-64 items-center justify-center rounded-3xl border border-slate-800 bg-slate-900/60 text-slate-400">
              Carregando denúncias em destaque...
            </div>
          ) : (
            <TopReportsTable
              data={topReports.data.results}
              onFollow={handleFollowReport}
            />
          )}
        </div>
        <div className="xl:col-span-1 h-full">
          <div className="h-[26rem] w-full xl:h-[30rem]">
            <ReportsMap data={map.data} cityId={cityId} />
          </div>
        </div>
      </section>
    </div>
  );
}

