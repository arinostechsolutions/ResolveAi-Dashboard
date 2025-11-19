"use client";

import { useEffect, useRef, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { TypeAnalytics } from "@/hooks/use-analytics";

type TypeDistributionChartProps = {
  data: TypeAnalytics[];
  isLoading?: boolean;
};

const COLORS = [
  "#22d3ee",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#f59e0b",
  "#10b981",
  "#ef4444",
  "#6366f1",
];

export function TypeDistributionChart({ data, isLoading }: TypeDistributionChartProps) {
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

  const chartData = data.slice(0, 8).map((item) => ({
    name: item.reportType.length > 20 ? `${item.reportType.substring(0, 20)}...` : item.reportType,
    value: item.total,
    fullName: item.reportType,
  }));

  return (
    <div
      ref={containerRef}
      className="min-h-[400px] w-full overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/60 px-3 pt-4 pb-8 sm:px-6 sm:pt-6 sm:pb-12 shadow-lg shadow-slate-900/30"
    >
      <header className="mb-4 sm:mb-6">
        <h2 className="text-base font-semibold text-white sm:text-lg">
          Distribuição por Tipo
        </h2>
        <p className="mt-1 text-xs text-slate-400 sm:text-sm">
          Sugestões de melhorias agrupadas por tipo (top 8)
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
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
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
                formatter={(value: number, name: string, props: any) => [
                  `${value} sugestões de melhorias`,
                  props.payload.fullName || name,
                ]}
              />
              <Legend
                formatter={(value, entry: any) => entry.payload.fullName || value}
                wrapperStyle={{ fontSize: "12px", color: "#94a3b8" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

