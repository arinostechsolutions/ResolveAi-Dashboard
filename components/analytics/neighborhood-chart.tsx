"use client";

import { useEffect, useRef, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { NeighborhoodAnalytics } from "@/hooks/use-analytics";

type NeighborhoodChartProps = {
  data: NeighborhoodAnalytics[];
  isLoading?: boolean;
};

export function NeighborhoodChart({ data, isLoading }: NeighborhoodChartProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const { width, height } = entry.contentRect;
      if (width > 0 && height > 0) {
        setIsReady(true);
      }
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const chartData = data.slice(0, 10).map((item) => ({
    bairro: item.bairro.length > 15 ? `${item.bairro.substring(0, 15)}...` : item.bairro,
    total: item.total,
    pendente: item.pendente,
    em_andamento: item.em_andamento,
    resolvido: item.resolvido,
  }));

  return (
    <div
      ref={containerRef}
      className="min-h-[400px] w-full overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/60 px-3 pt-4 pb-8 sm:px-6 sm:pt-6 sm:pb-12 shadow-lg shadow-slate-900/30"
    >
      <header className="mb-4 sm:mb-6">
        <h2 className="text-base font-semibold text-white sm:text-lg">
          Irregularidades por Bairro
        </h2>
        <p className="mt-1 text-xs text-slate-400 sm:text-sm">
          Distribuição de irregularidades por bairro (top 10)
        </p>
      </header>

      {isLoading ? (
        <div className="flex h-80 items-center justify-center text-sm text-slate-400">
          Carregando dados...
        </div>
      ) : !isReady ? (
        <div className="flex h-80 items-center justify-center text-sm text-slate-400">
          Preparando visualização...
        </div>
      ) : chartData.length === 0 ? (
        <div className="flex h-80 items-center justify-center text-sm text-slate-400">
          Nenhum dado disponível
        </div>
      ) : (
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                dataKey="bairro"
                stroke="#94a3b8"
                fontSize={11}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  borderRadius: "0.75rem",
                  border: "1px solid rgba(148, 163, 184, 0.2)",
                  color: "#f8fafc",
                }}
                itemStyle={{
                  color: "#f8fafc",
                }}
                labelStyle={{
                  color: "#f8fafc",
                }}
                cursor={{ fill: "transparent" }}
              />
              <Legend />
              <Bar 
                dataKey="pendente" 
                fill="#f59e0b" 
                name="Pendente"
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="em_andamento" 
                fill="#3b82f6" 
                name="Em Andamento"
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="resolvido" 
                fill="#10b981" 
                name="Resolvido"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

