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

export default function GraficosPage() {
  const { cityId } = useCity();
  const { secretariaId } = useSecretariaFilter();
  const [dateRange, setDateRange] = useState<DashboardDateRange>({});

  // Buscar tipos de sugestões
  const { data: reportTypes } = useReportTypes(cityId);

  // Calcular datas baseado no range
  const { startDate, endDate } = useMemo(() => {
    if (dateRange.startDate && dateRange.endDate) {
      return {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      };
    }
    
    // Se não houver range definido, usar últimos 30 dias como padrão
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 30);
    
    return { 
      startDate: start.toISOString().split("T")[0], 
      endDate: end.toISOString().split("T")[0] 
    };
  }, [dateRange]);

  // Buscar analytics
  const neighborhoodQuery = useNeighborhoodAnalytics(cityId, startDate, endDate, secretariaId || undefined);
  const typeQuery = useTypeAnalytics(cityId, startDate, endDate, secretariaId || undefined);
  const trendsQuery = useTrendsAnalytics(cityId, startDate, endDate, secretariaId || undefined);
  const comparisonQuery = useComparisonAnalytics(cityId, startDate, endDate);
  
  const neighborhoodData = neighborhoodQuery.data?.results || [];
  const typeData = typeQuery.data?.results || [];
  const trendsData = trendsQuery.data?.results || [];
  const comparisonData = comparisonQuery.data?.results || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-200">Gráficos de Melhorias</h1>
        <p className="mt-1 text-sm text-slate-400">
          Análise visual dos dados de sugestões de melhorias
        </p>
      </div>

      <DashboardFilters
        currentRange={dateRange}
        onApply={setDateRange}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="rounded-lg bg-blue-500/10 p-2">
              <BarChart3 className="size-5 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-200">Distribuição por Bairro</h3>
          </div>
          {neighborhoodQuery.isLoading ? (
            <div className="flex items-center justify-center h-64 text-slate-400">
              Carregando dados...
            </div>
          ) : neighborhoodData.length > 0 ? (
            <NeighborhoodChart data={neighborhoodData} isLoading={neighborhoodQuery.isLoading} />
          ) : (
            <div className="flex items-center justify-center h-64 text-slate-400">
              Sem dados disponíveis
            </div>
          )}
        </div>

        <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="rounded-lg bg-purple-500/10 p-2">
              <PieChart className="size-5 text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-200">Distribuição por Tipo</h3>
          </div>
          {typeQuery.isLoading ? (
            <div className="flex items-center justify-center h-64 text-slate-400">
              Carregando dados...
            </div>
          ) : typeData.length > 0 ? (
            <TypeDistributionChart data={typeData} isLoading={typeQuery.isLoading} />
          ) : (
            <div className="flex items-center justify-center h-64 text-slate-400">
              Sem dados disponíveis
            </div>
          )}
        </div>

        <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="rounded-lg bg-emerald-500/10 p-2">
              <LineChart className="size-5 text-emerald-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-200">Tendências</h3>
          </div>
          {trendsQuery.isLoading ? (
            <div className="flex items-center justify-center h-64 text-slate-400">
              Carregando dados...
            </div>
          ) : trendsData.length > 0 ? (
            <TrendsChart data={trendsData} isLoading={trendsQuery.isLoading} groupBy="day" />
          ) : (
            <div className="flex items-center justify-center h-64 text-slate-400">
              Sem dados disponíveis
            </div>
          )}
        </div>

        <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="rounded-lg bg-amber-500/10 p-2">
              <TrendingUp className="size-5 text-amber-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-200">Comparação de Engajamento</h3>
          </div>
          {comparisonQuery.isLoading ? (
            <div className="flex items-center justify-center h-64 text-slate-400">
              Carregando dados...
            </div>
          ) : comparisonData.length > 0 ? (
            <EngagementComparisonChart data={comparisonData} isLoading={comparisonQuery.isLoading} compareBy="neighborhood" />
          ) : (
            <div className="flex items-center justify-center h-64 text-slate-400">
              Sem dados disponíveis
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


