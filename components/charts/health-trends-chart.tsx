"use client";

import { useEffect, useRef, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type HealthTrendsChartProps = {
  data: Array<{ date: string; count: number }>;
  title?: string;
  description?: string;
};

const formatDate = (value: string) => {
  // Se for um label de semana (ex: "Semana 12/2025"), retornar como está
  if (value.startsWith("Semana")) {
    return value.replace("Semana ", "");
  }
  
  // Tentar parsear como data
  const date = new Date(value);
  if (isNaN(date.getTime())) {
    // Se não for uma data válida, retornar o valor original
    return value;
  }
  
  return date.toLocaleDateString("pt-BR", {
    month: "short",
    year: "numeric",
  });
};

export function HealthTrendsChart({
  data,
  title = "Evolução de Agendamentos",
  description = "Tendência de agendamentos ao longo do tempo",
}: HealthTrendsChartProps) {
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
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorHealth" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.7} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="date"
                stroke="#94a3b8"
                fontSize={12}
                tickFormatter={formatDate}
              />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  borderRadius: "0.75rem",
                  border: "1px solid rgba(148, 163, 184, 0.2)",
                  color: "#f8fafc",
                }}
                labelFormatter={(value) => {
                  // Se for um label de semana, retornar como está
                  if (typeof value === "string" && value.startsWith("Semana")) {
                    return value;
                  }
                  
                  // Tentar parsear como data
                  const date = new Date(value);
                  if (isNaN(date.getTime())) {
                    return value;
                  }
                  
                  return date.toLocaleDateString("pt-BR", {
                    month: "long",
                    year: "numeric",
                  });
                }}
                formatter={(value: number) => [value, "Agendamentos"]}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#10b981"
                strokeWidth={2.5}
                fill="url(#colorHealth)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

