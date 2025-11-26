"use client";

import { useEffect, useRef, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type HealthBarChartProps = {
  data: Array<{ name: string; value: number }>;
  title?: string;
  description?: string;
  color?: string;
};

export function HealthBarChart({
  data,
  title = "Distribuição",
  description = "Análise de distribuição",
  color = "#3b82f6",
}: HealthBarChartProps) {
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
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="name"
                stroke="#94a3b8"
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  borderRadius: "0.75rem",
                  border: "1px solid rgba(148, 163, 184, 0.2)",
                  color: "#f8fafc",
                }}
                formatter={(value: number) => [value, "Agendamentos"]}
              />
              <Bar dataKey="value" fill={color} radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}




