"use client";

import { useState } from "react";
import { useCity } from "@/context/city-context";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { SummaryCard } from "@/components/cards/summary-card";
import { DashboardFilters, DashboardDateRange } from "@/components/dashboard/dashboard-filters";
import { Heart, Activity, Calendar, CheckCircle } from "lucide-react";

export function HealthReportsDashboard() {
  const { cityId } = useCity();
  const [dateRange, setDateRange] = useState<DashboardDateRange>({});
  
  const { data, isLoading } = useQuery({
    queryKey: ["healthReports", cityId, dateRange],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (dateRange.startDate) params.append("startDate", dateRange.startDate);
      if (dateRange.endDate) params.append("endDate", dateRange.endDate);
      
      const response = await apiClient.get(
        `/api/health/getAppointmentsCountByCity/${cityId}${params.toString() ? `?${params.toString()}` : ""}`
      );
      console.log("📊 Health Reports Data:", response.data);
      return response.data;
    },
    enabled: !!cityId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400">Carregando dados...</div>
      </div>
    );
  }

  const summary = data?.byStatus || {};

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-200">Relatórios de Saúde</h1>
        <p className="mt-1 text-sm text-slate-400">
          Visão geral dos agendamentos de saúde
        </p>
      </div>

      <DashboardFilters currentRange={dateRange} onApply={setDateRange} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="Total de Consultas"
          value={data?.totalConsultations || 0}
          icon={<Heart className="size-6" />}
        />
        <SummaryCard
          title="Total de Exames"
          value={data?.totalExams || 0}
          icon={<Activity className="size-6" />}
        />
        <SummaryCard
          title="Pendentes"
          value={summary.pending || 0}
          icon={<Calendar className="size-6" />}
        />
        <SummaryCard
          title="Confirmados"
          value={summary.confirmed || 0}
          icon={<CheckCircle className="size-6" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-6">
          <h2 className="text-lg font-semibold text-slate-200 mb-4">Resumo Geral</h2>
          <div className="space-y-3 text-sm text-slate-300">
            <div className="flex justify-between items-center py-2 border-b border-slate-700">
              <span>Total de Agendamentos:</span>
              <span className="font-semibold text-slate-100">{(summary.total || 0).toLocaleString("pt-BR")}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-700">
              <span>Consultas:</span>
              <span className="font-semibold text-emerald-400">{(data?.totalConsultations || 0).toLocaleString("pt-BR")}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-700">
              <span>Exames:</span>
              <span className="font-semibold text-blue-400">{(data?.totalExams || 0).toLocaleString("pt-BR")}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-700">
              <span>Pendentes:</span>
              <span className="font-semibold text-amber-400">{(summary.pending || 0).toLocaleString("pt-BR")}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-700">
              <span>Confirmados:</span>
              <span className="font-semibold text-emerald-400">{(summary.confirmed || 0).toLocaleString("pt-BR")}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span>Cancelados:</span>
              <span className="font-semibold text-red-400">{(summary.cancelled || 0).toLocaleString("pt-BR")}</span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-6">
          <h2 className="text-lg font-semibold text-slate-200 mb-4">Taxa de Ocupação</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-slate-300">Taxa de Confirmação</span>
                <span className="text-sm font-semibold text-slate-100">
                  {summary.total > 0 
                    ? ((summary.confirmed / summary.total) * 100).toFixed(1)
                    : 0}%
                </span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2.5">
                <div
                  className="bg-emerald-500 h-2.5 rounded-full transition-all"
                  style={{
                    width: `${summary.total > 0 ? (summary.confirmed / summary.total) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-slate-300">Taxa de Cancelamento</span>
                <span className="text-sm font-semibold text-slate-100">
                  {summary.total > 0 
                    ? ((summary.cancelled / summary.total) * 100).toFixed(1)
                    : 0}%
                </span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2.5">
                <div
                  className="bg-red-500 h-2.5 rounded-full transition-all"
                  style={{
                    width: `${summary.total > 0 ? (summary.cancelled / summary.total) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-slate-300">Taxa de Pendência</span>
                <span className="text-sm font-semibold text-slate-100">
                  {summary.total > 0 
                    ? ((summary.pending / summary.total) * 100).toFixed(1)
                    : 0}%
                </span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2.5">
                <div
                  className="bg-amber-500 h-2.5 rounded-full transition-all"
                  style={{
                    width: `${summary.total > 0 ? (summary.pending / summary.total) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

