"use client";

import { useEffect, useRef, useState } from "react";
import {
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  Legend,
  Cell,
} from "recharts";

type HealthPieChartProps = {
  data: Array<{ name: string; value: number }>;
  title?: string;
  description?: string;
  colors?: string[];
};

const COLORS = ["#10b981", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444", "#06b6d4"];

export function HealthPieChart({
  data,
  title = "Distribuição",
  description = "Análise de distribuição",
  colors = COLORS,
}: HealthPieChartProps) {
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

  if (!data || data.length === 0) {
    return (
      <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-6">
        <div className="text-slate-400 text-center py-8">Sem dados disponíveis</div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="min-h-[320px] w-full overflow-hidden rounded-lg border border-slate-700 bg-slate-800/50 px-3 pt-4 pb-8 sm:px-6 sm:pt-6 sm:pb-12"
    >
      <header className="mb-4 flex items-center justify-between sm:mb-6">
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-white sm:text-lg">{title}</h3>
          <p className="text-xs text-slate-400 sm:text-sm">{description}</p>
        </div>
      </header>

      {!isReady ? (
        <div className="flex h-56 items-center justify-center text-sm text-slate-400">
          Preparando visualização...
        </div>
      ) : (
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name}: ${percent ? (percent * 100).toFixed(0) : 0}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={colors[index % colors.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  borderRadius: "0.75rem",
                  border: "1px solid rgba(148, 163, 184, 0.2)",
                  color: "#f8fafc",
                }}
                formatter={(value: number) => [value, "Agendamentos"]}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

