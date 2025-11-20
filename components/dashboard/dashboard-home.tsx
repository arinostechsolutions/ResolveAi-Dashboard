"use client";

import { useState, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { clsx } from "clsx";
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
import { EngagementRanking } from "@/components/dashboard/engagement-ranking";
import { useRouter } from "next/navigation";
import { TopReportsResponse } from "@/types/dashboard";
import { useAuth } from "@/context/auth-context";
import { useSecretariaFilter } from "@/context/secretaria-context";
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
  const { admin } = useAuth();
  const { secretariaId } = useSecretariaFilter();
  const router = useRouter();
  const isMayor = admin?.isMayor && !admin?.isSuperAdmin;
  const [dateRange, setDateRange] = useState<DashboardDateRange>({});
  const [topReportsPage, setTopReportsPage] = useState(1);
  const [topReportsLimit, setTopReportsLimit] = useState(2);

  const overview = useDashboardOverview({
    cityId: cityId || "",
    ...dateRange,
    secretariaId: secretariaId || undefined,
  });
  const summary = useReportsSummary({
    cityId: cityId || "",
    ...dateRange,
    secretariaId: secretariaId || undefined,
  });
  // Buscar sugestões de melhorias em destaque (todas, ordenadas por engajamento)
  const topReports = useTopReports({
    cityId: cityId || "",
    sort: "engagement",
    status: "all", // Buscar todas para mostrar as mais engajadas
    page: topReportsPage,
    limit: topReportsLimit,
    secretariaId: secretariaId || undefined,
  });

  // Buscar top 3 para o ranking (sem paginação)
  // Excluir resolvidos e respeitar filtro de data
  const rankingReports = useTopReports({
    cityId: cityId || "",
    sort: "engagement",
    status: "all", // Backend excluirá resolvidos automaticamente
    page: 1,
    limit: 3,
    secretariaId: secretariaId || undefined,
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
  });
  const map = useReportsMap({
    cityId: cityId || "",
    status: undefined, // Mostrar todas as sugestões de melhorias
    secretariaId: secretariaId || undefined,
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
    <div className="flex flex-col gap-6 pb-12 min-h-0">
      <header className="mb-2">
        <h1 className="text-2xl font-semibold text-white sm:text-3xl">
          Visão Geral
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Acompanhe o panorama geral das sugestões de melhorias e métricas principais.
        </p>
      </header>
      <DashboardFilters currentRange={dateRange} onApply={setDateRange} />
      <section className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Sugestões de Melhorias totais"
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
          description="Sugestões de melhorias registradas dentro do intervalo filtrado."
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

      {/* Ranking de Engajamento */}
      <section>
        <EngagementRanking
          data={rankingReports.data?.results || []}
          isLoading={rankingReports.isLoading}
        />
      </section>

      <section className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-5">
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

      <section className="grid gap-4 sm:gap-6 grid-cols-1 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <div className="mb-3 sm:mb-4 flex flex-col gap-2 sm:gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Itens por página:
              </span>
              <select
                value={topReportsLimit}
                onChange={(event) => {
                  setTopReportsLimit(parseInt(event.target.value, 10));
                  setTopReportsPage(1);
                }}
                className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30"
              >
                <option value="2">2</option>
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
              </select>
            </div>
            <div className="flex items-center gap-3">
              {topReports.data && (
                <p className="text-xs text-slate-400">
                  {(() => {
                    const data = topReports.data;
                    const start = (data.page - 1) * data.limit + 1;
                    const end = Math.min(start + data.results.length - 1, data.total);
                    return `Exibindo ${start}-${end} de ${data.total} sugestões de melhorias`;
                  })()}
                </p>
              )}
            </div>
          </div>
          <div className="overflow-x-auto">
            {topReports.isLoading ? (
              <div className="flex h-64 items-center justify-center rounded-3xl border border-slate-800 bg-slate-900/60 text-slate-400">
                Carregando sugestões de melhorias em destaque...
              </div>
            ) : topReports.data && topReports.data.results.length > 0 ? (
              <>
                <TopReportsTable
                  data={topReports.data.results}
                  onFollow={handleFollowReport}
                />
                {/* Paginação */}
                {topReports.data.totalPages > 1 && (
                  <div className="mt-4 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
                    <p className="text-xs text-slate-400">
                      Página {topReports.data.page} de {topReports.data.totalPages}
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setTopReportsPage((prev) => Math.max(1, prev - 1))}
                        disabled={topReports.data.page === 1 || topReports.isLoading}
                        className="inline-flex items-center gap-1 rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-xs font-medium text-slate-200 transition hover:border-emerald-400 hover:text-emerald-200 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <ChevronLeft className="size-4" />
                        Anterior
                      </button>
                      
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, topReports.data.totalPages) }, (_, i) => {
                          let pageNum;
                          if (topReports.data.totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (topReports.data.page <= 3) {
                            pageNum = i + 1;
                          } else if (topReports.data.page >= topReports.data.totalPages - 2) {
                            pageNum = topReports.data.totalPages - 4 + i;
                          } else {
                            pageNum = topReports.data.page - 2 + i;
                          }
                          return pageNum;
                        }).map((page) => (
                          <button
                            key={page}
                            type="button"
                            onClick={() => setTopReportsPage(page)}
                            disabled={topReports.isLoading}
                            className={clsx(
                              "rounded-lg border px-2.5 py-1.5 text-xs font-medium transition",
                              page === topReports.data.page
                                ? "border-emerald-500 bg-emerald-500/20 text-emerald-300"
                                : "border-slate-700 bg-slate-900/80 text-slate-200 hover:border-emerald-400 hover:text-emerald-200",
                              topReports.isLoading && "disabled:cursor-not-allowed disabled:opacity-50"
                            )}
                          >
                            {page}
                          </button>
                        ))}
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => setTopReportsPage((prev) => Math.min(topReports.data!.totalPages, prev + 1))}
                        disabled={topReports.data.page === topReports.data.totalPages || topReports.isLoading}
                        className="inline-flex items-center gap-1 rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-xs font-medium text-slate-200 transition hover:border-emerald-400 hover:text-emerald-200 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Próxima
                        <ChevronRight className="size-4" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex h-64 flex-col items-center justify-center rounded-3xl border border-slate-800 bg-slate-900/60 text-slate-400">
                <p className="text-sm font-medium text-slate-300">
                  Nenhuma sugestão de melhoria encontrada
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  Não há sugestões de melhorias cadastradas para esta cidade no momento.
                </p>
              </div>
            )}
          </div>
        </div>
              <div className="xl:col-span-1 h-full">
                <div className="h-[20rem] sm:h-[26rem] w-full xl:h-[30rem]">
                  <ReportsMap data={map.data} cityId={cityId} />
                </div>
              </div>
      </section>
    </div>
  );
}

