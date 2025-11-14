"use client";

import { useState, useMemo } from "react";
import { useCity } from "@/context/city-context";
import { useSecretariaFilter } from "@/context/secretaria-context";
import {
  useNeighborhoodAnalytics,
  useTypeAnalytics,
  useTrendsAnalytics,
  useComparisonAnalytics,
} from "@/hooks/use-analytics";
import { useReportTypes } from "@/hooks/use-secretarias";
import { NeighborhoodChart } from "@/components/analytics/neighborhood-chart";
import { TypeDistributionChart } from "@/components/analytics/type-distribution-chart";
import { TrendsChart } from "@/components/analytics/trends-chart";
import { EngagementComparisonChart } from "@/components/analytics/engagement-comparison-chart";
import { DashboardFilters, DashboardDateRange } from "@/components/dashboard/dashboard-filters";
import { TrendingUp, BarChart3, PieChart, LineChart } from "lucide-react";

export default function AnalyticsPage() {
  const { cityId } = useCity();
  const { secretariaId } = useSecretariaFilter();
  const [dateRange, setDateRange] = useState<DashboardDateRange>({});
  const [trendGroupBy, setTrendGroupBy] = useState<"day" | "week" | "month">("day");
  const [compareBy, setCompareBy] = useState<"neighborhood" | "type">("neighborhood");
  const [trendBairro, setTrendBairro] = useState<string>("");
  const [trendReportType, setTrendReportType] = useState<string>("");

  // Buscar dados para popular filtros
  const neighborhoodData = useNeighborhoodAnalytics(
    cityId,
    secretariaId || undefined,
    dateRange.startDate,
    dateRange.endDate
  );
  const { data: reportTypesData } = useReportTypes(cityId);

  // Extrair lista única de bairros
  const bairrosList = useMemo(() => {
    const bairros = new Set<string>();
    neighborhoodData.data?.results.forEach((item) => {
      if (item.bairro && item.bairro !== "Não informado") {
        bairros.add(item.bairro);
      }
    });
    return Array.from(bairros).sort();
  }, [neighborhoodData.data]);

  // Extrair lista de tipos de irregularidade
  const reportTypesList = useMemo(() => {
    return reportTypesData?.reportTypes.map((rt) => ({
      id: rt.id,
      label: rt.label,
    })) || [];
  }, [reportTypesData]);

  const typeData = useTypeAnalytics(
    cityId,
    secretariaId || undefined,
    dateRange.startDate,
    dateRange.endDate
  );

  const trendsData = useTrendsAnalytics(
    cityId,
    secretariaId || undefined,
    dateRange.startDate,
    dateRange.endDate,
    trendGroupBy,
    trendBairro || undefined,
    trendReportType || undefined
  );

  const comparisonData = useComparisonAnalytics(
    cityId,
    secretariaId || undefined,
    dateRange.startDate,
    dateRange.endDate,
    compareBy
  );

  return (
    <div className="flex flex-col gap-6 pb-12">
      <header className="mb-2">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-300">
            <TrendingUp className="size-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-white sm:text-3xl">
              Gráficos e Análises
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Visualize tendências, comparações e indicadores importantes da cidade
            </p>
          </div>
        </div>
      </header>

      <DashboardFilters currentRange={dateRange} onApply={setDateRange} />

      <section className="grid gap-6 lg:grid-cols-2">
        <NeighborhoodChart
          data={neighborhoodData.data?.results || []}
          isLoading={neighborhoodData.isLoading}
        />
        <TypeDistributionChart
          data={typeData.data?.results || []}
          isLoading={typeData.isLoading}
        />
      </section>

      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-white">Tendências Temporais</h2>
          <div className="flex flex-wrap items-center gap-2">
            <label className="text-sm text-slate-400">Bairro:</label>
            <select
              value={trendBairro}
              onChange={(e) => setTrendBairro(e.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm text-slate-100 outline-none transition focus:border-emerald-400"
            >
              <option value="">Todos os bairros</option>
              {bairrosList.map((bairro) => (
                <option key={bairro} value={bairro}>
                  {bairro}
                </option>
              ))}
            </select>
            <label className="text-sm text-slate-400">Tipo:</label>
            <select
              value={trendReportType}
              onChange={(e) => setTrendReportType(e.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm text-slate-100 outline-none transition focus:border-emerald-400"
            >
              <option value="">Todos os tipos</option>
              {reportTypesList.map((rt) => (
                <option key={rt.id} value={rt.id}>
                  {rt.label}
                </option>
              ))}
            </select>
            <label className="text-sm text-slate-400">Agrupar por:</label>
            <select
              value={trendGroupBy}
              onChange={(e) => setTrendGroupBy(e.target.value as "day" | "week" | "month")}
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm text-slate-100 outline-none transition focus:border-emerald-400"
            >
              <option value="day">Dia</option>
              <option value="week">Semana</option>
              <option value="month">Mês</option>
            </select>
          </div>
        </div>
        <TrendsChart
          data={trendsData.data?.results || []}
          isLoading={trendsData.isLoading}
          groupBy={trendGroupBy}
          showTrendLine={true}
        />
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Comparação de Engajamento</h2>
          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-400">Comparar por:</label>
            <select
              value={compareBy}
              onChange={(e) => setCompareBy(e.target.value as "neighborhood" | "type")}
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm text-slate-100 outline-none transition focus:border-emerald-400"
            >
              <option value="neighborhood">Bairro</option>
              <option value="type">Tipo</option>
            </select>
          </div>
        </div>
        <EngagementComparisonChart
          data={comparisonData.data?.results || []}
          isLoading={comparisonData.isLoading}
          compareBy={compareBy}
        />
      </section>
    </div>
  );
}

