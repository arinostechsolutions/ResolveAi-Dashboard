"use client";

import { useState, useMemo } from "react";
import { useCity } from "@/context/city-context";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { DashboardFilters, DashboardDateRange } from "@/components/dashboard/dashboard-filters";
import { HealthTrendsChart } from "@/components/charts/health-trends-chart";
import { HealthBarChart } from "@/components/charts/health-bar-chart";
import { HealthPieChart } from "@/components/charts/health-pie-chart";
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Activity, 
  Calendar,
  AlertTriangle,
  Clock,
  Building2,
  Stethoscope,
  Microscope,
} from "lucide-react";

export function HealthAnalyticsDashboard() {
  const { cityId } = useCity();
  const [dateRange, setDateRange] = useState<DashboardDateRange>({});

  const { data, isLoading } = useQuery({
    queryKey: ["healthAnalytics", cityId, dateRange],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (dateRange.startDate) params.append("startDate", dateRange.startDate);
      if (dateRange.endDate) params.append("endDate", dateRange.endDate);
      
      const response = await apiClient.get(
        `/api/health/getHealthAnalytics/${cityId}${params.toString() ? `?${params.toString()}` : ""}`
      );
      console.log("📊 Health Analytics Data:", response.data);
      return response.data;
    },
    enabled: !!cityId,
  });

  // Preparar dados para gráficos
  const monthlyTrendData = useMemo(() => {
    if (!data?.byMonth) return [];
    return data.byMonth.map((item: any) => ({
      date: item.date,
      count: item.count,
    }));
  }, [data?.byMonth]);

  const weeklyTrendData = useMemo(() => {
    if (!data?.byWeek) return [];
    return data.byWeek.map((item: any) => ({
      date: item.label || `Semana ${item.week}/${item.year}`,
      count: item.count,
    }));
  }, [data?.byWeek]);

  const dayOfWeekData = useMemo(() => {
    if (!data?.byDayOfWeek) return [];
    return data.byDayOfWeek.map((item: any) => ({
      name: item.dayName,
      value: item.count,
    }));
  }, [data?.byDayOfWeek]);

  const specialtyData = useMemo(() => {
    if (!data?.bySpecialty) return [];
    return data.bySpecialty.slice(0, 8).map((item: any) => ({
      name: item.specialty.length > 20 ? item.specialty.substring(0, 20) + "..." : item.specialty,
      value: item.count,
    }));
  }, [data?.bySpecialty]);

  const examData = useMemo(() => {
    if (!data?.byExam) return [];
    return data.byExam.slice(0, 8).map((item: any) => ({
      name: item.exam.length > 20 ? item.exam.substring(0, 20) + "..." : item.exam,
      value: item.count,
    }));
  }, [data?.byExam]);

  const unitData = useMemo(() => {
    if (!data?.byUnit) return [];
    return data.byUnit.slice(0, 10).map((item: any) => ({
      name: item.unit.length > 25 ? item.unit.substring(0, 25) + "..." : item.unit,
      value: item.count,
    }));
  }, [data?.byUnit]);

  const cancellationRateData = useMemo(() => {
    if (!data?.cancellationRates) return [];
    return data.cancellationRates.slice(0, 8).map((item: any) => ({
      name: item.unit.length > 20 ? item.unit.substring(0, 20) + "..." : item.unit,
      value: item.cancellationRate,
    }));
  }, [data?.cancellationRates]);

  const statusData = useMemo(() => {
    if (!data?.byStatus) return [];
    return data.byStatus.map((item: any) => ({
      name: item.status === "pendente" ? "Pendente" : 
            item.status === "confirmado" ? "Confirmado" : 
            item.status === "cancelado" ? "Cancelado" : item.status,
      value: item.count,
    }));
  }, [data?.byStatus]);

  const shiftData = useMemo(() => {
    if (!data?.byShift) return [];
    return data.byShift.map((item: any) => ({
      name: item.shift === "morning" ? "Manhã" : "Tarde",
      value: item.count,
    }));
  }, [data?.byShift]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400">Carregando dados...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-200">Gráficos de Saúde</h1>
        <p className="mt-1 text-sm text-slate-400">
          Análise visual detalhada dos dados de agendamentos de saúde
        </p>
      </div>

      <DashboardFilters currentRange={dateRange} onApply={setDateRange} />

      {/* Métricas de Eficiência */}
      {data?.efficiency && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="rounded-lg bg-blue-500/10 p-2">
                <Clock className="size-5 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-200">Tempo Médio de Confirmação</h3>
            </div>
            <p className="text-3xl font-bold text-slate-100">{data.efficiency.avgDaysToConfirm.toFixed(1)}</p>
            <p className="text-sm text-slate-400 mt-1">dias</p>
          </div>
          <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="rounded-lg bg-emerald-500/10 p-2">
                <TrendingUp className="size-5 text-emerald-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-200">Tempo Mínimo</h3>
            </div>
            <p className="text-3xl font-bold text-slate-100">{data.efficiency.minDaysToConfirm.toFixed(1)}</p>
            <p className="text-sm text-slate-400 mt-1">dias</p>
          </div>
          <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="rounded-lg bg-amber-500/10 p-2">
                <AlertTriangle className="size-5 text-amber-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-200">Tempo Máximo</h3>
            </div>
            <p className="text-3xl font-bold text-slate-100">{data.efficiency.maxDaysToConfirm.toFixed(1)}</p>
            <p className="text-sm text-slate-400 mt-1">dias</p>
          </div>
        </div>
      )}

      {/* Gráficos de Tendência */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {monthlyTrendData.length > 0 && (
          <HealthTrendsChart
            data={monthlyTrendData}
            title="Evolução Mensal"
            description="Tendência de agendamentos por mês"
          />
        )}
        {weeklyTrendData.length > 0 && (
          <HealthTrendsChart
            data={weeklyTrendData}
            title="Evolução Semanal"
            description="Últimas 12 semanas de agendamentos"
          />
        )}
      </div>

      {/* Distribuições Principais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {statusData.length > 0 && (
          <HealthPieChart
            data={statusData}
            title="Distribuição por Status"
            description="Percentual de agendamentos por status"
          />
        )}
        {shiftData.length > 0 && (
          <HealthPieChart
            data={shiftData}
            title="Distribuição por Turno"
            description="Percentual de agendamentos por turno"
            colors={["#10b981", "#f59e0b"]}
          />
        )}
      </div>

      {/* Análises por Especialidade e Exames */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {specialtyData.length > 0 && (
          <HealthBarChart
            data={specialtyData}
            title="Top Especialidades"
            description="Especialidades mais procuradas"
            color="#3b82f6"
          />
        )}
        {examData.length > 0 && (
          <HealthBarChart
            data={examData}
            title="Top Exames"
            description="Exames mais solicitados"
            color="#8b5cf6"
          />
        )}
      </div>

      {/* Análises por Unidade */}
      <div className="grid grid-cols-1 gap-6">
        {unitData.length > 0 && (
          <HealthBarChart
            data={unitData}
            title="Agendamentos por Unidade de Saúde"
            description="Distribuição de agendamentos entre unidades"
            color="#10b981"
          />
        )}
      </div>

      {/* Taxa de Cancelamento */}
      {cancellationRateData.length > 0 && (
        <div className="grid grid-cols-1 gap-6">
          <HealthBarChart
            data={cancellationRateData}
            title="Taxa de Cancelamento por Unidade"
            description="Percentual de cancelamentos por unidade de saúde"
            color="#ef4444"
          />
        </div>
      )}

      {/* Distribuição por Dia da Semana */}
      {dayOfWeekData.length > 0 && (
        <div className="grid grid-cols-1 gap-6">
          <HealthBarChart
            data={dayOfWeekData}
            title="Distribuição por Dia da Semana"
            description="Agendamentos distribuídos pelos dias da semana"
            color="#06b6d4"
          />
        </div>
      )}

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="rounded-lg bg-blue-500/10 p-2">
              <Stethoscope className="size-5 text-blue-400" />
            </div>
            <h3 className="text-sm font-semibold text-slate-300">Total de Consultas</h3>
          </div>
          <p className="text-2xl font-bold text-slate-100">{data?.summary?.consultations || 0}</p>
        </div>
        <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="rounded-lg bg-purple-500/10 p-2">
              <Microscope className="size-5 text-purple-400" />
            </div>
            <h3 className="text-sm font-semibold text-slate-300">Total de Exames</h3>
          </div>
          <p className="text-2xl font-bold text-slate-100">{data?.summary?.exams || 0}</p>
        </div>
        <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="rounded-lg bg-emerald-500/10 p-2">
              <Building2 className="size-5 text-emerald-400" />
            </div>
            <h3 className="text-sm font-semibold text-slate-300">Unidades Ativas</h3>
          </div>
          <p className="text-2xl font-bold text-slate-100">{data?.byUnit?.length || 0}</p>
        </div>
        <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="rounded-lg bg-amber-500/10 p-2">
              <Calendar className="size-5 text-amber-400" />
            </div>
            <h3 className="text-sm font-semibold text-slate-300">Total de Agendamentos</h3>
          </div>
          <p className="text-2xl font-bold text-slate-100">{data?.summary?.total || 0}</p>
        </div>
      </div>
    </div>
  );
}
